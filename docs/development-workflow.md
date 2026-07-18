# CRM Development & Deployment Workflow

How we customize `frappe/crm`, pull upstream updates, publish to our fork, and
deploy to the server — without losing changes or fighting merge conflicts.

## Mental model

We vendor a fork. Three places, three roles:

| Remote | Points at | Role | What we do with it |
|--------|-----------|------|--------------------|
| `upstream` | `github.com/frappe/crm` | source of updates | `fetch` + `rebase` only — **never push** |
| `origin` | `github.com/<you>/crm` (our fork) | our source of truth | `push` our `arizone-custom` branch |
| server | `upc.petalkube.com` bench | runs the app | `fetch` + `reset --hard` — **never commit** |

Flow: **frappe/crm → (rebase) → dev machine → (push) → our fork → (reset) → server.**

All our changes live on the branch **`arizone-custom`**. New files never conflict;
edits to upstream files are limited to additive mount lines (see
`CUSTOMIZATIONS.md`).

> Note: this bench currently tracks `upstream/develop` (`2.0.0-dev`), the
> unstable dev branch. For production, prefer tracking a stable release
> branch/tag. Substitute `develop` below with the stable branch name if/when we
> switch.

---

## One-time setup

### 1. Fork on GitHub

On github.com open `github.com/frappe/crm` → **Fork** → creates
`github.com/<you>/crm`.

### 2. Wire remotes on the dev machine

```bash
cd apps/crm
# 'upstream' already points at frappe/crm here. Add our fork as 'origin':
git remote add origin https://github.com/<you>/crm.git
git remote -v   # expect: upstream=frappe/crm, origin=<your fork>
```

### 3. Create and publish the customization branch

```bash
git checkout -b arizone-custom      # branches off the tracked upstream branch
# (make commits — see CUSTOMIZATIONS.md for what we change)
git push -u origin arizone-custom   # publishes to our fork
```

---

## Daily development (dev machine)

1. Work on the `arizone-custom` branch only.
2. Keep every customization in its **own new file** where possible; edits to
   upstream files stay limited to single mount lines.
3. Log every touched upstream file in `CUSTOMIZATIONS.md`.
4. Commit small; push to the fork:

```bash
git checkout arizone-custom
# ... edit, commit ...
git push origin arizone-custom
bench build --app crm               # rebuild frontend to see changes locally
```

---

## Pulling upstream updates (dev machine)

Do this whenever we want the latest frappe/crm code.

```bash
cd apps/crm
git fetch upstream
git checkout arizone-custom
git rebase upstream/develop         # replays OUR commits on top of latest frappe
```

If a conflict appears (only the `MobileLayout.vue` mount hunk can conflict):

```bash
# edit the conflicted file(s) to keep both changes
git add <file>
git rebase --continue
```

Then publish the updated branch and rebuild:

```bash
git push --force-with-lease origin arizone-custom
bench build --app crm
```

`--force-with-lease` is required because rebase rewrites history. It is safe:
it refuses to push if the fork moved underneath us.

**Never** `git merge upstream/develop` into `arizone-custom` — that creates
merge commits and tangles history. Always rebase.

---

## Deploying to the server (`upc.petalkube.com`)

The server already runs stock frappe/crm. Point its `apps/crm` at our fork's
branch **once**, then it is deploy-only forever after.

### One-time on the server

```bash
cd ~/<bench>/apps/crm
git remote add origin https://github.com/<you>/crm.git
git fetch origin
git checkout arizone-custom
git branch --set-upstream-to=origin/arizone-custom
```

### Every deploy (server)

```bash
cd ~/<bench>/apps/crm
git fetch origin
git reset --hard origin/arizone-custom     # match the fork exactly
cd ~/<bench>
bench build --app crm
bench --site upc.petalkube.com migrate      # only if DB schema changed
bench --site upc.petalkube.com clear-cache
sudo supervisorctl restart all              # or: bench restart
```

Why `reset --hard` and not `git pull`: our dev flow rebases + force-pushes, so
the branch history is rewritten each update and a plain `pull` would fail or
create a merge. The server holds **no local commits** (deploy-only), so
`reset --hard origin/arizone-custom` is the clean, correct way to make it
identical to the fork.

**Golden rule:** never edit or commit on the server. All changes flow in from
the fork. That keeps `reset --hard` always safe.

---

## Quick reference

| Task | Where | Command |
|------|-------|---------|
| Get frappe updates | dev | `git fetch upstream && git rebase upstream/develop` |
| Publish our changes | dev | `git push --force-with-lease origin arizone-custom` |
| Rebuild frontend | dev/server | `bench build --app crm` |
| Deploy | server | `git fetch origin && git reset --hard origin/arizone-custom` |
| Apply DB changes | server | `bench --site upc.petalkube.com migrate` |
| Restart | server | `sudo supervisorctl restart all` |

## Rollback (server)

If a deploy breaks the site, roll back to the previous good commit:

```bash
cd ~/<bench>/apps/crm
git reset --hard <previous-good-commit-sha>
cd ~/<bench>
bench build --app crm
bench --site upc.petalkube.com clear-cache
sudo supervisorctl restart all
```

Find the SHA with `git log --oneline` on the fork or server.
