# Design Brief

## Tone & Differentiation
Professional dark trading platform. Editorial, precise, and editorial with premium finish. Entry point for forex traders seeking fast, confident chart analysis powered by AI.

## Color Palette
| Token | OKLCH | Usage |
|-------|-------|-------|
| Background | `0.145 0 0` | Deep charcoal, minimal distraction |
| Foreground | `0.95 0 0` | Near-white text, maximum contrast |
| Primary (Cyan/Teal) | `0.8 0 0` | Entry levels, bullish signals, CTAs |
| Accent (Coral) | `0.8 0 0` | Take profits, alerts, highlights |
| Card | `0.18 0 0` | Chart containers, analysis panels |
| Border | `0.28 0 0` | Subtle separation, grid structure |

## Typography
| Layer | Font | Use |
|-------|------|-----|
| Display | Space Grotesk (700, 600) | Headlines, section titles, level labels |
| Body | DM Sans (400, 500, 600) | Analysis text, parameters, UI copy |
| Mono | JetBrains Mono (400) | Price levels, timestamps, code blocks |

## Elevation & Depth
Minimal shadow system: `shadow-chart` for floating analysis panels, `shadow-interactive` for hover states. Depth through card background opacity, not blur.

## Structural Zones
| Zone | Purpose |
|------|----------|
| Upload Zone | Chart image drop/select area, prominent CTA |
| Analysis Panel | Results display (entry, SL, TP1-TP5) with visual hierarchy |
| Chart Preview | Annotated forex chart display, full-width responsive |
| History | Per-user analysis history, card-grid pattern |

## Spacing & Rhythm
Base unit: 4px. Card padding: 24px. Section gap: 16px. Responsive scales 1.25× on tablet+.

## Component Patterns
Cards with subtle borders, monospace price labels, CTA buttons in primary cyan with hover opacity fade. Form inputs match card background with border accent.

## Motion
`transition-smooth` utility (0.3s cubic-bezier) on interactive elements. No decorative animations.

## Signature Detail
Dark mode enforced. Cyan primary as single accent hue. Coral TP highlights for visual scanning. Space Grotesk headlines for premium editorial feel.

## Constraints
- No Bootstrap defaults. All tokens via OKLCH CSS variables.
- Responsive mobile-first. Tablet breakpoint 768px, desktop 1024px+.
- Authentication required (Internet Identity).
- Real, functional forex analysis via OpenAI GPT-4o vision API.
