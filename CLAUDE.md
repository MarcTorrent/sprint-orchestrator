# Sprint Orchestrator Framework - Claude Code Integration

Entry point for Claude Code when working with the Sprint Orchestrator framework.

---

## 🎯 Quick Start by Scenario

### Starting Sprint Orchestrator Mode
**Just say**: `/orchestrator`
**What it does**: Initializes you as the Sprint Orchestrator to coordinate multiple workstreams
**See**: [Sprint Workstreams Workflow](./.claude/workflow/sprint-workstreams.md#role-initialization) | [Orchestrator Command](./.claude/commands/orchestrator.md)

### Starting Workstream Agent Mode
**Just say**: `/workstream-agent <workstream-name>`
**What it does**: Initializes you as a Workstream Agent to work on specific tasks
**See**: [Sprint Workstreams Workflow](./.claude/workflow/sprint-workstreams.md#role-initialization) | [Workstream Agent Command](./.claude/commands/workstream-agent.md)

**Manual steps if needed**:
1. Check: Sprint status in `.claude/sprint-config.json`
2. Review: [Sprint Status Management](./.claude/workflow/sprint-status-management.md)
3. See: [Development Best Practices](./.claude/workflow/sprint-workstreams.md#development-best-practices) for TDD and quality gates

---

## 📚 Essential Documentation

### Sprint Orchestration
- **[Sprint Workstreams Workflow](./.claude/workflow/sprint-workstreams.md)** - Complete workflow guide (includes TDD and quality gates)
- **[Sprint Status Management](./.claude/workflow/sprint-status-management.md)** - Status tracking

### System Validation
- **[System Evaluation](./docs/evaluation.md)** - Complete test results ✅ **100% Test Success Rate**
- **[Cleanup Documentation](./docs/cleanup.md)** - Environment cleanup and maintenance

### Templates
- **[Sprint Template](./templates/sprint-template.md)** - Example sprint backlog structure

---

## ⚡ Sprint Commands

```bash
# Sprint Analysis and Setup
pnpm sprint:analyze <sprint-file>           # Analyze sprint for workstreams
pnpm sprint:create-workstreams <sprint-file> # Create worktrees and branches
pnpm sprint:orchestrate                      # Show orchestrator dashboard

# Workstream Management
pnpm sprint:resume <workstream-name>         # Resume work on workstream
pnpm sprint:complete <workstream-name>       # Mark workstream complete
pnpm sprint:status                           # Show all workstream status

# Integration
pnpm sprint:push <workstream-name>           # Push workstream to GitHub
pnpm sprint:sync-all                         # Sync all workstreams with develop

# Cleanup
pnpm sprint:cleanup                          # Clean up after sprint completion
pnpm sprint:cleanup-all                      # Complete cleanup for testing
```

---

## 🎯 Framework Overview

**Sprint Orchestrator** enables parallel development workflows using git worktrees and multi-agent coordination.

**Key Features**:
- ✅ Parallel development with isolated worktrees
- ✅ Multi-agent coordination (orchestrator + workstream agents)
- ✅ Sequential integration to main branch
- ✅ Built-in quality gates
- ✅ Status tracking and cleanup automation

**Architecture**:
```
Main Repository
├── sprint-orchestrator/          (this framework as submodule)
└── .claude/
    ├── backlog/                  (sprint definitions)
    ├── commands/                 (Claude commands)
    └── sprint-config.json        (runtime state)

Sibling Directory
└── ../worktrees/                 (created automatically)
    ├── workstream-1/
    ├── workstream-2/
    └── workstream-3/
```

---

## 📋 Using Sprint Templates

### Creating a Sprint Backlog

1. Copy the template:
   ```bash
   cp sprint-orchestrator/templates/sprint-template.md .claude/backlog/sprint-X-<name>.md
   ```

2. Edit the sprint file with your workstreams:
   ```markdown
   # Sprint X: <Sprint Name>

   ## Workstreams

   ### Workstream 1: <workstream-name>
   **Tasks**: TASK-101, TASK-102
   **Dependencies**: None
   ```

3. Analyze and create workstreams:
   ```bash
   pnpm sprint:analyze .claude/backlog/sprint-X-<name>.md
   pnpm sprint:create-workstreams .claude/backlog/sprint-X-<name>.md
   ```

---

## 🎭 Role-Based Usage

### As Orchestrator
**Responsibilities**:
- ✅ Monitor progress across all workstreams
- ✅ Verify completed workstreams
- ✅ Run quality gates on completed workstreams
- ✅ Push workstreams to GitHub sequentially
- ✅ Sync all workstreams after each merge
- ✅ Handle merge conflicts
- ✅ Clean up worktrees when sprint complete
- ❌ DON'T work on individual tasks

### As Workstream Agent
**Responsibilities**:
- ✅ Work ONLY on tasks assigned to your workstream
- ✅ Implement tasks sequentially (TDD workflow)
- ✅ Run quality gates before each commit
- ✅ Commit after each completed task
- ✅ Run `pnpm sprint:complete <name>` when ALL tasks done
- ❌ DON'T push to GitHub (orchestrator does this)
- ❌ DON'T merge branches
- ❌ DON'T create PRs

---

## 📞 Getting Help

- **Framework Documentation**: Check `.claude/workflow/` for detailed guides
- **Integration Guide**: See `docs/integration-guide.md` for setup instructions
- **System Evaluation**: See `docs/evaluation.md` for testing validation
- **Issues**: Report framework issues to the repository maintainer

---

## 🔗 Related Files

- [README.md](./README.md) - Framework overview and installation
- [integration-guide.md](./docs/integration-guide.md) - Quick integration steps
