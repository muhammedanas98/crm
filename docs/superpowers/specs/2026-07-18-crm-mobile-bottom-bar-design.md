# CRM Mobile Bottom Tab Bar — Design

**Date:** 2026-07-18
**App:** `frappe/crm` frontend (Vue 3 SPA, `frappe-ui`, `vue-router`)
**Status:** Approved design, ready for implementation plan

## Goal

Add a mobile-only bottom tab bar to the CRM SPA giving one-tap access to the
most-used sections (Leads, Deals, Contacts, Tasks) plus a **More** button that
opens the existing hamburger drawer for everything else. The existing hamburger
drawer stays; the bar complements it (standard mobile-app pattern).

## Scope

In scope:
- New bottom bar shown only on mobile (< 640px, the breakpoint `App.vue`
  already uses to select `MobileLayout`).
- Bar visible on list-type pages only; hidden on record detail/edit pages and
  settings.
- Four navigation tabs + one "More" button.

Out of scope (YAGNI):
- Admin/DB-configurable tab items — tabs are hardcoded, matching the existing
  `MobileSidebar` `links` array. Revisit only if configurability is requested.
- Desktop changes — desktop keeps `DesktopLayout` unchanged.
- Any change to routing, core Frappe, or the `upc_branding` app.

## Why this lives in the CRM app (not `upc_branding`)

The CRM UI is a compiled Vue SPA served by `crm/www/crm.html`. Frappe hook
mechanisms (`app_include_js/css`, website context, DB settings) that made the
desk branding upgrade-safe do **not** reach into this SPA. A reactive,
router-integrated tab bar must be a Vue component inside `apps/crm/frontend`.
See "Maintainability" for how upstream updates are managed.

## Architecture

```
App.vue
 └─ Layout (computed: MobileLayout when window.innerWidth < 640)
     └─ MobileLayout.vue
         ├─ MobileSidebar        (existing drawer, toggled by mobileSidebarOpened)
         ├─ column (flex, overflow-auto)
         │   ├─ MobileAppHeader   (existing, hamburger sets mobileSidebarOpened=true)
         │   ├─ <slot />          (page content, scrolls)
         │   └─ MobileBottomBar   (NEW — last flex child, shrink-0)   <-- added
         └─ GlobalModals          (existing)
```

The bar is a normal flex child at the bottom of the already-`overflow-auto`
column. Page content scrolls above it. No `position: fixed`, no bottom-padding
hacks, no overlap with form action footers (those pages are not whitelisted, so
the bar is hidden there anyway).

## Components

### `src/components/Mobile/MobileBottomBar.vue` (new)

Responsibilities:
1. Render 5 slots: **Leads · Deals · Contacts · Tasks · More**.
2. Tabs 1–4 navigate to their list routes via `router-link` (or programmatic
   `router.push`), each with icon + short label.
3. Highlight the active tab when the current route matches that section.
4. **More** button opens the existing drawer: sets `mobileSidebarOpened = true`
   (imported from `@/composables/settings`).
5. Show itself only on whitelisted list routes; render nothing otherwise.

Inputs/deps:
- `useRoute()` / `useRouter()` from `vue-router`.
- `mobileSidebarOpened` ref from `@/composables/settings`.
- Existing icon components: `LeadsIcon`, `DealsIcon`, `ContactsIcon`,
  `TaskIcon`, and a menu/more icon (reuse an existing icon; add a small new
  icon component only if none fits).

Interface: no props, no emits. Self-contained. A consumer just mounts
`<MobileBottomBar />`; it decides its own visibility and behavior.

Tab config (module-local constant, mirrors `MobileSidebar` links):

| Label    | Route name | Icon          |
|----------|-----------|----------------|
| Leads    | `Leads`    | `LeadsIcon`    |
| Deals    | `Deals`    | `DealsIcon`    |
| Contacts | `Contacts` | `ContactsIcon` |
| Tasks    | `Tasks`    | `TaskIcon`     |
| More     | — (drawer) | menu icon      |

### `src/components/Layouts/MobileLayout.vue` (edit — 2 lines)

- Add import: `import MobileBottomBar from '@/components/Mobile/MobileBottomBar.vue'`
- Add `<MobileBottomBar />` as the last child inside the flex column (after
  `<slot />`).

This is the only upstream file touched, and only by additive lines.

## Visibility logic

A `showBar` computed derived from the current route name against a whitelist:

```
SHOW_ON = ['Home', 'Dashboard', 'Leads', 'Deals', 'Contacts',
           'Tasks', 'Notes', 'Organizations', 'Call Logs']
showBar = SHOW_ON.includes(route.name)
```

Detail/edit routes (`Lead`, `Deal`, `Contact`, `Organization`, settings, data
import, etc.) are singular or otherwise absent from the list → bar hidden. The
whitelist is chosen over a blacklist so new upstream detail routes default to
"no bar" (safe default).

## Active-tab styling

- Active tab: dark label + filled/emphasized icon (`text-ink-gray-9`).
- Inactive tab: muted (`text-ink-gray-5`).
- Active detection: `route.name === tab.route`.
- Uses frappe-ui / Tailwind tokens already in the project — theme-aware
  (light/dark) for free. (Accent-color styling, e.g. brand gold, is a later
  tweak, not part of this design.)

## Data flow

1. User taps a tab → `router.push({ name: tab.route })` → vue-router renders the
   list page in the slot → `showBar` stays true → active highlight moves.
2. User taps **More** → `mobileSidebarOpened.value = true` → existing
   `MobileSidebar` slides open (unchanged behavior; existing `SidebarLink`
   already sets it back to `false` on navigation).
3. User opens a record (detail route) → `showBar` becomes false → bar unmounts →
   detail page uses its own back button / action footer with full height.

## Error / edge handling

- Route not in whitelist → bar renders nothing (`v-if="showBar"`), no errors.
- Icons missing → build-time import error caught in dev; all four icons already
  exist in `src/components/Icons/`.
- Breakpoint: bar only exists inside `MobileLayout`, which `App.vue` mounts only
  under 640px. On resize across the breakpoint, `App.vue` swaps layouts; no
  extra media-query logic needed in the bar.

## Testing

Per project conventions (frontend has Playwright/Vitest available), keep it
light:
- One unit-style check on the visibility predicate: given a route name, assert
  `showBar` is true for a whitelisted name and false for a detail route (e.g.
  `Deal`). This is the only non-trivial logic.
- Manual verification: load CRM under 640px (or device emulation), confirm bar
  shows on Leads/Deals/Contacts/Tasks, active highlight tracks navigation, More
  opens the drawer, and the bar disappears on a record detail page.

No new test framework, fixtures, or per-component suites.

## Maintainability (tracking upstream CRM updates)

The user pulls the latest CRM from GitHub, so the customization must survive
`git pull`/rebase with minimal friction.

Conflict surface = only the ~2 added lines in `MobileLayout.vue`; the new
component file never conflicts.

Workflow (vendor-a-fork pattern):
1. Fork `github.com/frappe/crm` to the user's org.
2. In `apps/crm`:
   ```
   git remote rename origin upstream
   git remote add origin <your-fork>
   git checkout -b arizone-custom
   ```
3. All customizations are small, isolated commits on `arizone-custom`.
4. On upstream update:
   ```
   git fetch upstream
   git rebase upstream/main    # replays custom commits onto latest
   bench build --app crm
   ```
   Only the 2-line `MobileLayout` hunk can conflict, and only if upstream
   rewrote that spot — a ~10-second manual fixup.

Rules to keep it painless:
- Every customization is its own **new file** where possible; edits to upstream
  files are limited to single mount lines.
- Add a **`CUSTOMIZATIONS.md`** at the crm app root listing every upstream file
  touched and why, so the blast radius is discoverable from one place.
- Keep customization commits separate from any upstream cherry-picks.

## Files

New:
- `src/components/Mobile/MobileBottomBar.vue`
- `CUSTOMIZATIONS.md` (crm app root)
- (optional) one small icon component if no existing "more/menu" icon fits

Edited (upstream, additive only):
- `src/components/Layouts/MobileLayout.vue` (import + one tag)

Build/apply:
- `bench build --app crm`
