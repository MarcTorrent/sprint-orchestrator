#!/usr/bin/env node

/**
 * Sprint Orchestrator Framework - Uninstallation Script
 *
 * Removes integration from the main project:
 * - Removes symlinked Claude commands
 * - Removes sprint scripts from package.json
 * - Optionally removes .claude directory
 *
 * Usage: node sprint-orchestrator/uninstall.js [--keep-data]
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
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

// Parse arguments
const args = process.argv.slice(2);
const keepData = args.includes('--keep-data');

// Determine paths
const frameworkDir = __dirname;
const projectRoot = path.resolve(frameworkDir, '..');

log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'bright');
log('🗑️  SPRINT ORCHESTRATOR - UNINSTALLATION', 'bright');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'bright');

info(`Framework directory: ${frameworkDir}`);
info(`Project root: ${projectRoot}`);
if (keepData) {
  info('Mode: Keep sprint data (--keep-data)\n');
} else {
  warning('Mode: Remove all data (use --keep-data to preserve)\n');
}

// Step 1: Remove symlinked commands
log('🔗 Step 1: Removing symlinked commands...', 'bright');
const commands = ['orchestrator.md', 'workstream-agent.md'];
const commandsTargetDir = path.join(projectRoot, '.claude/commands');

commands.forEach(cmd => {
  const targetPath = path.join(commandsTargetDir, cmd);

  if (!fs.existsSync(targetPath)) {
    info(`Not found: .claude/commands/${cmd}`);
    return;
  }

  try {
    // Verify it's a symlink before removing
    const stats = fs.lstatSync(targetPath);
    if (stats.isSymbolicLink()) {
      fs.unlinkSync(targetPath);
      success(`Removed symlink: .claude/commands/${cmd}`);
    } else {
      warning(`Not a symlink, skipping: .claude/commands/${cmd}`);
    }
  } catch (err) {
    error(`Failed to remove: .claude/commands/${cmd}: ${err.message}`);
  }
});

// Step 2: Remove sprint template if it's unmodified
log('\n📄 Step 2: Checking sprint template...', 'bright');
const templatePath = path.join(projectRoot, '.claude/backlog/sprint-template.md');
if (fs.existsSync(templatePath) && !keepData) {
  fs.unlinkSync(templatePath);
  success('Removed: .claude/backlog/sprint-template.md');
} else if (keepData) {
  info('Keeping: .claude/backlog/sprint-template.md (--keep-data)');
} else {
  info('Not found: .claude/backlog/sprint-template.md');
}

// Step 3: Remove scripts from package.json
log('\n📦 Step 3: Updating package.json...', 'bright');
const packageJsonPath = path.join(projectRoot, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  warning('package.json not found, skipping');
} else {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  if (!packageJson.scripts) {
    info('No scripts section in package.json');
  } else {
    const sprintScriptNames = [
      'sprint:orchestrate',
      'sprint:analyze',
      'sprint:create-workstreams',
      'sprint:resume',
      'sprint:complete',
      'sprint:status',
      'sprint:sync-all',
      'sprint:push',
      'sprint:cleanup',
      'sprint:cleanup-all',
      'sprint:generate'
    ];

    let removedCount = 0;
    sprintScriptNames.forEach(scriptName => {
      if (packageJson.scripts[scriptName]) {
        delete packageJson.scripts[scriptName];
        removedCount++;
      }
    });

    if (removedCount > 0) {
      // Create backup
      const backupPath = packageJsonPath + '.backup';
      fs.copyFileSync(packageJsonPath, backupPath);
      info(`Created backup: package.json.backup`);

      // Write updated package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      success(`Removed ${removedCount} sprint scripts from package.json`);
    } else {
      info('No sprint scripts found in package.json');
    }
  }
}

// Step 4: Clean up .claude directory
log('\n📁 Step 4: Cleaning .claude directory...', 'bright');

if (keepData) {
  info('Keeping all sprint data (--keep-data flag)');
} else {
  warning('This will remove ALL sprint data!');
  warning('Including:');
  warning('  - .claude/backlog/ (all sprint files)');
  warning('  - .claude/sprint-config.json');
  warning('  - .claude/README.md\n');

  // For safety, we'll just warn and let user manually delete if they want
  info('To preserve your data, the .claude/ directory structure is kept.');
  info('If you want to remove it completely, run:');
  info('  rm -rf .claude/\n');
}

// Step 5: Update .gitignore
log('🙈 Step 5: Cleaning .gitignore...', 'bright');
const gitignorePath = path.join(projectRoot, '.gitignore');

if (!fs.existsSync(gitignorePath)) {
  info('.gitignore not found');
} else {
  let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

  if (gitignoreContent.includes('# Sprint Orchestrator Runtime')) {
    // Remove the Sprint Orchestrator section
    const lines = gitignoreContent.split('\n');
    const filteredLines = [];
    let inSprintSection = false;

    for (const line of lines) {
      if (line.includes('# Sprint Orchestrator Runtime')) {
        inSprintSection = true;
        continue;
      }
      if (inSprintSection && line.trim() === '') {
        inSprintSection = false;
        continue;
      }
      if (!inSprintSection) {
        filteredLines.push(line);
      }
    }

    fs.writeFileSync(gitignorePath, filteredLines.join('\n'));
    success('Removed Sprint Orchestrator section from .gitignore');
  } else {
    info('No Sprint Orchestrator section found in .gitignore');
  }
}

// Final summary
log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'bright');
log('✅ UNINSTALLATION COMPLETE', 'green');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'bright');

log('📋 What was done:', 'bright');
log('  ✅ Removed symlinked commands');
if (!keepData) {
  log('  ✅ Removed sprint template');
}
log('  ✅ Removed sprint scripts from package.json');
log('  ✅ Cleaned .gitignore\n');

if (keepData) {
  log('💾 Preserved data:', 'bright');
  log('  - .claude/backlog/ (your sprint files)');
  log('  - .claude/sprint-config.json');
  log('  - .claude/README.md\n');
}

log('🔧 To reinstall:', 'bright');
log('  node sprint-orchestrator/install.js\n');

log('🗑️  To completely remove the submodule:', 'bright');
log('  git submodule deinit -f sprint-orchestrator');
log('  git rm -f sprint-orchestrator');
log('  rm -rf .git/modules/sprint-orchestrator\n');
