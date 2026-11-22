# Component schemas

Generated from the source in `frontend/src/components/ui/` by `scripts/gen-schemas.py` — the exported types are the component contracts. Do not edit by hand; regenerate after changing a component.


## button

Exports: `Button`

```ts
export type ButtonProps = ComponentPropsWithRef<"button"> & {
  /** primary: dark and filled · secondary: white with an outline · ghost: text only · destructive: red, for deleting */
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  /** Shows a shimmer over the label and blocks clicks */
  loading?: boolean;
  /** Icon before the label, e.g. an inline SVG */
  icon?: ReactNode;
  /** Icon after the label */
  iconRight?: ReactNode;
};
```


## icon-button

Exports: `IconButton`

```ts
export type HugeIcon = readonly (readonly [string, { readonly [key: string]: string | number }])[];

export type IconButtonProps = Omit<ComponentPropsWithRef<"button">, "children"> & {
  /** The glyph: any element (an inline SVG) or a Hugeicons icon object */
  icon: ReactNode | HugeIcon;
  /** What the button does – read out by screen readers and shown as the tooltip */
  label: string;
  /** ghost: just the icon, a soft wash on hover · secondary: white with a 1px edge · primary: a dark gradient */
  variant?: "ghost" | "secondary" | "primary";
  /** sm: 32 × 32 · md: 40 × 40 – the same heights as the Button – the hit area grows on touch screens */
  size?: "sm" | "md";
  /** Makes it a toggle: true or false sets aria-pressed and keeps it looking pressed while true */
  pressed?: boolean;
};
```


## toggle-group

Exports: `ToggleGroup`

```ts
export type ToggleGroupItem<T extends string = string> = {
  value: T;
  label?: ReactNode;
  icon?: ReactNode;
  /** Accessible name and tooltip – needed when the item only shows an icon */
  ariaLabel?: string;
  disabled?: boolean;
};

export type ToggleGroupProps<T extends string = string> = Shared<T> &
  (
    | {
        /** Any number of items can be on */
        type?: "multiple";
        value?: T[];
        defaultValue?: T[];
        onChange?: (value: T[]) => void;
      }
    | {
        /** At most one item is on; pressing it again turns it off (null) */
        type: "single";
        value?: T | null;
        defaultValue?: T | null;
        onChange?: (value: T | null) => void;
      }
  );
```


## segmented-control

Exports: `SegmentedControl`

```ts
export type SegmentOption<T extends string = string> = {
  value: T;
  label?: ReactNode;
  icon?: ReactNode;
  /** A small gray number after the label, e.g. unread items */
  count?: number | string;
  /** A small tinted tag after the label, e.g. "Save 20%" */
  badge?: ReactNode;
  disabled?: boolean;
  /** Accessible name – needed when the option only shows an icon */
  ariaLabel?: string;
  /** With kind="tabs": the id of the panel this tab shows */
  controls?: string;
};

export type SegmentedControlProps<T extends string = string> = {
  options: SegmentOption<T>[];
  /** Controlled value */
  value?: T;
  /** Starting value when uncontrolled – defaults to the first enabled option */
  defaultValue?: T;
  onChange?: (value: T) => void;
  size?: "sm" | "md" | "lg";
  /** "tray" = gray track with a raised pill, "underline" = text tabs with a sliding line */
  variant?: "tray" | "underline";
  /** Fill the container with equal segments */
  fullWidth?: boolean;
  /** "radio" (a radiogroup, the default) or "tabs" (a tablist that switches panels) */
  kind?: "radio" | "tabs";
  disabled?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
};
```


## tabs

Exports: `Tabs`

```ts
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
```


## dropdown-menu

Exports: `DropdownMenu`

```ts
export type HugeIcon = readonly (readonly [string, { readonly [key: string]: string | number }])[];

export type DropdownMenuItem = {
  label: string;
  /** A second line in a lighter color */
  description?: string;
  /** A 16px glyph before the label: an inline SVG or a Hugeicons icon object */
  icon?: ReactNode | HugeIcon;
  /** A brand mark (Gmail, Slack …) in place of the icon, in its own colors */
  logo?: ReactNode;
  /** Shows a check – the item becomes a choice (true or false; leave it out for a plain action) */
  checked?: boolean;
  /** How a choice is announced: one of a set (radio, the default) or on/off on its own (checkbox) */
  type?: "radio" | "checkbox";
  /** Red text and icon, e.g. Delete */
  danger?: boolean;
  /** A keyboard shortcut on the right, e.g. "⌥⌘R" – shown only, wire the keys up yourself */
  shortcut?: string;
  /** A line above this item, to group the ones after it */
  divider?: boolean;
  /** Shown, but can't be picked; the arrow keys skip it */
  disabled?: boolean;
  /** The menu stays open after a pick – for checkboxes you tick several of */
  keepOpen?: boolean;
  /** More items that open to the side on hover, →, Enter or Space */
  submenu?: DropdownMenuItem[];
  onSelect?: () => void;
};

export type DropdownMenuTriggerProps = {
  id: string;
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls"?: string;
  onClick: (event?: { detail?: number }) => void;
};

export type DropdownMenuProps = {
  /** Draws the trigger – it gets the open state, a toggle and the props to spread on it */
  trigger: (props: { open: boolean; toggle: (event?: { detail?: number }) => void; triggerProps: DropdownMenuTriggerProps }) => ReactNode;
  items: DropdownMenuItem[];
  /** start: the menu's left edge on the trigger's · end: the right edges line up */
  align?: "start" | "end";
  /** Where it opens; it flips when there is no room */
  side?: "bottom" | "top";
  /** A small heading above the items – it also names the menu */
  title?: string;
  /** Anything above the items, e.g. who is signed in */
  header?: ReactNode;
  /** Makes it controlled */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Classes on the menu panel itself (className goes on the wrapper around trigger and menu) */
  menuClassName?: string;
  /** The menu's width – by default it fits its items (at least 168px) */
  width?: number | string;
  /** Shown when there are no items */
  empty?: ReactNode;
  /** On the wrapper around the trigger */
  className?: string;
  /** Names the menu when there is no title */
  "aria-label"?: string;
};
```


## context-menu

Exports: `ContextMenu`

```ts
export type HugeIcon = readonly (readonly [string, { readonly [key: string]: string | number }])[];

export type ContextMenuItem = {
  label: string;
  /** A second line in a lighter color */
  description?: string;
  /** A 16px glyph before the label: an inline SVG or a Hugeicons icon object */
  icon?: ReactNode | HugeIcon;
  /** A brand mark (Gmail, Slack …) in place of the icon, in its own colors */
  logo?: ReactNode;
  /** Shows a check – the item becomes a choice (true or false; leave it out for a plain action) */
  checked?: boolean;
  /** How a choice is announced: one of a set (radio, the default) or on/off on its own (checkbox) */
  type?: "radio" | "checkbox";
  /** Red text and icon, e.g. Delete */
  danger?: boolean;
  /** A keyboard shortcut on the right, e.g. "⌘C" – shown only, wire the keys up yourself */
  shortcut?: string;
  /** A line above this item, to group the ones after it */
  divider?: boolean;
  /** Shown, but can't be picked; the arrow keys skip it */
  disabled?: boolean;
  /** The menu stays open after a pick – for checkboxes you tick several of */
  keepOpen?: boolean;
  /** More items that open to the side on hover, →, Enter or Space */
  submenu?: ContextMenuItem[];
  onSelect?: () => void;
};

export type ContextMenuProps = {
  /** The area it opens on – exactly one element that takes a ref: a row, a card, a list, a canvas */
  children: ReactElement;
  /**
   * The items – or a function that builds them for the element under the pointer (or the focused one), so one menu
   * can cover a whole list: `(target) => target.closest("[data-file]") ? fileItems : listItems`. No items: the
   * browser's own menu shows
   */
  items: ContextMenuItem[] | ((target: HTMLElement) => ContextMenuItem[]);
  /** A small heading above the items – it also names the menu */
  title?: string;
  /** Names the menu when there is no title */
  "aria-label"?: string;
  /** Never opens – the browser's own menu shows */
  disabled?: boolean;
  /** Called when it opens (with the element it opened on) and when it closes – e.g. to mark the row it is about */
  onOpenChange?: (open: boolean, target: HTMLElement | null) => void;
  /** The menu's width – by default it fits its items (at least 168px) */
  width?: number | string;
  /** Classes on the menu panel */
  menuClassName?: string;
};
```


## command-menu

Exports: `CommandMenu`

```ts
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
```


## text-field

Exports: `TextField`

```ts
export type TextFieldProps = Omit<ComponentPropsWithRef<"input">, "size" | "prefix"> & {
  /** Shown above the field and tied to it */
  label?: ReactNode;
  /** A quiet line under the field – the error takes its place while there is one */
  hint?: ReactNode;
  /** Marks the field invalid and shows this under it, in place of the hint */
  error?: ReactNode;
  /** Text or an icon inside the field, before the value – e.g. "https://" or a search icon */
  prefix?: ReactNode;
  /** Text or an icon inside the field, after the value – e.g. ".acme.app" or "USD" */
  suffix?: ReactNode;
  /** sm 28 · md 32 · lg 36 high */
  size?: "sm" | "md" | "lg";
  /** "Optional" next to the label */
  optional?: boolean;
  /** A small × that empties the field while it has a value */
  clearable?: boolean;
  /** A copy button – for API keys, links and IDs, usually with readOnly */
  copyable?: boolean;
  /** Shows "12/40" under the field; needs maxLength */
  counter?: boolean;
  /** Called after the × emptied the field (onChange fires too) */
  onClear?: () => void;
  /** Extra class on the input itself; className goes on the wrapper */
  inputClassName?: string;
};
```


## form-field

Exports: `FormField`

```ts
export type FormFieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  "aria-required"?: true;
  /** The label's id – for controls a <label> can't name, like a radio group: pass it as aria-labelledby */
  labelId: string;
  disabled?: boolean;
};

export type FormFieldProps = Omit<ComponentPropsWithRef<"div">, "children"> & {
  /** Shown above the control and tied to it */
  label?: ReactNode;
  /** A quiet line under the control – the error takes its place while there is one */
  hint?: ReactNode;
  /** Marks the control invalid and shows this under it, in place of the hint; true marks it without a message */
  error?: ReactNode;
  /** A small mark after the label, and aria-required on the control */
  required?: boolean;
  /** "Optional" next to the label – for forms where most fields are required */
  optional?: boolean;
  /** Under the control at the end, e.g. "12/40" – read out with the hint */
  counter?: ReactNode;
  /** Dims the field and disables the control */
  disabled?: boolean;
  /** The control's id – it keeps its own id if it has one, otherwise one is made up */
  htmlFor?: string;
  /** One control element – it gets the ids and aria attributes – or a function that spreads them where they belong */
  children: ReactElement | ((control: FormFieldControlProps) => ReactNode);
};
```


## select

Exports: `Select`

```ts
export type SelectOption = {
  value: string;
  label: string;
  /** A quiet second line under the label */
  description?: string;
  /** A 16px icon before the label, e.g. an inline SVG */
  icon?: ReactNode;
  disabled?: boolean;
};

export type SelectProps = {
  options: SelectOption[];
  /** The chosen value – makes it controlled */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string, option: SelectOption) => void;
  /** Shown while nothing is chosen */
  placeholder?: string;
  /** Shown above the field and tied to it */
  label?: ReactNode;
  /** A quiet line under the field – the error takes its place while there is one */
  hint?: ReactNode;
  /** Marks the field invalid and shows this under it, in place of the hint */
  error?: ReactNode;
  /** "Optional" next to the label */
  optional?: boolean;
  /** sm 28 · md 32 · lg 36 high */
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  /** Sends the value with a form, through a hidden input */
  name?: string;
  required?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
  ref?: Ref<HTMLButtonElement>;
};
```


## switch

Exports: `Switch`

```ts
export type SwitchProps = Omit<ComponentPropsWithRef<"input">, "type" | "size" | "role"> & {
  /** Shown next to the switch; clicking it toggles */
  label?: ReactNode;
  /** A quiet second line under the label */
  description?: ReactNode;
  /** start: the switch before the text · end: after it, across the row – the settings look */
  placement?: "start" | "end";
  /** sm 16 · md 20 high */
  size?: "sm" | "md";
};
```


## dialog

Exports: `Dialog`, `AlertDialog`

```ts
export type DialogProps = Shared & {
  /** The content – it scrolls when it is taller than the window */
  children?: ReactNode;
  /** The actions, aligned to the end – they stay in view while the content scrolls */
  footer?: ReactNode;
  /** A press on the backdrop closes it */
  closeOnBackdrop?: boolean;
  /** Shows the close × in the corner */
  closeButton?: boolean;
  /** The ×'s accessible name and tooltip */
  closeLabel?: string;
};

export type AlertDialogProps = Shared & {
  /** More than the description – a list of what goes, a checkbox */
  children?: ReactNode;
  /** The confirm button's label – say what happens, e.g. "Delete agent" */
  confirmLabel?: ReactNode;
  /** The safe button's label – it gets the focus */
  cancelLabel?: ReactNode;
  /** Confirmed – return a promise to keep it open with a busy button until it settles (it stays open if it fails) */
  onConfirm?: () => void | Promise<unknown>;
  /** Cancelled – by the button, Escape or the trigger again */
  onCancel?: () => void;
  /** A red confirm button – for things that can't be undone */
  danger?: boolean;
};
```


## popover

Exports: `Popover`

```ts
export type PopoverProps = Omit<ComponentPropsWithoutRef<"div">, "title" | "children"> & {
  open: boolean;
  /** Called on a press outside, Escape, or when the focus leaves – set open to false here */
  onClose: () => void;
  children?: ReactNode;
  /** Where it opens; it flips to the other side when there is no room */
  side?: "bottom" | "top" | "right" | "left";
  /** Which edges line up: start (left, or top beside it) · center · end */
  align?: "start" | "center" | "end";
  /** Gap to the trigger in px */
  offset?: number;
  /** The element it is attached to – by default its parent element (wrap trigger and Popover in one element) */
  anchor?: RefObject<HTMLElement | null>;
  /** A heading at the top – it also names the popover */
  title?: ReactNode;
  /** A quiet line under the title – read out with it */
  description?: ReactNode;
  /** The card's width – by default it fits its content */
  width?: number | string;
  /** Moves the focus to the first control inside when it opens (or onto the card when there is none) */
  focusOnOpen?: boolean;
  /** Only the placing and the open/close: no card, padding or type of its own – your className draws it */
  unstyled?: boolean;
  ref?: Ref<HTMLDivElement>;
};
```


## tooltip

Exports: `Tooltip`

```ts
export type TooltipProps = {
  /** The label – a few words; it wraps at about 240px. Empty or null: only the child is rendered */
  content: ReactNode;
  /** A keyboard shortcut shown after the label, e.g. "⌘K" */
  shortcut?: string;
  /** Exactly one element that takes a ref and focus – a button, a link, an Icon Button */
  children: ReactElement;
  /** Where it shows; it flips to the other side when there is no room */
  side?: "top" | "bottom" | "left" | "right";
  /** Which edges line up: start · center · end (start is the left, or the right in RTL) */
  align?: "start" | "center" | "end";
  /** Gap to the trigger in px */
  offset?: number;
  /** How long the pointer rests on the trigger before it shows, in ms – keyboard focus shows it at once */
  delay?: number;
  /** Never shows it, e.g. when a label is not cut off */
  disabled?: boolean;
  /** Controls it from outside (with onOpenChange); leave it out and it opens on its own */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** A class for the label */
  className?: string;
};
```


## toaster

Exports: `toast`, `Toaster`

```ts
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
```


## badge

Exports: `Badge`

```ts
export type HugeIcon = readonly (readonly [string, { readonly [key: string]: string | number }])[];

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger" | "purple";

export type BadgeProps = ComponentPropsWithRef<"span"> & {
  /** neutral: gray, the default · info: blue, running · success: green, done · warning: orange, needs you · danger: red, failed · purple: a kind, like Beta */
  tone?: BadgeTone;
  /** sm: 20px high, 11px text · md: 22px high, 12px text */
  size?: "sm" | "md";
  /** A small dot in the tone's color before the text */
  dot?: boolean;
  /** The dot pulses softly – for running, live and recording states */
  live?: boolean;
  /** An icon before the text: any element (an inline SVG) or a Hugeicons icon object */
  icon?: ReactNode | HugeIcon;
  /** Makes it a round count: the number in place of the text, "99+" above max */
  count?: number;
  /** The highest count shown in full – above it the badge reads max+ */
  max?: number;
};
```


## kbd

Exports: `Kbd`

```ts
export type KbdPlatform = "mac" | "other";

export type KbdProps = ComponentPropsWithRef<"kbd"> & {
  /**
   * One key or a combo, e.g. "esc" or ["mod", "K"]. Named keys: mod, cmd, ctrl, alt (option), shift, enter, esc, tab,
   * space, backspace, delete, up, down, left, right, pageup, pagedown, home, end – anything else is shown as it is.
   * Leave it out to show the children as one plain key.
   */
  keys?: string | readonly string[];
  /** sm: 18px high, 11px text – in menus and hints · md: 22px high, 12px text – in lists and help */
  size?: "sm" | "md";
  /** Draw the keys for a Mac (⌘ ⌥ ⇧) or for Windows and Linux (Ctrl, Alt, Shift) – found out on its own when left out */
  platform?: KbdPlatform;
};
```


## spinner

Exports: `Spinner`

```ts
export type SpinnerProps = Omit<ComponentPropsWithRef<"svg">, "children" | "width" | "height" | "viewBox"> & {
  /** Width and height in px */
  size?: number;
  /** Announced to screen readers as a status – leave it out when text next to it already says what happens */
  label?: string;
};
```


## skeleton

Exports: `Skeleton`, `Loading`

```ts
export type SkeletonProps = Omit<ComponentPropsWithRef<"span">, "children"> & {
  /** px or any CSS length */
  width?: Length;
  /** The shape's own height – px or any CSS length */
  height?: Length;
  /** Corner radius – px, "50%" for a circle */
  radius?: Length;
  /**
   * Sits the shape in a box as tall as the text line it replaces (true = 1lh, or a length), centered in it –
   * a 10px bar in a 20px line, so the row is exactly as tall as it will be with text
   */
  line?: boolean | Length;
};

export type LoadingProps = Omit<ComponentPropsWithRef<"div">, "role"> & {
  /** What loads, for screen readers – "Loading runs" */
  label?: string;
};
```


## empty-state

Exports: `EmptyState`

```ts
export type HugeIcon = readonly (readonly [string, { readonly [key: string]: string | number }])[];

export type EmptyStateProps = Omit<ComponentPropsWithRef<"div">, "title"> & {
  /** What's empty, e.g. "No schedules yet" */
  title: ReactNode;
  /** One line on what will show up here, or how to get there */
  text?: ReactNode;
  /** The first step – usually a small secondary Button; several buttons sit in a row */
  action?: ReactNode;
  /** The glyph on the tile: an inline SVG or a Hugeicons icon object. Defaults to a file; null shows no tile */
  icon?: ReactNode | HugeIcon;
  /** Without the frame – for a panel or page where it is the only content */
  bare?: boolean;
  /** Fills its parent's height and centres itself in it – for a list or table area that keeps its size */
  tall?: boolean;
};
```


## card

Exports: `Card`, `CardHeader`, `CardContent`, `CardFooter`

```ts
export type CardProps = ComponentPropsWithRef<"div"> & {
  /** The element it renders as – section or article for a landmark-like card, li inside a list of cards */
  as?: CardElement;
  /**
   * The whole card is a click target: it lifts on hover, and a link or button in its title (CardHeader's title)
   * covers the card – other buttons inside stay clickable on their own
   */
  interactive?: boolean;
  /** Shown as picked: a darker tray and a firmer edge. Put aria-pressed or aria-current on the title's button or link */
  selected?: boolean;
};

export type CardHeaderProps = Omit<ComponentPropsWithRef<"div">, "title"> & {
  /** The title – text, or a link / button that makes the whole card clickable when the Card is interactive */
  title?: ReactNode;
  /** A quiet line or two under the title */
  description?: ReactNode;
  /** Something small at the start: an icon, a logo, an agent's mark */
  icon?: ReactNode;
  /** Something at the end of the title line: an icon button, a menu, a badge */
  action?: ReactNode;
  /** The title's element – h3 by default; pick the level that fits the page's outline */
  titleAs?: "h2" | "h3" | "h4" | "p";
};

export type CardContentProps = ComponentPropsWithRef<"div">;

export type CardFooterProps = ComponentPropsWithRef<"div">;
```


## separator

Exports: `Separator`

```ts
export type SeparatorProps = Omit<ComponentPropsWithRef<"div">, "children"> & {
  /** horizontal: a line across, as wide as its container · vertical: an upright line, 18px high in a row */
  orientation?: "horizontal" | "vertical";
  /**
   * true (the default): only a visual line, hidden from screen readers · false: a real separator (role="separator")
   * that splits content into sections screen readers announce
   */
  decorative?: boolean;
  /** A short word in the middle of a horizontal line – "or", "Earlier", "Today" */
  label?: ReactNode;
};
```


## scroll-area

Exports: `ScrollArea`

```ts
export type ScrollAreaProps = Omit<ComponentPropsWithRef<"div">, "onScroll"> & {
  /** Which way it scrolls – vertical, horizontal or both */
  orientation?: "vertical" | "horizontal" | "both";
  /** When the scrollbar shows: on hover and while scrolling · only while scrolling · always (when there is more) */
  type?: "hover" | "scroll" | "always";
  /** Soft fades at the edges where there is more to scroll */
  fade?: boolean;
  /** The most it grows before it scrolls – or give it a height with className / style */
  maxHeight?: number | string;
  /** The element that scrolls – for scrollTo, scrollTop or an observer */
  viewportRef?: Ref<HTMLDivElement>;
  /** Fires on the element that scrolls */
  onScroll?: UIEventHandler<HTMLDivElement>;
};
```


## resizable

Exports: `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle`

```ts
export type ResizablePanelGroupProps = ComponentPropsWithRef<"div"> & {
  /** horizontal: panes side by side · vertical: stacked */
  direction?: "horizontal" | "vertical";
  /** Called with every pane's size in % (in order) after the user resizes – store it to bring the layout back */
  onLayout?: (sizes: number[]) => void;
  /** How far an arrow key moves a handle, in % (Shift: 2 ×) */
  keyboardStep?: number;
};

export type ResizablePanelProps = ComponentPropsWithRef<"div"> & {
  /** The size it starts at, in % of the group; panes without one share what is left */
  defaultSize?: number;
  /** The smallest it gets, in % */
  minSize?: number;
  /** The largest it gets, in % */
  maxSize?: number;
  /** Snaps to collapsedSize when dragged past half its minimum – Enter on its handle folds it and brings it back */
  collapsible?: boolean;
  /** Its size when folded, in % – 0 hides it; a little more keeps an icon rail */
  collapsedSize?: number;
};

export type ResizableHandleProps = ComponentPropsWithRef<"div"> & {
  /** A small grip on the line, so it reads as draggable */
  withHandle?: boolean;
};
```


## tree-view

Exports: `TreeView`

```ts
export type TreeNode = {
  /** Unique in the whole tree */
  id: string;
  /** The name – one line, long ones end in … with the full name on hover; also what typing jumps to */
  label: string;
  /** A glyph before the name, e.g. a folder or file icon (16px) */
  icon?: ReactNode;
  /** A glyph for while the branch is open, e.g. an open folder – falls back to icon */
  openIcon?: ReactNode;
  /** Quiet text at the end of the row, e.g. a count or a size */
  meta?: ReactNode;
  disabled?: boolean;
  /** Its children – any list (even an empty one) makes it a branch that opens and closes */
  children?: TreeNode[];
};

export type TreeViewProps = {
  items: TreeNode[];
  /** Controlled: the ids of the open branches */
  expanded?: string[];
  /** Uncontrolled: the branches open at the start */
  defaultExpanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  /** Controlled: the id of the selected row, or null for none */
  selected?: string | null;
  /** Uncontrolled: the row selected at the start */
  defaultSelected?: string | null;
  /** A row was picked – by a click, Enter or Space */
  onSelect?: (id: string, node: TreeNode) => void;
  /** Thin vertical lines that show each level – on by default */
  guides?: boolean;
  /** Shown inside an open branch without children */
  emptyText?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
};
```


## breadcrumb

Exports: `Breadcrumb`

```ts
export type HugeIcon = readonly (readonly [string, { readonly [key: string]: string | number }])[];

export type BreadcrumbItem = {
  label: string;
  /** Makes the crumb a link */
  href?: string;
  /** Makes the crumb a button when there is no href – or runs before a link navigates (e.g. a router's navigate) */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** A 14px glyph before the label: an inline SVG or a Hugeicons icon object */
  icon?: ReactNode | HugeIcon;
};

export type BreadcrumbProps = Omit<ComponentPropsWithRef<"nav">, "children"> & {
  /** From the top down; the last one is the page you are on */
  items: BreadcrumbItem[];
  /** What sits between the crumbs */
  separator?: "slash" | "chevron" | ReactNode;
  /** The most crumbs shown before the middle folds into … (the first and the last ones stay) */
  maxItems?: number;
};
```


## code-block

Exports: `CodeBlock`

```ts
export type CodeBlockProps = {
  /** The code – copied exactly as given */
  code: string;
  /** ts, tsx, js, jsx, json, bash, sh, python … – colors the code when known, otherwise plain text */
  language?: string;
  /** Shown in the header, e.g. "agent.config.ts" – without it the header names the language */
  filename?: string;
  /** Numbers in front of every line, they stay in place while the code scrolls sideways */
  showLineNumbers?: boolean;
  /** Lines to mark, counted from 1 – e.g. [3, 4, 5] */
  highlightLines?: number[];
  /** Long lines wrap instead of scrolling sideways */
  wrap?: boolean;
  /** After this height the code scrolls inside, e.g. 320 or "40vh" */
  maxHeight?: number | string;
  /** The copy button in the header */
  copyable?: boolean;
  /** Called after the code was copied – e.g. for a toast */
  onCopy?: (code: string) => void;
  className?: string;
  style?: CSSProperties;
};
```
