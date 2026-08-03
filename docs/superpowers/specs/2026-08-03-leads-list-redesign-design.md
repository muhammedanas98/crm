# Leads listing screen redesign

Date: 2026-08-03

## Goal

Redesign the Leads list screen (table + toolbar) so it reads as a premium,
custom-built CRM (Attio/Stripe/Vercel-inspired) rather than stock Frappe CRM,
without any functional regression and without touching other list screens.

## Scope

- **In scope**: `Leads.vue` default list view (`ViewControls` toolbar + the
  `LeadsListView` table). Visual restyle only.
- **Out of scope**: Kanban view, Group-by view, mobile view
  (`MobileLeadList.vue`), any other doctype's list screen (Deals, Contacts,
  Organizations, Tasks, Calls), backend/API, `ViewControls.vue` internals
  (shared by every list screen — must not change behavior or default look for
  other screens).

## Why this approach (CSS-variable retheme, no forking)

`frappe-ui` (npm package, `node_modules/frappe-ui`, pinned at
`1.0.0-beta.19`) compiles every semantic color — `ink-gray-*`,
`surface-gray-*`, `outline-gray-*`, `surface-blue-*`, etc — to CSS custom
properties on `:root` (see `frappe-ui/tailwind/colorPalette.js`). Every
component used by the list screen (`ListView`, `ListRow`, `ListHeader`,
`Badge`, `Button`, `Avatar`, and everything inside `ViewControls`) reads
these vars rather than hardcoded colors.

Redeclaring the same variable names under one wrapper class scopes a full
retheme to just the Leads page — every frappe-ui primitive inside re-themes
automatically, with zero change to any other screen and zero change to
selection/sort/resize/bulk-action logic (none of that JS is touched).

`ListRow.vue` (frappe-ui internal) already renders each row as its own
rounded, hoverable container — a "card row" look is a CSS problem, not a
structural one. `ListView` also accepts `options.rowHeight`, so taller rows
are a prop change.

Fallback (not needed for this pass, noted for future reference): if a later
requirement can't be done in CSS (e.g. hover-reveal per-row action icons),
build a local `LeadRow.vue` against the same `list` provide/inject context
frappe-ui's `ListRow.vue` uses, following the existing local
`src/components/ListViews/ListRows.vue` pattern — still without editing
frappe-ui itself.

## Token mapping

Scoped under a `.leads-canvas` wrapper class on `Leads.vue`'s root. Palette
values as supplied by the user (blue accent scale, slate neutral scale,
green/amber/red/violet semantic scales — see `git log` / conversation for
exact hex values, reproduced in the CSS file itself).

| Purpose | frappe-ui var | Token |
|---|---|---|
| Primary text | `--ink-gray-9`, `--ink-gray-8` | `slate-900` / `slate-800` |
| Secondary text | `--ink-gray-6` | `slate-600` |
| Muted/meta text | `--ink-gray-4` | `slate-400` |
| Page background | `--surface-gray-1` | `slate-25` |
| Row/card background | `--surface-base` | `slate-0` (white) |
| Row hover background | `--surface-sidebar` | `slate-50` |
| Selected row background | `--surface-gray-2`, `--surface-gray-3` | `slate-100`, tinted toward `blue-50` |
| Hairline borders | `--outline-gray-1`, `--outline-gray-2` | `slate-150` / `slate-200` |
| Primary button / active state | `--surface-blue-5/6/7` | `blue-500/600/700` |
| Badge / link accent | `--ink-blue-6` | `blue-600` |
| Focus ring | `--focus-default` | `0 0 0 3px rgba(11,155,222,.30)` |
| Success / warning / danger badges | `--surface-green/amber/red-*` | corresponding `-100/-600` steps |

Remaining `ink-gray`/`surface-gray`/`outline-gray` steps (3, 5, 7 etc) are
interpolated to the nearest slate stop; exact values live in the CSS file,
not duplicated here.

## Visual spec

- **Toolbar** (`Filter` / `SortBy` / `GroupBy` / `ColumnSettings` /
  `Create`): ghost buttons on transparent background, `rounded-lg`; only the
  active search/filter chip gets a hairline border; an applied filter gets a
  `surface-brand-subtle` tint instead of solid gray. "Create" stays a solid
  blue button.
- **Table header**: single 1px `border-subtle` bottom rule (no heavy
  border), medium-weight column labels, sticky.
- **Rows**: white card per row, `rounded-xl`, 6–8px vertical gap between rows
  (replacing the current touching-row divider), `shadow-sm` → `shadow-md` on
  hover, row height increased via `ListView`'s `options.rowHeight` (~52px vs
  the current 40px default). Selected row = pale blue tint, not gray.
- **Status column**: same colored-dot + label pattern, dot palette recolored
  from the new green/amber/red/blue/violet scale instead of frappe-ui
  defaults.
- **Avatars**: `ring-2 ring-white` so stacked avatars read as chips against
  the white row card.
- **Footer / pagination**: minimal, pill-style page-size control, muted
  count text.

## Files touched

| File | Change |
|---|---|
| `frontend/src/pages/Leads.vue` | Add `.leads-canvas` wrapper class on the page root; pass `rowHeight` through `ListView` options; wire any new row-level classes. |
| `frontend/src/components/ListViews/LeadsListView.vue` | Restyle row cell markup (avatar rings, status dot colors, right-aligned meta column); pass `class`/options through to `ListHeader` / `ListRowItem` / `ListFooter`. |
| `frontend/src/styles/leads-canvas.css` (new) | `.leads-canvas` CSS-variable overrides per the token table, plus the small number of `:deep()` rules needed for row gap/radius/shadow and toolbar pill styling that aren't exposed as CSS vars. |

Not touched: `ViewControls.vue`, any `frappe-ui` package source, Kanban/
Group-by views, `MobileLeadList.vue`, any other doctype's list screen,
backend.

## Known risk

The `:deep()` rules in `leads-canvas.css` target literal Tailwind class
strings baked into frappe-ui's compiled `ListRow.vue` (e.g. its
`flex flex-col transition-all` root and divider element). These aren't a
public API — they hold for `frappe-ui@1.0.0-beta.19` but could silently stop
matching on a version bump. Revisit `leads-canvas.css` after any `frappe-ui`
upgrade.

## Testing

Manual verification in the browser (dev server): confirm selection, sort,
column resize, filters, bulk actions, and pagination all still work
unchanged on the Leads list; confirm Deals/Contacts/Organizations/Tasks list
screens are visually unaffected.
