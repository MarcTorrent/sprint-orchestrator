# Sprint Status Management

This document explains how to manage sprint and task status across the project.

## Single Source of Truth

**Sprint backlog files** (`.claude/backlog/sprint-X.md`) are the ONLY source of truth for:
- Task status (TODO, In Progress, Complete)
- Task dependencies
- Sprint progress
- Phase tracking

**CLAUDE.md** only points to the current sprint - it does NOT duplicate status.

---

## Updating Task Status

### When Claude Completes a Task

1. **Update sprint backlog file:**
   ```markdown
   # Before
   - [ ] TASK-132: Service Pages Overview Content (3 SP)
     - Status: In Progress
     - Phase: 2 (Content & Functionality)

   # After
   - [x] TASK-132: Service Pages Overview Content (3 SP)
     - Status: ✅ Complete (2025-10-24)
     - Phase: 2 (Content & Functionality)
     - Notes: All sub-pages implemented with translations
   ```

2. **Commit sprint status WITH task code:**
```bash
git add .claude/backlog/sprint-X-<name>.md
git add <code-changes>
git commit -m "feat: description (TASK-XXX)

- Brief completion note
- All acceptance criteria met
- Updated sprint backlog status

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>"
```

3. **Never update CLAUDE.md** - it only points to current sprint

**IMPORTANT**: Sprint backlog updates are committed WITH task code, not separately.

---

## When Previous Sprint Completes

When all tasks in a sprint are complete, the user updates the sprint pointer in CLAUDE.md:

### Update CLAUDE.md Pointer

Edit `CLAUDE.md` and update the current sprint reference:

```markdown
## 📋 Current Sprint

**Sprint 2**: [Blog System](./.claude/backlog/sprint-2-blog.md) (In Progress)

👉 **Always check sprint backlog for current task status**

**Quick status check**: `grep "Status:" .claude/backlog/sprint-2-blog.md`
```

**Note**:
- Sprint files are pre-created in `.claude/backlog/` directory
- Completed sprint files remain in `.claude/backlog/` for reference
- Only the pointer in CLAUDE.md changes between sprints

---

## Quick Status Commands

```bash
# View current sprint status summary
cat .claude/backlog/sprint-X-<name>.md | grep "Status:"

# List completed tasks
grep "Status: ✅" .claude/backlog/sprint-X-<name>.md

# List remaining tasks
grep "Status: TODO\|Status: In Progress" .claude/backlog/sprint-X-<name>.md

# Find next task to work on
grep -A 2 "Status: TODO" .claude/backlog/sprint-X-<name>.md | head -3

# Count total tasks
grep -c "TASK-" .claude/backlog/sprint-X-<name>.md

# Calculate completion percentage
echo "scale=2; $(grep -c "Status: ✅" .claude/backlog/sprint-X-<name>.md) / $(grep -c "TASK-" .claude/backlog/sprint-X-<name>.md) * 100" | bc
```

---

## Sprint File Format

Every sprint file MUST have a header with:

```markdown
# Sprint X: [Name]

**Status**: In Progress | Complete | Archived
**Start Date**: YYYY-MM-DD
**Target End**: YYYY-MM-DD
**Actual End**: YYYY-MM-DD (if complete)
**Progress**: XX/YY tasks complete (ZZ%)

## Phase 1: [Name]

### Tasks

- [ ] TASK-XXX: [Description] (X SP)
  - Status: TODO | In Progress | ✅ Complete (YYYY-MM-DD)
  - Phase: 1 ([Phase Name])
  - Dependencies: TASK-YYY (if any)
  - Notes: (optional completion notes)

## Phase 2: [Name]
...
```

This format makes it easy to:
- Extract status programmatically if needed later
- Parse with grep commands
- Generate reports
- Track progress visually

---

## Task Status Lifecycle

```
TODO → In Progress → ✅ Complete
```

**TODO**: Task not started
- Checkbox: `- [ ]`
- Status line: `Status: TODO`

**In Progress**: Claude is actively working on this task
- Checkbox: `- [ ]` (unchanged)
- Status line: `Status: In Progress`

**Complete**: Task finished, committed, and merged
- Checkbox: `- [x]`
- Status line: `Status: ✅ Complete (YYYY-MM-DD)`
- Add completion notes if relevant

---

## Best Practices

### ✅ DO

- Update sprint status in the same commit as task code
- Add completion date when marking tasks complete
- Add brief notes for complex tasks
- Keep sprint file header updated with progress
- Archive completed sprints to keep backlog clean

### ❌ DON'T

- Don't update status in separate commit from code
- Don't duplicate status in CLAUDE.md
- Don't mark task complete until fully merged to develop
- Don't forget to update checkbox AND status line
- Don't delete completed sprints (archive them instead)

---

## Example Workflow

**Starting TASK-133:**

1. Claude reads sprint file, finds next TODO task
2. Updates status to "In Progress"
3. Commits: `git commit -m "chore: start TASK-133"`
4. Implements feature with multiple commits
5. When complete, updates status to "✅ Complete (date)"
6. Final commit includes sprint file update

**Complete commit:**
```bash
git add .claude/backlog/sprint-X-<name>.md
git add src/components/<ComponentName>.tsx
git add src/components/<ComponentName>.test.tsx
git commit -m "feat: add <feature description> (TASK-XXX)

- Implemented <component description>
- Added <additional features>
- 100% test coverage
- All acceptance criteria met
- Updated sprint backlog status

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Troubleshooting

**Q: Sprint file and CLAUDE.md are out of sync**
A: CLAUDE.md should only point to current sprint, not duplicate status. Check if you're looking at the right sprint file.

**Q: Can't find next task to work on**
A: Run: `grep -A 2 "Status: TODO" .claude/backlog/sprint-X-<name>.md | head -3`

**Q: Forgot to update sprint file before committing**
A: Amend your commit:
```bash
# Update sprint file
vim .claude/backlog/sprint-X-<name>.md
# Amend commit
git add .claude/backlog/sprint-X-<name>.md
git commit --amend --no-edit
```

**Q: Want to auto-generate progress percentage**
A: Add to sprint file header:
```bash
echo "Progress: $(grep -c "Status: ✅" .claude/backlog/sprint-X-<name>.md)/$(grep -c "TASK-" .claude/backlog/sprint-X-<name>.md) tasks complete"
```

---

**This process ensures single source of truth and prevents status drift between files.**
