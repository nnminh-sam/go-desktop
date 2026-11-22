# Design System — wp-go-desktop

Built on **[affectUI](https://www.affectui.com/components)**. Every component keeps affectUI's styling and its prop schema.

| Doc | What's in it |
|---|---|
| this file | Inventory, sources, foundations (color, type, motion), app layout and how each component is used |
| [`component-schemas.md`](component-schemas.md) | The exact prop types of all 28 components, generated from source |
| `frontend/src/components/ui/*.tsx` | The components — one self-contained file each |
| `frontend/src/styles/tokens.css` | Theme hooks (`--aui-*`) and app-shell tokens (`--app-*`), light + dark |
| [`design-system.html`](design-system.html) | Visual showcase rendered with the real components (light/dark, live demos). Rebuild: `scripts/build-showcase.sh` |

> **Stack change:** affectUI is **React 19**. To use these components and their schemas without porting them, the frontend moves from Svelte (as in `PLAN.md` v1) to **React 19 + TypeScript + Vite**. `PLAN.md` has been updated.

---

## 1. Component inventory

### 1.1 What the app needs → which component

| App need (from `PLAN.md`) | Component | Source |
|---|---|---|
| Primary / secondary / destructive actions (Save, Overwrite, Delete) | **Button** | Vendored |
| Toolbar & sidebar actions (new tab, new file, refresh, collapse, split) | **Icon Button** | Vendored |
| Bold/italic-style toggles, "show hidden files" style toggles | **Toggle Group** | Vendored |
| Markdown **Edit / Split / Preview** switch | **Segmented Control** (`kind="tabs"`) | Vendored |
| **One tab strip for files and terminals** (closable, dirty dot, busy ring, reorder) | **Tabs** | **New** (no affectUI equivalent; `/components/tabs` → 404) |
| File/overflow menus ("…" button) | **Dropdown Menu** | Vendored |
| Right-click on tree rows / tabs / editor | **Context Menu** | Vendored |
| Quick-open (⌘P) and command palette (⌘⇧P) | **Command Menu** | **Rebuilt from spec** (affectUI Pro) |
| Rename / new file / new folder inputs, search filter | **Text Field** | Vendored |
| Settings form rows | **Form Field** | Vendored |
| Settings: theme, shell, font size | **Select** | Vendored |
| Settings: show hidden files, word wrap, follow OS theme | **Switch** | Vendored |
| Confirm delete, unsaved changes, save conflict, settings | **Dialog** / **AlertDialog** | Vendored |
| File info, small inline panels | **Popover** | Vendored |
| Labels on icon buttons, with shortcut | **Tooltip** | Vendored |
| "Saved", "File changed on disk", errors, Undo-delete | **Toaster** + `toast()` | **Rebuilt from spec** (affectUI Pro) |
| Status bar chips (language, encoding, read-only; shell and size for terminals) | **Badge** | Vendored |
| Shortcut hints in menus, tooltips, empty states | **Kbd** | Vendored |
| Loading a dir / big file / save in progress | **Spinner**, **Skeleton** | Vendored |
| No folder open / no file open / empty folder / binary file | **Empty State** | Vendored |
| Settings sections, file-info card | **Card** | Vendored |
| Dividers in toolbars and status bar | **Separator** | Vendored |
| Sidebar, preview, settings scrolling | **Scroll Area** | Vendored |
| Sidebar \| tab area, Markdown editor \| preview | **Resizable** | Vendored |
| File tree | **Tree View** | Vendored |
| Path above the editor | **Breadcrumb** | Vendored |
| Fenced code in Markdown preview | **Code Block** | Vendored |

**Not in affectUI and not a component:** the **editor** (CodeMirror 6), the **terminal** (xterm.js) and the **Markdown prose** styles. They're themed from the same tokens in §5.

**Looked at but not used:** Combobox (Pro; Select + Command Menu cover our needs), Notification Stack (Toaster fits transient feedback better), Hover Card, Data Table, Date Picker and others. Nothing in the app calls for them.

### 1.2 Source legend

- **Vendored:** copied byte-for-byte from the affectUI public registry (`https://www.affectui.com/r/<name>.json`, MIT). Styling and schema are identical. Don't edit; re-pull to update.
- **Rebuilt from spec:** affectUI Pro components. Their registry returns 401, so the source was **not** used. Built from the public docs page instead: the same props, defaults, item shapes, keyboard map, a11y behaviour and sizes. Visuals come from the vendored menu/overlay components. Spec details the page doesn't give are listed in §7.
- **New:** not in affectUI. Written in the same file format, tokens and conventions (§2).

---

## 2. Conventions (how every component is built)

These are affectUI's conventions. New components must follow them.

1. **One self-contained `.tsx` file per component.** No CSS files, no Tailwind, no runtime deps except `react` (and optionally `@hugeicons/core-free-icons` icon data).
2. **Styles are injected** with React 19's `<style href="ui-<name>" precedence="default">{css}</style>`. React hoists it into `<head>` once.
3. **Class namespace** `ui-<abbr>` (BEM-ish: `ui-dm__item`, `ui-tabs__tab`). **State and variants go in data attributes** (`data-variant`, `data-size`, `data-active`, `data-loading`), never extra classes.
4. **Two-level variables:** each component declares `--ui-<abbr>-*` locals, and each falls back to a global hook: `--ui-btn-ink: var(--aui-ink, #171717)`. Re-theme globally with `--aui-*` and per component with `--ui-*`.
5. **Dark mode:** `:where(.dark, [data-theme="dark"]) .ui-x { …overrides… }`. Triggered by `class="dark"` or `data-theme="dark"` on any ancestor (we use `<html>`).
6. **Motion:** ease `cubic-bezier(0.22, 1, 0.36, 1)` (`--aui-ease`). Enters 220 ms (scale .96→1, translateY 4 px, fade). Highlights glide 180 ms. Width/pill glides 320–480 ms. Hover colors 120–160 ms. Press `scale(0.97)`. Always honour `prefers-reduced-motion` (durations → 1 ms).
7. **Props API style:** `items`/`options` arrays of plain objects; `value` + `defaultValue` + `onChange` (controlled or uncontrolled); `size: "sm" | "md" | "lg"`; `variant`; icons accept `ReactNode | HugeIcon`; `className` on the root; `aria-label` required when there's no visible label. Unknown enum values fall back to the default.
8. **A11y baseline:** native elements first; roving tabindex in composite widgets; arrow/Home/End keys; visible `:focus-visible` ring (`2px solid var(--…-focus)`, offset 2px or −2px inside rows); sr-only live regions for async state; `forced-colors` fallbacks; touch (`pointer: coarse`) gets ≥ 40 px rows.

---

## 3. Foundations

### 3.1 Color

The library's stock palette, which every component falls back to. `tokens.css` leaves the `--aui-*` hooks **unset** on purpose. affectUI tunes each component slightly differently (muted text is `#737373` in Button and `#8f8f8f` in menus), and setting the hooks globally would flatten that. Uncomment them only for a deliberate re-theme.

| Role | Hook | Light | Dark |
|---|---|---|---|
| Ink (primary text) | `--aui-ink` | `#171717` | `#ededed` |
| Body text in menus | — | `#262626` | `#e4e4e7` |
| Muted text / icons | `--aui-muted` | `#737373` · `#8f8f8f` | `#8f8f8f` · `#8b8b92` |
| Placeholder / faint | `--aui-placeholder` | `#a3a3a3` | `#5c5c63` |
| Surface (cards, inputs) | `--aui-surface` | `#ffffff` | `#19191b` · `#232326` (raised) |
| Overlay (menus, popovers) | `--aui-overlay` | `#ffffff` | `#19191b` |
| Subtle fill (trays, tracks) | `--aui-subtle` | `#f0f0f0` | `#111113` · `#1d1d20` |
| Row highlight (glow) | — | `#f4f4f5` | `#26262a` |
| Border / hairline | `--aui-border` | `#ececec` · `#e5e5e5` | `#2a2a2e` · `rgba(255,255,255,.1)` |
| Strong border | `--aui-border-strong` | `#d4d4d8` | `#3a3a40` |
| Focus ring | `--aui-focus` | `rgba(0,96,226,.7)` | `rgba(77,141,255,.8)` |
| Accent blue | `--aui-blue` | `#0190fe` | `#4fb0fe` |
| Danger | `--aui-danger` / `--aui-red` | `#d92d20` · `#c4320a` / `#f04438` | `#ff8a7a` / `#ff6b5f` |
| Danger soft bg | `--aui-danger-soft` | `#fdecea` | `#3b1c14` |
| Success | `--aui-success` | `#1e8a4f` | `#5fc88a` |
| Warning | `--aui-warning` | `#b25e00` | `#ffb35c` |
| Info | `--aui-info` | `#2456d6` | `#8ab4ff` |

**Primary button gradient:** light `#323137 → #201e25`, edge `#4b4951 / #31303a / #18171b`, ring `#0d0d0d`. Dark mode **inverts** to a light chip: `#f4f4f5 → #e4e4e7` with ink `#121213`.

**Syntax palette** (from Code Block; reused for CodeMirror and highlight.js):

| Token | Light | Dark |
|---|---|---|
| Comment | `#9a9a9a` | `#6e6e75` |
| String | `#0b8576` | `#4fc3b4` |
| Keyword | `#8a35d6` | `#cfaef5` |
| Number / literal | `#b25e00` | `#f2a15c` |
| Function / variable | `#1f63c9` | `#7cb4ff` |
| Property key / plain | `#171717` | `#ededed` |
| Highlighted line | `rgba(0,96,226,.06)` | `rgba(77,141,255,.1)` |

### 3.2 App-shell tokens (`--app-*`)

| Region | Token | Light | Dark |
|---|---|---|---|
| Window / sidebar / status bar | `--app-bg`, `--app-sidebar`, `--app-statusbar` | `#fafafa` | `#111113` |
| Editor + preview | `--app-editor` | `#ffffff` | `#161618` |
| Terminal view (inside a tab) | `--app-panel` | `#ffffff` | `#161618` |
| Region hairlines | `--app-line` | `#ececec` | `#2a2a2e` |
| Row hover / selected | `--app-hover` / `--app-selected` | `#f4f4f5` / `#f0f0f0` | `#1d1d20` / `#26262a` |

The rule: **one surface step** between chrome (`#fafafa` / `#111113`) and content (`#fff` / `#161618`), separated by 1 px hairlines. No shadows on fixed regions. Shadows are only for floating layers (menus, dialogs, toasts).

### 3.3 Typography

- **UI font:** `"Inter", "InterVariable", ui-sans-serif, system-ui, …` (bundle Inter Variable in the app, since WebViews don't ship it).
- **Mono:** `ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace`. Editor and terminal 13 px / 20 px.
- **Scale:** 11 (kbd) · 12 (group headings, meta) · 12.5 (descriptions, small controls) · **13.5 (body, menu rows)** · 14 (inputs, md buttons) · 15 (lg buttons, command field).
- **Weights:** 400 body, 500 labels/active/titles. Nothing heavier in chrome; Markdown headings use 600.
- **Tracking:** `-0.01em` on labels and buttons, `+0.02em` on kbd.

### 3.4 Radius, elevation, sizing

| | Value |
|---|---|
| Radius sm / md / lg | 5–7 px / 10–12 px / 14–16 px (menus `radius-lg + 4`, rows `radius-sm + 4`) |
| Control heights | sm **32** · md **40** · lg **48** (Button); compact controls 26/30/36 (Segmented) |
| Menu row | 34 px (46 px with description), command row 38 px |
| Popover shadow (light) | `0 0 0 1px rgba(0,0,0,.06), 0 18px 40px -12px rgba(0,0,0,.18), 0 4px 12px -4px rgba(0,0,0,.06)` |
| Popover shadow (dark) | `0 0 0 1px rgba(255,255,255,.06), 0 18px 40px -12px rgba(0,0,0,.6)` |
| Pill / raised (light) | `0 0 0 .5px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.08), 0 2px 8px -2px rgba(0,0,0,.06)` |
| Spacing | 4 px grid; region padding 8/12 px; dialogs 20–24 px |

### 3.5 Icons

**Hugeicons Free** (`@hugeicons/core-free-icons`, MIT). Components accept the icon *data object* (`icon={File01Icon}`) and draw it inline. Use 1.5 px stroke at 16 px in rows and 18 px in buttons. Suggested set: `Folder01Icon`/`Folder02Icon` (open), `File01Icon`, `FileScriptIcon`, `Image01Icon`, `ComputerTerminal01Icon`, `Add01Icon`, `Search01Icon`, `Settings01Icon`, `Delete02Icon`, `Edit02Icon`, `Copy01Icon`, `RefreshIcon`, `SidebarLeftIcon`, `LayoutTwoColumnIcon`, `ViewIcon`.

---

## 4. App layout & component usage

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ●●●  wp-go-desktop › doc › PLAN.md             [⌘P search…]   (⚙) (◐)        │ titlebar 38px (--app-bg)
├───────────────┬──────────────────────────────────────────────────────────────┤
│ EXPLORER  + ⟳ │ [PLAN.md ●][▣ zsh ×][main.go ×][◌ npm run dev]  (+) [E|S|P] (…)│ ONE tab strip: files + terminals
│ ▾ doc         │ doc › PLAN.md                                                 │ Breadcrumb (file) / cwd (terminal)
│   PLAN.md     │ ┌───────────── editor ────────────┬──────── preview ────────┐ │
│ ▸ frontend    │ │ CodeMirror 6                    │ Markdown prose          │ │ active tab's view fills the area
│   main.go     │ │                                 │ + CodeBlock             │ │ (a terminal tab shows xterm here)
│   go.mod      │ │                                 │                         │ │
│  TreeView     │ │                                 │                         │ │
│  in ScrollArea│ └─────────────────────────────────┴─────────────────────────┘ │
├───────────────┴──────────────────────────────────────────────────────────────┤
│ ~/workspaces/wp-go-desktop   │ Markdown · UTF-8 · LF · Ln 12, Col 4   [Saved] │ status bar 24px, Badges
└──────────────────────────────────────────────────────────────────────────────┘
  ▣ terminal tab   ◌ busy terminal (spinning ring)   ● unsaved file     ┌ Toaster bottom-right ┐
```

**Rule: there is no bottom pane.** A terminal is a tab like any file. Files and terminals share one strip, in whatever order the user drags them. The active tab's view fills the whole main area.

### 4.1 Shell

```tsx
<ResizablePanelGroup direction="horizontal" onLayout={saveLayout}>
  <ResizablePanel defaultSize={20} minSize={12} maxSize={40} collapsible>   {/* ⌘B folds it */}
    <Sidebar />
  </ResizablePanel>
  <ResizableHandle />
  <ResizablePanel>
    <TabArea />   {/* Tabs strip + the active tab's view: Editor | Markdown | Image | Terminal */}
  </ResizablePanel>
</ResizablePanelGroup>
<StatusBar />
<Toaster position="bottom-right" offset={36 /* clears the status bar */} />
```

### 4.2 Sidebar: file tree

- **Header:** 12 px / 500 muted label "Explorer", then `IconButton size="sm" variant="ghost"` × 3 (New file, New folder, Refresh), each wrapped in `Tooltip` with a `shortcut`.
- **Tree:** `ScrollArea type="hover" fade` around `TreeView`:
  - `items` comes from `ListDir`. Directories get `children: []` until they're loaded, which makes them branches. `onExpandedChange` triggers the lazy load.
  - `icon={Folder01Icon}`, `openIcon={Folder02Icon}`, and a file icon by extension. Use `meta` for nothing or for a git/dirty mark later.
  - `selected` follows the active tab. `onSelect` opens the file. `guides` stays on.
- **Context Menu** wraps the tree with `items={(target) => target.closest("[data-file]") ? fileItems : folderItems}`. Items: New file, New folder, Rename (`shortcut: "↵"`), Copy path, Open in terminal (a new terminal tab in that folder), `divider`, Delete (`danger`, `shortcut: "⌘⌫"`).
- **Rename / new:** an inline `TextField size="sm"` in place of the row label. Enter commits, Esc cancels. Show the error inline via the `error` prop (e.g. "A file with this name already exists").
- **No folder:** `EmptyState icon={Folder01Icon} title="No folder open" text="Open a folder to browse and edit its files." action={<Button>Open folder…</Button>}`, with `<Kbd keys={["mod","O"]} />` in the text.

### 4.3 Tab area (files and terminals)

- **One `Tabs` strip, `size="md"`.** `items` is the ordered tab list from the store, with both kinds mixed:
  - file → `{ id: path, label: basename, title: fullPath, icon: <by extension>, dirty }`
  - terminal → `{ id: "term:<sessionId>", label: title /* "zsh", "npm run dev" */, title: cwd, icon: ComputerTerminal01Icon, busy }`
  - `onChange` activates. `onReorder` reorders across kinds. `onClose` guards: a dirty file opens the unsaved-changes Dialog, and a busy terminal opens the close-terminal AlertDialog (§4.5). After that, `TermClose`.
  - **Duplicate terminal names** get a suffix: `zsh`, `zsh (2)`.
- **`actions`, from left to right:**
  1. `DropdownMenu` on `IconButton icon={Add01Icon} label="New tab"` with items New file (`⌘N`), New terminal (`` ⌃⇧` ``), and "New terminal in…" (submenu: root plus the recently used folders).
  2. For `.md` files only: `SegmentedControl size="sm" kind="tabs"` Edit / Split / Preview (icons only, with `ariaLabel`).
  3. `DropdownMenu` on `IconButton` "…". For a file: Close others, Close all, Copy path, Reveal in tree. For a terminal: Clear, Rename tab, Copy cwd, Kill process (`danger`), Close others, Close all.
- **Context Menu on a tab:** the same items as "…", so a right-click works on any tab.
- **Under the strip:** for a file, a `Breadcrumb` of the path (`separator="chevron"`, `maxItems={4}`; clicking a crumb reveals it in the tree). For a terminal, the same Breadcrumb of the cwd, which updates when the shell reports it via OSC 7. Clicking a crumb sends `cd <dir>`.
- **Views:**
  - File: CodeMirror, Markdown (Split = horizontal `Resizable` 50/50), an image viewer, or `EmptyState` for a binary file ("This file can't be shown" with a `secondary` "Open with system app" Button).
  - Terminal: xterm.js filling the area on `--app-editor` with 12 px padding. **Every terminal view stays mounted** (hidden with `display: none`) to keep scrollback. When it becomes active it runs `fit()` and focuses.
  - A shell that exited: the view keeps its output with a line "Process exited with code 0 · press any key to close", and the tab label dims.
- **Nothing open:** `EmptyState bare` with two actions, `Button` "Open file" (⌘P) and `Button variant="secondary"` "New terminal" (⌃\`), plus `Kbd` hints.
- **Large file:** a `Badge tone="warning"` reading "Read-only · 12 MB" in the status bar.

### 4.4 Terminals: behaviour

| Trigger | Result |
|---|---|
| `+` → New terminal, `` ⌃⇧` ``, or ⌘⇧P "New terminal" | A new terminal tab right after the active tab, cwd = root |
| `` ⌃` `` | Activates the last-used terminal tab, or opens one if none exists |
| Tree context menu → **Open in terminal** | A new terminal tab with cwd = that folder (`TermStart(rel)`) |
| A command runs (foreground process ≠ shell) | Tab `busy` → spinning ring. The label follows the xterm title, e.g. `npm run dev` |
| Close a busy terminal | AlertDialog `danger`: "Close terminal?" / "`npm run dev` is still running and will be stopped." / confirm "Close" |
| Quit with busy terminals | One Dialog that lists them, with `secondary` "Cancel" and `destructive` "Quit anyway" |
| `⌘W` | Closes the active tab, file or terminal, with the same guards |
| `⌃Tab` / `⌃⇧Tab` | Next / previous tab, across both kinds |

### 4.5 Overlays

| Moment | Component | Spec |
|---|---|---|
| ⌘P quick-open | `Dialog` (`width={600}`, no closeButton) wrapping `CommandMenu` | `groups`: Recent files (id `"suggestions"`, so the first five get ⌘1–⌘5), then Files (fuzzy, `hint` = folder path). `onRun(id)` opens the file. `onClose` closes the dialog |
| ⌘⇧P commands | same | groups: Suggestions, File, View, Terminal (New terminal, Go to terminal, Kill process), Go to. Open tabs (files and terminals) are searchable too. Each command has `keys` and `keywords` |
| Delete file | `AlertDialog danger` | title "Delete PLAN.md?", description "It will be moved to the Trash.", confirmLabel "Delete" |
| Close busy terminal | `AlertDialog danger` | "Close terminal?" / "`npm run dev` is still running and will be stopped." / confirmLabel "Close" |
| Close dirty tab / quit | `Dialog size="sm"` | footer buttons: `ghost` "Don't save", `secondary` "Cancel", `primary` "Save" |
| Save conflict | `Dialog size="sm"` | "PLAN.md changed on disk" → `secondary` "Reload", `destructive` "Overwrite" |
| Settings (⌘,) | `Dialog size="md"` | `Card` sections. Each row is a `FormField` with `Select` (Theme: System/Light/Dark; Shell), a numeric `TextField` (Font size) and `Switch` (Show hidden files, Word wrap) |
| Feedback | `toast` | `toast.success("Saved")` (only when the save took more than 300 ms, so it stays quiet). `toast("Moved to Trash", { action: { label: "Undo", … } })`. `toast.promise(save(), …)` for large files. `toast.error(...)` for FS errors |
| Hints | `Tooltip` | every icon-only button. Pass the `shortcut` prop, e.g. `"⌘B"` |

### 4.6 Status bar (24 px, `--app-statusbar`, hairline on top)

Left: root path (12 px muted, ellipsis in the middle). Right: `Separator orientation="vertical"` between groups, and `Badge size="sm" tone="neutral"` for language / encoding / EOL. `Ln, Col` is plain text. Save state: `Spinner size={12}` while saving, then `Badge tone="success" dot` "Saved" that fades after 1.5 s.

---

## 5. Theming the non-affectUI surfaces

### 5.1 CodeMirror 6

```ts
// frontend/src/editor/theme.ts
import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

export const affectEditorTheme = EditorView.theme({
  "&": { backgroundColor: "var(--app-editor)", color: "var(--app-ink)", fontSize: "13px" },
  ".cm-content": { fontFamily: "var(--app-font-mono)", lineHeight: "20px", padding: "12px 0" },
  ".cm-gutters": { backgroundColor: "var(--app-editor)", color: "var(--app-faint)", border: "none" },
  ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "color-mix(in srgb, var(--app-accent) 5%, transparent)" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": { backgroundColor: "color-mix(in srgb, var(--app-accent) 18%, transparent) !important" },
  ".cm-cursor": { borderLeftColor: "var(--app-ink)" },
  ".cm-tooltip": { background: "var(--app-editor)", border: "none", borderRadius: "10px",
    boxShadow: "0 0 0 1px rgba(0,0,0,.06), 0 18px 40px -12px rgba(0,0,0,.18)" },
});

// Light values; swap to the dark column of §3.1 under [data-theme=dark] (two HighlightStyles + a Compartment)
export const affectHighlight = syntaxHighlighting(HighlightStyle.define([
  { tag: t.comment, color: "#9a9a9a" },
  { tag: [t.string, t.special(t.string)], color: "#0b8576" },
  { tag: [t.keyword, t.controlKeyword, t.modifier], color: "#8a35d6" },
  { tag: [t.number, t.bool, t.null, t.atom], color: "#b25e00" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#1f63c9" },
  { tag: t.propertyName, color: "#171717" },
  { tag: t.heading, fontWeight: "600" },
  { tag: t.link, color: "#0190fe", textDecoration: "underline" },
]));
```

### 5.2 xterm.js

```ts
export const xtermLight = {
  background: "#ffffff", foreground: "#171717", cursor: "#171717", cursorAccent: "#ffffff",
  selectionBackground: "rgba(1,144,254,0.18)",
  black: "#171717", red: "#d92d20", green: "#1e8a4f", yellow: "#b25e00", blue: "#1f63c9", magenta: "#8a35d6", cyan: "#0b8576", white: "#a3a3a3",
  brightBlack: "#737373", brightRed: "#f04438", brightGreen: "#5fc88a", brightYellow: "#f2a15c", brightBlue: "#0190fe", brightMagenta: "#cfaef5", brightCyan: "#4fc3b4", brightWhite: "#d4d4d8",
};
export const xtermDark = {
  background: "#161618", foreground: "#ededed", cursor: "#ededed", cursorAccent: "#161618",
  selectionBackground: "rgba(79,176,254,0.25)",
  black: "#26262a", red: "#ff8a7a", green: "#5fc88a", yellow: "#f2a15c", blue: "#7cb4ff", magenta: "#cfaef5", cyan: "#4fc3b4", white: "#e4e4e7",
  brightBlack: "#5c5c63", brightRed: "#ff6b5f", brightGreen: "#7dcf9f", brightYellow: "#ffb35c", brightBlue: "#4fb0fe", brightMagenta: "#e0c8ff", brightCyan: "#7fd8cc", brightWhite: "#ffffff",
};
// fontFamily: var(--app-font-mono) resolved, fontSize 13, lineHeight 1.35, cursorStyle "bar", cursorBlink true
```

### 5.3 Markdown preview (`.md-prose`)

- Max width 760 px, centred, padding 32 px 40 px. Body 14.5 px / 1.7, `--app-text`.
- Headings `--app-ink`, weight 600, tracking −0.015em: h1 26 px, h2 20 px with a 1 px `--app-line` rule under it, h3 16.5 px.
- Links `--app-accent`, underline offset 2 px. Inline code is 0.9em mono on `--aui-subtle`/`#f0f0f0` with radius 5 px and padding 1 px 5 px.
- **Fenced code renders as `<CodeBlock code language copyable maxHeight={480} />`.** Its built-in colorizer covers TS/JS/JSON/Bash/Python. Other languages render as plain text (or use highlight.js with the §3.1 palette).
- Tables: hairline borders (`--app-line`), header row on `#fafafa`/`#111113`, 8 px 12 px cells. Task lists use Checkbox-like 14 px boxes. Blockquote: a 2 px `--app-line-strong` left bar with muted text.
- Images: max-width 100%, radius 10 px, inside a `--app-line` hairline.

---

## 6. File map

```
frontend/src/
├── styles/tokens.css            # import once in main.tsx
├── components/ui/               # 28 components (25 vendored · 2 rebuilt · 1 new)
│   ├── badge.tsx  breadcrumb.tsx  button.tsx  card.tsx  code-block.tsx  context-menu.tsx
│   ├── dialog.tsx  dropdown-menu.tsx  empty-state.tsx  form-field.tsx  icon-button.tsx  kbd.tsx
│   ├── popover.tsx  resizable.tsx  scroll-area.tsx  segmented-control.tsx  select.tsx  separator.tsx
│   ├── skeleton.tsx  spinner.tsx  switch.tsx  text-field.tsx  toggle-group.tsx  tooltip.tsx  tree-view.tsx
│   ├── command-menu.tsx   ← rebuilt from spec (Pro)
│   ├── toaster.tsx        ← rebuilt from spec (Pro)
│   ├── tabs.tsx           ← new
│   └── NOTICE.md
├── editor/theme.ts  terminal/theme.ts  preview/prose.css   # §5 (written in M2–M4)
```

Dependencies: `react@19`, `react-dom@19`, `@hugeicons/core-free-icons`. Nothing else is needed for the UI kit.

---

## 7. Rebuilt components: spec coverage & assumptions

### Command Menu (`command-menu.tsx`)
**Matches the spec:** props `groups`, `placeholder` (default `"Type a command or search…"`), `onRun(id, query?)`, `onClose`, `autoFocus` and `className`. The group/command shapes are `{ id, label, commands: { id, label, hint?, logo? | icon?, keys?, keywords? }[] }`. The `"suggestions"` group gets ⌘1–⌘5. Keys: ↑/↓, ↵, Tab/Shift+Tab between groups, Esc clears then closes, ⌘K focuses. The field is a `combobox` with `aria-activedescendant`, groups are labelled, keys are `aria-hidden`, and a polite live region announces what ran. Max width 600 px. Keys and hints are hidden below 600 px.

**Assumed (not on the spec page):**
- The "ask" fallback row appears only when the query matches nothing.
- Matching is AND-of-words substring over label, hint and keywords.
- Default groups are app-relevant placeholders.
- Visuals reuse Dropdown Menu's glide highlight, Kbd chips, a 52 px field, 38 px rows and a 440 px max height.

### Toaster (`toaster.tsx`)
**Matches the spec:** every prop and default (`position="bottom-right"`, `duration=4000`, `visibleToasts=3`, `offset=24/20 inline`, `gap=10`, `hotkey="F8"`, `hairline`, `closeButton`, `label="Notifications"`, `inline`, `id`, `expand`). The API is `toast`, `.success/.error/.info/.loading`, `.promise(p | () => p, { loading, success, error })` and `.dismiss(id?)`. `ToastOptions` is `{ id, description, action{label,onClick}, duration, icon, toaster, onDismiss }`. Updating by id restarts the timer and crossfades. `action` closes unless `preventDefault()`. Width 356 px, full width with 12 px gutters under 600 px. The stack fans out on hover/focus and folds otherwise. Timers pause on hover, on focus, when the tab is hidden, and for queued toasts. F8 focuses, Esc closes and moves focus on. Swipe to dismiss. Polite status region, with errors in an alert region.

**Assumed:**
- Folded peek is 12 px with 5 % scale per level.
- Enter/exit timings are 400/200 ms on the library ease.
- Swipe thresholds are 60 px sideways and 40 px down.
- The card uses Dropdown Menu's surface and shadow. The action button is a 26 px dark chip like the primary Button. The close button is a 20 px round button in the corner.

### Tabs (`tabs.tsx`) — new
**Props:**
- `items: { id, label, icon?, title?, dirty?, busy?, closable?, controls? }[]`
- `value` / `defaultValue` / `onChange`
- `onClose(id, item)`, `onReorder(ids)`
- `size: "sm" | "md"`, `actions`, `aria-label`, `className`

**Behaviour:**
- tablist with roving tabindex. ←/→ activate, Home/End jump, Delete closes, middle-click closes, drag to reorder.
- The dirty dot turns into × on hover. `busy` (a running terminal) swaps the icon for a spinning ring and is announced as ", running".
- A 2 px ink line glides over the active tab.

---

## 8. Provenance & license

- The 25 vendored files come unmodified from affectUI's free registry (**MIT**). Keep their header comments. `components/ui/NOTICE.md` records the source and license.
- The affectUI Pro components (Command Menu, Toaster) were **not** downloaded; their registry requires a paid key. The files here are independent implementations of their *public* documentation. If you buy Pro, you can swap in the originals: the schemas match, so call sites won't change.
- Icons: Hugeicons Free (MIT).

### Updating a vendored component
```bash
npx shadcn@latest add https://www.affectui.com/r/<name>.json   # or curl the JSON and copy files[0].content
python3 scripts/gen-schemas.py                                    # regenerate doc/component-schemas.md
```
