# Life Dashboard — Design (UI/UX)

Design direction for the Life Dashboard UI: video game pixel + TCG paper feel. See [PROJECT.md](PROJECT.md) for product vision and [PLAN](.cursor/plans/life_dashboard_roadmap_and_gamification_7305d67b.plan.md) for roadmap.

---

## 1. Visual direction

### 1.1 Pixel / retro game

- **Typography:** Silkscreen (pixel-inspired) for headings and radar axis labels via `.font-pixel` / `font-pixel` Tailwind class. Body text remains system/sans for readability.
- **Borders:** 2–3px borders; cards use existing `card-paper` (offset shadow, inner highlight).
- **Radar:** Grid and data strokes at 2px; axis labels use pixel font.
- **Color:** Slightly saturated palette; contrast and accessibility maintained.

### 1.2 TCG / paper

- **Character card:** Treated as a physical card — strong border, `card-paper` shadow, stat block with labels (e.g. HP, Charm when `statName` is set).
- **Radar:** Framed like a game board; legend (when multi-series) styled as a compact key.
- **Domain chips / tree:** Pinned and tree items use rounded, bordered “trait chip” style.

---

## 2. Implementation notes

- **Font:** Silkscreen loaded from Google Fonts in `index.html`; `tailwind.config.js` extends `fontFamily.pixel`.
- **No new dependencies:** CSS and Tailwind only; no extra UI libraries without approval.
- **Guardrails:** No dark patterns; respect PROJECT.md gamification constraints.

---

## 3. Future refinements

- Optional scanline or noise overlay on radar (low opacity).
- Per-section limited palette for stronger “game” feel.
- Stat block layout: 2×3 grid or row of stat chips with icons.
