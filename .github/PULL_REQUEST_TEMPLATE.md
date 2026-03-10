## PR Type

_Select one (or more) and delete the rest:_

- [ ] Feature (lead-agent)
- [ ] UI/UX (ui-ux-agent)
- [ ] Game Design (game-design-agent)
- [ ] Tests (test-agent)
- [ ] Security review/hardening (security-agent)
- [ ] Refactor (refactor-agent)
- [ ] Docs/Spec only

## Summary

-

## Linked task

- TASK-___

## Changes

-

## How to test

```bash
./scripts/ci-check
# plus any task-specific commands
```

## Checklist

### Scope & hygiene

- [ ] PR matches the linked task scope (no surprise refactors)
- [ ] Diff is reasonably small (or split planned)
- [ ] No new dependencies (or explicitly approved)

### Quality

- [ ] New behavior has tests (or a follow-up test task is created)
- [ ] Bug fixes include regression tests when feasible
- [ ] Error handling and edge cases considered

### Docs / Spec

- [ ] `docs/DEV.md` updated if commands/setup changed
- [ ] Spec / architecture changes are explicit (docs-only PR preferred for non-trivial changes)

### Security & privacy (as applicable)

- [ ] Inputs validated / output escaped where needed
- [ ] No secrets committed
- [ ] Sensitive data handling considered

## Notes for reviewers / Risks / Follow-ups

-
