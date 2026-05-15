# Roster Card — Density & Hierarchy Design Spec
**Date:** 2026-05-14
**Turn:** 2 of 3 (Compose)
**Applied mockup:** A — Compact row with left-anchored avatar, tighter padding, clear name/role hierarchy

---

## Problem statement

Current `.roster-card` carries `48px 40px` padding and a `16px` name margin-bottom — both violate the 32px ceiling set in `design-defaults.md`. The result is a card that reads as a whitespace block with a name floating in it. No visual hierarchy distinguishes name from secondary data.

---

## Consolidated mockup — full card width (320px)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ┌────┐  Jordan Ellis                                     [role badge]   │
│  │ JE │  TEAM LEAD · Engineering                                         │
│  └────┘                                                                  │
└──────────────────────────────────────────────────────────────────────────┘

Spacing callouts:
  Card padding:        12px 16px   (was 48px 40px)
  Avatar size:         40px × 40px (was 64px)
  Avatar → text gap:   12px        (was 24px)
  Name font:           14px/1.5 semibold  (body scale, not heading)
  Role font:           12px/1.4 uppercase tracking-wide  (label scale)
  Name margin-bottom:  0px         (was 16px — role sits inline below via flex-col)
  Card margin-bottom:  8px         (was 32px)
  Border-radius:       8px         (unchanged)
  Box-shadow:          0 1px 3px rgba(0,0,0,0.1)  (default)
  Role badge bg:       #2563eb at 10% opacity, text #2563eb
  Border:              1px solid #e2e8f0  (neutral-200, replaces #e0e0e0)
```

Visual hierarchy read order:
1. Avatar (leftmost, 40px circle with initials fallback)
2. Name (14px semibold, neutral-900 `#1e293b`)
3. Role line (12px uppercase, neutral-500 `#64748b`)
4. Role badge (right-anchored, blue tint, optional — parked)

---

## Applied decisions (all silently from defaults)

| Decision | Applied value | Source |
|---|---|---|
| Palette | `#2563eb` blue, neutral scale | design-defaults.md |
| Padding | 12px 16px | 4px base unit, ≤32px ceiling |
| Typography | 14px body / 12px label | design-defaults.md |
| Animation | none | CSS-only, no transition on static card |
| Border-radius | 8px | design-defaults.md |
| Box-shadow | `0 1px 3px rgba(0,0,0,0.1)` | design-defaults.md |
| Max-width | 320px (list view) | design-defaults.md |
| Inline styles | none — classes only | design-defaults.md |

---

## CSS delta (what changes in `RosterCard.css`)

```css
.roster-card {
  padding: 12px 16px;          /* was 48px 40px */
  margin-bottom: 8px;           /* was 32px */
  background: #ffffff;
  border: 1px solid #e2e8f0;   /* was #e0e0e0 */
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 12px;                    /* was 24px */
  max-width: 320px;
}

.roster-card__avatar {
  width: 40px;                  /* was 64px */
  height: 40px;                 /* was 64px */
  border-radius: 50%;
  flex-shrink: 0;
}

.roster-card__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.roster-card__name {
  font-size: 14px;              /* was 18px */
  font-weight: 600;
  line-height: 1.5;
  color: #1e293b;
  margin-bottom: 0;             /* was 16px */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.roster-card__role {
  font-size: 12px;
  line-height: 1.4;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #64748b;
}
```

## JS delta (what changes in `RosterCard.js`)

The render template needs `__body`, `__name`, and `__role` slots added. The per-card `fetchUserData` call (current perf hotspot noted in source) is out of scope for this design pass but parked below.

```js
return `
  <div class="roster-card">
    <img class="roster-card__avatar"
         src="${user.avatarUrl || ''}"
         alt="${user.name}"
         onerror="this.style.display='none'">
    <div class="roster-card__body">
      <span class="roster-card__name">${user.name}</span>
      <span class="roster-card__role">${user.role || ''}</span>
    </div>
  </div>
`.trim();
```

---

## Parked sub-decisions

These are resolved in the spec; none require user input before ship.

1. **Role badge (right-anchored blue chip)** — excluded from Turn 3 ship. Adds a third visual element that needs role-data parity across all team members. Add in a follow-up once `data-layer.js` exposes a `role` field consistently.

2. **Avatar initials fallback** — `onerror` hides the `<img>` on missing URL. A proper initials circle (CSS-generated from `user.name`) is better UX but requires a small JS utility. Park for post-ship.

3. **Per-card `fetchUserData` perf hotspot** — noted in source comment. Batching should happen at the `renderRosterCards` call site, not in the template. Out of scope for this visual pass; file as a follow-up performance ticket.

4. **Hover / focus state** — no interaction spec exists. Default browser outline is acceptable for now. A `box-shadow` ring on `:hover` (`0 0 0 2px #2563eb`) would be consistent with the palette; park until interactive mode is defined.

5. **Dark mode** — `design-defaults.md` defines no dark palette. Parked until a dark-mode requirement is surfaced.

6. **Card max-width in non-list contexts** — 320px cap is from defaults for list view. If cards appear in a grid at wider breakpoints, the cap should be removed or bumped to `100%`. Park until grid layout is scoped.

7. **`user.role` field availability** — `data-layer.js` was not inspected for `role` field presence. If absent, the `.roster-card__role` span renders empty (harmless but visually hollow). Confirm field name before Turn 3 or suppress the element when empty with a conditional.

8. **Margin-bottom 8px vs `gap` on parent** — 8px `margin-bottom` on the card works when cards are in a plain `<div>` stack. If the parent switches to `display:flex` or `display:grid`, the margin collapses differently. Prefer wrapping with a `gap`-based list container. Park for layout refactor pass.

---

## Committed ship statement

This spec ships exactly one set of changes: padding reduction, avatar shrink, name/role two-line hierarchy, and the CSS class additions needed to support the new template slots. No palette additions, no animations, no new data dependencies. The card will be visually tighter, readable at a glance, and fully within the `design-defaults.md` constraints.

**Ship target:** `src/styles/RosterCard.css` and `src/components/RosterCard.js`.
**Build step:** rebuild + restart per server-management cadence.
**Type check:** N/A (plain JS project).
