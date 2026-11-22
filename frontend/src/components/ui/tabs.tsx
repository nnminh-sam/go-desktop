"use client";

import {
  createElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

/*
 * Tabs – a single self-contained file.
 * Not part of affectUI: a document tab strip (open files, terminals) built in its visual language – the sliding
 * line of Segmented Control's underline variant, the hover fill of Dropdown Menu, the focus ring of Button – and its
 * prop conventions (items + controlled/uncontrolled value + onChange).
 *
 * ←/→ move between tabs and show them, Home/End jump to the ends, Delete closes the focused tab, a middle click closes
 * the tab under the pointer, tabs drag to reorder. A changed tab shows a dot that turns into × on hover; a busy tab
 * (e.g. a terminal running a command) swaps its icon for a small spinning ring. Files and terminals share one strip.
 * The styles are injected below, so no extra files are needed.
 */

/** An icon from Hugeicons (e.g. `import { File01Icon } from "@hugeicons/core-free-icons"`) – drawn inline */
export type HugeIcon = readonly (readonly [string, { readonly [key: string]: string | number }])[];

export type TabItem = {
  id: string;
  /** One line – long ones end in … */
  label: string;
  /** A 14px glyph before the label, e.g. the file type */
  icon?: ReactNode | HugeIcon;
  /** Shown on hover, e.g. the full path */
  title?: string;
  /** Unsaved changes – a dot that turns into × on hover */
  dirty?: boolean;
  /** Something is running, e.g. a command in a terminal tab – the icon becomes a spinning ring */
  busy?: boolean;
  /** Shows ×; on by default */
  closable?: boolean;
  /** The id of the panel this tab shows */
  controls?: string;
};

export type TabsProps = {
  items: TabItem[];
  /** Controlled: the id of the open tab */
  value?: string | null;
  /** Uncontrolled: the tab open at the start – defaults to the first */
  defaultValue?: string;
  onChange?: (id: string) => void;
  /** × clicked, middle click or Delete – remove the item yourself (ask first when it is dirty) */
  onClose?: (id: string, item: TabItem) => void;
  /** Tabs were dragged into a new order – called with every id in order */
  onReorder?: (ids: string[]) => void;
  /** sm: 30px (terminal panel) · md: 36px (editor) */
  size?: "sm" | "md";
  /** Anything at the right end of the strip, e.g. a split toggle or a + button */
  actions?: ReactNode;
  "aria-label"?: string;
  className?: string;
};

export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  onClose,
  onReorder,
  size = "md",
  actions,
  "aria-label": ariaLabel = "Open files",
  className,
}: TabsProps) {
  const list = Array.isArray(items) ? items : [];
  const [inner, setInner] = useState<string | undefined>(defaultValue ?? list[0]?.id);
  const current = value !== undefined ? value : inner;
  const scroller = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<{ id: string; after: boolean } | null>(null);

  // The open tab went away (closed) – uncontrolled, the neighbour opens
  useEffect(() => {
    if (value !== undefined || !inner || list.some((t) => t.id === inner)) return;
    setInner(list[0]?.id);
  }, [list, inner, value]);

  const select = (id: string) => {
    if (id === current) return;
    if (value === undefined) setInner(id);
    onChange?.(id);
  };

  // The line glides under the open tab (every render – labels and widths change)
  useLayoutEffect(() => {
    const tab = scroller.current?.querySelector<HTMLElement>(`[data-tab-id="${CSS.escape(current ?? "")}"]`);
    const l = line.current;
    if (!l) return;
    if (!tab) {
      l.style.opacity = "0";
      return;
    }
    l.style.opacity = "1";
    l.style.transform = `translateX(${tab.offsetLeft}px)`;
    l.style.width = `${tab.offsetWidth}px`;
  });

  // A newly opened tab scrolls into view inside the strip only – never the page (no scrollIntoView)
  useLayoutEffect(() => {
    const box = scroller.current;
    const tab = box?.querySelector<HTMLElement>(`[data-tab-id="${CSS.escape(current ?? "")}"]`);
    if (!box || !tab) return;
    const left = tab.offsetLeft;
    const right = left + tab.offsetWidth;
    if (left < box.scrollLeft) box.scrollLeft = left;
    else if (right > box.scrollLeft + box.clientWidth) box.scrollLeft = right - box.clientWidth;
  }, [current, list.length]);
  useEffect(() => {
    const f = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(f);
  }, []);

  const tabs = () => Array.from(scroller.current?.querySelectorAll<HTMLElement>(".ui-tabs__tab") ?? []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const els = tabs();
    const at = els.indexOf(document.activeElement as HTMLElement);
    if (at < 0 || e.altKey || e.ctrlKey || e.metaKey) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    let to = -1;
    if (e.key === (rtl ? "ArrowLeft" : "ArrowRight")) to = (at + 1) % els.length;
    else if (e.key === (rtl ? "ArrowRight" : "ArrowLeft")) to = (at - 1 + els.length) % els.length;
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = els.length - 1;
    else if (e.key === "Delete") {
      const item = list[at];
      if (item && item.closable !== false) {
        e.preventDefault();
        onClose?.(item.id, item);
        requestAnimationFrame(() => tabs()[Math.min(at, tabs().length - 1)]?.focus());
      }
      return;
    }
    if (to < 0) return;
    e.preventDefault();
    els[to].focus();
    select(list[to].id);
  };

  const onDragOver = (e: DragEvent<HTMLElement>, id: string) => {
    if (!dragging || !onReorder) return;
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    const after = e.clientX > r.left + r.width / 2;
    if (over?.id !== id || over.after !== after) setOver({ id, after });
  };
  const onDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    if (dragging && over && dragging !== over.id) {
      const ids = list.map((t) => t.id).filter((id) => id !== dragging);
      const at = ids.indexOf(over.id) + (over.after ? 1 : 0);
      ids.splice(at, 0, dragging);
      onReorder?.(ids);
    }
    setDragging(null);
    setOver(null);
  };

  return (
    <>
      <style href="ui-tabs" precedence="default">
        {css}
      </style>
      <div className={["ui-tabs", className].filter(Boolean).join(" ")} data-size={size === "sm" ? "sm" : "md"} data-ready={ready || undefined}>
        <div className="ui-tabs__scroller" ref={scroller} role="tablist" aria-label={ariaLabel} aria-orientation="horizontal" onKeyDown={onKeyDown}>
          {list.map((t) => {
            const active = t.id === current;
            const closable = t.closable !== false && Boolean(onClose);
            return (
              <div
                key={t.id}
                className="ui-tabs__tab"
                role="tab"
                data-tab-id={t.id}
                aria-selected={active}
                aria-controls={t.controls}
                tabIndex={active || (!current && t === list[0]) ? 0 : -1}
                title={t.title}
                data-active={active || undefined}
                data-dirty={t.dirty || undefined}
                data-busy={t.busy || undefined}
                data-dragging={dragging === t.id || undefined}
                data-drop={over?.id === t.id ? (over.after ? "after" : "before") : undefined}
                draggable={Boolean(onReorder)}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  setDragging(t.id);
                }}
                onDragOver={(e) => onDragOver(e, t.id)}
                onDragLeave={() => over?.id === t.id && setOver(null)}
                onDrop={onDrop}
                onDragEnd={() => (setDragging(null), setOver(null))}
                onPointerDown={(e) => e.button === 0 && select(t.id)}
                onAuxClick={(e) => {
                  if (e.button === 1 && closable) {
                    e.preventDefault();
                    onClose?.(t.id, t);
                  }
                }}
              >
                {t.busy ? (
                  <span className="ui-tabs__icon" data-busy="" aria-hidden="true">
                    <BusyIcon />
                  </span>
                ) : (
                  t.icon && (
                    <span className="ui-tabs__icon" aria-hidden="true">
                      <Glyph icon={t.icon} />
                    </span>
                  )
                )}
                <span className="ui-tabs__label" dir="auto">
                  {t.label}
                </span>
                {t.dirty && <span className="ui-tabs__sr">, unsaved changes</span>}
                {t.busy && <span className="ui-tabs__sr">, running</span>}
                {closable ? (
                  <button
                    type="button"
                    className="ui-tabs__close"
                    tabIndex={-1}
                    aria-label={`Close ${t.label}`}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose?.(t.id, t);
                    }}
                  >
                    <span className="ui-tabs__dot" aria-hidden="true" />
                    <CloseIcon />
                  </button>
                ) : (
                  t.dirty && <span className="ui-tabs__dot" data-solo="" aria-hidden="true" />
                )}
              </div>
            );
          })}
          <span className="ui-tabs__line" ref={line} aria-hidden="true" />
        </div>
        {actions && <div className="ui-tabs__actions">{actions}</div>}
      </div>
    </>
  );
}

const isHugeIcon = (icon: unknown): icon is HugeIcon =>
  Array.isArray(icon) && icon.length > 0 && icon.every((part) => Array.isArray(part) && typeof part[0] === "string");

function Glyph({ icon }: { icon: ReactNode | HugeIcon }) {
  if (!isHugeIcon(icon)) return <>{icon}</>;
  return (
    <svg viewBox="0 0 24 24" fill="none" focusable="false">
      {icon.map(([tag, { key, ...attrs }], i) => createElement(tag, { ...attrs, key: String(key ?? i) }))}
    </svg>
  );
}

/** The Spinner's ring, drawn at the icon's size */
function BusyIcon() {
  return (
    <svg className="ui-tabs__busy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" opacity="0.2" />
      <path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5" />
    </svg>
  );
}

/* Icons: Hugeicons Free (MIT, © Hugeicons, hugeicons.com) */
function CloseIcon() {
  return (
    <svg className="ui-tabs__x" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 7 7 17M7 7l10 10" />
    </svg>
  );
}

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-tabs (see Theming in the docs) */
.ui-tabs {
  --ui-tabs-strip: var(--aui-subtle, #fafafa);
  --ui-tabs-active: var(--aui-surface, #ffffff);
  --ui-tabs-ink: var(--aui-ink, #171717);
  --ui-tabs-text: var(--aui-muted, #737373);
  --ui-tabs-icon: var(--aui-muted, #8f8f8f);
  --ui-tabs-line: var(--aui-border, #ececec);
  --ui-tabs-hover: rgba(0, 0, 0, 0.035);
  --ui-tabs-fill: #f0f0f0;
  --ui-tabs-accent: var(--aui-ink, #171717);
  --ui-tabs-dot: var(--aui-muted, #8f8f8f);
  --ui-tabs-drop: var(--aui-blue, #0190fe);
  --ui-tabs-busy: var(--aui-blue, #0190fe);
  --ui-tabs-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-tabs-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  --ui-tabs-h: 36px;
  --ui-tabs-px: 12px;
  --ui-tabs-fs: 13px;

  position: relative;
  display: flex;
  align-items: stretch;
  min-width: 0;
  height: var(--ui-tabs-h);
  background: var(--ui-tabs-strip);
  box-shadow: inset 0 -1px 0 var(--ui-tabs-line);
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: var(--ui-tabs-fs);
  line-height: 1;
  -webkit-font-smoothing: antialiased;
}
.ui-tabs[data-size="sm"] { --ui-tabs-h: 30px; --ui-tabs-px: 10px; --ui-tabs-fs: 12.5px; }
.ui-tabs *, .ui-tabs *::before, .ui-tabs *::after { box-sizing: border-box; }

/* Scrolls sideways when the tabs don't fit – no scrollbar */
.ui-tabs__scroller { position: relative; display: flex; flex: 1; min-width: 0; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; overscroll-behavior-x: contain; }
.ui-tabs__scroller::-webkit-scrollbar { display: none; }

.ui-tabs__tab {
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  gap: 7px;
  max-width: 220px;
  height: 100%;
  padding: 0 6px 0 var(--ui-tabs-px);
  color: var(--ui-tabs-text);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  transition: background-color 120ms ease, color 120ms ease, opacity 160ms ease;
}
/* Hairlines between tabs, hidden next to the open one */
.ui-tabs__tab + .ui-tabs__tab::before { content: ""; position: absolute; left: 0; top: 9px; bottom: 9px; width: 1px; background: var(--ui-tabs-line); }
.ui-tabs__tab[data-active]::before, .ui-tabs__tab[data-active] + .ui-tabs__tab::before { opacity: 0; }
.ui-tabs__tab:hover:not([data-active]) { background: var(--ui-tabs-hover); color: var(--ui-tabs-ink); }
.ui-tabs__tab[data-active] { background: var(--ui-tabs-active); color: var(--ui-tabs-ink); box-shadow: inset 1px 0 0 var(--ui-tabs-line), inset -1px 0 0 var(--ui-tabs-line); }
.ui-tabs__tab:first-child[data-active] { box-shadow: inset -1px 0 0 var(--ui-tabs-line); }
.ui-tabs__tab:focus-visible { outline: 2px solid var(--ui-tabs-focus); outline-offset: -2px; border-radius: 6px; }
.ui-tabs__tab[data-dragging] { opacity: 0.4; }
.ui-tabs__tab[data-drop]::after { content: ""; position: absolute; top: 6px; bottom: 6px; width: 2px; border-radius: 1px; background: var(--ui-tabs-drop); }
.ui-tabs__tab[data-drop="before"]::after { left: -1px; }
.ui-tabs__tab[data-drop="after"]::after { right: -1px; }

.ui-tabs__icon { display: grid; flex: none; place-items: center; width: 14px; height: 14px; color: var(--ui-tabs-icon); }
.ui-tabs__icon > svg, .ui-tabs__icon > img { display: block; width: 14px; height: 14px; }
.ui-tabs__icon[data-busy] { color: var(--ui-tabs-busy); }
.ui-tabs__busy { animation: ui-tabs-spin 900ms linear infinite; }
@keyframes ui-tabs-spin { to { transform: rotate(360deg); } }
.ui-tabs__label { min-width: 0; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.005em; }
.ui-tabs__tab[data-active] .ui-tabs__label { font-weight: 500; }
.ui-tabs__sr { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

/* × – faint on the open tab, on hover elsewhere; a changed tab shows a dot until hovered */
.ui-tabs__close { position: relative; display: grid; flex: none; place-items: center; width: 20px; height: 20px; margin: 0; padding: 0; border: 0; border-radius: 6px; background: transparent; color: var(--ui-tabs-icon); cursor: pointer; opacity: 0; transition: opacity 120ms ease, background-color 120ms ease, color 120ms ease; }
.ui-tabs__x { width: 13px; height: 13px; }
.ui-tabs__tab[data-active] .ui-tabs__close, .ui-tabs__tab:hover .ui-tabs__close, .ui-tabs__tab[data-dirty] .ui-tabs__close { opacity: 1; }
.ui-tabs__close:hover { background: var(--ui-tabs-fill); color: var(--ui-tabs-ink); }
.ui-tabs__dot { position: absolute; inset: 0; margin: auto; width: 7px; height: 7px; border-radius: 50%; background: var(--ui-tabs-dot); opacity: 0; transform: scale(0.5); transition: opacity 160ms ease, transform 200ms var(--ui-tabs-ease); }
.ui-tabs__dot[data-solo] { position: relative; flex: none; margin: 0 6px; }
.ui-tabs__tab[data-dirty] .ui-tabs__dot { opacity: 1; transform: none; }
.ui-tabs__tab[data-dirty] .ui-tabs__x { opacity: 0; transform: scale(0.6); transition: opacity 120ms ease, transform 200ms var(--ui-tabs-ease); }
.ui-tabs__tab[data-dirty] .ui-tabs__close:hover .ui-tabs__dot { opacity: 0; transform: scale(0.5); }
.ui-tabs__tab[data-dirty] .ui-tabs__close:hover .ui-tabs__x { opacity: 1; transform: none; }

/* The line on top of the open tab glides between tabs */
.ui-tabs__line { position: absolute; top: 0; left: 0; height: 2px; width: 0; background: var(--ui-tabs-accent); pointer-events: none; z-index: 1; }
.ui-tabs[data-ready] .ui-tabs__line { transition: transform 320ms var(--ui-tabs-ease), width 320ms var(--ui-tabs-ease), opacity 160ms ease; }

.ui-tabs__actions { display: flex; flex: none; align-items: center; gap: 2px; padding: 0 6px; box-shadow: inset 1px 0 0 var(--ui-tabs-line); }

@media (prefers-reduced-motion: reduce) {
  .ui-tabs__line, .ui-tabs__tab, .ui-tabs__close, .ui-tabs__dot, .ui-tabs__x { transition-duration: 1ms !important; }
  .ui-tabs__busy { animation-duration: 2400ms; }
}
@media (forced-colors: active) {
  .ui-tabs__tab[data-active] { outline: 1px solid CanvasText; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-tabs {
  --ui-tabs-strip: var(--aui-subtle, #111113);
  --ui-tabs-active: var(--aui-surface, #19191b);
  --ui-tabs-ink: var(--aui-ink, #ededed);
  --ui-tabs-text: var(--aui-muted, #8f8f8f);
  --ui-tabs-icon: var(--aui-muted, #8b8b92);
  --ui-tabs-line: var(--aui-border, #2a2a2e);
  --ui-tabs-hover: rgba(255, 255, 255, 0.03);
  --ui-tabs-fill: rgba(255, 255, 255, 0.06);
  --ui-tabs-accent: var(--aui-ink, #ededed);
  --ui-tabs-dot: var(--aui-muted, #8b8b92);
  --ui-tabs-drop: var(--aui-blue, #4fb0fe);
  --ui-tabs-busy: var(--aui-blue, #4fb0fe);
  --ui-tabs-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
  color-scheme: dark;
}
`;
