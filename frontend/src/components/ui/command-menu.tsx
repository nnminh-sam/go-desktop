"use client";

import {
  createElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

/*
 * Command Menu – a single self-contained file.
 * Rebuilt from the public affectUI spec (https://www.affectui.com/components/command-menu): same props and command
 * shape, styled with the same tokens as Dropdown Menu and Kbd. The original is affectUI Pro; this is not its source.
 *
 * One search field over grouped commands. ↑/↓ move row by row through every group, ↵ runs, Tab / Shift+Tab jump
 * between groups, ⌘1–⌘5 run the first five suggestions, Esc clears the field and then closes, ⌘K focuses the field
 * from anywhere. With text and no match, a last row hands the text on as "ask".
 * The styles are injected below, so no extra files are needed.
 */

/** An icon from Hugeicons (e.g. `import { File01Icon } from "@hugeicons/core-free-icons"`) – drawn inline */
export type HugeIcon = readonly (readonly [string, { readonly [key: string]: string | number }])[];

export type Command = {
  id: string;
  label: string;
  /** Quiet text after the label, e.g. a path or where it goes */
  hint?: string;
  /** A brand mark in its own colors – takes the place of the icon */
  logo?: ReactNode;
  /** A 16px glyph: an inline SVG or a Hugeicons icon object */
  icon?: ReactNode | HugeIcon;
  /** A shortcut shown on the right, e.g. "⌘S" or ["mod", "S"] – shown only, wire the keys up yourself */
  keys?: string | readonly string[];
  /** Extra words the search matches, e.g. synonyms */
  keywords?: string[];
};

export type CommandGroup = {
  id: string;
  label: string;
  commands: Command[];
};

export type CommandMenuProps = {
  /** The group with id "suggestions" gets ⌘1–⌘5 */
  groups?: CommandGroup[];
  placeholder?: string;
  /** A command ran – the "ask" fallback sends the typed text as query */
  onRun?: (id: string, query?: string) => void;
  /** Esc in an empty field – close your dialog here */
  onClose?: () => void;
  /** Focus the field when the menu appears */
  autoFocus?: boolean;
  className?: string;
};

const DEFAULT_GROUPS: CommandGroup[] = [
  {
    id: "suggestions",
    label: "Suggestions",
    commands: [
      { id: "new-file", label: "New file", keys: ["mod", "N"] },
      { id: "open-folder", label: "Open folder…", keys: ["mod", "O"] },
      { id: "toggle-terminal", label: "Toggle terminal", keys: ["ctrl", "`"] },
    ],
  },
  { id: "share", label: "Share", commands: [{ id: "copy-path", label: "Copy path" }] },
  { id: "general", label: "General", commands: [{ id: "settings", label: "Settings", keys: ["mod", ","] }] },
  { id: "go-to", label: "Go to", commands: [{ id: "go-file", label: "Go to file…", keys: ["mod", "P"] }] },
];

type Row = { group: CommandGroup; command: Command; index: number; slot?: number };

export function CommandMenu({
  groups = DEFAULT_GROUPS,
  placeholder = "Type a command or search…",
  onRun,
  onClose,
  autoFocus,
  className,
}: CommandMenuProps) {
  const uid = useId();
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLSpanElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [said, setSaid] = useState("");
  const mac = useMac();

  const q = query.trim().toLowerCase();

  // Matching: every word of the query has to appear in the label, hint or keywords
  const shown = useMemo(() => {
    const words = q.split(/\s+/).filter(Boolean);
    const out: { group: CommandGroup; rows: Row[] }[] = [];
    let index = 0;
    for (const group of Array.isArray(groups) ? groups : []) {
      const rows: Row[] = [];
      for (const command of group.commands ?? []) {
        const hay = [command.label, command.hint, ...(command.keywords ?? [])].join(" ").toLowerCase();
        if (words.every((w) => hay.includes(w))) rows.push({ group, command, index: 0 });
      }
      if (!rows.length) continue;
      rows.forEach((r, i) => {
        r.index = index++;
        if (group.id === "suggestions" && i < 5) r.slot = i + 1;
      });
      out.push({ group, rows });
    }
    return out;
  }, [groups, q]);

  const rows = shown.flatMap((s) => s.rows);
  const ask = q && !rows.length;
  const count = ask ? 1 : rows.length;
  const current = Math.min(active, Math.max(0, count - 1));
  const activeId = count ? `${uid}-row-${current}` : undefined;

  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    if (autoFocus) input.current?.focus();
  }, [autoFocus]);

  // ⌘K from anywhere puts the cursor in the field
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
        input.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // The soft highlight glides to the active row and keeps it in view
  useEffect(() => {
    const el = list.current?.querySelector<HTMLElement>(`[data-index="${current}"]`);
    const g = glow.current;
    if (!g) return;
    if (!el) {
      g.style.opacity = "0";
      return;
    }
    g.style.opacity = "1";
    g.style.transform = `translateY(${el.offsetTop}px)`;
    g.style.height = `${el.offsetHeight}px`;
    // Keep the row visible inside the list only – scrollIntoView would also scroll the page
    const box = list.current!;
    const pad = 6;
    if (el.offsetTop - pad < box.scrollTop) box.scrollTop = el.offsetTop - pad;
    else if (el.offsetTop + el.offsetHeight + pad > box.scrollTop + box.clientHeight)
      box.scrollTop = el.offsetTop + el.offsetHeight + pad - box.clientHeight;
  }, [current, shown, ask]);

  const run = (row: Row | "ask") => {
    if (row === "ask") {
      onRun?.("ask", query.trim());
      setSaid(`Asked: ${query.trim()}`);
      return;
    }
    onRun?.(row.command.id);
    setSaid(`Ran ${row.command.label}`);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const mod = mac ? e.metaKey : e.ctrlKey;
    if (mod && /^[1-5]$/.test(e.key)) {
      const row = rows.find((r) => r.slot === Number(e.key));
      if (row) {
        e.preventDefault();
        run(row);
      }
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!count) return;
      setActive((current + (e.key === "ArrowDown" ? 1 : -1) + count) % count);
    } else if (e.key === "Home" && e.ctrlKey) {
      setActive(0);
    } else if (e.key === "End" && e.ctrlKey) {
      setActive(count - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (ask) run("ask");
      else if (rows[current]) run(rows[current]);
    } else if (e.key === "Tab" && shown.length > 1) {
      // Tab: first row of the next group · Shift+Tab: the previous one
      e.preventDefault();
      const at = shown.findIndex((s) => s.rows.some((r) => r.index === current));
      const to = (at + (e.shiftKey ? -1 : 1) + shown.length) % shown.length;
      setActive(shown[to].rows[0].index);
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (query) setQuery("");
      else onClose?.();
    }
  };

  return (
    <>
      <style href="ui-command-menu" precedence="default">
        {css}
      </style>
      <div className={["ui-cmd", className].filter(Boolean).join(" ")}>
        <div className="ui-cmd__field">
          <span className="ui-cmd__search" aria-hidden="true">
            <SearchIcon />
          </span>
          <input
            ref={input}
            className="ui-cmd__input"
            role="combobox"
            aria-expanded="true"
            aria-controls={`${uid}-list`}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          {query && (
            <button type="button" className="ui-cmd__clear" aria-label="Clear" onClick={() => (setQuery(""), input.current?.focus())}>
              <ClearIcon />
            </button>
          )}
        </div>
        <div className="ui-cmd__list" id={`${uid}-list`} role="listbox" aria-label="Commands" ref={list}>
          <span className="ui-cmd__glow" ref={glow} aria-hidden="true" />
          {shown.map(({ group, rows: groupRows }) => (
            <div className="ui-cmd__group" role="group" aria-labelledby={`${uid}-g-${group.id}`} key={group.id}>
              <div className="ui-cmd__heading" id={`${uid}-g-${group.id}`}>
                {group.label}
              </div>
              {groupRows.map((row) => (
                <div
                  key={row.command.id}
                  id={`${uid}-row-${row.index}`}
                  className="ui-cmd__row"
                  role="option"
                  aria-selected={row.index === current}
                  data-index={row.index}
                  onPointerMove={() => row.index !== current && setActive(row.index)}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => run(row)}
                >
                  {(row.command.logo || row.command.icon) && (
                    <span className="ui-cmd__icon" data-logo={row.command.logo ? "" : undefined} aria-hidden="true">
                      {row.command.logo ?? <Glyph icon={row.command.icon!} />}
                    </span>
                  )}
                  <span className="ui-cmd__label">{row.command.label}</span>
                  {row.command.hint && <span className="ui-cmd__hint">{row.command.hint}</span>}
                  <Keys keys={row.slot ? ["mod", String(row.slot)] : row.command.keys} mac={mac} />
                </div>
              ))}
            </div>
          ))}
          {ask && (
            <div
              id={`${uid}-row-0`}
              className="ui-cmd__row"
              role="option"
              aria-selected="true"
              data-index={0}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => run("ask")}
            >
              <span className="ui-cmd__icon" aria-hidden="true">
                <SparkIcon />
              </span>
              <span className="ui-cmd__label">
                Ask about “<span className="ui-cmd__query">{query.trim()}</span>”
              </span>
              <Keys keys="enter" mac={mac} />
            </div>
          )}
          {!q && !rows.length && <div className="ui-cmd__empty">No commands</div>}
        </div>
        <div className="ui-cmd__live" role="status" aria-live="polite">
          {said}
        </div>
      </div>
    </>
  );
}

/* ---------- Parts ---------- */

const NAMES: Record<string, [mac: string, other: string]> = {
  mod: ["⌘", "Ctrl"],
  cmd: ["⌘", "Win"],
  ctrl: ["⌃", "Ctrl"],
  alt: ["⌥", "Alt"],
  shift: ["⇧", "Shift"],
  enter: ["↵", "Enter"],
  esc: ["esc", "Esc"],
  tab: ["⇥", "Tab"],
  up: ["↑", "↑"],
  down: ["↓", "↓"],
};

/** The keycaps on the right – the same chip as Kbd, hidden from screen readers */
function Keys({ keys, mac }: { keys?: string | readonly string[]; mac: boolean }) {
  if (!keys) return null;
  const list = typeof keys === "string" ? [keys] : keys;
  if (!list.length) return null;
  return (
    <span className="ui-cmd__keys" aria-hidden="true">
      {list.map((k, i) => (
        <kbd className="ui-cmd__kbd" key={i}>
          {NAMES[k.toLowerCase()]?.[mac ? 0 : 1] ?? k.toUpperCase()}
        </kbd>
      ))}
    </span>
  );
}

function useMac() {
  const [mac, setMac] = useState(true);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)), []);
  return mac;
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

/* Icons: Hugeicons Free (MIT, © Hugeicons, hugeicons.com) */
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 17.5 22 22M20 11a9 9 0 1 0-18 0 9 9 0 0 0 18 0Z" />
    </svg>
  );
}
function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c.5 4.5 2.5 6.5 7 7-4.5.5-6.5 2.5-7 7-.5-4.5-2.5-6.5-7-7 4.5-.5 6.5-2.5 7-7Z" />
    </svg>
  );
}

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-cmd (see Theming in the docs) */
.ui-cmd {
  --ui-cmd-surface: var(--aui-overlay, var(--aui-surface, #ffffff));
  --ui-cmd-ink: var(--aui-ink, #171717);
  --ui-cmd-text: var(--aui-ink, #262626);
  --ui-cmd-icon: var(--aui-muted, #8f8f8f);
  --ui-cmd-faint: var(--aui-placeholder, #a3a3a3);
  --ui-cmd-line: var(--aui-border, #ececec);
  --ui-cmd-glow: #f4f4f5;
  --ui-cmd-kbd-bg: var(--aui-surface, #ffffff);
  --ui-cmd-kbd-line: var(--aui-border, #e3e3e3);
  --ui-cmd-kbd-depth: #d9d9d9;
  --ui-cmd-shadow: var(--aui-shadow-popover, 0 0 0 1px rgba(0, 0, 0, 0.06), 0 18px 40px -12px rgba(0, 0, 0, 0.18), 0 4px 12px -4px rgba(0, 0, 0, 0.06));
  --ui-cmd-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-cmd-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  --ui-cmd-radius: calc(var(--aui-radius-lg, 10px) + 6px);
  --ui-cmd-row-radius: calc(var(--aui-radius-sm, 5px) + 4px);

  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  max-width: 600px;
  max-height: min(440px, calc(100vh - 32px));
  border-radius: var(--ui-cmd-radius);
  background: var(--ui-cmd-surface);
  box-shadow: var(--ui-cmd-shadow);
  color: var(--ui-cmd-ink);
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13.5px;
  line-height: 20px;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  animation: ui-cmd-in 220ms var(--ui-cmd-ease) both;
}
.ui-cmd *, .ui-cmd *::before, .ui-cmd *::after { box-sizing: border-box; }

/* The field: a borderless input over a hairline */
.ui-cmd__field { display: flex; flex: none; align-items: center; gap: 10px; height: 52px; padding: 0 14px 0 16px; border-bottom: 1px solid var(--ui-cmd-line); }
.ui-cmd__search { display: grid; flex: none; place-items: center; width: 18px; height: 18px; color: var(--ui-cmd-icon); }
.ui-cmd__search > svg { width: 18px; height: 18px; }
.ui-cmd__input { flex: 1; min-width: 0; height: 100%; margin: 0; padding: 0; border: 0; outline: 0; background: transparent; color: var(--ui-cmd-ink); font: inherit; font-size: 15px; letter-spacing: -0.01em; }
.ui-cmd__input::placeholder { color: var(--ui-cmd-faint); }
.ui-cmd__clear { display: grid; flex: none; place-items: center; width: 24px; height: 24px; margin: 0; padding: 0; border: 0; border-radius: 6px; background: transparent; color: var(--ui-cmd-icon); cursor: pointer; transition: background-color 120ms ease, color 120ms ease; }
.ui-cmd__clear:hover { background: var(--ui-cmd-glow); color: var(--ui-cmd-ink); }
.ui-cmd__clear:focus-visible { outline: 2px solid var(--ui-cmd-focus); outline-offset: 1px; }
.ui-cmd__clear > svg { width: 14px; height: 14px; }

/* The list scrolls; one soft highlight glides between the rows */
.ui-cmd__list { position: relative; flex: 1 1 auto; min-height: 0; padding: 6px; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; }
.ui-cmd__glow { position: absolute; top: 0; left: 6px; right: 6px; border-radius: var(--ui-cmd-row-radius); background: var(--ui-cmd-glow); pointer-events: none; transition: transform 180ms var(--ui-cmd-ease), height 180ms var(--ui-cmd-ease), opacity 120ms ease; }
.ui-cmd__group + .ui-cmd__group { margin-top: 4px; }
.ui-cmd__heading { padding: 8px 10px 4px; font-size: 12px; line-height: 16px; font-weight: 500; color: var(--ui-cmd-icon); }

.ui-cmd__row { position: relative; display: flex; align-items: center; gap: 10px; min-height: 38px; padding: 0 10px; border-radius: var(--ui-cmd-row-radius); color: var(--ui-cmd-text); white-space: nowrap; cursor: pointer; user-select: none; transition: color 120ms ease; }
.ui-cmd__row[aria-selected="true"] { color: var(--ui-cmd-ink); }
.ui-cmd__icon { display: grid; flex: none; place-items: center; width: 16px; height: 16px; color: var(--ui-cmd-icon); transition: color 120ms ease; }
.ui-cmd__icon > svg, .ui-cmd__icon > img { display: block; width: 16px; height: 16px; }
.ui-cmd__row[aria-selected="true"] .ui-cmd__icon:not([data-logo]) { color: var(--ui-cmd-ink); }
.ui-cmd__label { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.ui-cmd__query { font-weight: 500; }
.ui-cmd__hint { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; color: var(--ui-cmd-faint); font-size: 12.5px; }
.ui-cmd__row:not(:has(.ui-cmd__hint)) .ui-cmd__label { flex: 1; }

/* Keycaps: the Kbd chip */
.ui-cmd__keys { display: inline-flex; flex: none; gap: 3px; margin-inline-start: 12px; direction: ltr; }
.ui-cmd__kbd { display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 18px; padding: 0 5px; border-radius: calc(var(--aui-radius-sm, 7px) - 2px); background: var(--ui-cmd-kbd-bg); box-shadow: inset 0 0 0 1px var(--ui-cmd-kbd-line), inset 0 -1px 0 var(--ui-cmd-kbd-depth); color: var(--ui-cmd-icon); font: inherit; font-size: 11px; font-weight: 500; line-height: 1; letter-spacing: 0.02em; font-variant-numeric: tabular-nums; }

.ui-cmd__empty { padding: 24px 10px; text-align: center; color: var(--ui-cmd-faint); }
.ui-cmd__live { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

@keyframes ui-cmd-in { from { opacity: 0; transform: scale(0.98) translateY(-4px); } }

/* Phones: no shortcut keys or hints */
@media (max-width: 600px) {
  .ui-cmd__keys, .ui-cmd__hint { display: none; }
  .ui-cmd__row { min-height: 44px; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-cmd { animation-duration: 1ms; }
  .ui-cmd__glow, .ui-cmd__row, .ui-cmd__icon { transition-duration: 1ms; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-cmd {
  --ui-cmd-surface: var(--aui-overlay, var(--aui-surface, #19191b));
  --ui-cmd-ink: var(--aui-ink, #ededed);
  --ui-cmd-text: var(--aui-ink, #e4e4e7);
  --ui-cmd-icon: var(--aui-muted, #8b8b92);
  --ui-cmd-faint: var(--aui-placeholder, #5c5c63);
  --ui-cmd-line: var(--aui-border, #2a2a2e);
  --ui-cmd-glow: #26262a;
  --ui-cmd-kbd-bg: var(--aui-surface, #232326);
  --ui-cmd-kbd-line: var(--aui-border, rgba(255, 255, 255, 0.1));
  --ui-cmd-kbd-depth: rgba(0, 0, 0, 0.5);
  --ui-cmd-shadow: var(--aui-shadow-popover, 0 0 0 1px rgba(255, 255, 255, 0.06), 0 18px 40px -12px rgba(0, 0, 0, 0.6));
  --ui-cmd-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
  color-scheme: dark;
}
`;
