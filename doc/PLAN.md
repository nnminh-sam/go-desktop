# Plan: Go Desktop Workspace App

A single-user desktop app (no auth) that opens one **root directory** and lets the user browse, view, edit files, preview Markdown, and run terminals — all scoped to that directory. Files and terminals live side by side as tabs in one tab strip.

---

## 1. Goals & Non-Goals

### Goals (v1)
- Pick a root directory (dialog or CLI arg); remember the last one.
- File tree of the root directory with live refresh when files change on disk.
- Open files in tabs; view and edit text files with syntax highlighting; save (Cmd/Ctrl+S).
- Markdown preview: split view (editor | preview) with live update, and preview-only mode.
- Integrated terminals that open as **tabs in the same tab strip as files** (any number; no bottom pane). Working directory = the root dir, or the folder chosen with "Open in terminal".
- Basic file ops: new file, new folder, rename, delete (to trash if possible).
- Runs on macOS first; Linux and Windows supported by the same codebase.

### Non-Goals (v1)
- Auth, multi-user, network sync, cloud storage.
- Git integration, LSP / code intelligence, extensions/plugins.
- Editing binary files (images may be *viewed* only).

---

## 2. Technology Choice

| Concern | Choice | Why |
|---|---|---|
| Desktop shell | **Wails v2** (Go backend + system WebView) | Native Go, small binary (no bundled Chromium), mature. Lets us use the best web components for editor/terminal/markdown, which native Go UI toolkits (Fyne, Gio) lack. Move to Wails v3 later if it's stable and needed (multi-window). |
| Frontend | **React 19 + TypeScript + Vite** | Required by the design system: affectUI components are React 19 single-file components (see `doc/DESIGN_SYSTEM.md`). |
| UI kit | **affectUI** (vendored + rebuilt, `frontend/src/components/ui/`) | Consistent look, a11y and dark mode out of the box; props documented in `doc/component-schemas.md`. |
| Editor | **CodeMirror 6** | Lighter than Monaco, good language packs, easy to embed. |
| Terminal UI | **xterm.js** (+ `@xterm/addon-fit`, `addon-web-links`) | De-facto standard terminal emulator for web views. |
| PTY (backend) | **`github.com/creack/pty`** (Unix) / **ConPTY** via `github.com/UserExistsError/conpty` (Windows) | Real shell with full TTY behaviour (colors, vim, etc.). |
| Markdown | **markdown-it** + **highlight.js** + **DOMPurify** on the frontend | Instant live preview with no round-trip; sanitizing protects against HTML in untrusted `.md` files. Optional: mermaid, KaTeX later. |
| FS watching | **`github.com/fsnotify/fsnotify`** | Cross-platform change notifications for the tree and open files. |
| Trash | **`github.com/rkoesters/xdg/trash`**-style lib or OS-specific call; fallback to permanent delete with confirmation | Safer deletes. |
| Config | JSON file in `os.UserConfigDir()/<app>/config.json` | Last root dir, recent dirs, window size, theme, shell path, font size. |

---

## 3. Architecture

```
┌──────────────────────────── WebView (React) ─────────────────────────────┐
│  Sidebar: FileTree   │  One tab strip – each tab is a file or a terminal │
│                      │──────────────────────────────────────────────────│
│                      │  Editor (CM6) | Markdown | Image | Terminal (xterm)│
└──────────▲───────────────────────────────▲───────────────────────────────┘
           │ Wails bound methods (RPC)     │ Wails events (push)
┌──────────┴───────────────────────────────┴───────────────────────────────┐
│ Go backend                                                                │
│  app.go        – lifecycle (startup/shutdown), dialogs                    │
│  workspace/    – root dir, path validation (sandbox)                      │
│  fsservice/    – list/read/write/create/rename/delete, fsnotify watcher   │
│  terminal/     – PTY sessions: spawn shell, stream I/O, resize, kill      │
│  config/       – load/save user settings                                  │
└───────────────────────────────────────────────────────────────────────────┘
```

### Communication
- **Frontend → Go:** Wails bound methods (auto-generated TS bindings).
- **Go → Frontend:** Wails events:
  - `fs:changed` `{path, op}` – debounced file-system changes.
  - `term:data:<id>` `string` (base64 or UTF-8 chunks) – PTY output.
  - `term:exit:<id>` `{code}` – shell exited.
  - `term:title:<id>` `string` – optional; the shell/foreground process name for the tab label (xterm's `onTitleChange` covers OSC titles on the frontend).

---

## 4. Backend API (Go, bound to frontend)

```go
// Workspace
func (a *App) OpenRootDialog() (string, error)        // native folder picker
func (a *App) SetRoot(path string) error               // validates, starts watcher, saves config
func (a *App) GetRoot() string

// Files (all paths are RELATIVE to root)
type Entry struct { Name, Path string; IsDir bool; Size int64; ModTime int64 }
func (a *App) ListDir(rel string) ([]Entry, error)     // lazy-load per folder
func (a *App) ReadFile(rel string) (FileContent, error) // {Text, Encoding, IsBinary, Size, ModTime}
func (a *App) WriteFile(rel, text string, expectedModTime int64) (int64, error) // conflict check
func (a *App) CreateFile(rel string) error
func (a *App) CreateDir(rel string) error
func (a *App) Rename(oldRel, newRel string) error
func (a *App) Delete(rel string) error                 // to trash when possible
func (a *App) ReadImage(rel string) (string, error)    // data URL for image viewer / md images

// Terminal
func (a *App) TermStart(cwdRel string, cols, rows int) (string, error) // session id; cwd = root + cwdRel (sandboxed, "" = root)
func (a *App) TermWrite(id, data string) error
func (a *App) TermResize(id string, cols, rows int) error
func (a *App) TermClose(id string) error
func (a *App) TermBusy(id string) (bool, error)          // a foreground process other than the shell is running (asked before closing the tab)

// Config
func (a *App) GetConfig() Config
func (a *App) SaveConfig(c Config) error
```

### Key backend rules
1. **Path sandboxing:** every `rel` is resolved with `filepath.Join(root, filepath.Clean("/"+rel))`, then `filepath.EvalSymlinks`, and must still be inside `root`. Reject otherwise. (Single user, but this prevents a malicious `.md` link or bug from touching files outside the workspace.)
2. **Binary / large files:** sniff first 8 KB (`http.DetectContentType` + NUL-byte check). Binary → not editable (image types shown in image viewer). Files > ~5 MB open read-only with a warning.
3. **Atomic save:** write to temp file in same dir → `fsync` → `os.Rename`. Preserve file mode.
4. **Conflict detection:** `WriteFile` compares on-disk mtime with `expectedModTime`; on mismatch return a conflict error so the UI can ask "Overwrite / Reload".
5. **Watcher:** fsnotify on directories that are expanded in the tree (fsnotify isn't recursive); debounce ~100 ms; ignore `.git/`, `node_modules/` (configurable).
6. **Terminal sessions:** shell from `$SHELL` (fallback `/bin/zsh` / `/bin/bash`; `powershell.exe` on Windows), env + `TERM=xterm-256color`. Read loop goroutine → emit events in chunks; kill all sessions on app shutdown. Map of sessions guarded by mutex. A session lives exactly as long as its tab: closing the tab calls `TermClose`.
7. **Busy check:** Unix – compare the PTY's foreground process group (`unix.IoctlGetInt(fd, unix.TIOCGPGRP)`) with the shell's pid; Windows – check for child processes of the shell. Used before closing a terminal tab and on quit.

---

## 5. Frontend

### Layout

Component choices, tokens and exact props per region are in **`doc/DESIGN_SYSTEM.md` §4**.

- **Left sidebar:** file tree (lazy expand, icons by extension, context menu: new/rename/delete/open in terminal).
- **Main area:** **one tab strip** holding files *and* terminals, in any order (drag to reorder). The `+` at the end of the strip offers New file / New terminal. Each tab is one of:
  - `Editor` – CodeMirror 6, language by extension, dirty indicator (●), Cmd/Ctrl+S to save.
  - `Markdown` – toggle **Edit / Split / Preview**; preview scroll-syncs roughly with editor.
  - `Image` – read-only viewer.
  - `Terminal` – xterm.js bound to one PTY session; label = shell or running process (`zsh`, `npm run dev`), busy indicator while a process runs.
- **Terminal tabs stay alive when hidden:** every terminal view stays mounted (hidden with CSS, not unmounted) so scrollback and the PTY stream are kept; on becoming visible it runs `fit()` and sends `TermResize`. Output that arrives while hidden is still written to the hidden xterm.
- **Closing:** a file tab asks if dirty; a terminal tab asks if `TermBusy` ("`npm run dev` is still running. Close anyway?"), then calls `TermClose`. When the shell exits on its own, the tab stays open, shows "Process exited (code 0)" and closes on any key.
- **Status bar:** root path, then for files: language, encoding, line/col, save state; for terminals: shell, cwd, cols×rows.

### Markdown preview details
- markdown-it with GFM-ish plugins (tables, task lists, strikethrough), highlight.js for code blocks.
- Output sanitized with DOMPurify before insertion.
- Relative image paths resolved via `ReadImage` (or a custom Wails asset handler serving `/ws/<rel>` from the root, with the same sandbox check — preferred, avoids huge data URLs).
- Links: relative `.md` links open in a new app tab; `http(s)` links open in the system browser (`runtime.BrowserOpenURL`); everything else blocked.
- Re-render debounced (~150 ms) while typing.

### State
A small store (React context + `useSyncExternalStore`, or Zustand) holding: root, tree nodes, open tabs as one ordered list of a union type, active tab id, config:

```ts
type Tab =
  | { kind: "file"; id: string /* rel path */; content: string; savedContent: string; modTime: number; mode: "edit" | "split" | "preview" }
  | { kind: "terminal"; id: string /* "term:<sessionId>" */; sessionId: string; title: string; cwd: string; busy: boolean; exitCode?: number };
```

### Keyboard shortcuts
`Cmd/Ctrl+O` open folder · `Cmd/Ctrl+S` save · `Cmd/Ctrl+W` close tab · `Cmd/Ctrl+P` quick-open file (fuzzy) · `` Ctrl+` `` go to the last-used terminal tab (opens one if none) · `` Ctrl+Shift+` `` new terminal tab · `Ctrl+Tab` / `Ctrl+Shift+Tab` next / previous tab · `Cmd/Ctrl+Shift+V` toggle markdown preview.

---

## 6. Project Layout

```
wp-go-desktop/
├── main.go                 # wails.Run(...)
├── app.go                  # App struct, startup/shutdown, bound methods (thin)
├── internal/
│   ├── workspace/          # root + path sandbox (resolve, inRoot)
│   ├── fsservice/          # file ops, binary sniffing, atomic write, watcher
│   ├── terminal/           # pty sessions (pty_unix.go / pty_windows.go)
│   └── config/             # settings persistence
├── frontend/
│   ├── src/
│   │   ├── components/ui/      # design system (affectUI) – see doc/DESIGN_SYSTEM.md
│   │   ├── styles/tokens.css
│   │   ├── features/
│   │   │   ├── FileTree.tsx
│   │   │   ├── TabArea.tsx          # the one tab strip + the active tab's view
│   │   │   ├── MarkdownPreview.tsx
│   │   │   ├── ImageView.tsx
│   │   │   └── TerminalView.tsx     # one xterm per terminal tab, kept mounted
│   │   ├── store/
│   │   └── App.tsx
│   └── package.json
├── doc/
│   ├── PLAN.md
│   ├── DESIGN_SYSTEM.md
│   └── component-schemas.md
├── wails.json
└── go.mod
```

---

## 7. Milestones

| # | Milestone | Deliverables | Done when |
|---|---|---|---|
| **M0** | Scaffold | `wails init -t react-ts` (upgrade to React 19), keep existing `frontend/src/components/ui`, project layout, CI build (`wails build`) for macOS | Empty window launches |
| **M1** | Workspace + tree | Folder picker, CLI arg `app <dir>`, config persistence, sandboxed `ListDir`, lazy tree | Can open a dir and browse it; reopening app restores last dir |
| **M2** | View & edit | `ReadFile`/`WriteFile` (atomic, conflict check), CodeMirror tabs, dirty state, save, binary detection, image viewer | Can edit and save files; unsaved-changes prompt on close |
| **M3** | Markdown preview | markdown-it + DOMPurify + highlight, split/preview modes, relative images & links | `.md` renders live, safely |
| **M4** | Terminal tabs | PTY sessions, xterm.js as a tab kind, kept-alive hidden views, resize on show, busy check + close confirm, "Open in terminal" from the tree, cleanup on exit | `vim`, `htop`, colors work; switching tabs keeps scrollback; cwd = chosen folder |
| **M5** | File ops + watching | Create/rename/delete (trash), fsnotify → tree refresh, "file changed on disk" reload prompt | External changes reflect in UI |
| **M6** | Polish | Quick-open (Cmd+P), themes (light/dark follows OS), font size, shortcuts, app icon, packaging (`.app`/`.dmg`, Linux AppImage, Windows `.exe`) | Installable builds |

Rough effort: M0–M2 ≈ 1 week, M3–M4 ≈ 1 week, M5–M6 ≈ 1 week (one developer).

---

## 8. Testing

- **Go unit tests:** path sandbox (traversal `../`, absolute paths, symlinks pointing outside root), atomic write, conflict detection, binary sniffing, terminal session lifecycle (spawn `sh -c 'echo hi'`, read output, exit).
- **Frontend unit tests (Vitest + Testing Library):** markdown rendering + sanitization (script tags, `javascript:` links stripped), tab store logic (mixed file/terminal ordering, close/activate-neighbour, dirty and busy guards).
- **Manual / E2E checklist per milestone:** open dir, edit/save, external modification, large file, binary file, terminal interactive programs, window close with unsaved changes.

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| WebView differences (WebKit on macOS/Linux, WebView2 on Windows) | Stick to standard web APIs; test on each OS before release. |
| Terminal throughput (e.g. `cat` huge file) floods events | Batch PTY output (e.g. flush every 16 ms or 32 KB) before emitting. |
| Windows PTY support | Isolate behind `terminal.Session` interface with build-tagged implementations; ConPTY needs Windows 10 1809+. |
| fsnotify not recursive / watch limits on Linux | Watch only expanded folders; ignore heavy dirs; manual refresh button as fallback. |
| Untrusted Markdown HTML | DOMPurify + link allow-list + no remote script execution; CSP in `index.html`. |
| Large directories | Lazy per-folder listing; sort dirs first; cap entries per folder with "show more". |

---

## 10. Open Questions

1. Should the app allow switching root dirs at runtime, or is it fixed per launch? (Plan assumes switchable + recent list.)
2. Hidden files (dotfiles): shown by default or toggle? (Plan: hidden by default, toggle in settings.)
3. Any Markdown extras needed — Mermaid diagrams, math (KaTeX), front-matter?
4. Target platforms for v1 — macOS only, or all three?
