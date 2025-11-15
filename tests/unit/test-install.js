#!/usr/bin/env node

/**
 * Tests for install.js script
 * 
 * Tests:
 * - Directory creation
 * - Symlink creation
 * - Package.json updates
 * - .gitignore updates
 * - Error handling
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const TestSetup = require('../helpers/test-setup');

const setup = new TestSetup();

test.beforeEach(() => {
  // Create a fresh test environment for each test
  // Simulate project structure: project-root/sprint-orchestrator/
  const projectRoot = setup.createTempDir();
  setup.initGitRepo(projectRoot, 'develop');
  setup.createPackageJson(projectRoot);
  setup.createGitignore(projectRoot);
  
  // Create sprint-orchestrator subdirectory (simulating framework installation)
  const frameworkRoot = setup.getFrameworkRoot();
  const frameworkDir = path.join(projectRoot, 'sprint-orchestrator');
  
  // Copy essential framework files needed for install.js
  const essentialFiles = [
    'install.js',
    'scripts',
    '.claude',
    'templates'
  ];
  
  essentialFiles.forEach(item => {
    const source = path.join(frameworkRoot, item);
    const target = path.join(frameworkDir, item);
    if (fs.existsSync(source)) {
      const stat = fs.statSync(source);
      if (stat.isDirectory()) {
        setup.copyFixtures(source, target);
      } else {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.copyFileSync(source, target);
      }
    }
  });
  
  // Change to project root (where install.js expects to be run from)
  process.chdir(projectRoot);
});

test.afterEach(() => {
  setup.cleanup();
});

test('install.js creates .claude directory structure', () => {
  const installScript = path.join(process.cwd(), 'sprint-orchestrator', 'install.js');
  
  // Run install script from project root
  execSync(`node "${installScript}"`, { stdio: 'pipe', cwd: process.cwd() });
  
  // Verify directories were created
  assert.ok(setup.dirExists('.claude'), '.claude directory should exist');
  assert.ok(setup.dirExists('.claude/commands'), '.claude/commands directory should exist');
  assert.ok(setup.dirExists('.claude/workflow'), '.claude/workflow directory should exist');
  assert.ok(setup.dirExists('.claude/backlog'), '.claude/backlog directory should exist');
});

test('install.js creates symlinks for commands', () => {
  const installScript = path.join(process.cwd(), 'sprint-orchestrator', 'install.js');
  
  execSync(`node "${installScript}"`, { stdio: 'pipe', cwd: process.cwd() });
  
  // Check that symlinks exist
  const orchestratorLink = '.claude/commands/orchestrator.md';
  const workstreamAgentLink = '.claude/commands/workstream-agent.md';
  const generateSprintLink = '.claude/commands/generate-sprint.md';
  
  assert.ok(setup.fileExists(orchestratorLink), 'orchestrator.md symlink should exist');
  assert.ok(setup.fileExists(workstreamAgentLink), 'workstream-agent.md symlink should exist');
  assert.ok(setup.fileExists(generateSprintLink), 'generate-sprint.md symlink should exist');
  
  // Verify they are symlinks
  const orchestratorStat = fs.lstatSync(orchestratorLink);
  const workstreamAgentStat = fs.lstatSync(workstreamAgentLink);
  const generateSprintStat = fs.lstatSync(generateSprintLink);
  
  assert.ok(orchestratorStat.isSymbolicLink(), 'orchestrator.md should be a symlink');
  assert.ok(workstreamAgentStat.isSymbolicLink(), 'workstream-agent.md should be a symlink');
  assert.ok(generateSprintStat.isSymbolicLink(), 'generate-sprint.md should be a symlink');
});

test('install.js creates symlinks for workflow documentation', () => {
  const installScript = path.join(process.cwd(), 'sprint-orchestrator', 'install.js');
  
  execSync(`node "${installScript}"`, { stdio: 'pipe', cwd: process.cwd() });
  
  const workflow1 = '.claude/workflow/sprint-workstreams.md';
  const workflow2 = '.claude/workflow/sprint-status-management.md';
  
  assert.ok(setup.fileExists(workflow1), 'sprint-workstreams.md symlink should exist');
  assert.ok(setup.fileExists(workflow2), 'sprint-status-management.md symlink should exist');
  
  assert.ok(fs.lstatSync(workflow1).isSymbolicLink(), 'sprint-workstreams.md should be a symlink');
  assert.ok(fs.lstatSync(workflow2).isSymbolicLink(), 'sprint-status-management.md should be a symlink');
});

test('install.js copies sprint template', () => {
  const installScript = path.join(process.cwd(), 'sprint-orchestrator', 'install.js');
  
  execSync(`node "${installScript}"`, { stdio: 'pipe', cwd: process.cwd() });
  
  const templatePath = '.claude/backlog/sprint-template.md';
  assert.ok(setup.fileExists(templatePath), 'sprint-template.md should exist');
  
  // Verify it's not empty
  const content = setup.readFile(templatePath);
  assert.ok(content.length > 0, 'sprint-template.md should not be empty');
});

test('install.js copies quality gates template', () => {
  const installScript = path.join(process.cwd(), 'sprint-orchestrator', 'install.js');
  
  execSync(`node "${installScript}"`, { stdio: 'pipe', cwd: process.cwd() });
  
  const qualityGatesPath = '.claude/quality-gates.json';
  assert.ok(setup.fileExists(qualityGatesPath), 'quality-gates.json should exist');
});

test('install.js updates package.json with sprint scripts', () => {
  const installScript = path.join(process.cwd(), 'sprint-orchestrator', 'install.js');
  
  execSync(`node "${installScript}"`, { stdio: 'pipe', cwd: process.cwd() });
  
  const packageJson = JSON.parse(setup.readFile('package.json'));
  
  // Check that sprint scripts were added
  assert.ok(packageJson.scripts, 'package.json should have scripts section');
  assert.ok(packageJson.scripts['sprint:orchestrate'], 'sprint:orchestrate script should exist');
  assert.ok(packageJson.scripts['sprint:analyze'], 'sprint:analyze script should exist');
  assert.ok(packageJson.scripts['sprint:create-workstreams'], 'sprint:create-workstreams script should exist');
  assert.ok(packageJson.scripts['sprint:resume'], 'sprint:resume script should exist');
  assert.ok(packageJson.scripts['sprint:cleanup-all'], 'sprint:cleanup-all script should exist');
  
  // Verify script paths point to framework
  assert.ok(
    packageJson.scripts['sprint:orchestrate'].includes('sprint-orchestrator'),
    'Script should reference sprint-orchestrator directory'
  );
});

test('install.js creates backup of existing package.json', () => {
  const installScript = path.join(process.cwd(), 'sprint-orchestrator', 'install.js');
  
  // Create existing package.json with custom scripts
  const originalPackageJson = {
    name: 'test-project',
    version: '1.0.0',
    scripts: {
      'test': 'echo "test"',
      'build': 'echo "build"'
    }
  };
  setup.writeFile('package.json', JSON.stringify(originalPackageJson, null, 2));
  
  execSync(`node "${installScript}"`, { stdio: 'pipe', cwd: process.cwd() });
  
  // Check that backup was created
  assert.ok(setup.fileExists('package.json.backup'), 'package.json.backup should exist');
  
  // Verify backup contains original content
  const backup = JSON.parse(setup.readFile('package.json.backup'));
  assert.strictEqual(backup.scripts.test, 'echo "test"', 'Backup should contain original scripts');
});

test('install.js updates .gitignore', () => {
  const installScript = path.join(process.cwd(), 'sprint-orchestrator', 'install.js');
  
  execSync(`node "${installScript}"`, { stdio: 'pipe', cwd: process.cwd() });
  
  const gitignore = setup.readFile('.gitignore');
  
  assert.ok(gitignore.includes('# Sprint Orchestrator Runtime'), '.gitignore should contain Sprint Orchestrator section');
  assert.ok(gitignore.includes('.claude/sprint-config.json'), '.gitignore should exclude sprint-config.json');
});

test('install.js creates .claude/README.md', () => {
  const installScript = path.join(process.cwd(), 'sprint-orchestrator', 'install.js');
  
  execSync(`node "${installScript}"`, { stdio: 'pipe', cwd: process.cwd() });
  
  const readmePath = '.claude/README.md';
  assert.ok(setup.fileExists(readmePath), '.claude/README.md should exist');
  
  const content = setup.readFile(readmePath);
  assert.ok(content.includes('Sprint Orchestrator'), 'README should mention Sprint Orchestrator');
  assert.ok(content.includes('generate-sprint.md'), 'README should include generate-sprint.md in structure');
  assert.ok(content.includes('/generate-sprint'), 'README should include /generate-sprint command');
});

test('install.js creates or updates CLAUDE.md', () => {
  const installScript = path.join(process.cwd(), 'sprint-orchestrator', 'install.js');
  
  execSync(`node "${installScript}"`, { stdio: 'pipe', cwd: process.cwd() });
  
  const claudeMdPath = 'CLAUDE.md';
  assert.ok(setup.fileExists(claudeMdPath), 'CLAUDE.md should exist');
  
  const content = setup.readFile(claudeMdPath);
  assert.ok(content.includes('Sprint Orchestrator Framework'), 'CLAUDE.md should reference framework');
  assert.ok(content.includes('/orchestrator'), 'CLAUDE.md should include /orchestrator command');
  assert.ok(content.includes('/workstream-agent'), 'CLAUDE.md should include /workstream-agent command');
  assert.ok(content.includes('/generate-sprint'), 'CLAUDE.md should include /generate-sprint command');
});

test('install.js handles existing symlinks correctly', () => {
  const installScript = path.join(process.cwd(), 'sprint-orchestrator', 'install.js');
  
  // Verify source files exist before running install
  const commandsSourceDir = path.join(process.cwd(), 'sprint-orchestrator', '.claude', 'commands');
  assert.ok(setup.fileExists(path.join(commandsSourceDir, 'orchestrator.md')), 'Source file orchestrator.md should exist');
  assert.ok(setup.fileExists(path.join(commandsSourceDir, 'workstream-agent.md')), 'Source file workstream-agent.md should exist');
  
  // Run install first time
  try {
    execSync(`node "${installScript}"`, { stdio: 'pipe', cwd: process.cwd() });
  } catch (error) {
    console.error('First install failed:', error.message);
    if (error.stdout) console.error('stdout:', error.stdout.toString());
    if (error.stderr) console.error('stderr:', error.stderr.toString());
    throw error;
  }
  
  // Verify symlinks exist
  assert.ok(setup.fileExists('.claude/commands/orchestrator.md'), 'Symlink should exist after first install');
  
  // Run install second time - should handle existing symlinks gracefully
  try {
    execSync(`node "${installScript}"`, { stdio: 'pipe', cwd: process.cwd() });
  } catch (error) {
    console.error('Second install failed:', error.message);
    if (error.stdout) console.error('stdout:', error.stdout.toString());
    if (error.stderr) console.error('stderr:', error.stderr.toString());
    throw error;
  }
  
  // Should not fail and symlinks should still exist
  assert.ok(setup.fileExists('.claude/commands/orchestrator.md'), 'Symlink should still exist after second install');
});

test('install.js fails gracefully when not in git repository', () => {
  // Create temp dir without git
  const tempDir = setup.createTempDir();
  const installScript = path.join(setup.getFrameworkRoot(), 'install.js');
  
  // Copy framework to temp dir
  const frameworkDir = path.join(tempDir, 'sprint-orchestrator');
  fs.mkdirSync(frameworkDir, { recursive: true });
  setup.copyFixtures(setup.getFrameworkRoot(), frameworkDir);
  
  setup.createPackageJson(tempDir);
  process.chdir(tempDir);
  
  // Should exit with error code
  try {
    execSync(`node "${installScript}"`, { stdio: 'pipe', cwd: tempDir });
    assert.fail('Should have failed when not in git repository');
  } catch (error) {
    assert.ok(error.status !== 0, 'Should exit with non-zero status');
  }
});

test('install.js handles script conflicts in package.json', () => {
  const installScript = path.join(process.cwd(), 'sprint-orchestrator', 'install.js');
  
  // Create package.json with conflicting script name
  const conflictingPackageJson = {
    name: 'test-project',
    version: '1.0.0',
    scripts: {
      'sprint:orchestrate': 'echo "conflict"'
    }
  };
  setup.writeFile('package.json', JSON.stringify(conflictingPackageJson, null, 2));
  
  // Should fail with error
  try {
    execSync(`node "${installScript}"`, { stdio: 'pipe', cwd: process.cwd() });
    assert.fail('Should have failed with script conflict');
  } catch (error) {
    assert.ok(error.status !== 0, 'Should exit with non-zero status');
  }
});

