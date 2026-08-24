---
name: custom-feature-skills
description: Add or change an Esyres feature against MVP epics and stories. Use when implementing a feature, story, or product change, or when the user mentions a new capability, epic, or booking flow.
---

# Custom feature skills

## Instructions

1. Read `.cursor/CONTEXT.md`, then the relevant files in `docs/mvp/` (features, epics, stories, UI goals).
2. Classify the work:
   - **MVP, already scoped** → implement against the story; do not expand.
   - **Phase 2 / explicit non-goal** → stop and confirm with the user before coding.
   - **Not in docs** → write the gap in the reply; do not silently invent product behavior.
3. Keep the booking model: customer picks a **day**; owner proposes the time. Status is `requested → time_proposed → confirmed | declined`.
4. Put customer UX on the narrow surface (discover, profile, request, bookings). Put scheduling tools on the owner panel.
5. Capture trust data if the feature touches requests, visits, or verification. Do not build badge display unless asked.
6. Prefer the smallest change that ships the story. Follow `docs/architecture/` for stack; do not invent a second API style.
7. Auth: guest browse is open. Email+password login. Verified email + phone OTP required to send a request. Owner routes: invite-only, verified email.

## Feature checklist

- [ ] Story/epic cited from `docs/mvp/`
- [ ] Customer vs owner surface respected
- [ ] Status transitions valid
- [ ] Auth: guest browse; email+password; verified email + phone OTP at request submit (not a homepage wall)
- [ ] UI verified in the browser when the change is user-visible

## Examples

- "Add busy-level on the salon day picker" → customer badge only; no slot grid.
- "Let the owner propose a time" → `time_proposed`, drag + tap fallback, customer still confirms.
- "Add salon reviews" → Phase 2; do not implement unless the user overrides.
