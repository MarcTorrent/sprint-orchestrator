#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎯 SPRINT ORCHESTRATOR');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// Check if we're in a git repository
try {
  require('child_process').execSync('git rev-parse --git-dir', { stdio: 'pipe' });
} catch (error) {
  console.log('❌ Not in a git repository. Please run from project root.');
  process.exit(1);
}

// Check for sprint config
const configPath = '.claude/sprint-config.json';
if (!fs.existsSync(configPath)) {
  console.log('📋 No sprint configuration found.');
  console.log('   Run: pnpm sprint:analyze <sprint-file>');
  console.log('');
  console.log('🎯 ORCHESTRATOR RESPONSIBILITIES:');
  console.log('   ✅ Monitor progress across all workstreams');
  console.log('   ✅ Verify completed workstreams (each runs on different port)');
  console.log('   ✅ Run quality gates on completed workstreams');
  console.log('   ✅ Push workstreams to GitHub sequentially (one at a time)');
  console.log('   ✅ Sync all workstreams after each merge');
  console.log('   ✅ Handle merge conflicts');
  console.log('   ✅ Clean up worktrees when sprint complete');
  console.log('   ❌ DON\'T work on individual tasks (that\'s for agents)');
  console.log('');
  console.log('📝 AVAILABLE COMMANDS:');
  console.log('   pnpm sprint:analyze <sprint-file>     - Analyze sprint for workstreams');
  console.log('   pnpm sprint:create-workstreams <file> - Create workstreams and worktrees');
  console.log('   pnpm sprint:status                    - Show workstream status');
  console.log('   pnpm sprint:push <workstream>         - Push workstream to GitHub');
  console.log('   pnpm sprint:sync-all                  - Sync all workstreams');
  console.log('   pnpm sprint:cleanup                   - Clean up completed workstreams');
  process.exit(0);
}

// Load and display sprint configuration
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('📊 SPRINT CONFIGURATION:');
console.log(`   Sprint: ${config.sprint || 'Unknown'}`);
console.log(`   Workstreams: ${config.workstreams?.length || 0}`);
console.log('');

if (config.workstreams && config.workstreams.length > 0) {
  console.log('📋 WORKSTREAM STATUS:');
  config.workstreams.forEach((ws, index) => {
    const status = ws.status || 'unknown';
    const statusIcon = status === 'completed' ? '✅' : 
                      status === 'in_progress' ? '🔄' : 
                      status === 'ready_to_start' ? '⏳' : '❓';
    console.log(`   ${index + 1}. ${ws.name}: ${statusIcon} ${status}`);
  });
  console.log('');
}

console.log('🎯 ORCHESTRATOR RESPONSIBILITIES:');
console.log('   ✅ Monitor progress across all workstreams');
console.log('   ✅ Verify completed workstreams (each runs on different port)');
console.log('   ✅ Run quality gates on completed workstreams');
console.log('   ✅ Push workstreams to GitHub sequentially (one at a time)');
console.log('   ✅ Sync all workstreams after each merge');
console.log('   ✅ Handle merge conflicts');
console.log('   ✅ Clean up worktrees when sprint complete');
console.log('   ❌ DON\'T work on individual tasks (that\'s for agents)');
console.log('');
console.log('🎭 DEMO MODE: Git operations are simulated for demo purposes');
console.log('');
console.log('📝 AVAILABLE COMMANDS:');
console.log('   pnpm sprint:status                    - Show detailed workstream status');
console.log('   pnpm sprint:push <workstream>         - Push workstream to GitHub');
console.log('   pnpm sprint:sync-all                  - Sync all workstreams');
console.log('   pnpm sprint:cleanup-workstream <ws>   - Clean up specific workstream');
console.log('   pnpm sprint:cleanup                   - Clean up all workstreams');
