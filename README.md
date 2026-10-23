# claude-mods

Claude Code mods (plugins with a hooks module) by Jaromír Svoboda, published as
one plugin marketplace.

| Mod | What it does |
| --- | --- |
| [handoff-clear](handoff-clear/) | `/handoff-clear [what to stress]`: writes a handoff for the current task, runs `/clear`, and resumes from the handoff in the fresh context |

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install handoff-clear --marketplace jaromirsvoboda/claude-mods
```

From a shell:

```
claude plugin install handoff-clear --marketplace jaromirsvoboda/claude-mods
```

Answer `y` to add the marketplace and pick the user scope. Sessions that were
already open need `/reload-plugins`. Update later with
`claude plugin update handoff-clear@jaromir-mods`.

In the desktop app: click + next to the prompt box, then Plugins, Add
marketplace with `jaromirsvoboda/claude-mods`, then Add plugin.

Tested on Claude Code 2.1.309.
