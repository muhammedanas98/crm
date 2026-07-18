# Arizone / UPC Customizations

Local changes on top of upstream `frappe/crm`. Kept on the `upc-crm` branch.
New files never conflict; edits to upstream files are limited to additive mount
lines listed below.

## Upstream update workflow

```bash
git fetch upstream
git checkout upc-crm
git rebase upstream/develop      # matches the branch this bench tracks
git push --force-with-lease origin upc-crm
bench build --app crm
```

Only the additive hunks below can conflict, and only if upstream rewrote the
same spot — a small manual fixup. Full workflow: `docs/development-workflow.md`.

## Touched upstream files

| File | Change | Reason |
|------|--------|--------|
| `frontend/src/components/Layouts/MobileLayout.vue` | wrap `<slot />` in a scroll div + mount `<MobileBottomBar />` | host the mobile bottom tab bar |

## New files (never conflict)

- `frontend/src/utils/mobileBottomBar.js` — bar visibility whitelist (pure)
- `frontend/src/components/Mobile/MobileBottomBar.vue` — the bar component
- `frontend/tests/unit/mobileBottomBar.test.js` — visibility tests
