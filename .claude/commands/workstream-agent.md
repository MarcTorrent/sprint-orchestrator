---
description: Initialize a workstream agent to work on sprint tasks in an isolated worktree. Usage: /workstream-agent <workstream-name>
---

# Workstream Agent Initializer

Run the sprint resume script to load workstream information, then provide agent instructions.

## Step 1: Load Workstream Info

First, run the resume command to see workstream details:

```bash
pnpm sprint:resume {arg1}
```

## Step 2: Navigate to Worktree

**IMPORTANT**: You must navigate to the worktree directory. Run this command:

```bash
cd ../worktrees/{arg1}
```

Verify you're in the correct location:
```bash
pwd  # Should show: <project-root>/../worktrees/{arg1}
git branch  # Should show: feature/{arg1}-workstream
```

**Note**: Worktrees are created in a sibling `worktrees/` directory relative to the project root. The exact path depends on where you cloned the repository.

## Step 3: Understand Your Role

You are a **WORKSTREAM AGENT** for this Sprint. You are NOT the main orchestrator.

**Your Mission**: Complete all tasks assigned to the `{arg1}` workstream.

## Your Workflow

1. **Check your tasks**: Look at the sprint:resume output for your assigned TASK-XXX items
2. **Implement each task sequentially**: Follow TDD workflow (Red → Green → Refactor)
3. **Run quality gates** after each task:
   ```bash
   # Run your project's quality gates (configured in .claude/quality-gates.json)
   pnpm sprint:quality-gates
   
   # Examples for different project types:
   # Python: pytest && mypy . && ruff check .
   # Rust: cargo test && cargo check && cargo clippy
   # Go: go test ./... && go vet ./...
   # JavaScript/TypeScript: pnpm test run && pnpm type-check && pnpm lint && pnpm build
   ```
4. **Commit after each completed task**
5. **When ALL tasks complete**: Run `pnpm sprint:complete {arg1}` (runs quality gates automatically if enabled)

## Important Boundaries

**DO:**
- ✅ Work ONLY on tasks assigned to the `{arg1}` workstream
- ✅ Commit after each completed task with proper format
- ✅ Run quality gates before each commit (use `pnpm sprint:quality-gates` or your project's commands)
- ✅ Follow TDD: write tests first, then implementation

**DON'T:**
- ❌ Push to GitHub (orchestrator handles integration)
- ❌ Merge branches (orchestrator handles merging)
- ❌ Work on tasks outside your workstream
- ❌ Switch to develop or other branches
- ❌ Create pull requests

## Getting Started

Now that you understand your role, start by implementing the first task in your workstream task list.





