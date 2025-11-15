const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const workstreamName = process.argv[2];
const skipQualityGates = process.argv.includes('--skip-quality-gates');

if (!workstreamName) {
  console.error('Usage: pnpm sprint:complete <workstream-name> [--skip-quality-gates]');
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

// Run quality gates before marking complete (unless skipped)
const worktreePath = path.resolve(process.cwd(), workstream.worktree);
if (!skipQualityGates && fs.existsSync(worktreePath)) {
  const qualityGatesPath = path.join(worktreePath, '.claude/quality-gates.json');
  if (fs.existsSync(qualityGatesPath)) {
    const qualityGatesConfig = JSON.parse(fs.readFileSync(qualityGatesPath, 'utf8'));
    if (qualityGatesConfig.enabled === true) {
      console.log('🔍 Running quality gates before marking complete...\n');
      try {
        // Run quality gates script
        const frameworkDir = path.resolve(__dirname, '../..');
        const qualityGatesScript = path.join(frameworkDir, 'scripts/sprint-quality-gates.js');
        execSync(`node "${qualityGatesScript}" --worktree "${worktreePath}"`, {
          stdio: 'inherit',
          cwd: worktreePath
        });
        console.log('\n✅ Quality gates passed\n');
      } catch (error) {
        console.error('\n❌ Quality gates failed. Fix issues before marking complete.');
        console.error('   Use --skip-quality-gates to skip (not recommended)');
        process.exit(1);
      }
    }
  }
} else if (skipQualityGates) {
  console.log('⚠️  Skipping quality gates (--skip-quality-gates flag)');
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





