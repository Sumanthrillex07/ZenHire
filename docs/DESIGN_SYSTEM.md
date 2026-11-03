# ZenHire — Design System Specification

## 1. Design Philosophy & Architectural Principles

The **ZenHire Design System** is crafted to provide a modern, high-precision SaaS experience for candidates and recruiters. Inspired by best-in-class developer tools and platforms (Linear, Stripe Dashboard, Vercel, Raycast), the system emphasizes:

1. **Content-First Simplicity**: Clean visual hierarchy, eliminating arbitrary decorative distractions and excessive saturation.
2. **First-Class Dual-Theming**: Complete parity between Light and Dark modes using CSS custom properties (variables) defined via HSL channels for dynamic alpha-transparency.
3. **Structured Glassmorphism**: Subtle, controlled backdrop blur with hairline borders (`border-border/60`) and subtle elevation rather than overwhelming translucent frosted glass.
4. **Predictable Typography**: Inter for crisp, accessible UI labels and body copy; JetBrains Mono for requisition IDs, tokens, test identifiers, and code snippets.
5. **Zero-Layout-Shift Transitions**: Shimmering skeleton loaders that mirror component geometry to prevent jarring Cumulative Layout Shift (CLS) when asynchronous data arrives.

---

## 2. Color System & Semantic Tokens

All semantic colors are mapped to CSS custom variables in `src/index.css` and ingested by Tailwind in `tailwind.config.js`.

### 2.1 Dual-Token Palette Matrix

| Semantic Token | Light Mode Value (HSL / Hex) | Dark Mode Value (HSL / Hex) | Role / Usage |
| :--- | :--- | :--- | :--- |
| `--background` | `210 40% 98%` (`#f8fafc`) | `222 47% 5%` (`#050811`) | Page-level canvas background |
| `--foreground` | `222 47% 11%` (`#0f172a`) | `210 40% 98%` (`#f8fafc`) | Primary high-contrast text |
| `--card` | `0 0% 100%` (`#ffffff`) | `222 47% 7%` (`#0b1120`) | Card and modal surface container |
| `--card-foreground` | `222 47% 11%` (`#0f172a`) | `210 40% 98%` (`#f8fafc`) | Text within card containers |
| `--popover` | `0 0% 100%` (`#ffffff`) | `222 47% 8%` (`#0e1526`) | Dropdowns, tooltips, flyout sheets |
| `--primary` | `158 64% 40%` (`#059669`) | `160 84% 39%` (`#10b981`) | Emerald primary brand, CTAs |
| `--primary-foreground`| `0 0% 100%` (`#ffffff`) | `222 47% 5%` (`#050811`) | High-contrast text on primary buttons |
| `--secondary` | `210 40% 96%` (`#f1f5f9`) | `217 33% 14%` (`#182234`) | Secondary actions, neutral chips |
| `--muted` | `210 40% 96%` (`#f1f5f9`) | `217 33% 13%` (`#161f30`) | Table rows, code blocks, inactive tabs |
| `--muted-foreground` | `215 16% 47%` (`#64748b`) | `215 20% 65%` (`#94a3b8`) | Secondary descriptions, timestamps |
| `--accent` | `210 40% 96%` (`#f1f5f9`) | `217 33% 15%` (`#1b2538`) | Hover states, interactive highlights |
| `--destructive` | `0 84% 60%` (`#ef4444`) | `0 63% 31%` (`#7f1d1d`) | Danger states, destructive buttons |
| `--border` | `214 32% 91%` (`#e2e8f0`) | `217 33% 17%` (`#1e293b`) | Hairline card & input dividers |
| `--input` | `214 32% 91%` (`#e2e8f0`) | `217 33% 17%` (`#1e293b`) | Input borders |
| `--ring` | `158 64% 40%` (`#059669`) | `160 84% 39%` (`#10b981`) | Focus indicators & active rings |

---

## 3. Typography & Hierarchy

### 3.1 Font Stack
- **Primary UI Font**: `Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Monospace Font**: `"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`

### 3.2 Scale & Leading
- **Display 1** (`text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]`): Landing page hero headline.
- **Heading 1** (`text-2xl sm:text-3xl font-extrabold tracking-tight`): Main dashboard and workflow page titles.
- **Heading 2** (`text-lg sm:text-xl font-bold tracking-tight`): Section headings, modal titles.
- **Heading 3** (`text-base font-bold`): Card titles, job titles.
- **Body / Standard** (`text-sm leading-relaxed text-foreground/90`): Body descriptions, input text, dialog messages.
- **Caption / Meta** (`text-xs text-muted-foreground`): Timestamps, applicant counts, metadata tags.
- **Micro / Badge** (`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider`): Category chips, status indicators.

---

## 4. UI Component Primitives

The design system incorporates standardized, accessible primitives in `src/components/ui/` and `src/components/`:

### 4.1 Button (`src/components/ui/Button.tsx`)
- **Variants**:
  - `primary`: Emerald brand action, high contrast, active scale depression (`active:scale-[0.98]`).
  - `secondary`: Neutral surface for auxiliary actions.
  - `outline`: Bordered transparent button for secondary browsing.
  - `ghost`: Transparent button with subtle hover highlight for utility controls.
  - `destructive`: Red background for irreversible operations.
  - `indigo`: Dedicated recruiter pipeline accent variant.
- **Sizes**: `sm` (`px-3 py-1.5 text-xs`), `md` (`px-4 py-2 text-xs sm:text-sm`), `lg` (`px-6 py-2.5 text-sm sm:text-base`), `icon` (`p-2`).
- **Features**: Built-in `isLoading` state replacing icon with an SVG spinner and preventing double-clicks.

### 4.2 Input (`src/components/ui/Input.tsx`)
- High-contrast background and border with `focus:border-primary focus:ring-2 focus:ring-primary/20`.
- Integrated `icon` prefix support (e.g., search icon).
- Standardized error message (`text-xs text-red-500 font-medium`) and helper text slots.

### 4.3 Card System (`src/components/ui/Card.tsx`)
- Standardized composition: `<Card>`, `<CardHeader>`, `<CardTitle>`, `<CardDescription>`, `<CardContent>`, `<CardFooter>`.
- Includes `.glass-card` styling with `backdrop-blur-md`, subtle hairline borders, and elevation shadow.

### 4.4 Skeleton Loaders (`src/components/ui/Skeleton.tsx`)
- Shimmer animation (`animate-shimmer`) with a gradient sweep across muted backgrounds.
- High-level composite skeletons:
  - `<CardSkeleton />`: Simulates job cards, catalog items, and metric blocks.
  - `<TableSkeleton />`: Simulates applicant leaderboard rows and requisitions tables.

### 4.5 Badge System (`src/components/Badge.tsx`)
- **`CategoryBadge`**: Categorizes roles (`BACKEND`, `FRONTEND`, `AI_ML`, `DEVOPS`, `FULLSTACK`) with distinct hue tints.
- **`JobStatusBadge`**: Differentiates `OPEN`, `CLOSED`, `DRAFT`.
- **`ApplicationStatusBadge`**: Tracks pipeline lifecycle (`APPLIED`, `SHORTLISTED`, `INTERVIEW_SCHEDULED`, `HIRED`, `REJECTED`).
- **`MatchScoreBadge`**: High-precision dual-colored badge (>80% emerald, 60-79% amber, <60% slate/red).

### 4.6 Theme Toggle & Transition System (`src/components/ui/ThemeToggle.tsx` & `src/context/ThemeContext.tsx`)
- **Dual Transition Mechanics**:
  - **View Transitions API**: Leverages `document.startViewTransition` on modern browsers (Chrome 111+, Edge, Safari 18+) for crossfade animation.
  - **Temporary CSS Transition Layer**: Dynamically adds `.theme-transitioning` to `<html>` for 350ms during theme toggling, smoothing `background-color`, `border-color`, `color`, and `box-shadow` changes with `cubic-bezier(0.16, 1, 0.3, 1)`, and cleanly removes it after completion to prevent runtime overhead during scrolling.
- **Zero-FOUT Initial Load**: Transition is skipped on initial page mount (`isFirstMount`), preventing delayed hydration flashes.
- **Icon Micro-Interaction**: Sun and Moon icons transition with synchronous 90-degree rotation and scale crossfading.
- **Reduced Motion Support**: Completely disables transitions when `prefers-reduced-motion: reduce` is active.

---

## 5. Responsive Design Standards

- **Mobile First**: All layouts scale smoothly from 320px up to 1920px.
- **Touch Target Integrity**: Minimum 44x44px clickable areas for buttons and navigational links on touchscreen viewports.
- **Responsive Drawer Sheet**: Fullscreen mobile navigation overlay with blurred backdrop, accessible close button, and active route indicators.
- **Table Adaptability**: Tables wrapped in `overflow-x-auto` with sticky headers or card-stacked fallbacks for sub-640px devices.
- **Chatbot Responsive Offset**: Floating widget auto-sizes to `calc(100vw - 32px)` on mobile screens to prevent overflow and modal blockage.

---

## 6. Accessibility & Performance Benchmarks

1. **Reduced Motion**: All animations (`animate-fadeIn`, `animate-slideUp`, `animate-shimmer`) observe `@media (prefers-reduced-motion: reduce)`.
2. **Zero FOUT**: Theme is read and applied by an inline `<script>` in `index.html` before DOM render.
3. **WCAG AA Compliance**: All text-to-background combinations in both light and dark modes exceed a 4.5:1 contrast ratio.

