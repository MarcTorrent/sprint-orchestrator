#!/usr/bin/env node

/**
 * Test Setup Helper
 * 
 * Provides utilities for setting up and tearing down test environments:
 * - Temporary directories
 * - Git repository initialization
 * - File system operations
 * - Cleanup utilities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

class TestSetup {
  constructor() {
    this.tempDirs = [];
    this.originalCwd = process.cwd();
  }

  /**
   * Create a temporary directory for testing
   * @returns {string} Path to temporary directory
   */
  createTempDir(prefix = 'sprint-orchestrator-test') {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
    this.tempDirs.push(tempDir);
    return tempDir;
  }

  /**
   * Initialize a Git repository in the given directory
   * @param {string} dir - Directory path
   * @param {string} defaultBranch - Default branch name (default: 'develop')
   */
  initGitRepo(dir, defaultBranch = 'develop') {
    const originalCwd = process.cwd();
    try {
      process.chdir(dir);
      
      // Initialize git repo
      execSync('git init', { stdio: 'pipe' });
      
      // Configure git user (required for commits)
      execSync('git config user.name "Test User"', { stdio: 'pipe' });
      execSync('git config user.email "test@example.com"', { stdio: 'pipe' });
      
      // Create initial commit
      execSync('git commit --allow-empty -m "Initial commit"', { stdio: 'pipe' });
      
      // Create and checkout default branch
      if (defaultBranch !== 'main' && defaultBranch !== 'master') {
        execSync(`git checkout -b ${defaultBranch}`, { stdio: 'pipe' });
      }
      
      return dir;
    } finally {
      process.chdir(originalCwd);
    }
  }

  /**
   * Copy fixture files to a directory
   * @param {string} sourceDir - Source directory (fixtures)
   * @param {string} targetDir - Target directory
   */
  copyFixtures(sourceDir, targetDir) {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    this._copyRecursive(sourceDir, targetDir);
  }

  /**
   * Recursively copy directory
   * @private
   */
  _copyRecursive(source, target) {
    const files = fs.readdirSync(source);
    
    files.forEach(file => {
      const sourcePath = path.join(source, file);
      const targetPath = path.join(target, file);
      const stat = fs.statSync(sourcePath);
      
      if (stat.isDirectory()) {
        if (!fs.existsSync(targetPath)) {
          fs.mkdirSync(targetPath, { recursive: true });
        }
        this._copyRecursive(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    });
  }

  /**
   * Create a minimal package.json in a directory
   * @param {string} dir - Directory path
   * @param {object} overrides - Properties to override
   */
  createPackageJson(dir, overrides = {}) {
    const packageJson = {
      name: 'test-project',
      version: '1.0.0',
      description: 'Test project',
      ...overrides
    };
    
    const packageJsonPath = path.join(dir, 'package.json');
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2) + '\n'
    );
    
    return packageJsonPath;
  }

  /**
   * Create a minimal .gitignore file
   * @param {string} dir - Directory path
   */
  createGitignore(dir) {
    const gitignorePath = path.join(dir, '.gitignore');
    const content = `node_modules/
.env
*.log
`;
    fs.writeFileSync(gitignorePath, content);
    return gitignorePath;
  }

  /**
   * Check if a file exists
   * @param {string} filePath - File path
   * @returns {boolean}
   */
  fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  /**
   * Read file contents
   * @param {string} filePath - File path
   * @returns {string}
   */
  readFile(filePath) {
    return fs.readFileSync(filePath, 'utf8');
  }

  /**
   * Write file contents
   * @param {string} filePath - File path
   * @param {string} content - File content
   */
  writeFile(filePath, content) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content);
  }

  /**
   * Check if a directory exists
   * @param {string} dirPath - Directory path
   * @returns {boolean}
   */
  dirExists(dirPath) {
    try {
      return fs.statSync(dirPath).isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * List files in a directory
   * @param {string} dirPath - Directory path
   * @returns {string[]}
   */
  listFiles(dirPath) {
    if (!this.dirExists(dirPath)) {
      return [];
    }
    return fs.readdirSync(dirPath);
  }

  /**
   * Clean up all temporary directories
   */
  cleanup() {
    // Restore original working directory first
    const originalCwd = this.originalCwd;
    try {
      process.chdir(originalCwd);
    } catch (error) {
      // If originalCwd doesn't exist, try to go to a safe location
      try {
        process.chdir(os.tmpdir());
      } catch (e) {
        // Ignore - we'll try to cleanup anyway
      }
    }
    
    // Clean up any test artifacts in the original project root
    if (originalCwd && fs.existsSync(originalCwd)) {
      try {
        const testArtifacts = [
          path.join(originalCwd, '.claude', 'backlog', 'sprint-1-subscribe.md'),
          path.join(originalCwd, '.claude', 'sprint-config.json'),
          path.join(originalCwd, '.claude', 'backlog')
        ];
        
        testArtifacts.forEach(artifact => {
          try {
            if (fs.existsSync(artifact)) {
              const stat = fs.statSync(artifact);
              if (stat.isDirectory()) {
                // Only remove if it's empty or only contains test files
                const files = fs.readdirSync(artifact);
                if (files.length === 0 || files.every(f => f === 'sprint-1-subscribe.md')) {
                  fs.rmSync(artifact, { recursive: true, force: true });
                }
              } else {
                fs.unlinkSync(artifact);
              }
            }
          } catch (e) {
            // Ignore cleanup errors for artifacts
          }
        });
      } catch (e) {
        // Ignore errors during artifact cleanup
      }
    }
    
    // Remove all temporary directories
    this.tempDirs.forEach(dir => {
      try {
        // Remove git worktrees first if they exist
        if (this.dirExists(dir)) {
          try {
            // Use execSync with cwd instead of chdir
            const worktrees = execSync('git worktree list', { 
              encoding: 'utf8', 
              stdio: 'pipe',
              cwd: dir
            });
            const lines = worktrees.split('\n').filter(line => line.trim());
            lines.forEach(line => {
              const match = line.match(/\[(.*?)\]/);
              if (match && match[1] !== 'develop' && match[1] !== 'main' && match[1] !== 'master') {
                try {
                  execSync(`git worktree remove "${match[1]}" --force`, { 
                    stdio: 'pipe',
                    cwd: dir
                  });
                } catch (e) {
                  // Ignore errors
                }
              }
            });
          } catch (e) {
            // Not a git repo or no worktrees - continue cleanup
          }
        }
        
        // Remove directory recursively
        if (this.dirExists(dir) || fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
        }
      } catch (error) {
        // Ignore cleanup errors - directories may already be removed
      }
    });
    
    this.tempDirs = [];
  }

  /**
   * Execute a command in a directory
   * @param {string} command - Command to execute
   * @param {string} cwd - Working directory
   * @param {object} options - Execution options
   * @returns {string} Command output
   */
  exec(command, cwd = process.cwd(), options = {}) {
    const defaultOptions = {
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: cwd
    };
    
    return execSync(command, { ...defaultOptions, ...options }).toString();
  }

  /**
   * Get the fixtures directory path
   * @returns {string}
   */
  getFixturesDir() {
    return path.join(__dirname, '..', 'fixtures');
  }

  /**
   * Get the framework root directory
   * @returns {string}
   */
  getFrameworkRoot() {
    return path.join(__dirname, '..', '..');
  }
}

module.exports = TestSetup;

