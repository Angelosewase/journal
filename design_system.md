# Trading Journal — Design System

A reference guide for all developers working on this project. Every UI decision should trace back to a rule in this document. When in doubt, look here first.

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Border Radius](#border-radius)
6. [Surfaces & Cards](#surfaces--cards)
7. [Labels & Descriptive Text](#labels--descriptive-text)
8. [Stat Display Patterns](#stat-display-patterns)
9. [Buttons & CTAs](#buttons--ctas)
10. [Badges & Status Pills](#badges--status-pills)
11. [Navigation](#navigation)
12. [Data Visualization](#data-visualization)
13. [Tables](#tables)
14. [Empty States](#empty-states)
15. [Forms & Filters](#forms--filters)
16. [Dark Mode](#dark-mode)
17. [Do's and Don'ts](#dos-and-donts)

---

## Philosophy

The design is inspired by the **Crextio dashboard aesthetic** — warm off-white backgrounds, large confident numbers, minimal borders, grouped information to reduce cognitive load, and generous whitespace. Every page should feel like a well-organised trading desk: calm, information-dense but never cluttered.

**Three core principles:**

- **Group, don't scatter.** Related stats belong in the same container. One card per stat is always wrong.
- **Numbers are heroes.** The most important value on any panel should be visually dominant — big, bold, and uncluttered.
- **Labels are whispers.** Contextual labels, hints, and descriptions are always small, uppercase, tracked out, and muted. They explain without competing.

---

## Color Palette

All colors are defined via Tailwind utility classes. Do not use arbitrary hex values in components.

### Backgrounds

| Role | Light | Dark |
|---|---|---|
| Page background | `bg-zinc-50` | `dark:bg-zinc-950` |
| Card / Panel surface | `bg-white` | `dark:bg-zinc-900` |
| Inner row / Inset surface | `bg-zinc-50` | `dark:bg-zinc-800/50` |
| Footer / Muted surface | `bg-zinc-50` | `dark:bg-zinc-800/50` |
| Nav background | `bg-white/80` | `dark:bg-zinc-900/80` |

### Borders

| Role | Light | Dark |
|---|---|---|
| Card border | `border-zinc-100` | `dark:border-zinc-800` |
| Divider / separator | `bg-zinc-100` (div) | `dark:bg-zinc-800` |
| Table row border | `border-zinc-100` | `dark:border-zinc-800` |

> **Rule:** Never use `border-foreground/10` or `ring-*`. Use explicit zinc border classes.

### Text

| Role | Class |
|---|---|
| Primary text | `text-zinc-900 dark:text-zinc-50` |
| Secondary / body | `text-zinc-600 dark:text-zinc-300` |
| Muted / hint | `text-zinc-400 dark:text-zinc-500` |
| Ultra-muted (hints below labels) | `text-zinc-300 dark:text-zinc-600` |

### Accent Colors

| Role | Class | Usage |
|---|---|---|
| Primary action / profit | `text-emerald-600`, `bg-emerald-600` | Wins, positive P&L, CTAs |
| Danger / loss | `text-red-500`, `bg-red-400` | Losses, negative P&L |
| Warning / discipline | `text-amber-500`, `bg-amber-500` | Discipline scores, warnings |
| Info / sky | `text-sky-500`, `bg-sky-500` | Trinity scores, secondary data |
| Indigo | `text-indigo-500`, `bg-indigo-100` | Evening review, night context |

### Semantic Color Usage

```
Positive P&L, Win, Bullish  → emerald
Negative P&L, Loss, Bearish → red
Neutral / Break Even        → zinc-400
Discipline                  → amber
Trinity / secondary metric  → sky
Evening / night context     → indigo
```

---

## Typography

There is no custom font import. The system uses Tailwind's default font stack. All typographic hierarchy is achieved through **size, weight, color, and letter-spacing** — not typeface changes.

### Scale

| Role | Classes | Example |
|---|---|---|
| Page title | `text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50` | "Statistics" |
| Page subtitle | `text-sm text-zinc-400 dark:text-zinc-500` | "Track your trading performance" |
| Section heading | `text-sm font-semibold text-zinc-800 dark:text-zinc-100` | Card title |
| Category label | `text-[10px] font-semibold uppercase tracking-widest text-zinc-400` | "WIN RATE", "TOTAL P&L" |
| Hero stat | `text-4xl font-bold leading-none text-zinc-900 dark:text-zinc-50` | "42", "$1,240.00" |
| Large stat | `text-3xl font-bold` | Secondary stats |
| Medium stat | `text-2xl font-bold leading-none` | Tertiary stats |
| Body | `text-sm text-zinc-600 dark:text-zinc-300` | Descriptions, notes |
| Caption / hint | `text-xs text-zinc-400 dark:text-zinc-500` | Sub-labels, calculation hints |
| Micro hint | `text-[10px] text-zinc-300 dark:text-zinc-600 leading-tight` | Formulas, targets |

### Category Labels — The Signature Pattern

The most distinctive typographic element. Used above every stat and section.

```tsx
<p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
  WIN RATE
</p>
```

Always:
- `text-[10px]` — not `text-xs`
- `uppercase`
- `tracking-widest`
- `font-semibold`
- `text-zinc-400 dark:text-zinc-500`

---

## Spacing & Layout

### Page Wrapper

Every page uses the same outer wrapper:

```tsx
<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
  <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 pb-16">
    {/* content */}
  </div>
</div>
```

- Max width: `max-w-6xl`
- Horizontal padding: `px-6`
- Vertical padding: `py-8`, bottom: `pb-16`
- Vertical gap between sections: `space-y-6`

### Grid System

| Layout | Classes |
|---|---|
| Two equal columns | `grid grid-cols-1 lg:grid-cols-2 gap-4` |
| Four equal columns | `grid grid-cols-2 sm:grid-cols-4 gap-4` |
| Three columns | `grid grid-cols-1 md:grid-cols-3 gap-4` |
| Mixed (e.g. 2/3 + 1/3) | `grid grid-cols-1 lg:grid-cols-3` + `lg:col-span-2` |

### Dividers Inside Panels

Use a `<div>` with height and background, never `<hr>` or shadcn `<Separator>`:

```tsx
<div className="h-px bg-zinc-100 dark:bg-zinc-800" />
```

For column dividers inside the Overview strip:

```tsx
<div className="grid grid-cols-4 divide-x divide-zinc-100 dark:divide-zinc-800">
```

---

## Border Radius

All surfaces use `rounded-2xl`. This is non-negotiable — no `rounded-xl`, `rounded-lg`, or `rounded-md` on outer containers.

| Element | Radius |
|---|---|
| Page-level panels / cards | `rounded-2xl` |
| Inner rows / inset surfaces | `rounded-xl` |
| Buttons (pill) | `rounded-full` |
| Badges / tags | `rounded-full` |
| Input fields | `rounded-lg` |
| Nav container | `rounded-full` |
| Table overflow container | `rounded-xl overflow-hidden` |

---

## Surfaces & Cards

### Standard Panel

The base container for any grouped content:

```tsx
<div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6">
  {/* content */}
</div>
```

### Overview Strip

The wide, full-bleed panel at the top of most pages. Divides into 2–4 columns with vertical dividers.

```tsx
<div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-6 py-5">
  <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-zinc-100 dark:divide-zinc-800">
    <div className="pr-6">/* col 1 */</div>
    <div className="px-6">/* col 2 */</div>
    <div className="px-6">/* col 3 */</div>
    <div className="pl-6">/* col 4 */</div>
  </div>
</div>
```

Note: first column uses `pr-6` only, last uses `pl-6` only, middle columns use `px-6`.

### Inner Row / Inset Surface

Used inside panels for individual items (sessions, instruments, model rows):

```tsx
<div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
  {/* row content */}
</div>
```

### Card Component (`card.tsx`)

When using the `Card` shadcn component, use the updated version that matches this system:

- `rounded-2xl` outer radius
- `border-zinc-100 dark:border-zinc-800`
- `bg-white dark:bg-zinc-900`
- `px-6` content padding
- `CardDescription` renders as the uppercase tracking label, not a subtitle

---

## Labels & Descriptive Text

Every stat should have three layers:

```
[CATEGORY LABEL]      ← 10px, uppercase, tracking-widest, zinc-400
[Hero Value]          ← Large bold number or text
[Hint / formula]      ← 10px, zinc-300/zinc-600, explains the calculation
```

Example:

```tsx
<div className="flex flex-col gap-0.5">
  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
    PROFIT FACTOR
  </p>
  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-none">
    2.40
  </p>
  <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">
    Avg Win ÷ Avg Loss · &gt;1 is profitable
  </p>
</div>
```

**Always add a hint** when the stat involves a calculation or has a meaningful threshold (e.g. ">50% win rate", ">1 profit factor", "/10 scale").

---

## Stat Display Patterns

### Mini Progress Bar

Used under almost every scored or percentage stat. Visually encodes magnitude without a chart.

```tsx
function MiniBar({ value, max, color = "bg-emerald-500" }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mt-1">
      <div className={`h-full rounded-full ${color} transition-all duration-500`}
           style={{ width: `${pct}%` }} />
    </div>
  );
}
```

Color guide for mini bars:
- Win rate, primary → `bg-emerald-500`
- Trinity / sky metric → `bg-sky-500`
- Discipline / warning → `bg-amber-500`
- Loss / below threshold → `bg-red-400`

### Outcome Split Bar

The stacked W/L/BE bar used in overview strips:

```tsx
<div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden w-full">
  <div className="bg-emerald-500 h-full" style={{ width: `${(wins / total) * 100}%` }} />
  <div className="bg-red-400 h-full"     style={{ width: `${(losses / total) * 100}%` }} />
  <div className="bg-zinc-300 dark:bg-zinc-700 h-full"
       style={{ width: `${(be / total) * 100}%` }} />
</div>
```

### Circular Progress

Used for Win Rate. Keep it compact (72–96px) and always pair with a text label nearby.

```tsx
<CircularProgress percentage={winRate} size={72} strokeWidth={6} color="#10b981" />
```

The ring track uses `#e5e7eb` (light) and the fill color is always `#10b981` (emerald-500) for win rate.

---

## Buttons & CTAs

All buttons are `rounded-full` pill style. No `rounded-lg` or `rounded-md` buttons.

### Primary CTA (Emerald)

```tsx
<button className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition-colors">
  <Plus className="h-3.5 w-3.5" />
  Add Trade
</button>
```

### Secondary / Outlined

```tsx
<button className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
  Complete Evening Review
</button>
```

### Dark Pill (toggle/active state)

```tsx
<button className="px-4 py-2 rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-700 transition-colors">
  Set Morning Bias
</button>
```

### Ghost Icon Button

```tsx
<button className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
  <Bell className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
</button>
```

### Inline Text Link

```tsx
<Link href="..." className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors font-medium">
  View all <ChevronRight className="h-3.5 w-3.5" />
</Link>
```

---

## Badges & Status Pills

All badges are `rounded-full`. They use background + text color combos, never a `border` style.

### Directional Badges (Long / Short)

```tsx
// LONG
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
  LONG
</span>

// SHORT
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
  SHORT
</span>
```

### Bias Badges (Bullish / Bearish / Neutral)

```tsx
const getBiasColors = (bias) => ({
  BULLISH: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  BEARISH: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  NEUTRAL: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
})[bias] ?? "bg-zinc-100 text-zinc-600";

<span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${getBiasColors(bias)}`}>
  <TrendingUp className="h-4 w-4" />
  BULLISH
</span>
```

### Colored Dot (Session / Model identifier)

```tsx
<div className="h-2 w-2 rounded-full bg-emerald-500" />
```

Use in conjunction with a label when listing items in a panel.

---

## Navigation

The nav is a `rounded-full` pill floating at the top of the page. Key rules:

- **Outer container:** `rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md`
- **Nav item group:** wrapped in its own inner `rounded-full bg-zinc-100 dark:bg-zinc-800/60`
- **Active item:** `bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 shadow-sm`
- **Inactive item:** `text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100`
- **Add Trade button:** same emerald pill CTA style as all primary buttons
- Nav items include both an icon (`h-3.5 w-3.5`) and a label

---

## Data Visualization

### When to use charts vs. bars

- **Mini bars:** always, for any scored or percentage stat inside a panel
- **Circular ring:** only for the single most important percentage on a page (Win Rate)
- **Full charts (recharts):** only in dedicated chart sections, never inside stat panels

### Recharts configuration (if used)

- Background: transparent (inherit from panel)
- Grid lines: `stroke="#e4e4e7"` (zinc-200)
- Tooltip: styled to match card surface — `bg-white dark:bg-zinc-900`, `border-zinc-100 dark:border-zinc-800`, `rounded-xl`
- Colors: use the accent palette — emerald for positive, red for negative, zinc-400 for neutral

---

## Tables

Tables appear inside a standard panel with `rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800` wrapper.

```tsx
<div className="rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
  <Table>
    <TableHeader>
      <TableRow className="bg-zinc-50 dark:bg-zinc-800/60 border-0">
        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3">
          Instrument
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow className="border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
        <TableCell className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 py-3">
          EUR/USD
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

**Table rules:**
- Header background: `bg-zinc-50 dark:bg-zinc-800/60`
- Header text: `text-[10px] font-bold uppercase tracking-widest text-zinc-400` (same category label style)
- Row hover: `hover:bg-zinc-50 dark:hover:bg-zinc-800/40`
- Row border: `border-zinc-100 dark:border-zinc-800`
- Positive values: `text-emerald-600 font-bold`
- Negative values: `text-red-500 font-bold`
- Sort by most meaningful column (usually P&L desc)
- Add a visual bar column for magnitude when space allows

---

## Empty States

All empty states follow the same structure: centered icon in a muted circle, a short message, and a CTA.

```tsx
<div className="flex flex-col items-center justify-center py-12 gap-3">
  <div className="h-14 w-14 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
    <BarChart3 className="h-6 w-6 text-zinc-300 dark:text-zinc-600" />
  </div>
  <p className="text-sm text-zinc-400">No trades recorded today</p>
  <Link href="/trades/new"
    className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors">
    Log Your First Trade
  </Link>
</div>
```

Rules:
- Icon container: `h-14 w-14 rounded-full bg-zinc-50 dark:bg-zinc-800`
- Icon: `h-6 w-6 text-zinc-300 dark:text-zinc-600`
- Message: `text-sm text-zinc-400`
- CTA: use the appropriate pill button style (emerald for primary, outlined for secondary)

---

## Forms & Filters

### Collapsible Filter Panel

Filters are hidden by default behind a pill toggle button. The button shows a count badge when filters are active.

**Toggle button — inactive:**
```tsx
<button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 text-sm font-medium hover:border-zinc-300 transition-all shadow-sm">
  <SlidersHorizontal className="h-3.5 w-3.5" />
  Filters
  <ChevronDown className="h-3.5 w-3.5" />
</button>
```

**Toggle button — active (filters applied or panel open):**
```tsx
<button className="... bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 border-zinc-900">
  <SlidersHorizontal className="h-3.5 w-3.5" />
  Filters
  <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
    {activeCount}
  </span>
  <ChevronUp className="h-3.5 w-3.5" />
</button>
```

**Filter panel:**
```tsx
<div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5">
  <div className="flex items-center justify-between mb-4">
    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Filter trades</p>
    <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700">
      <X className="h-3 w-3" /> Clear all
    </button>
  </div>
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
    {/* filter controls */}
  </div>
</div>
```

### Input & Select Styling

```tsx
// Label
<Label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">
  Environment
</Label>

// Select
<SelectTrigger className="h-8 text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">

// Date input
<Input type="date" className="h-8 text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800" />
```

All filter controls:
- Height: `h-8`
- Border: `border-zinc-200 dark:border-zinc-700`
- Background: `bg-zinc-50 dark:bg-zinc-800`
- Radius: `rounded-lg`
- Text: `text-xs`

---

## Dark Mode

All dark mode styles are applied via Tailwind's `dark:` prefix. Never use CSS variables like `bg-card`, `text-muted-foreground`, `bg-muted`, or `border-foreground/10` — always use explicit zinc classes so dark mode behaviour is predictable.

| Instead of | Use |
|---|---|
| `bg-card` | `bg-white dark:bg-zinc-900` |
| `text-muted-foreground` | `text-zinc-400 dark:text-zinc-500` |
| `bg-muted` | `bg-zinc-100 dark:bg-zinc-800` |
| `bg-muted/50` | `bg-zinc-50 dark:bg-zinc-800/50` |
| `border-border` | `border-zinc-100 dark:border-zinc-800` |
| `ring-1 ring-foreground/10` | `border border-zinc-100 dark:border-zinc-800` |

---

## Do's and Don'ts

### ✅ Do

- Use `rounded-2xl` on all outer panels
- Use `rounded-full` on all buttons and badges
- Prefix every stat with a `text-[10px] uppercase tracking-widest` label
- Add a micro hint below any calculated stat
- Group related stats into a single panel — aim for 3–4 stats per panel max
- Use `divide-x divide-zinc-100 dark:divide-zinc-800` for column dividers
- Use `transition-colors` on all interactive elements
- Use a mini progress bar under any percentage or scored value
- Keep the filter panel collapsed by default
- Show an active filter count badge on the filter button

### ❌ Don't

- Create one card per stat — always group
- Use `rounded-xl` or `rounded-lg` on outer containers
- Use shadcn `<Separator />` — use a `<div className="h-px bg-zinc-100 dark:bg-zinc-800" />` instead
- Use `bg-card`, `bg-muted`, `text-card-foreground`, or any other CSS variable colors
- Use `ring-*` for card borders
- Use `<hr>` tags
- Leave a stat without a label
- Use inline styles for colors — always use Tailwind classes
- Stack more than 4 rows of individual cards vertically without grouping them
- Use a `<form>` element — use `onClick`/`onChange` handlers directly