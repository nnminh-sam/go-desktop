# wp-go-desktop

A single-user desktop app in Go (Wails) that opens one root directory and lets you browse, view and edit files,
preview Markdown and run terminals. Files and terminals open side by side as tabs in one tab strip.

Status: **planning + design system**. The Go backend and the Wails app shell come in milestone M0 (see the plan).

## What's here

| Path | Contents |
|---|---|
| [`doc/PLAN.md`](doc/PLAN.md) | Product plan: goals, architecture, backend API, frontend, milestones M0–M6, risks |
| [`doc/DESIGN_SYSTEM.md`](doc/DESIGN_SYSTEM.md) | Design system: component inventory, tokens, app layout, theming of editor / terminal / prose |
| [`doc/component-schemas.md`](doc/component-schemas.md) | Exact prop types of all 28 UI components (generated) |
| [`doc/design-system.html`](doc/design-system.html) | Visual showcase rendered with the real components; open it in a browser |
| `frontend/src/components/ui/` | The UI kit: 25 affectUI components (MIT, unmodified) + Command Menu, Toaster (rebuilt from spec) + Tabs (new) |
| `frontend/src/styles/tokens.css` | Theme tokens, light and dark |
| `frontend/src/showcase/` | Source of the showcase page |
| `scripts/gen-schemas.py` | Regenerates `doc/component-schemas.md` from the component source |
| `scripts/build-showcase.sh` | Rebuilds `doc/design-system.html` (needs esbuild, react@19, react-dom@19, @hugeicons/core-free-icons) |

## Stack (planned)

Go + Wails v2 · React 19 + TypeScript + Vite · affectUI components · CodeMirror 6 · xterm.js + creack/pty · markdown-it + DOMPurify.

## Working on it

This repository lives in a **workspace folder** with the kaneki harness installed (`../.claude`). Open Claude Code
in the workspace (the parent folder), not here:

```
wp-go-desktop/              ← workspace: open Claude Code here
├─ .claude/                 kaneki skills + agents, my-git plugin
├─ sdlc.profile.json        written by /kaneki-onboarding
├─ wp-go-desktop/           ← this repository
└─ worktrees/               one worktree per ticket: wp-go-desktop-<ticket>
```

- `/kaneki-onboarding` once, then `/kaneki-flow <ticket>` per change and `/kaneki-ship <ticket>` to commit, push and open the PR.
- Branching (my-git): `main` (production) and `develop/base` (staging) change only through pull requests.
  Work branches are `develop/<type>/<name>`, started from `develop/base`. The hooks in `.githooks/` enforce this.

## Licenses

The vendored affectUI components and Hugeicons are MIT; see `frontend/src/components/ui/NOTICE.md`.
