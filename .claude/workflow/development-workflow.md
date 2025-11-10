# Development Workflow for Claude Code

This document defines the mandatory workflow that Claude Code and all subagents MUST follow when making changes to this codebase.

## 🎯 Quick Reference

- **Before starting**: Clean develop → create feature branch → check Context7
- **During development**: TDD cycle (Red→Green→Refactor) → test incrementally
- **Before committing**: Quality gates (tests→types→lint→build→coverage+approval)
- **After committing**: Explain to user → wait for user to push/merge

---

## 1. Development Stages

### 1.1 Starting a New Task

#### Step 1: Ensure Clean Develop Branch

Claude MUST prompt the user with:

```
Before starting TASK-XXX, please ensure you are on the develop branch with all latest changes.

Please confirm:
- You are on the develop branch
- You have pulled the latest changes (git pull origin develop)
- All previous changes have been merged

Reply "done" or "ready" when you're ready to proceed.
```

**Wait for user confirmation.** Do NOT proceed until user responds.

#### Step 2: Create Feature Branch from Develop

After user confirms, Claude MUST create the feature branch:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/TASK-XXX-description
```

#### Step 3: Check Documentation First

**MANDATORY**: Use Context7 MCP before implementing any library or framework code.

```bash
# Use Context7 MCP to get up-to-date documentation
mcp__context7__resolve-library-id -> mcp__context7__get-library-docs
```

**Never assume syntax or API based on previous versions. Always verify:**
- Current version being used (check package.json)
- Breaking changes and migration guides
- Current API syntax and best practices
- Official examples for the specific version

**Examples where this is critical:**
- Tailwind CSS v3 → v4: Major syntax changes (@tailwind → @import, @layer removal)
- Next.js 13 → 14+: App Router changes, metadata API
- React 17 → 18+: Concurrent features, Suspense changes

---

### 1.2 During Development (TDD Cycle)

**MANDATORY**: Follow Test-Driven Development for all new code.

#### TDD Workflow

1. **Write test first** (Red phase)
   ```bash
   # Create test file before implementation
   # Example: src/components/ui/new-component.test.tsx
   pnpm test run  # Test should fail
   ```

2. **Minimal implementation** (Green phase)
   ```typescript
   // Implement just enough code to make the test pass
   ```
   ```bash
   pnpm test run  # Test should now pass
   ```

3. **Refactor** (Refactor phase)
   ```typescript
   // Improve code quality while keeping tests green
   ```
   ```bash
   pnpm test  # Run in watch mode during development
   ```

#### For Bug Fixes
1. Write a failing test that reproduces the bug
2. Fix the bug until the test passes
3. Ensure all other tests still pass

#### For E2E Features
1. Write E2E test describing the user flow
2. Run E2E test (should fail): `pnpm test:e2e`
3. Implement the feature incrementally
4. Run E2E test until it passes

---

### 1.3 Incremental Testing

Make changes incrementally and test after each step:

#### After Dependencies Changes
```bash
pnpm install
# Verify lock file updates correctly
```

#### After Code Changes
```bash
# Start dev server and verify it starts without errors
pnpm dev

# In another terminal, test the endpoint
curl -I http://localhost:3001
# Should return 200 OK, not 401/500

# Check that pages render
curl http://localhost:3001 | head -20
```

#### Verify Actual Output
Don't assume changes work. Verify:
- Dev server starts successfully
- HTTP responses are correct (status codes, content type)
- No console errors or warnings
- Build completes without errors
- Type checking passes

#### Read Error Messages Carefully
When errors occur:
- Read the full error message and stack trace
- Check the file paths mentioned
- Look for version-specific hints (e.g., "moved to separate package")
- Search official docs for error codes/messages

---

### 1.4 Syncing with Develop (Hybrid Strategy)

**When to sync with develop:**
1. **Always**: Before starting a new task
2. **Daily**: If feature branch is >2 days old
3. **Always**: Before pushing

#### Checking Branch Divergence

When resuming work or daily for long features, Claude MUST check divergence:

```bash
# Fetch latest changes
git fetch origin

# Check how many commits behind develop you are
git log HEAD..origin/develop --oneline

# Show summary
git rev-list --left-right --count HEAD...origin/develop
# Output: X  Y (X commits ahead, Y commits behind)
```

#### When to Sync

If branch is behind develop (Y > 0), Claude MUST sync:

```bash
# Step 1: Update develop locally
git checkout develop
git pull origin develop

# Step 2: Return to feature branch
git checkout feature/TASK-XXX-description

# Step 3: Merge develop into feature branch
git merge develop

# Step 4: Resolve conflicts (if any)
# Review conflict markers, choose correct resolution
# Stage resolved files

# Step 5: Verify build after merge
pnpm install  # In case dependencies changed
pnpm test run
pnpm type-check
pnpm build

# Step 6: Continue work
```

#### Before Pushing (MANDATORY)

Before pushing any feature branch, Claude MUST sync with develop:

```bash
# Step 1: Check divergence
git fetch origin
git log HEAD..origin/develop --oneline

# Step 2: If behind, sync with develop
git checkout develop
git pull origin develop
git checkout feature/TASK-XXX-description
git merge develop

# Step 3: Resolve conflicts (if any)

# Step 4: Run ALL quality checks (see section 1.5)

# Step 5: Push clean branch
git push origin feature/TASK-XXX-description
```

**Why this matters:**
- Reduces merge conflicts in PRs
- Catches integration issues early
- Ensures CI/CD runs cleanly
- Makes PR reviews easier

---

### 1.5 Before Committing - Quality Gates ⚠️

**MANDATORY CHECKS** - All must pass before committing:

```bash
# 1. Run unit tests (MANDATORY) - FAST, run first
pnpm test run
# All tests must pass. If any fail, fix them before proceeding.

# 2. Run type checking (MANDATORY) - INCLUDING test files
pnpm type-check
# No TypeScript errors allowed - including test files.
# Test files are production code and must meet same quality standards.

# 3. Run linting (MANDATORY) - INCLUDING test files
pnpm lint
# Fix all linting errors and warnings - including test files.
# Test files must pass same linting standards as source code.

# 4. Run full build to catch production issues (MANDATORY) - SLOW, run last
pnpm build
# Build must succeed without errors.

# 5. MANDATORY: Check test coverage and validate with user
pnpm test:coverage
# Coverage report will be generated in coverage/index.html
# User MUST review and approve coverage before commit
# See section 2.2 for coverage validation workflow

# 6. MANDATORY: Email template preview (if email templates changed)
# User MUST review and approve template design before commit
# See section 2.3 for email preview workflow

# 7. (If database changes) Validate is_test field consistency
pnpm db:validate

# 8. (If database changes) Check test data distribution
pnpm db:check-test-data
```

**Order matters**: Run tests first to catch logic errors early, before spending time on type-checking and building.

**Port Conflicts**: Before starting dev server:
```bash
# Check if port 3001 is already in use
lsof -i :3001

# Kill specific processes if needed
kill <PID>

# Or kill all Node.js processes (use with caution)
pkill -f "node"
```

---

### 1.6 After Completing a Task

#### Step 1: Update Task Status and Commit

**Update sprint backlog file:**

```bash
# Open the current sprint file
vim .claude/backlog/sprint-X-<name>.md

# Update task status:
# Change: - [ ] TASK-XXX  →  - [x] TASK-XXX
# Change: Status: In Progress  →  Status: ✅ Complete (YYYY-MM-DD)
# Add completion notes if relevant
```

**Example sprint file update:**
```markdown
# Before
- [ ] TASK-XXX: <Task Description> (3 SP)
  - Status: In Progress
  - Phase: 2 (Content & Functionality)

# After
- [x] TASK-XXX: <Task Description> (3 SP)
  - Status: ✅ Complete (2025-10-24)
  - Phase: 2 (Content & Functionality)
  - Notes: All sub-pages implemented with translations
```

**Commit sprint status WITH task code:**

```bash
# Stage sprint backlog update AND code changes together
git add .claude/backlog/sprint-X-<name>.md
git add <your-code-changes>

# Commit everything together
git commit -m "feat: description (TASK-XXX)

- Brief completion note
- All acceptance criteria met
- Updated sprint backlog status

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**IMPORTANT**:
- Claude MUST perform the commit using git commands
- Sprint backlog updates are committed WITH task code, not separately
- See [Sprint Status Management](./.claude/workflow/sprint-status-management.md) for details

#### Step 2: Explain Changes to User

After committing, Claude MUST provide a comprehensive explanation of what was done, including:

1. **Summary** - High-level overview of the task
2. **Dependencies Added/Updated** - List all new packages with brief descriptions
3. **Configuration Changes** - Explain any config file modifications
4. **Files Created** - List all new files with their purpose
5. **Files Modified** - List modified files and what changed
6. **Key Features** - Highlight important functionality added
7. **Quality Checks** - Confirm all tests, linting, type-checking passed
8. **Next Steps** - What tasks remain or what can be built upon this work

This explanation helps the user understand the changes before pushing to remote.

#### Step 3: Prompt User to Push

Claude MUST **NEVER** attempt to push changes automatically. Instead, Claude should prompt:

```
The changes have been committed successfully!

To push your changes to the remote repository, please run:

git push origin feature/TASK-XXX-description

After pushing, you can create a pull request to develop.
```

**CRITICAL**:
- Claude performs: git add, git commit
- User performs: git push, pull request creation, merge to develop

#### Step 4: Wait for User Confirmation

**Do NOT start the next task until:**
1. User has pushed the changes
2. User has merged to develop (or confirmed PR is created)
3. User explicitly asks to continue with the next task

---

### 1.7 Deployment Environments

- **Feature branch**: PR preview for manual review + smoke tests
- **Develop branch**: Staging preview for full E2E testing
- **Main branch**: Production deployment (manual PR after full validation)

---

## 2. Quality Requirements (Detailed)

### 2.1 Test Coverage Requirements

**MANDATORY: Minimum coverage thresholds: 80%** for:
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

**CRITICAL**: Code with less than 80% coverage CANNOT be committed. The development workflow will be blocked until coverage requirements are met.

**What must be tested:**
- ✅ All UI components (Button, Card, Input, Typography, etc.)
- ✅ All utility functions (cn, navigation helpers, etc.)
- ✅ All hooks (custom React hooks)
- ✅ All business logic functions
- ✅ All API routes and endpoints
- ✅ Critical user flows (E2E tests)

**What is excluded from coverage:**
- Type definition files (*.d.ts)
- Index/barrel files (index.ts)
- Next.js app files (layout.tsx, page.tsx, loading.tsx, error.tsx, not-found.tsx)
- Configuration files
- Test files themselves

**Check coverage before committing:**
```bash
pnpm test:coverage
# Review the HTML report in coverage/index.html
```

---

### 2.2 Coverage Validation Workflow

**MANDATORY**: Before any commit, Claude MUST follow this coverage validation process:

#### Step 1: Generate Coverage Report
```bash
pnpm test:coverage
```

#### Step 2: Present Coverage Report to User
Claude MUST present the coverage summary to the user with:
- **Coverage percentages** for all metrics (lines, functions, branches, statements)
- **Target vs Current** comparison (80% minimum for all)
- **Status indicators** (✅ meets threshold, ❌ below threshold)
- **HTML report location** with clickable link (`coverage/index.html`)
- **Visual summary** displayed directly in the chat for easy review

#### Step 3: User Validation Required
Claude MUST prompt the user with a visual coverage summary:
```
📊 COVERAGE REPORT SUMMARY

Lines: XX% (Target: 80%) [✅/❌]
Functions: XX% (Target: 80%) [✅/❌]
Branches: XX% (Target: 80%) [✅/❌]
Statements: XX% (Target: 80%) [✅/❌]

📁 Detailed report: [coverage/index.html](file:///path/to/coverage/index.html)
   (Click to open in browser)

Do you approve this coverage level for commit?
- Type "yes" to proceed with commit
- Type "no" to add more tests first
```

**CRITICAL**: Claude MUST provide a clickable link to the HTML report for easy access.

#### Step 4: Wait for User Approval
- **If user says "yes"**: Proceed with commit
- **If user says "no"**: Add more tests to reach 80% threshold
- **If coverage is below 80%**: Claude MUST NOT commit until user explicitly approves

**CRITICAL**: No commit can proceed without explicit user approval of coverage levels.

---

## 3. Sprint Workstreams (Primary System)

**For Sprint 3+ development, use the Sprint Workstreams system for parallel development.**

**Complete documentation**: [Sprint Workstreams Workflow](./sprint-workstreams.md)

**Key commands**:
- `/orchestrator` - Initialize orchestrator mode ([orchestrator.md](../commands/orchestrator.md))
- `/workstream-agent <name>` - Initialize workstream agent ([workstream-agent.md](../commands/workstream-agent.md))
- `pnpm sprint:orchestrate` - Check sprint status

---

## 4. Reference

### 4.1 Common Pitfalls to Avoid

1. **Assuming v3 syntax works in v4** (Tailwind, Next.js, React) - Always check Context7!
2. **Not reading migration guides** when upgrading major versions
3. **Committing without testing build** (dev may work, build may fail)
4. **Ignoring TypeScript errors** (type-check before commit)
5. **Not checking for breaking changes** in CHANGELOG files
6. **Ignoring test file quality** (test files must pass same standards as source code)
7. **Complex mocking without planning** (plan mocking strategy before writing tests)
8. **Committing test files with errors** (test files are production code)

### 4.2 Priority Order (Why)

#### Development Flow
1. **Check Context7 docs** (most up-to-date API documentation)
2. **Write test first** (TDD - define expected behavior)
3. **Write implementation** (minimal code to pass test)
4. **Run unit tests** (`pnpm test run` - verify it works) - FAST
5. **Run type check** (`pnpm type-check` - catch type errors)
6. **Run linting** (`pnpm lint` - code quality)
7. **Build production** (`pnpm build` - catch build-time issues) - SLOW
8. **Run E2E tests** (`pnpm test:e2e` - if applicable) - SLOWEST
9. **Commit** (only after all above pass)

#### Why This Order?
- **Tests first** catches logic errors immediately (fast feedback)
- **Type checking** catches type errors before expensive builds
- **Linting** ensures code quality standards
- **Building** validates production bundle (slowest check)
- **E2E tests** validate full user flows (slowest, run last)

### 4.3 Branch Naming Convention

```bash
feature/task-{number}-{short-description}

# Examples:
feature/task-100-header-navigation
feature/task-111-contact-form
feature/task-115-translations
feature/task-132-service-overview
```

### 4.4 Commit Message Format

```
type(scope): description (TASK-XXX)

- Detail 1
- Detail 2
- All acceptance criteria met

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types**: feat, fix, docs, style, refactor, test, chore

---

**This workflow is MANDATORY for all code changes. No exceptions.**





