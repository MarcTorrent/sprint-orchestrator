#!/usr/bin/env node

/**
 * Sprint Orchestrator Framework - Installation Script
 *
 * Automates integration of the framework into the main project:
 * - Creates necessary directory structure
 * - Symlinks Claude commands
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
  '.claude/backlog',
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
const commands = ['orchestrator.md', 'workstream-agent.md'];
const commandsSourceDir = path.join(frameworkDir, '.claude/commands');
const commandsTargetDir = path.join(projectRoot, '.claude/commands');

commands.forEach(cmd => {
  const sourcePath = path.join(commandsSourceDir, cmd);
  const targetPath = path.join(commandsTargetDir, cmd);
  const relativePath = path.relative(commandsTargetDir, sourcePath);

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
  'sprint:generate': 'node sprint-orchestrator/scripts/generate-sprint.js'
};

// Check for conflicts
const conflicts = [];
Object.keys(sprintScripts).forEach(scriptName => {
  if (packageJson.scripts[scriptName]) {
    conflicts.push(scriptName);
  }
});

if (conflicts.length > 0) {
  error('Script name conflicts detected in package.json:');
  conflicts.forEach(name => {
    error(`  - "${name}" already exists: ${packageJson.scripts[name]}`);
  });
  error('\nPlease resolve these conflicts manually:');
  error('  1. Remove or rename the conflicting scripts in package.json');
  error('  2. Run install again');
  error('\nOr modify the sprint script names in sprint-orchestrator if needed.');
  process.exit(1);
}

// Add scripts
Object.assign(packageJson.scripts, sprintScripts);

// Create backup if file existed
if (fs.existsSync(packageJsonPath)) {
  const backupPath = packageJsonPath + '.backup';
  fs.copyFileSync(packageJsonPath, backupPath);
  info(`Created backup: package.json.backup`);
}

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
success('Updated package.json with sprint scripts');

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
│   └── workstream-agent.md    → ../../sprint-orchestrator/.claude/commands/workstream-agent.md
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
   \`\`\`bash
   pnpm sprint:generate --docs docs/ --output .claude/backlog/sprint-1-myfeature.md
   \`\`\`

4. Start the sprint:
   \`\`\`bash
   pnpm sprint:analyze .claude/backlog/sprint-1-myfeature.md
   pnpm sprint:create-workstreams .claude/backlog/sprint-1-myfeature.md
   \`\`\`

## Using Claude Commands

In Claude Code, use:
- \`/orchestrator\` - Initialize as sprint orchestrator
- \`/workstream-agent <name>\` - Initialize as workstream agent

## Documentation

See \`sprint-orchestrator/README.md\` for complete documentation.
`;

if (fs.existsSync(claudeReadmePath)) {
  info('.claude/README.md already exists');
} else {
  fs.writeFileSync(claudeReadmePath, claudeReadmeContent);
  success('Created .claude/README.md');
}

// Final summary
log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'bright');
log('✅ INSTALLATION COMPLETE', 'green');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'bright');

log('📋 What was done:', 'bright');
log('  ✅ Created .claude/ directory structure');
log('  ✅ Symlinked Claude commands');
log('  ✅ Copied sprint template');
log('  ✅ Updated package.json (backup created)');
log('  ✅ Updated .gitignore');
log('  ✅ Created .claude/README.md\n');

log('🎯 Next steps:', 'bright');
log('  1. Create your first sprint:');
log('     cp .claude/backlog/sprint-template.md .claude/backlog/sprint-1.md\n');
log('  2. Or generate from docs:');
log('     pnpm sprint:generate --docs docs/ --output .claude/backlog/sprint-1.md\n');
log('  3. Start orchestrating:');
log('     pnpm sprint:analyze .claude/backlog/sprint-1.md');
log('     pnpm sprint:create-workstreams .claude/backlog/sprint-1.md');
log('     pnpm sprint:orchestrate\n');

log('📚 Documentation:', 'bright');
log('  - Framework: sprint-orchestrator/README.md');
log('  - Claude integration: sprint-orchestrator/CLAUDE.md');
log('  - Quick start: sprint-orchestrator/integration-guide.md\n');

log('🔧 To uninstall:', 'bright');
log('  node sprint-orchestrator/uninstall.js\n');
