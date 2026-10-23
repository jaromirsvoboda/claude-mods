# handoff-clear

One command for the handoff -> `/clear` -> paste-resume-prompt routine.

`/handoff-clear [what to stress]` asks Claude to save a handoff for the current
task (using a `handoff` skill if you have one, otherwise a built-in spec: a
Markdown file under `docs/handoffs/` or `~/.local/state/agent-handoffs/`) and
to end its reply with `HANDOFF-PATH: <file>`. When that turn ends the mod
checks the file exists, runs `/clear`, and submits "Continue the task described
in <file>..." into the fresh context.

A missing marker or file, or an interrupted turn, aborts with a toast starting
`handoff-clear:` and nothing is cleared. Prompts the mod submits show as "The
handoff-clear plugin sent a message".

## Install

```
/plugin install handoff-clear --marketplace jaromirsvoboda/claude-mods
```

or from a shell: `claude plugin install handoff-clear --marketplace jaromirsvoboda/claude-mods`.
