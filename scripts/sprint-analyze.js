#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const sprintFile = process.argv[2];
const workstreamsFlag = process.argv.find(arg => arg.startsWith('--workstreams='));
const interactiveFlag = process.argv.includes('--interactive');

if (!sprintFile) {
  console.log('❌ Please provide a sprint file path');
  console.log('Usage: pnpm sprint:analyze <sprint-file> [--interactive] [--workstreams="ws1:TASK-001,TASK-002;ws2:TASK-003"]');
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

// Extract tasks from sprint file
const tasks = [];
let inTasksSection = false;

for (const line of lines) {
  const trimmed = line.trim();
  
  // Detect Tasks section
  if (trimmed === '## Tasks') {
    inTasksSection = true;
    continue;
  }
  
  // Stop at next section
  if (inTasksSection && trimmed.startsWith('##')) {
    break;
  }
  
  // Extract task IDs and descriptions
  if (inTasksSection) {
    const taskMatch = trimmed.match(/^-\s+\[\s*[x ]\s*\]\s+(TASK-\d+):\s*(.+)$/);
    if (taskMatch) {
      const taskId = taskMatch[1];
      const description = taskMatch[2];
      
      // Find status, phase, dependencies from following lines
      let status = 'TODO';
      let phase = null;
      let dependencies = [];
      
      const taskIndex = lines.indexOf(line);
      for (let i = taskIndex + 1; i < Math.min(taskIndex + 5, lines.length); i++) {
        const nextLine = lines[i].trim();
        if (nextLine.startsWith('- Status:')) {
          status = nextLine.replace('- Status:', '').trim();
        } else if (nextLine.startsWith('- Phase:')) {
          phase = nextLine.replace('- Phase:', '').trim();
        } else if (nextLine.startsWith('- Dependencies:')) {
          const deps = nextLine.replace('- Dependencies:', '').trim();
          dependencies = deps === '(to be assigned)' ? [] : deps.split(',').map(d => d.trim());
        } else if (nextLine.startsWith('- [') || nextLine.startsWith('##')) {
          break;
        }
      }
      
      tasks.push({
        id: taskId,
        description,
        status,
        phase,
        dependencies
      });
    }
  }
}

// Extract workstreams from sprint file (if they exist)
const workstreams = [];
let currentWorkstream = null;
let inWorkstreamsSection = false;

for (const line of lines) {
  const trimmed = line.trim();
  
  // Detect Workstreams section
  if (trimmed === '## Workstreams') {
    inWorkstreamsSection = true;
    continue;
  }
  
  // Stop at next section
  if (inWorkstreamsSection && trimmed.startsWith('##') && trimmed !== '## Workstreams') {
    break;
  }
  
  if (inWorkstreamsSection) {
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
        const taskIds = taskMatch[1].split(',').map(t => t.trim());
        currentWorkstream.tasks = taskIds;
      }
    } else if (line.includes('**Dependencies**:') && currentWorkstream) {
      const depMatch = line.match(/\*\*Dependencies\*\*:\s*(.+)/);
      if (depMatch) {
        const deps = depMatch[1].split(',').map(d => d.trim());
        currentWorkstream.dependencies = deps.filter(d => d !== 'None' && d !== '(to be assigned)');
      }
    }
  }
}

// If no workstreams found, prompt for definition
if (workstreams.length === 0) {
  console.log(`📋 Found ${tasks.length} tasks, but no workstreams defined.`);
  console.log('');
  console.log('Workstreams need to be defined before creating worktrees.');
  console.log('');
  
  if (workstreamsFlag) {
    // Parse workstreams from flag
    const wsString = workstreamsFlag.replace('--workstreams=', '').replace(/^["']|["']$/g, '');
    const wsDefinitions = wsString.split(';');
    
    wsDefinitions.forEach((wsDef, index) => {
      const [name, taskIdsStr] = wsDef.split(':');
      const taskIds = taskIdsStr.split(',').map(t => t.trim());
      
      // Validate task IDs exist
      const validTaskIds = taskIds.filter(id => tasks.some(t => t.id === id));
      if (validTaskIds.length === 0) {
        console.log(`⚠️  Warning: Workstream "${name.trim()}" has no valid tasks`);
        return;
      }
      
      workstreams.push({
        id: String(index + 1),
        name: name.trim().toLowerCase().replace(/\s+/g, '-'),
        tasks: validTaskIds,
        dependencies: [],
        fileConflicts: []
      });
    });
    
    console.log(`✅ Defined ${workstreams.length} workstreams from flag`);
    console.log('');
    
    // Update sprint file with workstreams
    updateSprintFileWithWorkstreams(sprintFile, workstreams, tasks);
  } else if (interactiveFlag || process.stdin.isTTY) {
    // Interactive mode
    console.log('Choose an option:');
    console.log('  1. Interactive mode (define workstreams now)');
    console.log('  2. Use flag: --workstreams="ws1:TASK-001,TASK-002;ws2:TASK-003"');
    console.log('  3. Edit sprint file manually and re-run');
    console.log('');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Enter option (1-3): ', (answer) => {
      if (answer === '1') {
        defineWorkstreamsInteractively(tasks, sprintFile, rl);
      } else if (answer === '2') {
        console.log('');
        console.log('Usage:');
        console.log('  pnpm sprint:analyze <sprint-file> --workstreams="ws1:TASK-001,TASK-002;ws2:TASK-003"');
        console.log('');
        rl.close();
        process.exit(0);
      } else {
        console.log('');
        console.log('Edit the sprint file to add a "## Workstreams" section, then re-run:');
        console.log(`  pnpm sprint:analyze ${sprintFile}`);
        console.log('');
        rl.close();
        process.exit(0);
      }
    });
    return; // Exit early, async handling will continue
  } else {
    // Non-interactive, no flag
    console.log('No workstreams defined. Options:');
    console.log('');
    console.log('1. Use interactive mode:');
    console.log(`   pnpm sprint:analyze ${sprintFile} --interactive`);
    console.log('');
    console.log('2. Use flag mode:');
    console.log(`   pnpm sprint:analyze ${sprintFile} --workstreams="ws1:TASK-001,TASK-002;ws2:TASK-003"`);
    console.log('');
    console.log('3. Edit sprint file manually to add workstreams section');
    console.log('');
    process.exit(1);
  }
}

// Function to define workstreams interactively
function defineWorkstreamsInteractively(tasks, sprintFile, rl) {
  console.log('');
  console.log('Available tasks:');
  tasks.forEach((task, index) => {
    console.log(`  ${index + 1}. ${task.id}: ${task.description.substring(0, 60)}${task.description.length > 60 ? '...' : ''}`);
  });
  console.log('');
  
  const workstreams = [];
  let workstreamNumber = 1;
  
  function promptWorkstream() {
    rl.question(`\nWorkstream ${workstreamNumber} name (or 'done' to finish): `, (name) => {
      if (name.toLowerCase() === 'done') {
        if (workstreams.length === 0) {
          console.log('⚠️  No workstreams defined. Exiting.');
          rl.close();
          process.exit(1);
        }
        
        // Update sprint file with workstreams
        updateSprintFileWithWorkstreams(sprintFile, workstreams, tasks);
        
        // Create config
        createSprintConfig(sprintFile, workstreams);
        
        rl.close();
        process.exit(0);
      }
      
      if (!name.trim()) {
        console.log('⚠️  Name cannot be empty');
        promptWorkstream();
        return;
      }
      
      rl.question(`Task IDs for "${name}" (comma-separated, e.g., TASK-001,TASK-002): `, (taskIdsStr) => {
        const taskIds = taskIdsStr.split(',').map(t => t.trim());
        const validTaskIds = taskIds.filter(id => tasks.some(t => t.id === id));
        
        if (validTaskIds.length === 0) {
          console.log('⚠️  No valid task IDs found. Please try again.');
          promptWorkstream();
          return;
        }
        
        if (validTaskIds.length < taskIds.length) {
          const invalid = taskIds.filter(id => !tasks.some(t => t.id === id));
          console.log(`⚠️  Invalid task IDs ignored: ${invalid.join(', ')}`);
        }
        
        workstreams.push({
          id: String(workstreamNumber),
          name: name.trim().toLowerCase().replace(/\s+/g, '-'),
          tasks: validTaskIds,
          dependencies: [],
          fileConflicts: []
        });
        
        console.log(`✅ Workstream "${name}" created with ${validTaskIds.length} tasks`);
        
        // Check for remaining tasks
        const assignedTasks = new Set();
        workstreams.forEach(ws => ws.tasks.forEach(t => assignedTasks.add(t)));
        const remaining = tasks.filter(t => !assignedTasks.has(t.id));
        
        if (remaining.length > 0) {
          console.log(`\nRemaining unassigned tasks: ${remaining.length}`);
          remaining.forEach(t => console.log(`  - ${t.id}`));
        }
        
        workstreamNumber++;
        promptWorkstream();
      });
    });
  }
  
  promptWorkstream();
}

// Update sprint file with workstreams section
function updateSprintFileWithWorkstreams(sprintFile, workstreams, tasks) {
  const content = fs.readFileSync(sprintFile, 'utf8');
  const lines = content.split('\n');
  
  // Find where to insert workstreams section (before Notes section or at end)
  let insertIndex = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---' || lines[i].trim().startsWith('## Notes')) {
      insertIndex = i;
      break;
    }
  }
  
  // Build workstreams section
  const workstreamsSection = ['', '## Workstreams', ''];
  
  workstreams.forEach((ws, index) => {
    workstreamsSection.push(`### Workstream ${index + 1}: ${ws.name}`);
    workstreamsSection.push('');
    workstreamsSection.push(`**Tasks**: ${ws.tasks.join(', ')}`);
    
    // Extract dependencies from tasks
    const dependencies = [];
    ws.tasks.forEach(taskId => {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(dep => {
          if (!ws.tasks.includes(dep) && !dependencies.includes(dep)) {
            dependencies.push(dep);
          }
        });
      }
    });
    
    if (dependencies.length > 0) {
      workstreamsSection.push(`**Dependencies**: ${dependencies.join(', ')}`);
    } else {
      workstreamsSection.push('**Dependencies**: None');
    }
    
    workstreamsSection.push('');
  });
  
  // Insert workstreams section
  lines.splice(insertIndex, 0, ...workstreamsSection);
  
  fs.writeFileSync(sprintFile, lines.join('\n'));
  console.log(`\n✅ Updated sprint file with workstreams: ${sprintFile}`);
}

// Create sprint config (existing logic)
function createSprintConfig(sprintFile, workstreams) {
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
}

// If workstreams already exist, proceed with normal analysis
if (workstreams.length > 0) {
  // Display analysis
  workstreams.forEach((ws, index) => {
    const parallelSafe = ws.dependencies.length === 0 || ws.dependencies.every(d => d === 'None');
    const status = parallelSafe ? '✅' : '⚠️';
    
    console.log(`${status} WORKSTREAM ${index + 1}: ${ws.name} (${ws.tasks.length} tasks - ${parallelSafe ? 'parallel safe' : 'sequential'})`);
    console.log(`   - Tasks: ${ws.tasks.join(', ')}`);
    if (ws.dependencies.length > 0 && ws.dependencies.every(d => d !== 'None')) {
      console.log(`   - Dependencies: ${ws.dependencies.join(', ')}`);
    }
    console.log(`   - File conflicts: ${ws.fileConflicts.length > 0 ? ws.fileConflicts.join(', ') : 'None detected'}`);
    const worktreePath = `../worktrees/${ws.name}/`;
    console.log(`   - Worktree: ${worktreePath}`);
    console.log('');
  });

  console.log('💡 RECOMMENDATION: Use workstream parallelization');
  console.log(`   Command: pnpm sprint:create-workstreams`);
  console.log('');

  // Create sprint config
  createSprintConfig(sprintFile, workstreams);
}
