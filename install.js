#!/usr/bin/env node

/**
 * Sprint Orchestrator Framework - Installation Script
 *
 * Automates integration of the framework into the main project:
 * - Creates necessary directory structure
 * - Symlinks Claude commands and Cursor project rules
 * - Updates package.json with sprint scripts
 * - Copies initial sprint template
 * - Updates .gitignore
 *
 * Usage: node sprint-orchestrator/install.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ERROR: ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Determine paths
const frameworkDir = __dirname;
const projectRoot = path.resolve(frameworkDir, '..');

log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'bright');
log('🚀 SPRINT ORCHESTRATOR - INSTALLATION', 'bright');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'bright');

info(`Framework directory: ${frameworkDir}`);
info(`Project root: ${projectRoot}\n`);

// Step 1: Verify we're in a git repository
log('📋 Step 1: Verifying git repository...', 'bright');
try {
  require('child_process').execSync('git rev-parse --git-dir', {
    cwd: projectRoot,
    stdio: 'pipe'
  });
  success('Git repository detected');
} catch (err) {
  error('Not in a git repository. Please run this from a git project.');
  process.exit(1);
}

// Step 2: Create directory structure
log('\n📁 Step 2: Creating directory structure...', 'bright');
const directories = [
  '.claude',
  '.claude/commands',
  '.claude/workflow',
  '.claude/backlog',
  '.cursor',
  '.cursor/rules',
];

directories.forEach(dir => {
  const dirPath = path.join(projectRoot, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    success(`Created: ${dir}/`);
  } else {
    info(`Already exists: ${dir}/`);
  }
});

// Step 3: Symlink Claude commands
log('\n🔗 Step 3: Symlinking Claude commands...', 'bright');
const commands = ['orchestrator.md', 'workstream-agent.md', 'generate-sprint.md'];
const commandsSourceDir = path.join(frameworkDir, '.claude/commands');
const commandsTargetDir = path.join(projectRoot, '.claude/commands');

commands.forEach(cmd => {
  const sourcePath = path.join(commandsSourceDir, cmd);
  const targetPath = path.join(commandsTargetDir, cmd);
  const relativePath = path.relative(commandsTargetDir, sourcePath);

  // Verify source file exists
  if (!fs.existsSync(sourcePath)) {
    error(`Source file not found: ${sourcePath}`);
    error('  Make sure you are running install.js from the sprint-orchestrator directory.');
    process.exit(1);
  }

  if (fs.existsSync(targetPath)) {
    // Check if it's already a symlink pointing to the right place
    try {
      const linkTarget = fs.readlinkSync(targetPath);
      if (linkTarget === relativePath) {
        info(`Symlink already correct: .claude/commands/${cmd}`);
        return;
      } else {
        error(`File already exists and is not a correct symlink: .claude/commands/${cmd}`);
        error(`  Expected symlink to: ${relativePath}`);
        error(`  Found symlink to: ${linkTarget}`);
        error('\nPlease resolve this conflict manually and run install again.');
        process.exit(1);
      }
    } catch (err) {
      // Not a symlink, it's a regular file
      error(`File already exists: .claude/commands/${cmd}`);
      error('  This file is not a symlink. Please remove or rename it and run install again.');
      process.exit(1);
    }
  }

  fs.symlinkSync(relativePath, targetPath);
  success(`Symlinked: .claude/commands/${cmd} → ${relativePath}`);
});

// Step 3b: Symlink workflow documentation
log('\n📚 Step 3b: Symlinking workflow documentation...', 'bright');
const workflows = ['sprint-workstreams.md', 'sprint-status-management.md'];
const workflowsSourceDir = path.join(frameworkDir, '.claude/workflow');
const workflowsTargetDir = path.join(projectRoot, '.claude/workflow');

workflows.forEach(workflow => {
  const sourcePath = path.join(workflowsSourceDir, workflow);
  const targetPath = path.join(workflowsTargetDir, workflow);
  const relativePath = path.relative(workflowsTargetDir, sourcePath);

  if (fs.existsSync(targetPath)) {
    // Check if it's already a symlink pointing to the right place
    try {
      const linkTarget = fs.readlinkSync(targetPath);
      if (linkTarget === relativePath) {
        info(`Symlink already correct: .claude/workflow/${workflow}`);
        return;
      } else {
        error(`File already exists and is not a correct symlink: .claude/workflow/${workflow}`);
        error(`  Expected symlink to: ${relativePath}`);
        error(`  Found symlink to: ${linkTarget}`);
        error('\nPlease resolve this conflict manually and run install again.');
        process.exit(1);
      }
    } catch (err) {
      // Not a symlink, it's a regular file
      error(`File already exists: .claude/workflow/${workflow}`);
      error('  This file is not a symlink. Please remove or rename it and run install again.');
      process.exit(1);
    }
  }

  fs.symlinkSync(relativePath, targetPath);
  success(`Symlinked: .claude/workflow/${workflow} → ${relativePath}`);
});

// Step 3c: Symlink Cursor project rules (IDE)
log('\n🖱️  Step 3c: Symlinking Cursor rules...', 'bright');
const cursorRules = ['sprint-orchestrator.mdc', 'workstream-ui.mdc'];
const cursorRulesSourceDir = path.join(frameworkDir, '.cursor/rules');
const cursorRulesTargetDir = path.join(projectRoot, '.cursor/rules');

cursorRules.forEach(ruleFile => {
  const sourcePath = path.join(cursorRulesSourceDir, ruleFile);
  const targetPath = path.join(cursorRulesTargetDir, ruleFile);
  const relativePath = path.relative(cursorRulesTargetDir, sourcePath);

  if (!fs.existsSync(sourcePath)) {
    error(`Source file not found: ${sourcePath}`);
    error('  Ensure sprint-orchestrator includes `.cursor/rules/` (update submodule or reinstall).');
    process.exit(1);
  }

  if (fs.existsSync(targetPath)) {
    try {
      const linkTarget = fs.readlinkSync(targetPath);
      if (linkTarget === relativePath) {
        info(`Symlink already correct: .cursor/rules/${ruleFile}`);
        return;
      }
      error(`File already exists and is not a correct symlink: .cursor/rules/${ruleFile}`);
      error(`  Expected symlink to: ${relativePath}`);
      error(`  Found symlink to: ${linkTarget}`);
      error('\nPlease resolve this conflict manually and run install again.');
      process.exit(1);
    } catch (err) {
      error(`File already exists: .cursor/rules/${ruleFile}`);
      error('  This file is not a symlink. Please remove or rename it and run install again.');
      process.exit(1);
    }
  }

  fs.symlinkSync(relativePath, targetPath);
  success(`Symlinked: .cursor/rules/${ruleFile} → ${relativePath}`);
});

// Step 4: Copy sprint template
log('\n📄 Step 4: Copying sprint template...', 'bright');
const templateSource = path.join(frameworkDir, 'templates/sprint-template.md');
const templateTarget = path.join(projectRoot, '.claude/backlog/sprint-template.md');

if (fs.existsSync(templateTarget)) {
  info('Sprint template already exists: .claude/backlog/sprint-template.md');
} else {
  fs.copyFileSync(templateSource, templateTarget);
  success('Copied: .claude/backlog/sprint-template.md');
}

// Step 4b: Copy quality gates template
log('\n🔍 Step 4b: Setting up quality gates template...', 'bright');
const qualityGatesTemplateSource = path.join(frameworkDir, '.claude/quality-gates.json.template');
const qualityGatesTarget = path.join(projectRoot, '.claude/quality-gates.json');

if (fs.existsSync(qualityGatesTarget)) {
  info('Quality gates config already exists: .claude/quality-gates.json');
} else {
  fs.copyFileSync(qualityGatesTemplateSource, qualityGatesTarget);
  success('Copied: .claude/quality-gates.json (disabled by default)');
  info('   Configure quality gates for your project type (Python, Rust, Go, JS/TS, etc.)');
}

// Step 5: Update package.json
log('\n📦 Step 5: Updating package.json...', 'bright');
const packageJsonPath = path.join(projectRoot, 'package.json');

let packageJson;

if (!fs.existsSync(packageJsonPath)) {
  info('package.json not found, creating minimal package.json...');

  // Create minimal package.json
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

if (!packageJson.scripts) {
  packageJson.scripts = {};
}

const sprintScripts = {
  'sprint:orchestrate': 'node sprint-orchestrator/scripts/sprint-orchestrate.js',
  'sprint:analyze': 'node sprint-orchestrator/scripts/sprint-analyze.js',
  'sprint:create-workstreams': 'node sprint-orchestrator/scripts/sprint-create-workstreams.js',
  'sprint:resume': 'node sprint-orchestrator/scripts/sprint-resume.js',
  'sprint:complete': 'node sprint-orchestrator/scripts/sprint-complete.js',
  'sprint:status': 'node sprint-orchestrator/scripts/sprint-status.js',
  'sprint:sync-all': 'node sprint-orchestrator/scripts/sprint-sync-all.js',
  'sprint:push': 'node sprint-orchestrator/scripts/sprint-push.js',
  'sprint:cleanup': 'node sprint-orchestrator/scripts/sprint-cleanup.js',
  'sprint:cleanup-all': 'node sprint-orchestrator/scripts/sprint-cleanup-all.js',
  'sprint:quality-gates': 'node sprint-orchestrator/scripts/sprint-quality-gates.js'
};

// Check for conflicts (scripts that exist but don't match)
const conflicts = [];
const scriptsToAdd = {};
Object.keys(sprintScripts).forEach(scriptName => {
  if (packageJson.scripts[scriptName]) {
    // Check if existing script matches what we want to add
    if (packageJson.scripts[scriptName] === sprintScripts[scriptName]) {
      // Script already exists and matches - skip it
      info(`Script already correct: "${scriptName}"`);
    } else {
      // Script exists but doesn't match - this is a conflict
      conflicts.push(scriptName);
    }
  } else {
    // Script doesn't exist - add it
    scriptsToAdd[scriptName] = sprintScripts[scriptName];
  }
});

if (conflicts.length > 0) {
  error('Script name conflicts detected in package.json:');
  conflicts.forEach(name => {
    error(`  - "${name}" already exists: ${packageJson.scripts[name]}`);
    error(`    Expected: ${sprintScripts[name]}`);
  });
  error('\nPlease resolve these conflicts manually:');
  error('  1. Remove or rename the conflicting scripts in package.json');
  error('  2. Run install again');
  error('\nOr modify the sprint script names in sprint-orchestrator if needed.');
  process.exit(1);
}

// Add only new scripts (scripts that already exist and match are skipped)
if (Object.keys(scriptsToAdd).length > 0) {
  Object.assign(packageJson.scripts, scriptsToAdd);
  
  // Create backup if file existed
  if (fs.existsSync(packageJsonPath)) {
    const backupPath = packageJsonPath + '.backup';
    fs.copyFileSync(packageJsonPath, backupPath);
    info(`Created backup: package.json.backup`);
  }
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  success('Updated package.json with sprint scripts');
} else {
  info('All sprint scripts already exist in package.json');
}

// Step 6: Update .gitignore
log('\n🙈 Step 6: Updating .gitignore...', 'bright');
const gitignorePath = path.join(projectRoot, '.gitignore');
const gitignoreEntries = [
  '',
  '# Sprint Orchestrator Runtime',
  '.claude/sprint-config.json',
  '.claude/settings.local.json',
  ''
];

let gitignoreContent = '';
if (fs.existsSync(gitignorePath)) {
  gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
}

// Check if entries already exist
const hasSprintSection = gitignoreContent.includes('# Sprint Orchestrator Runtime');
if (hasSprintSection) {
  info('.gitignore already has Sprint Orchestrator section');
} else {
  gitignoreContent += gitignoreEntries.join('\n');
  fs.writeFileSync(gitignorePath, gitignoreContent);
  success('Updated .gitignore with Sprint Orchestrator exclusions');
}

// Step 6b: Allow committing `.cursor/rules/` (symlinks into sprint-orchestrator)
log('\n🙈 Step 6b: Ensuring .gitignore supports Cursor rules from submodule...', 'bright');
const CURSOR_GITIGNORE_MARKER =
  '# Sprint Orchestrator – Cursor rules (symlinked from sprint-orchestrator submodule)';

let gitignoreForCursor = '';
if (fs.existsSync(gitignorePath)) {
  gitignoreForCursor = fs.readFileSync(gitignorePath, 'utf8');
}

if (gitignoreForCursor.includes('!.cursor/rules/')) {
  info('.gitignore already allows `.cursor/rules/`');
} else {
  const lines = gitignoreForCursor.split('\n');
  const stripped = [];
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t === '.cursor/' || t === '.cursor') {
      info('Removed blanket `.cursor/` entry from .gitignore (replaced by selective Cursor rules)');
      continue;
    }
    stripped.push(lines[i]);
  }
  let out = stripped.join('\n');
  if (out.length > 0 && !out.endsWith('\n')) {
    out += '\n';
  }
  const cursorBlock = [
    '',
    CURSOR_GITIGNORE_MARKER,
    '.cursor/*',
    '!.cursor/rules/',
    '!.cursor/rules/**',
    ''
  ].join('\n');
  out += cursorBlock;
  fs.writeFileSync(gitignorePath, out);
  success('Updated .gitignore so `.cursor/rules/` can be committed (symlinks to submodule)');
}

// Step 7: Create .claude/README.md
log('\n📝 Step 7: Creating .claude/README.md...', 'bright');
const claudeReadmePath = path.join(projectRoot, '.claude/README.md');
const claudeReadmeContent = `# Claude Configuration Directory

This directory contains configuration and data for the Sprint Orchestrator framework.

## Structure

\`\`\`
.claude/
├── commands/              # Claude Code slash commands (symlinked from sprint-orchestrator)
│   ├── orchestrator.md        → ../../sprint-orchestrator/.claude/commands/orchestrator.md
│   ├── workstream-agent.md    → ../../sprint-orchestrator/.claude/commands/workstream-agent.md
│   └── generate-sprint.md     → ../../sprint-orchestrator/.claude/commands/generate-sprint.md
├── workflow/              # Workflow documentation (symlinked from sprint-orchestrator)
│   ├── sprint-workstreams.md      → ../../sprint-orchestrator/.claude/workflow/sprint-workstreams.md
│   └── sprint-status-management.md → ../../sprint-orchestrator/.claude/workflow/sprint-status-management.md
├── backlog/              # Sprint backlog files
│   ├── sprint-template.md     # Template for creating new sprints
│   └── sprint-X-name.md       # Your sprint definitions
└── sprint-config.json    # Runtime configuration (auto-generated, gitignored)
\`\`\`

## Creating a Sprint

1. Copy the template:
   \`\`\`bash
   cp .claude/backlog/sprint-template.md .claude/backlog/sprint-1-myfeature.md
   \`\`\`

2. Edit the sprint file with your workstreams and tasks

3. Or generate from documentation:

   Use the \`/generate-sprint\` Claude command:
   \`\`\`
   /generate-sprint [--max-story-points=40] [--docs="docs/,README.md"]
   \`\`\`
   This intelligently extracts tasks, estimates story points, assigns agents to tasks, and splits into multiple sprints. Note: Workstreams are NOT defined - the orchestrator handles that.

4. Start the sprint (orchestrator's responsibility):
   \`\`\`bash
   # Analyze sprint and define workstreams (if not already defined)
   pnpm sprint:analyze .claude/backlog/sprint-1-myfeature.md --interactive
   # Create workstreams
   pnpm sprint:create-workstreams
   # Start orchestrating
   pnpm sprint:orchestrate
   \`\`\`
   
   Or use \`/orchestrator\` command which handles workstream assignment.

## Using Claude Commands

In Claude Code, use:
- \`/orchestrator\` - Initialize as sprint orchestrator
- \`/workstream-agent <name>\` - Initialize as workstream agent
- \`/generate-sprint\` - Generate sprint backlog files from project documentation

## Cursor IDE (optional)

If you ran \`node sprint-orchestrator/install.js\`, the installer symlinks **Cursor project rules** into \`.cursor/rules/\` from the \`sprint-orchestrator\` submodule (e.g. orchestrator vs UI workstream personas). Commit those symlinks in your app repo; they are not a substitute for Claude Code slash commands in \`.claude/commands/\`.

## Documentation

- **Workflow guides**: See \`.claude/workflow/\` for detailed workflow documentation
- **Framework docs**: See \`sprint-orchestrator/README.md\` for framework overview
- **Framework usage**: See \`sprint-orchestrator/CLAUDE.md\` for Claude Code integration
`;

if (fs.existsSync(claudeReadmePath)) {
  info('.claude/README.md already exists');
} else {
  fs.writeFileSync(claudeReadmePath, claudeReadmeContent);
  success('Created .claude/README.md');
}

// Step 8: Setup CLAUDE.md (create or update reference)
log('\n📄 Step 8: Setting up CLAUDE.md...', 'bright');
const claudeMdPath = path.join(projectRoot, 'CLAUDE.md');
const frameworkReference = `

---

## 🚀 Sprint Orchestrator Framework

This project uses the [Sprint Orchestrator Framework](sprint-orchestrator/CLAUDE.md) for parallel development workflows.

**Quick Start:**
- Use \`/orchestrator\` to coordinate workstreams
- Use \`/workstream-agent <name>\` to work on specific workstreams
- See [workflow documentation](.claude/workflow/sprint-workstreams.md) for complete guide

**Framework Documentation:**
- Framework usage: [sprint-orchestrator/CLAUDE.md](sprint-orchestrator/CLAUDE.md)
- Workflow guides: [.claude/workflow/](.claude/workflow/)
- Integration guide: [sprint-orchestrator/docs/integration-guide.md](sprint-orchestrator/docs/integration-guide.md)
`;

if (fs.existsSync(claudeMdPath)) {
  // File exists - check if framework reference already present
  const existingContent = fs.readFileSync(claudeMdPath, 'utf8');
  
  if (existingContent.includes('Sprint Orchestrator Framework')) {
    info('CLAUDE.md already references Sprint Orchestrator Framework');
  } else {
    // Append framework reference
    const updatedContent = existingContent.trim() + frameworkReference;
    fs.writeFileSync(claudeMdPath, updatedContent);
    success('Added Sprint Orchestrator Framework reference to CLAUDE.md');
  }
} else {
  // File doesn't exist - create template
  const templateContent = `# ${path.basename(projectRoot)}

Project description and Claude Code integration guide.

---

## 📋 Current Sprint

**Sprint X**: [Sprint Name](./.claude/backlog/sprint-X-name.md) (Status)

👉 **Always check sprint backlog for current task status**

**Quick status check**: \`grep "Status:" .claude/backlog/sprint-X-name.md\`

---

## 🎯 Quick Start

### Starting Sprint Orchestrator Mode
**Just say**: \`/orchestrator\`
**What it does**: Initializes you as the Sprint Orchestrator to coordinate multiple workstreams
**See**: [Sprint Workstreams Workflow](.claude/workflow/sprint-workstreams.md) | [Orchestrator Command](.claude/commands/orchestrator.md)

### Starting Workstream Agent Mode
**Just say**: \`/workstream-agent <workstream-name>\`
**What it does**: Initializes you as a Workstream Agent to work on specific tasks
**See**: [Sprint Workstreams Workflow](.claude/workflow/sprint-workstreams.md) | [Workstream Agent Command](.claude/commands/workstream-agent.md)

### Generating Sprint Backlogs
**Just say**: \`/generate-sprint [--max-story-points=40] [--docs="docs/,README.md"]\`
**What it does**: Generate sprint backlog files from project documentation
**See**: [Generate Sprint Command](.claude/commands/generate-sprint.md)${frameworkReference}
`;
  fs.writeFileSync(claudeMdPath, templateContent);
  success('Created CLAUDE.md template with Sprint Orchestrator integration');
}

// Final summary
log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'bright');
log('✅ INSTALLATION COMPLETE', 'green');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'bright');

log('📋 What was done:', 'bright');
log('  ✅ Created .claude/ directory structure');
log('  ✅ Symlinked Claude commands');
log('  ✅ Symlinked Cursor rules (.cursor/rules/)');
log('  ✅ Symlinked workflow documentation');
log('  ✅ Copied sprint template');
log('  ✅ Copied quality gates template');
log('  ✅ Updated package.json (backup created)');
log('  ✅ Updated .gitignore');
log('  ✅ Created .claude/README.md');
log('  ✅ Setup CLAUDE.md (created or updated with framework reference)\n');

log('🎯 Next steps:', 'bright');
log('  1. Create your first sprint:');
log('     Option A: Use /generate-sprint command (intelligent generation)');
log('     Option B: cp .claude/backlog/sprint-template.md .claude/backlog/sprint-1.md\n');
log('  2. Start orchestrating (workstream assignment is orchestrator\'s responsibility):');
log('     /orchestrator  (handles workstream assignment)');
log('     Or: pnpm sprint:analyze .claude/backlog/sprint-1.md --interactive');
log('         pnpm sprint:create-workstreams');
log('         pnpm sprint:orchestrate\n');

log('📚 Documentation:', 'bright');
log('  - Project: CLAUDE.md (created/updated with framework reference)');
log('  - Framework: sprint-orchestrator/README.md');
log('  - Framework usage: sprint-orchestrator/CLAUDE.md');
log('  - Workflow guides: .claude/workflow/ (symlinked)');
log('  - Quick start: sprint-orchestrator/docs/integration-guide.md\n');

log('🔧 To uninstall:', 'bright');
log('  node sprint-orchestrator/uninstall.js\n');
