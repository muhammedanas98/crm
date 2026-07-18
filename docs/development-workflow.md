# CRM Development & Deployment Workflow

How we customize `frappe/crm`, pull upstream updates, publish to our fork, and
deploy to the server — without losing changes or fighting merge conflicts.

## Mental model

We vendor a fork. Three places, three roles:

| Remote | Points at | Role | What we do with it |
|--------|-----------|------|--------------------|
| `upstream` | `github.com/frappe/crm` | source of updates | `fetch` + `rebase` only — **never push** |
| `origin` | `github.com/muhammedanas98/crm` (our fork) | our source of truth | `push` our `upc-crm` branch |
| server | `upc.petalkube.com` bench | runs the app | `fetch` + `reset --hard` — **never commit** |

Flow: **frappe/crm → (rebase) → dev machine → (push) → our fork → (reset) → server.**

All our changes live on the branch **`upc-crm`**. New files never conflict;
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
`github.com/muhammedanas98/crm`.

### 2. Wire remotes on the dev machine

```bash
cd apps/crm
# 'upstream' already points at frappe/crm here. Add our fork as 'origin':
git remote add origin https://github.com/muhammedanas98/crm.git
git remote -v   # expect: upstream=frappe/crm, origin=<your fork>
```

### 3. Create and publish the customization branch

```bash
git checkout -b upc-crm      # branches off the tracked upstream branch
# (make commits — see CUSTOMIZATIONS.md for what we change)
git push -u origin upc-crm   # publishes to our fork
```

---

## Daily development (dev machine)

1. Work on the `upc-crm` branch only.
2. Keep every customization in its **own new file** where possible; edits to
   upstream files stay limited to single mount lines.
3. Log every touched upstream file in `CUSTOMIZATIONS.md`.
4. Commit small; push to the fork:

```bash
git checkout upc-crm
# ... edit, commit ...
git push origin upc-crm
bench build --app crm               # rebuild frontend to see changes locally
```

---

## Pulling upstream updates (dev machine)

Do this whenever we want the latest frappe/crm code.

```bash
cd apps/crm
git fetch upstream
git checkout upc-crm
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
git push --force-with-lease origin upc-crm
bench build --app crm
```

`--force-with-lease` is required because rebase rewrites history. It is safe:
it refuses to push if the fork moved underneath us.

**Never** `git merge upstream/develop` into `upc-crm` — that creates
merge commits and tangles history. Always rebase.

---

## Deploying to the server (`upc.petalkube.com`)

The server already runs stock frappe/crm. Point its `apps/crm` at our fork's
branch **once**, then it is deploy-only forever after.

### One-time on the server: switch from stock frappe/crm to our fork

The server was installed with stock `frappe/crm`, so its `apps/crm` remote
`origin` points at `frappe/crm` on branch `develop` (or `main`). We re-point it
at our fork and switch to `upc-crm`.

**1. Inspect (read-only, safe):**
```bash
cd ~/<bench>/apps/crm
git remote -v              # expect origin -> frappe/crm
git branch --show-current  # expect develop or main
git status                 # MUST be clean — no local edits
```
If `git status` shows changes, stop: the server must be deploy-only. Investigate
before continuing (do not blow away unknown local changes without checking).

**2. Re-point remotes:**
```bash
git remote rename origin upstream                                  # frappe/crm becomes 'upstream'
git remote add origin git@github.com:muhammedanas98/crm.git        # our fork becomes 'origin'
# no SSH key on the server? use HTTPS (public repo, pull needs no auth):
#   git remote add origin https://github.com/muhammedanas98/crm.git
git remote -v                                                      # origin=fork, upstream=frappe/crm
```

**3. Switch to our branch:**
```bash
git fetch origin
git checkout upc-crm
git branch --set-upstream-to=origin/upc-crm
```

Then run the build/apply block below.

### Every deploy (server)

```bash
cd ~/<bench>/apps/crm
git fetch origin
git reset --hard origin/upc-crm     # match the fork exactly
cd ~/<bench>
bench build --app crm
bench --site upc.petalkube.com migrate      # only if DB schema changed
bench --site upc.petalkube.com clear-cache
sudo supervisorctl restart all              # or: bench restart
```

Why `reset --hard` and not `git pull`: our dev flow rebases + force-pushes, so
the branch history is rewritten each update and a plain `pull` would fail or
create a merge. The server holds **no local commits** (deploy-only), so
`reset --hard origin/upc-crm` is the clean, correct way to make it
identical to the fork.

**Golden rule:** never edit or commit on the server. All changes flow in from
the fork. That keeps `reset --hard` always safe.

---

## Quick reference

| Task | Where | Command |
|------|-------|---------|
| Get frappe updates | dev | `git fetch upstream && git rebase upstream/develop` |
| Publish our changes | dev | `git push --force-with-lease origin upc-crm` |
| Rebuild frontend | dev/server | `bench build --app crm` |
| Deploy | server | `git fetch origin && git reset --hard origin/upc-crm` |
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
