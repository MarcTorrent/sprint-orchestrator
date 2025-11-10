const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Demo mode flag - set to true for demo purposes
const DEMO_MODE = true;

const workstreamName = process.argv[2];
if (!workstreamName) {
  console.error('Usage: pnpm sprint:push <workstream-name>');
  process.exit(1);
}

const sprintConfigPath = path.join(process.cwd(), '.claude/sprint-config.json');
if (!fs.existsSync(sprintConfigPath)) {
  console.error('❌ Sprint configuration not found. Please run `pnpm sprint:analyze <sprint-file>` first.');
  process.exit(1);
}

const sprintConfig = JSON.parse(fs.readFileSync(sprintConfigPath, 'utf8'));
const workstream = sprintConfig.workstreams.find(ws => ws.name === workstreamName);

if (!workstream) {
  console.error(`❌ Workstream '${workstreamName}' not found in sprint configuration.`);
  process.exit(1);
}

const worktreePath = path.resolve(process.cwd(), workstream.worktree);
if (!fs.existsSync(worktreePath)) {
  console.error(`❌ Worktree directory not found for '${workstreamName}' at ${worktreePath}.`);
  process.exit(1);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`🚀 PUSHING WORKSTREAM: ${workstream.name}`);
if (DEMO_MODE) {
  console.log('🎭 DEMO MODE: Simulating git push operations');
}
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

try {
  // Change to worktree directory
  process.chdir(worktreePath);
  console.log(`✅ Changed directory to: ${process.cwd()}`);

  // Check if there are commits to push
  const status = execSync('git status --porcelain').toString().trim();
  if (status) {
    console.log('⚠️ Warning: Uncommitted changes detected:');
    console.log(status);
    console.log('Please commit changes before pushing.');
    process.exit(1);
  }

  // Check if branch exists on remote
  const branchName = `feature/${workstream.name}-workstream`;
  let remoteExists = false;

  if (DEMO_MODE) {
    console.log('🎭 [DEMO] Simulating: git ls-remote --heads origin');
    console.log('   Checking if branch exists on remote...');
    remoteExists = false; // Simulate new branch for demo
  } else {
    try {
      execSync(`git ls-remote --heads origin ${branchName}`, { stdio: 'pipe' });
      remoteExists = true;
    } catch (error) {
      remoteExists = false;
    }
  }

  // Push branch
  if (DEMO_MODE) {
    if (remoteExists) {
      console.log(`🎭 [DEMO] Simulating: git push origin ${branchName}`);
      console.log('   Enumerating objects: 5, done.');
      console.log('   Counting objects: 100% (5/5), done.');
      console.log('   Delta compression using up to 8 threads');
      console.log('   Compressing objects: 100% (3/3), done.');
      console.log('   Writing objects: 100% (3/3), 1.2 KiB | 1.2 MiB/s, done.');
      console.log(`   To https://github.com/demo/repo.git`);
      console.log(`   abc1234..def5678  ${branchName} -> ${branchName}`);
    } else {
      console.log(`🎭 [DEMO] Simulating: git push -u origin ${branchName}`);
      console.log('   Enumerating objects: 5, done.');
      console.log('   Counting objects: 100% (5/5), done.');
      console.log('   Delta compression using up to 8 threads');
      console.log('   Compressing objects: 100% (3/3), done.');
      console.log('   Writing objects: 100% (3/3), 1.2 KiB | 1.2 MiB/s, done.');
      console.log(`   To https://github.com/demo/repo.git`);
      console.log(`   * [new branch]      ${branchName} -> ${branchName}`);
      console.log(`   Branch '${branchName}' set up to track remote branch '${branchName}' from 'origin'.`);
    }
  } else {
    if (remoteExists) {
      console.log(`📤 Updating existing remote branch: ${branchName}`);
      execSync(`git push origin ${branchName}`, { stdio: 'inherit' });
    } else {
      console.log(`📤 Creating new remote branch: ${branchName}`);
      execSync(`git push -u origin ${branchName}`, { stdio: 'inherit' });
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ WORKSTREAM PUSHED: ${workstream.name}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log(`\nBranch: ${branchName}`);
  console.log(`Remote: origin/${branchName}`);

  console.log('\n📝 NEXT STEPS:');
  console.log('1. Create a Pull Request for this branch');
  console.log('2. Wait for review and merge to develop');
  console.log('3. Run `pnpm sprint:sync-all` after merge');

} catch (error) {
  console.error('❌ Failed to push workstream:', error.message);
  process.exit(1);
}





