# Sprint Orchestrator Framework - Claude Code Integration

**Framework documentation for using Sprint Orchestrator**

> **Note**: This is framework documentation, not a template. When you install this framework in your project, `install.js` will create a project-specific `CLAUDE.md` template with your project name, current sprint pointers, and framework references. This file documents the framework itself.

---

## 🎯 Framework Quick Start

This section documents the framework commands. Projects using this framework will have their own `CLAUDE.md` with project-specific Quick Start.

### `/orchestrator` Command
**Usage**: `/orchestrator`
**Purpose**: Initialize as the Sprint Orchestrator to coordinate multiple workstreams
**See**: [Sprint Workstreams Workflow](./.claude/workflow/sprint-workstreams.md) | [Orchestrator Command](./.claude/commands/orchestrator.md)

### `/workstream-agent` Command
**Usage**: `/workstream-agent <workstream-name>`
**Purpose**: Initialize as a Workstream Agent to work on specific tasks
**See**: [Sprint Workstreams Workflow](./.claude/workflow/sprint-workstreams.md) | [Workstream Agent Command](./.claude/commands/workstream-agent.md)

### `/generate-sprint` Command
**Usage**: `/generate-sprint [--max-story-points=40] [--docs="docs/,README.md"]`
**Purpose**: Generate sprint backlog files from project documentation
**See**: [Generate Sprint Command](./.claude/commands/generate-sprint.md)

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

**This file is framework documentation.** When you install this framework in your project:

The `install.js` script automatically creates a **project-specific `CLAUDE.md`** (different from this framework documentation file):

1. **If `CLAUDE.md` doesn't exist in your project**: Creates a project template with:
   - Your project name as title
   - Current Sprint section (for project-specific sprint pointers)
   - Quick Start section (project-specific, referencing framework commands)
   - Framework reference section

2. **If `CLAUDE.md` already exists in your project**: Appends framework reference section (if not already present)

3. **Sets up symlinks**: Creates symlinks to workflow docs in `.claude/workflow/`

4. **Configures commands**: Symlinks Claude commands to `.claude/commands/`

**Your project's `CLAUDE.md`** will be different from this framework documentation - it will have your project name, current sprint information, and point to this framework documentation.

See [Integration Guide](./docs/integration-guide.md) for complete setup instructions.
