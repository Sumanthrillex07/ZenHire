# NestJS — Style Reference
> crimson furnace behind smoked glass. Build soot-black pages where giant light Manrope headlines float over rounded frames that glow garnet from within.

**Theme:** dark

Source measurements are normalized; roles and recommendations are interpreted. Font summary lists are independent, not paired by position. HTML examples are reconstructions, not source components.

NestJS is a soot-black framework site that treats the browser like a dark stage lit by one crimson furnace. The hero, the stats band and the Devtools showcase sit inside 32px-radius frames washed with Nest Crimson #ea2845 fading through Garnet #780f20 into Soot Canvas #050303, while everything between them stays near-black with hairline 1px seams. Manrope at weight 500 runs huge and untracked, from 48px section headings to 112px and 128px statements, and every paragraph, eyebrow and stat label drops into light 300-weight Geist Mono, so marketing copy reads like terminal output. White 20px-radius buttons are the only bright fills.

## Colors

| Name | Value | Role |
|------|-------|------|
| Soot Canvas | `#050303` | Page background behind every section — a red-tinged black so the crimson glows bleed in without a seam |
| Bone White | `#ffffff` | Headlines, navigation, body copy and the filled primary button — the only bright fill on the page |
| Nest Crimson | `#ea2845` | The cat logo, the hot corner of every glow gradient and the Devtools showcase wash — red is light behind the page, almost never a flat fill |
| Garnet Sweep | `linear-gradient(to right in oklab, rgb(234, 40, 69) 0%, rgb(120, 15, 32) 50%, rgb(5, 3, 3) 100%)` | Crimson-to-garnet-to-soot sweep behind the hero frame, stats band and syntax section — the furnace glow that defines the page |
| Graphite Slab | `#181818` | Syntax section field, code-editor body and the footer slab with its grain texture |
| Carbon Panel | `#0b0b0b` | Body of the large bordered code window and dark framed panels that sit one step above the canvas |
| Ash Seam | `#1e1c1c` | Secondary button fill, progress tracks and the 1px seams of the sponsor logo grid |
| Smoke Outline | `#373535` | Translucent white 1px outlines on cards, the code window and the testimonial author pill |
| Pewter Text | `#9b9a9a` | Muted Geist Mono labels, hero stat captions, inactive tab titles and line icons |
| Iron Gray | `#4e4e4e` | The newsletter Subscribe button fill, sitting inside the translucent e-mail field |
| Coral Keyword | `#ff7b72` | Keywords such as import, async and const in the syntax code panel — GitHub-dark syntax colouring |
| Amber String | `#ffa657` | String literals in the syntax code panel, the only warm yellow on the page |
| Frost Identifier | `#a5d6ff` | Function and method names in the syntax code panel, a cool counterpoint to the coral keywords |

## Typography

### Manrope — The display and interface face. Weight 500 carries everything from 48px section headings to the 112px hero and 128px statements at line-heights near 1.0 and zero tracking, so giant lines read soft and geometric rather than shouty; 16px/500 nav, 16px/700 buttons and 14px/600 footer links share it.
- **Substitute:** Inter, Arial, sans-serif
- **Licence:** open (SIL Open Font License); free to use and self-host
- **Weights:** 400, 500, 600, 700
- **Sizes:** 14px, 16px, 18px, 20px, 22px, 24px, 48px, 60px, 72px, 96px, 112px, 128px, 130px, 160px
- **Line height:** 0.95, 1.00, 1.04, 1.10, 1.15, 1.17, 1.20, 1.40, 1.50, 1.56, 1.60, 2.57
- **Letter spacing:** normal (0px) at every size from 14px to 160px

### Geist Mono — Every paragraph, not just code: hero and section copy at 14px/300 with 24px line-height, uppercase { BRACKETED }_ eyebrows at 12px/300 with -0.3px tracking, stat labels and course metadata at 14px/400, and the 16px/300 syntax panel at 40px line-height. The light monospace makes prose read like CLI output.
- **Substitute:** JetBrains Mono, SFMono-Regular, Menlo, Consolas, monospace
- **Licence:** open (SIL Open Font License); free to use and self-host
- **Weights:** 300, 400
- **Sizes:** 12px, 14px, 16px
- **Line height:** 1.33, 1.43, 1.71, 2.00, 2.29, 2.50, 2.86
- **Letter spacing:** -0.3px at 12px uppercase eyebrows; 0px at 14px and 16px

### Type Scale

| Role | Family | Weight | Size | Line Height | Letter Spacing |
|------|--------|--------|------|-------------|----------------|
| eyebrow | Geist Mono | 300 | 12px | 1.33 | -0.3px |
| body | Geist Mono | 300 | 14px | 1.71 | 0px |
| footer-link | Manrope | 600 | 14px | 2.57 | 0px |
| nav | Manrope | 500 | 16px | 1.5 | 0px |
| button | Manrope | 700 | 16px | 1.5 | 0px |
| code | Geist Mono | 300 | 16px | 2.5 | 0px |
| tab-title | Manrope | 500 | 20px | 1.4 | 0px |
| card-title | Manrope | 500 | 22px | 1.4 | 0px |
| section-heading | Manrope | 500 | 48px | 1.17 | 0px |
| showcase-title | Manrope | 500 | 60px | 1 | 0px |
| hero-display | Manrope | 500 | 112px | 0.95 | 0px |
| statement-display | Manrope | 500 | 128px | 1.1 | 0px |

## Spacing & Layout

**Base unit:** 4px

**Density:** spacious

- **Page max-width:** 1280px
- **Section gap:** 120px
- **Card padding:** 20px
- **Element gap:** 8px

### Border Radius

- **frames:** 32px
- **nav:** 32px
- **cards:** 24px
- **inputs:** 24px
- **buttons:** 20px
- **images:** 12px
- **progress:** 4px
- **pills:** 9999px

## Components

### Floating Glass Nav Bar
**Role:** Top site navigation inside the hero frame

An 80px-high bar inset in the hero frame: 60%-black fill over the crimson glow, 32px radius, 20px padding. Crimson cat logo at left, centred 16px/500 Manrope Bone White links with a chevron on Tools, white social glyphs at right. No shadow.

### Crimson Glow Hero Frame
**Role:** Opening hero panel

A full-width frame inset 40px from the viewport with a 32px radius, filled with a drifting Nest Crimson #ea2845 to Garnet #780f20 to Soot Canvas #050303 glow. Centre a 112px/500 Manrope Bone White headline at 0.95 line-height, then 14px/300 Geist Mono copy and the button pair.

### Bone White Button
**Role:** Primary call to action

Bone White #ffffff fill with a black 16px/700 Manrope label at 24px line-height, 20px radius and 20px padding for a 64px-high block. No border, no shadow; it is the only bright filled control on the page.

### Ghost Text Button
**Role:** Secondary hero action

Transparent fill, Bone White #ffffff 16px/700 Manrope label, 20px padding and 20px radius so it aligns with the Bone White Button beside it; an optional leading play glyph for video links. No outline.

### Ash Seam Button
**Role:** Secondary filled action on dark sections

Ash Seam #1e1c1c fill with a Bone White 16px/700 Manrope label, 20px radius and 20px padding, 64px high. Used for Official documentation beside the syntax panel. No border, no shadow.

### Bracketed Mono Eyebrow
**Role:** Section label above headings

Uppercase Geist Mono at 12px/300 with 16px line-height and -0.3px tracking in Pewter Text #9b9a9a, wrapped in curly braces with a trailing blinking underscore: { WHAT IS NEST }_. Sits 16px above a 48px/500 Manrope heading.

### Split Statement Block
**Role:** Section intro with heading and side note

A 48px/500 Manrope Bone White heading at 56px line-height spanning the left half of the 1280px container, with a 14px/300 Geist Mono paragraph at 24px line-height in the right third, top-aligned. No card, straight on Soot Canvas #050303.

### Fanned Feature Card
**Role:** Overlapping capability cards

Square 350px Graphite cards with a top-lit gradient, 24px radius, a 1px rgba(255, 255, 255, 0.2) Smoke Outline #373535 edge and a 0 4px 10px rgba(0, 0, 0, 0.2) shadow. Fan them with slight rotations; centre a chrome 3D icon over a 20px/600 Manrope label.

### Product Showcase Frame
**Role:** Observe, Devtools and Deploy panels

A 1520px frame with a 32px radius: a 60px/500 Manrope title and 14px/300 Geist Mono subline over a bezel-framed app screenshot, then a Graphite Slab #181818 strip of three 22px/500 tab titles whose inactive state fades to Pewter, each over a 4px-radius progress line.

### Syntax Code Window
**Role:** Tabbed code sample

A Carbon Panel #0b0b0b window with 24px top radii and a 1px Smoke Outline #373535 edge, a tab row of 16px/600 Manrope labels, and 16px/300 Geist Mono code at 40px line-height using Coral Keyword #ff7b72, Amber String #ffa657 and Frost Identifier #a5d6ff.

### Hairline Service Grid
**Role:** Enterprise support feature grid

A 3-column grid with a 20px outer radius on the corner cells and 1px rgba(255, 255, 255, 0.15) seams, 320px-high cells on Soot Canvas #050303, each with a white line icon above an 18px/500 Manrope Bone White label. No fills, no shadow.

### Crimson Stats Band
**Role:** Download and star counts

A 32px-radius frame with the same crimson-garnet glow as the hero: a 72px/500 Manrope statement at left and a 160px/500 Manrope figure at right with 12px/300 Geist Mono captions, smaller 48px figures beneath. Bone White text only.

### Sponsor Logo Grid
**Role:** Tiered sponsor wall

Square 160px cells joined by 1px Ash Seam #1e1c1c borders, monochrome white logos centred in each, with a 12px Geist Mono { 1 }_ eyebrow and a 24px/500 Manrope tier name at the left of each row.

### Pill Newsletter Field
**Role:** Footer e-mail signup

A 66px-high input with rgba(255, 255, 255, 0.122) fill and matching 1px border, 24px radius, 24px 20px padding and an uppercase 12px/400 Geist Mono placeholder; an Iron Gray #4e4e4e 22px-radius Subscribe button with a 14px/600 Manrope label sits inside the right end.

### Grain Slab Footer
**Role:** Site footer

A Graphite Slab #181818 frame with 32px top radii and film grain: a 96px/400 Manrope npm command whose letters fade from Pewter to white, then a 1px-seamed split with the newsletter at left and four link columns of 14px/600 Manrope under 12px Geist Mono uppercase headers.

## Do's and Don'ts

### Do
- Use Soot Canvas #050303 as the page field everywhere; lift panels only to Carbon Panel #0b0b0b and Graphite Slab #181818.
- Set display type in Manrope 500 at 0px tracking: 48px/56px section headings, 112px/0.95 hero lines and 128px/1.1 statements.
- Set all running copy in Geist Mono 14px/300 at 24px line-height, including hero sublines and feature descriptions.
- Apply Nest Crimson #ea2845 as light: radial and linear glows fading through Garnet #780f20 to Soot Canvas inside 32px-radius frames.
- Reserve the Bone White #ffffff fill for the single primary button per section, at 20px radius and 20px padding.
- Keep section labels as uppercase 12px/300 Geist Mono eyebrows in braces with a trailing underscore: { SUPPORT }_.
- Build grids from 1px seams at rgba(255, 255, 255, 0.15) or Ash Seam #1e1c1c instead of filled cards.

### Don't
- Do not fill buttons, badges or text with flat Nest Crimson #ea2845; red lives in the logo and the glows.
- Do not set headlines bold; Manrope stays at 500 even at 128px and 160px.
- Do not add negative tracking to the display sizes; the site measures 0px at every Manrope size.
- Do not switch paragraphs to a sans; body copy is light 300-weight Geist Mono.
- Do not use soft drop shadows for separation; use tonal steps and 1px translucent-white outlines.
- Do not square off frames or buttons; keep 32px frames, 24px cards and inputs, and 20px buttons.
- Do not use a cool blue-black as the canvas; keep the warm red-tinged Soot Canvas #050303.

## Elevation

- **Fanned Card Lift:** `rgba(0, 0, 0, 0.2) 0px 4px 10px 0px`

## Surfaces

- **Soot Canvas** (`#050303`) — Page field behind every section and glow
- **Carbon Panel** (`#0b0b0b`) — Bordered code window body and dark framed panels
- **Graphite Slab** (`#181818`) — Syntax section, editor body and footer slab
- **Ash Seam** (`#1e1c1c`) — Secondary buttons, progress tracks, grid seams

## Imagery

Imagery is product UI and light. The three showcase frames hold real dark-mode application screenshots (logs, a dependency graph, deployment metrics) set inside a pale bezel with 12px top-rounded corners, lit by white and crimson radial glows. Feature cards carry small chrome, wireframe-like 3D objects; course cards glow in jewel tones (crimson, magenta, teal, violet) on black. There is no lifestyle photography beyond small square avatar portraits in testimonials. Brand logos are rendered monochrome white, icons are thin white line glyphs, and atmosphere comes from canvas-drawn animated gradients, a twinkling starfield, film grain and a glowing red arc.

## Layout

The page is a single 1280px container (32px side padding) on Soot Canvas, punctuated by full-bleed rounded frames inset 40px from the viewport edge. The hero is one such 32px-radius glowing frame holding a floating 80px nav bar, a centred two-line 112px headline, a 14px mono subline, a centred button pair and right-aligned mono stats. Below, a five-column logo wall leads to split statement blocks (48px heading left, mono note right), a fan of overlapping square cards, and a 3000px-tall scroll-revealed 128px statement over a starfield. Three stacked 1520px showcase frames (Observe, Devtools, Deploy) follow, then a hairline 3-column service grid, a split syntax section, a crimson stats band, testimonials, a tiered sponsor grid and a grain-textured footer slab. Section gaps run 80–160px, so density is spacious despite compact mono copy.

## Similar Brands

- **Vercel** — Shares a black canvas, large sans headlines and monospace supporting copy for a developer audience.
- **Raycast** — Uses dark rounded frames lit by a saturated red glow behind real product screenshots.
- **Linear** — Same near-black stage with soft light gradients and 1px translucent-white outlines instead of shadows.
