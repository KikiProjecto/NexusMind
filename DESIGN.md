# DESIGN.md — NexusMind Visual Design System

> **Design philosophy:** NexusMind sits at the intersection of AI intelligence and blockchain verifiability. The visual language must communicate trust, depth, and precision — not excitement for its own sake. Think: the aesthetic of a world-class research lab that happens to be on-chain. Dark, confident, editorial. No neon. No gradients for decoration. Motion with intention.

---

## 0. DESIGN REFERENCES ANALYSIS

From the provided reference sites, extract these core lessons:

**Antora** — Power through restraint. Full-bleed photography, no-gradient type, white on dark. The product IS the visual. Navigation disappears until needed.

**WPP Satalia** — 3D objects as the primary visual identity. Abstract, liquid metal spheres on deep blue. The shape communicates "intelligence" without saying the word.

**Modal** — Pure black canvas. Single accent color (electric green). Type is king: enormous, confident, left-aligned. 3D geometric solids with soft light.

**Litheum** — High-contrast Web3. Black + neon-chartreuse. Bold geometric logo. Statement headline, minimal body copy.

**SpaceKart** — Immersive dark canvas. Cyan ring light. Character/atmosphere over information density.

**What NexusMind inherits from all five:**
- Pure-dark background (not #000, but #07070E — warm near-black with deep indigo undertone)
- Exactly one premium accent: Deep Electric Indigo (#5B6CF7 → NOT neon, more like ink)
- Typography as structural identity — enormous display type, editorial hierarchy
- 3D visual element as hero centerpiece: a network of memory nodes (not generic blockchain)
- Generous negative space — sections breathe
- Motion: purposeful, slow, architectural (not bouncy)

**What NexusMind rejects:**
- Purple-to-cyan gradients (used by every AI company)
- Glassmorphism cards (overused in Web3 2022-2023)
- Gradient text (the default AI aesthetic)
- Particle systems that don't mean anything
- Neon glow halos
- Generic blockchain hexagon imagery
- "Powered by AI" badges

---

## 1. COLOR SYSTEM

### 1.1 Palette

```css
:root {
  /* === BACKGROUNDS === */
  --bg-base: #07070E;          /* Near-black with deep indigo undertone — THE canvas */
  --bg-surface: #0D0D18;       /* Cards, panels */
  --bg-elevated: #12121F;      /* Modals, dropdowns */
  --bg-overlay: #1A1A2E;       /* Hover states, selection */

  /* === PRIMARY ACCENT — Deep Electric Indigo === */
  --accent-primary: #5B6CF7;   /* Main action color, interactive elements */
  --accent-hover: #7480F8;     /* Hover state */
  --accent-pressed: #4553D4;   /* Active/pressed */
  --accent-glow: rgba(91, 108, 247, 0.12);  /* Very subtle ambient glow */

  /* === SECONDARY ACCENT — Warm Silver === */
  --accent-secondary: #B4B8CC; /* Secondary interactive, muted emphasis */
  --accent-tertiary: #3D405E;  /* Borders, dividers, inactive states */

  /* === SEMANTIC — Minimal, functional === */
  --semantic-success: #3ECFA3;  /* Completed workflows, verified artifacts */
  --semantic-warning: #E8A634;  /* Pending tasks, syncing */
  --semantic-error: #F05050;    /* Failed workflows, connection errors */
  --semantic-info: #5B6CF7;     /* Same as accent for consistency */

  /* === TEXT === */
  --text-primary: #E8E9F0;     /* Main body text */
  --text-secondary: #8890B0;   /* Subheadings, labels, metadata */
  --text-muted: #4F5470;       /* Placeholder, disabled */
  --text-inverse: #07070E;     /* Text on light/accent backgrounds */

  /* === SPECIAL === */
  --code-text: #A9F0DD;        /* Inline code, blob IDs */
  --code-bg: #0D1520;          /* Code block background */
  --border-default: rgba(255,255,255,0.06);   /* Subtle card borders */
  --border-accent: rgba(91,108,247,0.30);     /* Focused/active borders */
}
```

### 1.2 Color Usage Rules
- **Never** use gradients for decoration — only for functional data encoding (similarity scores, health meters)
- `--bg-base` is the default page background — never deviate
- `--accent-primary` appears at most 2-3 times per viewport — don't dilute it
- Text hierarchy: primary → secondary → muted, never skip levels
- Code/blob IDs always in `--code-text` on `--code-bg` background

---

## 2. TYPOGRAPHY

### 2.1 Typeface Selection

```
Display: "Sora" (Google Fonts, variable)
  → Geometric sans-serif. Precise, forward-looking.
  → Used for: Hero headlines, section titles, large numbers
  → Weights: 200 (thin), 400 (regular), 700 (bold), 800 (extrabold)

Body: "Inter" (variable)
  → The standard for legibility in dense technical UIs
  → Used for: Body copy, labels, navigation, UI text
  → Weights: 400, 500, 600

Mono: "JetBrains Mono" (variable)
  → Used for: Blob IDs, addresses, code snippets, hash values
  → Weight: 400, 500
```

Import in `globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@200;400;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
```

### 2.2 Type Scale

```css
/* === DISPLAY === */
--type-display-xl: clamp(64px, 8vw, 120px);   /* Hero headline */
--type-display-lg: clamp(48px, 5vw, 80px);    /* Section hero text */
--type-display-md: clamp(32px, 3.5vw, 52px);  /* Subsection titles */

/* === HEADINGS === */
--type-h1: clamp(28px, 3vw, 44px);
--type-h2: clamp(22px, 2.5vw, 36px);
--type-h3: clamp(18px, 2vw, 26px);
--type-h4: 18px;

/* === BODY === */
--type-body-lg: 18px;
--type-body-md: 16px;
--type-body-sm: 14px;

/* === UTILITY === */
--type-label: 12px;      /* Uppercase, tracked */
--type-caption: 11px;    /* Timestamps, metadata */
--type-mono: 14px;       /* Code, addresses */

/* === TRACKING === */
--tracking-tight: -0.03em;     /* Display text */
--tracking-normal: 0;
--tracking-wide: 0.06em;       /* Labels, eyebrows */
--tracking-widest: 0.12em;     /* Section markers */

/* === LINE HEIGHT === */
--leading-display: 1.05;
--leading-heading: 1.2;
--leading-body: 1.65;
--leading-relaxed: 1.8;
```

### 2.3 Typography Usage

```css
/* Hero headline */
.text-display-xl {
  font-family: 'Sora', sans-serif;
  font-size: var(--type-display-xl);
  font-weight: 800;
  line-height: var(--leading-display);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
}

/* Section eyebrow — the small uppercase label above a headline */
.text-eyebrow {
  font-family: 'Inter', sans-serif;
  font-size: var(--type-label);
  font-weight: 600;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--accent-primary);
}

/* Body text */
.text-body {
  font-family: 'Inter', sans-serif;
  font-size: var(--type-body-md);
  font-weight: 400;
  line-height: var(--leading-body);
  color: var(--text-secondary);
}

/* Monospace addresses/IDs */
.text-address {
  font-family: 'JetBrains Mono', monospace;
  font-size: var(--type-mono);
  color: var(--code-text);
  background: var(--code-bg);
  padding: 2px 6px;
  border-radius: 4px;
}
```

**The Signature Typography Moment:** Hero text uses a **split weight** technique:
- Line 1: "NEXUSMIND" — Sora 200 weight, enormous (120px), slight tracking, pure white
- Line 2: "Agents that remember" — Sora 800 weight, same size, indigo accent on "remember"
This contrast of thin/heavy within one headline is the distinctive typographic choice that no other Web3 project is doing.

---

## 3. LAYOUT SYSTEM

### 3.1 Grid

```css
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 clamp(24px, 5vw, 80px);
}

.container-wide {
  max-width: 1440px;
}

.container-narrow {
  max-width: 800px;
}

/* 12-column grid */
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: clamp(16px, 2vw, 32px);
}
```

### 3.2 Spacing Scale

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
--space-32: 128px;
--space-40: 160px;
```

### 3.3 Section Layout Patterns

**Pattern A: Full Bleed** — used for hero
```
[================================================]
[                  FULL BLEED                    ]
[         no container, edge to edge             ]
[================================================]
```

**Pattern B: Asymmetric Split** — used for feature sections
```
[container]
[ 5 cols: text + eyebrow + CTA ] [ 7 cols: visual/demo ]
[/container]
```

**Pattern C: Centered Focus** — used for stats, testimonials
```
[container-narrow]
[       centered text max 65ch       ]
[      supporting element below      ]
[/container-narrow]
```

**Pattern D: Three Column** — used for feature cards
```
[container]
[ card 1/3 ]  [ card 2/3 ]  [ card 3/3 ]
[/container]
```

**Pattern E: Alternating** — used for deep-dives
```
[  text left  |  visual right  ]
[  visual left  |  text right  ]
[  text left  |  visual right  ]
```

### 3.4 Section Rhythm
- Every section: minimum `--space-32` vertical padding (128px)
- Hero section: 100vh minimum
- Section separators: thin `1px` horizontal rule at `--border-default` opacity
- Section transitions: NOT abrupt cuts — gentle gradient fade between dark shades

---

## 4. COMPONENT LIBRARY

### 4.1 Navigation

```
Position: fixed top, full width
Height: 64px
Background: transparent → rgba(7,7,14,0.85) + blur(20px) on scroll
Border-bottom: 1px solid var(--border-default) on scroll

Layout:
  [LOGO]    [nav links centered]    [Connect Wallet CTA]

Logo:
  - NexusMind wordmark in Sora 700
  - Small abstract mark: 3 connected nodes (SVG, 24×24)
  - Wordmark: "NEXUS" in white, "MIND" in accent

Nav links:
  - 5 items: Technology, Agents, Memory, Developer, Docs
  - Inter 500, 14px
  - Color: --text-secondary → --text-primary on hover
  - No underlines, no boxes — pure color transition
  - Active: thin 1px bottom border in accent color

CTA Button:
  - "Connect Wallet"
  - Outlined style: 1px solid --accent-primary, --accent-primary text
  - Hover: filled with --accent-primary, --text-inverse text
  - Transition: 200ms ease all
```

### 4.2 Button System

```css
/* PRIMARY — Filled indigo */
.btn-primary {
  background: var(--accent-primary);
  color: var(--text-inverse);
  border: 1px solid transparent;
  padding: 12px 28px;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.01em;
  transition: background 200ms, transform 150ms, box-shadow 200ms;
  cursor: pointer;
}
.btn-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(91, 108, 247, 0.25);
}
.btn-primary:active {
  transform: translateY(0);
  background: var(--accent-pressed);
}

/* GHOST — Outlined */
.btn-ghost {
  background: transparent;
  color: var(--accent-primary);
  border: 1px solid var(--accent-primary);
  /* same padding/font as primary */
}
.btn-ghost:hover {
  background: var(--accent-glow);
}

/* TEXT — No border */
.btn-text {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  padding: 8px 0;
  /* underline on hover */
}

/* DANGER */
.btn-danger {
  background: var(--semantic-error);
  /* same structure as primary */
}
```

### 4.3 Card System

```css
/* BASE CARD */
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  padding: var(--space-8);
  position: relative;
  overflow: hidden;
  transition: border-color 300ms, transform 300ms;
}

.card::before {
  /* Subtle top-edge accent line — appears on hover */
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: var(--accent-primary);
  opacity: 0;
  transition: opacity 300ms;
}

.card:hover {
  border-color: var(--accent-tertiary);
  transform: translateY(-2px);
}

.card:hover::before {
  opacity: 1;
}

/* MEMORY CARD variant */
.card-memory {
  /* extends .card */
  padding: var(--space-6);
  cursor: pointer;
}
.card-memory .memory-content {
  font-size: var(--type-body-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ARTIFACT CARD variant */
.card-artifact {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
}

/* STAT CARD */
.card-stat {
  text-align: center;
  padding: var(--space-10) var(--space-8);
}
.card-stat .stat-number {
  font-family: 'Sora', sans-serif;
  font-size: var(--type-display-md);
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: var(--tracking-tight);
}
.card-stat .stat-label {
  font-size: var(--type-body-sm);
  color: var(--text-muted);
  margin-top: var(--space-2);
}
```

### 4.4 Input System

```css
.input {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 12px 16px;
  font-family: 'Inter', sans-serif;
  font-size: var(--type-body-md);
  color: var(--text-primary);
  width: 100%;
  transition: border-color 200ms, box-shadow 200ms;
  outline: none;
}
.input::placeholder {
  color: var(--text-muted);
}
.input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

/* Search variant — with icon slot */
.input-search {
  padding-left: 44px; /* room for search icon */
  background-image: url("data:image/svg+xml,..."); /* search icon */
  background-repeat: no-repeat;
  background-position: 14px center;
}
```

### 4.5 Badge System

```css
/* ROLE BADGES */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 100px;
  font-size: var(--type-label);
  font-weight: 600;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

.badge-orchestrator { background: rgba(91,108,247,0.15); color: #8090FA; border: 1px solid rgba(91,108,247,0.3); }
.badge-researcher   { background: rgba(62,207,163,0.12); color: #3ECFA3; border: 1px solid rgba(62,207,163,0.25); }
.badge-trader       { background: rgba(232,166,52,0.12); color: #E8A634; border: 1px solid rgba(232,166,52,0.25); }
.badge-monitor      { background: rgba(180,184,204,0.10); color: #B4B8CC; border: 1px solid rgba(180,184,204,0.2); }

/* STATUS BADGES */
.badge-completed  { background: rgba(62,207,163,0.12); color: #3ECFA3; }
.badge-running    { background: rgba(91,108,247,0.15); color: #8090FA; }
.badge-pending    { background: rgba(232,166,52,0.12); color: #E8A634; }
.badge-failed     { background: rgba(240,80,80,0.12); color: #F05050; }

/* ENCRYPTED badge */
.badge-encrypted {
  background: rgba(91,108,247,0.15);
  color: var(--accent-primary);
  border: 1px solid var(--border-accent);
}
.badge-encrypted::before {
  content: '🔒';
  font-size: 10px;
}
```

---

## 5. PAGE-BY-PAGE DESIGN SPECS

### 5.1 Hero Section (Landing)

**Visual Concept:** The signature 3D element is a **Memory Constellation** — an abstract network of luminous nodes connected by fine white filaments, slowly rotating in 3D space. Each node represents an agent memory. The constellation is rendered in WebGL (Three.js) or as an SVG animation fallback. It sits RIGHT of center, occupying ~60% of the viewport.

**Layout:**
```
[FULL VIEWPORT HEIGHT]
[bg: --bg-base]

  [60px from top: fixed nav]

  [centered vertically + 40px up]:
  
  LEFT COLUMN (5/12 grid):
    [eyebrow: "MULTI-AGENT MEMORY PROTOCOL"]
    [gap: 20px]
    ["NEXUS" (thin 200 weight)] + linebreak
    ["MIND"  (bold 800 weight)] 
    → 120px Sora, letter-spacing: -0.03em
    [gap: 24px]
    ["AI agents that remember."] — Sora 800, 52px, accent color on "remember"
    [gap: 32px]
    [body: "NexusMind gives AI agents persistent, verifiable memory—powered by Walrus."]
    [gap: 40px]
    [CTA row: [btn-primary "Explore Memory"] [gap 16px] [btn-ghost "View Demo ↗"]]

  RIGHT COLUMN (7/12 grid):
    [Memory Constellation 3D animation]
    [Floating mini-cards showing live memory snippets, slowly scrolling in]
```

**Scroll indicator:** Thin vertical line at bottom center, animated dot scrolling down.

### 5.2 Problem Section

**Visual:** 3 cards, full width, horizontal on desktop / stacked on mobile.
Each card: icon (SVG, 48×48), headline, body copy. NO numbers/bullets.

Cards:
1. **Stateless** — icon: broken chain. "Agents reset with every session. Context is lost."
2. **Fragmented** — icon: scattered nodes. "Memory locked to one app, device, or model."  
3. **Unverifiable** — icon: question mark in shield. "No proof memory is intact or untampered."

Transition from hero: very subtle dark-to-surface gradient (10px height, same dark tone).

### 5.3 Architecture Section

**Visual:** Interactive technical diagram. SVG-based, NOT a screenshot of a whiteboard.

The diagram shows the 5 layers:
- Agents (top row: orchestrator, researcher, trader, monitor) — with role badges
- MemWal SDK layer — connecting arrows animate from agent → MemWal on hover
- Storage layer: Walrus blob, Seal encrypted blob, Sui object — three distinct shapes
- Walrus Sites dashboard — at the bottom

**Interaction:** Hover any layer → highlight all connections, show tooltip with key facts.

### 5.4 Features Section (Alternating Pattern)

**Feature 1 — Persistent Memory:**
Left: text + code snippet showing `remember()` / `recall()` / `restore()`
Right: animated visualization of a memory being stored then recalled

**Feature 2 — Encrypted Sharing:**
Left: animation showing Seal envelope encryption flow
Right: text explaining the cross-agent privacy model

**Feature 3 — Artifact-Driven Workflows:**
Left: text with blob_id examples as `--code-text` styled
Right: animated workflow diagram: task → store → share → recall

**Feature 4 — Developer SDK:**
Left: code block showing `NexusMindAgent` class initialization
Right: text about npm package, TypeScript-first, Zod-validated

### 5.5 Stats Section

4 stat cards in a row:
- `1,200+` Memories per session
- `< 500ms` Recall latency  
- `100%` Portable (restore-proven)
- `∞` Sessions persisted

Numbers animate up from 0 when scrolled into view (CountUp animation).

### 5.6 Developer Section

Dark code showcase. Shows the full end-to-end pattern:

```
[eyebrow: "OPEN DEVELOPER SDK"]
[headline: "Build agents that actually remember."]
[code block: 40-line example of full agent workflow]
[CTA: "View Documentation" → docs/ page]
[secondary: "Install: npm install @nexusmind/sdk"]
```

Code block style: `--code-bg` background, JetBrains Mono, syntax highlighted.

### 5.7 Agent Demo Section

Live interactive demo:
- Dropdown: "Choose demo agent" → researcher / trader / monitor
- "Run Demo" button → executes real agent workflow (or simulates with pre-loaded data)
- Progress indicators for each step: Recall → Execute → Store → Remember
- Live output panel: shows actual memory content and blob IDs
- "Try restore()" button → wipes display, rebuilds from Walrus, shows before/after

### 5.8 Footer

```
[Narrow container, 3 columns]

[LOGO + tagline]     [Links: Docs, GitHub, Discord]     [Tech: Walrus | Seal | Sui | MemWal]

[bottom: copyright + "Powered by Walrus + Sui" with their logos]
```

---

## 6. MOTION DESIGN

### 6.1 Principles
- Motion reveals information, it doesn't decorate
- Maximum 3 simultaneous animations per viewport
- Every animation respects `prefers-reduced-motion`
- Duration: 200ms (micro), 400ms (element), 600-800ms (page/section)
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` — fast start, slow settle (iOS spring feel)

### 6.2 Page Load Sequence (Orchestrated)
```
0ms    : Background renders
100ms  : Navigation fades in (opacity 0→1, translateY -8→0)
300ms  : Hero eyebrow fades in
400ms  : Hero headline reveals character-by-character (Framer Motion)
600ms  : Hero body text fades in
700ms  : CTA buttons fade in + slight upward translate
900ms  : Memory Constellation begins slow rotation
1200ms : Floating memory cards appear one by one
```

### 6.3 Scroll Animations (Framer Motion)
```typescript
// Reusable scroll reveal variant
const scrollReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

// Staggered children
const staggerContainer = {
  visible: {
    transition: { staggerChildren: 0.12 }
  }
};

// Use with:
// <motion.div variants={scrollReveal} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
```

### 6.4 Memory Constellation (Hero 3D)
```typescript
// Three.js sphere of 200 nodes connected by luminous edges
// Each node: sphere geometry, radius 0.08, emissive: #5B6CF7 (dim, not bright)
// Edges: LineSegments, color: #2A2D50, opacity: 0.4
// Rotation: 0.001 rad/frame around Y axis + 0.0005 around X
// On hover: nearest node brightens, edges from that node highlight in accent
// Fallback (reduced motion / no WebGL): static SVG version
```

### 6.5 CountUp Animation (Stats)
```typescript
// Trigger when section enters viewport
// Duration: 2000ms
// Easing: easeOut cubic
// Format: add commas, + symbol for growth stats
```

### 6.6 Code Block Animation
```typescript
// Lines appear one by one as if being typed
// Delay 40ms between lines
// Cursor blinks at the end
// Triggered once on viewport entry
// Skip animation on reduced-motion
```

### 6.7 Workflow Timeline Animation
```typescript
// Task nodes appear left-to-right
// Connecting line draws itself between each node (SVG pathLength animation)
// Artifact bubbles float up from completed tasks
// Agent avatar slides in above each task
```

---

## 7. DASHBOARD UI — INTERNAL PAGES

### 7.1 Dashboard Navigation (Sidebar)
```
Position: Fixed left sidebar, 240px wide
Background: --bg-surface
Border-right: 1px solid --border-default

Items:
  [NexusMind logo + version]
  ─────────────
  [overview icon] Overview
  [brain icon]    Memory Explorer
  [files icon]    Artifacts
  [flow icon]     Workflows
  [agents icon]   Agents
  [restore icon]  Restore Demo
  ─────────────
  [wallet icon]   Connect Wallet
  [docs icon]     Documentation ↗
```

### 7.2 Memory Explorer Layout
```
[Search bar: full width, --input-search style]
[Namespace selector: tab row — all | orchestrator | researcher | trader | monitor]
[gap]
[Masonry grid of Memory Cards, 3 cols desktop / 2 cols tablet / 1 col mobile]
[Infinite scroll with intersection observer]
[Fixed bottom right: "Ask Memory" floating button → opens chat panel]
```

### 7.3 Network Graph (Overview Page)
```
Full-width, 100% height below header
Background: --bg-base

D3 force simulation:
  - Agent nodes: circles, 40px diameter, labeled with role badge
  - Memory nodes: circles, 12px diameter, cluster around their agent
  - Artifact nodes: diamonds, 16px, attached to agent that created them
  - Edges:
    - agent → memory: thin, --accent-tertiary opacity 0.5
    - agent → artifact: medium, --accent-primary opacity 0.4
    - agent → agent (shared): thick, --semantic-success opacity 0.6

Interactions:
  - Drag nodes to rearrange
  - Hover → tooltip with content preview
  - Click memory node → open Memory Card detail panel on right
  - Click artifact node → open Artifact detail panel
  - Zoom: scroll wheel, pinch on mobile
```

---

## 8. RESPONSIVE BREAKPOINTS

```css
/* Mobile first */
--bp-sm: 640px;
--bp-md: 768px;
--bp-lg: 1024px;
--bp-xl: 1280px;
--bp-2xl: 1536px;

/* Tailwind config extends: */
screens: {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}
```

**Mobile adaptations:**
- Hero: single column, constellation becomes smaller
- Navigation: hamburger → slide-in panel
- Cards: single column
- Code blocks: horizontal scroll
- Network graph: simplified (fewer nodes), touch controls

---

## 9. TAILWIND CONFIGURATION

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#07070E',
          surface: '#0D0D18',
          elevated: '#12121F',
          overlay: '#1A1A2E',
        },
        accent: {
          primary: '#5B6CF7',
          hover: '#7480F8',
          pressed: '#4553D4',
        },
        text: {
          primary: '#E8E9F0',
          secondary: '#8890B0',
          muted: '#4F5470',
        },
        border: {
          default: 'rgba(255,255,255,0.06)',
          accent: 'rgba(91,108,247,0.30)',
        },
        semantic: {
          success: '#3ECFA3',
          warning: '#E8A634',
          error: '#F05050',
        },
        code: {
          text: '#A9F0DD',
          bg: '#0D1520',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(64px, 8vw, 120px)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(48px, 5vw, 80px)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(32px, 3.5vw, 52px)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        card: '12px',
        pill: '100px',
      },
      boxShadow: {
        'accent-sm': '0 4px 16px rgba(91, 108, 247, 0.2)',
        'accent-md': '0 8px 32px rgba(91, 108, 247, 0.25)',
        'glow': '0 0 60px rgba(91, 108, 247, 0.08)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
```

---

## 10. ICON SYSTEM

Use **Lucide React** for all utility icons (consistent, MIT licensed).

```typescript
import { 
  Brain,          // Memory
  Archive,        // Artifacts / Storage
  Workflow,       // Workflows
  Bot,            // Agents
  Lock,           // Seal / Encrypted
  Globe,          // Walrus network
  Zap,            // Performance
  RefreshCw,      // Restore
  Search,         // Memory search
  ChevronRight,   // CTAs
  ExternalLink,   // External links
  Copy,           // Copy address/ID
  CheckCircle,    // Verified / Success
  XCircle,        // Error
  Clock,          // Timestamp
} from 'lucide-react';
```

Custom SVGs (design these, do not use stock):
- **NexusMind mark:** 3 nodes in triangle formation, connected by lines, one node larger
- **Walrus mark:** Use official Walrus icon
- **Memory node:** Small filled circle with radiating dots
- **Sealed artifact:** Lock inside diamond

---

## 11. DESIGN ANTI-PATTERNS (STRICTLY FORBIDDEN)

| ❌ Never Use | ✅ Use Instead |
|---|---|
| Purple-to-cyan gradient backgrounds | Solid `--bg-base` |
| Glowing neon halos on text | Subtle `text-shadow` max 1px blur |
| Glassmorphism blur cards | Solid `--bg-surface` with border |
| "Powered by AI" or "Web3" badges | Show the tech through actual implementation |
| Generic particle backgrounds | The Memory Constellation (meaningful) |
| Bounce animations | `cubic-bezier(0.16, 1, 0.3, 1)` springs |
| Gradient text (linear-gradient on text) | Solid accent color for emphasis words |
| 3D perspective transforms on cards | Flat cards with subtle translateY hover |
| Skeleton loaders as gray blocks | Animated shimmer with correct card shape |
| Tooltip on every element | Labels visible by default, hover for detail |
| More than 2 accent colors in one section | One primary, one semantic per context |
| More than 3 font weights visible at once | display (800) + body (400/500) + label (600) |
| Padding inconsistency between sections | Always from spacing scale |

---

## 12. ACCESSIBILITY

- Color contrast: all text meets WCAG AA minimum (4.5:1 for body, 3:1 for large)
- Focus states: visible 2px outline in `--accent-primary` on all interactive elements
- Keyboard navigation: all cards, buttons, and nav items reachable without mouse
- Screen reader: all icons have `aria-label`, all images have `alt`
- Reduced motion: all Framer Motion animations wrapped in `useReducedMotion()` check
- Font sizes: minimum 14px for any readable text

---

*DESIGN.md — Reference AGENTS.md for build conventions. Reference DEBUG.md if visual elements break.*
