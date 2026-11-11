---
name: git-branch-commit
description: Create a git branch (issue--N/short-description naming), commit changes with a type(issue-N): short-description message, push, and open a GitHub pull request — any one step or the whole flow. Use whenever the user asks to create a branch, start work on a new branch/feature/fix, commit current changes, push, or open a PR/MR — e.g. "/git-branch-commit", "make a branch for this", "commit this", "create a branch and commit", "push it", "open a PR", "push it into an MR", "ship this".
---

# Git Branch + Commit + Pull Request

Helper for the git flow in this repo: a properly-named branch, a good commit, a push, and a pull request. Do only the steps the user asked for. "Open a PR/MR", "ship this" or "the whole flow" means all of them, in order.

## Branch naming convention

`issue--N/short-kebab-description` — the issue ID, a slash, then the description. No type in the branch name.

- `N` is the GitHub issue number. If the user hasn't given one and it isn't clear from context, ask for it; only when the work truly has no issue, use the bare `short-kebab-description`.
- The description is 2-5 words, lowercase, hyphen-separated.

Examples: `issue--23/lesson-audio-controls`, `issue--12/expo-router-entry-crash`, `issue--56/expo-sdk-54-bump`.

Older branches use `issue--N-type/description` — don't copy that form.

## Commit types

The `type` in a commit subject (not in the branch name) is one of:

- `feat` — new feature
- `fix` — bug fix
- `refactor` — code change that neither fixes a bug nor adds a feature
- `chore` — tooling, deps, config, maintenance
- `docs` — documentation only
- `test` — adding or fixing tests
- `perf` — performance improvement
- `style` — formatting only, no logic change

Pick `type` from the nature of the work, not from the user's phrasing.

## Workflow

1. **Check repo state first.** Run `git status` and `git branch --show-current`. If there are uncommitted changes that don't belong to the branch/commit being requested, flag it to the user before doing anything — don't silently carry over or discard unrelated work.
2. **Branch creation** (when requested, or when a commit is requested while on `master`):
   - Confirm the branch name with the user if the issue number or description isn't obvious from context, rather than guessing silently.
   - Create it off the current base branch: `git checkout -b issue--<N>/<description>`.
   - Do not switch branches out from under uncommitted changes that belong to a different task — stash (`git stash -u`) or ask first.
3. **Commit creation** (when requested):
   - Run `git status` and `git diff` (staged + unstaged) to see the full set of changes.
   - Subject format: `type(issue-N): short-description` — e.g. `chore(issue-15): make npm test exit and add timing tests`, `fix(issue-12): stop audio crash on chapter switch`. `type` is from the list above, `N` is the issue ID from the branch name (`issue--15/...` → `issue-15`), and the description is short, lowercase, present/imperative tense, with no trailing period. Only when there is no issue at all, fall back to `type: short-description`. Older commits in `git log` use the scope-less form — don't copy it.
   - Stage specific files by name — never `git add -A` or `git add .` blindly. Leave unrelated untracked files (e.g. `docs/`) out. Warn if anything staged looks like it could be a secret (`.env`, credentials, keys).
   - Below the subject, write a concise 1-2 sentence body focused on *why*, not a restatement of the diff.
   - Use a HEREDOC for the commit message and end it with a `Co-Authored-By` trailer naming the model actually running the session, as given in the session's attribution instructions — e.g. `Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>`. Don't copy a model name from this file.
   - After committing, run `git status` to confirm success. If a pre-commit hook fails, fix the issue and create a **new** commit — never `--amend` to paper over a failed hook, and never pass `--no-verify`.
4. **Push** (only when the user asks to push or to open a PR/MR):
   - Before pushing, run `npm run lint`, `npm test` and `npx tsc --noEmit`. If any fails, stop and report it instead of pushing.
   - `git push -u origin <branch>`. Never push directly to `master`.
5. **Pull request** (only when the user asks for a PR/MR):
   - Check whether one already exists for the branch (`gh pr view`). If it does, the push has updated it — report its URL instead of creating another.
   - Otherwise `gh pr create --base master`, with the title equal to the commit subject (or a `type(issue-N): short-description` covering all commits on the branch) and the body passed via `--body-file -` from a HEREDOC.
   - Body structure, matching earlier PRs in this repo (see `gh pr view 32`):
     - `Closes #N` on the first line when the branch has an issue ID
     - a short paragraph on the problem and why the change is needed
     - `## Changes` — what changed, grouped by area
     - `## Ticket tasks` — the issue's checklist, ticked or not, with anything not done called out
     - `## Verification` — what was actually run and what it does *not* prove (e.g. not tested on a device)
     - `## Notes for the reviewer` — known gaps, out-of-scope findings, follow-ups
     - the attribution line from the session's instructions as the last line
   - After creating it, wait for CI with `gh pr checks <number> --watch` and report the result. If a check fails, read the log (`gh run view <run-id> --log-failed`), and report what failed — fix it with a new commit only if the cause is within the scope of the PR.
   - Finish by giving the user the PR URL and the CI result.

## Guardrails (inherited from global git safety rules)

- Only commit, push or open a PR when the user actually asked for that step in this invocation — don't commit just because a branch was created, and don't push just because a commit was made.
- Never merge the PR; merging is the user's call.
- Never force-push, `reset --hard`, or otherwise discard work without explicit confirmation.
- Never skip hooks or bypass signing unless explicitly told to.
- Prefer a new commit over amending, unless the user explicitly asks for `--amend`.
