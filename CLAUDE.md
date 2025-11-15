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
- **[Sprint Template](./templates/sprint-template.md)** - Example sprint backlog structure

### Commands
- **[Orchestrator Command](./.claude/commands/orchestrator.md)** - `/orchestrator` command details (handles workstream assignment)
- **[Workstream Agent Command](./.claude/commands/workstream-agent.md)** - `/workstream-agent` command details
- **[Generate Sprint Command](./.claude/commands/generate-sprint.md)** - `/generate-sprint` command details (intelligent sprint generation)

---

## 🔗 For Projects Using This Framework

When installing this framework as a submodule, the `install.js` script automatically:

1. **Creates or updates CLAUDE.md**: 
   - If `CLAUDE.md` doesn't exist: Creates a project-specific template with framework reference
   - If `CLAUDE.md` exists: Appends framework reference section (if not already present)
2. **Sets up symlinks**: Creates symlinks to workflow docs in `.claude/workflow/` (created during installation)
3. **Configures commands**: Symlinks Claude commands to `.claude/commands/`

**Manual alternative**: You can also manually reference `sprint-orchestrator/CLAUDE.md` and create your own `CLAUDE.md` with project-specific information and current sprint pointers.

See [Integration Guide](./docs/integration-guide.md) for complete setup instructions.
