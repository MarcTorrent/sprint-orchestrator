#!/usr/bin/env node

/**
 * Unit tests for all sprint scripts
 * 
 * Tests:
 * - sprint-analyze.js
 * - sprint-create-workstreams.js
 * - sprint-resume.js
 * - sprint-complete.js
 * - sprint-status.js
 * - sprint-orchestrate.js
 * - sprint-sync-all.js
 * - sprint-push.js
 * - sprint-quality-gates.js
 * - sprint-cleanup.js
 * - sprint-cleanup-all.js
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const TestSetup = require('../helpers/test-setup');

const setup = new TestSetup();

// Helper function to remove workstreams section from sprint file
function removeWorkstreamsSection(sprintFile) {
  // Ensure we use absolute path if relative
  const absolutePath = path.isAbsolute(sprintFile) ? sprintFile : path.join(process.cwd(), sprintFile);
  let content = setup.readFile(absolutePath);
  // Remove workstreams section if it exists
  content = content.replace(/## Workstreams[\s\S]*?(?=## Sprint Summary|$)/, '');
  setup.writeFile(absolutePath, content);
}

test.beforeEach(() => {
  // Create a fresh test environment for each test
  const projectRoot = setup.createTempDir();
  setup.initGitRepo(projectRoot, 'develop');
  setup.createPackageJson(projectRoot);
  setup.createGitignore(projectRoot);
  
  // Create sprint-orchestrator subdirectory
  const frameworkRoot = setup.getFrameworkRoot();
  const frameworkDir = path.join(projectRoot, 'sprint-orchestrator');
  
  // Copy essential framework files
  const essentialFiles = ['scripts', '.claude', 'templates'];
  essentialFiles.forEach(item => {
    const source = path.join(frameworkRoot, item);
    const target = path.join(frameworkDir, item);
    if (fs.existsSync(source)) {
      setup.copyFixtures(source, target);
    }
  });
  
  // Create .claude directory structure
  fs.mkdirSync(path.join(projectRoot, '.claude', 'backlog'), { recursive: true });
  
  // Copy sample sprint file (use absolute path)
  const sampleSprint = setup.readFile(path.join(setup.getFixturesDir(), 'sample-sprint.md'));
  const sprintFilePath = path.join(projectRoot, '.claude', 'backlog', 'sprint-1-subscribe.md');
  setup.writeFile(sprintFilePath, sampleSprint);
  
  process.chdir(projectRoot);
});

test.afterEach(() => {
  setup.cleanup();
});

// ============================================================================
// sprint-analyze.js tests
// ============================================================================

test('sprint-analyze requires sprint file argument', () => {
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-analyze.js');
  
  try {
    execSync(`node "${script}"`, { stdio: 'pipe', cwd: process.cwd() });
    assert.fail('Should have failed without sprint file');
  } catch (error) {
    assert.ok(error.status !== 0, 'Should exit with non-zero status');
  }
});

test('sprint-analyze fails when sprint file does not exist', () => {
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-analyze.js');
  
  try {
    execSync(`node "${script}" non-existent.md`, { stdio: 'pipe', cwd: process.cwd() });
    assert.fail('Should have failed for non-existent file');
  } catch (error) {
    assert.ok(error.status !== 0, 'Should exit with non-zero status');
  }
});

test('sprint-analyze parses sprint file and creates config', () => {
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-analyze.js');
  const sprintFile = '.claude/backlog/sprint-1-subscribe.md';
  
  // Remove workstreams section from sprint file so --workstreams flag is used
  removeWorkstreamsSection(sprintFile);
  
  // Use --workstreams flag to define workstreams
  execSync(`node "${script}" "${sprintFile}" --workstreams="ui-components:TASK-101,TASK-102;backend-api:TASK-103,TASK-104;testing:TASK-105"`, { 
    stdio: 'pipe', 
    cwd: process.cwd()
  });
  
  // Verify config was created
  assert.ok(setup.fileExists('.claude/sprint-config.json'), 'Sprint config should be created');
  
  const config = JSON.parse(setup.readFile('.claude/sprint-config.json'));
  assert.ok(config.sprint, 'Config should have sprint name');
  assert.ok(Array.isArray(config.workstreams), 'Config should have workstreams array');
  assert.strictEqual(config.workstreams.length, 3, 'Should have 3 workstreams');
});

test('sprint-analyze extracts tasks from sprint file', () => {
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-analyze.js');
  const sprintFile = '.claude/backlog/sprint-1-subscribe.md';
  
  // Remove workstreams section from sprint file so --workstreams flag is used
  removeWorkstreamsSection(sprintFile);
  
  // Use --workstreams flag to define workstreams
  execSync(`node "${script}" "${sprintFile}" --workstreams="ui-components:TASK-101,TASK-102;backend-api:TASK-103,TASK-104;testing:TASK-105"`, { stdio: 'pipe', cwd: process.cwd() });
  
  const config = JSON.parse(setup.readFile('.claude/sprint-config.json'));
  
  // Verify workstreams have tasks
  config.workstreams.forEach(ws => {
    assert.ok(Array.isArray(ws.tasks), `Workstream ${ws.name} should have tasks array`);
    assert.ok(ws.tasks.length > 0, `Workstream ${ws.name} should have at least one task`);
  });
});

// ============================================================================
// sprint-create-workstreams.js tests
// ============================================================================

test('sprint-create-workstreams requires sprint config', () => {
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-create-workstreams.js');
  
  try {
    execSync(`node "${script}"`, { stdio: 'pipe', cwd: process.cwd() });
    assert.fail('Should have failed without sprint config');
  } catch (error) {
    assert.ok(error.status !== 0, 'Should exit with non-zero status');
  }
});

test('sprint-create-workstreams creates worktrees and branches', () => {
  // First create sprint config
  const sprintFile = '.claude/backlog/sprint-1-subscribe.md';
  removeWorkstreamsSection(sprintFile);
  
  const analyzeScript = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-analyze.js');
  execSync(`node "${analyzeScript}" "${sprintFile}" --workstreams="ui-components:TASK-101,TASK-102;backend-api:TASK-103,TASK-104;testing:TASK-105"`, { stdio: 'pipe', cwd: process.cwd() });
  
  // Clean up any existing worktrees before creating new ones
  const config = JSON.parse(setup.readFile('.claude/sprint-config.json'));
  config.workstreams.forEach(ws => {
    const worktreePath = path.resolve(process.cwd(), ws.worktree);
    if (fs.existsSync(worktreePath)) {
      try {
        execSync(`git worktree remove "${worktreePath}" --force`, { stdio: 'pipe', cwd: process.cwd() });
      } catch (error) {
        // Not a worktree, just remove the directory
        fs.rmSync(worktreePath, { recursive: true, force: true });
      }
    }
  });
  
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-create-workstreams.js');
  
  execSync(`node "${script}"`, { stdio: 'pipe', cwd: process.cwd() });
  
  // Re-read config after workstreams are created
  const updatedConfig = JSON.parse(setup.readFile('.claude/sprint-config.json'));
  
  // Verify worktrees were created
  updatedConfig.workstreams.forEach(ws => {
    const worktreePath = path.resolve(process.cwd(), ws.worktree);
    assert.ok(setup.dirExists(worktreePath), `Worktree should exist for ${ws.name}`);
    
    // Verify branch exists
    const branchName = `feature/${ws.name}-workstream`;
    try {
      const branches = execSync('git branch', { encoding: 'utf8', cwd: process.cwd() });
      assert.ok(branches.includes(branchName), `Branch ${branchName} should exist`);
    } catch (error) {
      assert.fail(`Failed to check branches: ${error.message}`);
    }
  });
});

// ============================================================================
// sprint-resume.js tests
// ============================================================================

test('sprint-resume requires workstream name', () => {
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-resume.js');
  
  try {
    execSync(`node "${script}"`, { stdio: 'pipe', cwd: process.cwd() });
    assert.fail('Should have failed without workstream name');
  } catch (error) {
    assert.ok(error.status !== 0, 'Should exit with non-zero status');
  }
});

test('sprint-resume fails for non-existent workstream', () => {
  // Create sprint config first
  const sprintFile = '.claude/backlog/sprint-1-subscribe.md';
  removeWorkstreamsSection(sprintFile);
  
  const analyzeScript = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-analyze.js');
  execSync(`node "${analyzeScript}" "${sprintFile}" --workstreams="ui-components:TASK-101,TASK-102;backend-api:TASK-103,TASK-104;testing:TASK-105"`, { stdio: 'pipe', cwd: process.cwd() });
  
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-resume.js');
  
  try {
    execSync(`node "${script}" non-existent-workstream`, { stdio: 'pipe', cwd: process.cwd() });
    assert.fail('Should have failed for non-existent workstream');
  } catch (error) {
    assert.ok(error.status !== 0, 'Should exit with non-zero status');
  }
});

test('sprint-resume updates workstream status to in_progress', () => {
  // Setup: create config and workstreams
  const sprintFile = '.claude/backlog/sprint-1-subscribe.md';
  removeWorkstreamsSection(sprintFile);
  
  const analyzeScript = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-analyze.js');
  execSync(`node "${analyzeScript}" "${sprintFile}" --workstreams="ui-components:TASK-101,TASK-102;backend-api:TASK-103,TASK-104;testing:TASK-105"`, { stdio: 'pipe', cwd: process.cwd() });
  
  const createScript = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-create-workstreams.js');
  execSync(`node "${createScript}"`, { stdio: 'pipe', cwd: process.cwd() });
  
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-resume.js');
  const config = JSON.parse(setup.readFile('.claude/sprint-config.json'));
  const workstreamName = config.workstreams[0].name;
  
  execSync(`node "${script}" ${workstreamName}`, { stdio: 'pipe', cwd: process.cwd() });
  
  // Verify status was updated
  const updatedConfig = JSON.parse(setup.readFile('.claude/sprint-config.json'));
  const workstream = updatedConfig.workstreams.find(ws => ws.name === workstreamName);
  assert.strictEqual(workstream.status, 'in_progress', 'Status should be updated to in_progress');
});

// ============================================================================
// sprint-status.js tests
// ============================================================================

test('sprint-status requires sprint config', () => {
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-status.js');
  
  try {
    execSync(`node "${script}"`, { stdio: 'pipe', cwd: process.cwd() });
    assert.fail('Should have failed without sprint config');
  } catch (error) {
    assert.ok(error.status !== 0, 'Should exit with non-zero status');
  }
});

test('sprint-status displays workstream information', () => {
  // Create sprint config
  const sprintFile = '.claude/backlog/sprint-1-subscribe.md';
  removeWorkstreamsSection(sprintFile);
  
  const analyzeScript = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-analyze.js');
  execSync(`node "${analyzeScript}" "${sprintFile}" --workstreams="ui-components:TASK-101,TASK-102;backend-api:TASK-103,TASK-104;testing:TASK-105"`, { stdio: 'pipe', cwd: process.cwd() });
  
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-status.js');
  const output = execSync(`node "${script}"`, { encoding: 'utf8', cwd: process.cwd() });
  
  // Verify output contains workstream information
  const config = JSON.parse(setup.readFile('.claude/sprint-config.json'));
  config.workstreams.forEach(ws => {
    assert.ok(output.includes(ws.name), `Output should include workstream ${ws.name}`);
    assert.ok(output.includes(ws.status), `Output should include status for ${ws.name}`);
  });
});

// ============================================================================
// sprint-complete.js tests
// ============================================================================

test('sprint-complete requires workstream name', () => {
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-complete.js');
  
  try {
    execSync(`node "${script}"`, { stdio: 'pipe', cwd: process.cwd() });
    assert.fail('Should have failed without workstream name');
  } catch (error) {
    assert.ok(error.status !== 0, 'Should exit with non-zero status');
  }
});

test('sprint-complete updates workstream status to completed', () => {
  // Setup: create config and workstreams
  const sprintFile = '.claude/backlog/sprint-1-subscribe.md';
  removeWorkstreamsSection(sprintFile);
  
  const analyzeScript = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-analyze.js');
  execSync(`node "${analyzeScript}" "${sprintFile}" --workstreams="ui-components:TASK-101,TASK-102;backend-api:TASK-103,TASK-104;testing:TASK-105"`, { stdio: 'pipe', cwd: process.cwd() });
  
  const createScript = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-create-workstreams.js');
  execSync(`node "${createScript}"`, { stdio: 'pipe', cwd: process.cwd() });
  
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-complete.js');
  const config = JSON.parse(setup.readFile('.claude/sprint-config.json'));
  const workstreamName = config.workstreams[0].name;
  
  execSync(`node "${script}" ${workstreamName} --skip-quality-gates`, { stdio: 'pipe', cwd: process.cwd() });
  
  // Verify status was updated
  const updatedConfig = JSON.parse(setup.readFile('.claude/sprint-config.json'));
  const workstream = updatedConfig.workstreams.find(ws => ws.name === workstreamName);
  assert.strictEqual(workstream.status, 'completed', 'Status should be updated to completed');
  assert.ok(workstream.completedAt, 'Should have completedAt timestamp');
});

// ============================================================================
// sprint-orchestrate.js tests
// ============================================================================

test('sprint-orchestrate shows instructions when no config exists', () => {
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-orchestrate.js');
  
  const output = execSync(`node "${script}"`, { encoding: 'utf8', cwd: process.cwd() });
  
  assert.ok(output.includes('No sprint configuration found'), 'Should show no config message');
  assert.ok(output.includes('sprint:analyze'), 'Should mention sprint:analyze command');
});

test('sprint-orchestrate displays sprint configuration when config exists', () => {
  // Create sprint config
  const sprintFile = '.claude/backlog/sprint-1-subscribe.md';
  removeWorkstreamsSection(sprintFile);
  
  const analyzeScript = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-analyze.js');
  execSync(`node "${analyzeScript}" "${sprintFile}" --workstreams="ui-components:TASK-101,TASK-102;backend-api:TASK-103,TASK-104;testing:TASK-105"`, { stdio: 'pipe', cwd: process.cwd() });
  
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-orchestrate.js');
  const output = execSync(`node "${script}"`, { encoding: 'utf8', cwd: process.cwd() });
  
  assert.ok(output.includes('SPRINT CONFIGURATION'), 'Should display sprint configuration');
  
  const config = JSON.parse(setup.readFile('.claude/sprint-config.json'));
  assert.ok(output.includes(config.sprint), 'Should include sprint name');
});

test('sprint-orchestrate requires git repository', () => {
  // Create temp dir without git
  const tempDir = setup.createTempDir();
  process.chdir(tempDir);
  
  const script = path.join(setup.getFrameworkRoot(), 'scripts', 'sprint-orchestrate.js');
  
  try {
    execSync(`node "${script}"`, { stdio: 'pipe', cwd: tempDir });
    assert.fail('Should have failed when not in git repository');
  } catch (error) {
    assert.ok(error.status !== 0, 'Should exit with non-zero status');
  }
});

// ============================================================================
// sprint-cleanup-all.js tests
// ============================================================================

test('sprint-cleanup-all handles missing config gracefully', () => {
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-cleanup-all.js');
  
  const output = execSync(`node "${script}"`, { encoding: 'utf8', cwd: process.cwd() });
  
  assert.ok(output.includes('No active sprint configuration'), 'Should show no config message');
});

test('sprint-cleanup-all removes worktrees and branches', () => {
  // Setup: create config and workstreams
  const sprintFile = '.claude/backlog/sprint-1-subscribe.md';
  removeWorkstreamsSection(sprintFile);
  
  const analyzeScript = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-analyze.js');
  execSync(`node "${analyzeScript}" "${sprintFile}" --workstreams="ui-components:TASK-101,TASK-102;backend-api:TASK-103,TASK-104;testing:TASK-105"`, { stdio: 'pipe', cwd: process.cwd() });
  
  // Save config before cleanup for verification
  const configBefore = JSON.parse(setup.readFile('.claude/sprint-config.json'));
  
  const createScript = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-create-workstreams.js');
  execSync(`node "${createScript}"`, { stdio: 'pipe', cwd: process.cwd() });
  
  // Verify worktrees were created
  configBefore.workstreams.forEach(ws => {
    const worktreePath = path.resolve(process.cwd(), ws.worktree);
    assert.ok(setup.dirExists(worktreePath), `Worktree should exist for ${ws.name} before cleanup`);
  });
  
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-cleanup-all.js');
  execSync(`node "${script}"`, { stdio: 'pipe', cwd: process.cwd() });
  
  // Verify config was removed
  assert.ok(!setup.fileExists('.claude/sprint-config.json'), 'Sprint config should be removed');
  
  // Verify worktrees were removed
  configBefore.workstreams.forEach(ws => {
    const worktreePath = path.resolve(process.cwd(), ws.worktree);
    assert.ok(!setup.dirExists(worktreePath), `Worktree should be removed for ${ws.name}`);
  });
});

// ============================================================================
// sprint-quality-gates.js tests
// ============================================================================

test('sprint-quality-gates handles missing config gracefully', () => {
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-quality-gates.js');
  
  const output = execSync(`node "${script}"`, { encoding: 'utf8', cwd: process.cwd() });
  
  assert.ok(
    output.includes('not configured') || output.includes('not found'),
    'Should show config not found message'
  );
});

test('sprint-quality-gates skips when disabled', () => {
  // Create quality gates config (disabled)
  fs.mkdirSync('.claude', { recursive: true });
  const qualityGatesConfig = {
    enabled: false,
    commands: []
  };
  setup.writeFile('.claude/quality-gates.json', JSON.stringify(qualityGatesConfig, null, 2));
  
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-quality-gates.js');
  const output = execSync(`node "${script}"`, { encoding: 'utf8', cwd: process.cwd() });
  
  assert.ok(output.includes('disabled'), 'Should indicate gates are disabled');
});

// ============================================================================
// sprint-sync-all.js tests
// ============================================================================

test('sprint-sync-all requires sprint config', () => {
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-sync-all.js');
  
  try {
    execSync(`node "${script}"`, { stdio: 'pipe', cwd: process.cwd() });
    assert.fail('Should have failed without sprint config');
  } catch (error) {
    assert.ok(error.status !== 0, 'Should exit with non-zero status');
  }
});

// ============================================================================
// sprint-push.js tests
// ============================================================================

test('sprint-push requires workstream name', () => {
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-push.js');
  
  try {
    execSync(`node "${script}"`, { stdio: 'pipe', cwd: process.cwd() });
    assert.fail('Should have failed without workstream name');
  } catch (error) {
    assert.ok(error.status !== 0, 'Should exit with non-zero status');
  }
});

test('sprint-push requires sprint config', () => {
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-push.js');
  
  try {
    execSync(`node "${script}" test-workstream`, { stdio: 'pipe', cwd: process.cwd() });
    assert.fail('Should have failed without sprint config');
  } catch (error) {
    assert.ok(error.status !== 0, 'Should exit with non-zero status');
  }
});

test('sprint-push fails for non-existent workstream', () => {
  // Create sprint config
  const sprintFile = '.claude/backlog/sprint-1-subscribe.md';
  removeWorkstreamsSection(sprintFile);
  
  const analyzeScript = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-analyze.js');
  execSync(`node "${analyzeScript}" "${sprintFile}" --workstreams="ui-components:TASK-101,TASK-102;backend-api:TASK-103,TASK-104;testing:TASK-105"`, { stdio: 'pipe', cwd: process.cwd() });
  
  const script = path.join(process.cwd(), 'sprint-orchestrator', 'scripts', 'sprint-push.js');
  
  try {
    execSync(`node "${script}" non-existent-workstream`, { stdio: 'pipe', cwd: process.cwd() });
    assert.fail('Should have failed for non-existent workstream');
  } catch (error) {
    assert.ok(error.status !== 0, 'Should exit with non-zero status');
  }
});

