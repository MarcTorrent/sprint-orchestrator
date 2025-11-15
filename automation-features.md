# Automation Features

New automated features added to the Sprint Orchestrator framework.

---

## Automated Installation

### `install.js`

Fully automated integration script that eliminates manual setup.

**Usage**:
```bash
node sprint-orchestrator/install.js
```

**What it does**:
1. ✅ **Verifies** git repository
2. ✅ **Creates** `.claude/` directory structure
3. ✅ **Symlinks** Claude commands to `.claude/commands/`
4. ✅ **Creates or updates** `package.json` with sprint scripts (creates minimal package.json if missing)
5. ✅ **Copies** sprint template to `.claude/backlog/`
6. ✅ **Creates or updates** `.gitignore` with framework exclusions
7. ✅ **Creates** `.claude/README.md` with usage guide

**Error Handling**:
- Stops on conflicts with clear error messages
- Checks for existing scripts in package.json
- Validates symlink targets
- Creates backups before modifying files

**Example Output**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 SPRINT ORCHESTRATOR - INSTALLATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ️  Framework directory: /path/to/sprint-orchestrator
ℹ️  Project root: /path/to/project

📋 Step 1: Verifying git repository...
✅ Git repository detected

📁 Step 2: Creating directory structure...
✅ Created: .claude/
✅ Created: .claude/commands/
✅ Created: .claude/backlog/

🔗 Step 3: Symlinking Claude commands...
✅ Symlinked: .claude/commands/orchestrator.md → ../../sprint-orchestrator/.claude/commands/orchestrator.md
✅ Symlinked: .claude/commands/workstream-agent.md → ../../sprint-orchestrator/.claude/commands/workstream-agent.md

📄 Step 4: Copying sprint template...
✅ Copied: .claude/backlog/sprint-template.md

📦 Step 5: Updating package.json...
ℹ️  Created backup: package.json.backup
✅ Updated package.json with sprint scripts

🙈 Step 6: Updating .gitignore...
✅ Updated .gitignore with Sprint Orchestrator exclusions

📝 Step 7: Creating .claude/README.md...
✅ Created .claude/README.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ INSTALLATION COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Automated Uninstallation

### `uninstall.js`

Cleanly removes framework integration while optionally preserving data.

**Usage**:
```bash
# Remove integration, keep sprint data
node sprint-orchestrator/uninstall.js --keep-data

# Remove integration and all data
node sprint-orchestrator/uninstall.js
```

**What it does**:
1. ✅ **Removes** symlinked commands
2. ✅ **Removes** sprint template (unless --keep-data)
3. ✅ **Removes** sprint scripts from package.json
4. ✅ **Cleans** .gitignore
5. ✅ **Preserves** user data when requested

**Safety Features**:
- Creates package.json backup before modification
- Verifies symlinks before removal
- --keep-data flag to preserve sprint files
- Clear warnings about data removal

---

## Sprint Generator

### `generate-sprint.js`

Automatically generates sprint backlog files from project documentation.

**Usage**:
```bash
node scripts/generate-sprint.js \
  --docs "docs/,README.md" \
  --output .claude/backlog/sprint-1.md \
  --name "Feature Implementation"
```

**Parameters**:
- `--docs`: Comma-separated list of directories/files to analyze (required)
- `--output`: Output sprint file path (required)
- `--name`: Sprint name (optional, derived from filename if not provided)

**What it does**:
1. ✅ **Scans** markdown files recursively
2. ✅ **Extracts** TODO items and feature lists
3. ✅ **Parses** task checkboxes and descriptions
4. ✅ **Groups** tasks into logical workstreams
5. ✅ **Generates** complete sprint file with task IDs

**Extraction Patterns**:
- `- [ ] Task description` (checkboxes)
- `- TODO: Task description`
- `TODO: Task description`
- `FIXME: Task description`
- Feature lists under relevant section headers

**Workstream Categories**:
The generator automatically categorizes tasks into:
- `ui-components` - UI, components, design, layouts
- `backend-api` - API, endpoints, server, database
- `authentication` - Auth, login, security
- `testing` - Tests, specs, coverage
- `documentation` - Docs, guides, comments
- `infrastructure` - Deploy, CI/CD, Docker
- `data-management` - Data, migrations, models
- `performance` - Optimization, caching
- `general` - Uncategorized tasks

**Example Output**:
```markdown
# Sprint: Feature Implementation

> Generated from documentation: docs/FEATURES.md, README.md
> Generated at: 2024-11-10T14:30:00.000Z

## Overview

This sprint was automatically generated from project documentation.
Please review and adjust workstreams, tasks, and dependencies as needed.

## Workstreams

### Workstream 1: ui-components

**Tasks**: TASK-0101, TASK-0102, TASK-0103
**Dependencies**: None (please review and update)

**Task Details**:
- **TASK-0101**: Implement user dashboard layout
  - Source: FEATURES.md (User Interface)
  - Type: feature
- **TASK-0102**: Create responsive navigation menu
  - Source: FEATURES.md (User Interface)
  - Type: todo
- **TASK-0103**: Add dark mode toggle
  - Source: README.md (Features)
  - Type: feature

### Workstream 2: backend-api

**Tasks**: TASK-0201, TASK-0202
**Dependencies**: None (please review and update)

**Task Details**:
- **TASK-0201**: Build REST API endpoints for user management
  - Source: API.md (API Design)
  - Type: feature
- **TASK-0202**: Implement database schema migrations
  - Source: TODO.md (Backend Tasks)
  - Type: todo

---

## Notes

- Review task assignments and workstream organization
- Update dependencies between workstreams
- Adjust task descriptions for clarity
- Add story points or time estimates if needed
```

**Example Generation Process**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SPRINT GENERATOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ️  Documentation source: docs/,README.md
ℹ️  Output file: .claude/backlog/sprint-1-features.md
ℹ️  Sprint name: Feature Implementation

📁 Step 1: Finding documentation files...
✅ Found 5 markdown files in docs/
✅ Added file: README.md
ℹ️  Total files to analyze: 6

🔍 Step 2: Extracting tasks from documentation...
✅ Extracted 8 tasks from FEATURES.md
✅ Extracted 3 tasks from API.md
✅ Extracted 2 tasks from TODO.md
✅ Extracted 5 tasks from README.md
ℹ️  No tasks found in CONTRIBUTING.md
ℹ️  No tasks found in CHANGELOG.md

ℹ️  Total tasks extracted: 18

🎯 Step 3: Grouping tasks into workstreams...
✅ Created 5 workstreams:
ℹ️    - ui-components: 6 tasks
ℹ️    - backend-api: 5 tasks
ℹ️    - authentication: 3 tasks
ℹ️    - testing: 2 tasks
ℹ️    - documentation: 2 tasks

📝 Step 4: Generating sprint file...
ℹ️  Created directory: .claude/backlog
✅ Sprint file generated: .claude/backlog/sprint-1-features.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ GENERATION COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Summary:
  Files analyzed: 6
  Tasks extracted: 18
  Workstreams created: 5
  Output: .claude/backlog/sprint-1-features.md

🎯 Next steps:
  1. Review and edit the generated sprint file
  2. Update task descriptions and dependencies
  3. Analyze the sprint:
     pnpm sprint:analyze .claude/backlog/sprint-1-features.md
  4. Create workstreams:
     pnpm sprint:create-workstreams .claude/backlog/sprint-1-features.md
  5. Start orchestrating:
     pnpm sprint:orchestrate
```

---

## Complete Workflow

### From Zero to Sprint in 3 Commands

```bash
# 1. Install framework
git submodule add <url> sprint-orchestrator
node sprint-orchestrator/install.js

# 2. Generate sprint from docs
pnpm sprint:generate --docs docs/ --output .claude/backlog/sprint-1.md

# 3. Start orchestrating
pnpm sprint:analyze .claude/backlog/sprint-1.md
pnpm sprint:create-workstreams .claude/backlog/sprint-1.md
pnpm sprint:orchestrate
```

---

## Benefits

### Before Automation
1. Manually create directory structure
2. Manually symlink commands
3. Manually edit package.json
4. Manually update .gitignore
5. Manually write sprint files
6. Risk of errors in manual setup

**Time**: ~15-20 minutes, error-prone

### After Automation
1. Run `install.js`
2. Run `generate-sprint.js`
3. Start orchestrating

**Time**: ~2 minutes, automated and consistent

---

## Design Principles

### Installation Script
- **Symlinks over copies**: Easy to update from submodule
- **Fail-fast**: Stop on conflicts with clear messages
- **Backup first**: Always backup before modifying files
- **Idempotent**: Can run multiple times safely

### Sprint Generator
- **No AI dependency**: Pure parsing, no API keys needed
- **Fully automated**: No interactive prompts
- **Pattern-based**: Recognizes common documentation patterns
- **Smart grouping**: Categorizes tasks by keywords

### Error Handling
- **Clear messages**: Tell user exactly what's wrong
- **Actionable advice**: Provide steps to resolve
- **Safe defaults**: Preserve user data by default
- **Verification**: Check state before and after operations

---

## Future Enhancements (Not Implemented)

Potential features for future versions:
- Configuration file support
- Custom workstream categories
- AI-assisted grouping (optional)
- GitHub issues integration
- JIRA integration
- Interactive refinement mode
- Multi-language support
- Code TODO scanning
