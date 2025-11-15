# Sprint Orchestrator Framework - Claude Code Integration

**Framework documentation for using Sprint Orchestrator**

> **Note**: This is framework documentation. Projects using this framework should create their own `CLAUDE.md` with project-specific information and current sprint pointers.

---

## 🎯 Quick Start

### Starting Sprint Orchestrator Mode
**Just say**: `/orchestrator`
**What it does**: Initializes you as the Sprint Orchestrator to coordinate multiple workstreams
**See**: [Sprint Workstreams Workflow](./.claude/workflow/sprint-workstreams.md) | [Orchestrator Command](./.claude/commands/orchestrator.md)

### Starting Workstream Agent Mode
**Just say**: `/workstream-agent <workstream-name>`
**What it does**: Initializes you as a Workstream Agent to work on specific tasks
**See**: [Sprint Workstreams Workflow](./.claude/workflow/sprint-workstreams.md) | [Workstream Agent Command](./.claude/commands/workstream-agent.md)

---

## 📚 Documentation

### Essential Guides
- **[Sprint Workstreams Workflow](./.claude/workflow/sprint-workstreams.md)** - Complete workflow guide (includes TDD and quality gates)
- **[Sprint Status Management](./.claude/workflow/sprint-status-management.md)** - Status tracking procedures
- **[Integration Guide](./docs/integration-guide.md)** - Setup and integration instructions

### Reference
- **[README.md](./README.md)** - Framework overview and installation
- **[System Evaluation](./docs/evaluation.md)** - Test results and validation
- **[Cleanup Documentation](./docs/cleanup.md)** - Environment cleanup and maintenance
- **[Sprint Template](./templates/sprint-template.md)** - Example sprint backlog structure

### Commands
- **[Orchestrator Command](./.claude/commands/orchestrator.md)** - `/orchestrator` command details
- **[Workstream Agent Command](./.claude/commands/workstream-agent.md)** - `/workstream-agent` command details

---

## 🔗 For Projects Using This Framework

When installing this framework as a submodule, you can:

1. **Reference this file**: `sprint-orchestrator/CLAUDE.md` (framework documentation)
2. **Create your own CLAUDE.md**: With project-specific information and current sprint pointers
3. **Access workflow docs**: Via symlinks in `.claude/workflow/` (created during installation)

See [Integration Guide](./docs/integration-guide.md) for complete setup instructions.
