# Design Defaults — Dashboard Project

## Palette discipline
Single-brand. Primary: `#2563eb` (blue). Neutral scale: `#f8fafc` → `#1e293b`. No multi-color gradients.

## Spacing scale
4px base unit. Allowed values: 4, 8, 12, 16, 24, 32px. Nothing above 32px in cards or list items.

## Animation budget
CSS-only. No JS animation. Transition max: 200ms ease-out.

## Typography
System font stack. Body: 14px/1.5. Labels: 12px/1.4 uppercase tracking-wide. Headings: 18px/1.3 semibold.

## Component rules
- Every card: border-radius 8px, box-shadow `0 1px 3px rgba(0,0,0,0.1)`
- No inline styles — CSS classes only
- Cards must not exceed 320px width in list view

## Server-management cadence
Rebuild + restart after any CSS or component change.

## Verification
Build passes before claiming done. Check rendered output at actual viewport size.

## Anti-patterns
- No `!important`
- No pixel values above 32px in card padding/margin
- No hardcoded colors outside the palette
