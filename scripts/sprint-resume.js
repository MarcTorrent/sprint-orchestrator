const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const workstreamName = process.argv[2];
if (!workstreamName) {
  console.error('Usage: pnpm sprint:resume <workstream-name>');
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
  console.error(`❌ Worktree directory not found for '${workstreamName}' at ${worktreePath}. Please run 'pnpm sprint:create-workstreams' first.`);
  process.exit(1);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`▶️ RESUMING WORKSTREAM: ${workstream.name}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

try {
  // Change to worktree directory
  process.chdir(worktreePath);
  console.log(`✅ Changed directory to: ${process.cwd()}`);

  // Verify current branch
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  const expectedBranch = `feature/${workstream.name}-workstream`;
  if (currentBranch !== expectedBranch) {
    console.warn(`⚠️ Warning: Current branch is '${currentBranch}', expected '${expectedBranch}'. Switching...`);
    execSync(`git checkout ${expectedBranch}`, { stdio: 'inherit' });
  } else {
    console.log(`✅ Currently on branch: ${currentBranch}`);
  }

  // Update workstream status to in_progress if it's ready_to_start or pending
  if (workstream.status === 'ready_to_start' || workstream.status === 'pending') {
    workstream.status = 'in_progress';
    fs.writeFileSync(sprintConfigPath, JSON.stringify(sprintConfig, null, 2));
    console.log(`✅ Workstream status updated to: ${workstream.status}`);
  }

  console.log('\n📋 ASSIGNED TASKS:');
  workstream.tasks.forEach(task => console.log(`- ${task}`));

  console.log('\n🎯 AGENT RESPONSIBILITIES:');
  console.log('   ✅ Work ONLY on tasks assigned to your workstream');
  console.log('   ✅ Implement tasks sequentially (TDD workflow)');
  console.log('   ✅ Run quality gates before each commit');
  console.log('   ✅ Commit after each completed task');
  console.log('   ✅ Run `pnpm sprint:complete <name>` when ALL tasks done');
  console.log('   ❌ DON\'T push to GitHub (orchestrator does this)');
  console.log('   ❌ DON\'T merge branches');
  console.log('   ❌ DON\'T create PRs');

  console.log('\n💡 RECOMMENDATION: Run `pnpm install` and `pnpm dev` to start working.');

} catch (error) {
  console.error('❌ Failed to resume workstream:', error.message);
  process.exit(1);
}





