# CRM Mobile Bottom Tab Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a mobile-only bottom tab bar to the Frappe CRM SPA giving one-tap access to Leads, Deals, Contacts, and Tasks, plus a More button that opens the existing hamburger drawer.

**Architecture:** A new self-contained Vue component (`MobileBottomBar.vue`) is mounted once inside `MobileLayout.vue` (which `App.vue` only renders under 640px). Pure visibility/whitelist logic lives in a separate `.js` util so it is unit-testable without a Vue plugin. The bar decides its own visibility (list routes only) and behavior; the only edit to an upstream file is the mount in `MobileLayout.vue`.

**Tech Stack:** Vue 3 (`<script setup>`), `vue-router`, `frappe-ui`, Tailwind (frappe-ui theme tokens), Vitest + happy-dom for tests.

## Global Constraints

- Frontend root for all paths: `apps/crm/frontend`.
- Mobile breakpoint is **640px** — do not add new breakpoint logic; the bar only exists inside `MobileLayout`, which `App.vue` mounts under 640px.
- Tabs are **hardcoded** (Leads, Deals, Contacts, Tasks) — no DB/config. YAGNI.
- Edits to upstream (frappe/crm) files are limited to **additive mount lines**. All new logic goes in new files.
- Use existing icon components; do not create new icons (`LeadsIcon`, `DealsIcon`, `ContactsIcon`, `TaskIcon`, `MenuIcon` all exist in `src/components/Icons/`).
- Translation helper `__()` is globally available in templates (used un-imported across the app) — use it for all user-facing labels.
- Theme-aware styling via frappe-ui tokens (`text-ink-gray-*`, `surface-*`, `outline-gray-*`) — no hardcoded colors.
- Commit trailer for every commit: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

### Task 1: Customization branch + CUSTOMIZATIONS.md

Establishes the vendor-a-fork workflow so the customization survives upstream `git pull`/rebase, and creates the ledger of touched upstream files.

**Files:**
- Create: `apps/crm/CUSTOMIZATIONS.md`
- Git: new branch `upc-crm` in `apps/crm`

- [ ] **Step 1: Create the customization branch**

Run (from `apps/crm`):
```bash
cd apps/crm
git checkout -b upc-crm
```
Expected: `Switched to a new branch 'upc-crm'`

- [ ] **Step 2: Write `CUSTOMIZATIONS.md`**

Create `apps/crm/CUSTOMIZATIONS.md`:
```markdown
# Arizone Customizations

Local changes on top of upstream `frappe/crm`. Kept on the `upc-crm`
branch. New files never conflict; edits to upstream files are limited to
additive mount lines listed below.

## Upstream update workflow

```bash
# one-time (replace <your-fork-url> with your fork's git URL):
#   git remote rename origin upstream
#   git remote add origin <your-fork-url>

git fetch upstream
git rebase upstream/main        # or upstream/develop, matching your tracked branch
bench build --app crm
```

Only the additive hunks below can conflict, and only if upstream rewrote the
same spot — a small manual fixup.

## Touched upstream files

| File | Change | Reason |
|------|--------|--------|
| `frontend/src/components/Layouts/MobileLayout.vue` | wrap `<slot />` in a scroll div + mount `<MobileBottomBar />` | host the mobile bottom tab bar |

## New files (never conflict)

- `frontend/src/utils/mobileBottomBar.js` — bar visibility whitelist (pure)
- `frontend/src/components/Mobile/MobileBottomBar.vue` — the bar component
- `frontend/tests/unit/mobileBottomBar.test.js` — visibility tests
```

- [ ] **Step 3: Commit**

```bash
git add CUSTOMIZATIONS.md
git commit -m "$(printf 'docs: add customization ledger and fork workflow\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```
Expected: one file changed.

---

### Task 2: Visibility whitelist util (pure, TDD)

The only non-trivial logic: decide whether the bar shows for a given route name. Kept in a pure `.js` module (no `.vue` imports) so Vitest runs it without a Vue plugin, matching the existing `tests/unit/*.test.js` pattern.

**Files:**
- Create: `apps/crm/frontend/src/utils/mobileBottomBar.js`
- Test: `apps/crm/frontend/tests/unit/mobileBottomBar.test.js`

**Interfaces:**
- Produces:
  - `BOTTOM_BAR_ROUTES: string[]` — whitelisted route names.
  - `shouldShowBottomBar(routeName: string | null | undefined): boolean` — true iff `routeName` is in the whitelist.

- [ ] **Step 1: Write the failing test**

Create `apps/crm/frontend/tests/unit/mobileBottomBar.test.js`:
```javascript
import { describe, it, expect } from 'vitest'
import { shouldShowBottomBar } from '@/utils/mobileBottomBar'

describe('shouldShowBottomBar', () => {
  it('shows on list routes', () => {
    for (const name of ['Leads', 'Deals', 'Contacts', 'Tasks', 'Home']) {
      expect(shouldShowBottomBar(name)).toBe(true)
    }
  })

  it('hides on record detail routes', () => {
    for (const name of ['Lead', 'Deal', 'Contact', 'Organization']) {
      expect(shouldShowBottomBar(name)).toBe(false)
    }
  })

  it('hides when route name is missing', () => {
    expect(shouldShowBottomBar(undefined)).toBe(false)
    expect(shouldShowBottomBar(null)).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `apps/crm/frontend`):
```bash
cd apps/crm/frontend
yarn vitest run tests/unit/mobileBottomBar.test.js
```
Expected: FAIL — cannot resolve `@/utils/mobileBottomBar` (module does not exist yet).

- [ ] **Step 3: Write minimal implementation**

Create `apps/crm/frontend/src/utils/mobileBottomBar.js`:
```javascript
// Route names where the mobile bottom tab bar is shown. Whitelist (not
// blacklist) so new upstream detail routes default to "no bar".
export const BOTTOM_BAR_ROUTES = [
  'Home',
  'Dashboard',
  'Leads',
  'Deals',
  'Contacts',
  'Tasks',
  'Notes',
  'Organizations',
  'Call Logs',
]

export function shouldShowBottomBar(routeName) {
  return BOTTOM_BAR_ROUTES.includes(routeName)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
yarn vitest run tests/unit/mobileBottomBar.test.js
```
Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
cd apps/crm
git add frontend/src/utils/mobileBottomBar.js frontend/tests/unit/mobileBottomBar.test.js
git commit -m "$(printf 'feat: add mobile bottom bar visibility whitelist\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

### Task 3: MobileBottomBar component

The bar itself: 4 nav tabs + a More button. Self-contained — no props, no emits. Consumes the Task 2 util for visibility and the existing `mobileSidebarOpened` ref for the drawer.

**Files:**
- Create: `apps/crm/frontend/src/components/Mobile/MobileBottomBar.vue`

**Interfaces:**
- Consumes:
  - `shouldShowBottomBar(routeName)` from `@/utils/mobileBottomBar`.
  - `mobileSidebarOpened` (a `ref<boolean>`) from `@/composables/settings`.
  - Icon components `LeadsIcon`, `DealsIcon`, `ContactsIcon`, `TaskIcon`, `MenuIcon` from `@/components/Icons/`.
  - `useRoute`, `useRouter` from `vue-router`.
- Produces: default export Vue component `<MobileBottomBar />` — no props.

- [ ] **Step 1: Write the component**

Create `apps/crm/frontend/src/components/Mobile/MobileBottomBar.vue`:
```vue
<template>
  <nav
    v-if="showBar"
    class="flex shrink-0 items-stretch border-t border-outline-gray-1 bg-surface-white"
  >
    <button
      v-for="tab in tabs"
      :key="tab.route"
      class="flex flex-1 flex-col items-center justify-center gap-1 py-1.5 focus:outline-none"
      :class="isActive(tab) ? 'text-ink-gray-9' : 'text-ink-gray-5'"
      @click="go(tab.route)"
    >
      <component :is="tab.icon" class="size-5" />
      <span class="text-xs">{{ __(tab.label) }}</span>
    </button>
    <button
      class="flex flex-1 flex-col items-center justify-center gap-1 py-1.5 text-ink-gray-5 focus:outline-none"
      @click="openDrawer"
    >
      <MenuIcon class="size-5" />
      <span class="text-xs">{{ __('More') }}</span>
    </button>
  </nav>
</template>

<script setup>
import LeadsIcon from '@/components/Icons/LeadsIcon.vue'
import DealsIcon from '@/components/Icons/DealsIcon.vue'
import ContactsIcon from '@/components/Icons/ContactsIcon.vue'
import TaskIcon from '@/components/Icons/TaskIcon.vue'
import MenuIcon from '@/components/Icons/MenuIcon.vue'
import { shouldShowBottomBar } from '@/utils/mobileBottomBar'
import { mobileSidebarOpened } from '@/composables/settings'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = [
  { label: 'Leads', icon: LeadsIcon, route: 'Leads' },
  { label: 'Deals', icon: DealsIcon, route: 'Deals' },
  { label: 'Contacts', icon: ContactsIcon, route: 'Contacts' },
  { label: 'Tasks', icon: TaskIcon, route: 'Tasks' },
]

const showBar = computed(() => shouldShowBottomBar(route.name))

function isActive(tab) {
  return route.name === tab.route
}

function go(name) {
  if (route.name !== name) router.push({ name })
}

function openDrawer() {
  mobileSidebarOpened.value = true
}
</script>
```

- [ ] **Step 2: Syntax/import sanity check**

The component is not imported anywhere yet, so a build would tree-shake it and would NOT catch errors in it. Instead verify it parses and its imports resolve with a throwaway transform (from `apps/crm/frontend`):
```bash
cd apps/crm/frontend
npx vite-node -e "await import('@/components/Mobile/MobileBottomBar.vue'); console.log('ok')" 2>&1 | tail -20
```
Expected: prints `ok` (or, if `vite-node` is unavailable in this environment, skip — full compile + runtime validation happens in Task 4 once the component is mounted and the app is built). Do not treat a missing `vite-node` as a failure.

- [ ] **Step 3: Commit**

```bash
cd apps/crm
git add frontend/src/components/Mobile/MobileBottomBar.vue
git commit -m "$(printf 'feat: add MobileBottomBar component\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

### Task 4: Mount in MobileLayout + verify end-to-end

Mounts the bar and restructures the layout so the header stays on top, page content scrolls in the middle, and the bar stays at the bottom. This is the only upstream file edited.

**Files:**
- Modify: `apps/crm/frontend/src/components/Layouts/MobileLayout.vue`

**Interfaces:**
- Consumes: `<MobileBottomBar />` (Task 3).

- [ ] **Step 1: Edit `MobileLayout.vue`**

Replace the entire contents of `apps/crm/frontend/src/components/Layouts/MobileLayout.vue` with:
```vue
<template>
  <div class="flex h-screen w-screen">
    <MobileSidebar />
    <div class="flex h-full flex-1 flex-col bg-surface-base">
      <MobileAppHeader />
      <div class="flex-1 overflow-auto">
        <slot />
      </div>
      <MobileBottomBar />
    </div>
    <GlobalModals />
  </div>
</template>
<script setup>
import MobileSidebar from '@/components/Mobile/MobileSidebar.vue'
import MobileAppHeader from '@/components/Mobile/MobileAppHeader.vue'
import MobileBottomBar from '@/components/Mobile/MobileBottomBar.vue'
import GlobalModals from '@/components/Modals/GlobalModals.vue'
</script>
```

Notes on the change vs. the original:
- `overflow-auto` moved off the outer column onto a new `flex-1 overflow-auto` wrapper around `<slot />`. Result: header is now pinned at top and the bar pinned at bottom; only page content scrolls (standard mobile app-shell layout).
- Added the `<MobileBottomBar />` mount and its import.

- [ ] **Step 2: Run the unit tests (nothing regressed)**

Run (from `apps/crm/frontend`):
```bash
cd apps/crm/frontend
yarn vitest run tests/unit/mobileBottomBar.test.js
```
Expected: PASS — 3 tests.

- [ ] **Step 3: Build the app**

Run (from bench root `/home/muhammed-anas/Development/frappe/my-bench`):
```bash
cd /home/muhammed-anas/Development/frappe/my-bench
bench build --app crm 2>&1 | tail -5
```
Expected: `DONE ... Build Time` with no errors.

- [ ] **Step 4: Manual verification (device emulation < 640px)**

Open the CRM SPA at `http://erpnext.localhost:8000/crm` in a browser with device emulation set to a mobile width (< 640px), then confirm:
  1. Bottom bar visible on **Leads**, **Deals**, **Contacts**, **Tasks** lists and the home/dashboard.
  2. Tapping each tab navigates and the **active tab** highlights (dark) while others stay muted.
  3. Tapping **More** opens the existing hamburger drawer.
  4. Opening a record (e.g. a Deal) → bar **disappears**; the detail page uses full height with its own back button.
  5. Header stays fixed at top; only the list content scrolls; bar stays fixed at bottom.

If any check fails, fix before committing.

- [ ] **Step 5: Commit**

```bash
cd apps/crm
git add frontend/src/components/Layouts/MobileLayout.vue
git commit -m "$(printf 'feat: mount mobile bottom tab bar in MobileLayout\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>')"
```

---

## Notes for the executor

- Run all `yarn`/`vitest`/`vite` commands from `apps/crm/frontend`; run `bench build` from the bench root.
- All work happens on the `upc-crm` branch (created in Task 1).
- If `yarn` is not the package manager in use, substitute the repo's manager (there is a `yarn.lock` in `apps/crm`, so `yarn` is expected).
