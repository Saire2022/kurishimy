---
name: git-branch-commit
description: Create a new git branch (type/short-description naming, e.g. feat/xxx, fix/xxx) and/or commit staged changes with a well-formed conventional-commit message. Use whenever the user asks to create a branch, start work on a new branch/feature/fix, or wants to commit current changes — e.g. "/git-branch-commit", "make a branch for this", "commit this", "create a branch and commit".
---

# Git Branch + Commit

Helper for two related git actions: creating a properly-named branch, and writing a good commit message for staged work. Either can be used alone or together, depending on what the user asks for.

## Branch naming convention

`type/short-kebab-description`, where `type` is one of:

- `feat` — new feature
- `fix` — bug fix
- `refactor` — code change that neither fixes a bug nor adds a feature
- `chore` — tooling, deps, config, maintenance
- `docs` — documentation only
- `test` — adding or fixing tests
- `perf` — performance improvement
- `style` — formatting only, no logic change

Pick `type` from the nature of the work about to happen (or already done), not from the user's phrasing. The description is 2-5 words, lowercase, hyphen-separated, no ticket numbers unless the user gives one (in which case prefix it: `fix/123-audio-crash`).

Examples: `feat/lesson-audio-controls`, `fix/expo-router-entry-crash`, `chore/expo-sdk-54-bump`.

## Workflow

1. **Check repo state first.** Run `git status` and `git branch --show-current`. If there are uncommitted changes that don't belong to the branch/commit being requested, flag it to the user before doing anything — don't silently carry over or discard unrelated work.
2. **Branch creation** (when requested):
   - Confirm the branch name with the user if the type/description isn't obvious from context, rather than guessing silently.
   - Create it off the current base branch: `git checkout -b <type>/<description>`.
   - Do not switch branches out from under uncommitted changes that belong to a different task — stash (`git stash -u`) or ask first.
3. **Commit creation** (when requested):
   - Run `git status` and `git diff` (staged + unstaged) to see the full set of changes, and `git log --oneline -10` to match this repo's existing message style (this repo uses short, present/imperative-tense conventional-commit-style subjects, e.g. `feat: ...`, `refactor: ...`).
   - Stage specific files by name — never `git add -A` or `git add .` blindly. Warn if anything staged looks like it could be a secret (`.env`, credentials, keys).
   - Write a concise 1-2 sentence commit message focused on *why*, not a restatement of the diff. Match the repo's `type: summary` subject style.
   - Use a HEREDOC for the commit message and end it with:
     ```
     Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
     ```
   - After committing, run `git status` to confirm success. If a pre-commit hook fails, fix the issue and create a **new** commit — never `--amend` to paper over a failed hook, and never pass `--no-verify`.
4. **Never push** as part of this skill unless the user explicitly asks to.

## Guardrails (inherited from global git safety rules)

- Only commit when the user actually asked for a commit in this invocation — don't commit just because a branch was created.
- Never force-push, `reset --hard`, or otherwise discard work without explicit confirmation.
- Never skip hooks or bypass signing unless explicitly told to.
- Prefer a new commit over amending, unless the user explicitly asks for `--amend`.
