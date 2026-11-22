/*
 * Design-system showcase – rendered with the real components from src/components/ui.
 * Built into a single self-contained file: doc/design-system.html (see scripts/build-showcase.sh).
 */
import { createElement, useEffect, useRef, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import {
  Add01Icon,
  ArrowDown01Icon,
  CodeIcon,
  ComputerTerminal01Icon,
  Copy01Icon,
  Delete02Icon,
  Download01Icon,
  Edit02Icon,
  File01Icon,
  FileScriptIcon,
  Folder01Icon,
  Folder02Icon,
  FolderAddIcon,
  Image01Icon,
  LayoutTwoColumnIcon,
  Moon02Icon,
  MoreHorizontalIcon,
  RefreshIcon,
  Search01Icon,
  Settings01Icon,
  SidebarLeftIcon,
  Sun03Icon,
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";

import tokensCss from "../styles/tokens.css";
import { Badge } from "../components/ui/badge";
import { Breadcrumb } from "../components/ui/breadcrumb";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../components/ui/card";
import { CodeBlock } from "../components/ui/code-block";
import { CommandMenu, type CommandGroup } from "../components/ui/command-menu";
import { ContextMenu } from "../components/ui/context-menu";
import { AlertDialog, Dialog } from "../components/ui/dialog";
import { DropdownMenu } from "../components/ui/dropdown-menu";
import { EmptyState } from "../components/ui/empty-state";
import { FormField } from "../components/ui/form-field";
import { IconButton } from "../components/ui/icon-button";
import { Kbd } from "../components/ui/kbd";
import { Popover } from "../components/ui/popover";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../components/ui/resizable";
import { ScrollArea } from "../components/ui/scroll-area";
import { SegmentedControl } from "../components/ui/segmented-control";
import { Select } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { Loading, Skeleton } from "../components/ui/skeleton";
import { Spinner } from "../components/ui/spinner";
import { Switch } from "../components/ui/switch";
import { Tabs, type TabItem } from "../components/ui/tabs";
import { TextField } from "../components/ui/text-field";
import { Toaster, toast } from "../components/ui/toaster";
import { ToggleGroup } from "../components/ui/toggle-group";
import { Tooltip } from "../components/ui/tooltip";
import { TreeView, type TreeNode } from "../components/ui/tree-view";

type Icon = readonly (readonly [string, { readonly [key: string]: string | number }])[];

/** Draws a Hugeicons data object at any size */
function I({ icon, size = 16 }: { icon: Icon; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" style={{ display: "block", flex: "none" }}>
      {icon.map(([tag, { key, ...attrs }], i) => createElement(tag, { ...attrs, key: String(key ?? i) }))}
    </svg>
  );
}

/* ---------------------------------------------------------------- data */

const NAV: [string, string][] = [
  ["overview", "Overview"],
  ["principles", "Principles"],
  ["color", "Color"],
  ["typography", "Typography"],
  ["shape", "Radius, elevation & spacing"],
  ["motion", "Motion"],
  ["icons", "Icons"],
  ["components", "Components"],
  ["themes", "Editor, terminal & prose"],
  ["app", "App composition"],
];

const PALETTE: { role: string; hook: string; light: string; dark: string }[] = [
  { role: "Ink", hook: "--aui-ink", light: "#171717", dark: "#ededed" },
  { role: "Menu text", hook: "—", light: "#262626", dark: "#e4e4e7" },
  { role: "Muted", hook: "--aui-muted", light: "#737373", dark: "#8f8f8f" },
  { role: "Placeholder", hook: "--aui-placeholder", light: "#a3a3a3", dark: "#5c5c63" },
  { role: "Surface", hook: "--aui-surface", light: "#ffffff", dark: "#19191b" },
  { role: "Overlay", hook: "--aui-overlay", light: "#ffffff", dark: "#19191b" },
  { role: "Subtle fill", hook: "--aui-subtle", light: "#f0f0f0", dark: "#111113" },
  { role: "Row glow", hook: "—", light: "#f4f4f5", dark: "#26262a" },
  { role: "Border", hook: "--aui-border", light: "#ececec", dark: "#2a2a2e" },
  { role: "Border strong", hook: "--aui-border-strong", light: "#d4d4d8", dark: "#3a3a40" },
  { role: "Focus", hook: "--aui-focus", light: "rgba(0,96,226,.7)", dark: "rgba(77,141,255,.8)" },
  { role: "Blue", hook: "--aui-blue", light: "#0190fe", dark: "#4fb0fe" },
  { role: "Danger", hook: "--aui-danger", light: "#d92d20", dark: "#ff8a7a" },
  { role: "Red", hook: "--aui-red", light: "#f04438", dark: "#ff6b5f" },
  { role: "Success", hook: "--aui-success", light: "#1e8a4f", dark: "#5fc88a" },
  { role: "Warning", hook: "--aui-warning", light: "#b25e00", dark: "#ffb35c" },
  { role: "Info", hook: "--aui-info", light: "#2456d6", dark: "#8ab4ff" },
];

const SHELL: [string, string][] = [
  ["--app-bg", "Window / chrome"],
  ["--app-sidebar", "Sidebar"],
  ["--app-editor", "Editor & preview"],
  ["--app-panel", "Terminal panel"],
  ["--app-statusbar", "Status bar"],
  ["--app-hover", "Row hover"],
  ["--app-selected", "Row selected"],
  ["--app-line", "Hairline"],
  ["--app-line-strong", "Hairline strong"],
  ["--app-ink", "Ink"],
  ["--app-text", "Text"],
  ["--app-muted", "Muted"],
  ["--app-faint", "Faint"],
  ["--app-accent", "Accent"],
  ["--app-danger", "Danger"],
  ["--app-success", "Success"],
  ["--app-warning", "Warning"],
];

const SYNTAX: { tok: string; light: string; dark: string; sample: string }[] = [
  { tok: "Comment", light: "#9a9a9a", dark: "#6e6e75", sample: "// reads the root dir" },
  { tok: "String", light: "#0b8576", dark: "#4fc3b4", sample: '"config.json"' },
  { tok: "Keyword", light: "#8a35d6", dark: "#cfaef5", sample: "func return if" },
  { tok: "Number", light: "#b25e00", dark: "#f2a15c", sample: "8192 true nil" },
  { tok: "Function", light: "#1f63c9", dark: "#7cb4ff", sample: "ListDir()" },
  { tok: "Plain / key", light: "#171717", dark: "#ededed", sample: "root.Path" },
];

const ICONS: [string, Icon][] = [
  ["Folder01Icon", Folder01Icon],
  ["Folder02Icon", Folder02Icon],
  ["FolderAddIcon", FolderAddIcon],
  ["File01Icon", File01Icon],
  ["FileScriptIcon", FileScriptIcon],
  ["Image01Icon", Image01Icon],
  ["CodeIcon", CodeIcon],
  ["ComputerTerminal01Icon", ComputerTerminal01Icon],
  ["Add01Icon", Add01Icon],
  ["Search01Icon", Search01Icon],
  ["Settings01Icon", Settings01Icon],
  ["Delete02Icon", Delete02Icon],
  ["Edit02Icon", Edit02Icon],
  ["Copy01Icon", Copy01Icon],
  ["Download01Icon", Download01Icon],
  ["RefreshIcon", RefreshIcon],
  ["SidebarLeftIcon", SidebarLeftIcon],
  ["LayoutTwoColumnIcon", LayoutTwoColumnIcon],
  ["ViewIcon", ViewIcon],
  ["MoreHorizontalIcon", MoreHorizontalIcon],
  ["ArrowDown01Icon", ArrowDown01Icon],
  ["Sun03Icon", Sun03Icon],
  ["Moon02Icon", Moon02Icon],
  ["TextBoldIcon", TextBoldIcon],
];

const TREE: TreeNode[] = [
  {
    id: "doc",
    label: "doc",
    icon: <I icon={Folder01Icon} />,
    openIcon: <I icon={Folder02Icon} />,
    children: [
      { id: "doc/PLAN.md", label: "PLAN.md", icon: <I icon={File01Icon} />, meta: "6 KB" },
      { id: "doc/DESIGN_SYSTEM.md", label: "DESIGN_SYSTEM.md", icon: <I icon={File01Icon} />, meta: "18 KB" },
      { id: "doc/component-schemas.md", label: "component-schemas.md", icon: <I icon={File01Icon} /> },
    ],
  },
  {
    id: "frontend",
    label: "frontend",
    icon: <I icon={Folder01Icon} />,
    openIcon: <I icon={Folder02Icon} />,
    children: [
      {
        id: "frontend/src",
        label: "src",
        icon: <I icon={Folder01Icon} />,
        openIcon: <I icon={Folder02Icon} />,
        children: [
          { id: "frontend/src/App.tsx", label: "App.tsx", icon: <I icon={FileScriptIcon} /> },
          { id: "frontend/src/main.tsx", label: "main.tsx", icon: <I icon={FileScriptIcon} /> },
          { id: "frontend/src/logo.png", label: "logo.png", icon: <I icon={Image01Icon} /> },
        ],
      },
      { id: "frontend/package.json", label: "package.json", icon: <I icon={CodeIcon} /> },
    ],
  },
  {
    id: "internal",
    label: "internal",
    icon: <I icon={Folder01Icon} />,
    openIcon: <I icon={Folder02Icon} />,
    children: [],
  },
  { id: "main.go", label: "main.go", icon: <I icon={CodeIcon} /> },
  { id: "app.go", label: "app.go", icon: <I icon={CodeIcon} /> },
  { id: "go.mod", label: "go.mod", icon: <I icon={File01Icon} /> },
];

const COMMANDS: CommandGroup[] = [
  {
    id: "suggestions",
    label: "Recent files",
    commands: [
      { id: "doc/PLAN.md", label: "PLAN.md", hint: "doc", icon: <I icon={File01Icon} /> },
      { id: "main.go", label: "main.go", hint: "", icon: <I icon={CodeIcon} /> },
      { id: "frontend/src/App.tsx", label: "App.tsx", hint: "frontend/src", icon: <I icon={FileScriptIcon} /> },
    ],
  },
  {
    id: "file",
    label: "File",
    commands: [
      { id: "new-file", label: "New file", icon: <I icon={Add01Icon} />, keys: ["mod", "N"], keywords: ["create"] },
      { id: "open-folder", label: "Open folder…", icon: <I icon={Folder01Icon} />, keys: ["mod", "O"] },
      { id: "save", label: "Save", icon: <I icon={Download01Icon} />, keys: ["mod", "S"] },
    ],
  },
  {
    id: "view",
    label: "View",
    commands: [
      { id: "toggle-sidebar", label: "Toggle sidebar", icon: <I icon={SidebarLeftIcon} />, keys: ["mod", "B"] },
      { id: "go-terminal", label: "Go to terminal", icon: <I icon={ComputerTerminal01Icon} />, keys: ["ctrl", "`"], keywords: ["shell", "tab"] },
      { id: "new-terminal", label: "New terminal", icon: <I icon={Add01Icon} />, keys: ["ctrl", "shift", "`"], keywords: ["shell", "tab"] },
      { id: "md-preview", label: "Toggle Markdown preview", icon: <I icon={ViewIcon} />, keys: ["mod", "shift", "V"], keywords: ["markdown"] },
    ],
  },
];

/* ---------------------------------------------------------------- layout helpers */

function Section({ id, n, title, lead, children }: { id: string; n: string; title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <section className="ds-section" id={id}>
      <div className="ds-section__head">
        <span className="ds-section__n">{n}</span>
        <h2>{title}</h2>
        {lead && <p className="ds-lead">{lead}</p>}
      </div>
      {children}
    </section>
  );
}

type Source = "vendored" | "rebuilt" | "new";
const SOURCE_TONE = { vendored: "neutral", rebuilt: "purple", new: "info" } as const;
const SOURCE_LABEL = { vendored: "affectUI · vendored", rebuilt: "Rebuilt from Pro spec", new: "New · house style" };

function Spec({
  name,
  file,
  source,
  use,
  props,
  children,
  wide,
}: {
  name: string;
  file: string;
  source: Source;
  use: string;
  props: string[];
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <article className="ds-spec" data-wide={wide || undefined} id={`c-${file}`}>
      <header className="ds-spec__head">
        <div>
          <h3>{name}</h3>
          <code className="ds-file">components/ui/{file}.tsx</code>
        </div>
        <Badge size="sm" tone={SOURCE_TONE[source]}>
          {SOURCE_LABEL[source]}
        </Badge>
      </header>
      <p className="ds-use">{use}</p>
      <div className="ds-stage">{children}</div>
      <div className="ds-props">
        {props.map((p) => (
          <code key={p}>{p}</code>
        ))}
      </div>
    </article>
  );
}

function Row({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="ds-row">
      {label && <span className="ds-row__label">{label}</span>}
      <div className="ds-row__items">{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------------- demos */

function PopoverDemo() {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <Button variant="secondary" icon={<I icon={File01Icon} size={18} />} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        File info
      </Button>
      <Popover open={open} onClose={() => setOpen(false)} title="PLAN.md" description="doc/PLAN.md" width={260}>
        <dl className="ds-dl">
          <dt>Size</dt>
          <dd>6.2 KB</dd>
          <dt>Modified</dt>
          <dd>Today, 18:04</dd>
          <dt>Encoding</dt>
          <dd>UTF-8 · LF</dd>
        </dl>
      </Popover>
    </span>
  );
}

function ButtonLoadingDemo() {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      loading={loading}
      icon={<I icon={Download01Icon} size={18} />}
      onClick={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1800);
      }}
    >
      {loading ? "Saving…" : "Save"}
    </Button>
  );
}

/* ---- one tab strip for files and terminals ---- */

type WsTab = TabItem & { kind: "file" | "terminal"; cwd?: string; lang?: string; sample?: "test" | "dev" };

const SHELL_NAME = "zsh";

/** The tab store in miniature: ordered list, active id, add / close / reorder across both kinds */
function useWorkspaceTabs(initial: WsTab[], first: string) {
  const [tabs, setTabs] = useState<WsTab[]>(initial);
  const [active, setActive] = useState<string | null>(first);
  const counter = useRef(0);
  const add = (kind: "file" | "terminal", cwd = "") => {
    const id = `${kind}-${++counter.current}`;
    const tab: WsTab =
      kind === "terminal"
        ? (() => {
            const n = tabs.filter((t) => t.kind === "terminal" && t.label.startsWith(SHELL_NAME)).length;
            return { id, kind, label: n ? `${SHELL_NAME} (${n + 1})` : SHELL_NAME, icon: ComputerTerminal01Icon, cwd: cwd || "~/workspaces/wp-go-desktop", title: cwd || "~/workspaces/wp-go-desktop", sample: "test" };
          })()
        : { id, kind, label: "Untitled-" + counter.current, icon: File01Icon, dirty: true, title: "Untitled", lang: "Plain text" };
    // New tabs open right after the active one
    setTabs((list) => {
      const at = list.findIndex((t) => t.id === active);
      const next = [...list];
      next.splice(at + 1, 0, tab);
      return next;
    });
    setActive(id);
  };
  const close = (id: string) => {
    setTabs((list) => {
      const at = list.findIndex((t) => t.id === id);
      const next = list.filter((t) => t.id !== id);
      if (id === active) setActive(next.length ? next[Math.min(at, next.length - 1)].id : null);
      return next;
    });
  };
  const reorder = (ids: string[]) => setTabs((list) => ids.map((id) => list.find((t) => t.id === id)!));
  return { tabs, active, setActive, add, close, reorder, current: tabs.find((t) => t.id === active) };
}

/** The "+" at the end of the strip */
function NewTabMenu({ onNew }: { onNew: (kind: "file" | "terminal") => void }) {
  return (
    <DropdownMenu
      align="end"
      aria-label="New tab"
      trigger={({ triggerProps }) => (
        <Tooltip content="New tab">
          <IconButton size="sm" variant="ghost" icon={Add01Icon} label="New tab" {...triggerProps} />
        </Tooltip>
      )}
      items={[
        { label: "New file", icon: File01Icon, shortcut: "⌘N", onSelect: () => onNew("file") },
        { label: "New terminal", icon: ComputerTerminal01Icon, shortcut: "⌃⇧`", onSelect: () => onNew("terminal") },
      ]}
    />
  );
}

/** Asks before closing a dirty file or a busy terminal – the same guards as the app */
function useCloseGuard(close: (id: string) => void) {
  const [pending, setPending] = useState<WsTab | null>(null);
  const request = (tab: WsTab) => (tab.dirty || tab.busy ? setPending(tab) : close(tab.id));
  const dialogs = (
    <>
      <AlertDialog
        open={!!pending?.busy}
        onOpenChange={(o) => !o && setPending(null)}
        danger
        title="Close terminal?"
        description={`“${pending?.label}” is still running and will be stopped.`}
        confirmLabel="Close"
        onConfirm={() => {
          if (pending) close(pending.id);
          setPending(null);
        }}
      />
      <Dialog
        size="sm"
        open={!!pending && !pending.busy}
        onOpenChange={(o) => !o && setPending(null)}
        title={`Save changes to ${pending?.label}?`}
        description="Your changes will be lost if you don't save them."
        footer={
          <>
            <Button variant="ghost" onClick={() => (pending && close(pending.id), setPending(null))}>
              Don't save
            </Button>
            <Button variant="secondary" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button onClick={() => (pending && close(pending.id), setPending(null), toast.success("Saved"))}>Save</Button>
          </>
        }
      />
    </>
  );
  return { request, dialogs };
}

const MD_MODES = [
  { value: "edit", icon: <I icon={Edit02Icon} size={14} />, ariaLabel: "Edit" },
  { value: "split", icon: <I icon={LayoutTwoColumnIcon} size={14} />, ariaLabel: "Split" },
  { value: "preview", icon: <I icon={ViewIcon} size={14} />, ariaLabel: "Preview" },
];

function TabsDemo() {
  const ws = useWorkspaceTabs(
    [
      { id: "plan", kind: "file", label: "PLAN.md", icon: File01Icon, title: "doc/PLAN.md", dirty: true },
      { id: "zsh", kind: "terminal", label: "zsh", icon: ComputerTerminal01Icon, title: "~/workspaces/wp-go-desktop", cwd: "~/workspaces/wp-go-desktop" },
      { id: "main", kind: "file", label: "main.go", icon: CodeIcon, title: "main.go" },
      { id: "dev", kind: "terminal", label: "npm run dev", icon: ComputerTerminal01Icon, title: "~/workspaces/wp-go-desktop/frontend", cwd: "~/workspaces/wp-go-desktop/frontend", busy: true },
    ],
    "plan",
  );
  const guard = useCloseGuard(ws.close);
  const cur = ws.current;
  return (
    <div className="ds-framed">
      <Tabs
        items={ws.tabs}
        value={ws.active}
        onChange={ws.setActive}
        onClose={(id) => guard.request(ws.tabs.find((t) => t.id === id)!)}
        onReorder={ws.reorder}
        actions={
          <>
            <NewTabMenu onNew={(k) => ws.add(k)} />
            {cur?.label.endsWith(".md") && <SegmentedControl size="sm" kind="tabs" aria-label="Markdown view" defaultValue="split" options={MD_MODES} />}
            <IconButton size="sm" variant="ghost" icon={MoreHorizontalIcon} label="More" />
          </>
        }
      />
      <div className="ds-tabs-body">
        {!cur ? (
          <Button variant="secondary" size="sm" onClick={() => ws.add("terminal")}>
            New terminal
          </Button>
        ) : cur.kind === "terminal" ? (
          <>
            <Badge size="sm" icon={ComputerTerminal01Icon}>
              Terminal
            </Badge>{" "}
            <b>{cur.label}</b> in <code>{cur.cwd}</code>
            {cur.busy ? " – a command is running, closing it asks first." : " – idle, closes right away."}
          </>
        ) : (
          <>
            <Badge size="sm" icon={File01Icon}>
              File
            </Badge>{" "}
            <b>{cur.title}</b>
            {cur.dirty ? " – unsaved: the dot turns into × on hover, closing asks first." : "."}
          </>
        )}
        <div className="ds-muted" style={{ marginTop: 8 }}>
          Files and terminals share one strip – drag to reorder across kinds, + opens either, middle-click or × closes, ←/→
          move.
        </div>
      </div>
      {guard.dialogs}
    </div>
  );
}

function CommandDialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title="Go to file"
      width={600}
      closeButton={false}
      trigger={
        <Button variant="secondary" icon={<I icon={Search01Icon} size={18} />}>
          Open as dialog (⌘P)
        </Button>
      }
    >
      <CommandMenu
        autoFocus
        groups={COMMANDS}
        onClose={() => setOpen(false)}
        onRun={(id) => {
          setOpen(false);
          toast(`Ran “${id}”`);
        }}
      />
    </Dialog>
  );
}

function ResizableDemo() {
  const [sizes, setSizes] = useState<number[]>([28, 72]);
  return (
    <div className="ds-resize">
      <ResizablePanelGroup direction="horizontal" onLayout={setSizes}>
        <ResizablePanel defaultSize={28} minSize={15} maxSize={50} collapsible>
          <div className="ds-pane ds-pane--dim">Sidebar · {Math.round(sizes[0] ?? 0)}%</div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={50} minSize={20}>
              <div className="ds-pane">Markdown editor</div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50} minSize={20}>
              <div className="ds-pane">Preview</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

function MotionDemo() {
  const [on, setOn] = useState(false);
  const items: [string, number, string][] = [
    ["Hover colour", 140, "ease"],
    ["Row glide", 180, "var(--app-ease)"],
    ["Enter (menu)", 220, "var(--app-ease)"],
    ["Pill / width", 320, "var(--app-ease)"],
    ["Button morph", 480, "cubic-bezier(0.25, 1, 0.5, 1)"],
  ];
  return (
    <div className="ds-motion">
      <div className="ds-curve">
        <svg viewBox="0 0 120 120" width="160" height="160" aria-label="cubic-bezier(0.22, 1, 0.36, 1)">
          <rect x="10" y="10" width="100" height="100" fill="none" stroke="var(--app-line)" />
          <path d="M10 110 C 32 10, 46 10, 110 10" fill="none" stroke="var(--app-accent)" strokeWidth="2.5" />
          <line x1="10" y1="110" x2="32" y2="10" stroke="var(--app-faint)" strokeDasharray="2 3" />
          <line x1="110" y1="10" x2="46" y2="10" stroke="var(--app-faint)" strokeDasharray="2 3" />
        </svg>
        <div>
          <b>--aui-ease</b>
          <code>cubic-bezier(0.22, 1, 0.36, 1)</code>
          <span className="ds-muted">Fast out, long soft settle. Used for every enter, glide and press.</span>
        </div>
      </div>
      <div className="ds-motion__lanes">
        {items.map(([name, ms, ease]) => (
          <div className="ds-lane" key={name}>
            <span className="ds-lane__name">
              {name} <span className="ds-muted">{ms}ms</span>
            </span>
            <span className="ds-lane__track">
              <span className="ds-lane__dot" style={{ transform: on ? "translateX(calc(100% * 0 + 220px))" : "none", transition: `transform ${ms * 2}ms ${ease}` }} />
            </span>
          </div>
        ))}
        <Row>
          <Button size="sm" variant="secondary" onClick={() => setOn((v) => !v)}>
            Play (2× slow)
          </Button>
          <span className="ds-muted">Press = scale(0.97) · reduced motion → 1ms</span>
        </Row>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- app mock */

function AppMock() {
  const ws = useWorkspaceTabs(
    [
      { id: "doc/PLAN.md", kind: "file", label: "PLAN.md", icon: File01Icon, dirty: true, title: "doc/PLAN.md", lang: "Markdown" },
      { id: "term-zsh", kind: "terminal", label: "zsh", icon: ComputerTerminal01Icon, title: "~/workspaces/wp-go-desktop", cwd: "~/workspaces/wp-go-desktop", sample: "test" },
      { id: "main.go", kind: "file", label: "main.go", icon: CodeIcon, title: "main.go", lang: "Go" },
      { id: "term-dev", kind: "terminal", label: "npm run dev", icon: ComputerTerminal01Icon, title: "~/workspaces/wp-go-desktop/frontend", cwd: "~/workspaces/wp-go-desktop/frontend", busy: true, sample: "dev" },
    ],
    "doc/PLAN.md",
  );
  const guard = useCloseGuard(ws.close);
  const [selected, setSelected] = useState<string | null>("doc/PLAN.md");
  const [mode, setMode] = useState("split");
  const cur = ws.current;
  const isMd = cur?.kind === "file" && cur.label.endsWith(".md");
  const crumbs =
    cur?.kind === "terminal"
      ? cur.cwd!.replace("~/workspaces/", "").split("/").map((label) => ({ label }))
      : cur
        ? [{ label: "wp-go-desktop" }, ...cur.title!.split("/").map((label) => ({ label }))]
        : [{ label: "wp-go-desktop" }];
  const openFile = (id: string, label: string) => {
    if (ws.tabs.some((t) => t.id === id)) return ws.setActive(id);
    toast("Opens as a tab in the app", { description: label });
  };
  return (
    <div className="mock">
      <div className="mock__title">
        <span className="mock__lights">
          <i />
          <i />
          <i />
        </span>
        <Breadcrumb separator="chevron" maxItems={4} items={crumbs} />
        <button className="mock__search" type="button">
          <I icon={Search01Icon} size={14} /> Search files and terminals <Kbd keys={["mod", "P"]} />
        </button>
        <span className="mock__title-actions">
          <Tooltip content="Settings" shortcut="⌘,">
            <IconButton size="sm" variant="ghost" icon={Settings01Icon} label="Settings" />
          </Tooltip>
        </span>
      </div>
      <div className="mock__body">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={24} minSize={14} collapsible>
            <aside className="mock__side">
              <div className="mock__side-head">
                <span>Explorer</span>
                <span>
                  <Tooltip content="New file" shortcut="⌘N">
                    <IconButton size="sm" variant="ghost" icon={Add01Icon} label="New file" onClick={() => ws.add("file")} />
                  </Tooltip>
                  <Tooltip content="New folder">
                    <IconButton size="sm" variant="ghost" icon={FolderAddIcon} label="New folder" />
                  </Tooltip>
                  <Tooltip content="Refresh">
                    <IconButton size="sm" variant="ghost" icon={RefreshIcon} label="Refresh" />
                  </Tooltip>
                </span>
              </div>
              <ScrollArea type="hover" fade style={{ flex: 1, minHeight: 0 }}>
                <ContextMenu
                  items={(target) => {
                    const row = target.closest(".ui-tv__item, [role=treeitem]");
                    const name = row?.querySelector(".ui-tv__label")?.textContent?.trim() || "doc";
                    return [
                      { label: "New file", icon: Add01Icon, shortcut: "⌘N", onSelect: () => ws.add("file") },
                      { label: "Rename", icon: Edit02Icon, shortcut: "↵" },
                      { label: "Copy path", icon: Copy01Icon },
                      { label: "Open in terminal", icon: ComputerTerminal01Icon, onSelect: () => ws.add("terminal", `~/workspaces/wp-go-desktop/${name}`) },
                      { label: "Delete", icon: Delete02Icon, danger: true, divider: true, shortcut: "⌘⌫", onSelect: () => toast("Moved to Trash", { description: name, action: { label: "Undo", onClick: () => toast.success("Restored") } }) },
                    ];
                  }}
                >
                  <div style={{ padding: "2px 6px" }}>
                    <TreeView
                      aria-label="Files"
                      items={TREE}
                      defaultExpanded={["doc"]}
                      selected={selected}
                      onSelect={(id, node) => {
                        setSelected(id);
                        if (!node.children) openFile(id, node.label);
                      }}
                    />
                  </div>
                </ContextMenu>
              </ScrollArea>
            </aside>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>
            <div className="mock__editor">
              <Tabs
                items={ws.tabs}
                value={ws.active}
                onChange={(id) => {
                  ws.setActive(id);
                  if (!id.startsWith("term")) setSelected(id);
                }}
                onClose={(id) => guard.request(ws.tabs.find((t) => t.id === id)!)}
                onReorder={ws.reorder}
                actions={
                  <>
                    <NewTabMenu onNew={(k) => ws.add(k)} />
                    {isMd && <SegmentedControl size="sm" kind="tabs" value={mode} onChange={setMode} aria-label="Markdown view" options={MD_MODES} />}
                    <DropdownMenu
                      align="end"
                      aria-label="Tab actions"
                      trigger={({ triggerProps }) => <IconButton size="sm" variant="ghost" icon={MoreHorizontalIcon} label="Tab actions" {...triggerProps} />}
                      items={
                        cur?.kind === "terminal"
                          ? [
                              { label: "Clear", shortcut: "⌘K" },
                              { label: "Rename tab", icon: Edit02Icon },
                              { label: "Copy cwd", icon: Copy01Icon },
                              { label: "Kill process", danger: true, divider: true, disabled: !cur.busy },
                              { label: "Close others", divider: true },
                            ]
                          : [
                              { label: "Copy path", icon: Copy01Icon, shortcut: "⌥⌘C" },
                              { label: "Reveal in tree", icon: Folder01Icon },
                              { label: "Close others", divider: true },
                              { label: "Close all", shortcut: "⌥⌘W" },
                            ]
                      }
                    />
                  </>
                }
              />
              <div className="mock__view">
                {!cur ? (
                  <EmptyState
                    bare
                    icon={File01Icon}
                    title="Nothing open"
                    text="Open a file or start a terminal – both open as tabs."
                    action={
                      <div style={{ display: "flex", gap: 8 }}>
                        <Button size="sm" onClick={() => ws.add("file")}>
                          New file
                        </Button>
                        <Button size="sm" variant="secondary" icon={<I icon={ComputerTerminal01Icon} size={16} />} onClick={() => ws.add("terminal")}>
                          New terminal
                        </Button>
                      </div>
                    }
                  />
                ) : cur.kind === "terminal" ? (
                  <TerminalSample variant={cur.sample ?? "test"} cwd={cur.cwd!} />
                ) : isMd ? (
                  <div className="mock__split">
                    {mode !== "preview" && <EditorSample />}
                    {mode !== "edit" && <ProseSample compact />}
                  </div>
                ) : cur.id === "main.go" ? (
                  <GoSample />
                ) : (
                  <div className="cm" style={{ color: "var(--app-faint)", paddingLeft: 58 }}>
                    Empty file
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <div className="mock__status">
        <span className="mock__path">~/workspaces/wp-go-desktop</span>
        {cur?.kind === "terminal" ? (
          <span className="mock__status-right">
            <Badge size="sm" tone="neutral" icon={ComputerTerminal01Icon}>
              {SHELL_NAME}
            </Badge>
            <Separator orientation="vertical" />
            <span>{cur.cwd!.replace("~/workspaces/wp-go-desktop", ".") || "."}</span>
            <Separator orientation="vertical" />
            <span>120 × 32</span>
            {cur.busy && (
              <Badge size="sm" tone="info" dot live>
                Running
              </Badge>
            )}
          </span>
        ) : cur ? (
          <span className="mock__status-right">
            <Badge size="sm" tone="neutral">
              {cur.lang ?? "Plain text"}
            </Badge>
            <Separator orientation="vertical" />
            <span>UTF-8</span>
            <span>LF</span>
            <Separator orientation="vertical" />
            <span>Ln 12, Col 4</span>
            {cur.dirty && (
              <Badge size="sm" tone="warning" dot>
                Unsaved
              </Badge>
            )}
          </span>
        ) : null}
      </div>
      {guard.dialogs}
    </div>
  );
}

/* ---------------------------------------------------------------- 3rd-party surface samples */

function EditorSample() {
  const lines = [
    ["h", "# Plan: Go Desktop Workspace App"],
    ["", ""],
    ["t", "A single-user desktop app that opens one **root directory**."],
    ["", ""],
    ["h", "## 1. Goals"],
    ["t", "- Pick a root directory; remember the last one."],
    ["t", "- File tree with live refresh."],
    ["l", "- See [the design system](DESIGN_SYSTEM.md)."],
    ["", ""],
    ["c", "```go"],
    ["c", "func (a *App) ListDir(rel string) ([]Entry, error)"],
    ["c", "```"],
  ];
  return (
    <div className="cm">
      {lines.map(([k, t], i) => (
        <div className="cm__line" data-active={i === 5 || undefined} key={i}>
          <span className="cm__gutter">{i + 1}</span>
          <span className={`cm__text tok-${k}`}>{t}</span>
        </div>
      ))}
    </div>
  );
}

function GoSample() {
  return (
    <div className="cm">
      {[
        <><span className="tok-kw">package</span> main</>,
        <></>,
        <><span className="tok-com">// ListDir returns the entries of a folder inside the root.</span></>,
        <><span className="tok-kw">func</span> (a *App) <span className="tok-fn">ListDir</span>(rel <span className="tok-kw">string</span>) ([]Entry, <span className="tok-kw">error</span>) {"{"}</>,
        <>{"\t"}p, err := a.ws.<span className="tok-fn">Resolve</span>(rel)</>,
        <>{"\t"}<span className="tok-kw">if</span> err != <span className="tok-num">nil</span> {"{"}</>,
        <>{"\t\t"}<span className="tok-kw">return</span> <span className="tok-num">nil</span>, fmt.<span className="tok-fn">Errorf</span>(<span className="tok-str">"list %q: %w"</span>, rel, err)</>,
        <>{"\t}"}</>,
        <>{"\t"}<span className="tok-kw">return</span> fsservice.<span className="tok-fn">List</span>(p, <span className="tok-num">8192</span>)</>,
        <>{"}"}</>,
      ].map((l, i) => (
        <div className="cm__line" data-active={i === 4 || undefined} key={i}>
          <span className="cm__gutter">{i + 1}</span>
          <span className="cm__text">{l}</span>
        </div>
      ))}
    </div>
  );
}

function TerminalSample({ variant = "test", cwd = "~/workspaces/wp-go-desktop" }: { variant?: "test" | "dev"; cwd?: string }) {
  const dir = cwd.split("/").pop();
  const prompt = (
    <>
      <span className="x-green">nnminh@mac</span> <span className="x-blue">{dir}</span> <span className="x-magenta">main</span> %{" "}
    </>
  );
  if (variant === "dev")
    return (
      <div className="xterm">
        <div>{prompt}npm run dev</div>
        <div> </div>
        <div>&gt; wp-go-desktop@0.1.0 dev</div>
        <div>&gt; vite</div>
        <div> </div>
        <div>
          {"  "}
          <span className="x-green">VITE v6.2.0</span> ready in <b>412</b> ms
        </div>
        <div> </div>
        <div>
          {"  "}
          <span className="x-green">➜</span> {" "}<b>Local</b>:{"   "}
          <span className="x-blue">http://localhost:5173/</span>
        </div>
        <div>
          {"  "}
          <span className="x-faint">➜  Network: use --host to expose</span>
        </div>
        <div>
          <span className="x-faint">18:04:31</span> <span className="x-blue">[vite]</span> hmr update /src/App.tsx
        </div>
        <div>
          <span className="x-faint">18:04:52</span> <span className="x-blue">[vite]</span> hmr update /src/components/ui/tabs.tsx
        </div>
        <span className="x-cursor" />
      </div>
    );
  return (
    <div className="xterm">
      <div>{prompt}go test ./internal/...</div>
      <div>
        <span className="x-green">ok</span>  {"  "}wp-go-desktop/internal/workspace{"   "}0.142s
      </div>
      <div>
        <span className="x-green">ok</span>  {"  "}wp-go-desktop/internal/fsservice{"   "}0.388s
      </div>
      <div>
        <span className="x-red">FAIL</span> wp-go-desktop/internal/terminal{"    "}<span className="x-yellow">pty: resize on closed session</span>
      </div>
      <div>
        {prompt}
        <span className="x-cursor" />
      </div>
    </div>
  );
}

function ProseSample({ compact }: { compact?: boolean }) {
  return (
    <ScrollArea type="hover" className="md-wrap" style={{ flex: 1, minWidth: 0 }}>
      <article className="md-prose" data-compact={compact || undefined}>
        <h1>Plan: Go Desktop Workspace App</h1>
        <p>
          A single-user desktop app that opens one <strong>root directory</strong> and lets the user browse, view and edit
          files. See <a href="#app">the app composition</a>.
        </p>
        <h2>1. Goals</h2>
        <ul>
          <li>Pick a root directory; remember the last one.</li>
          <li>
            File tree with <code>fsnotify</code> live refresh.
          </li>
          <li className="task">
            <input type="checkbox" checked readOnly /> Markdown preview
          </li>
          <li className="task">
            <input type="checkbox" readOnly /> Integrated terminal
          </li>
        </ul>
        <blockquote>Every path is resolved inside the root – nothing escapes the workspace.</blockquote>
        <CodeBlock
          language="ts"
          filename="api.ts"
          code={`// Bound Go methods, generated by Wails\nexport function ListDir(rel: string): Promise<Entry[]>;\nexport function WriteFile(rel: string, text: string, expectedModTime: number): Promise<number>;`}
          copyable
        />
        {!compact && (
          <>
            <h3>Milestones</h3>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Milestone</th>
                  <th>Done when</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>M1</td>
                  <td>Workspace + tree</td>
                  <td>Can open a dir and browse it</td>
                </tr>
                <tr>
                  <td>M3</td>
                  <td>Markdown preview</td>
                  <td>
                    <code>.md</code> renders live, safely
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </article>
    </ScrollArea>
  );
}

/* ---------------------------------------------------------------- page */

function Page() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const asked = new URLSearchParams(location.search).get("theme");
    if (asked === "light" || asked === "dark") return asked;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [active, setActive] = useState("overview");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Scroll-spy for the left nav
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-30% 0px -65% 0px" },
    );
    NAV.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <div className="ds">
      <nav className="ds-nav" aria-label="Sections">
        <div className="ds-brand">
          <span className="ds-logo">
            <I icon={ComputerTerminal01Icon} size={16} />
          </span>
          <div>
            <b>wp-go-desktop</b>
            <span>Design system</span>
          </div>
        </div>
        <ul>
          {NAV.map(([id, label], i) => (
            <li key={id}>
              <a href={`#${id}`} data-active={active === id || undefined}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {label}
              </a>
            </li>
          ))}
        </ul>
        <div className="ds-nav__foot">
          <SegmentedControl
            size="sm"
            fullWidth
            aria-label="Theme"
            value={theme}
            onChange={setTheme}
            options={[
              { value: "light", label: "Light", icon: <I icon={Sun03Icon} size={14} /> },
              { value: "dark", label: "Dark", icon: <I icon={Moon02Icon} size={14} /> },
            ]}
          />
        </div>
      </nav>

      <main className="ds-main">
        {/* 01 */}
        <section className="ds-hero" id="overview">
          <Badge tone="info" dot>
            v1 · React 19 · affectUI
          </Badge>
          <h1>wp-go-desktop design system</h1>
          <p className="ds-lead">
            The visual language of a single-user Go desktop app for browsing, editing and previewing files with an
            integrated terminal. Built on affectUI: quiet neutrals, hairline edges, one surface step between chrome and
            content, and soft, fast motion. Everything on this page is rendered with the real components.
          </p>
          <div className="ds-stats">
            {[
              ["28", "components"],
              ["25", "vendored from affectUI (MIT)"],
              ["2", "rebuilt from Pro spec"],
              ["1", "new in house style"],
            ].map(([n, l]) => (
              <div className="ds-stat" key={l}>
                <b>{n}</b>
                <span>{l}</span>
              </div>
            ))}
          </div>
          <div className="ds-hero__actions">
            <Button iconRight={<I icon={ArrowDown01Icon} size={18} />} onClick={() => document.getElementById("components")?.scrollIntoView()}>
              Browse components
            </Button>
            <Button variant="secondary" onClick={() => document.getElementById("app")?.scrollIntoView()}>
              See the app
            </Button>
            <span className="ds-muted">
              Toggle theme with the switch in the sidebar – components follow <code>data-theme</code> on <code>&lt;html&gt;</code>.
            </span>
          </div>
        </section>

        {/* 02 */}
        <Section id="principles" n="02" title="Principles" lead="How the system looks and how every component is built.">
          <div className="ds-grid ds-grid--3">
            {[
              ["Quiet chrome, loud content", "Chrome sits on #fafafa / #111113, content on #fff / #161618. One step, a 1px hairline between – no shadows on fixed regions."],
              ["Elevation means floating", "Only menus, popovers, dialogs and toasts cast shadows. A 1px edge ring is part of every shadow."],
              ["Motion that settles", "One curve – cubic-bezier(.22,1,.36,1). Highlights glide instead of jumping; nothing bounces."],
              ["One file per component", "Self-contained .tsx, styles injected with React 19 <style precedence>. No Tailwind, no CSS files."],
              ["Two-level variables", "--ui-<abbr>-* locals fall back to global --aui-* hooks. Theme globally or per component."],
              ["Data attributes for state", "Variants and states are data-variant, data-size, data-active – never extra class names."],
              ["Keyboard first", "Roving tabindex, arrows/Home/End, visible focus rings, shortcuts surfaced in tooltips and menus."],
              ["Accessible by default", "Native elements, labelled regions, live regions for async results, forced-colors fallbacks."],
              ["Dark is a peer, not a filter", "Every component has hand-tuned dark values; the primary button inverts to a light chip."],
            ].map(([t, d]) => (
              <Card key={t}>
                <CardHeader title={t} description={d} />
              </Card>
            ))}
          </div>
        </Section>

        {/* 03 */}
        <Section
          id="color"
          n="03"
          title="Color"
          lead={
            <>
              The stock affectUI palette every component falls back to. The <code>--aui-*</code> hooks are left unset so each
              component keeps its own fine-tuned values; set them to re-theme everything at once.
            </>
          }
        >
          <h4 className="ds-h4">Core palette – light / dark</h4>
          <div className="ds-swatches">
            {PALETTE.map((c) => (
              <div className="ds-swatch" key={c.role}>
                <div className="ds-swatch__chips">
                  <span style={{ background: c.light }} title={c.light} />
                  <span style={{ background: c.dark }} title={c.dark} />
                </div>
                <b>{c.role}</b>
                <code>{c.hook}</code>
                <span className="ds-swatch__vals">
                  {c.light} · {c.dark}
                </span>
              </div>
            ))}
          </div>

          <h4 className="ds-h4">App-shell tokens (live – follow the theme switch)</h4>
          <div className="ds-shell-swatches">
            {SHELL.map(([v, l]) => (
              <div className="ds-shell" key={v}>
                <span style={{ background: `var(${v})` }} />
                <div>
                  <b>{l}</b>
                  <code>{v}</code>
                </div>
              </div>
            ))}
          </div>

          <h4 className="ds-h4">Surfaces – one step from chrome to content</h4>
          <div className="ds-surfaces">
            <div className="ds-surface" style={{ background: "var(--app-bg)" }}>
              <span>Chrome</span>
              <div className="ds-surface" style={{ background: "var(--app-editor)", boxShadow: "0 0 0 1px var(--app-line)" }}>
                <span>Content</span>
                <div className="ds-surface ds-surface--float">
                  <span>Overlay (floats, casts shadow)</span>
                </div>
              </div>
            </div>
          </div>

          <h4 className="ds-h4">Status colours in use</h4>
          <Row>
            <Badge tone="neutral">Neutral</Badge>
            <Badge tone="info">Info</Badge>
            <Badge tone="success" dot>
              Saved
            </Badge>
            <Badge tone="warning" dot>
              Unsaved
            </Badge>
            <Badge tone="danger">Conflict</Badge>
            <Badge tone="purple">Pro</Badge>
          </Row>

          <h4 className="ds-h4">Syntax palette – shared by Code Block, CodeMirror and highlight.js</h4>
          <div className="ds-syntax">
            {SYNTAX.map((s) => (
              <div className="ds-syntax__row" key={s.tok}>
                <b>{s.tok}</b>
                <code style={{ color: theme === "dark" ? s.dark : s.light }}>{s.sample}</code>
                <span className="ds-muted">
                  {s.light} · {s.dark}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* 04 */}
        <Section id="typography" n="04" title="Typography" lead="Inter for the interface, the system mono for code and the terminal. Two weights in chrome.">
          <div className="ds-type">
            {[
              ["15px / 500", "Large button · command field", 15, 500],
              ["14px / 500", "Inputs · md buttons", 14, 500],
              ["13.5px / 400", "Body · menu rows (base)", 13.5, 400],
              ["12.5px / 400", "Descriptions · small controls", 12.5, 400],
              ["12px / 500", "Group headings · meta · status bar", 12, 500],
              ["11px / 500", "Keycaps", 11, 500],
            ].map(([spec, use, size, w]) => (
              <div className="ds-type__row" key={spec as string}>
                <span className="ds-type__spec">{spec}</span>
                <span style={{ fontSize: size as number, fontWeight: w as number, letterSpacing: "-0.01em" }}>Open folder, edit, preview</span>
                <span className="ds-muted">{use}</span>
              </div>
            ))}
            <div className="ds-type__row">
              <span className="ds-type__spec">13px / 20 mono</span>
              <span style={{ fontFamily: "var(--app-font-mono)", fontSize: 13 }}>func ListDir(rel string) ([]Entry, error)</span>
              <span className="ds-muted">Editor · terminal · inline code</span>
            </div>
          </div>
          <div className="ds-grid ds-grid--2" style={{ marginTop: 16 }}>
            <Card>
              <CardHeader title="Font stacks" />
              <CardContent>
                <p className="ds-mono-sm">"Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto</p>
                <p className="ds-mono-sm">ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader title="Rules" />
              <CardContent>
                <ul className="ds-list">
                  <li>Weights: 400 body, 500 labels / active / titles; 600 only in Markdown headings.</li>
                  <li>Tracking −0.01em on labels; +0.02em on keycaps.</li>
                  <li>One line per row – long names end in … with the full text on hover.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* 05 */}
        <Section id="shape" n="05" title="Radius, elevation & spacing">
          <h4 className="ds-h4">Radius</h4>
          <Row>
            {[
              [5, "sm · keycaps"],
              [7, "sm+ · small chips"],
              [9, "rows (sm + 4)"],
              [10, "md · inputs, sm buttons"],
              [12, "md+ · buttons"],
              [14, "lg · menus, toasts"],
              [16, "lg+ · dialogs, command"],
            ].map(([r, l]) => (
              <div className="ds-radius" key={l}>
                <span className="ds-radius__shape" style={{ borderRadius: r as number }} />
                <b>{r}px</b>
                <span className="ds-muted">{l}</span>
              </div>
            ))}
          </Row>
          <h4 className="ds-h4">Elevation</h4>
          <div className="ds-grid ds-grid--4">
            {[
              ["0 · Flat", "Fixed regions", "0 0 0 1px var(--app-line)"],
              ["1 · Raised", "Secondary button, pill", "0 0 0 .5px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.08), 0 2px 8px -2px rgba(0,0,0,.06)"],
              ["2 · Popover", "Menus, tooltips, toasts", "0 0 0 1px rgba(0,0,0,.06), 0 18px 40px -12px rgba(0,0,0,.18), 0 4px 12px -4px rgba(0,0,0,.06)"],
              ["3 · Dialog", "Modal over a scrim", "0 0 0 1px rgba(0,0,0,.06), 0 24px 64px -16px rgba(0,0,0,.28)"],
            ].map(([t, d, s]) => (
              <div className="ds-elev" key={t} style={{ boxShadow: s }}>
                <b>{t}</b>
                <span className="ds-muted">{d}</span>
              </div>
            ))}
          </div>
          <h4 className="ds-h4">Spacing – 4px grid</h4>
          <div className="ds-space">
            {[4, 8, 12, 16, 20, 24, 32, 40].map((n) => (
              <div key={n}>
                <span style={{ width: n, height: n }} />
                <code>{n}</code>
              </div>
            ))}
          </div>
          <h4 className="ds-h4">Control heights</h4>
          <Row>
            <Button size="sm" variant="secondary">
              sm 32
            </Button>
            <Button size="md" variant="secondary">
              md 40
            </Button>
            <Button size="lg" variant="secondary">
              lg 48
            </Button>
            <Separator orientation="vertical" />
            <SegmentedControl size="sm" options={[{ value: "a", label: "26" }, { value: "b", label: "sm" }]} />
            <SegmentedControl size="md" options={[{ value: "a", label: "30" }, { value: "b", label: "md" }]} />
            <SegmentedControl size="lg" options={[{ value: "a", label: "36" }, { value: "b", label: "lg" }]} />
          </Row>
        </Section>

        {/* 06 */}
        <Section id="motion" n="06" title="Motion" lead="One easing curve, short durations, nothing that bounces. Everything collapses to 1ms under prefers-reduced-motion.">
          <MotionDemo />
        </Section>

        {/* 07 */}
        <Section id="icons" n="07" title="Icons" lead="Hugeicons Free (MIT). Pass the data object – icon={File01Icon} – and the component draws it inline. 1.5px stroke; 16px in rows, 18px in buttons.">
          <div className="ds-icons">
            {ICONS.map(([n, ic]) => (
              <div className="ds-icon" key={n}>
                <I icon={ic} size={20} />
                <code>{n.replace("Icon", "")}</code>
              </div>
            ))}
          </div>
        </Section>

        {/* 08 */}
        <Section id="components" n="08" title="Components" lead="Each card shows the live component, where the app uses it and its key props. Full schemas: doc/component-schemas.md.">
          <h4 className="ds-h4 ds-group">Actions</h4>
          <div className="ds-specs">
            <Spec name="Button" file="button" source="vendored" use="Save, Overwrite, Delete, Open folder. Primary is a dark gradient chip that inverts in dark mode." props={['variant: "primary" | "secondary" | "ghost" | "destructive"', 'size: "sm" | "md" | "lg"', "loading", "icon", "iconRight"]} wide>
              <Row label="Variants">
                <Button>Save changes</Button>
                <Button variant="secondary">Reload</Button>
                <Button variant="ghost">Don't save</Button>
                <Button variant="destructive" icon={<I icon={Delete02Icon} size={18} />}>
                  Delete
                </Button>
              </Row>
              <Row label="Sizes">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="md" variant="secondary" icon={<I icon={Add01Icon} size={18} />} aria-label="Add" />
              </Row>
              <Row label="States">
                <ButtonLoadingDemo />
                <Button disabled>Disabled</Button>
                <Button variant="secondary" iconRight={<I icon={ArrowDown01Icon} size={18} />}>
                  With right icon
                </Button>
              </Row>
            </Spec>

            <Spec name="Icon Button" file="icon-button" source="vendored" use="Toolbar actions in the sidebar and the tab strip (+ new tab, … tab actions). Always paired with a Tooltip." props={["icon", "label (required)", 'variant: "ghost" | "secondary" | "primary"', 'size: "sm" | "md"', "pressed"]}>
              <Row label="Ghost">
                <IconButton icon={Add01Icon} label="New file" />
                <IconButton icon={FolderAddIcon} label="New folder" />
                <IconButton icon={RefreshIcon} label="Refresh" />
                <IconButton icon={SidebarLeftIcon} label="Toggle sidebar" pressed />
              </Row>
              <Row label="Other">
                <IconButton variant="secondary" icon={Settings01Icon} label="Settings" />
                <IconButton variant="primary" icon={Search01Icon} label="Search" />
                <IconButton size="sm" icon={MoreHorizontalIcon} label="More" />
              </Row>
            </Spec>

            <Spec name="Toggle Group" file="toggle-group" source="vendored" use="Independent on/off options – e.g. editor toggles (word wrap, whitespace) or formatting." props={["items: { value, label?, icon?, ariaLabel? }[]", 'type: "multiple" | "single"', 'variant: "tray" | "buttons"', "size"]}>
              <Row label="Tray">
                <ToggleGroup
                  aria-label="Formatting"
                  defaultValue={["bold"]}
                  items={[
                    { value: "bold", icon: <I icon={TextBoldIcon} size={16} />, ariaLabel: "Bold" },
                    { value: "italic", icon: <I icon={TextItalicIcon} size={16} />, ariaLabel: "Italic" },
                    { value: "underline", icon: <I icon={TextUnderlineIcon} size={16} />, ariaLabel: "Underline" },
                  ]}
                />
              </Row>
              <Row label="Buttons">
                <ToggleGroup
                  variant="buttons"
                  aria-label="Editor"
                  defaultValue={["wrap"]}
                  items={[
                    { value: "wrap", label: "Word wrap" },
                    { value: "ws", label: "Whitespace" },
                    { value: "min", label: "Minimap" },
                  ]}
                />
              </Row>
            </Spec>

            <Spec name="Dropdown Menu" file="dropdown-menu" source="vendored" use="The “…” overflow menu on the tab strip and file actions. A soft highlight glides between rows." props={["trigger: ({ triggerProps }) => ReactNode", "items: { label, icon?, shortcut?, danger?, divider?, checked?, submenu? }[]", 'align', "title"]}>
              <Row>
                <DropdownMenu
                  title="Tab actions"
                  trigger={({ triggerProps }) => (
                    <Button variant="secondary" iconRight={<I icon={ArrowDown01Icon} size={18} />} {...triggerProps}>
                      Actions
                    </Button>
                  )}
                  items={[
                    { label: "Copy path", icon: Copy01Icon, shortcut: "⌥⌘C" },
                    { label: "Reveal in tree", icon: Folder01Icon },
                    { label: "Word wrap", checked: true, type: "checkbox", keepOpen: true },
                    { label: "Open with", icon: File01Icon, submenu: [{ label: "System app" }, { label: "Finder" }] },
                    { label: "Close others", divider: true },
                    { label: "Close all", shortcut: "⌥⌘W" },
                    { label: "Delete file", icon: Delete02Icon, danger: true, divider: true },
                  ]}
                />
              </Row>
            </Spec>

            <Spec name="Context Menu" file="context-menu" source="vendored" use="Right-click on tree rows, tabs and the editor. One menu covers a whole list via items(target)." props={["children: ReactElement", "items | (target) => items", "title", "width"]}>
              <ContextMenu
                title="PLAN.md"
                items={[
                  { label: "Rename", icon: Edit02Icon, shortcut: "↵" },
                  { label: "Copy path", icon: Copy01Icon },
                  { label: "Reveal in terminal", icon: ComputerTerminal01Icon },
                  { label: "Delete", icon: Delete02Icon, danger: true, divider: true, shortcut: "⌘⌫" },
                ]}
              >
                <div className="ds-dropzone">Right-click (or Shift+F10) here</div>
              </ContextMenu>
            </Spec>
          </div>

          <h4 className="ds-h4 ds-group">Navigation</h4>
          <div className="ds-specs">
            <Spec name="Tabs" file="tabs" source="new" use="ONE strip for files and terminals – a terminal is just another tab. Dirty dot turns into × on hover; busy terminals spin; a 2px line glides to the open tab." props={["items: { id, label, icon?, title?, dirty?, busy?, closable? }[]", "value / onChange", "onClose(id, item)", "onReorder(ids)", 'size: "sm" | "md"', "actions"]} wide>
              <TabsDemo />
            </Spec>

            <Spec name="Segmented Control" file="segmented-control" source="vendored" use="Markdown Edit / Split / Preview (kind=tabs), theme switch. A raised pill glides between options." props={["options: { value, label?, icon?, count?, badge? }[]", 'variant: "tray" | "underline"', 'kind: "radio" | "tabs"', "size", "fullWidth"]}>
              <Row label="Tray">
                <SegmentedControl
                  kind="tabs"
                  aria-label="Markdown view"
                  defaultValue="split"
                  options={[
                    { value: "edit", label: "Edit", icon: <I icon={Edit02Icon} size={15} /> },
                    { value: "split", label: "Split", icon: <I icon={LayoutTwoColumnIcon} size={15} /> },
                    { value: "preview", label: "Preview", icon: <I icon={ViewIcon} size={15} /> },
                  ]}
                />
              </Row>
              <Row label="Underline">
                <SegmentedControl
                  variant="underline"
                  aria-label="Settings section"
                  options={[
                    { value: "general", label: "General" },
                    { value: "editor", label: "Editor" },
                    { value: "terminal", label: "Terminal", count: 2 },
                  ]}
                />
              </Row>
            </Spec>

            <Spec name="Tree View" file="tree-view" source="vendored" use="The file tree. Lazy branches (children: []), guides, type-ahead, arrow-key navigation." props={["items: TreeNode[] { id, label, icon?, openIcon?, meta?, children? }", "expanded / onExpandedChange", "selected / onSelect", "guides", "emptyText"]}>
              <div className="ds-framed ds-tree">
                <TreeView aria-label="Files" items={TREE} defaultExpanded={["doc", "frontend", "frontend/src"]} defaultSelected="doc/PLAN.md" />
              </div>
            </Spec>

            <Spec name="Breadcrumb" file="breadcrumb" source="vendored" use="The path above the editor; a crumb reveals that folder in the tree. Collapses the middle when long." props={["items: { label, href?, onClick?, icon? }[]", 'separator: "slash" | "chevron" | ReactNode', "maxItems"]}>
              <Row label="Chevron">
                <Breadcrumb separator="chevron" items={[{ label: "wp-go-desktop", icon: Folder01Icon }, { label: "frontend" }, { label: "src" }, { label: "App.tsx" }]} />
              </Row>
              <Row label="Collapsed">
                <Breadcrumb
                  maxItems={3}
                  items={[{ label: "wp-go-desktop" }, { label: "frontend" }, { label: "src" }, { label: "components" }, { label: "ui" }, { label: "tabs.tsx" }]}
                />
              </Row>
            </Spec>

            <Spec name="Command Menu" file="command-menu" source="rebuilt" use="⌘P quick-open and ⌘⇧P command palette. ↑/↓ move, Tab jumps groups, ⌘1–⌘5 run recents, Esc clears then closes." props={["groups: { id, label, commands: { id, label, hint?, icon? | logo?, keys?, keywords? }[] }[]", "onRun(id, query?)", "onClose", "placeholder", "autoFocus"]} wide>
              <CommandMenu groups={COMMANDS} onRun={(id, q) => toast(id === "ask" ? `Ask: ${q}` : `Ran “${id}”`)} />
              <Row>
                <CommandDialogDemo />
                <span className="ds-muted">Type “term” or “zzz” to see filtering and the fallback row.</span>
              </Row>
            </Spec>
          </div>

          <h4 className="ds-h4 ds-group">Inputs</h4>
          <div className="ds-specs">
            <Spec name="Text Field" file="text-field" source="vendored" use="Rename / new file inline, tree filter, numeric settings." props={["label", "hint", "error", "prefix", "suffix", 'size: "sm" | "md" | "lg"', "clearable", "copyable", "counter"]}>
              <div className="ds-stack">
                <TextField label="File name" defaultValue="PLAN.md" hint="Saved in doc/" />
                <TextField size="sm" placeholder="Filter files" prefix={<I icon={Search01Icon} size={15} />} clearable />
                <TextField label="New folder" defaultValue="doc" error="A folder with this name already exists" />
              </div>
            </Spec>

            <Spec name="Select" file="select" source="vendored" use="Settings: theme, shell, font." props={["options: { value, label, description?, icon? }[]", "value / onChange", "label", "hint", "size"]}>
              <div className="ds-stack">
                <Select
                  label="Theme"
                  defaultValue="system"
                  options={[
                    { value: "system", label: "System", description: "Follow macOS appearance" },
                    { value: "light", label: "Light" },
                    { value: "dark", label: "Dark" },
                  ]}
                />
                <Select
                  label="Shell"
                  hint="Used for new terminals"
                  defaultValue="zsh"
                  options={[
                    { value: "zsh", label: "/bin/zsh" },
                    { value: "bash", label: "/bin/bash" },
                    { value: "fish", label: "/opt/homebrew/bin/fish" },
                  ]}
                />
              </div>
            </Spec>

            <Spec name="Switch" file="switch" source="vendored" use="Boolean settings – the settings-row look uses placement=end." props={["label", "description", 'placement: "start" | "end"', 'size: "sm" | "md"', "checked / onChange"]}>
              <div className="ds-stack">
                <Switch label="Show hidden files" description="Dotfiles such as .git and .env" placement="end" />
                <Switch label="Word wrap" defaultChecked placement="end" />
                <Switch label="Compact" size="sm" />
              </div>
            </Spec>

            <Spec name="Form Field" file="form-field" source="vendored" use="Wraps any control with label, hint, error and ids – settings rows." props={["label", "hint", "error", "required", "optional", "counter", "children: element | (control) => node"]}>
              <FormField label="Font size" hint="Editor and terminal, in px" required>
                <input className="ds-native" type="number" defaultValue={13} min={10} max={24} />
              </FormField>
            </Spec>
          </div>

          <h4 className="ds-h4 ds-group">Overlays & feedback</h4>
          <div className="ds-specs">
            <Spec name="Dialog / AlertDialog" file="dialog" source="vendored" use="Unsaved changes, save conflict, delete confirmation, settings." props={["title", "description", "footer", "trigger", "open / onOpenChange", 'size: "sm" | "md" | "lg"', "AlertDialog: confirmLabel, danger, onConfirm"]}>
              <Row>
                <Dialog
                  size="sm"
                  title="Save changes to PLAN.md?"
                  description="Your changes will be lost if you don't save them."
                  trigger={<Button variant="secondary">Unsaved changes</Button>}
                  footer={
                    <>
                      <Button variant="ghost">Don't save</Button>
                      <Button variant="secondary">Cancel</Button>
                      <Button>Save</Button>
                    </>
                  }
                />
                <Dialog
                  size="sm"
                  title="PLAN.md changed on disk"
                  description="Another program modified this file after you opened it."
                  trigger={<Button variant="secondary">Save conflict</Button>}
                  footer={
                    <>
                      <Button variant="secondary">Reload</Button>
                      <Button variant="destructive">Overwrite</Button>
                    </>
                  }
                />
                <AlertDialog
                  danger
                  title="Delete PLAN.md?"
                  description="It will be moved to the Trash."
                  confirmLabel="Delete"
                  onConfirm={() => {
                    toast("Moved to Trash", { description: "doc/PLAN.md", action: { label: "Undo", onClick: () => toast.success("Restored") } });
                  }}
                  trigger={<Button variant="destructive">Delete file</Button>}
                />
                <Dialog
                  size="md"
                  title="Settings"
                  description="Applies to this workspace."
                  trigger={<Button variant="ghost" icon={<I icon={Settings01Icon} size={18} />}>Settings</Button>}
                >
                  <div className="ds-stack">
                    <Select label="Theme" defaultValue="system" options={[{ value: "system", label: "System" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
                    <Switch label="Show hidden files" placement="end" />
                    <Switch label="Word wrap" placement="end" defaultChecked />
                  </div>
                </Dialog>
              </Row>
            </Spec>

            <Spec name="Toaster" file="toaster" source="rebuilt" use="Saved, moved to Trash (Undo), file changed on disk, background saves. Stack fans out on hover; F8 focuses." props={['position', "duration = 4000", "visibleToasts = 3", 'hotkey = "F8"', "toast() · .success · .error · .info · .loading · .promise · .dismiss"]}>
              <Row>
                <Button size="sm" variant="secondary" onClick={() => toast.success("Saved", { description: "doc/PLAN.md" })}>
                  Success
                </Button>
                <Button size="sm" variant="secondary" onClick={() => toast("Moved to Trash", { description: "main.go", action: { label: "Undo", onClick: () => toast.success("Restored") } })}>
                  With action
                </Button>
                <Button size="sm" variant="secondary" onClick={() => toast.error("Couldn't save", { description: "Permission denied: doc/PLAN.md" })}>
                  Error
                </Button>
                <Button size="sm" variant="secondary" onClick={() => toast.info("PLAN.md changed on disk", { description: "Reloaded – you had no unsaved changes." })}>
                  Info
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    toast.promise(new Promise((r) => setTimeout(r, 1600)), {
                      loading: { title: "Saving large file…", description: "logs/build.log · 12 MB" },
                      success: { title: "Saved", description: "logs/build.log" },
                      error: "Couldn't save",
                    })
                  }
                >
                  Promise
                </Button>
              </Row>
            </Spec>

            <Spec name="Tooltip" file="tooltip" source="vendored" use="Every icon-only button, with its shortcut. Neighbouring tooltips open instantly once one is shown." props={["content", "shortcut", 'side: "top" | "bottom" | "left" | "right"', "align", "delay = 500"]}>
              <Row>
                <Tooltip content="New file" shortcut="⌘N">
                  <IconButton icon={Add01Icon} label="New file" />
                </Tooltip>
                <Tooltip content="Toggle sidebar" shortcut="⌘B">
                  <IconButton icon={SidebarLeftIcon} label="Toggle sidebar" />
                </Tooltip>
                <Tooltip content="New terminal tab" shortcut="⌃⇧`" side="bottom">
                  <IconButton icon={ComputerTerminal01Icon} label="New terminal tab" />
                </Tooltip>
              </Row>
            </Spec>

            <Spec name="Popover" file="popover" source="vendored" use="Small inline panels – file info, quick settings." props={["open", "onClose", "title", "description", 'side', 'align', "width", "anchor"]}>
              <PopoverDemo />
            </Spec>

            <Spec name="Empty State" file="empty-state" source="vendored" use="No folder open, nothing open in the editor, empty folder, binary file." props={["title", "text", "action", "icon", "bare", "tall"]} wide>
              <div className="ds-grid ds-grid--2">
                <EmptyState
                  icon={Folder01Icon}
                  title="No folder open"
                  text="Open a folder to browse and edit its files."
                  action={<Button icon={<I icon={Folder01Icon} size={18} />}>Open folder…</Button>}
                />
                <EmptyState
                  icon={Image01Icon}
                  title="This file can't be shown"
                  text="logo.icns is a binary file."
                  action={<Button variant="secondary">Open with system app</Button>}
                />
              </div>
            </Spec>
          </div>

          <h4 className="ds-h4 ds-group">Display & status</h4>
          <div className="ds-specs">
            <Spec name="Badge" file="badge" source="vendored" use="Status-bar chips: language, encoding, read-only, unsaved, saved." props={['tone: "neutral" | "info" | "success" | "warning" | "danger" | "purple"', 'size: "sm" | "md"', "dot", "live", "count", "icon"]}>
              <Row label="Tones">
                <Badge>Markdown</Badge>
                <Badge tone="info">UTF-8</Badge>
                <Badge tone="success" dot>
                  Saved
                </Badge>
                <Badge tone="warning">Read-only · 12 MB</Badge>
                <Badge tone="danger">Conflict</Badge>
              </Row>
              <Row label="Other">
                <Badge tone="success" dot live>
                  Running
                </Badge>
                <Badge size="sm" tone="neutral" count={3} />
                <Badge size="sm" tone="danger" count={128} max={99} />
                <Badge size="sm" icon={ComputerTerminal01Icon}>
                  zsh
                </Badge>
              </Row>
            </Spec>

            <Spec name="Kbd" file="kbd" source="vendored" use="Shortcuts in empty states, tooltips, menus and help. mod = ⌘ on macOS, Ctrl elsewhere." props={['keys: string | string[] ("mod", "shift", "enter"…)', 'size: "sm" | "md"', 'platform: "mac" | "other"']}>
              <Row label="sm">
                <Kbd keys={["mod", "P"]} />
                <Kbd keys={["mod", "shift", "P"]} />
                <Kbd keys={["ctrl", "`"]} />
                <Kbd keys="esc" />
              </Row>
              <Row label="md">
                <Kbd size="md" keys={["mod", "S"]} />
                <Kbd size="md" keys={["mod", "B"]} />
                <Kbd size="md" keys={["mod", "S"]} platform="other" />
              </Row>
            </Spec>

            <Spec name="Spinner & Skeleton" file="spinner" source="vendored" use="Save in progress (status bar), loading a big folder or file." props={["Spinner: size = 14, label", "Skeleton: width, height, radius, line", "Loading: label (wraps skeletons)"]}>
              <Row label="Spinner">
                <Spinner />
                <Spinner size={18} label="Saving" />
                <Spinner size={24} />
              </Row>
              <Loading label="Loading folder">
                <div className="ds-skel">
                  {[150, 110, 180, 96, 130].map((w, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", paddingLeft: i > 0 && i < 4 ? 18 : 0 }}>
                      <Skeleton width={16} height={16} radius={4} />
                      <Skeleton width={w} line />
                    </div>
                  ))}
                </div>
              </Loading>
            </Spec>

            <Spec name="Card" file="card" source="vendored" use="Settings sections, file info, the cards on this page." props={["as", "interactive", "selected", "CardHeader: title, description, icon, action", "CardContent", "CardFooter"]}>
              <div className="ds-grid ds-grid--2">
                <Card>
                  <CardHeader icon={<I icon={ComputerTerminal01Icon} size={18} />} title="Terminal" description="Shell, font and scrollback." action={<IconButton size="sm" icon={MoreHorizontalIcon} label="More" />} />
                  <CardContent>
                    <Switch label="Copy on select" size="sm" />
                  </CardContent>
                  <CardFooter>
                    <Button size="sm" variant="secondary">
                      Reset
                    </Button>
                  </CardFooter>
                </Card>
                <Card interactive selected>
                  <CardHeader
                    icon={<I icon={Folder01Icon} size={18} />}
                    title={<button type="button">wp-go-desktop</button>}
                    description="~/workspaces · opened today"
                  />
                </Card>
              </div>
            </Spec>

            <Spec name="Separator" file="separator" source="vendored" use="Dividers in toolbars, the status bar and menus." props={['orientation: "horizontal" | "vertical"', "label", "decorative"]}>
              <Separator />
              <Separator label="Earlier" />
              <Row>
                <span>UTF-8</span>
                <Separator orientation="vertical" />
                <span>LF</span>
                <Separator orientation="vertical" />
                <span>Ln 12, Col 4</span>
              </Row>
            </Spec>

            <Spec name="Scroll Area" file="scroll-area" source="vendored" use="Sidebar, preview and settings – thin overlay scrollbars, soft edge fades." props={['orientation: "vertical" | "horizontal" | "both"', 'type: "hover" | "scroll" | "always"', "fade", "maxHeight"]}>
              <ScrollArea maxHeight={150} fade type="always" className="ds-framed">
                <ol className="ds-scroll-list">
                  {Array.from({ length: 24 }, (_, i) => (
                    <li key={i}>
                      <I icon={File01Icon} size={14} /> note-{String(i + 1).padStart(2, "0")}.md
                    </li>
                  ))}
                </ol>
              </ScrollArea>
            </Spec>

            <Spec name="Resizable" file="resizable" source="vendored" use="Sidebar | tab area, and the Markdown editor | preview split; collapsible panes; layout is persisted via onLayout." props={['ResizablePanelGroup: direction, onLayout, keyboardStep', "ResizablePanel: defaultSize, minSize, maxSize, collapsible, collapsedSize", "ResizableHandle: withHandle"]} wide>
              <ResizableDemo />
            </Spec>

            <Spec name="Code Block" file="code-block" source="vendored" use="Fenced code in the Markdown preview. Built-in colorizer for TS/JS, JSON, Bash, Python." props={["code", "language", "filename", "showLineNumbers", "highlightLines", "wrap", "maxHeight", "copyable"]} wide>
              <CodeBlock
                filename="wails.json"
                language="json"
                showLineNumbers
                highlightLines={[3]}
                copyable
                code={`{\n  "name": "wp-go-desktop",\n  "frontend:install": "npm install",\n  "frontend:build": "npm run build",\n  "outputfilename": "wp-go-desktop"\n}`}
              />
            </Spec>
          </div>
        </Section>

        {/* 09 */}
        <Section id="themes" n="09" title="Editor, terminal & prose" lead="The surfaces that aren't affectUI components – CodeMirror 6, xterm.js and the Markdown preview – themed from the same tokens and syntax palette.">
          <div className="ds-grid ds-grid--2">
            <Card>
              <CardHeader icon={<I icon={CodeIcon} size={18} />} title="CodeMirror 6" description="13px mono, 20px lines, active line tint, no gutter border." />
              <div className="ds-surface-sample">
                <GoSample />
              </div>
            </Card>
            <Card>
              <CardHeader icon={<I icon={ComputerTerminal01Icon} size={18} />} title="xterm.js" description="ANSI palette mapped to the status and syntax colours." />
              <div className="ds-surface-sample ds-surface-sample--term">
                <TerminalSample />
                <div className="ds-ansi">
                  {["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"].map((c) => (
                    <span key={c} className={`ansi-${c}`} title={c} />
                  ))}
                </div>
              </div>
            </Card>
          </div>
          <Card style={{ marginTop: 16 }}>
            <CardHeader icon={<I icon={ViewIcon} size={18} />} title="Markdown preview – .md-prose" description="760px measure, 14.5px / 1.7, fenced code rendered with Code Block." />
            <div className="ds-surface-sample ds-surface-sample--prose">
              <ProseSample />
            </div>
          </Card>
        </Section>

        {/* 10 */}
        <Section id="app" n="10" title="App composition" lead="Everything together – the real components in the app layout. Drag the split handles, click tree rows and tabs, right-click the tree, hover the toolbar.">
          <AppMock />
        </Section>

        <footer className="ds-footer">
          <span>
            Built from <code>frontend/src/components/ui</code> · tokens in <code>frontend/src/styles/tokens.css</code> · spec in{" "}
            <code>doc/DESIGN_SYSTEM.md</code>
          </span>
          <span>affectUI (MIT) · Hugeicons Free (MIT)</span>
        </footer>
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}

/* ---------------------------------------------------------------- page styles */

const pageCss = /* css */ `
.ds { display: grid; grid-template-columns: 248px minmax(0, 1fr); min-height: 100vh; }
/* The showcase is a long document: let the viewport scroll (the app itself never scrolls the page) – so Dialog's
   scroll lock on <html> works and the position is kept */
html, body, #root { height: auto; }
body { overflow: visible; user-select: auto; background: var(--app-editor); }
html { scroll-behavior: smooth; scroll-padding-top: 24px; }
code { font-family: var(--app-font-mono); font-size: 0.88em; }
.ds-muted { color: var(--app-muted); font-size: 12.5px; }

/* nav */
.ds-nav { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; gap: 18px; padding: 20px 14px; background: var(--app-sidebar); box-shadow: inset -1px 0 0 var(--app-line); box-sizing: border-box; }
.ds-brand { display: flex; align-items: center; gap: 10px; padding: 0 6px; }
.ds-brand b { display: block; font-size: 13.5px; font-weight: 600; letter-spacing: -0.01em; }
.ds-brand span { font-size: 12px; color: var(--app-muted); }
.ds-logo { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 9px; color: #fafafa; background: linear-gradient(#323137, #201e25); box-shadow: 0 0 0 1px #0d0d0d, 0 2px 4px rgba(0,0,0,.1); }
:root[data-theme="dark"] .ds-logo { color: #121213; background: linear-gradient(#f4f4f5, #e4e4e7); box-shadow: 0 0 0 1px rgba(0,0,0,.6); }
.ds-nav ul { list-style: none; margin: 0; padding: 0; display: grid; align-content: start; gap: 1px; flex: 1; overflow: auto; }
.ds-nav a { display: flex; gap: 10px; align-items: center; height: 32px; padding: 0 10px; border-radius: 9px; color: var(--app-muted); text-decoration: none; font-size: 13.5px; transition: background-color 120ms ease, color 120ms ease; }
.ds-nav a span { font: 500 11px var(--app-font-mono); color: var(--app-faint); }
.ds-nav a:hover { background: var(--app-hover); color: var(--app-ink); }
.ds-nav a[data-active] { background: var(--app-selected); color: var(--app-ink); font-weight: 500; }
.ds-nav a:focus-visible { outline: 2px solid var(--app-focus); outline-offset: -2px; }

/* main */
.ds-main { min-width: 0; padding: 0 56px 40px; max-width: 1180px; box-sizing: border-box; }
.ds-hero { padding: 64px 0 48px; border-bottom: 1px solid var(--app-line); }
.ds-hero h1 { margin: 16px 0 12px; font-size: 40px; line-height: 1.1; font-weight: 600; letter-spacing: -0.03em; }
.ds-lead { max-width: 680px; margin: 0; color: var(--app-muted); font-size: 15px; line-height: 1.6; }
.ds-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 28px 0; }
.ds-stat { padding: 14px 16px; border-radius: 14px; background: var(--app-bg); box-shadow: inset 0 0 0 1px var(--app-line); }
.ds-stat b { display: block; font-size: 26px; font-weight: 600; letter-spacing: -0.02em; }
.ds-stat span { font-size: 12.5px; color: var(--app-muted); }
.ds-hero__actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }

.ds-section { padding: 56px 0 8px; }
.ds-section__head { margin-bottom: 24px; }
.ds-section__n { font: 500 12px var(--app-font-mono); color: var(--app-faint); }
.ds-section h2 { margin: 4px 0 8px; font-size: 26px; font-weight: 600; letter-spacing: -0.02em; }
.ds-h4 { margin: 28px 0 12px; font-size: 12px; font-weight: 500; color: var(--app-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.ds-group { margin-top: 40px; padding-top: 18px; border-top: 1px solid var(--app-line); }
.ds-grid { display: grid; gap: 12px; align-items: start; }
.ds-grid--2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.ds-grid--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.ds-grid--4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.ds-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.ds-row__label { width: 72px; flex: none; font-size: 12px; color: var(--app-faint); }
.ds-row__items { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; flex: 1; min-width: 0; }
.ds-stack { display: grid; gap: 14px; }
.ds-list { margin: 0; padding-left: 18px; color: var(--app-text); line-height: 1.7; }
.ds-mono-sm { margin: 0 0 6px; font: 12px/1.6 var(--app-font-mono); color: var(--app-text); }

/* color */
.ds-swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 14px; }
.ds-swatch { display: grid; gap: 2px; font-size: 12.5px; }
.ds-swatch__chips { display: grid; grid-template-columns: 1fr 1fr; height: 56px; margin-bottom: 6px; border-radius: 12px; overflow: hidden; box-shadow: inset 0 0 0 1px var(--app-line), 0 0 0 1px var(--app-line); }
.ds-swatch b { font-weight: 500; }
.ds-swatch code { color: var(--app-muted); font-size: 11.5px; }
.ds-swatch__vals { color: var(--app-faint); font: 11px var(--app-font-mono); }
.ds-shell-swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
.ds-shell { display: flex; gap: 10px; align-items: center; font-size: 12.5px; }
.ds-shell > span { width: 36px; height: 36px; flex: none; border-radius: 10px; box-shadow: inset 0 0 0 1px var(--app-line-strong); }
.ds-shell b { display: block; font-weight: 500; }
.ds-shell code { color: var(--app-muted); font-size: 11.5px; }
.ds-surfaces .ds-surface { position: relative; padding: 14px 16px 16px; border-radius: 14px; }
.ds-surface > span { display: block; margin-bottom: 12px; font-size: 12px; color: var(--app-muted); }
.ds-surfaces > .ds-surface { box-shadow: inset 0 0 0 1px var(--app-line); }
.ds-surface--float { width: 260px; background: var(--app-editor); box-shadow: 0 0 0 1px rgba(0,0,0,.06), 0 18px 40px -12px rgba(0,0,0,.18), 0 4px 12px -4px rgba(0,0,0,.06); }
:root[data-theme="dark"] .ds-surface--float { background: #19191b; box-shadow: 0 0 0 1px rgba(255,255,255,.06), 0 18px 40px -12px rgba(0,0,0,.6); }
.ds-syntax { display: grid; border-radius: 14px; overflow: hidden; box-shadow: inset 0 0 0 1px var(--app-line); }
.ds-syntax__row { display: grid; grid-template-columns: 140px 1fr auto; gap: 16px; align-items: center; padding: 10px 16px; font-size: 13px; }
.ds-syntax__row + .ds-syntax__row { border-top: 1px solid var(--app-line); }
.ds-syntax__row b { font-weight: 500; }

/* type */
.ds-type { border-radius: 14px; box-shadow: inset 0 0 0 1px var(--app-line); }
.ds-type__row { display: grid; grid-template-columns: 130px 1fr 260px; gap: 16px; align-items: baseline; padding: 14px 18px; }
.ds-type__row + .ds-type__row { border-top: 1px solid var(--app-line); }
.ds-type__spec { font: 12px var(--app-font-mono); color: var(--app-faint); }

/* shape */
.ds-radius { display: grid; justify-items: center; gap: 2px; width: 96px; text-align: center; font-size: 12.5px; }
.ds-radius__shape { width: 64px; height: 64px; margin-bottom: 6px; background: var(--app-bg); box-shadow: inset 0 0 0 1px var(--app-line-strong); }
.ds-radius b { font-weight: 500; }
.ds-radius .ds-muted { font-size: 11.5px; }
.ds-elev { display: grid; gap: 4px; padding: 20px 16px; border-radius: 14px; background: var(--app-editor); font-size: 13px; }
:root[data-theme="dark"] .ds-elev { background: #19191b; }
.ds-elev b { font-weight: 500; }
.ds-space { display: flex; gap: 20px; align-items: flex-end; }
.ds-space div { display: grid; justify-items: center; gap: 6px; }
.ds-space span { background: color-mix(in srgb, var(--app-accent) 35%, transparent); border-radius: 2px; }
.ds-space code { color: var(--app-muted); font-size: 11px; }

/* motion */
.ds-motion { display: grid; grid-template-columns: auto 1fr; gap: 32px; align-items: start; }
.ds-curve { display: grid; gap: 10px; width: 220px; }
.ds-curve > div { display: grid; gap: 4px; font-size: 13px; }
.ds-motion__lanes { display: grid; gap: 12px; }
.ds-lane { display: grid; grid-template-columns: 160px 1fr; align-items: center; gap: 12px; font-size: 13px; }
.ds-lane__track { position: relative; height: 26px; border-radius: 13px; background: var(--app-bg); box-shadow: inset 0 0 0 1px var(--app-line); max-width: 260px; }
.ds-lane__dot { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: var(--app-ink); }

/* icons */
.ds-icons { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 8px; }
.ds-icon { display: grid; justify-items: center; gap: 8px; padding: 16px 6px 12px; border-radius: 12px; color: var(--app-ink); box-shadow: inset 0 0 0 1px var(--app-line); }
.ds-icon code { font-size: 10.5px; color: var(--app-muted); text-align: center; word-break: break-all; }

/* specs */
.ds-specs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.ds-spec { display: grid; align-content: start; gap: 12px; padding: 18px; border-radius: 16px; background: var(--app-editor); box-shadow: inset 0 0 0 1px var(--app-line); min-width: 0; }
.ds-spec[data-wide] { grid-column: 1 / -1; }
.ds-spec__head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.ds-spec h3 { margin: 0; font-size: 16px; font-weight: 600; letter-spacing: -0.01em; }
.ds-file { font-size: 11.5px; color: var(--app-faint); }
.ds-use { margin: 0; color: var(--app-muted); font-size: 13px; line-height: 1.55; }
.ds-stage { display: grid; gap: 14px; padding: 18px; border-radius: 12px; background: var(--app-bg); box-shadow: inset 0 0 0 1px var(--app-line); min-width: 0; }
.ds-props { display: flex; flex-wrap: wrap; gap: 6px; }
.ds-props code { padding: 2px 7px; border-radius: 6px; background: var(--app-bg); box-shadow: inset 0 0 0 1px var(--app-line); color: var(--app-text); font-size: 11.5px; line-height: 18px; }
.ds-framed { border-radius: 12px; overflow: hidden; background: var(--app-editor); box-shadow: inset 0 0 0 1px var(--app-line), 0 0 0 1px var(--app-line); }
.ds-tabs-body { padding: 18px 16px; min-height: 48px; font-size: 13px; color: var(--app-muted); border-bottom: 1px solid var(--app-line); }
.ds-tabs-body b { color: var(--app-ink); font-weight: 500; }
.ds-tree { padding: 6px; max-height: 300px; overflow: auto; }
.ds-dropzone { display: grid; place-items: center; height: 110px; border-radius: 12px; border: 1.5px dashed var(--app-line-strong); color: var(--app-muted); font-size: 13px; background: var(--app-editor); }
.ds-dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 16px; margin: 0; font-size: 13px; }
.ds-dl dt { color: var(--app-muted); }
.ds-dl dd { margin: 0; }
.ds-native { box-sizing: border-box; width: 100%; height: 40px; padding: 0 12px; border-radius: 10px; border: 1px solid var(--app-line-strong); background: var(--app-editor); color: var(--app-ink); font: inherit; font-size: 14px; }
.ds-native:focus-visible { outline: 2px solid var(--app-focus); outline-offset: 1px; }
.ds-skel { display: grid; gap: 10px; padding-top: 4px; }
.ds-scroll-list { margin: 0; padding: 6px; list-style: none; font-size: 13px; }
.ds-scroll-list li { display: flex; gap: 8px; align-items: center; height: 30px; padding: 0 8px; border-radius: 8px; color: var(--app-text); }
.ds-scroll-list li:hover { background: var(--app-hover); }
.ds-resize { height: 260px; border-radius: 12px; overflow: hidden; box-shadow: inset 0 0 0 1px var(--app-line), 0 0 0 1px var(--app-line); }
.ds-pane { display: grid; place-items: center; height: 100%; background: var(--app-editor); color: var(--app-muted); font-size: 13px; }
.ds-pane--dim { background: var(--app-bg); }

/* 3rd-party samples */
.ds-surface-sample { margin: 0 -1px -1px; border-top: 1px solid var(--app-line); background: var(--app-editor); border-radius: 0 0 14px 14px; overflow: hidden; }
.ds-surface-sample--term { background: var(--app-panel); }
.ds-surface-sample--prose { max-height: 560px; display: flex; }
.ds-ansi { display: flex; gap: 6px; padding: 0 16px 14px; }
.ds-ansi span { width: 22px; height: 22px; border-radius: 6px; box-shadow: inset 0 0 0 1px var(--app-line); }

.cm { padding: 12px 0; font: 13px/20px var(--app-font-mono); color: var(--app-ink); background: var(--app-editor); white-space: pre; overflow: auto; flex: 1; min-width: 0; user-select: text; }
.cm__line { display: flex; }
.cm__line[data-active] { background: color-mix(in srgb, var(--app-accent) 5%, transparent); }
.cm__gutter { width: 44px; flex: none; padding-right: 14px; text-align: right; color: var(--app-faint); }
.cm__line[data-active] .cm__gutter { color: var(--app-muted); }
.tok-h { font-weight: 600; color: var(--app-ink); }
.tok-t { color: var(--app-text); }
.tok-l { color: var(--app-accent); }
.tok-c, .tok-str { color: #0b8576; }
.tok-kw { color: #8a35d6; }
.tok-num { color: #b25e00; }
.tok-fn { color: #1f63c9; }
.tok-com { color: #9a9a9a; }
:root[data-theme="dark"] .tok-c, :root[data-theme="dark"] .tok-str { color: #4fc3b4; }
:root[data-theme="dark"] .tok-kw { color: #cfaef5; }
:root[data-theme="dark"] .tok-num { color: #f2a15c; }
:root[data-theme="dark"] .tok-fn { color: #7cb4ff; }
:root[data-theme="dark"] .tok-com { color: #6e6e75; }

.xterm { padding: 10px 16px 14px; font: 13px/1.35 var(--app-font-mono); color: var(--app-ink); white-space: pre; overflow: auto; user-select: text; }
.x-green { color: #1e8a4f; } .x-blue { color: #1f63c9; } .x-magenta { color: #8a35d6; } .x-red { color: #d92d20; } .x-yellow { color: #b25e00; }
:root[data-theme="dark"] .x-green { color: #5fc88a; } :root[data-theme="dark"] .x-blue { color: #7cb4ff; } :root[data-theme="dark"] .x-magenta { color: #cfaef5; } :root[data-theme="dark"] .x-red { color: #ff8a7a; } :root[data-theme="dark"] .x-yellow { color: #f2a15c; }
.x-cursor { display: inline-block; width: 2px; height: 15px; vertical-align: -3px; background: var(--app-ink); animation: x-blink 1s steps(1) infinite; }
@keyframes x-blink { 50% { opacity: 0; } }
.ansi-black { background: #171717; } .ansi-red { background: #d92d20; } .ansi-green { background: #1e8a4f; } .ansi-yellow { background: #b25e00; }
.ansi-blue { background: #1f63c9; } .ansi-magenta { background: #8a35d6; } .ansi-cyan { background: #0b8576; } .ansi-white { background: #a3a3a3; }
:root[data-theme="dark"] .ansi-black { background: #26262a; } :root[data-theme="dark"] .ansi-red { background: #ff8a7a; } :root[data-theme="dark"] .ansi-green { background: #5fc88a; } :root[data-theme="dark"] .ansi-yellow { background: #f2a15c; }
:root[data-theme="dark"] .ansi-blue { background: #7cb4ff; } :root[data-theme="dark"] .ansi-magenta { background: #cfaef5; } :root[data-theme="dark"] .ansi-cyan { background: #4fc3b4; } :root[data-theme="dark"] .ansi-white { background: #e4e4e7; }

/* markdown prose */
.md-prose { max-width: 760px; margin: 0 auto; padding: 32px 40px; font-size: 14.5px; line-height: 1.7; color: var(--app-text); user-select: text; }
.md-prose[data-compact] { padding: 20px 24px; font-size: 13.5px; }
.md-prose h1, .md-prose h2, .md-prose h3 { color: var(--app-ink); font-weight: 600; letter-spacing: -0.015em; line-height: 1.3; }
.md-prose h1 { margin: 0 0 12px; font-size: 26px; }
.md-prose[data-compact] h1 { font-size: 21px; }
.md-prose h2 { margin: 28px 0 10px; padding-bottom: 6px; font-size: 20px; border-bottom: 1px solid var(--app-line); }
.md-prose[data-compact] h2 { font-size: 17px; margin-top: 20px; }
.md-prose h3 { margin: 22px 0 8px; font-size: 16.5px; }
.md-prose p { margin: 0 0 12px; }
.md-prose strong { color: var(--app-ink); font-weight: 600; }
.md-prose a { color: var(--app-accent); text-underline-offset: 2px; }
.md-prose :not(pre) > code:not(.ui-code *) { padding: 1px 5px; border-radius: 5px; background: var(--app-selected); font-size: 0.88em; color: var(--app-ink); }
.md-prose ul { margin: 0 0 12px; padding-left: 22px; }
.md-prose li.task { list-style: none; margin-left: -20px; }
.md-prose li.task input { width: 14px; height: 14px; margin: 0 6px 0 0; vertical-align: -2px; accent-color: var(--app-ink); }
.md-prose blockquote { margin: 0 0 14px; padding: 2px 14px; border-left: 2px solid var(--app-line-strong); color: var(--app-muted); }
.md-prose table { width: 100%; margin: 0 0 14px; border-collapse: collapse; font-size: 13.5px; }
.md-prose th, .md-prose td { padding: 8px 12px; text-align: left; border: 1px solid var(--app-line); }
.md-prose th { background: var(--app-bg); color: var(--app-ink); font-weight: 500; }
.md-prose .ui-code { margin: 4px 0 16px; }

/* app mock */
.mock { display: flex; flex-direction: column; height: 640px; border-radius: 14px; overflow: hidden; background: var(--app-bg); box-shadow: 0 0 0 1px rgba(0,0,0,.08), 0 30px 80px -24px rgba(0,0,0,.28), 0 8px 24px -8px rgba(0,0,0,.08); }
:root[data-theme="dark"] .mock { box-shadow: 0 0 0 1px rgba(255,255,255,.08), 0 30px 80px -24px rgba(0,0,0,.7); }
.mock__title { display: flex; align-items: center; gap: 14px; height: var(--app-titlebar-h); padding: 0 10px 0 14px; flex: none; box-shadow: inset 0 -1px 0 var(--app-line); }
.mock__lights { display: flex; gap: 8px; }
.mock__lights i { width: 12px; height: 12px; border-radius: 50%; background: #ff5f57; box-shadow: inset 0 0 0 .5px rgba(0,0,0,.15); }
.mock__lights i:nth-child(2) { background: #febc2e; }
.mock__lights i:nth-child(3) { background: #28c840; }
.mock__search { display: flex; align-items: center; gap: 8px; height: 26px; margin-left: auto; padding: 0 6px 0 10px; width: 260px; border: 0; border-radius: 8px; background: var(--app-editor); box-shadow: inset 0 0 0 1px var(--app-line); color: var(--app-faint); font: inherit; font-size: 12.5px; cursor: pointer; }
.mock__search .ui-kbd { margin-left: auto; }
.mock__title-actions { margin-left: auto; display: flex; }
.mock__body { flex: 1; min-height: 0; }
.mock__body > .ui-rz, .mock__body > * { height: 100%; }
.mock__side { display: flex; flex-direction: column; height: 100%; background: var(--app-sidebar); }
.mock__side-head { display: flex; align-items: center; justify-content: space-between; height: 36px; padding: 0 6px 0 14px; flex: none; font-size: 11.5px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: var(--app-muted); }
.mock__side-head > span:last-child { display: flex; }
.mock__editor { display: flex; flex-direction: column; height: 100%; background: var(--app-editor); }
.mock__split { display: flex; flex: 1; min-height: 0; }
.mock__split > * + * { border-left: 1px solid var(--app-line); }
.mock__split .md-wrap { flex: 1; }
.mock__view { display: flex; flex: 1; min-height: 0; }
.mock__view > .xterm { flex: 1; padding: 12px 16px; background: var(--app-editor); }
.mock__view > .ui-est { margin: auto; }
.x-faint { color: var(--app-faint); }
.mock__status { display: flex; align-items: center; justify-content: space-between; gap: 12px; height: 26px; padding: 0 12px; flex: none; background: var(--app-statusbar); box-shadow: inset 0 1px 0 var(--app-line); font-size: 12px; color: var(--app-muted); }
.mock__status-right { display: flex; align-items: center; gap: 10px; }
.mock__path { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.ds-footer { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-top: 64px; padding-top: 18px; border-top: 1px solid var(--app-line); color: var(--app-faint); font-size: 12px; }

@media (max-width: 1100px) {
  .ds-specs, .ds-grid--3, .ds-grid--4 { grid-template-columns: minmax(0, 1fr); }
  .ds-main { padding: 0 28px 40px; }
}
@media (max-width: 760px) {
  .ds { grid-template-columns: minmax(0, 1fr); }
  .ds-nav { position: static; height: auto; }
  .ds-grid--2, .ds-stats { grid-template-columns: minmax(0, 1fr); }
  .ds-type__row { grid-template-columns: 1fr; }
}
`;

const style = document.createElement("style");
style.textContent = tokensCss + pageCss;
document.head.appendChild(style);
createRoot(document.getElementById("root")!).render(<Page />);
