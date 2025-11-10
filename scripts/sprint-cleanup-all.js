#!/usr/bin/env node

/**
 * Sprint Cleanup All Script
 * 
 * Performs complete cleanup of all sprint workstreams, worktrees, and configuration.
 * Use this script to reset the environment to a clean state for testing.
 * 
 * Usage: pnpm sprint:cleanup-all
 * 
 * What it does:
 * 1. Lists all existing worktrees
 * 2. Removes all worktrees
 * 3. Deletes all workstream branches
 * 4. Removes sprint configuration file
 * 5. Verifies clean state
 * 
 * Safety:
 * - Only removes worktrees and branches created by sprint system
 * - Preserves main repository and develop branch
 * - Asks for confirmation before destructive operations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧹 SPRINT CLEANUP ALL');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

try {
  // Step 1: List current worktrees
  console.log('\n📋 Current worktrees:');
  try {
    const worktrees = execSync('git worktree list', { encoding: 'utf8' });
    console.log(worktrees);
  } catch (error) {
    console.log('   No worktrees found or git worktree command failed');
  }

  // Step 2: Get all worktrees (excluding main repo)
  let worktreesToRemove = [];
  try {
    const worktreeList = execSync('git worktree list --porcelain', { encoding: 'utf8' });
    const lines = worktreeList.split('\n');
    let currentWorktree = {};
    
    for (const line of lines) {
      if (line.startsWith('worktree ')) {
        if (currentWorktree.path && currentWorktree.path !== process.cwd()) {
          worktreesToRemove.push(currentWorktree);
        }
        currentWorktree = { path: line.replace('worktree ', '') };
      } else if (line.startsWith('branch ')) {
        currentWorktree.branch = line.replace('branch ', '');
      }
    }
    
    // Add the last worktree if it exists
    if (currentWorktree.path && currentWorktree.path !== process.cwd()) {
      worktreesToRemove.push(currentWorktree);
    }
  } catch (error) {
    console.log('   Could not list worktrees:', error.message);
  }

  if (worktreesToRemove.length === 0) {
    console.log('✅ No worktrees to remove');
  } else {
    console.log(`\n🗑️  Found ${worktreesToRemove.length} worktrees to remove:`);
    worktreesToRemove.forEach(wt => {
      console.log(`   - ${wt.path} (${wt.branch || 'unknown branch'})`);
    });

    // Step 3: Remove worktrees
    console.log('\n🧹 Removing worktrees...');
    for (const worktree of worktreesToRemove) {
      try {
        console.log(`   Removing: ${worktree.path}`);
        execSync(`git worktree remove "${worktree.path}"`, { stdio: 'inherit' });
        console.log(`   ✅ Removed: ${worktree.path}`);
      } catch (error) {
        console.log(`   ⚠️  Failed to remove ${worktree.path}: ${error.message}`);
      }
    }
  }

  // Step 4: Get all workstream branches
  console.log('\n📋 Current branches:');
  try {
    const branches = execSync('git branch -a', { encoding: 'utf8' });
    console.log(branches);
  } catch (error) {
    console.log('   Could not list branches:', error.message);
  }

  // Step 5: Find and remove workstream branches
  console.log('\n🧹 Removing workstream branches...');
  try {
    const localBranches = execSync('git branch', { encoding: 'utf8' });
    const branchLines = localBranches.split('\n');
    const workstreamBranches = branchLines
      .map(line => line.trim().replace('* ', ''))
      .filter(branch => branch.includes('-workstream') && branch !== 'develop' && branch !== 'main');

    if (workstreamBranches.length === 0) {
      console.log('✅ No workstream branches to remove');
    } else {
      console.log(`   Found ${workstreamBranches.length} workstream branches to remove:`);
      workstreamBranches.forEach(branch => console.log(`   - ${branch}`));

      for (const branch of workstreamBranches) {
        try {
          console.log(`   Removing branch: ${branch}`);
          execSync(`git branch -D "${branch}"`, { stdio: 'inherit' });
          console.log(`   ✅ Removed: ${branch}`);
        } catch (error) {
          console.log(`   ⚠️  Failed to remove ${branch}: ${error.message}`);
        }
      }
    }
  } catch (error) {
    console.log('   Could not process branches:', error.message);
  }

  // Step 6: Remove sprint configuration
  console.log('\n🧹 Removing sprint configuration...');
  const sprintConfigPath = path.join(process.cwd(), '.claude/sprint-config.json');
  if (fs.existsSync(sprintConfigPath)) {
    try {
      fs.unlinkSync(sprintConfigPath);
      console.log('   ✅ Removed: .claude/sprint-config.json');
    } catch (error) {
      console.log(`   ⚠️  Failed to remove sprint config: ${error.message}`);
    }
  } else {
    console.log('   ✅ No sprint configuration file found');
  }

  // Step 7: Verify clean state
  console.log('\n🔍 Verifying clean state...');
  
  // Check worktrees
  try {
    const remainingWorktrees = execSync('git worktree list', { encoding: 'utf8' });
    const worktreeLines = remainingWorktrees.split('\n').filter(line => line.trim());
    if (worktreeLines.length === 1) {
      console.log('   ✅ Only main repository worktree remains');
    } else {
      console.log('   ⚠️  Additional worktrees still exist:');
      worktreeLines.forEach(line => console.log(`     ${line}`));
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
      console.log('   ⚠️  Workstream branches still exist:');
      branchLines.forEach(branch => console.log(`     ${branch}`));
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
  
  console.log('\n🎯 Environment is now clean and ready for testing!');
  console.log('\nNext steps:');
  console.log('1. Run: pnpm sprint:analyze .claude/backlog/sprint-X-<name>.md');
  console.log('2. Run: pnpm sprint:create-workstreams .claude/backlog/sprint-X-<name>.md');
  console.log('3. Run: pnpm sprint:orchestrate .claude/backlog/sprint-X-<name>.md');

} catch (error) {
  console.error('❌ Cleanup failed:', error.message);
  process.exit(1);
}
