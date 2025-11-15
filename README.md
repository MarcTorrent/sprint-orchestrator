# Sprint Orchestrator Framework

A git-worktree-based sprint orchestration framework for managing parallel development workflows with multi-agent coordination.

## Overview

This framework enables true parallel development by:
- Creating isolated worktrees for each workstream
- Managing multiple agents working simultaneously
- Orchestrating sequential integration to a main branch
- Providing tools for status tracking and cleanup

## Quick Start

```bash
# 1. Add as git submodule
git submodule add <repo-url> sprint-orchestrator
git submodule update --init --recursive

# 2. Install framework
node sprint-orchestrator/install.js

# 3. Start orchestrating
pnpm sprint:analyze .claude/backlog/sprint-1.md
pnpm sprint:create-workstreams .claude/backlog/sprint-1.md
pnpm sprint:orchestrate
```

**See [Integration Guide](docs/integration-guide.md) for detailed setup instructions.**

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
- `generate-sprint.js` - Generate sprint from documentation

### Claude Commands (`/.claude/commands`)
- `orchestrator.md` - Initialize as orchestrator
- `workstream-agent.md` - Initialize as workstream agent

### Workflow Documentation (`/.claude/workflow`)
- `sprint-workstreams.md` - Complete sprint workflow guide (includes TDD and quality gates)
- `sprint-status-management.md` - Status tracking procedures

### Templates (`/templates`)
- `sprint-template.md` - Example sprint backlog structure

## Documentation

### Getting Started
- **[Integration Guide](docs/integration-guide.md)** - Complete setup and integration instructions
- **[CLAUDE.md](CLAUDE.md)** - Claude Code integration guide

### Reference Documentation
- **[System Evaluation](docs/evaluation.md)** - Test results and validation
- **[Cleanup Procedures](docs/cleanup.md)** - Environment cleanup and maintenance

### Workflow Guides
- `.claude/workflow/sprint-workstreams.md` - Complete workflow (includes TDD and quality gates)
- `.claude/workflow/sprint-status-management.md` - Status tracking

## Requirements

- Node.js v14+ (no external dependencies)
- Git with worktree support
- Git repository with a main branch (e.g., `develop` or `main`)

## System Validation

This framework has been thoroughly tested with:
- 12 tests executed
- 100% test success rate
- Production-ready status

See [docs/evaluation.md](docs/evaluation.md) for complete test results.

## License

MIT

## Author

Marc Torrent Vernetta
