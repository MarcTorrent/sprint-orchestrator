#!/usr/bin/env node

/**
 * Sprint Quality Gates Runner
 * 
 * Runs quality gates configured in .claude/quality-gates.json
 * Language-agnostic: works with any project type (Python, Rust, Go, JS/TS, Java, etc.)
 * 
 * Usage: pnpm sprint:quality-gates [--worktree <path>]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const worktreePath = args.includes('--worktree') 
  ? args[args.indexOf('--worktree') + 1]
  : process.cwd();

// Change to worktree directory if specified
if (worktreePath && worktreePath !== process.cwd()) {
  if (!fs.existsSync(worktreePath)) {
    console.error(`❌ Worktree directory not found: ${worktreePath}`);
    process.exit(1);
  }
  process.chdir(worktreePath);
}

const qualityGatesPath = path.join(process.cwd(), '.claude/quality-gates.json');

// Check if quality gates config exists
if (!fs.existsSync(qualityGatesPath)) {
  console.log('ℹ️  Quality gates not configured (.claude/quality-gates.json not found)');
  console.log('   Skipping quality gates. Configure quality gates to enable.');
  process.exit(0);
}

// Load configuration
let config;
try {
  config = JSON.parse(fs.readFileSync(qualityGatesPath, 'utf8'));
} catch (error) {
  console.error(`❌ Failed to parse quality gates configuration: ${error.message}`);
  process.exit(1);
}

// Check if enabled
if (config.enabled === false) {
  console.log('ℹ️  Quality gates disabled in configuration');
  process.exit(0);
}

// Validate commands array
if (!Array.isArray(config.commands) || config.commands.length === 0) {
  console.log('ℹ️  No quality gate commands configured');
  process.exit(0);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 RUNNING QUALITY GATES');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Working directory: ${process.cwd()}\n`);

let passed = 0;
let failed = 0;
const failures = [];

// Run each command
for (const cmd of config.commands) {
  const name = cmd.name || cmd.command;
  const command = cmd.command;
  const required = cmd.required !== false; // Default to true
  const description = cmd.description || '';

  console.log(`▶️  ${name}${description ? ` - ${description}` : ''}`);
  console.log(`   Command: ${command}`);

  try {
    execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
      shell: true
    });
    console.log(`✅ ${name} passed\n`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name} failed\n`);
    failed++;
    failures.push({ name, command, required });

    // Stop on first required failure
    if (required) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ QUALITY GATES FAILED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`\nRequired gate failed: ${name}`);
      console.log(`Command: ${command}`);
      console.log('\nFix the issue and run quality gates again.');
      process.exit(1);
    }
  }
}

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (failed === 0) {
  console.log('✅ ALL QUALITY GATES PASSED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\nPassed: ${passed}/${config.commands.length}`);
  process.exit(0);
} else {
  console.log('⚠️  QUALITY GATES COMPLETED WITH WARNINGS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\nPassed: ${passed}/${config.commands.length}`);
  console.log(`Failed (non-required): ${failed}/${config.commands.length}`);
  console.log('\nNon-required gates failed:');
  failures.forEach(f => console.log(`  - ${f.name}`));
  console.log('\n⚠️  Review failed gates, but proceeding...');
  process.exit(0);
}

