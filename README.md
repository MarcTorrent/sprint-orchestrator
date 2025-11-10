# Sprint Orchestrator Framework

A git-worktree-based sprint orchestration framework for managing parallel development workflows with multi-agent coordination.

## Overview

This framework enables true parallel development by:
- Creating isolated worktrees for each workstream
- Managing multiple agents working simultaneously
- Orchestrating sequential integration to a main branch
- Providing tools for status tracking and cleanup

## What's Included

### Scripts (`/scripts`)
- `sprint-orchestrate.js` - Main orchestrator entry point
- `sprint-analyze.js` - Analyze sprint backlog for workstreams
- `sprint-create-workstreams.js` - Create worktrees and branches
- `sprint-resume.js` - Resume work on a specific workstream
- `sprint-complete.js` - Mark workstream as complete
- `sprint-status.js` - Show workstream status
- `sprint-push.js` - Push workstream to remote
- `sprint-sync-all.js` - Sync all workstreams with develop
- `sprint-cleanup.js` - Clean up after sprint completion
- `sprint-cleanup-all.js` - Complete cleanup for testing

### Claude Commands (`/.claude/commands`)
- `orchestrator.md` - Initialize as orchestrator
- `workstream-agent.md` - Initialize as workstream agent

### Workflow Documentation (`/.claude/workflow`)
- `sprint-workstreams.md` - Complete sprint workflow guide
- `development-workflow.md` - Quality gates and TDD cycle
- `git-workflow.md` - Version control guidelines
- `sprint-status-management.md` - Status tracking procedures

### Templates (`/templates`)
- `sprint-template.md` - Example sprint backlog structure

### Documentation (`/docs`)
- `EVALUATION.md` - System evaluation and testing results
- `CLEANUP.md` - Cleanup procedures

### Entry Point
- `CLAUDE.md` - Claude Code integration guide

## Installation as Git Submodule

### Adding to Your Project

```bash
# Add as submodule in your project root
git submodule add <repo-url> sprint-orchestrator
git submodule update --init --recursive
```

### Automated Installation (Recommended)

Run the installation script to automatically integrate the framework:

```bash
node sprint-orchestrator/install.js
```

**What it does**:
- ✅ Creates `.claude/` directory structure
- ✅ Symlinks Claude commands to `.claude/commands/`
- ✅ Updates `package.json` with sprint scripts
- ✅ Copies sprint template to `.claude/backlog/`
- ✅ Updates `.gitignore` with framework exclusions
- ✅ Creates `.claude/README.md` with usage guide

**Error handling**: The script will stop and provide clear error messages if it detects conflicts (e.g., existing scripts with same names).

### Manual Integration (Alternative)

If you prefer manual setup, add these scripts to your project's `package.json`:

```json
{
  "scripts": {
    "sprint:orchestrate": "node sprint-orchestrator/scripts/sprint-orchestrate.js",
    "sprint:analyze": "node sprint-orchestrator/scripts/sprint-analyze.js",
    "sprint:create-workstreams": "node sprint-orchestrator/scripts/sprint-create-workstreams.js",
    "sprint:resume": "node sprint-orchestrator/scripts/sprint-resume.js",
    "sprint:complete": "node sprint-orchestrator/scripts/sprint-complete.js",
    "sprint:status": "node sprint-orchestrator/scripts/sprint-status.js",
    "sprint:sync-all": "node sprint-orchestrator/scripts/sprint-sync-all.js",
    "sprint:push": "node sprint-orchestrator/scripts/sprint-push.js",
    "sprint:cleanup": "node sprint-orchestrator/scripts/sprint-cleanup.js",
    "sprint:cleanup-all": "node sprint-orchestrator/scripts/sprint-cleanup-all.js"
  }
}
```

### Uninstallation

To remove the framework integration:

```bash
node sprint-orchestrator/uninstall.js

# To keep your sprint data
node sprint-orchestrator/uninstall.js --keep-data
```

## Quick Start

### 1. Install Framework

```bash
# Add as submodule
git submodule add <repo-url> sprint-orchestrator

# Run automated installation
node sprint-orchestrator/install.js
```

### 2. Generate Sprint from Documentation (Option A)

Automatically generate a sprint from your project documentation:

```bash
pnpm sprint:generate --docs docs/ --output .claude/backlog/sprint-1-features.md --name "Feature Implementation"
```

The generator will:
- Scan markdown files for TODO items and feature lists
- Extract tasks and group them into logical workstreams
- Generate a sprint file ready for orchestration

### 3. Create Sprint Manually (Option B)

Create a sprint backlog file in `.claude/backlog/sprint-X-<name>.md` with this structure:

```markdown
# Sprint X: <Sprint Name>

## Workstreams

### Workstream 1: <workstream-name>
**Tasks**: TASK-101, TASK-102
**Dependencies**: None
```

### 4. Analyze Sprint

```bash
pnpm sprint:analyze .claude/backlog/sprint-1-features.md
```

### 5. Create Workstreams

```bash
pnpm sprint:create-workstreams .claude/backlog/sprint-1-features.md
```

### 6. Start Orchestrator

```bash
pnpm sprint:orchestrate
```

Or use the Claude command:
```
/orchestrator
```

### 7. Start Workstream Agents

In separate chat instances or subagents:
```
/workstream-agent <workstream-name>
```

## Usage

### For Orchestrators
- Monitor progress across workstreams
- Push completed workstreams sequentially
- Sync workstreams after merges
- Handle merge conflicts
- Clean up when sprint is complete

### For Workstream Agents
- Work only on assigned tasks
- Implement tasks sequentially (TDD workflow)
- Run quality gates before commits
- Report completion to orchestrator
- Don't push to GitHub (orchestrator handles this)

## Directory Structure

When using this framework, your workspace will look like:

```
your-project/
├── sprint-orchestrator/          (git submodule - this framework)
│   ├── scripts/
│   ├── .claude/
│   └── docs/
├── .claude/
│   ├── backlog/
│   │   └── sprint-X-<name>.md
│   ├── commands/                 (copy or link from sprint-orchestrator)
│   │   ├── orchestrator.md
│   │   └── workstream-agent.md
│   └── sprint-config.json        (generated at runtime)
└── ...

../worktrees/                     (sibling directory, created automatically)
├── <workstream-1>/
├── <workstream-2>/
└── <workstream-3>/
```

## Requirements

- Node.js (no external dependencies)
- Git with worktree support
- Git repository with a main branch (e.g., `develop` or `main`)

## System Validation

This framework has been thoroughly tested with:
- 12 tests executed
- 100% test success rate
- Production-ready status

See `docs/EVALUATION.md` for complete test results.

## Documentation

- **Complete Workflow**: `.claude/workflow/sprint-workstreams.md`
- **System Evaluation**: `docs/EVALUATION.md`
- **Cleanup Procedures**: `docs/CLEANUP.md`

## License

MIT

## Author

Marc Torrent Vernetta
