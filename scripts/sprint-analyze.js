#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const sprintFile = process.argv[2];

if (!sprintFile) {
  console.log('❌ Please provide a sprint file path');
  console.log('Usage: pnpm sprint:analyze <sprint-file>');
  process.exit(1);
}

if (!fs.existsSync(sprintFile)) {
  console.log(`❌ Sprint file not found: ${sprintFile}`);
  process.exit(1);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 SPRINT WORKSTREAM ANALYSIS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// Parse sprint file
const content = fs.readFileSync(sprintFile, 'utf8');
const lines = content.split('\n');

// Extract workstreams from sprint file
const workstreams = [];
let currentWorkstream = null;

for (const line of lines) {
  if (line.includes('### Workstream') || line.includes('**Workstream**')) {
    const match = line.match(/Workstream\s+(\d+):\s*([^(]+)/);
    if (match) {
      currentWorkstream = {
        id: match[1],
        name: match[2].trim().toLowerCase().replace(/\s+/g, '-'),
        tasks: [],
        dependencies: [],
        fileConflicts: []
      };
      workstreams.push(currentWorkstream);
    }
  } else if (line.includes('**Tasks**:') && currentWorkstream) {
    const taskMatch = line.match(/\*\*Tasks\*\*:\s*(.+)/);
    if (taskMatch) {
      const tasks = taskMatch[1].split(',').map(t => t.trim());
      currentWorkstream.tasks = tasks;
    }
  } else if (line.includes('**Dependencies**:') && currentWorkstream) {
    const depMatch = line.match(/\*\*Dependencies\*\*:\s*(.+)/);
    if (depMatch) {
      const deps = depMatch[1].split(',').map(d => d.trim());
      currentWorkstream.dependencies = deps;
    }
  }
}

// Display analysis
workstreams.forEach((ws, index) => {
  const parallelSafe = ws.dependencies.length === 0 || ws.dependencies.every(d => d === 'None');
  const status = parallelSafe ? '✅' : '⚠️';
  
  console.log(`${status} WORKSTREAM ${index + 1}: ${ws.name} (${ws.tasks.length} tasks - ${parallelSafe ? 'parallel safe' : 'sequential'})`);
  console.log(`   - Tasks: ${ws.tasks.join(', ')}`);
  if (ws.dependencies.length > 0 && !ws.dependencies.every(d => d === 'None')) {
    console.log(`   - Dependencies: ${ws.dependencies.join(', ')}`);
  }
  console.log(`   - File conflicts: ${ws.fileConflicts.length > 0 ? ws.fileConflicts.join(', ') : 'None detected'}`);
  const worktreePath = `../worktrees/${ws.name}/`;
  console.log(`   - Worktree: ${worktreePath}`);
  console.log('');
});

console.log('💡 RECOMMENDATION: Use workstream parallelization');
console.log(`   Command: pnpm sprint:create-workstreams ${sprintFile}`);
console.log('');

// Create sprint config
const config = {
  sprint: path.basename(sprintFile, '.md'),
  workstreams: workstreams.map(ws => ({
    name: ws.name,
    status: 'ready_to_start',
    tasks: ws.tasks,
    worktree: `../worktrees/${ws.name}/`,
    dependencies: ws.dependencies,
    fileConflicts: ws.fileConflicts
  }))
};

// Ensure .claude directory exists
if (!fs.existsSync('.claude')) {
  fs.mkdirSync('.claude', { recursive: true });
}

// Write config
fs.writeFileSync('.claude/sprint-config.json', JSON.stringify(config, null, 2));
console.log('✅ Sprint configuration saved to .claude/sprint-config.json');
