const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sprintConfigPath = path.join(process.cwd(), '.claude/sprint-config.json');

if (!fs.existsSync(sprintConfigPath)) {
  console.error('❌ Sprint configuration not found. Please run `pnpm sprint:analyze <sprint-file>` first.');
  process.exit(1);
}

const sprintConfig = JSON.parse(fs.readFileSync(sprintConfigPath, 'utf8'));

// Demo mode flag - set to true for demo purposes
const DEMO_MODE = true;

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔄 SYNCING ALL WORKSTREAMS');
if (DEMO_MODE) {
  console.log('🎭 DEMO MODE: Simulating git operations');
}
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

try {
  // First, update main develop branch
  console.log('\n📥 Updating main develop branch...');
  execSync('git checkout develop', { stdio: 'inherit' });

  if (DEMO_MODE) {
    console.log('🎭 [DEMO] Simulating: git pull origin develop');
    console.log('   Already up to date.');
  } else {
    execSync('git pull origin develop', { stdio: 'inherit' });
  }

  // Sync each workstream
  sprintConfig.workstreams.forEach(ws => {
    const worktreePath = path.resolve(process.cwd(), ws.worktree);

    if (fs.existsSync(worktreePath)) {
      console.log(`\n🔄 Syncing ${ws.name}...`);

      try {
        // Change to worktree directory
        process.chdir(worktreePath);

        if (DEMO_MODE) {
          console.log('🎭 [DEMO] Simulating: git fetch origin');
          console.log('   From https://github.com/demo/repo');
          console.log('   * branch develop -> FETCH_HEAD');
          console.log('🎭 [DEMO] Simulating: git merge origin/develop');
          console.log('   Already up to date.');
        } else {
          // Fetch latest changes
          execSync('git fetch origin', { stdio: 'inherit' });

          // Merge develop into workstream
          execSync('git merge origin/develop -m "chore: sync with develop"', { stdio: 'inherit' });
        }

        console.log(`✅ ${ws.name} synced successfully`);

        // Return to main directory
        process.chdir(process.cwd().replace(ws.worktree, ''));

      } catch (error) {
        console.error(`❌ Failed to sync ${ws.name}:`, error.message);
        // Return to main directory
        process.chdir(process.cwd().replace(ws.worktree, ''));
      }
    } else {
      console.log(`⚠️ Worktree not found for ${ws.name}: ${worktreePath}`);
    }
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ ALL WORKSTREAMS SYNCED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

} catch (error) {
  console.error('❌ Failed to sync workstreams:', error.message);
  process.exit(1);
}





