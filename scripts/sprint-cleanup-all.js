#!/usr/bin/env node

/**
 * Sprint Cleanup All Script
 * 
 * Performs complete cleanup of all workstreams from the active sprint.
 * Reads sprint configuration from .claude/sprint-config.json
 * Use this script to reset the environment to a clean state for testing.
 * 
 * Usage: pnpm sprint:cleanup-all
 * 
 * What it does:
 * 1. Reads active sprint from .claude/sprint-config.json
 * 2. Removes all worktrees for workstreams in active sprint
 * 3. Deletes all workstream branches from active sprint
 * 4. Removes sprint configuration file
 * 5. Verifies clean state
 * 
 * Safety:
 * - Only removes worktrees and branches from active sprint
 * - Preserves main repository and develop branch
 * - Preserves non-workstream branches
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧹 SPRINT CLEANUP ALL');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const sprintConfigPath = path.join(process.cwd(), '.claude/sprint-config.json');

// Check if sprint config exists
if (!fs.existsSync(sprintConfigPath)) {
  console.log('ℹ️  No active sprint configuration found.');
  console.log('   Run `pnpm sprint:analyze <sprint-file>` to create a sprint first.');
  process.exit(0);
}

const sprintConfig = JSON.parse(fs.readFileSync(sprintConfigPath, 'utf8'));

console.log(`\nSprint: ${sprintConfig.sprint || 'Unknown'}`);
console.log(`Workstreams: ${sprintConfig.workstreams.length}`);

try {
  // Step 1: Remove worktrees from active sprint
  console.log('\n🗑️  Removing worktrees...');
  let removedCount = 0;
  
  sprintConfig.workstreams.forEach(ws => {
    const worktreePath = path.resolve(process.cwd(), ws.worktree);
    
    if (fs.existsSync(worktreePath)) {
      try {
        console.log(`   Removing: ${ws.name}`);
        execSync(`git worktree remove "${worktreePath}"`, { stdio: 'pipe' });
        console.log(`   ✅ Removed: ${ws.name}`);
        removedCount++;
      } catch (error) {
        // Try force remove
        try {
          execSync(`git worktree remove --force "${worktreePath}"`, { stdio: 'pipe' });
          console.log(`   ✅ Removed (forced): ${ws.name}`);
          removedCount++;
        } catch (forceError) {
          console.log(`   ⚠️  Failed to remove ${ws.name}: ${forceError.message}`);
        }
      }
    } else {
      console.log(`   ℹ️  Worktree not found: ${ws.name} (may already be removed)`);
    }
  });

  // Step 2: Delete workstream branches from active sprint
  console.log('\n🌿 Deleting workstream branches...');
  let deletedCount = 0;
  
  sprintConfig.workstreams.forEach(ws => {
    const branchName = `feature/${ws.name}-workstream`;
    try {
      // Make sure we're not on the branch
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      if (currentBranch === branchName) {
        execSync('git checkout develop', { stdio: 'pipe' });
      }
      
      execSync(`git branch -D "${branchName}"`, { stdio: 'pipe' });
      console.log(`   ✅ Deleted: ${branchName}`);
      deletedCount++;
    } catch (error) {
      console.log(`   ℹ️  Branch not found or already deleted: ${branchName}`);
    }
  });

  // Step 3: Remove sprint configuration
  console.log('\n📝 Removing sprint configuration...');
  if (fs.existsSync(sprintConfigPath)) {
    fs.unlinkSync(sprintConfigPath);
    console.log('   ✅ Removed: .claude/sprint-config.json');
  }

  // Step 4: Verify clean state
  console.log('\n🔍 Verifying clean state...');
  
  // Check worktrees
  try {
    const remainingWorktrees = execSync('git worktree list', { encoding: 'utf8' });
    const worktreeLines = remainingWorktrees.split('\n').filter(line => line.trim());
    if (worktreeLines.length === 1) {
      console.log('   ✅ Only main repository worktree remains');
    } else {
      console.log(`   ⚠️  ${worktreeLines.length - 1} additional worktree(s) still exist`);
      console.log('      (may be from other sprints or manual worktrees)');
    }
  } catch (error) {
    console.log('   ⚠️  Could not verify worktrees:', error.message);
  }

  // Check branches
  try {
    const remainingBranches = execSync('git branch', { encoding: 'utf8' });
    const branchLines = remainingBranches.split('\n')
      .map(line => line.trim().replace('* ', ''))
      .filter(branch => branch.includes('-workstream'));
    
    if (branchLines.length === 0) {
      console.log('   ✅ No workstream branches remain');
    } else {
      console.log(`   ⚠️  ${branchLines.length} workstream branch(es) still exist`);
      console.log('      (may be from other sprints)');
    }
  } catch (error) {
    console.log('   ⚠️  Could not verify branches:', error.message);
  }

  // Check sprint config
  if (!fs.existsSync(sprintConfigPath)) {
    console.log('   ✅ Sprint configuration removed');
  } else {
    console.log('   ⚠️  Sprint configuration still exists');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ CLEANUP COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('\n📋 CLEANUP SUMMARY:');
  console.log(`   - Worktrees removed: ${removedCount}/${sprintConfig.workstreams.length}`);
  console.log(`   - Branches deleted: ${deletedCount}/${sprintConfig.workstreams.length}`);
  console.log('   - Sprint configuration removed');
  
  console.log('\n🎯 Environment is now clean and ready for testing!');
console.log('\nNext steps:');
console.log('1. Run: pnpm sprint:analyze .claude/backlog/sprint-X-<name>.md');
console.log('2. Run: pnpm sprint:create-workstreams');
console.log('3. Run: pnpm sprint:orchestrate');

} catch (error) {
  console.error('❌ Cleanup failed:', error.message);
  process.exit(1);
}
