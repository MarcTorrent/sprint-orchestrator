# Integration Guide

Complete guide for integrating sprint-orchestrator into your projects.

## Quick Start (Automated)

Works even in empty projects!

```bash
# From an empty directory
mkdir my-project && cd my-project
git init

# 1. Add as git submodule
git submodule add <repo-url> sprint-orchestrator
git submodule update --init --recursive

# Configure submodule to track main branch
git config -f .gitmodules submodule.sprint-orchestrator.branch main

# 2. Run automated installation (creates package.json if needed)
node sprint-orchestrator/install.js

# 3. Done! Start using the framework
# Use /generate-sprint command in Claude Code to generate sprints
```

The automated installation handles everything, including creating `package.json` if it doesn't exist. See below for manual steps if needed.

---

## Empty Project Support

### ✅ Works in Empty Projects!

The Sprint Orchestrator framework can now be installed in completely empty git repositories. The installer automatically creates `package.json` if it doesn't exist.

**Minimal Requirements:**
- ✅ Git repository (even empty): `git init`
- ✅ Node.js v14+ installed

**NOT required:**
- ❌ Existing `package.json`
- ❌ Existing project files
- ❌ NPM packages installed
- ❌ Any configuration files

### What Gets Created

In a completely empty project, the installer creates:

#### 1. `.claude/` Directory Structure
```
.claude/
├── commands/
│   ├── orchestrator.md → ../../sprint-orchestrator/.claude/commands/orchestrator.md
│   ├── workstream-agent.md → ../../sprint-orchestrator/.claude/commands/workstream-agent.md
│   └── generate-sprint.md → ../../sprint-orchestrator/.claude/commands/generate-sprint.md
├── workflow/
│   ├── sprint-workstreams.md → ../../sprint-orchestrator/.claude/workflow/sprint-workstreams.md
│   └── sprint-status-management.md → ../../sprint-orchestrator/.claude/workflow/sprint-status-management.md
├── backlog/
│   └── sprint-template.md
├── quality-gates.json
└── README.md
```

The installer creates **`commands/`** and **`workflow/`** symlinks in **Step 3** and **Step 3b** of `install.js` (see `sprint-orchestrator/install.js`). If you only symlink commands manually, add the workflow links too (see **Symlink workflow docs (manual)** below).

#### 2. `package.json`
```json
{
  "name": "my-new-project",
  "version": "1.0.0",
  "description": "",
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
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

#### 3. `.gitignore`
```
# Sprint Orchestrator Runtime
.claude/sprint-config.json
.claude/settings.local.json
```

### Installation Output (Empty Project)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 SPRINT ORCHESTRATOR - INSTALLATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ️  Framework directory: /path/to/sprint-orchestrator
ℹ️  Project root: /path/to/my-new-project

📋 Step 1: Verifying git repository...
✅ Git repository detected

📁 Step 2: Creating directory structure...
✅ Created: .claude/
✅ Created: .claude/commands/
✅ Created: .claude/backlog/

🔗 Step 3: Symlinking Claude commands...
✅ Symlinked: .claude/commands/orchestrator.md → ../../sprint-orchestrator/.claude/commands/orchestrator.md
✅ Symlinked: .claude/commands/workstream-agent.md → ../../sprint-orchestrator/.claude/commands/workstream-agent.md
✅ Symlinked: .claude/commands/generate-sprint.md → ../../sprint-orchestrator/.claude/commands/generate-sprint.md

📚 Step 3b: Symlinking workflow documentation...
✅ Symlinked: .claude/workflow/sprint-workstreams.md → ../../sprint-orchestrator/.claude/workflow/sprint-workstreams.md
✅ Symlinked: .claude/workflow/sprint-status-management.md → ../../sprint-orchestrator/.claude/workflow/sprint-status-management.md

📄 Step 4: Copying sprint template...
✅ Copied: .claude/backlog/sprint-template.md

📦 Step 5: Updating package.json...
ℹ️  package.json not found, creating minimal package.json...
✅ Created minimal package.json
✅ Updated package.json with sprint scripts

🙈 Step 6: Updating .gitignore...
✅ Updated .gitignore with Sprint Orchestrator exclusions

📝 Step 7: Creating .claude/README.md...
✅ Created .claude/README.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ INSTALLATION COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Benefits

**For New Projects:**
- ✅ Zero boilerplate needed
- ✅ Framework sets up everything
- ✅ Start with sprint orchestration from day one

**For Existing Projects:**
- ✅ Still works as before
- ✅ Merges scripts into existing package.json
- ✅ Creates backup before modification

---

## Manual Installation (If Needed)

### Adding as Git Submodule

```bash
# In your project root
git submodule add <repo-url> sprint-orchestrator
git submodule update --init --recursive

# Configure to track main branch (important!)
git config -f .gitmodules submodule.sprint-orchestrator.branch main
```

**Note**: This ensures the submodule always tracks the `main` branch and prevents accidental modifications.

### Update Your package.json

Add these scripts to your `package.json`:

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

## Symlink Claude Commands (Manual)

The automated installer handles this, but if doing manually:

```bash
# Create commands directory
mkdir -p .claude/commands

# Create symbolic links
ln -s ../../sprint-orchestrator/.claude/commands/orchestrator.md .claude/commands/orchestrator.md
ln -s ../../sprint-orchestrator/.claude/commands/workstream-agent.md .claude/commands/workstream-agent.md
ln -s ../../sprint-orchestrator/.claude/commands/generate-sprint.md .claude/commands/generate-sprint.md
```

### Symlink workflow docs (manual)

```bash
mkdir -p .claude/workflow
ln -s ../../sprint-orchestrator/.claude/workflow/sprint-workstreams.md .claude/workflow/sprint-workstreams.md
ln -s ../../sprint-orchestrator/.claude/workflow/sprint-status-management.md .claude/workflow/sprint-status-management.md
```

Or re-run `node sprint-orchestrator/install.js` — it will create any missing symlinks without overwriting your backlog.

## Create Your First Sprint

### Option A: Intelligent Generation (Recommended)

Use the `/generate-sprint` Claude command for intelligent sprint generation:

```
/generate-sprint [--max-story-points=40] [--docs="docs/,README.md"]
```

This command:
- Extracts all tasks from documentation
- Estimates story points for each task
- Assigns agents to tasks based on project structure
- Creates detailed acceptance criteria
- Identifies dependencies
- **Splits tasks into multiple sprints** based on max story points per sprint
- Generates rich sprint files with full context

**Important**: This command does NOT define workstreams or group tasks into workstreams. The orchestrator is exclusively responsible for workstream definition using `/orchestrator` command.

**See**: [Generate Sprint Command](../.claude/commands/generate-sprint.md) for complete documentation

### Option B: Copy Template (Manual)

```bash
# Create backlog directory
mkdir -p .claude/backlog

# Copy the sprint template
cp sprint-orchestrator/templates/sprint-template.md .claude/backlog/sprint-1-example.md

# Edit the template with your workstreams
```

Or create from scratch:

```bash
cat > .claude/backlog/sprint-1-example.md << 'EOF'
# Sprint 1: Example Sprint

## Workstreams

### Workstream 1: ui-components
**Tasks**: TASK-101, TASK-102
**Dependencies**: None

### Workstream 2: backend-api
**Tasks**: TASK-103, TASK-104
**Dependencies**: None

### Workstream 3: testing
**Tasks**: TASK-105
**Dependencies**: ui-components, backend-api
EOF
```

## Update .gitignore

Add to your `.gitignore`:

```
# Sprint Orchestrator Runtime
.claude/sprint-config.json
.claude/settings.local.json
```

## Start Your Sprint

**Note**: Workstream assignment is the orchestrator's responsibility. Use `/orchestrator` command to handle this.

```bash
# 1. Analyze the sprint and define workstreams (orchestrator's responsibility)
# If workstreams exist: pnpm sprint:analyze .claude/backlog/sprint-1-features.md
# If workstreams missing: pnpm sprint:analyze .claude/backlog/sprint-1-features.md --interactive

# 2. Create workstreams (creates git worktrees)
pnpm sprint:create-workstreams

# 3. Start orchestrating
pnpm sprint:orchestrate

# Or use Claude commands
# /orchestrator  (handles workstream assignment)
# /workstream-agent <name>
```

## Using with Claude Code

### As Orchestrator
```
/orchestrator
```

### As Workstream Agent
```
/workstream-agent <workstream-name>
```

## Directory Structure After Integration

```
your-project/
├── sprint-orchestrator/          (git submodule)
│   ├── scripts/
│   ├── .claude/
│   │   ├── commands/
│   │   └── workflow/
│   ├── docs/
│   ├── README.md
│   └── package.json
├── .claude/
│   ├── backlog/
│   │   └── sprint-1-example.md
│   ├── commands/                 (symlinked by install.js)
│   │   ├── orchestrator.md
│   │   ├── workstream-agent.md
│   │   └── generate-sprint.md
│   ├── workflow/                 (symlinked by install.js)
│   │   ├── sprint-workstreams.md
│   │   └── sprint-status-management.md
│   └── sprint-config.json        (generated at runtime)
├── package.json                  (with sprint scripts)
└── ...

../worktrees/                     (created automatically)
├── ui-components/
├── backend-api/
└── testing/
```

## Updating the Submodule

**Important**: The sprint-orchestrator submodule should always track the `main` branch. Do not modify files inside the `sprint-orchestrator/` directory directly.

### Initial Setup (Track main branch)

When first adding the submodule, configure it to track the `main` branch:

```bash
# After adding the submodule
git config -f .gitmodules submodule.sprint-orchestrator.branch main

# Verify the configuration
git config -f .gitmodules --get submodule.sprint-orchestrator.branch
# Should output: main
```

### Updating to Latest from main

To update the submodule to the latest commit from the `main` branch:

```bash
# Update submodule to latest commit on main branch
git submodule update --remote sprint-orchestrator

# Review the changes
git status
# You'll see: modified: sprint-orchestrator (new commits)
# This means the parent project sees the submodule moved to a new commit

# Commit the submodule reference update in your parent project
git add sprint-orchestrator
git commit -m "chore: update sprint-orchestrator submodule"
```

**Note**: The `git add` and `git commit` commands update your parent project's reference to the submodule (like updating a dependency version). They do not modify files inside the submodule itself.

### Reinstalling After Update (Optional)

After updating the submodule, you may want to reinstall if:
- New scripts were added to the framework
- The installer (`install.js`) was updated
- Directory structure or symlinks changed

```bash
# Reinstall to sync package.json scripts and symlinks
node sprint-orchestrator/install.js
```

**Note**: The installer is safe to run multiple times - it will:
- ✅ Add any new scripts to `package.json`
- ✅ Update symlinks if paths changed
- ✅ Skip existing configurations
- ⚠️ Stop if it detects conflicts (existing scripts with same names)

### Why This Approach?

- ✅ Always tracks `main` branch (enforced by `.gitmodules` config)
- ✅ Prevents accidental modifications (submodule is read-only from parent project)
- ✅ Simple update process with `git submodule update --remote`
- ✅ Clear version control (each commit in parent project pins exact submodule version)

### ⚠️ Important Notes

- **Do not modify files** inside `sprint-orchestrator/` directory
- **Do not commit changes** to the submodule from the parent project
- If you need to contribute to sprint-orchestrator, do so in the [upstream repository](https://github.com/MarcTorrent/sprint-orchestrator)
- The submodule tracks a specific commit, ensuring reproducible builds

## Uninstallation

```bash
# Remove integration (keeps your sprint data)
node sprint-orchestrator/uninstall.js --keep-data

# Remove integration and all data
node sprint-orchestrator/uninstall.js

# Remove submodule completely
git submodule deinit -f sprint-orchestrator
git rm -f sprint-orchestrator
rm -rf .git/modules/sprint-orchestrator
```

## Troubleshooting

### Installation Conflicts

The installer will stop if it detects conflicts:
- **Script names exist**: Remove conflicting scripts from package.json
- **Commands exist**: Remove or rename `.claude/commands/*.md` files
- Then run `node sprint-orchestrator/install.js` again

### Submodule not found after clone

```bash
git submodule update --init --recursive
```

### Scripts not working

Reinstall the framework:
```bash
node sprint-orchestrator/uninstall.js
node sprint-orchestrator/install.js
```

### Claude commands not available

Check symlinks:
```bash
ls -la .claude/commands/
```

### Workflow docs missing (`sprint-workstreams.md` not under `.claude/workflow/`)

The installer adds them in **Step 3b**. Re-run:

```bash
node sprint-orchestrator/install.js
```

Or create the symlinks manually (see [Symlink workflow docs (manual)](#symlink-workflow-docs-manual) above). If `.claude/README.md` is old and omits `workflow/`, compare with the template in `install.js` (Step 7) or delete `.claude/README.md` and reinstall (installer only creates README when missing).

### Generate-sprint finds no tasks

Make sure your documentation has:
- `- [ ] Task` checkboxes
- `TODO:` or `FIXME:` items
- Feature sections with bullet lists

## Additional Resources

- [Complete Workflow Documentation](../.claude/workflow/sprint-workstreams.md) (includes cleanup procedures)
- [System Evaluation](evaluation.md)

