const fs = require('fs');
const path = require('path');

const workstreamName = process.argv[2];
if (!workstreamName) {
  console.error('Usage: pnpm sprint:complete <workstream-name>');
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

workstream.status = 'completed';
workstream.completedAt = new Date().toISOString();
fs.writeFileSync(sprintConfigPath, JSON.stringify(sprintConfig, null, 2));

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`✅ WORKSTREAM COMPLETE: ${workstream.name}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log('\nTasks completed: (Assuming all tasks in sprint file are checked)');
workstream.tasks.forEach(task => console.log(`- ✅ ${task}`));

console.log(`\nStatus: Ready to Push`);
console.log(`Worktree: ${workstream.worktree}`);
console.log(`Branch: feature/${workstream.name}-workstream`);

console.log('\n📝 NEXT STEPS:');
console.log(`Orchestrator should run: pnpm sprint:push ${workstream.name}`);





