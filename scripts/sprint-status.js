const fs = require('fs');
const path = require('path');

const sprintConfigPath = path.join(process.cwd(), '.claude/sprint-config.json');

if (!fs.existsSync(sprintConfigPath)) {
  console.error('❌ Sprint configuration not found. Please run `pnpm sprint:analyze <sprint-file>` first.');
  process.exit(1);
}

const sprintConfig = JSON.parse(fs.readFileSync(sprintConfigPath, 'utf8'));

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 SPRINT WORKSTREAM STATUS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (sprintConfig.workstreams.length === 0) {
  console.log('No workstreams defined for this sprint.');
} else {
  sprintConfig.workstreams.forEach((ws, index) => {
    console.log(`\nWORKSTREAM ${index + 1}: ${ws.name}`);
    console.log(`  Status: ${ws.status}`);
    console.log(`  Tasks: ${ws.tasks.join(', ')}`);
    if (ws.completedAt) {
      console.log(`  Completed At: ${new Date(ws.completedAt).toLocaleString()}`);
    }
    console.log(`  Worktree Path: ${ws.worktree}`);
  });
}





