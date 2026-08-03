# Leads List Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the Leads list screen (toolbar + table) to a premium,
Attio/Stripe/Vercel-inspired look, scoped to the Leads screen only, with zero
functional regression.

**Architecture:** frappe-ui compiles its semantic colors (`ink-gray-*`,
`surface-gray-*`, `outline-gray-*`, `surface-blue-*`, etc) to CSS custom
properties on `:root`. Every component the Leads screen uses (`ListView`,
`ListRow`, `ListHeader`, `ListFooter`, `Badge`, `Button`, `Avatar`) reads
those vars rather than hardcoded colors. Redeclaring the same variable names
under one wrapper class (`.leads-canvas`) retheme everything inside it —
scoped to Leads, zero change to Deals/Contacts/Organizations/Tasks, zero
change to any selection/sort/resize/filter logic (only CSS is touched). A
small number of plain CSS rules (row gap/shadow/radius, header debox) key
off frappe-ui's literal compiled class names, since those specific visual
details aren't exposed as CSS vars or component props.

**Tech Stack:** Vue 3 SFC, Tailwind (via `frappe-ui` preset), plain CSS
(global, imported once — no `:deep()` needed since there's no `<style
scoped>` involved).

## Global Constraints

- Leads-only scope: do not modify `frontend/src/components/ViewControls.vue`
  logic, any `frappe-ui` package source under `node_modules/`, or any other
  doctype's list screen.
- Preserve all existing functionality: row selection, column resize, sort,
  filter, group-by, bulk actions, pagination, row navigation to `Lead`
  detail, Kanban view, Mobile view. Only appearance changes.
- `frappe-ui` is pinned at `1.0.0-beta.19`. The plain-CSS rules in Task 2 and
  Task 3 key off literal compiled Tailwind class strings from that version's
  `ListRow.vue`/`ListHeader.vue` — not a public API. Revisit
  `frontend/src/styles/leads-canvas.css` after any `frappe-ui` version bump.
- Color values below come from the user-supplied palette (blue accent scale,
  slate neutral scale, green/amber/red/violet semantic scales), reproduced
  verbatim in Task 1's CSS.
- Kanban view sits inside the same `.leads-canvas` wrapper as the toolbar
  (see Task 1), so it inherits the new neutral/blue color vars (text/bg
  colors only — no structural CSS in this plan targets Kanban markup, so its
  layout is unaffected). This is a deliberate, low-risk tradeoff to avoid an
  intrusive extra wrapper split for a component explicitly out of scope for
  a redesign; flag if the user wants Kanban strictly frozen instead.

---

### Task 1: Token file + wrapper class (foundation)

**Files:**
- Create: `frontend/src/styles/leads-canvas.css`
- Modify: `frontend/src/pages/Leads.vue`

**Interfaces:**
- Produces: CSS class `.leads-canvas` — any element inside it gets the new
  color scheme. Later tasks add more rules to the same file, all still keyed
  off `.leads-canvas`.

- [ ] **Step 1: Create the token CSS file**

```css
/* frontend/src/styles/leads-canvas.css */
/*
 * Scoped retheme for the Leads list screen only. Redeclares frappe-ui's
 * semantic CSS custom properties (see node_modules/frappe-ui/tailwind/
 * colorPalette.js) under .leads-canvas so every frappe-ui component inside
 * (ListView, Badge, Button, Avatar, ...) picks up the new palette without
 * any change to frappe-ui itself or to other screens.
 */

.leads-canvas {
  /* Neutral (slate) scale -> frappe-ui's semantic gray steps */
  --ink-base: #181b22;
  --ink-gray-9: #181b22;
  --ink-gray-8: #282d38;
  --ink-gray-7: #3c4351;
  --ink-gray-6: #545d6c;
  --ink-gray-5: #727c8c;
  --ink-gray-4: #9aa3b0;
  --ink-gray-3: #c1c7d0;
  --ink-gray-2: #d9dde3;
  --ink-gray-1: #e4e7eb;

  --surface-base: #ffffff;
  --surface-gray-1: #fbfbfc;
  --surface-gray-2: #eef0f2;
  --surface-gray-3: #e4e7eb;
  --surface-gray-4: #d9dde3;
  --surface-gray-5: #c1c7d0;
  --surface-gray-6: #9aa3b0;
  --surface-gray-7: #545d6c;
  --surface-gray-8: #3c4351;
  --surface-gray-9: #282d38;
  --surface-gray-10: #181b22;
  --surface-sidebar: #f6f7f8;

  --outline-gray-1: #e4e7eb;
  --outline-gray-2: #d9dde3;
  --outline-gray-3: #c1c7d0;
  --outline-gray-4: #9aa3b0;
  --outline-gray-5: #727c8c;
  --outline-gray-6: #545d6c;
  --outline-gray-7: #3c4351;
  --outline-gray-8: #282d38;
  --outline-gray-9: #181b22;

  /* Brand (blue) accent */
  --ink-blue-1: #ffffff;
  --ink-blue-8: #08669a;
  --surface-blue-2: #d9eefe;
  --surface-blue-7: #0680bb;
  --outline-blue-1: #d9eefe;
  --outline-blue-3: #83cdfb;

  /* Status badge colors */
  --ink-green-1: #ffffff;
  --ink-green-8: #0f6642;
  --surface-green-2: #dbf5e5;
  --surface-green-7: #158457;
  --outline-green-3: #1fa971;

  --ink-amber-1: #ffffff;
  --ink-amber-8: #8f560f;
  --surface-amber-2: #fdf0d5;
  --surface-amber-7: #b96e13;
  --outline-amber-3: #e08a1e;

  --ink-red-1: #ffffff;
  --ink-red-8: #932323;
  --surface-red-2: #fbe2e2;
  --surface-red-7: #bc2f2f;
  --outline-red-3: #dd4444;

  --ink-violet-1: #ffffff;
  --ink-violet-8: #6244b8;
  --surface-violet-2: #ece5fb;
  --surface-violet-7: #6244b8;
  --outline-violet-3: #7c5cd6;

  /* Focus ring (matches the blue-500 accent) */
  --focus-default: 0 0 0 3px rgba(11, 155, 222, 0.3);
  --focus-outline-default: 3px solid rgba(11, 155, 222, 0.3);
}
```

- [ ] **Step 2: Import the CSS and add the wrapper in Leads.vue**

In `frontend/src/pages/Leads.vue`, add the import at the top of the
`<script setup>` block (alongside the other imports):

```js
import '@/styles/leads-canvas.css'
```

Wrap the `<ViewControls>` element and the `v-if="!isMobile"` template block
in a `.leads-canvas` div. Current structure (lines 20–267 of the file):

```html
  <ViewControls
    ref="viewControls"
    ...
  />
  <!-- custom/mobile: desktop views unchanged, only gated by isMobile -->
  <template v-if="!isMobile">
  <KanbanView ...>
    ...
  </KanbanView>
  <LeadsListView ... />
  <EmptyState ... />
  </template>
```

Change to:

```html
  <div class="leads-canvas">
    <ViewControls
      ref="viewControls"
      ...
    />
    <!-- custom/mobile: desktop views unchanged, only gated by isMobile -->
    <template v-if="!isMobile">
    <KanbanView ...>
      ...
    </KanbanView>
    <LeadsListView ... />
    <EmptyState ... />
    </template>
  </div>
```

(Only the wrapping `<div class="leads-canvas">...</div>` is new — every
existing attribute/prop/event on `ViewControls`, `KanbanView`,
`LeadsListView`, `EmptyState` stays exactly as-is.)

- [ ] **Step 3: Manual verification**

Run `yarn dev` (or the project's existing dev command) from
`frontend/`. Open the Leads list in the browser:
- Confirm the page background, row background, and text colors have
  changed to the new slate/blue palette (no longer frappe-ui's default
  gray/blue).
- Open the Deals list in another tab and confirm it still looks like the
  original, unchanged frappe-ui styling — the retheme must not leak outside
  `.leads-canvas`.
- Confirm clicking a lead row still navigates to the Lead detail page, and
  the row checkbox still selects the row.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/styles/leads-canvas.css frontend/src/pages/Leads.vue
git commit -m "feat(leads): add scoped color retheme for leads list screen"
```

---

### Task 2: Card-row styling

**Files:**
- Modify: `frontend/src/styles/leads-canvas.css`
- Modify: `frontend/src/components/ListViews/LeadsListView.vue`

**Interfaces:**
- Consumes: `.leads-canvas` class from Task 1.
- Produces: no new interfaces — pure styling.

- [ ] **Step 1: Bump row height**

In `frontend/src/components/ListViews/LeadsListView.vue`, the `<ListView>`
element's `:options` object currently is:

```html
    :options="{
      getRowRoute: (row) => ({
        name: 'Lead',
        params: { leadId: row.name },
        query: { view: route.query.view, viewType: route.params.viewType },
      }),
      selectable: options.selectable,
      showTooltip: options.showTooltip,
      resizeColumn: options.resizeColumn,
    }"
```

Add `rowHeight: 52,`:

```html
    :options="{
      getRowRoute: (row) => ({
        name: 'Lead',
        params: { leadId: row.name },
        query: { view: route.query.view, viewType: route.params.viewType },
      }),
      selectable: options.selectable,
      showTooltip: options.showTooltip,
      resizeColumn: options.resizeColumn,
      rowHeight: 52,
    }"
```

- [ ] **Step 2: Add card-row CSS**

Append to `frontend/src/styles/leads-canvas.css`:

```css
/*
 * Card-row look for the list table. Selectors key off ListRow.vue's
 * (frappe-ui@1.0.0-beta.19) literal root classes:
 *   class="flex flex-col transition-all duration-300 ease-in-out"
 * and its row-divider element: class="h-px border-t". Revisit on
 * frappe-ui upgrade if rows stop picking up this styling.
 */
.leads-canvas .flex.flex-col.transition-all.duration-300.ease-in-out {
  margin-bottom: 8px;
  box-shadow: 0 1px 2px rgba(24, 27, 34, 0.04);
  transition:
    box-shadow 150ms ease,
    background-color 150ms ease;
}

.leads-canvas .flex.flex-col.transition-all.duration-300.ease-in-out:hover {
  box-shadow: 0 4px 12px rgba(24, 27, 34, 0.08);
}

/* Row divider is replaced by the gap above; hide it. */
.leads-canvas .flex.flex-col.transition-all.duration-300.ease-in-out .h-px.border-t {
  display: none;
}
```

- [ ] **Step 3: Manual verification**

Reload the Leads list in the browser:
- Rows should now render as separated white cards with an 8px gap and a
  subtle shadow that intensifies on hover.
- Click a row checkbox — selection tint still applies, multi-select via
  shift-click still works.
- Click a row (not the checkbox) — still navigates to the Lead detail page.
- Resize a column by dragging its edge — still works and persists.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/styles/leads-canvas.css frontend/src/components/ListViews/LeadsListView.vue
git commit -m "feat(leads): card-row styling for leads table"
```

---

### Task 3: Header + footer chrome

**Files:**
- Modify: `frontend/src/styles/leads-canvas.css`

**Interfaces:**
- Consumes: `.leads-canvas` class from Task 1.

- [ ] **Step 1: Debox the table header**

Append to `frontend/src/styles/leads-canvas.css`:

```css
/*
 * Table header: replace the boxed panel (ListHeader.vue's literal root
 * class="mb-2 grid items-center gap-4 rounded bg-surface-gray-2 p-2") with
 * a plain sticky bar and a hairline bottom rule.
 */
.leads-canvas .grid.items-center.gap-4.rounded.bg-surface-gray-2.p-2 {
  background-color: var(--surface-base);
  border-radius: 0;
  border-bottom: 1px solid var(--outline-gray-2);
  margin-bottom: 12px;
  position: sticky;
  top: 0;
  z-index: 1;
}
```

- [ ] **Step 2: Verify the footer already retthemes correctly**

`ListFooter.vue` and `TabButtons` already use semantic vars
(`text-ink-gray-5`), so the pagination footer picks up the new palette from
Task 1 automatically — no additional CSS needed. Confirm this visually
(count text and page-size buttons should already look correct) rather than
adding redundant rules.

- [ ] **Step 3: Manual verification**

Reload the Leads list:
- Header row: no gray box, just a bottom hairline and sticky-on-scroll
  behavior (scroll the list if there are enough rows to test).
- Drag a column's resize handle — still resizes and the header stays
  aligned with row columns.
- Footer: page-size selector and row-count text render in the new muted
  gray, still functional (change page size, confirm it reloads the list).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/styles/leads-canvas.css
git commit -m "feat(leads): debox table header, sticky on scroll"
```

---

### Task 4: Toolbar polish

**Files:**
- Modify: `frontend/src/styles/leads-canvas.css`

**Interfaces:**
- Consumes: `.leads-canvas` class from Task 1.

- [ ] **Step 1: Add toolbar spacing/pill rules**

`Button.vue`'s ghost/subtle variants already use semantic vars
(`text-ink-gray-8`, `bg-surface-gray-3` on hover, etc — see
`node_modules/frappe-ui/src/components/Button/Button.js`), so Filter /
SortBy / GroupBy / ColumnSettings / Refresh / "More options" buttons and the
"Create" button (default `theme="gray"`, solid variant →
`bg-surface-gray-10`) already retheme correctly from Task 1 alone. Only the
toolbar's own container spacing needs a small adjustment. Append to
`frontend/src/styles/leads-canvas.css`:

```css
/*
 * Toolbar container: ViewControls.vue's desktop root
 * (class="flex items-center justify-between gap-2 px-5 py-4") already
 * retthemes via semantic vars; only loosen the vertical padding slightly
 * for a less cramped, more Linear/Attio-like toolbar.
 */
.leads-canvas > .flex.items-center.justify-between.gap-2.px-5.py-4 {
  padding-top: 20px;
  padding-bottom: 20px;
}
```

- [ ] **Step 2: Manual verification**

Reload the Leads list:
- Toolbar buttons (Filter, Sort, Group By, Column Settings, Refresh, More
  options, Create) render in the new near-black/slate palette, ghost/ hover
  states work.
- Click Filter — the filter panel still opens and applying a filter still
  filters the list.
- Click Sort — sort panel still opens and re-sorts the list.
- Click Group By, switch to the group-by view via the view switcher, and
  back — still works (visual regression here is acceptable per the Global
  Constraints note on Kanban/group-by; only confirm it *functions*).
- Click "Create" — the New Lead modal still opens.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/styles/leads-canvas.css
git commit -m "feat(leads): toolbar spacing polish"
```

---

### Task 5: Row content detail (avatars)

**Files:**
- Modify: `frontend/src/components/ListViews/LeadsListView.vue`

**Interfaces:**
- Consumes: nothing new.

- [ ] **Step 1: Add avatar rings**

In `frontend/src/components/ListViews/LeadsListView.vue`, the `lead_name`
and `lead_owner` column prefixes currently render:

```html
          <div v-else-if="column.key === 'lead_name'">
            <Avatar
              v-if="item.label"
              class="flex items-center"
              :image="item.image"
              :label="item.image_label"
              size="sm"
            />
          </div>
          <div v-else-if="column.key === 'lead_owner'">
            <Avatar
              v-if="item.full_name"
              class="flex items-center"
              :image="item.user_image"
              :label="item.full_name"
              size="sm"
            />
          </div>
```

Change both `class="flex items-center"` to
`class="flex items-center ring-2 ring-white"`:

```html
          <div v-else-if="column.key === 'lead_name'">
            <Avatar
              v-if="item.label"
              class="flex items-center ring-2 ring-white"
              :image="item.image"
              :label="item.image_label"
              size="sm"
            />
          </div>
          <div v-else-if="column.key === 'lead_owner'">
            <Avatar
              v-if="item.full_name"
              class="flex items-center ring-2 ring-white"
              :image="item.user_image"
              :label="item.full_name"
              size="sm"
            />
          </div>
```

Note: the `_assign` column's stacked avatars (`MultipleAvatar.vue`) already
use `ring-2 ring-outline-base`, and `--outline-base` isn't overridden by
`.leads-canvas` (it's a widely-used generic border var — overriding it
globally would make unrelated borders invisible). No change needed there;
its ring already renders in a neutral gray that reads fine against the new
white row cards.

- [ ] **Step 2: Manual verification**

Reload the Leads list:
- Lead name and lead owner avatars show a white ring, giving them a
  "chip on card" look.
- Assignee avatars (stacked, `_assign` column) unaffected, still legible.
- Clicking a row (including near an avatar) still navigates correctly.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ListViews/LeadsListView.vue
git commit -m "feat(leads): white ring on row avatars"
```

---

### Task 6: Full regression pass

**Files:** none (verification only)

- [ ] **Step 1: Leads screen functional checklist**

On the Leads list (desktop, list view):
- Select multiple rows via checkboxes and via shift-click range select —
  bulk action bar appears with correct actions.
- Resize a column, reload the page — width persists.
- Apply a filter, a sort, and a group-by — all still work and the URL/view
  state updates as before.
- Change page size in the footer — list reloads with the new count.
- Click "Create" — New Lead modal opens and creating a lead still works.
- Open a lead's dropdown (call/note/task quick actions in Kanban) — not
  applicable to list view, skip.

- [ ] **Step 2: Cross-screen regression checklist**

Open each of the following and confirm they render with the **original**
(unchanged) frappe-ui styling — no `.leads-canvas` bleed:
- Deals list
- Contacts list
- Organizations list
- Tasks list

- [ ] **Step 3: Leads Kanban / Group-by / Mobile check**

- Switch the Leads view to Kanban — confirm it still functions (drag
  between columns, new-lead-in-column) even though its color tokens now
  match the new palette per the Global Constraints note.
- Switch to Group-by — confirm it still groups and functions.
- Resize the browser below 768px width (or use device emulation) and
  reload — confirm `MobileLeadList.vue` renders unchanged (it's outside
  `.leads-canvas` entirely, gated by the `v-else` on `isMobile`).

- [ ] **Step 4: Final commit (if any fixups were needed)**

```bash
git add -A
git commit -m "fix(leads): regression fixes from full pass"
```

(Skip this commit if no fixes were needed.)
