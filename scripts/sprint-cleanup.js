#!/usr/bin/env node

/**
 * Sprint Cleanup Script
 * 
 * Cleans up one or all workstreams from the active sprint.
 * Reads sprint configuration from .claude/sprint-config.json
 * 
 * Usage:
 *   pnpm sprint:cleanup <workstream-name>  # Clean up single workstream
 *   pnpm sprint:cleanup                    # Clean up all workstreams
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const workstreamName = process.argv[2]; // Optional: specific workstream to clean

const sprintConfigPath = path.join(process.cwd(), '.claude/sprint-config.json');
if (!fs.existsSync(sprintConfigPath)) {
  console.error('❌ Sprint configuration not found. Please run `pnpm sprint:analyze <sprint-file>` first.');
  process.exit(1);
}

const sprintConfig = JSON.parse(fs.readFileSync(sprintConfigPath, 'utf8'));

// Determine which workstreams to clean
let workstreamsToClean;
if (workstreamName) {
  // Clean single workstream
  const workstream = sprintConfig.workstreams.find(ws => ws.name === workstreamName);
  if (!workstream) {
    console.error(`❌ Workstream '${workstreamName}' not found in sprint configuration.`);
    console.error(`Available workstreams: ${sprintConfig.workstreams.map(ws => ws.name).join(', ')}`);
    process.exit(1);
  }
  workstreamsToClean = [workstream];
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🧹 CLEANING UP WORKSTREAM: ${workstreamName}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
} else {
  // Clean all workstreams
  workstreamsToClean = sprintConfig.workstreams;
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧹 CLEANING UP ALL SPRINT WORKSTREAMS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Sprint: ${sprintConfig.sprint || 'Unknown'}`);
  console.log(`Workstreams: ${workstreamsToClean.length}`);
}

try {
  // Check if workstreams are completed/merged (warning only)
  const incompleteWorkstreams = workstreamsToClean.filter(ws => 
    ws.status !== 'completed' && 
    ws.status !== 'merged' && 
    ws.status !== 'merged_and_cleaned'
  );
  
  if (incompleteWorkstreams.length > 0) {
    console.log('\n⚠️ Warning: Some workstreams may not be completed:');
    incompleteWorkstreams.forEach(ws => {
      console.log(`   - ${ws.name}: ${ws.status}`);
    });
    console.log('\nProceeding with cleanup anyway...');
  }

  // Remove worktrees
  console.log('\n🗑️ Removing worktrees...');
  let removedCount = 0;
  workstreamsToClean.forEach(ws => {
    const worktreePath = path.resolve(process.cwd(), ws.worktree);

    if (fs.existsSync(worktreePath)) {
      try {
        console.log(`   Removing worktree: ${ws.name}`);
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
          console.log(`   ⚠️ Failed to remove worktree ${ws.name}: ${forceError.message}`);
        }
      }
    } else {
      console.log(`   ℹ️  Worktree not found: ${ws.name} (may already be removed)`);
    }
  });

  // Delete local branches
  console.log('\n🌿 Deleting local branches...');
  let deletedCount = 0;
  workstreamsToClean.forEach(ws => {
    const branchName = `feature/${ws.name}-workstream`;
    try {
      // Make sure we're not on the branch
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      if (currentBranch === branchName) {
        execSync('git checkout develop', { stdio: 'pipe' });
      }
      
      execSync(`git branch -D "${branchName}"`, { stdio: 'pipe' });
      console.log(`   ✅ Deleted local branch: ${branchName}`);
      deletedCount++;
    } catch (error) {
      console.log(`   ℹ️  Branch not found or already deleted: ${branchName}`);
    }
  });

  // Update config: remove cleaned workstreams or update status
  if (workstreamName) {
    // Single workstream: update status or remove from config
    const workstream = sprintConfig.workstreams.find(ws => ws.name === workstreamName);
    if (workstream) {
      workstream.status = 'merged_and_cleaned';
      fs.writeFileSync(sprintConfigPath, JSON.stringify(sprintConfig, null, 2));
    }
  } else {
    // All workstreams: remove config file
    if (fs.existsSync(sprintConfigPath)) {
      fs.unlinkSync(sprintConfigPath);
      console.log('\n📝 Removed sprint configuration');
    }
  }

  // Show remote branches info
  console.log('\n🌐 Remote branches (preserved for history):');
  workstreamsToClean.forEach(ws => {
    const branchName = `feature/${ws.name}-workstream`;
    console.log(`   - origin/${branchName}`);
  });

  if (workstreamsToClean.length > 0) {
    console.log('\n💡 To delete remote branches, run:');
    workstreamsToClean.forEach(ws => {
      const branchName = `feature/${ws.name}-workstream`;
      console.log(`   git push origin --delete ${branchName}`);
    });
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ CLEANUP COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n📋 CLEANUP SUMMARY:');
  console.log(`   - Worktrees removed: ${removedCount}/${workstreamsToClean.length}`);
  console.log(`   - Local branches deleted: ${deletedCount}/${workstreamsToClean.length}`);
  
  if (workstreamName) {
    console.log(`\n🎯 NEXT STEPS:`);
    console.log(`   🔄 Run: pnpm sprint:sync-all (to sync remaining workstreams)`);
    console.log(`   📊 Run: pnpm sprint:status (to check remaining workstreams)`);
  }

} catch (error) {
  console.error('❌ Failed to cleanup:', error.message);
  process.exit(1);
}
