"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

/*
 * Toaster – a single self-contained file.
 * Rebuilt from the public affectUI spec (https://www.affectui.com/components/toaster): same props, same toast() API,
 * styled with the same tokens as Dropdown Menu and Button. The original is affectUI Pro; this is not its source.
 *
 * Mount <Toaster /> once near the root, then call toast() from anywhere – no hook or provider. The stack fans out on
 * hover and focus, a hairline runs down with the timer, promise toasts morph from spinner to check, swipe to dismiss.
 * F8 moves focus to the newest toast; Esc closes the focused one.
 * The styles are injected below, so no extra files are needed.
 */

export type ToastId = string;
export type ToastType = "default" | "success" | "error" | "info" | "loading";

export type ToastOptions = {
  /** Pass an existing id to update that toast in place – the timer restarts, the text crossfades */
  id?: ToastId;
  description?: ReactNode;
  /** A button on the toast – clicking it closes the toast unless onClick calls event.preventDefault() */
  action?: { label: string; onClick: (event: MouseEvent<HTMLButtonElement>) => void };
  /** On-screen time in ms – Infinity keeps it open */
  duration?: number;
  /** Replaces the type's icon */
  icon?: ReactNode;
  /** Sends it to the <Toaster id="…"> with this id only */
  toaster?: string;
  onDismiss?: (id: ToastId) => void;
};

type Message = ReactNode | { title: ReactNode; description?: ReactNode };
type PromiseMessages<T> = {
  loading: Message;
  success: Message | ((value: T) => Message);
  error: Message | ((error: unknown) => Message);
};

export type ToasterProps = {
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
  /** Sits in the nearest positioned ancestor instead of the viewport */
  inline?: boolean;
  /** Shows only toasts sent with { toaster: id } – for a second, separate stack */
  id?: string;
  /** Default on-screen time in ms; Infinity keeps toasts open */
  duration?: number;
  /** How many show at once – older ones wait with their timer paused */
  visibleToasts?: number;
  /** Always fanned out instead of on hover and focus */
  expand?: boolean;
  /** Distance from the edges in px (phones always use 12px) */
  offset?: number;
  /** Space between toasts when fanned out, in px */
  gap?: number;
  /** KeyboardEvent.key or .code that moves focus to the newest toast; null turns it off */
  hotkey?: string | null;
  /** A 1px line along the bottom that runs down with the timer */
  hairline?: boolean;
  /** A small close button on hover and focus (always on touch screens) */
  closeButton?: boolean;
  /** The region's name for screen readers – the hotkey is added */
  label?: string;
  className?: string;
};

/* ---------- Store ---------- */

type Record_ = {
  id: ToastId;
  type: ToastType;
  title: ReactNode;
  description?: ReactNode;
  action?: ToastOptions["action"];
  duration?: number;
  icon?: ReactNode;
  toaster?: string;
  onDismiss?: (id: ToastId) => void;
  /** Bumped on every update – restarts the timer and replays the crossfade */
  version: number;
  leaving?: boolean;
};

let toasts: Record_[] = [];
const listeners = new Set<() => void>();
let counter = 0;
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => (listeners.add(l), () => listeners.delete(l));
const snapshot = () => toasts;

function upsert(type: ToastType, title: ReactNode, options: ToastOptions = {}): ToastId {
  const id = options.id ?? `t${++counter}`;
  const existing = toasts.find((t) => t.id === id && !t.leaving);
  if (existing) {
    toasts = toasts.map((t) => (t === existing ? { ...t, ...options, type, title, version: t.version + 1 } : t));
  } else {
    toasts = [{ ...options, id, type, title, version: 0 }, ...toasts];
  }
  emit();
  return id;
}

function dismiss(id?: ToastId) {
  const gone = toasts.filter((t) => !t.leaving && (id === undefined || t.id === id));
  if (!gone.length) return;
  toasts = toasts.map((t) => (gone.includes(t) ? { ...t, leaving: true } : t));
  emit();
  gone.forEach((t) => t.onDismiss?.(t.id));
  window.setTimeout(() => {
    toasts = toasts.filter((t) => !gone.some((g) => g.id === t.id));
    emit();
  }, LEAVE);
}

const resolve = (m: Message): { title: ReactNode; description?: ReactNode } =>
  m !== null && typeof m === "object" && "title" in (m as object) && !("$$typeof" in (m as object))
    ? (m as { title: ReactNode; description?: ReactNode })
    : { title: m as ReactNode };

export const toast = Object.assign((title: ReactNode, options?: ToastOptions) => upsert("default", title, options), {
  success: (title: ReactNode, options?: ToastOptions) => upsert("success", title, options),
  error: (title: ReactNode, options?: ToastOptions) => upsert("error", title, options),
  info: (title: ReactNode, options?: ToastOptions) => upsert("info", title, options),
  loading: (title: ReactNode, options?: ToastOptions) => upsert("loading", title, { duration: Infinity, ...options }),
  promise<T>(promise: Promise<T> | (() => Promise<T>), messages: PromiseMessages<T>, options: ToastOptions = {}): Promise<T> {
    const first = resolve(messages.loading);
    const id = upsert("loading", first.title, { ...options, description: first.description, duration: Infinity });
    const p = typeof promise === "function" ? promise() : promise;
    p.then(
      (value) => {
        const m = resolve(typeof messages.success === "function" ? (messages.success as (v: T) => Message)(value) : messages.success);
        upsert("success", m.title, { ...options, id, description: m.description, duration: options.duration });
      },
      (error) => {
        const m = resolve(typeof messages.error === "function" ? (messages.error as (e: unknown) => Message)(error) : messages.error);
        upsert("error", m.title, { ...options, id, description: m.description, duration: options.duration });
      },
    );
    return p;
  },
  dismiss,
});

/* ---------- Toaster ---------- */

const LEAVE = 200;
const PEEK = 12;

export function Toaster({
  position = "bottom-right",
  inline = false,
  id,
  duration = 4000,
  visibleToasts = 3,
  expand = false,
  offset,
  gap = 10,
  hotkey = "F8",
  hairline = true,
  closeButton = true,
  label = "Notifications",
  className,
}: ToasterProps) {
  const all = useSyncExternalStore(subscribe, snapshot, () => []);
  const mine = all.filter((t) => (t.toaster ?? undefined) === id);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const region = useRef<HTMLElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  const [y, x] = position.split("-") as ["top" | "bottom", "left" | "center" | "right"];
  const open = expand || hover || focus;
  const live = mine.filter((t) => !t.leaving);
  const shown = new Set(live.slice(0, Math.max(1, visibleToasts)).map((t) => t.id));
  const paused = hover || focus || hidden;

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // F8 (or the hotkey) jumps to the newest toast and fans the stack out
  useEffect(() => {
    if (!hotkey) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== hotkey && e.code !== hotkey) return;
      const first = region.current?.querySelector<HTMLElement>(".ui-toast:not([data-leaving])");
      if (!first) return;
      e.preventDefault();
      if (!region.current?.contains(document.activeElement)) returnTo.current = document.activeElement as HTMLElement | null;
      first.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotkey]);

  // Nothing left to focus – focus goes back to where it was before F8
  useEffect(() => {
    if (!live.length && focus) {
      setFocus(false);
      returnTo.current?.focus?.();
      returnTo.current = null;
    }
  }, [live.length, focus]);

  const measure = useCallback((tid: string, h: number) => setHeights((cur) => (cur[tid] === h ? cur : { ...cur, [tid]: h })), []);

  // Where each toast sits: fanned out they stack with the gap, folded they peek behind the newest one
  const order = live.filter((t) => shown.has(t.id));
  const front = order[0] ? heights[order[0].id] ?? 0 : 0;
  const tops: Record<string, number> = {};
  let acc = 0;
  order.forEach((t, i) => {
    tops[t.id] = open ? acc : Math.min(i, 2) * PEEK;
    acc += (heights[t.id] ?? 0) + gap;
  });
  const height = order.length ? (open ? acc - gap : front + Math.min(order.length - 1, 2) * PEEK) : 0;

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== "Escape") return;
    const el = (e.target as HTMLElement).closest<HTMLElement>(".ui-toast");
    const tid = el?.dataset.id ?? live[0]?.id;
    if (!tid) return;
    e.preventDefault();
    const next = live[live.findIndex((t) => t.id === tid) + 1];
    dismiss(tid);
    if (next) requestAnimationFrame(() => region.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(next.id)}"]`)?.focus());
  };

  return (
    <>
      <style href="ui-toaster" precedence="default">
        {css}
      </style>
      <section
        ref={region}
        className={["ui-toaster", className].filter(Boolean).join(" ")}
        aria-label={hotkey ? `${label} (${hotkey})` : label}
        tabIndex={-1}
        data-y={y}
        data-x={x}
        data-inline={inline || undefined}
        data-open={open || undefined}
        style={{ "--ui-toast-offset": `${offset ?? (inline ? 20 : 24)}px`, height } as CSSProperties}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setHover(false)}
        onPointerDown={(e) => e.pointerType !== "mouse" && setHover(true)}
        onFocus={() => setFocus(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setFocus(false)}
        onKeyDown={onKeyDown}
      >
        <ol className="ui-toaster__list">
          {mine.map((t) => {
            const i = order.indexOf(t);
            return (
              <Toast
                key={t.id}
                toast={t}
                depth={i}
                top={tops[t.id] ?? 0}
                front={front}
                open={open}
                waiting={!t.leaving && !shown.has(t.id)}
                paused={paused || !shown.has(t.id)}
                duration={t.duration ?? (t.type === "loading" ? Infinity : duration)}
                hairline={hairline}
                closeButton={closeButton}
                measure={measure}
              />
            );
          })}
        </ol>
        {/* Errors go first: an assertive region; everything else is polite */}
        <div className="ui-toaster__sr" role="status" aria-live="polite">
          {live[0] && live[0].type !== "error" ? <Spoken t={live[0]} /> : null}
        </div>
        <div className="ui-toaster__sr" role="alert" aria-live="assertive">
          {live[0] && live[0].type === "error" ? <Spoken t={live[0]} /> : null}
        </div>
      </section>
    </>
  );
}

function Spoken({ t }: { t: Record_ }) {
  return (
    <span key={`${t.id}-${t.version}`}>
      {t.title}
      {t.description ? <>. {t.description}</> : null}
    </span>
  );
}

type ToastProps = {
  toast: Record_;
  depth: number;
  top: number;
  front: number;
  open: boolean;
  waiting: boolean;
  paused: boolean;
  duration: number;
  hairline: boolean;
  closeButton: boolean;
  measure: (id: string, h: number) => void;
};

function Toast({ toast: t, depth, top, front, open, waiting, paused, duration, hairline, closeButton, measure }: ToastProps) {
  const el = useRef<HTMLLIElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const left = useRef(duration);
  const started = useRef(0);
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const f = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(f);
  }, []);

  useLayoutEffect(() => {
    const node = inner.current;
    if (!node) return;
    const ro = new ResizeObserver(() => measure(t.id, node.offsetHeight));
    ro.observe(node);
    measure(t.id, node.offsetHeight);
    return () => ro.disconnect();
  }, [t.id, measure]);

  // The timer: restarts on update, pauses while the stack is hovered, focused or the tab is hidden
  useEffect(() => {
    left.current = duration;
  }, [t.version, duration]);
  useEffect(() => {
    if (t.leaving || paused || !Number.isFinite(duration)) return;
    started.current = Date.now();
    const timer = window.setTimeout(() => dismiss(t.id), Math.max(0, left.current));
    return () => {
      window.clearTimeout(timer);
      left.current -= Date.now() - started.current;
    };
  }, [paused, t.leaving, t.version, t.id, duration]);

  const onPointerDown = (e: PointerEvent<HTMLLIElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    swipe.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLLIElement>) => {
    const s = swipe.current;
    if (!s || s.id !== e.pointerId) return;
    setDrag({ x: e.clientX - s.x, y: Math.max(0, e.clientY - s.y) });
  };
  const onPointerUp = () => {
    const d = drag;
    swipe.current = null;
    setDrag(null);
    if (d && (Math.abs(d.x) > 60 || d.y > 40)) dismiss(t.id);
  };

  const behind = !open && depth > 0;
  const style = {
    "--y": `${top}px`,
    "--scale": open || depth <= 0 ? 1 : 1 - Math.min(depth, 2) * 0.05,
    "--front": `${front}px`,
    "--dx": drag ? `${drag.x}px` : "0px",
    "--dy": drag ? `${drag.y}px` : "0px",
    "--duration": `${Number.isFinite(duration) ? duration : 0}ms`,
    zIndex: 100 - Math.max(0, depth),
  } as CSSProperties;

  return (
    <li
      ref={el}
      className="ui-toast"
      data-id={t.id}
      data-type={t.type}
      data-mounted={mounted || undefined}
      data-behind={behind || undefined}
      data-waiting={waiting || undefined}
      data-leaving={t.leaving || undefined}
      data-dragging={drag ? "" : undefined}
      tabIndex={waiting ? -1 : 0}
      aria-hidden={waiting || undefined}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="ui-toast__card" ref={inner}>
        <div className="ui-toast__body" key={t.version}>
          {(t.icon || t.type !== "default") && (
            <span className="ui-toast__icon" aria-hidden="true" key={t.type}>
              {t.icon ?? ICONS[t.type]}
            </span>
          )}
          <div className="ui-toast__text">
            <div className="ui-toast__title">{t.title}</div>
            {t.description && <div className="ui-toast__desc">{t.description}</div>}
          </div>
          {t.action && (
            <button
              type="button"
              className="ui-toast__action"
              onClick={(e) => {
                t.action!.onClick(e);
                if (!e.defaultPrevented) dismiss(t.id);
              }}
            >
              {t.action.label}
            </button>
          )}
        </div>
        {closeButton && (
          <button type="button" className="ui-toast__close" aria-label="Close" onClick={() => dismiss(t.id)}>
            <CloseIcon />
          </button>
        )}
        {hairline && Number.isFinite(duration) && (
          <span className="ui-toast__line" aria-hidden="true" key={`line-${t.version}`} data-paused={paused || undefined} />
        )}
      </div>
    </li>
  );
}

/* Icons: Hugeicons Free (MIT, © Hugeicons, hugeicons.com) */
const ICONS: Record<ToastType, ReactNode> = {
  default: null,
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.25" opacity="0.18" fill="currentColor" stroke="none" />
      <path className="ui-toast__tick" d="M8 12.5 10.5 15 16 9" pathLength={1} />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.25" opacity="0.18" fill="currentColor" stroke="none" />
      <path d="M12 7.5v5.5M12 16.5h.01" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.25" />
      <path d="M12 16.5V11.5M12 8h.01" />
    </svg>
  ),
  loading: (
    <svg className="ui-toast__spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="8.5" opacity="0.2" />
      <path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5" />
    </svg>
  ),
};
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 7 7 17M7 7l10 10" />
    </svg>
  );
}

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-toaster (see Theming in the docs) */
.ui-toaster {
  --ui-toast-surface: var(--aui-overlay, var(--aui-surface, #ffffff));
  --ui-toast-ink: var(--aui-ink, #171717);
  --ui-toast-muted: var(--aui-muted, #737373);
  --ui-toast-icon: var(--aui-muted, #8f8f8f);
  --ui-toast-line: var(--aui-border, #ececec);
  --ui-toast-fill: #f4f4f5;
  --ui-toast-success: var(--aui-success, #1e8a4f);
  --ui-toast-error: var(--aui-danger, #d92d20);
  --ui-toast-btn-top: #323137;
  --ui-toast-btn-bottom: #201e25;
  --ui-toast-btn-ink: #fafafa;
  --ui-toast-timer: var(--aui-border-strong, #d4d4d8);
  --ui-toast-shadow: var(--aui-shadow-popover, 0 0 0 1px rgba(0, 0, 0, 0.06), 0 18px 40px -12px rgba(0, 0, 0, 0.18), 0 4px 12px -4px rgba(0, 0, 0, 0.06));
  --ui-toast-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-toast-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  --ui-toast-radius: calc(var(--aui-radius-lg, 10px) + 4px);
  --ui-toast-width: 356px;

  position: fixed;
  z-index: 1100;
  box-sizing: border-box;
  width: var(--ui-toast-width);
  margin: 0;
  padding: 0;
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13.5px;
  line-height: 20px;
  color: var(--ui-toast-ink);
  -webkit-font-smoothing: antialiased;
  outline: none;
  transition: height 320ms var(--ui-toast-ease);
}
.ui-toaster[data-inline] { position: absolute; }
.ui-toaster[data-y="top"] { top: var(--ui-toast-offset); }
.ui-toaster[data-y="bottom"] { bottom: var(--ui-toast-offset); }
.ui-toaster[data-x="left"] { left: var(--ui-toast-offset); }
.ui-toaster[data-x="right"] { right: var(--ui-toast-offset); }
.ui-toaster[data-x="center"] { left: 50%; translate: -50% 0; }
/* A hover bridge so the fanned-out stack doesn't fold while the pointer crosses a gap */
.ui-toaster[data-open]::after { content: ""; position: absolute; inset: -12px; z-index: -1; }
.ui-toaster *, .ui-toaster *::before, .ui-toaster *::after { box-sizing: border-box; }
.ui-toaster__list { position: relative; height: 100%; margin: 0; padding: 0; list-style: none; }
.ui-toaster__sr { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

/* One toast: placed by --y from the stack's edge, scaled down behind the newest one */
.ui-toast {
  --enter: 100%;
  position: absolute;
  left: 0;
  right: 0;
  outline: none;
  touch-action: none;
  opacity: 0;
  transform: translate(var(--dx), calc(var(--dir) * var(--enter))) scale(var(--scale));
  transition: transform 400ms var(--ui-toast-ease), opacity 400ms var(--ui-toast-ease);
}
.ui-toaster[data-y="bottom"] .ui-toast { --dir: 1; bottom: 0; transform-origin: center top; }
.ui-toaster[data-y="top"] .ui-toast { --dir: -1; top: 0; transform-origin: center bottom; }
.ui-toast[data-mounted] { --enter: 0px; opacity: 1; }
.ui-toaster[data-y="bottom"] .ui-toast[data-mounted] { transform: translate(var(--dx), calc(var(--dy) - var(--y))) scale(var(--scale)); }
.ui-toaster[data-y="top"] .ui-toast[data-mounted] { transform: translate(var(--dx), calc(var(--dy) + var(--y))) scale(var(--scale)); }
.ui-toast[data-dragging] { transition: none; }
.ui-toast[data-leaving] { opacity: 0; transition-duration: 200ms; }
.ui-toast[data-waiting] { opacity: 0; pointer-events: none; }

.ui-toast__card {
  position: relative;
  overflow: hidden;
  border-radius: var(--ui-toast-radius);
  background: var(--ui-toast-surface);
  box-shadow: var(--ui-toast-shadow);
  transition: height 320ms var(--ui-toast-ease);
}
.ui-toast:focus-visible .ui-toast__card { outline: 2px solid var(--ui-toast-focus); outline-offset: 2px; }
/* Folded: the cards behind take the front card's height and hide their text */
.ui-toast[data-behind] .ui-toast__card { height: var(--front); }
.ui-toast[data-behind] .ui-toast__body { opacity: 0; }

.ui-toast__body { display: flex; align-items: flex-start; gap: 10px; padding: 13px 14px; transition: opacity 200ms ease; animation: ui-toast-fade 240ms ease both; }
.ui-toast__icon { display: grid; flex: none; place-items: center; width: 18px; height: 20px; color: var(--ui-toast-icon); animation: ui-toast-pop 320ms var(--ui-toast-ease) both; }
.ui-toast__icon > svg { width: 18px; height: 18px; }
.ui-toast[data-type="success"] .ui-toast__icon { color: var(--ui-toast-success); }
.ui-toast[data-type="error"] .ui-toast__icon { color: var(--ui-toast-error); }
.ui-toast__tick { stroke-dasharray: 1; animation: ui-toast-draw 320ms 80ms var(--ui-toast-ease) both; }
.ui-toast__spinner { animation: ui-toast-spin 900ms linear infinite; }

.ui-toast__text { flex: 1; min-width: 0; }
.ui-toast__title { font-weight: 500; letter-spacing: -0.01em; overflow-wrap: anywhere; }
.ui-toast__desc { margin-top: 1px; font-size: 12.5px; line-height: 18px; color: var(--ui-toast-muted); overflow-wrap: anywhere; }

/* The action: a small dark chip, like the primary Button */
.ui-toast__action {
  flex: none;
  align-self: center;
  height: 26px;
  margin: 0;
  padding: 0 10px;
  border: 0;
  border-radius: calc(var(--aui-radius, 10px) - 3px);
  background: linear-gradient(var(--ui-toast-btn-top), var(--ui-toast-btn-bottom));
  color: var(--ui-toast-btn-ink);
  font: inherit;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 160ms var(--ui-toast-ease), opacity 160ms ease;
}
.ui-toast__action:active { transform: scale(0.97); }
.ui-toast__action:focus-visible, .ui-toast__close:focus-visible { outline: 2px solid var(--ui-toast-focus); outline-offset: 2px; }

/* Close: a small round button in the corner, on hover and focus */
.ui-toast__close {
  position: absolute;
  top: 6px;
  right: 6px;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--ui-toast-fill);
  color: var(--ui-toast-muted);
  cursor: pointer;
  opacity: 0;
  transition: opacity 160ms ease, color 120ms ease;
}
.ui-toast__close > svg { width: 12px; height: 12px; }
.ui-toast:hover .ui-toast__close, .ui-toast:focus-within .ui-toast__close { opacity: 1; }
.ui-toast__close:hover { color: var(--ui-toast-ink); }
.ui-toast:has(.ui-toast__close) .ui-toast__text { padding-right: 14px; }

/* The timer: a 1px line along the bottom that runs down, and stops while paused */
.ui-toast__line { position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: var(--ui-toast-timer); transform-origin: left; animation: ui-toast-timer var(--duration) linear both; }
.ui-toast__line[data-paused] { animation-play-state: paused; }

@keyframes ui-toast-timer { from { transform: scaleX(1); } to { transform: scaleX(0); } }
@keyframes ui-toast-fade { from { opacity: 0; } }
@keyframes ui-toast-pop { from { opacity: 0; transform: scale(0.6); filter: blur(2px); } }
@keyframes ui-toast-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes ui-toast-spin { to { transform: rotate(360deg); } }

/* Phones: full width with 12px gutters, above the home indicator */
@media (max-width: 600px) {
  .ui-toaster:not([data-inline]) { --ui-toast-offset: 12px; left: 12px; right: 12px; width: auto; translate: none; }
  .ui-toaster[data-y="bottom"]:not([data-inline]) { bottom: calc(12px + env(safe-area-inset-bottom)); }
}
@media (pointer: coarse) {
  .ui-toast__close { opacity: 1; width: 28px; height: 28px; }
  .ui-toast__action { height: 32px; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-toast, .ui-toaster, .ui-toast__card { transition-duration: 1ms; }
  .ui-toast__body, .ui-toast__icon, .ui-toast__tick { animation-duration: 1ms; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-toaster {
  --ui-toast-surface: var(--aui-overlay, var(--aui-surface, #19191b));
  --ui-toast-ink: var(--aui-ink, #ededed);
  --ui-toast-muted: var(--aui-muted, #8f8f8f);
  --ui-toast-icon: var(--aui-muted, #8b8b92);
  --ui-toast-line: var(--aui-border, #2a2a2e);
  --ui-toast-fill: #26262a;
  --ui-toast-success: var(--aui-success, #5fc88a);
  --ui-toast-error: var(--aui-danger, #ff8a7a);
  --ui-toast-btn-top: #f4f4f5;
  --ui-toast-btn-bottom: #e4e4e7;
  --ui-toast-btn-ink: #121213;
  --ui-toast-timer: var(--aui-border-strong, #3a3a40);
  --ui-toast-shadow: var(--aui-shadow-popover, 0 0 0 1px rgba(255, 255, 255, 0.06), 0 18px 40px -12px rgba(0, 0, 0, 0.6));
  --ui-toast-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
  color-scheme: dark;
}
`;
