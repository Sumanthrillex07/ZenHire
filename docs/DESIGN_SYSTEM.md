# ZenHire — Design System Specification

> **Design System:** NestJS Sovereign Architecture (`DESIGN.md`)  
> **Aesthetic Philosophy:** Soot-black canvas lit by a crimson furnace; warm linen daylight counterpart. Giant geometric Manrope headlines, crisp Geist Mono terminal-style supporting copy and labels, layered carbon panels, hairline 1px seams, and dynamic mouse-tracking spotlight gradients.

---

## 1. Design Philosophy & Architectural Principles

The **ZenHire Design System** is engineered around the NestJS design language specified in `DESIGN.md`:

1. **Furnace Behind Smoked Glass**: The UI treats the screen like a dark stage lit by one crimson furnace. Panels sit inside 32px-radius hero frames washed with Nest Crimson (`#ea2845`) fading through Garnet (`#780f20`) into Soot Canvas (`#050303`), while interior cards maintain hairline 1px seams (`#373535`).
2. **Restrained Crimson Accents**: Crimson is treated as light and energy—subtle top-lit radial glows, active focus rings, and glowing hot corners—almost never a flat solid fill.
3. **Intentional Dual-Theming Parity**:
   - **Dark Mode**: Soot Canvas (`#050303`), Carbon Panels (`#0b0b0b`), Ash Seams (`#1e1c1c`), Smoke Outlines (`#373535`), Pewter metadata (`#9b9a9a`), and Bone White text (`#ffffff`).
   - **Light Mode**: Warm Linen canvas (`#faf8f8`), crisp white surfaces (`#ffffff`), warm ash seams (`#f2eded`), and deep carbon ink typography (`#0c0909`).
4. **Dual Typography Identity**:
   - **Manrope (Weight 500 & 700)**: Clean, geometric display and interface font with 0px tracking.
   - **Geist Mono (Weight 300 & 400)**: Body copy, uppercase bracketed eyebrows (`{ SECTION }_`), status badges, and technical metadata, giving marketing and workflow copy the precision of terminal output.
5. **Interactive Mouse-Following Spotlight**:
   - Cards dynamically project a radial spotlight gradient (`rgba(234, 40, 69, 0.12)`) and hairline border glow (`rgba(234, 40, 69, 0.40)`) centered on the user's cursor (`--mouse-x`, `--mouse-y`) managed via a global, non-blocking `requestAnimationFrame` loop.

---

## 2. Color System & Semantic Tokens

All semantic colors are mapped to CSS custom variables in `frontend/src/index.css` and ingested by Tailwind CSS via `frontend/tailwind.config.js`.

### 2.1 Color Palette & Token Matrix

| Semantic Token | Light Mode Value (HSL / Hex) | Dark Mode Value (HSL / Hex) | Role / Usage in NestJS System |
| :--- | :--- | :--- | :--- |
| `--background` | `0 14% 97.5%` (`#faf8f8`) | `0 25% 1.6%` (`#050303`) | **Soot Canvas** (Dark) / **Linen Canvas** (Light) |
| `--foreground` | `0 10% 4%` (`#0c0909`) | `0 0% 100%` (`#ffffff`) | **Bone White** (Dark) / **Carbon Ink** (Light) |
| `--card` | `0 0% 100%` (`#ffffff`) | `0 0% 4.3%` (`#0b0b0b`) | **Carbon Panel** (Dark) / **Warm White** (Light) |
| `--card-foreground` | `0 10% 4%` (`#0c0909`) | `0 0% 100%` (`#ffffff`) | Content within card containers |
| `--popover` | `0 0% 100%` (`#ffffff`) | `0 0% 4.3%` (`#0b0b0b`) | Dropdowns, dialogs, flyout sheets |
| `--popover-foreground`| `0 10% 4%` (`#0c0909`) | `0 0% 100%` (`#ffffff`) | Dropdown and flyout text |
| `--primary` | `0 25% 1.6%` (`#050303`) | `0 0% 100%` (`#ffffff`) | **Bone White Button** fill (Dark) / **Carbon Button** (Light) |
| `--primary-foreground`| `0 0% 100%` (`#ffffff`) | `0 25% 1.6%` (`#050303`) | High-contrast label on primary action |
| `--secondary` | `0 6% 94%` (`#f2eded`) | `0 4.8% 11.6%` (`#1e1c1c`) | **Ash Seam** fill for auxiliary buttons & tracks |
| `--muted` | `0 6% 94.5%` (`#f3efef`) | `0 0% 9.4%` (`#181818`) | **Graphite Slab** code fields & inactive panels |
| `--muted-foreground` | `0 2.5% 42%` (`#6e6868`) | `0 0.6% 60.6%` (`#9b9a9a`)| **Pewter Text** for Geist Mono metadata & captions |
| `--accent` | `0 6% 94%` (`#f2eded`) | `0 4.8% 11.6%` (`#1e1c1c`) | Interactive hover state highlighting |
| `--destructive` | `351 81.3% 53.7%` (`#ea2845`)| `351 81.3% 53.7%` (`#ea2845`)| **Nest Crimson** error states & danger actions |
| `--border` | `0 5% 88%` (`#e3dede`) | `0 1.8% 21.2%` (`#373535`) | **Smoke Outline** 1px hairline card borders |
| `--input` | `0 5% 88%` (`#e3dede`) | `0 1.8% 21.2%` (`#373535`) | Input field borders |
| `--ring` | `351 81.3% 53.7%` (`#ea2845`)| `351 81.3% 53.7%` (`#ea2845`)| **Nest Crimson** active focus ring |

### 2.2 Specialized Brand Accents

- **Nest Crimson (`#ea2845`)**: Hot furnace glow, active indicators, live status pills, logo accent.
- **Garnet (`#780f20`)**: Deep transitional hue in linear and radial background sweeps.
- **Syntax Tokens (Dark)**:
  - Coral Keyword: `#ff7b72`
  - Amber String: `#ffa657`
  - Frost Identifier: `#a5d6ff`

---

## 3. Typography & Hierarchy

### 3.1 Font Stack
- **Display & Interface Font**: `Manrope, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  - Weights: `500` (Medium) for headings and displays; `700` (Bold) for primary button labels.
  - Tracking: `0px` (zero tracking across all sizes).
- **Supporting, Body & Monospace Font**: `"Geist Mono", "JetBrains Mono", ui-monospace, monospace`
  - Weights: `300` (Light) for body copy, paragraphs, descriptions; `400` (Regular) for eyebrows, code, and badges.

### 3.2 Type Scale

| Role | Family | Weight | Size | Line Height | Letter Spacing | Example Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | Manrope | 500 | 48px–96px | 0.95–1.05 | 0px | Landing page hero statements |
| **Section Heading** | Manrope | 500 | 28px–36px | 1.15 | 0px | Major dashboard titles |
| **Card Title** | Manrope | 500 | 18px–22px | 1.40 | 0px | Job titles, assessment cards |
| **Primary Button** | Manrope | 700 | 14px–16px | 1.50 | 0px | Filled CTA buttons |
| **Eyebrow Label** | Geist Mono | 300/400 | 11px–12px | 1.33 | -0.3px | `{ RESUME INTELLIGENCE }_` section tags |
| **Body Paragraph** | Geist Mono | 300 | 13px–14px | 1.70 | 0px | Job descriptions, card sublines |
| **Metadata / Badge** | Geist Mono | 400 | 10px–11px | 1.40 | 0px | Skill chips, confidence scores, dates |

---

## 4. Spacing, Geometry & Radii

ZenHire adopts generous geometric curves that soften high-contrast developer interfaces:

| Container | Border Radius | Description |
| :--- | :--- | :--- |
| **Hero & Main Frames** | `32px` (`rounded-[32px]`) | Full-bleed hero frame, main container wrapper |
| **Cards & Modals** | `24px` (`rounded-[24px]`) | Metric cards, job cards, dialog containers |
| **Buttons & Secondary Cards**| `20px` (`rounded-[20px]`) | Primary CTAs, ghost buttons, inner widgets |
| **Inputs & Textareas** | `20px–24px` | Form fields and search inputs |
| **Badges & Pills** | `9999px` (`rounded-full`) | Category chips, status indicators, match scores |
| **Progress Bars** | `4px` | Match bars, score progress indicators |

---

## 5. Micro-Interactions & Interactive Spotlight

### 5.1 Mouse-Tracking Spotlight Radial Gradient
Cards decorated with `.glass-card` receive an interactive spotlight that dynamically tracks the cursor:
- **Global Listener (`App.tsx`)**: Attaches a non-blocking `pointermove` handler utilizing `window.requestAnimationFrame`.
- **CSS Custom Properties**: Computes mouse position relative to the hovered card's bounding rectangle and updates `--mouse-x` and `--mouse-y` in pixels.
- **Pseudo-Elements (`index.css`)**:
  - `::before`: Renders a smooth radial wash of Nest Crimson (`rgba(234, 40, 69, 0.12)`) centered at `calc(var(--mouse-x) * 1px) calc(var(--mouse-y) * 1px)`.
  - `::after`: Renders a 1px hairline border glow (`rgba(234, 40, 69, 0.40)`) using `mask` / `-webkit-mask` clipping.

### 5.2 Top-Lit Furnace Glow
Hero frames and major section banners feature an atmospheric furnace glow:
```css
background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(234, 40, 69, 0.15), transparent 70%);
```
This mimics an internal stage furnace lighting up the dark smoked glass from behind.

---

## 6. UI Component Primitives

### 6.1 Buttons
- **Bone White (Primary)**: `#ffffff` fill with `#050303` Manrope 700 text, 20px radius, active depression (`active:scale-[0.98]`). In light mode, automatically switches to Carbon `#050303` with white text.
- **Ash Seam (Secondary)**: `#1e1c1c` fill with `#ffffff` text (dark) / `#f0eded` with dark text (light), 20px radius.
- **Ghost Action**: Transparent background, subtle border hover, Manrope 500 text.
- **Destructive**: Nest Crimson background with high-contrast text.

### 6.2 Status & Category Badges (`Badge.tsx`)
- Standardized with `Geist Mono` font, uppercase tracking, and subtle translucent fills (`border border-current/25`).
- **Application Status**: `APPLIED` (cyan), `SHORTLISTED` (emerald), `INTERVIEW_SCHEDULED` (indigo/sky), `HIRED` (green), `REJECTED` (red).
- **Match Score Badge**: Dual-gradient badge highlighting 60/40 hybrid compatibility.

### 6.3 5-Section Resume Intelligence Panel (`CandidateDashboard.tsx`)
- Displays real-time synchronization badges across the 5 canonical sections (`Skills`, `Experience`, `Projects`, `Education`, `Certifications`).
- Displays verified skill taxonomy chips with exact confidence scores (e.g., `LangChain 95%`, `LangGraph 92%`, `Spring Boot 95%`) and unmapped skill preservation tags.
