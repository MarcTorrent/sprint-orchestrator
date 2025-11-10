# Integration Guide

Quick reference for integrating sprint-orchestrator into your projects.

## Quick Start (Automated)

Works even in empty projects!

```bash
# From an empty directory
mkdir my-project && cd my-project
git init

# 1. Add as git submodule
git submodule add <repo-url> sprint-orchestrator
git submodule update --init --recursive

# 2. Run automated installation (creates package.json if needed)
node sprint-orchestrator/install.js

# 3. Done! Start using the framework
pnpm sprint:generate --docs docs/ --output .claude/backlog/sprint-1.md
```

The automated installation handles everything, including creating `package.json` if it doesn't exist. See below for manual steps if needed.

---

## Manual Installation (If Needed)

### Adding as Git Submodule

```bash
# In your project root
git submodule add <repo-url> sprint-orchestrator
git submodule update --init --recursive
```

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
```

## Create Your First Sprint

### Option A: Generate from Documentation (Automated)

```bash
# Generate sprint from your docs
pnpm sprint:generate \
  --docs "docs/,README.md" \
  --output .claude/backlog/sprint-1-features.md \
  --name "Feature Implementation"
```

The generator will:
- Extract TODO items from markdown files
- Find feature lists in documentation
- Group tasks into logical workstreams
- Create a ready-to-use sprint file

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

```bash
# 1. Analyze the sprint
pnpm sprint:analyze .claude/backlog/sprint-1-features.md

# 2. Create workstreams (creates git worktrees)
pnpm sprint:create-workstreams .claude/backlog/sprint-1-features.md

# 3. Start orchestrating
pnpm sprint:orchestrate

# Or use Claude commands
# /orchestrator
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
│   ├── commands/                 (copied or linked)
│   │   ├── orchestrator.md
│   │   └── workstream-agent.md
│   └── sprint-config.json        (generated at runtime)
├── package.json                  (with sprint scripts)
└── ...

../worktrees/                     (created automatically)
├── ui-components/
├── backend-api/
└── testing/
```

## Updating the Submodule

```bash
# Get latest updates
cd sprint-orchestrator
git pull origin main
cd ..

# Commit the submodule update
git add sprint-orchestrator
git commit -m "chore: update sprint-orchestrator submodule"
```

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

### Generate-sprint finds no tasks

Make sure your documentation has:
- `- [ ] Task` checkboxes
- `TODO:` or `FIXME:` items
- Feature sections with bullet lists

## Additional Resources

- [Complete Workflow Documentation](sprint-orchestrator/.claude/workflow/sprint-workstreams.md)
- [System Evaluation](sprint-orchestrator/docs/EVALUATION.md)
- [Cleanup Procedures](sprint-orchestrator/docs/CLEANUP.md)
