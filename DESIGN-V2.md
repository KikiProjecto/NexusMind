# DESIGN-V2.md — NexusMind Absolute Design System

> **This document supersedes DESIGN.md entirely. Every rule here is law. No exceptions, no debates, no "just this once".**
> The design references are Modal, SpaceKart, and Litheum. Extract their discipline, not their colors. The lesson from all three: restraint, confidence, and one powerful visual element.

---

## 0. THE DESIGN MANIFESTO

### What NexusMind looks like in one sentence:
A near-black canvas, powerful left-anchored typography in **Space Grotesk**, a single deep indigo accent, and one dominant 3D hero object — a cluster of interconnected memory nodes with noise-textured surfaces and dramatic single-source lighting.

### Why these three references work:

**Modal** teaches: true black canvas, 3D objects with GRAIN/NOISE texture that makes them feel tactile and real, one lime-green accent word in an otherwise white headline, objects that bleed off-screen edges, absolute typographic confidence.

**SpaceKart** teaches: the 3D visual CAN overlap the type (creates depth), type can be massive and partially hidden, atmospheric backgrounds without ugly gradients, dimensional storytelling.

**Litheum** teaches: two-line hero headlines with maximum weight, dramatic 3D object lighting (not uniform — one bright light source), minimal CTA count, pure black with a single material-rich 3D object.

### The Three Laws:

**LAW 1: NO FALSE STATISTICS.** This is the most important rule in this document. Any number that appears on this website must be real, sourced, and verifiable. "1,200+ memories" is false. "< 500ms recall" is a marketing claim we have not measured. "4 agent roles" is true — we built exactly 4. See Section 7 for the complete Statistics Policy.

**LAW 2: NO AI SLOP.** Every element on this page must have been chosen for a reason. If you cannot explain why a design choice exists, remove it. The list of banned elements is in Section 1.

**LAW 3: THE FONT IS NOT MONO.** Display and body text use **Space Grotesk** (headlines) and **DM Sans** (body). These are geometric, premium, and have character. JetBrains Mono is reserved for blob IDs, hash values, and inline code — never for visible copy.

---

## 1. THE FORBIDDEN LIST — ABSOLUTE BANS

These elements are permanently banned from NexusMind's visual design. If any agent introduces any of the following, revert immediately and document why it was added in the first place.

### 1.1 Typography Bans

| Banned | Why | What to use instead |
|---|---|---|
| Gradient text (`background-clip: text`) | Screams AI-generated, unreadable at small sizes, 2022 trend | Solid `--text-primary` or solid `--accent-primary` for emphasis |
| JetBrains Mono for headlines | Wrong personality — cold, technical, no warmth | Space Grotesk 700–800 for all display text |
| System UI fonts for display | Generic, no identity | Space Grotesk from Google Fonts |
| ALL CAPS on body copy paragraphs | Illegible beyond labels | Use sentence case for all body text |
| More than 3 font weights visible in one section | Visual chaos | Max: 800 (display), 500 (labels), 400 (body) |
| Font sizes below 14px for readable content | Accessibility failure | 14px minimum for any content text |
| Thin/light weight (100–200) for body copy | Illegible on dark backgrounds | 400 minimum for body, 500 for emphasis |
| Letterspacing on body text | Reduces readability | Letterspacing only on ALL-CAPS labels, max 0.08em |

### 1.2 Color & Visual Bans

| Banned | Why | What to use instead |
|---|---|---|
| Purple-to-cyan gradient backgrounds | Used by every AI company in existence | Solid `#080810` background |
| Gradient overlays on section backgrounds | Decorative, meaningless | Solid color transitions between sections |
| Glassmorphism (backdrop-filter: blur) on cards | Overused 2021-2023, performance costly | Solid `--bg-surface` with 1px border |
| Neon glow text-shadow | Looks cheap, reduces legibility | No text-shadow at all |
| Multiple accent colors in one section | Visual noise | One primary accent, one semantic color per context |
| Rainbow node/particle systems | Meaningless decoration | Single-color node constellation with grain texture |
| Drop shadows on cards | Dated | Borders only (`1px solid var(--border-default)`) |
| Animated gradient borders | Performative, distracting | Static borders |
| White backgrounds on any section | Wrong atmosphere | Every section `--bg-base` or `--bg-surface` |
| Teal/mint as primary accent | Not distinct enough for this project | Deep indigo `#5B6CF7` only |

### 1.3 Content Bans

| Banned | Why | What to use instead |
|---|---|---|
| Fabricated statistics ("1,200+ memories/session") | Dishonest, judges will ask for sources | Real counts only — see Section 7 |
| Percentage metrics we haven't measured ("34% faster") | Cannot be verified | Technical specs from Walrus/Sui docs |
| "Powered by AI" badges | Meaningless marketing | Show the actual stack (Walrus, MemWal, Seal, Sui) |
| "Industry-leading" language | Unverifiable claim | Describe what it actually does |
| "Trusted by X companies" (if none) | Fabrication | Remove trust signals entirely |
| Lorem ipsum | Placeholder in a shipped product | Real copy or nothing |
| "Coming soon" sections | Acknowledges incompleteness to judges | Only show what works |
| TODO comments in visible UI | Shows unfinished state | Remove before any deploy |
| Spinning loader as primary loading state | Bad UX | Skeleton screens with correct card dimensions |

### 1.4 Layout Bans

| Banned | Why | What to use instead |
|---|---|---|
| Centered text for long copy paragraphs | Reduces readability beyond 3 lines | Left-aligned body text, centered only for 1–2 line callouts |
| Symmetrical two-column heroes | Generic, no visual tension | Left text + right 3D object (asymmetric) |
| More than 2 CTA buttons in the hero | Reduces conversion, looks unsure | 1 primary + 1 ghost button maximum |
| Sections with no breathing room | Claustrophobic | Minimum 120px section padding vertical |
| Cards with rounded corners > 12px | Too soft for the technical aesthetic | `border-radius: 8px` for cards, `4px` for small elements |
| Generic blockchain hexagon imagery | Cliché | The Memory Constellation 3D object only |
| Icon-only navigation items | Accessibility failure | Icon + label always |
| Testimonials/social proof (if fabricated) | Dishonest | Remove entirely |

---

## 2. COLOR SYSTEM

### 2.1 The Palette

```css
:root {
  /* === CANVAS — The most important decision === */
  --bg-base: #080810;
  /* NOT #000000 (too cold), NOT #0A0A1E (too blue/purple) */
  /* This specific value: near-black with the faintest blue-black undertone */

  --bg-surface: #0E0E1C;      /* Card backgrounds, panel interiors */
  --bg-elevated: #131325;     /* Modals, dropdowns — what sits "above" surface */
  --bg-inset: #060610;        /* Inset sections, pressed states */

  /* === THE ONE ACCENT — Deep Electric Indigo === */
  --accent: #5B6CF7;
  /* This is the ONLY decorative color on the entire site.
     It appears in exactly 3 places:
     1. The single emphasis word in the hero headline
     2. The "Connect Wallet" button
     3. Active navigation indicator
     Nowhere else. Every other element of color is semantic. */

  --accent-dim: rgba(91, 108, 247, 0.15);  /* Hover backgrounds only */
  --accent-border: rgba(91, 108, 247, 0.25); /* Focused inputs only */

  /* === TEXT HIERARCHY === */
  --text-primary: #F0F0F8;     /* Main headings, primary content */
  --text-secondary: #8A8CA8;   /* Body copy, descriptions */
  --text-muted: #45475E;       /* Timestamps, metadata, labels */
  --text-disabled: #2E2E40;    /* Disabled states only */

  /* === SEMANTIC COLORS — functional, not decorative === */
  --success: #2ECC8E;   /* Completed workflows, verified states */
  --warning: #E89B2E;   /* Pending, syncing, in-progress */
  --error: #E05454;     /* Failed states, errors */

  /* === STRUCTURE === */
  --border: rgba(255, 255, 255, 0.07);         /* Card borders, dividers */
  --border-strong: rgba(255, 255, 255, 0.12);  /* Table borders, separators */
  --border-accent: rgba(91, 108, 247, 0.25);   /* Focused elements */

  /* === CODE ELEMENTS === */
  --code-text: #90E5C8;    /* Blob IDs, addresses — teal (functional, not accent) */
  --code-bg: #0B0B18;      /* Code block backgrounds */
}
```

### 2.2 Color Usage Rules — Hard Constraints

```
--accent (#5B6CF7) appears:
  ✅ One word in the hero headline ("remember" or "persist")
  ✅ "Connect Wallet" button background
  ✅ Active nav underline (1px, 100% width of link)
  ✅ Search results highlight
  ✅ Focus ring on inputs (3px offset ring)
  ❌ NOT in headings other than the one hero accent word
  ❌ NOT on icons
  ❌ NOT as background on sections
  ❌ NOT on cards or panels
  ❌ NOT as gradient with any other color

--success (#2ECC8E) appears:
  ✅ Workflow "completed" badge
  ✅ Verified artifact checkmark
  ✅ Memory "stored" confirmation
  ❌ NOT decoratively
  ❌ NOT paired with --accent in the same component

--code-text (#90E5C8) appears:
  ✅ Blob IDs displayed in tables
  ✅ Sui object addresses
  ✅ Code snippets in developer section
  ❌ NOT in headings
  ❌ NOT decoratively
```

---

## 3. TYPOGRAPHY

### 3.1 Typeface Selection — Justified

**Primary Display: "Space Grotesk"**
- Source: Google Fonts (free, no license issues)
- Why: Geometric sans-serif with distinctive character — the slightly quirky letterforms (especially the 'a', 'g', and 'R') give it personality without being irregular. Used by Linear, Vercel documentation, and premium Web3 brands.
- Weights used: 700 (hero), 600 (section titles), 500 (card titles)
- Character: technical, confident, slightly different from Inter

**Body: "DM Sans"**
- Source: Google Fonts
- Why: Humanist geometric that reads extremely well at 16–18px on dark backgrounds. More warmth than Inter, less quirky than Space Grotesk — a perfect counterbalance.
- Weights used: 400 (body), 500 (emphasis within body copy)
- NOT used for headings

**Code/Addresses Only: "JetBrains Mono"**
- ONLY for: blob IDs, Sui addresses, inline code in developer sections
- NEVER for: navigation, headings, body text, any visible copy

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');

/* Establish on html root */
html {
  font-family: 'DM Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1;
}

h1, h2, h3, h4, .display {
  font-family: 'Space Grotesk', sans-serif;
}

.mono, code, .blob-id, .address {
  font-family: 'JetBrains Mono', monospace;
}
```

### 3.2 Type Scale

```css
/* DISPLAY — Hero only */
.type-hero {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(56px, 7.5vw, 108px);
  font-weight: 700;
  line-height: 1.0;
  letter-spacing: -0.025em;
  color: var(--text-primary);
}

/* HEADLINE — Section titles */
.type-h1 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(36px, 4vw, 56px);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.type-h2 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(26px, 3vw, 40px);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.015em;
  color: var(--text-primary);
}

.type-h3 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(20px, 2.2vw, 28px);
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}

.type-h4 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.3;
  color: var(--text-primary);
}

/* BODY */
.type-body-lg {
  font-family: 'DM Sans', sans-serif;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.7;
  color: var(--text-secondary);
}

.type-body {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.65;
  color: var(--text-secondary);
}

.type-body-sm {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* LABELS */
.type-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
}

/* EYEBROW — The small tag above section titles */
.type-eyebrow {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
}

/* CODE */
.type-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.7;
  color: var(--code-text);
}
```

### 3.3 The Hero Headline — Exact Specification

This is the most important typographic moment. Inspired by Modal and Litheum but distinct:

```
Line 1: "Agents that"           → Space Grotesk 700, var(--text-primary)
Line 2: "remember."             → Space Grotesk 700, var(--accent) on "remember"
                                  period in var(--text-primary)
```

NOT:
```
❌ "NEXUSMIND" as hero text (the logo handles the brand name)
❌ Three or more lines (two lines maximum in the hero)
❌ Gradient on "remember" (solid accent only)
❌ Quotation marks around the phrase
```

Implementation:
```tsx
<h1 className="type-hero">
  Agents that<br />
  <span style={{ color: 'var(--accent)' }}>remember</span>
  <span style={{ color: 'var(--text-primary)' }}>.</span>
</h1>
```

---

## 4. THE HERO 3D OBJECT — "THE MEMORY CONSTELLATION"

This is the most important visual element of the entire project. It defines NexusMind's identity. Get this right or everything else fails.

### 4.1 What it is

A cluster of 12–18 spherical nodes floating in 3D space, connected by thin geometric lines. Each node represents an agent memory. The cluster occupies the right 55% of the hero viewport.

### 4.2 Visual Treatment (Inspired by Modal's 3D cubes)

**Material:**
- Base color: Very dark desaturated blue-black (#0A0A18)
- Light source: Single point light from upper-left, indigo (#5B6CF7) tinted
- Specular highlight: White-silver, small, sharp
- The bright spot is small and sharp — not a diffuse glow
- Facing-light surface: ~30% lighter than base
- Shadow side: Even darker, near-black

**Grain/Noise Texture (CRITICAL — this is what Modal does):**
- SVG/canvas grain filter applied over the 3D render
- `feTurbulence` with baseFrequency="0.65" numOctaves="3"
- `feDisplacementMap` scale="2"
- Opacity: 0.06–0.08 — subtle, not aggressive
- This makes the objects feel PHYSICAL and REAL, not CGI-smooth

**Connection Lines:**
- Color: rgba(91, 108, 247, 0.2)
- Width: 0.8px
- Not glowing — just thin and precise
- Some connections also bleed off-screen (gives scale impression)

**Node Sizes (varied for visual interest):**
- Large nodes: 3 nodes at radius ~28px each
- Medium nodes: 6 nodes at radius ~18px each
- Small nodes: rest at radius ~10px each
- Size indicates recency/relevance weight (semantic meaning)

**Animation:**
- Entire cluster: Extremely slow Y-axis rotation (0.0003 rad/frame = ~100s for full rotation)
- Individual nodes: Imperceptible independent drift (max 2px amplitude, 8s cycle)
- NO: Pulsing glows, particle trails, random jitter
- On hover (any node): That node brightens 40%, its connections fade up to 60% opacity, other connections stay at 20%

### 4.3 Implementation: Three.js (SSR disabled)

```tsx
// apps/dashboard/src/components/MemoryConstellation/index.tsx
'use client';

import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';
import { StaticConstellationSVG } from './StaticFallback';

const ThreeConstellation = dynamic(() => import('./ThreeScene'), {
  ssr: false,
  loading: () => <div className="constellation-placeholder" />,
});

export function MemoryConstellation() {
  const prefersReduced = useReducedMotion();

  // Check WebGL support
  if (typeof window !== 'undefined') {
    const canvas = document.createElement('canvas');
    const hasWebGL = !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    if (!hasWebGL || prefersReduced) {
      return <StaticConstellationSVG />;
    }
  }

  return <ThreeConstellation />;
}
```

```tsx
// ThreeScene.tsx — actual Three.js implementation
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    const W = mount.clientWidth;
    const H = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent background
    mount.appendChild(renderer.domElement);

    // Lighting — single indigo-tinted point light
    const light = new THREE.PointLight(0x7080FF, 3.5, 20);
    light.position.set(-4, 4, 4);
    scene.add(light);
    const ambient = new THREE.AmbientLight(0x080820, 0.6);
    scene.add(ambient);

    // Node positions (hand-crafted — NOT random — for a balanced cluster)
    const nodeConfigs = [
      { pos: [0, 0.3, 0],   r: 0.30, type: 'large' },
      { pos: [1.2, 0.8, -0.3], r: 0.22, type: 'large' },
      { pos: [-0.9, 0.5, 0.4], r: 0.20, type: 'large' },
      { pos: [0.5, -0.8, 0.6],  r: 0.17, type: 'medium' },
      { pos: [-0.4, -0.6, -0.5], r: 0.15, type: 'medium' },
      { pos: [1.6, -0.3, 0.2],  r: 0.14, type: 'medium' },
      { pos: [-1.4, -0.2, 0.2], r: 0.13, type: 'medium' },
      { pos: [0.8, 1.5, 0.3],   r: 0.12, type: 'medium' },
      { pos: [-0.7, 1.2, -0.4], r: 0.11, type: 'medium' },
      { pos: [1.9, 0.6, -0.6],  r: 0.09, type: 'small' },
      { pos: [-1.8, 0.9, 0.1],  r: 0.09, type: 'small' },
      { pos: [0.2, -1.4, -0.3], r: 0.08, type: 'small' },
      { pos: [1.1, -1.2, -0.4], r: 0.08, type: 'small' },
      { pos: [-1.1, -1.0, 0.5], r: 0.07, type: 'small' },
      { pos: [2.2, -0.8, 0.3],  r: 0.07, type: 'small' },
    ] as const;

    const nodeMaterial = new THREE.MeshStandardMaterial({
      color: 0x0A0A22,
      roughness: 0.4,
      metalness: 0.7,
    });

    const nodes: THREE.Mesh[] = [];
    const group = new THREE.Group();

    for (const cfg of nodeConfigs) {
      const geo = new THREE.SphereGeometry(cfg.r, 32, 32);
      const mesh = new THREE.Mesh(geo, nodeMaterial.clone());
      mesh.position.set(...cfg.pos);
      group.add(mesh);
      nodes.push(mesh);
    }

    // Connections — thin lines between nearby nodes
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x5B6CF7,
      transparent: true,
      opacity: 0.18,
    });

    const connections = [
      [0,1],[0,2],[0,3],[0,4],[1,5],[1,7],[2,6],[2,8],[3,4],[3,5],
      [4,6],[5,9],[6,10],[7,8],[7,11],[8,12],[9,13],[10,14],
    ];

    for (const [a, b] of connections) {
      const points = [
        nodes[a].position.clone(),
        nodes[b].position.clone(),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, lineMaterial.clone());
      group.add(line);
    }

    scene.add(group);

    // Animation loop
    let frameId: number;
    let t = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.0003;
      group.rotation.y = t;
      group.rotation.x = Math.sin(t * 0.3) * 0.08; // Very subtle tilt
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      const W2 = mount.clientWidth;
      const H2 = mount.clientHeight;
      camera.aspect = W2 / H2;
      camera.updateProjectionMatrix();
      renderer.setSize(W2, H2);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0"
      aria-hidden="true"
    />
  );
}
```

---

## 5. LAYOUT SYSTEM

### 5.1 Grid

```css
.container {
  width: 100%;
  max-width: 1360px;
  margin: 0 auto;
  padding-inline: clamp(20px, 4vw, 80px);
}

/* Two-column hero split (Modal-style asymmetric) */
.hero-grid {
  display: grid;
  grid-template-columns: 5fr 7fr; /* Left: type. Right: 3D object */
  min-height: 100svh;
  align-items: center;
}

/* Feature alternating (text left + visual right, then flip) */
.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(48px, 6vw, 96px);
  align-items: center;
}
.feature-grid.reversed {
  direction: rtl; /* Flip columns without JS */
}
.feature-grid.reversed > * {
  direction: ltr; /* Re-normalize content */
}

/* Three-column cards */
.card-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* Four-column dashboard stats */
.stat-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
```

### 5.2 Spacing Scale

```css
/* Use ONLY these values for spacing. Never arbitrary pixels. */
--sp-1: 4px;
--sp-2: 8px;
--sp-3: 12px;
--sp-4: 16px;
--sp-5: 20px;
--sp-6: 24px;
--sp-8: 32px;
--sp-10: 40px;
--sp-12: 48px;
--sp-16: 64px;
--sp-20: 80px;
--sp-24: 96px;
--sp-32: 128px;

/* Section vertical padding — MINIMUM values */
section {
  padding-block: var(--sp-24); /* 96px absolute minimum */
}

section.hero {
  padding-block: 0; /* Hero uses min-height: 100svh instead */
}
```

### 5.3 Section Layout Patterns

**Pattern A — Hero (Modal-inspired):**
- 5/12 columns: eyebrow + headline + descriptor + 2 CTAs
- 7/12 columns: 3D constellation (overflows container edges)
- Headline left-anchored, never centered
- 3D object fills its column completely, partially bleeds right

**Pattern B — Problem Statement:**
- 3 equal cards, horizontal desktop / stacked mobile
- Each card: left-aligned icon (SVG, 32×32) + bold title + body copy
- NO numbers, NO percentage claims
- Card border on bottom only (visual accent: 2px `--accent` at 30% opacity on hover)

**Pattern C — Feature Deep Dive (Alternating):**
- Left: text content block (eyebrow + h2 + body + optional code block)
- Right: animated demonstration (SVG diagram or live component)
- Flip on alternate items
- Vertical separator: 1px horizontal rule at `--border` between features

**Pattern D — Tech Proof Section (NOT stats):**
- Full-width, centered
- Tech logo strip: Walrus | MemWal | Seal | Sui — official logos only
- Caption: "Built on [logo] and [logo]" — describes the stack, makes no claims
- Small, understated, professional

**Pattern E — Developer Section:**
- Dark inset panel (bg: `--bg-inset`)
- Left: package name + description + copy button
- Right: syntax-highlighted code block

---

## 6. NAVIGATION

### 6.1 Specification

```
Position: fixed, top: 0, full width, z-index: 100
Height: 60px
Initial state: background transparent, no border
After 40px scroll: background rgba(8, 8, 16, 0.90) + backdrop-filter: blur(16px) + 1px bottom border var(--border)
Transition: all 300ms ease
```

```
Layout (left to right):
[20px padding] [NexusMind Logo] [flex-1 spacer] [Nav Links] [spacer 32px] [Connect Wallet button] [20px padding]
```

**Logo:**
```
[SVG mark: 3 nodes, triangle formation, 20×20px] [Space Grotesk 600 16px "NexusMind"]
Color: var(--text-primary)
NOT using accent color in logo — save accent for emphasis only
```

**Nav Links:**
```
Items: Technology | Agents | Memory | Developer | Docs
Font: DM Sans 500, 14px
Color: var(--text-muted) → var(--text-primary) on hover
No underlines, no boxes
Active page: 1px solid var(--accent) bottom indicator, 100% width of link text
Transition: color 200ms ease
Spacing between links: 28px
```

**Connect Wallet Button:**
```
Style: Ghost (transparent bg, var(--accent) border, var(--accent) text)
Font: DM Sans 500, 14px
Padding: 9px 20px
Border-radius: 6px
Hover: background var(--accent-dim)
Border: 1px solid var(--accent)
```

**Mobile (< 768px):**
```
Hamburger icon (3 lines, 20×16px, 2px gaps, DM Sans animation → X)
Tap → full-screen overlay
Background: var(--bg-base) at 98% opacity
Links stacked vertically, 48px touch targets
Framer Motion AnimatePresence: scale from 0.95 + fade, 250ms
```

---

## 7. THE STATISTICS POLICY — NON-NEGOTIABLE

### 7.1 The Rule

**Any number displayed on the NexusMind website must be one of:**
1. A number sourced from official Walrus, Sui, or MemWal documentation
2. A count of something we actually built (4 agents, 4 Move modules, 1 SDK package)
3. A technical specification we can cite

**Any number that cannot pass this test must be removed immediately.**

### 7.2 Approved Numbers

These are the ONLY statistics that may appear on the site:

| Fact | Number | Source |
|---|---|---|
| Agent roles built | 4 | Actual code: orchestrator, researcher, trader, monitor |
| Move contract modules | 4 | Actual code: agent_registry, artifact_record, seal_policies, workflow |
| SDK package | 1 | @nexusmind/sdk |
| Sui TPS (testnet approx) | ~297k | Official Sui documentation |
| Walrus storage epoch length | 14 days | Official Walrus documentation |
| Walrus max blob size | 50 MB | Official Walrus documentation |
| Sui finality time | ~400ms | Official Sui documentation |

### 7.3 Replace the Stats Section With This Instead

Instead of a "stats" section with fabricated numbers, use a **"Tech Proof" section:**

```
[eyebrow: "BUILT ON"]
[horizontal strip of official logos]
Walrus    MemWal    Seal    Sui

[two-column list below:]
Left column:
  ✓ Onchain provenance for every artifact
  ✓ Threshold encryption via Seal
  ✓ < 1s finality on Sui testnet
  ✓ 50MB artifact storage per blob

Right column:
  ✓ Semantic memory search via MemWal
  ✓ Cross-session memory restore
  ✓ Agent-to-agent encrypted messaging
  ✓ Walrus Sites dashboard deployment
```

The checkmarks are factual. Every item is verifiable. No fake numbers.

### 7.4 Banned Statistics (These Were in DESIGN.md — All Removed)

```
❌ "1,200+ Memories per session" — made up
❌ "< 500ms Recall latency" — not measured
❌ "100% Portable" — marketing claim
❌ "∞ Sessions persisted" — misleading
```

These numbers are removed from the site. They do not appear anywhere.

---

## 8. COMPONENT LIBRARY

### 8.1 Buttons

```css
/* PRIMARY — filled indigo */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--accent);
  color: #FFFFFF;
  border: 1px solid transparent;
  padding: 11px 24px;
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 180ms ease, transform 120ms ease;
  white-space: nowrap;
}
.btn-primary:hover {
  background: #6B7CF8;
  transform: translateY(-1px);
}
.btn-primary:active {
  transform: translateY(0);
  background: #4553D4;
}

/* GHOST — outlined */
.btn-ghost {
  background: transparent;
  color: var(--accent);
  border: 1px solid var(--accent);
  /* All other properties same as primary */
}
.btn-ghost:hover {
  background: var(--accent-dim);
}

/* SECONDARY — neutral outlined */
.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-strong);
}
.btn-secondary:hover {
  color: var(--text-primary);
  border-color: rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.04);
}
```

### 8.2 Cards

```css
/* BASE CARD */
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
  transition: border-color 250ms ease;
}
.card:hover {
  border-color: var(--border-strong);
}

/* No box-shadow. Never. */
/* No glassmorphism. Never. */
/* No gradient backgrounds. Never. */

/* TOP-ACCENT variant — thin accent bar appears on hover */
.card-accent {
  position: relative;
  overflow: hidden;
}
.card-accent::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 300ms ease;
}
.card-accent:hover::after {
  transform: scaleX(1);
}

/* MEMORY CARD */
.card-memory {
  /* Extends .card .card-accent */
  cursor: pointer;
  padding: 16px 20px;
}
.card-memory .memory-content {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
}
.card-memory .memory-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

/* ARTIFACT ROW */
.artifact-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  transition: background 150ms ease;
}
.artifact-row:hover {
  background: rgba(255,255,255,0.025);
}
```

### 8.3 Badges

```css
/* All badges: DM Sans 500, 11px, UPPERCASE, letter-spacing 0.06em */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 4px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* Role badges */
.badge-orchestrator { background: rgba(91,108,247,0.12); color: #8090F5; border: 1px solid rgba(91,108,247,0.2); }
.badge-researcher   { background: rgba(46,204,142,0.10); color: #2ECC8E; border: 1px solid rgba(46,204,142,0.2); }
.badge-trader       { background: rgba(232,155,46,0.10); color: #E89B2E; border: 1px solid rgba(232,155,46,0.2); }
.badge-monitor      { background: rgba(138,140,168,0.10); color: #8A8CA8; border: 1px solid rgba(138,140,168,0.2); }

/* State badges */
.badge-completed { background: rgba(46,204,142,0.10); color: #2ECC8E; border: 1px solid rgba(46,204,142,0.2); }
.badge-running   { background: rgba(91,108,247,0.12); color: #8090F5; border: 1px solid rgba(91,108,247,0.2); }
.badge-pending   { background: rgba(232,155,46,0.10); color: #E89B2E; border: 1px solid rgba(232,155,46,0.2); }
.badge-failed    { background: rgba(224,84,84,0.10); color: #E05454; border: 1px solid rgba(224,84,84,0.2); }

/* Encrypted */
.badge-encrypted {
  background: rgba(144,229,200,0.08);
  color: var(--code-text);
  border: 1px solid rgba(144,229,200,0.15);
}
.badge-encrypted::before { content: '⊕ '; font-size: 10px; }
```

### 8.4 Code Blocks

```css
.code-block {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px 24px;
  overflow-x: auto;
  position: relative;
}

.code-block .line-number {
  display: inline-block;
  width: 2em;
  color: var(--text-muted);
  user-select: none;
}

/* Copy button — appears on hover */
.code-block .copy-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  opacity: 0;
  transition: opacity 200ms;
}
.code-block:hover .copy-btn {
  opacity: 1;
}

/* Syntax highlighting colors */
.token-keyword  { color: #C792EA; }  /* const, async, await */
.token-string   { color: #C3E88D; }  /* string literals */
.token-comment  { color: #546E7A; }  /* // comments */
.token-function { color: #82AAFF; }  /* function names */
.token-number   { color: #F78C6C; }  /* numbers */
.token-type     { color: #FFCB6B; }  /* TypeScript types */
```

### 8.5 Inputs

```css
.input {
  background: var(--bg-surface);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  padding: 10px 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  color: var(--text-primary);
  width: 100%;
  outline: none;
  transition: border-color 200ms, box-shadow 200ms;
}
.input::placeholder {
  color: var(--text-muted);
}
.input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-border);
}

/* Search variant */
.input-search {
  padding-left: 40px;
  background-image: /* SVG magnifying glass in var(--text-muted) */ url('...');
  background-repeat: no-repeat;
  background-position: 12px center;
  background-size: 16px;
}
```

---

## 9. PAGE SPECIFICATIONS

### 9.1 Landing Page `/` — Section by Section

#### A. Hero

```
Height: 100svh minimum
Background: var(--bg-base) — solid, no effects

Layout (desktop):
┌─────────────────────────────────────────────────────────┐
│  [NAV — fixed, transparent until scroll]                │
│                                                         │
│                                                         │
│  [5 cols]                    [7 cols]                   │
│                                                         │
│  [eyebrow: "MULTI-AGENT MEMORY"]                        │
│                                                         │
│  Agents that                 [MEMORY CONSTELLATION]     │
│  remember.                   [3D Node Cluster]          │
│                              [Overflows right edge]     │
│  Persistent. Verifiable.                                │
│  Decentralized.                                         │
│                                                         │
│  [btn-primary "Explore Memory"]                         │
│  [btn-ghost "View Demo ↗"]                              │
│                                                         │
└─────────────────────────────────────────────────────────┘

Mobile (< 768px):
- Single column
- Headline: 52px (vs 108px desktop)
- Constellation: 280px tall, below the text
- Buttons: full-width, stacked
```

**The hero scroll indicator:**
```
Position: bottom-center, absolute
Element: 1px wide vertical line, 40px tall, var(--text-muted)
Animated dot: 6px circle sliding down the line, 2s loop
Fades out after user scrolls 100px
```

#### B. Problem Section

```
Background: var(--bg-surface) — slight elevation from hero

Three cards in a horizontal row (desktop):

Card 1: "Stateless by default"
  Icon: [SVG — chain with gap] 32×32, var(--text-muted)
  Body: "Every agent session starts from zero. Context, decisions,
         and learned behavior disappear when the process ends."

Card 2: "Memory is fragmented"
  Icon: [SVG — scattered nodes] 32×32, var(--text-muted)
  Body: "Memory is locked to a single app, model, or device —
         impossible to share, export, or verify."

Card 3: "No verifiable provenance"
  Icon: [SVG — document with question mark] 32×32, var(--text-muted)
  Body: "There is no cryptographic proof that an agent's memory
         is intact, untampered, or authentic."

Card style: .card-accent
Card border-bottom: 2px solid (success/warning/error) for semantic color
  Card 1: error bottom border
  Card 2: warning bottom border
  Card 3: error bottom border
```

#### C. How It Works (Architecture)

```
Background: var(--bg-base)

Full-width section:
  [eyebrow: "ARCHITECTURE"]
  [h2: "Memory that outlasts the agent"]
  [body: two sentences, max 100 words]

  Below: Interactive architecture diagram (SVG, NOT a PNG screenshot)

  Diagram layers (top → bottom on hover highlight):
  ┌─ Dashboard / Wallet Interface ──────────────────┐
  ├─ Agent Layer (Orchestrator/Researcher/Trader/Monitor) ─┤
  ├─ NexusMind SDK (@nexusmind/sdk) ────────────────┤
  ├─ MemWal │ Walrus Blobs │ Seal │ Sui Stack Msg ──┤
  └─ Sui Blockchain (Provenance + Access Control) ──┘

  Hover any layer → highlight it + show tooltip with one sentence
  No click-through navigation from the diagram
```

#### D. Feature Deep Dives (Alternating Pattern)

**Feature 1: Persistent Memory**
```
Left: [eyebrow] [h2: "Memory that persists across every session"]
      [body: 2–3 sentences, no bullet points, no lists]
      [code snippet: remember() → recall() → restore()]

Right: [Animated visualization]
  A memory card appearing, fading into a Walrus blob, then
  being recalled on the next session. Simple, clear animation.
  SVG-based with Framer Motion.
```

**Feature 2: Encrypted Sharing**
```
Right: [eyebrow] [h2: "Agents share secrets without exposing them"]
       [body: what Seal does in 2 sentences]
       [call out the Seal allowlist pattern]

Left: [Seal flow diagram — SVG]
  Agent A encrypts → Walrus blob → Agent B in allowlist decrypts
  Agent C NOT in allowlist → gets error
  Simple, clear, no unnecessary complexity
```

**Feature 3: Verifiable Artifact Trail**
```
Left: [eyebrow] [h2: "Every artifact, recorded onchain"]
      [body: what AgentArtifact objects do]
      [show example blob_id in .type-code style]

Right: [Workflow visualization — SVG animated]
  Task → Blob upload → AgentArtifact onchain → Done
  Clean left-to-right flow with success state at end
```

**Feature 4: Developer SDK**
```
Right: [eyebrow] [h2: "One SDK. The entire stack."]
       [body: what @nexusmind/sdk provides]
       [npm install command in code block]

Left: [Code block — 20–30 lines max]
  Shows: create agent → recall context → store artifact → remember
  Syntax highlighted, copy button, no line numbers visible
```

#### E. Tech Proof Section

```
Background: var(--bg-surface)

[h2: "Built on"] [centered]

[Logo strip — centered, 4 logos with names:]
  [Walrus logo] Walrus  |  [MemWal logo] MemWal  |  [Seal logo] Seal  |  [Sui logo] Sui

[Divider: 1px var(--border)]

[Two-column checklist — left-aligned:]

Left:
  ✓ Onchain provenance for every artifact
  ✓ Threshold encryption via Seal
  ✓ ~400ms finality on Sui testnet*
  ✓ 50MB per artifact on Walrus*

Right:
  ✓ Semantic memory search via MemWal
  ✓ Cross-session memory rebuild
  ✓ Agent-to-agent encrypted messaging
  ✓ Dashboard deployed as Walrus Site

[footnote: *Source: official Sui and Walrus documentation]

NO FAKE PERCENTAGES. NO FAKE COUNTS. Only the above.
```

#### F. Memory Restore Demo Preview

```
Background: var(--bg-inset)

NOT a real interactive demo here — that's at /restore
This section is a TEASER:

[eyebrow: "THE KILLER FEATURE"]
[h2: "Wipe the agent. The memory survives."]
[body: Explain what restore() does in 2 sentences]

[Visual: Before/After side by side]
  Left panel: "Memory index: empty" (empty state visualization)
  Arrow in center
  Right panel: "After restore()" (populated memories animation)

[btn-primary "See Live Demo →" → links to /restore page]
```

#### G. Developer Section

```
Background: dark inset panel (var(--bg-inset)), full width

Left column:
  [eyebrow: "OPEN SOURCE SDK"]
  [h2: "Build agents that remember."]
  [body: 2 sentences on what the SDK provides]
  
  [code block — install command]
  $ npm install @nexusmind/sdk
  
  [btn-ghost "View Documentation →"]

Right column:
  [code block — example usage]
  Full working example, 25–30 lines
  Agent instantiation → recall → storeArtifact → remember
  Real method names, real types
```

#### H. Footer

```
Height: auto
Background: var(--bg-base)
Top border: 1px solid var(--border)
Padding: 48px 0

Layout:
  [NexusMind logo + tagline]         [Links]              [Stack]
  "Verifiable agent memory"          GitHub               Walrus
  "on decentralized infrastructure"  Documentation        MemWal
                                     Sui Explorer         Seal
                                                          Sui

Bottom row:
  [left: "© 2025 NexusMind. MIT License."]
  [right: "Built for the Walrus Track — Sui Overflow 2026"]

Font: DM Sans 13px, var(--text-muted)
All links: color var(--text-muted) → var(--text-secondary) on hover
NO gradient anywhere in footer
```

### 9.2 Memory Explorer `/explorer`

```
Layout: Sidebar (240px fixed) + Main content area

Sidebar:
  [NexusMind logo] [version: v0.1.0]
  ─────────────────
  [Overview]
  [Memory Explorer]  ← active indicator: left 2px border var(--accent)
  [Artifacts]
  [Workflows]
  [Agents]
  [Restore Demo]
  ─────────────────
  [Connect Wallet] (btn-ghost full width)

Main area:
  [Search bar — full width, .input-search style]
  [Namespace tabs: All | Orchestrator | Researcher | Trader | Monitor]
  [gap: 24px]
  [Memory cards: responsive grid, 3 cols → 2 → 1]

Loading state: skeleton cards with correct dimensions
Empty state: centered icon + "No memories found" + body explaining why
Error state: red-bordered panel with error message + retry button
Success: populated memory cards
```

### 9.3 Restore Demo `/restore`

```
This page is the MOST IMPORTANT page for the hackathon judges.
It must look excellent and work correctly.

Layout: Single centered column, max-width 720px

Content:
  [eyebrow: "MEMORY RESTORE DEMO"]
  [h1: "Watch memory rebuild from Walrus."]
  [body: Explain that this demonstrates portability — the local
         index is rebuilt entirely from Walrus blobs]

  [Two panels side by side:]
  ┌─ BEFORE ─────────────────┐  ┌─ AFTER ──────────────────┐
  │ [Empty state animation]  │  │ [Populated memories]      │
  │                          │  │ [Cards animating in]      │
  │ Memory index: 0 items    │  │ Memory index: N items     │
  └──────────────────────────┘  └──────────────────────────┘

  [btn-primary "Run Restore Demo" — full width]

  On click:
  1. Button changes to "Restoring from Walrus..." with spinner
  2. Left panel shows "Index cleared" (memories count → 0)
  3. Progress bar appears below
  4. Right panel fills in one-by-one as memories restore
  5. Button changes to "✓ Restore complete" in --success color
  6. Show result: "Restored: N | Skipped: M"

  Real data only. If no memories have been seeded, show
  "Run seed-agents.ts first" error state with copy-paste command.
```

---

## 10. MOTION DESIGN

### 10.1 Motion Principles

```
1. Motion reveals — it never decorates
2. One animation maximum per viewport at any time
3. All animations respect prefers-reduced-motion
4. Durations: 200ms micro | 350ms element | 500ms section enter
5. Easing: cubic-bezier(0.22, 1, 0.36, 1) — fast out, smooth settle
6. No bouncy springs on page-level elements (save springs for micro-interactions)
```

### 10.2 Hero Load Sequence

```
Duration: 0ms → 1000ms from page paint

0ms    → Background renders (#080810 solid)
80ms   → Navigation fades in (opacity 0→1, y -10→0, 350ms)
300ms  → Hero eyebrow fades in (opacity 0→1, y 12→0, 300ms)
450ms  → Hero headline reveals (word by word, stagger 60ms per word)
650ms  → Hero body text fades in (opacity 0→1, 300ms)
750ms  → CTA buttons slide in (opacity 0→1, y 16→0, stagger 80ms)
900ms  → Constellation begins rotation
1000ms → Scroll indicator fades in

Implementation (Framer Motion):
```

```tsx
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// Wrap hero content in <motion.div variants={container} initial="hidden" animate="visible">
// Wrap each element in <motion.div variants={item}>
```

### 10.3 Scroll Animations

```tsx
// Standard scroll reveal — used on all section content
const scrollReveal = {
  hidden: { opacity: 0, y: 32 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
  },
};

// Usage:
<motion.div
  variants={scrollReveal}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: '-80px' }}
>
```

### 10.4 Card Micro-Interactions

```css
/* Memory card hover — translate only, no scale */
.card-memory {
  transition: border-color 250ms ease, transform 250ms ease;
}
.card-memory:hover {
  border-color: var(--border-strong);
  transform: translateY(-2px); /* 2px maximum */
}

/* Button press */
.btn-primary:active {
  transform: translateY(0) scale(0.98); /* Slight scale feedback */
  transition-duration: 80ms;
}
```

### 10.5 Feature Code Block Animation

```tsx
// Lines appear sequentially on viewport entry — gives "typing" impression
// WITHOUT the cliché blinking cursor or typewriter effect
// Instead: each line fades in with a 40ms stagger

const lineVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, delay: i * 0.04, ease: 'easeOut' },
  }),
};
```

### 10.6 The restore() Demo Animation

```tsx
// Memory cards entering the "After" panel one by one
// This is the most important animation — make it feel meaningful

const memoryEnter = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

// Each memory card that appears shows:
// - A truncated memory snippet (real content from MemWal)
// - A small "restored" badge (var(--success))
// - The namespace label
// This makes the animation meaningful, not just decorative
```

---

## 11. RESPONSIVE RULES

```
Breakpoints:
  --mobile: 375px (design target for smallest)
  --tablet: 768px
  --desktop: 1024px
  --wide: 1280px
  --max: 1360px (container max-width)

Mobile-first approach. Desktop styles in @media (min-width: X).

Critical mobile adaptations:
  - Hero: single column, constellation below text (not alongside)
  - Navigation: hamburger menu
  - Cards: single column grid
  - Feature sections: stack vertical (text always above visual)
  - Code blocks: horizontal scroll (not truncated)
  - Restore demo panels: stack vertically (before above after)
  - Dashboard sidebar: slides in from left on mobile
```

---

## 12. ACCESSIBILITY

```
Minimum contrast ratios:
  --text-primary (#F0F0F8) on --bg-base (#080810): 16.2:1 ✓
  --text-secondary (#8A8CA8) on --bg-base (#080810): 5.1:1 ✓ (AA)
  --accent (#5B6CF7) on --bg-base: Used only for large text/icons: 3.4:1 ✓ (AA Large)

Focus states:
  All interactive elements: 2px solid var(--accent) outline, 3px offset
  Never: outline: none without an alternative

Keyboard navigation:
  Navigation links: Tab order matches visual order
  Cards: Focusable with Enter to expand
  All buttons: Keyboard activatable

Screen reader:
  3D constellation: aria-hidden="true" (decorative)
  Navigation logo: aria-label="NexusMind home"
  All badges: visible text, no aria-hidden
  Memory content: full text visible (no truncation in screen reader)

prefers-reduced-motion:
  All Framer Motion components:
  const prefersReducedMotion = useReducedMotion();
  If true: remove all transition/animation variants
  Constellation: shows static SVG version
```

---

## 13. IMPLEMENTATION ORDER

Build in this exact order. Nothing ships to Vercel that isn't in this list:

```
Phase 1 — Foundation (must work before anything else)
  □ globals.css with all CSS variables
  □ Font imports (Space Grotesk + DM Sans + JetBrains Mono)
  □ Tailwind config with design tokens
  □ Navigation component (fixed, scroll-aware, mobile hamburger)
  □ Layout wrapper component
  □ Error boundary

Phase 2 — Landing Page
  □ Hero section (with static constellation placeholder first)
  □ Problem section (3 cards)
  □ Architecture diagram (SVG)
  □ Feature 1: Persistent Memory
  □ Feature 2: Seal Encryption
  □ Feature 3: Artifact Trail
  □ Feature 4: Developer SDK
  □ Tech Proof section (real logos, real specs, NO fake stats)
  □ Developer section (code block with real example)
  □ Footer
  □ Three.js constellation (add last — after static version verified)

Phase 3 — Dashboard Pages
  □ Sidebar navigation
  □ Memory Explorer (/explorer) — all 4 data states
  □ Artifact Viewer (/artifacts) — all 4 data states
  □ Workflow Debugger (/workflows) — all 4 data states
  □ Agent Registry (/agents) — all 4 data states
  □ Restore Demo (/restore) — all states, real MemWal integration

Phase 4 — Polish
  □ Framer Motion scroll animations on landing page
  □ Card micro-interactions
  □ Restore demo animation sequence
  □ Mobile responsive pass
  □ Accessibility audit
  □ Performance audit (< 2.5s LCP on Vercel Edge)
```

---

*DESIGN-V2.md — This document replaces DESIGN.md. No exceptions. No gradient text. No fake numbers. One accent color. Two typefaces. One 3D object that earns its place.*
