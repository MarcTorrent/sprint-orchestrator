const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sprintFile = process.argv[2];
if (!sprintFile) {
  console.error('Usage: pnpm sprint:create-workstreams <sprint-file>');
  process.exit(1);
}

const sprintFilePath = path.resolve(process.cwd(), sprintFile);
if (!fs.existsSync(sprintFilePath)) {
  console.error(`❌ Sprint file not found: ${sprintFile}`);
  process.exit(1);
}

const sprintConfigPath = path.join(process.cwd(), '.claude/sprint-config.json');
if (!fs.existsSync(sprintConfigPath)) {
  console.error('❌ Sprint configuration not found. Please run `pnpm sprint:analyze <sprint-file>` first.');
  process.exit(1);
}

const sprintConfig = JSON.parse(fs.readFileSync(sprintConfigPath, 'utf8'));

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🛠️ CREATING WORKSTREAMS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

try {
  // Ensure on develop branch and up-to-date
  execSync('git checkout develop', { stdio: 'inherit' });
  try {
    execSync('git pull origin develop', { stdio: 'inherit' });
  } catch (error) {
    if (error.message.includes('Username') || error.message.includes('Device not configured')) {
      console.log('⚠️ Skipping git pull (authentication required)');
    } else {
      console.log('⚠️ Skipping git pull (no remote or other issues)');
    }
  }

  sprintConfig.workstreams.forEach(ws => {
    const branchName = `feature/${ws.name}-workstream`;
    const worktreePath = path.join(process.cwd(), ws.worktree);

    console.log(`\nCreating branch and worktree for ${ws.name}...`);

    // First, create the branch from develop if it doesn't exist
    try {
      execSync(`git show-ref --verify --quiet refs/heads/${branchName}`);
      console.log(`   Branch '${branchName}' already exists.`);
    } catch (error) {
      console.log(`   Creating branch '${branchName}' from develop...`);
      execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
      execSync('git checkout develop', { stdio: 'inherit' });
    }

    // Then create the worktree
    console.log(`   Creating worktree at ${worktreePath}...`);
    try {
      execSync(`git worktree add ${worktreePath} ${branchName}`, { stdio: 'inherit' });
      console.log(`✅ Worktree and branch '${branchName}' created.`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`   Worktree already exists, removing and recreating...`);
        execSync(`git worktree remove ${worktreePath}`, { stdio: 'inherit' });
        execSync(`git worktree add ${worktreePath} ${branchName}`, { stdio: 'inherit' });
        console.log(`✅ Worktree and branch '${branchName}' recreated.`);
      } else {
        throw error;
      }
    }
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ WORKSTREAMS CREATED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n📋 WORKSTREAMS READY:');
  sprintConfig.workstreams.forEach(ws => {
    console.log(`- ${ws.name}: ${ws.worktree}`);
  });

  console.log('\n🎯 NEXT STEPS:');
  console.log('Choose execution mode:');
  console.log('\nOption A: Manual subinstances (Cursor)');
  console.log('- Create new chat instances manually');
  console.log('- Each instance runs: pnpm sprint:resume <workstream-name>');
  console.log('\nOption B: Subagents (Claude Code)');
  console.log('- Subagents take worktrees and work on them');
  console.log('- Each subagent can create sub-subagents for parallel tasks within workstream');

} catch (error) {
  console.error('❌ Failed to create workstreams:', error.message);
  process.exit(1);
}
