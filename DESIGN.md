---
name: Air IDE
description: Session-based collaborative code editor — the editor is the world, chrome recedes into near-nothing.
colors:
    # ── Achromatic surface scale (dark) ──
    void-deepest: "oklch(0.1 0.01 264)"
    void-deep: "oklch(0.145 0 0)"
    void-mid: "oklch(0.18 0.02 264)"
    surface-card: "oklch(0.205 0 0)"
    surface-muted: "oklch(0.269 0 0)"
    # ── Text ──
    text-primary: "oklch(0.985 0 0)"
    text-muted: "oklch(0.708 0 0)"
    text-placeholder: "oklch(0.556 0 0)"
    # ── Borders / dividers ──
    border-default: "oklch(1 0 0 / 10%)"
    border-input: "oklch(1 0 0 / 15%)"
    # ── Signal accent — electric blue/violet ──
    signal-blue: "oklch(0.65 0.22 264)"
    signal-violet: "oklch(0.62 0.2 300)"
    signal-cyan: "oklch(0.68 0.18 230)"
    # ── Status semantics ──
    status-live: "oklch(0.72 0.19 145)"
    status-warn: "#f59e0b"
    status-error: "oklch(0.704 0.191 22.216)"
typography:
    display:
        fontFamily: "Figtree Variable, sans-serif"
        fontSize: "2rem"
        fontWeight: 700
        lineHeight: 1
        letterSpacing: "-0.02em"
    headline:
        fontFamily: "Figtree Variable, sans-serif"
        fontSize: "1.5rem"
        fontWeight: 700
        lineHeight: 1.2
        letterSpacing: "-0.01em"
    title:
        fontFamily: "Figtree Variable, sans-serif"
        fontSize: "1rem"
        fontWeight: 600
        lineHeight: 1.4
    body:
        fontFamily: "Figtree Variable, sans-serif"
        fontSize: "0.875rem"
        fontWeight: 400
        lineHeight: 1.5
    label:
        fontFamily: "Figtree Variable, sans-serif"
        fontSize: "0.75rem"
        fontWeight: 600
        lineHeight: 1
        letterSpacing: "0.08em"
    mono:
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace"
        fontSize: "0.82rem"
        fontWeight: 400
        lineHeight: 1.6
rounded:
    xs: "4px"
    sm: "6px"
    md: "8px"
    lg: "10px"
    xl: "12px"
    full: "9999px"
spacing:
    xs: "4px"
    sm: "8px"
    md: "12px"
    lg: "16px"
    xl: "24px"
    "2xl": "32px"
components:
    button-primary:
        backgroundColor: "{colors.text-primary}"
        textColor: "{colors.surface-card}"
        rounded: "{rounded.md}"
        padding: "0 10px"
        height: "36px"
    button-primary-hover:
        backgroundColor: "oklch(0.922 0 0 / 80%)"
    button-outline:
        backgroundColor: "transparent"
        textColor: "{colors.text-primary}"
        rounded: "{rounded.md}"
        padding: "0 10px"
        height: "36px"
    button-ghost:
        backgroundColor: "transparent"
        textColor: "{colors.text-primary}"
        rounded: "{rounded.md}"
        padding: "0 8px"
        height: "36px"
    button-ghost-hover:
        backgroundColor: "{colors.surface-muted}"
    input-default:
        backgroundColor: "oklch(1 0 0 / 0)"
        textColor: "{colors.text-primary}"
        rounded: "{rounded.md}"
        height: "36px"
        padding: "0 10px"
    card-default:
        backgroundColor: "{colors.surface-card}"
        rounded: "{rounded.xl}"
        padding: "24px"
---

# Design System: Air IDE

## Overview

**Creative North Star: "The Void Canvas"**

Air IDE operates at the intersection of radical restraint and precise signal. The interface is a controlled absence: near-black surfaces recede deliberately so that code — and only code — commands attention. This is not minimalism as aesthetic fashion; it is a functional discipline. Every pixel of chrome that goes dark is one fewer distraction from the task at hand.

Where colour appears, it carries weight. The electric-blue/violet accent family (`oklch(0.65 0.22 264)` through `oklch(0.62 0.2 300)`) is reserved exclusively for live connection state, the loading animation, the brand mark glyph, and the "IDE" wordmark. It is never used for decoration. Its rarity is the point: when you see blue, the system is telling you something is alive and networked. Semantic status colours (emerald for connected, amber for connecting, red for error) follow the same logic — colour = information, never ornament.

The achromatic main UI is strict. Surfaces separate not by shadow but by lightness step — `void-deep` → `surface-card` → `surface-muted` is the full tonal depth the app needs. The typography is Figtree Variable: warm-geometric, rounded, and confident without being expressive. In the editor and any code-mode context, JetBrains Mono carries ligatures and a tight mono rhythm. The two fonts never compete; they live in clearly separated zones.

**Key Characteristics:**

- Near-black environment; code is the visual subject, chrome is the frame
- Colour = signal only; the signal accent appears ≤10% of any given screen
- Tonal separation without shadow; no box-shadows in the main UI at rest
- Two-font system: Figtree for UI chrome, monospace for code/terminal contexts
- Developer-terse copy: "Live" not "You're connected", "L12 · C4" not "cursor at line 12"
- Backdrop-blur headers and glassmorphic terminal card are the only allowed depth effects

## Colors

The palette is a controlled monochrome with a single chromatic signal family. Every non-signal color resolves to an achromatic oklch value; the chroma is zero throughout the surface scale.

### Primary (Signal Accent)

- **Electric Blue** (`oklch(0.65 0.22 264)`): Brand glyph background, "IDE" wordmark, loading ring, cursor glyph in editor, active line-prompt in terminal card, line-dots animation, progress bar spine. Never used for general UI accent.
- **Signal Violet** (`oklch(0.62 0.2 300)`): Loading blob 2, progress bar left edge. Pairs with Electric Blue to form the brand chromatic gradient.
- **Signal Cyan** (`oklch(0.68 0.18 230)`): Loading blob 3, loading ring (inner), progress bar right edge. Completes the three-stop gradient.

**The One Signal Rule.** The electric-blue accent and its gradient siblings are reserved for live-connection signaling and brand marks. Do not apply them to buttons, borders, focus rings, or informational UI. The moment blue appears as a general accent it loses its meaning.

### Secondary (Status Semantics)

- **Connected Green** (`oklch(0.72 0.19 145)`): "Live" status label, done-line indicator in terminal card. Appears only on the ConnectionChip and its equivalents — never as a general success color.
- **Warning Amber** (`#f59e0b`): "Connecting…" status only.
- **Error Red** (`oklch(0.704 0.191 22.216)`): Disconnect / error status, destructive actions, form validation.

### Neutral

- **Void Deepest** (`oklch(0.1 0.01 264)`): Loading screen background. The darkest surface.
- **Void Deep** (`oklch(0.145 0 0)`): App background (`--background`). Base layer.
- **Void Mid** (`oklch(0.18 0.02 264)`): Logo core in loading screen, slightly warm-tinted near-black.
- **Surface Card** (`oklch(0.205 0 0)`): Card / panel surfaces (`--card`). Sidebars, session header, cards.
- **Surface Muted** (`oklch(0.269 0 0)`): Hover states, muted backgrounds, secondary surface.
- **Text Primary** (`oklch(0.985 0 0)`): All primary text, active tab labels, foreground.
- **Text Muted** (`oklch(0.708 0 0)`): Secondary labels, placeholder, sidebar section headers.
- **Text Placeholder** (`oklch(0.556 0 0)`): Input placeholders, inactive/pending text.
- **Border Default** (`oklch(1 0 0 / 10%)`): All dividers, panel borders, component outlines. Alpha-composited against the surface.
- **Border Input** (`oklch(1 0 0 / 15%)`): Input field border in dark mode (slightly more prominent).

**The No-Chroma-in-Chrome Rule.** All surface, border, and text tokens carry zero chroma (pure achromatic lightness). Introducing any tinted neutral — even a barely-visible one — breaks the void and draws attention away from code.

## Typography

**Display / UI Font:** Figtree Variable (warm-geometric sans; Google Fonts variable)
**Code / Terminal Font:** JetBrains Mono, Fira Code, Cascadia Code (monospace stack with ligatures)

**Character:** Figtree is rounded and confident — neither cold nor precious. It reads cleanly at small sizes (12–14px) without feeling compressed, which matters at toolbar density. Monospace is used as a material signal: when you see a monospace string, you know you're reading code or a machine-derived value (an invite code, a terminal prompt, a filename in the status bar).

### Hierarchy

- **Display** (700, 2rem, lh 1, ls -0.02em): Brand name "Air IDE" in the loading screen only. Never used in the main app chrome.
- **Headline** (700, 1.5rem, lh 1.2, ls -0.01em): Page-level headers — "Sessions" on the dashboard.
- **Title** (600, 1rem, lh 1.4): Session name in the header, card titles, dialog headings.
- **Body** (400, 0.875rem, lh 1.5): All prose, description text, form labels, list items. The primary reading size for the entire app.
- **Label** (600, 0.75rem, lh 1, ls 0.08em, uppercase): Section headers inside sidebars — "EXPLORER", "MEMBERS (3)". Uppercase with tracked spacing.
- **Mono** (400, 0.82rem, lh 1.6): Invite codes, terminal card lines, status bar file/language, editor content (Monaco-managed). Always monospace; ligatures enabled.

**The Two-Zone Rule.** Figtree and mono never appear in the same text run. UI chrome is Figtree. Code context, invite codes, and terminal-flavoured UI are mono. A monospace string anywhere in chrome is a deliberate code-idiom signal.

## Layout

The app has two primary layout surfaces: the full-viewport dashboard and the full-viewport session room.

**Dashboard:** Sticky header (h-14) at top; main content centered in a `max-w-7xl` container with `px-4 sm:px-6 py-8`. Session list fills remaining height. Single-column on mobile, header reflows at `sm` breakpoint (640px).

**Session Room:** Fixed `h-screen` vertical stack — header (h-12, shrink-0) + scrollable body. The body is a horizontal flex row: Members Sidebar (w-56 | w-12 collapsed) + Files Panel (w-48) + Editor Area (flex-1). All panels fill full height; overflow is per-panel, not the root. The Monaco editor gets all remaining horizontal space.

**Density:** Compact. Panel headers are h-10, the session header is h-12, the tab bar is h-10, the status bar is ~28px. Internal padding follows 8px / 12px / 16px steps. The goal is to maximise visible editor height; every chrome row is accounted for.

**Spacing rhythm:** `xs = 4px`, `sm = 8px`, `md = 12px`, `lg = 16px`, `xl = 24px`. Sidebar items use `p-2` (8px), gap between sidebar items `space-y-0.5`. Dialogs and cards use `px-6 py-6` (`--card-spacing`).

**Responsive behaviour:** Below `sm` (640px), the session name in the header truncates to `max-w-[180px]`, the username label is `hidden sm:block`, and the brand name is `hidden sm:block`. No column collapse in the session room; the mobile experience is not a primary target.

## Elevation & Depth

Air IDE is flat-first. Surfaces are distinguished exclusively by tonal layering — a lighter `surface-card` sits atop a darker `void-deep` background. No `box-shadow` is used on the standard UI at rest.

The one legitimate depth effect is backdrop-filter blur on translucent headers. The session header (`bg-card/90 backdrop-blur-md`) and dashboard header (`bg-card/80 backdrop-blur-md`) float above content with a frosted-glass quality rather than a shadow. This is the entire depth vocabulary of the running app.

The loading screen is the exception zone: it uses ambient glow blobs, a glassmorphic terminal card (`backdrop-filter: blur(12px)`, `box-shadow: 0 20px 60px oklch(0 0 0 / 0.4)`), glowing logo rings, and a progress bar with `box-shadow: 0 0 8px oklch(0.65 0.22 264 / 0.6)`. These effects are confined to the loading state and do not migrate into running UI.

**The Flat-By-Default Rule.** No `box-shadow` on cards, panels, dialogs, or buttons in the running app. Depth comes from tonal lightness difference alone. Blur is allowed only on header overlays; glow is allowed only in the loading screen and as a micro-signal in the editor cursor gutter.

## Shapes

All interactive elements use a consistently rounded, medium-radius language. The base radius unit is `0.625rem` (10px); the scale steps derive from it.

- **Buttons:** `rounded-md` (8px). Icon buttons: same. Small size: `rounded-[min(var(--radius-md),10px)]`.
- **Inputs:** `rounded-md` (8px). Border `1px solid border-input`.
- **Cards:** `rounded-xl` (14px, computed from `--radius * 1.4`). The most pronounced corner in the UI.
- **Badges / chips / invite code button:** `rounded-md` (8px). Count badges: `rounded-full` (pill).
- **Avatar:** `rounded-full`. Always circular.
- **Sidebar rows / file list items:** `rounded-md` on hover highlight.
- **Terminal card (loading screen):** `border-radius: 12px` — a fixed value, slightly tighter than card `rounded-xl`.
- **Progress bar / presence dot:** `border-radius: 9999px` (pill / circle).

**The Graduated Corner Rule.** Corner size scales with surface importance: pill for dots and badges, md for interactive controls, xl for content cards. Never mix a square control with a rounded card in the same layer.

## Components

### Buttons

Clean and compact. No dramatic shadows or colour fills except on the primary variant.

- **Shape:** `rounded-md` (8px); height `h-9` (36px) default, `h-8` (32px) small, `h-10` (40px) large.
- **Primary:** Background `text-primary` (near-white in dark mode), text `primary-foreground` (dark). `hover:bg-primary/80`. Used for the single high-emphasis CTA per screen ("New Session").
- **Outline:** Border `border-border`, background transparent, text foreground. Hover: `bg-muted`. Used for secondary actions ("Join Session", "Logout").
- **Ghost:** No border, no background at rest. Hover: `bg-muted/50`. Used for toolbar icon buttons, tab close buttons, save.
- **Destructive:** Background `destructive/10`, text `destructive`. Hover: `destructive/20`. Never a fully saturated fill.
- **Focus ring:** `ring-3 ring-ring/50` — a 3px ring at 50% opacity over the border. Keyboard-visible only (`focus-visible`).
- **Disabled:** `opacity-50`, `pointer-events-none`.

### Cards / Containers

- **Corner style:** `rounded-xl` (14px). Images at first/last child: `rounded-t-xl` / `rounded-b-xl`.
- **Background:** `bg-card` (`oklch(0.205 0 0)` in dark mode).
- **Shadow:** None. Ring instead: `ring-1 ring-foreground/10` — a 10%-opacity foreground ring creates a hairline border illusion without shadow.
- **Border equivalent:** The `ring-1` token; never a separate `border` property on cards.
- **Internal padding:** `--card-spacing = 24px` (default), `16px` (sm size). Applied via CSS custom property to all card sub-slots.

### Inputs / Fields

- **Style:** Transparent background (`bg-transparent` / `dark:bg-input/30`), `border border-input`, `rounded-md`, `h-9`, `px-2.5`.
- **Focus:** `border-ring` + `ring-3 ring-ring/50`. The ring is the only visible depth signal on inputs.
- **Error (aria-invalid):** `border-destructive` + `ring-3 ring-destructive/20`.
- **Disabled:** `opacity-50`, `cursor-not-allowed`.
- **Placeholder:** `text-muted-foreground` (40% lightness text).

### Navigation (Session Header + Dashboard Header)

Sticky, `h-12` (session) / `h-14` (dashboard). `bg-card/90 backdrop-blur-md`. Horizontal flex with left / centre / right zones. `border-b border-border`. No shadow.

- **Brand mark:** Small square `h-5 w-5` or `h-7 w-7`, `bg-primary text-primary-foreground`, `rounded` — contains a Zap or `</>` SVG icon. This is the only place the brand accent (near-white primary) appears as a filled surface.
- **Session name:** `text-sm font-medium`, truncated at `max-w-[180px]`.
- **User avatar:** `h-8 w-8`, `rounded-full`, `bg-primary/10 text-primary`. Initials in `text-xs font-semibold`.

### Connection Chip (Signature Component)

The `ConnectionChip` is the live status indicator — always visible in the session header centre zone.

- **"Live":** Wifi icon + label, both `text-emerald-500 font-medium`. No background pill — bare text + icon.
- **"Connecting…":** Loader2 icon `animate-spin text-amber-500`, label `text-muted-foreground`.
- **"Disconnected" / "Error":** WifiOff icon + label `text-red-500`.
- **No background pill or border** — the chip is purely typographic + icon. The colour is the signal.

### Invite Code Badge (Signature Component)

Displayed in the session header. A mono-font button pill containing the room code plus copy-to-clipboard.

- **Style:** `border border-border bg-muted/60 px-2.5 py-1 rounded-md text-xs font-mono tracking-wider`.
- **Hover:** `bg-muted`.
- **Copy confirmation:** Check icon swaps in, `text-emerald-500` for 1.8s. Purely iconic — no toast.

### File Tab Bar

A horizontal scrollable row of file tabs above the Monaco editor.

- **Active tab:** `bg-background text-foreground border-b-2 border-primary`. Full-height highlight.
- **Inactive tab:** `bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground`.
- **Dirty indicator:** Dot `●` in `text-amber-500` replaces the close button when a file has unsaved changes.
- **Close button:** Ghost icon button (`h-4 w-4`) that appears on hover or when active.
- **Tab height:** `h-10` (40px), matching the file panel header.

### Collaborator Avatar Stack (Signature Component)

Used in the file tree to show who is viewing each file.

- **Size:** `h-4 w-4` mini-avatar circles, overlapping with `-space-x-1`.
- **Background:** Each collaborator's server-assigned `user.color` (dynamic; not a design token).
- **Border:** `border border-card` to separate overlapping avatars against the background.
- **Visibility:** Hidden when the row is hovered (makes room for rename/delete actions).

## Do's and Don'ts

### Do:

- **Do** use `oklch()` values directly when writing custom inline styles or CSS — the project's source of truth is OKLCH, matching `index.css`.
- **Do** use `bg-card/90 backdrop-blur-md` for all sticky headers that need to feel elevated without a shadow.
- **Do** use the mono font stack (`'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace`) for invite codes, file names in the status bar, and any terminal-idiom text.
- **Do** add `font-semibold uppercase tracking-wider text-xs text-muted-foreground` to sidebar section labels.
- **Do** prefer `hover:bg-muted` over custom hover backgrounds — it keeps hover state visually consistent across all interactive rows.
- **Do** use `ring-1 ring-foreground/10` as the card border substitute — never add a `border` property to Card components.
- **Do** keep the signal accent (`oklch(0.65 0.22 264)` and family) exclusively for live-connection and brand-glyph contexts.
- **Do** represent status semantically: emerald for live, amber for connecting, red for error — and only for those states.

### Don't:

- **Don't** add `box-shadow` to cards, panels, buttons, or dialogs in the main running UI. Shadows belong only in the loading screen.
- **Don't** use the signal-blue family for focus rings, hover highlights, or decorative accents. The system uses achromatic `ring-ring/50` for focus.
- **Don't** introduce a tinted neutral surface (e.g., a slightly blue-grey sidebar background). All surfaces are achromatic; chroma = zero outside the signal family.
- **Don't** use colour for decorative hierarchy. If you're reaching for a colour to separate two sections, use a `border-b border-border` or a lightness-step surface instead.
- **Don't** use the card component for the loading screen. The loading screen has its own bespoke terminal card with a glassmorphic treatment that belongs to that context alone.
- **Don't** inline a tighter or looser font than `text-xs font-semibold uppercase tracking-wider` for sidebar section headers — the tracked uppercase label is the only uppercase text in the system.
- **Don't** add a full colour fill to the destructive button variant — keep it `bg-destructive/10` (10% opacity). A fully saturated red fill pulls the eye too hard in a dark UI.
