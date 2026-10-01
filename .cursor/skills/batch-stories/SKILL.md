---
name: batch-stories
description: Named story set, one grill, one branch, one PR.
disable-model-invocation: true
---

# Batch stories

A named set finishes on one branch and one PR. This file is the procedure. [story-loop](../story-loop/SKILL.md) stays one story and is not run end to end.

## Phrase

`/batch-stories STORY-90 STORY-91` — ids in implement order.

Implement in this chat. Cloud stays on `/story-loop`.

## Set

The set is the ids on the command, in that order. Each id is a file `docs/stories/STORY-xx.md`. The app root has the verify runner named in `.cursor/CONTEXT.md`.

Stop before any question when an id is missing, the count is below two, the phrase is “all stories” or a whole MVP, the worktree is dirty, or an open PR already contains one of the ids. A single id belongs to `/story-loop`.

Done when every id is a real story file, the count is at least two, the worktree is clean, no open PR contains an id, and the verify runner exists — or the stop reason is in chat.

## One grill

Read each story and any existing map or key under `.cursor/loops/`. Ask every currently askable decision in one [grilling](../grilling/SKILL.md) round. Tag each question with its `STORY-xx` and include the recommended answer.

Wait once. That wait is the only human stop before the PR.

Done when that round has answers in chat.

## Assume

Write or update each map and each `.cursor/loops/answer-keys/STORY-xx.md` from the templates in the same turn. The round’s answers are the decisions. A decision still open takes the recommended answer and is marked `assumed` on the map (Decisions so far) and on the key. Compile the key the way story-loop compiles one (a verifier on every product check). Set Branch name to the batch branch, Status to `approved`, and map Status to `compiled`. Replace the key’s per-story PR steps with: commit on the batch branch when verify passes; on the cap, stop that story and leave the PR to this skill.

Done when every named story has an approved key, a compiled map, and an empty Open decisions list.

## Branch

Create `batch/STORY-90-91-92` from the default branch. Ids stay in named order, joined by hyphens. Check that branch out.

Done when it is the current branch.

## Build

For each id, in order, implement against its key. Follow **Implementer instructions** in the key and [custom-feature-skills](../custom-feature-skills/SKILL.md). Verify with the CONTEXT frontend-only classifier, then the matching command set. UI stories follow the playbook **UI ready rule**. Cap is 5–8 implement→verify cycles per story, or the key’s cap. The same failure twice ends that story early.

Commit a story only after its verify exits 0. The message names the story id and title (the `# STORY-xx — …` line). On the cap or a repeated failure, return the worktree to the last commit on this branch, including untracked files that story added, record the id as left out, and start the next id in the same turn.

Done when every named id is either a commit on the branch or recorded left out.

## PR

At least one story commit opens one PR. Title is `Batch` plus the completed ids. Body:

```markdown
## Stories completed

- STORY-90 — <title>
```

When any named id was left out, add one line: `Left out: STORY-92, STORY-93`.

Zero commits leaves no PR. Name the left-out ids in chat.

Remind Bugbot once, then stop for human merge.

Done when the PR URL is in chat, or chat says nothing finished.
