import type { EngineInterface, Register } from 'claude-code'

// One user command for the handoff -> /clear -> paste-resume-prompt routine.
// The model writes the handoff (so it stays a file you can read and edit);
// the mod only sequences the three steps and refuses to clear unless the
// handoff file it was told about actually exists.

const MARKER = /^HANDOFF-PATH:\s*(\S+)\s*$/m

const handoffPrompt = (focus: string) =>
  [
    'Use the handoff skill now: save a durable handoff for the current task,',
    'because this context will be cleared as soon as you finish.',
    'If no handoff skill is available, write the file yourself to',
    'docs/handoffs/YYYY-MM-DD-HHMM-<topic>.md in the project (or',
    '~/.local/state/agent-handoffs/ outside one): objective and constraints,',
    'current state (branch, changed files), decisions and evidence, checks run,',
    'remaining work in order, and the first command to verify on resume.',
    focus ? `Emphasis from the owner: ${focus}` : '',
    'Do not ask me to /clear or paste anything; that happens automatically.',
    'End your reply with one final line, exactly:',
    'HANDOFF-PATH: <absolute path of the saved handoff file>',
  ]
    .filter(Boolean)
    .join('\n')

const resumePrompt = (path: string) =>
  `Continue the task described in ${path}. Read applicable project instructions ` +
  'and that handoff first. Verify the current working tree and live state before ' +
  'acting; preserve unrelated changes. Resume at the first remaining step it lists.'

// The engine refuses $.prompt.submit / $.command.run made from inside a
// command.run or turn.complete hook (they would wait on the turn the hook
// holds), so each step is fired from a timer, a later event of its own.
function later($: EngineInterface, step: () => Promise<unknown>, onError: () => void) {
  $.clock.after(50, () => {
    step().catch(err => {
      onError()
      $.ui.toast(`handoff-clear: ${String(err)}`)
    })
  })
}

export const register: Register = on => {
  // Module variable, not $.state: the mod is not reloaded by /clear, and the
  // flag must not outlive a reload half-way through.
  let armed = false

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'handoff-clear',
      description: 'Write a handoff, /clear, and resume from it automatically',
      argumentHint: '[what the handoff should stress]',
    })
    return next(e)
  })

  on('command.run', { command: 'handoff-clear' }, async ($, e) => {
    armed = true
    const focus = e.args.trim()
    later($, () => $.prompt.submit({ text: handoffPrompt(focus) }), () => (armed = false))
    return { text: 'writing the handoff; will /clear and resume once it is saved.' }
  })

  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    if (!armed || e.agentId !== undefined) return done
    armed = false

    const path = e.reason === 'answer' ? e.answer.match(MARKER)?.[1] : undefined
    if (!path || !(await $.fs.exists(path))) {
      $.ui.toast(
        path
          ? `handoff-clear: ${path} does not exist; not clearing.`
          : 'handoff-clear: no HANDOFF-PATH line (or turn interrupted); not clearing.',
      )
      return done
    }

    later($, async () => {
      await $.command.run({ command: 'clear', args: '' })
      await $.prompt.submit({ text: resumePrompt(path) })
    }, () => {})
    return done
  })
}
