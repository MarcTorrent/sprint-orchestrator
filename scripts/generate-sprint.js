#!/usr/bin/env node

/**
 * Sprint Generator
 *
 * Generates sprint backlog files from project documentation.
 * Extracts tasks from markdown files and creates a sprint file
 * in the format defined by sprint-status-management.md.
 *
 * Usage:
 *   node scripts/generate-sprint.js --docs <directory> --output <file> [--name "Sprint Name"]
 *   node scripts/generate-sprint.js --docs docs/ --output .claude/backlog/sprint-1.md
 *   node scripts/generate-sprint.js --docs "docs/,README.md" --output sprint.md --name "Feature Implementation"
 */

const fs = require('fs');
const path = require('path');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    docs: null,
    output: null,
    name: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--docs' && i + 1 < args.length) {
      options.docs = args[i + 1];
      i++;
    } else if (args[i] === '--output' && i + 1 < args.length) {
      options.output = args[i + 1];
      i++;
    } else if (args[i] === '--name' && i + 1 < args.length) {
      options.name = args[i + 1];
      i++;
    }
  }

  return options;
}

// Find all markdown files in a directory recursively
function findMarkdownFiles(dirPath) {
  const files = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) {
      return;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip node_modules and hidden directories
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
          continue;
        }
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }

  walk(dirPath);
  return files;
}

// Parse markdown content to extract tasks
function parseMarkdownFile(filePath, content) {
  const tasks = [];
  const lines = content.split('\n');
  let currentSection = null;
  let lineNumber = 0;

  for (const line of lines) {
    lineNumber++;
    const trimmed = line.trim();

    // Detect section headers (# Header)
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      currentSection = headerMatch[2];
      continue;
    }

    // Detect TODO items
    // Patterns: - [ ] Task, - TODO: Task, TODO: Task
    const todoPatterns = [
      /^[-*]\s+\[\s*\]\s+(.+)$/,  // - [ ] Task
      /^[-*]\s+TODO:\s*(.+)$/i,    // - TODO: Task
      /^TODO:\s*(.+)$/i,           // TODO: Task
      /^FIXME:\s*(.+)$/i,          // FIXME: Task
    ];

    for (const pattern of todoPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        tasks.push({
          description: match[1].trim(),
          section: currentSection,
          file: path.basename(filePath),
          filePath: path.relative(process.cwd(), filePath),
          type: 'todo'
        });
        break;
      }
    }

    // Detect feature lists (after "Features:" or similar)
    if (currentSection && /feature|implement|todo|roadmap|upcoming/i.test(currentSection)) {
      const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
      if (listMatch && !listMatch[1].match(/\[[ x]\]/)) { // Not a checkbox
        const description = listMatch[1].trim();
        // Avoid duplicates and very short items
        if (description.length > 10 && !tasks.some(t => t.description === description)) {
          tasks.push({
            description,
            section: currentSection,
            file: path.basename(filePath),
            filePath: path.relative(process.cwd(), filePath),
            type: 'feature'
          });
        }
      }
    }
  }

  return tasks;
}

// Generate sprint markdown content following sprint-status-management.md format
function generateSprintMarkdown(tasks, sprintName, sourceDocs, startDate) {
  const lines = [];

  // Extract sprint number from name or output file
  const sprintNumberMatch = sprintName.match(/sprint[-\s]?(\d+)/i);
  const sprintNumber = sprintNumberMatch ? sprintNumberMatch[1] : '1';

  // Header (following sprint-status-management.md format)
  lines.push(`# Sprint ${sprintNumber}: ${sprintName.replace(/sprint\s*\d+[-\s]?/i, '').trim()}`);
  lines.push('');
  lines.push(`**Status**: TODO`);
  lines.push(`**Start Date**: ${startDate}`);
  lines.push(`**Target End**: (to be determined)`);
  lines.push(`**Progress**: 0/${tasks.length} tasks complete (0%)`);
  lines.push('');
  lines.push(`> Generated from documentation: ${sourceDocs.join(', ')}`);
  lines.push(`> Generated at: ${new Date().toISOString()}`);
  lines.push('');

  // Tasks section (flat list, no workstreams yet)
  lines.push('## Tasks');
  lines.push('');

  // Generate task IDs sequentially
  tasks.forEach((task, index) => {
    const taskId = `TASK-${String(index + 1).padStart(3, '0')}`;
    
    lines.push(`- [ ] ${taskId}: ${task.description}`);
    lines.push(`  - Status: TODO`);
    lines.push(`  - Phase: (to be assigned)`);
    lines.push(`  - Dependencies: (to be assigned)`);
    lines.push(`  - Notes: Extracted from ${task.filePath}${task.section ? ` (${task.section})` : ''}`);
    lines.push('');
  });

  // Footer notes
  lines.push('---');
  lines.push('');
  lines.push('## Notes');
  lines.push('');
  lines.push('- Review and organize tasks into workstreams using `pnpm sprint:analyze`');
  lines.push('- Assign tasks to phases based on project structure');
  lines.push('- Update dependencies between tasks');
  lines.push('- Add story points or time estimates if needed');
  lines.push('- Workstreams will be defined during sprint analysis');
  lines.push('');

  return lines.join('\n');
}

// Main execution
function main() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'bright');
  log('📊 SPRINT GENERATOR', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'bright');

  const options = parseArgs();

  // Validate arguments
  if (!options.docs) {
    error('Missing required argument: --docs <directory>');
    error('\nUsage:');
    error('  node scripts/generate-sprint.js --docs <directory> --output <file> [--name "Sprint Name"]');
    error('\nExample:');
    error('  node scripts/generate-sprint.js --docs docs/ --output .claude/backlog/sprint-1.md');
    process.exit(1);
  }

  if (!options.output) {
    error('Missing required argument: --output <file>');
    error('\nUsage:');
    error('  node scripts/generate-sprint.js --docs <directory> --output <file>');
    process.exit(1);
  }

  const sprintName = options.name || path.basename(options.output, '.md').replace(/^sprint-\d+-/, '').replace(/-/g, ' ');
  const startDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  info(`Documentation source: ${options.docs}`);
  info(`Output file: ${options.output}`);
  info(`Sprint name: ${sprintName}`);
  info(`Start date: ${startDate}\n`);

  // Step 1: Find documentation files
  log('📁 Step 1: Finding documentation files...', 'bright');

  const docPaths = options.docs.split(',').map(p => p.trim());
  const allFiles = [];

  for (const docPath of docPaths) {
    const resolvedPath = path.resolve(process.cwd(), docPath);

    if (!fs.existsSync(resolvedPath)) {
      warning(`Path not found: ${docPath}`);
      continue;
    }

    const stat = fs.statSync(resolvedPath);
    if (stat.isDirectory()) {
      const files = findMarkdownFiles(resolvedPath);
      allFiles.push(...files);
      success(`Found ${files.length} markdown files in ${docPath}`);
    } else if (stat.isFile() && resolvedPath.endsWith('.md')) {
      allFiles.push(resolvedPath);
      success(`Added file: ${docPath}`);
    } else {
      warning(`Skipping non-markdown file: ${docPath}`);
    }
  }

  if (allFiles.length === 0) {
    error('No markdown files found in specified paths');
    process.exit(1);
  }

  info(`Total files to analyze: ${allFiles.length}\n`);

  // Step 2: Parse files and extract tasks
  log('🔍 Step 2: Extracting tasks from documentation...', 'bright');

  const allTasks = [];
  const sourceFiles = [];

  for (const filePath of allFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const tasks = parseMarkdownFile(filePath, content);

    if (tasks.length > 0) {
      allTasks.push(...tasks);
      sourceFiles.push(path.relative(process.cwd(), filePath));
      success(`Extracted ${tasks.length} tasks from ${path.basename(filePath)}`);
    } else {
      info(`No tasks found in ${path.basename(filePath)}`);
    }
  }

  if (allTasks.length === 0) {
    warning('No tasks extracted from documentation');
    warning('Make sure your documentation includes:');
    warning('  - TODO items: - [ ] Task or TODO: Task');
    warning('  - Feature sections with bullet lists');
    warning('  - Implementation roadmaps');
    process.exit(1);
  }

  info(`\nTotal tasks extracted: ${allTasks.length}\n`);

  // Step 3: Generate sprint file (no categorization)
  log('📝 Step 3: Generating sprint file...', 'bright');

  const sprintContent = generateSprintMarkdown(allTasks, sprintName, sourceFiles, startDate);
  const outputPath = path.resolve(process.cwd(), options.output);

  // Create output directory if it doesn't exist
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    info(`Created directory: ${outputDir}`);
  }

  // Check if file exists
  if (fs.existsSync(outputPath)) {
    warning(`File already exists: ${options.output}`);
    warning('Backing up existing file...');
    fs.copyFileSync(outputPath, outputPath + '.backup');
    info(`Backup created: ${options.output}.backup`);
  }

  fs.writeFileSync(outputPath, sprintContent);
  success(`Sprint file generated: ${options.output}\n`);

  // Step 4: Summary
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'bright');
  log('✅ GENERATION COMPLETE', 'green');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'bright');

  log('📊 Summary:', 'bright');
  log(`  Files analyzed: ${allFiles.length}`);
  log(`  Tasks extracted: ${allTasks.length}`);
  log(`  Output: ${options.output}\n`);

  log('🎯 Next steps:', 'bright');
  log('  1. Review the generated sprint file');
  log('  2. Organize tasks into workstreams:');
  log(`     pnpm sprint:analyze ${options.output}`);
  log('  3. Create workstreams:');
  log('     pnpm sprint:create-workstreams');
  log('  4. Start orchestrating:');
  log('     pnpm sprint:orchestrate\n');
}

// Run
try {
  main();
} catch (err) {
  error(`\nFatal error: ${err.message}`);
  if (process.env.DEBUG) {
    console.error(err.stack);
  }
  process.exit(1);
}
