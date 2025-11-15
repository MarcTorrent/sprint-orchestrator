# Empty Project Support

## ✅ Now Works in Empty Projects!

The Sprint Orchestrator framework can now be installed in completely empty git repositories.

---

## What Changed

### Before
The installer **required** `package.json` to exist:
```javascript
if (!fs.existsSync(packageJsonPath)) {
  error('package.json not found in project root');
  error('Please create a package.json file first.');
  process.exit(1);
}
```

**Result**: Failed in empty projects ❌

### After
The installer **creates** `package.json` if it doesn't exist:
```javascript
if (!fs.existsSync(packageJsonPath)) {
  info('package.json not found, creating minimal package.json...');

  packageJson = {
    name: path.basename(projectRoot),
    version: '1.0.0',
    description: '',
    scripts: {},
    keywords: [],
    author: '',
    license: 'ISC'
  };

  success('Created minimal package.json');
} else {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  info('Found existing package.json');
}
```

**Result**: Works in empty projects ✅

---

## Usage in Empty Project

```bash
# Start completely fresh
mkdir my-new-project
cd my-new-project
git init

# Add framework as submodule
git submodule add https://github.com/your-org/sprint-orchestrator.git sprint-orchestrator
git submodule update --init --recursive

# Install (creates package.json automatically)
node sprint-orchestrator/install.js

# Verify installation
ls -la
# You'll see:
# - .git/
# - .gitignore (created by installer)
# - .claude/ (created by installer)
# - package.json (created by installer)
# - sprint-orchestrator/ (submodule)

# Start using immediately
pnpm install  # Install pnpm if needed
pnpm sprint:generate --docs README.md --output .claude/backlog/sprint-1.md
```

---

## What Gets Created

In a completely empty project, the installer creates:

### 1. `.claude/` Directory Structure
```
.claude/
├── commands/
│   ├── orchestrator.md → ../../sprint-orchestrator/.claude/commands/orchestrator.md
│   └── workstream-agent.md → ../../sprint-orchestrator/.claude/commands/workstream-agent.md
├── backlog/
│   └── sprint-template.md
└── README.md
```

### 2. `package.json`
```json
{
  "name": "my-new-project",
  "version": "1.0.0",
  "description": "",
  "scripts": {
    "sprint:generate": "node sprint-orchestrator/scripts/generate-sprint.js",
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

### 3. `.gitignore`
```
# Sprint Orchestrator Runtime
.claude/sprint-config.json
.claude/settings.local.json
```

---

## Minimal Requirements

The **only** requirement for installation:
- ✅ Git repository (even empty): `git init`
- ✅ Node.js v14+ installed

**NOT required**:
- ❌ Existing `package.json`
- ❌ Existing project files
- ❌ NPM packages installed
- ❌ Any configuration files

---

## Installation Output (Empty Project)

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

📋 What was done:
  ✅ Created .claude/ directory structure
  ✅ Symlinked Claude commands
  ✅ Copied sprint template
  ✅ Created package.json                     ← NEW!
  ✅ Updated .gitignore
  ✅ Created .claude/README.md

🎯 Next steps:
  1. Create your first sprint:
     cp .claude/backlog/sprint-template.md .claude/backlog/sprint-1.md

  2. Or generate from docs:
     pnpm sprint:generate --docs docs/ --output .claude/backlog/sprint-1.md

  3. Start orchestrating:
     pnpm sprint:analyze .claude/backlog/sprint-1.md
     pnpm sprint:create-workstreams .claude/backlog/sprint-1.md
     pnpm sprint:orchestrate
```

---

## Benefits

### For New Projects
- ✅ Zero boilerplate needed
- ✅ Framework sets up everything
- ✅ Start with sprint orchestration from day one

### For Existing Projects
- ✅ Still works as before
- ✅ Merges scripts into existing package.json
- ✅ Creates backup before modification

---

## Additional Features

### Smart Backup
- Only creates `package.json.backup` if the file existed before
- Empty projects don't get unnecessary backup files

### Minimal Configuration
The created `package.json` uses:
- Project directory name as package name
- Standard defaults (ISC license, version 1.0.0)
- Only sprint scripts, no unnecessary fields
- Valid npm package format

### Future-Proof
The minimal `package.json` can be easily extended:
```bash
# Add dependencies
pnpm add <package>

# Add more scripts
# Edit package.json and add your scripts

# Customize metadata
# Update name, description, author, etc.
```

---

## Testing

To verify empty project support works:

```bash
# Create test directory
mkdir test-empty-install
cd test-empty-install
git init

# Verify it's empty
ls -la
# Should only show .git/

# Add framework
git submodule add https://github.com/your-org/sprint-orchestrator.git sprint-orchestrator

# Install
node sprint-orchestrator/install.js

# Verify success
cat package.json
# Should show minimal package.json with sprint scripts

ls .claude/commands/
# Should show symlinked commands
```

---

## Summary

The Sprint Orchestrator framework now provides **true zero-setup installation**:

1. Empty git repository? ✅ Works
2. No package.json? ✅ Creates it
3. No configuration? ✅ Sets it up
4. No files at all? ✅ No problem

**Result**: From zero to orchestrating sprints in 3 commands, even in completely empty projects.
