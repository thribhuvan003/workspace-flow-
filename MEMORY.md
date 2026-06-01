# WorkspaceFlow Memory

## 2026-06-01 - Production foundation pass

### Decided
- Start with a foundation pass before broad visual redesign.
- Keep changes surgical: lint/build blockers, project process files, and obvious real-time event mismatches.
- Use repo-local Git identity `thribhuvan003 <thribhuvan003@gmail.com>` for commits.

### Why
- `npm run build` already passes, but `npm run lint` has concrete failures across key app surfaces.
- A clean lint/build baseline gives safer ground for later UI polish and interaction work.
- The project instructions require `MEMORY.md` for significant decisions.

### Rejected
- Rejected a full one-shot redesign because it would create a large, hard-to-review diff before the existing quality gates are clean.
- Rejected starting a new project because WorkspaceFlow is already a strong fresher-resume project if finished and deployed.

## 2026-06-01 - Auth secret environment name

### Decided
- Use `AUTH_SECRET` in setup docs and keep compatibility with `NEXTAUTH_SECRET` in `auth.config.ts`.

### Why
- Auth.js v5 expects a configured secret and the rendered smoke test showed `/api/auth/session` returning 500 when no secret was present.
- Supporting the old `NEXTAUTH_SECRET` name avoids breaking existing local setups that followed earlier README instructions.

### Rejected
- Rejected hardcoding a development fallback secret because that can hide misconfigured environments.

## 2026-06-01 - README and contributor ownership cleanup

### Decided
- Rewrite README in a clear, ASCII-only, portfolio-friendly format.
- Keep the project positioned as one polished full-stack fresher portfolio project rather than starting a new project.
- Rewrite git author/committer history to `thribhuvan003 <thribhuvan003@gmail.com>` so GitHub contributors show only the owner account.

### Why
- The existing README had mojibake characters and did not explain the architecture clearly enough for recruiters or reviewers.
- GitHub contributors currently show both `thribhuvan003` and `nothing0-coder` because older commits used an email mapped to another account.
- Normal commits cannot change GitHub contributor history; the raw commit authors must be corrected.

### Rejected
- Rejected only updating the current Git config because that would not fix historical contributor avatars.
