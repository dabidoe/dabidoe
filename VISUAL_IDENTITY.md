# Visual Identity: Ancient Scrolls & Parchment

## Core Identity

**We are NOT:**
- Another dark theme app with gold accents
- Generic fantasy UI
- Slick modern SaaS

**We ARE:**
- An ancient library of living characters
- Aged scrolls that hold wisdom
- A scholar's tool, weathered by use
- Utility over flash

---

## Color Palette: From Antiquity

### Primary Colors (Aged Materials)

```css
/* Parchment Base */
--parchment-light: #f4e8d0;    /* Fresh parchment */
--parchment-aged: #e8dcc4;     /* Slightly aged */
--parchment-old: #d4c4a8;      /* Well-used */
--parchment-ancient: #c0b090;  /* Ancient, stained */

/* Ink Colors */
--ink-black: #2b2520;          /* Primary text */
--ink-faded: #5a4a3a;          /* Faded ink, secondary text */
--ink-sepia: #8b7355;          /* Very old ink */

/* Accent: Aged Pigments */
--vermillion: #b85c4a;         /* Red ochre, important marks */
--lapis: #4a6fa5;              /* Lapis lazuli, rare accents */
--gold-leaf: #d4af37;          /* Actual gold leaf (sparingly!) */
--verdigris: #5a8a72;          /* Aged copper green */
--ochre: #cc8844;              /* Earth pigment */
```

### Secondary Colors (Environmental)

```css
/* Shadows & Depth */
--shadow-light: rgba(43, 37, 32, 0.1);
--shadow-medium: rgba(43, 37, 32, 0.2);
--shadow-deep: rgba(43, 37, 32, 0.4);

/* Weathering */
--stain-water: rgba(139, 115, 85, 0.15);
--stain-age: rgba(192, 176, 144, 0.3);
--stain-dirt: rgba(90, 74, 58, 0.1);
```

### Usage Rules

**DO:**
- Use parchment tones as backgrounds (80% of UI)
- Use ink-black for primary text
- Use vermillion for important actions/warnings
- Use lapis sparingly for special elements
- Use gold-leaf ONLY for truly important highlights (max 1-2 per screen)

**DON'T:**
- Use pure white (#ffffff) - everything is aged
- Use pure black (#000000) - ink has character
- Use bright, modern colors
- Use gradients (parchment doesn't gradient)
- Overuse gold (less is more)

---

## Typography: The Scholar's Hand

### Font Pairings

**Primary (Body Text):**
```css
font-family: 'Spectral', 'Lora', 'Merriweather', Georgia, serif;
```
- Readable serif with character
- Feels handwritten but legible
- Good for long-form text

**Display (Headings):**
```css
font-family: 'Cinzel', 'Cormorant', 'Playfair Display', serif;
```
- Roman inscription style
- Authoritative, ancient
- Use for character names, titles

**Special (Ancient Script):**
```css
font-family: 'IM Fell English', 'UnifrakturMaguntia', serif;
```
- Old English/Gothic for special moments
- Use sparingly (maybe character titles only)
- Must remain readable

**Code/System:**
```css
font-family: 'Courier Prime', 'IBM Plex Mono', monospace;
```
- For stats, dice rolls, technical info
- Evokes typewriter/ledger feel

### Type Scale

```css
--text-xs: 12px;      /* Fine print, metadata */
--text-sm: 14px;      /* Secondary info */
--text-base: 16px;    /* Body text */
--text-lg: 18px;      /* Emphasized */
--text-xl: 24px;      /* Subheadings */
--text-2xl: 32px;     /* Headings */
--text-3xl: 48px;     /* Character names, titles */
--text-4xl: 64px;     /* Hero moments only */
```

### Typography Rules

**DO:**
- Use generous line-height (1.6-1.8) for readability
- Add letter-spacing to headings (0.05em)
- Use old-style numerals when available
- Vary font weights for hierarchy
- Add subtle text-shadow for depth: `1px 1px 1px rgba(43, 37, 32, 0.3)`

**DON'T:**
- Use all-caps for long text (hard to read)
- Mix too many font families (max 3)
- Use decorative fonts for body text
- Forget about mobile readability

---

## Textures & Materials

### Parchment Texture

**Base Layer:**
- Subtle paper grain (CSS filter or SVG pattern)
- Slight color variation (not uniform)
- Subtle edge darkening (vignette)

**Weathering:**
- Water stains (random placement)
- Age spots (small, subtle)
- Crease lines (from rolling)
- Edge wear (torn, burnt)

**Implementation:**
```css
.parchment {
  background:
    url('data:image/svg+xml,...') /* Subtle grain */,
    radial-gradient(
      circle at 30% 40%,
      var(--stain-water),
      transparent 20%
    ),
    linear-gradient(
      to bottom,
      var(--parchment-aged),
      var(--parchment-old)
    );
  filter: contrast(1.02) saturate(0.9);
}
```

### Ink Effects

**Fresh Ink:**
- Crisp, dark edges
- Slight feathering on parchment

**Faded Ink:**
- Lower opacity (0.7-0.8)
- Slightly blurred
- Brown/sepia tone

**Illuminated Details:**
- Decorative capitals (drop caps)
- Marginal illustrations
- Border decorations
- Use vermillion + gold-leaf

### Scroll Effects

**Rolled Edges:**
- Curved top/bottom borders
- Shadow underneath
- Slightly darker edge tone

**Torn Edges:**
- Irregular borders
- Exposed fiber texture
- Darker edge staining

**Wax Seals:**
- Circular embossed elements
- Vermillion or ochre
- 3D shadow effect
- Use for "locked" or "special" content

---

## UI Components: Aged & Functional

### Buttons

**Primary (Important Action):**
```css
.btn-primary {
  background: var(--vermillion);
  color: var(--parchment-light);
  border: 2px solid var(--ink-black);
  font-family: 'Cinzel', serif;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 12px 24px;
  box-shadow:
    2px 2px 0 var(--ink-faded),
    inset 0 -2px 4px rgba(0,0,0,0.2);

  /* Embossed parchment feel */
  position: relative;
}

.btn-primary:hover {
  background: var(--ochre);
  box-shadow:
    4px 4px 0 var(--ink-faded),
    inset 0 -2px 4px rgba(0,0,0,0.2);
  transform: translate(-2px, -2px);
}
```

**Secondary (Common Action):**
```css
.btn-secondary {
  background: transparent;
  color: var(--ink-black);
  border: 2px solid var(--ink-faded);
  font-family: 'Spectral', serif;
  padding: 10px 20px;
}

.btn-secondary:hover {
  background: var(--parchment-aged);
  border-color: var(--ink-black);
}
```

### Cards

**Character/Content Cards:**
```css
.card {
  background: var(--parchment-light);
  border: 3px double var(--ink-faded);
  padding: 24px;
  position: relative;

  /* Corner decorations */
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid var(--ink-faded);
  }

  &::before {
    top: -2px;
    left: -2px;
    border-right: none;
    border-bottom: none;
  }

  &::after {
    bottom: -2px;
    right: -2px;
    border-left: none;
    border-top: none;
  }
}
```

### Inputs

**Text Input (Ink on Parchment):**
```css
.input {
  background: var(--parchment-aged);
  border: none;
  border-bottom: 2px solid var(--ink-faded);
  color: var(--ink-black);
  font-family: 'Spectral', serif;
  font-size: 16px;
  padding: 8px 4px;

  /* Ink blot cursor */
  caret-color: var(--vermillion);
}

.input:focus {
  border-bottom-color: var(--ink-black);
  background: var(--parchment-light);
  outline: none;
}

.input::placeholder {
  color: var(--ink-sepia);
  font-style: italic;
}
```

### Dividers

**Section Dividers:**
```css
.divider {
  height: 1px;
  background: var(--ink-faded);
  margin: 24px 0;
  position: relative;
}

/* Decorative divider */
.divider-ornate::after {
  content: '⟡';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: var(--parchment-light);
  padding: 0 16px;
  color: var(--ink-faded);
}
```

---

## Layout Patterns

### Scroll Layout (Main Pattern)

```
┌────────────────────────┐
│   Rolled edge (top)    │
├────────────────────────┤
│                        │
│   Content on parchment │
│                        │
│   [Margins for notes]  │
│                        │
├────────────────────────┤
│  Rolled edge (bottom)  │
└────────────────────────┘
```

**Implementation:**
- Content area: 80% width on desktop (margins for decoration)
- Vertical scroll with rolled top/bottom that stays fixed
- Shadow under scroll to lift from background
- Slight rotation (0.5-1deg) for imperfect alignment

### Codex Layout (Alternative)

```
┌──────┬──────────────┬──────┐
│ Marg │   Content    │ Marg │
│ in   │              │ in   │
│      │              │      │
│ [I]  │   Body text  │  [✎] │
│ [l]  │              │  [†] │
│ [l]  │              │      │
│ [u]  │              │      │
└──────┴──────────────┴──────┘
```

**Use for:**
- Character sheets (margins for notes)
- Detailed reference material
- Campaign logs

### Tablet Layout (Mobile)

```
┌────────────────┐
│ Compact scroll │
│                │
│ Single column  │
│                │
│ Touch-friendly │
│                │
└────────────────┘
```

**Mobile Considerations:**
- Reduce margins (10px)
- Larger touch targets (44px min)
- Simpler decorations
- Maintain parchment texture (lighter)
- Bottom navigation (thumb-friendly)

---

## Iconography: Hand-Drawn & Symbolic

### Style Rules

**DO:**
- Line-art style (woodcut/engraving feel)
- Irregular lines (not perfect)
- Hatching for shading
- Symbolic rather than realistic
- Match ink color (--ink-black or --ink-faded)

**DON'T:**
- Use filled solid icons
- Use modern flat design
- Use colorful icons (except rare vermillion highlights)
- Use drop shadows or gradients

### Icon Set Needs

**Navigation:**
- ⚔️ → Combat/Battle (crossed swords)
- 💬 → Conversation (speech scroll)
- 🎲 → Skills/Dice (d20 sketch)
- 📜 → Library (rolled scroll)
- ⚙️ → Settings (gear/mechanism)

**Actions:**
- ✎ → Edit/Write (quill)
- ✓ → Confirm (check mark)
- ✕ → Close/Cancel (x mark)
- ↻ → Retry/Reload (circular arrow)
- + → Add/Create (plus in circle)

**Status:**
- ❤️ → HP/Health (heart sketch)
- 🛡️ → AC/Defense (shield outline)
- ⚡ → Energy/Stamina (lightning bolt)
- ⭐ → Important/Favorite (star)
- ⚠️ → Warning (triangle)

### Custom Illustrations

**For Achilles:**
- Greek red-figure pottery style
- Profile view (ancient Greek convention)
- Geometric border patterns
- Bronze age armor detail
- Spear and shield iconography

**General Approach:**
- Commission simple line art
- Or use public domain ancient art
- Trace and simplify for consistency
- Maintain "aged" aesthetic

---

## Animation: Subtle & Grounded

### Movement Principles

**DO:**
- Ease-in-out (natural deceleration)
- Subtle movements (2-4px max)
- Ink-drying effect for reveals
- Page-turn transitions
- Dust particles (rare, special moments)

**DON'T:**
- Bouncy/elastic effects (too modern)
- Fast speeds (jarring)
- Flashy effects (stay grounded)
- Overuse (reserve for meaning)

### Example Animations

**Scroll Unfurl:**
```css
@keyframes unfurl {
  from {
    height: 0;
    opacity: 0;
    transform: scaleY(0);
    transform-origin: top;
  }
  to {
    height: auto;
    opacity: 1;
    transform: scaleY(1);
  }
}
```

**Ink Blot Reveal:**
```css
@keyframes inkBlot {
  from {
    clip-path: circle(0% at 50% 50%);
  }
  to {
    clip-path: circle(100% at 50% 50%);
  }
}
```

**Parchment Crinkle (Hover):**
```css
.card:hover {
  animation: crinkle 0.3s ease;
}

@keyframes crinkle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(0.5deg); }
  75% { transform: rotate(-0.5deg); }
}
```

---

## Special Effects

### Wax Seal Interaction

When user performs important action (save, commit, finalize):

1. Show wax seal animation
2. Stamp down with sound effect
3. Emboss/deboss effect
4. Leave permanent seal mark

**Visual:**
- 3D cylinder drops from above
- Presses into parchment
- Wax spreads slightly
- Leaves shaded impression

### Illuminated Letters

First letter of important sections:

```css
.drop-cap {
  float: left;
  font-size: 72px;
  line-height: 60px;
  padding: 4px 8px 0 0;
  color: var(--vermillion);
  font-family: 'IM Fell English', serif;
  font-weight: bold;
}
```

Add decorative border or illustration around it.

### Marginal Notes

Simulated handwritten notes in margins:

```css
.margin-note {
  position: absolute;
  right: -120px;
  font-family: 'Caveat', cursive; /* handwriting font */
  font-size: 14px;
  color: var(--ink-sepia);
  transform: rotate(-5deg);
  max-width: 100px;
}
```

Use for:
- Tooltips
- Help text
- User annotations (if they add notes)

---

## Responsive Design

### Breakpoints

```css
--mobile: 320px;      /* Scroll on mobile */
--tablet: 768px;      /* Single column codex */
--desktop: 1024px;    /* Full margins */
--wide: 1440px;       /* Maximum content width */
```

### Mobile Adaptations

**Simplify:**
- Reduce decorative elements
- Single column layouts
- Larger touch targets
- Bottom-anchored navigation
- Lighter parchment texture (performance)

**Maintain:**
- Color palette
- Typography hierarchy
- Parchment aesthetic
- Core identity

---

## Dark Mode? Aged Mode!

Instead of "dark mode," offer **"Candlelight Mode"**:

```css
/* Candlelight palette */
--parchment-candlelight: #3a3228;
--ink-candlelight: #e8dcc4;
--shadow-candlelight: rgba(0, 0, 0, 0.6);
--glow-candlelight: rgba(255, 200, 100, 0.1);
```

**Visual changes:**
- Inverted contrast (light text on dark parchment)
- Warmer tones (candlelight glow)
- Softer shadows
- Subtle orange glow around edges
- Same textures, inverted

---

## Accessibility

### Never Sacrifice

**Always ensure:**
- 4.5:1 contrast ratio minimum (WCAG AA)
- Focus indicators visible
- Touch targets 44px minimum
- Screen reader friendly
- Keyboard navigation works
- Motion can be reduced

**Testing:**
- Test with actual aged eyes (reduce screen brightness)
- Check contrast with tools
- Test with screen readers
- Ensure decorative elements don't confuse

---

## Implementation Priorities

### Phase 1: Foundation
1. Color palette (CSS variables)
2. Typography (load fonts)
3. Basic parchment texture
4. Core components (buttons, inputs, cards)

### Phase 2: Polish
1. Advanced textures (stains, wear)
2. Decorative elements (corners, dividers)
3. Scroll layout
4. Animations

### Phase 3: Special
1. Wax seals
2. Illuminated letters
3. Custom illustrations
4. Advanced interactions

---

## Inspiration References

**Look at:**
- Medieval manuscripts (British Library digitized collection)
- Greek pottery (Metropolitan Museum of Art)
- Old maps (David Rumsey Map Collection)
- Vintage documents (Library of Congress)
- Aged paper textures (real scans)

**Don't copy:**
- Modern medieval-themed apps (too polished)
- Game UIs (too gamey)
- Stock "parchment" templates (too fake)

**Study the real thing** - actual aged materials have character we can capture.

---

## Final Principle

**Authenticity over perfection.**

Real parchment isn't perfect. It has:
- Irregular edges
- Color variation
- Stains and spots
- Wrinkles and creases
- Character from age

Our UI should feel **used, lived-in, and real** - like a scholar's personal collection, not a sterile museum display.

**We're building tools, not decorations.** Every visual choice should support utility.
