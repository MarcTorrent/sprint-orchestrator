# Git Workflow for Subagent Tasks

## Workflow: Option A - Autonomous Branches

Each subagent creates its own feature branch, works independently, and commits when complete.

## Branch Strategy

```
main (production)
└── develop (integration)
    ├── feature/TASK-002-tailwind-config
    ├── feature/TASK-003-supabase-setup
    ├── feature/TASK-004-github-config
    └── feature/TASK-XXX-description
```

## Branch Naming Convention

**Format**: `feature/TASK-XXX-short-description`

**Examples**:
- `feature/TASK-002-tailwind-config`
- `feature/TASK-003-supabase-setup`
- `feature/TASK-007-i18n-setup`
- `feature/TASK-100-homepage-layout`

**Rules**:
- Always lowercase with hyphens
- Keep description under 30 characters
- Use descriptive keywords from task title

## Subagent Workflow (Autonomous)

### 1. Start Task

```bash
# Create branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/TASK-XXX-description
```

### 2. Work on Task

```bash
# Make changes
# Create/edit files
# Test changes
```

### 3. Mark Task as Done

```bash
# Update task status in backlog FIRST
pnpm task:done TASK-XXX "Brief completion note"
```

### 4. Commit When Complete

```bash
# Stage changes (including backlog update)
git add .

# Commit with standardized message
git commit -m "$(cat <<'EOF'
<type>: <description> (TASK-XXX)

- Brief completion note
- Acceptance criteria 1 met
- Acceptance criteria 2 met
- Additional changes or notes

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# Clean up test data before merging (if applicable)
pnpm db:cleanup:force
```

### 5. Report Completion

Subagent reports back to main agent:
- Branch name
- Task ID
- Summary of changes
- Any blockers or notes
- Test data cleanup status (if applicable)

## Commit Message Format

### Structure

```
<type>: <description> (TASK-XXX)

- Bullet point 1
- Bullet point 2
- Additional context

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Commit Types

- `feat`: New feature (most tasks)
- `fix`: Bug fix
- `chore`: Configuration, tooling, dependencies
- `docs`: Documentation only
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `style`: Formatting, styling (CSS/Tailwind)
- `perf`: Performance improvements

### Examples

**TASK-002: Configure Tailwind**
```
chore: configure Tailwind CSS with design tokens (TASK-002)

- Custom color palette for legal brand
- Typography scale configured
- Spacing and breakpoints defined
- Tailwind plugins installed

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**TASK-007: i18n Setup**
```
feat: implement next-intl for multi-language support (TASK-007)

- Middleware configured for locale routing
- Translation files created (es, en, ca)
- Language switcher component built
- Default locale set to Spanish

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**TASK-100: Homepage**
```
feat: create homepage layout with hero section (TASK-100)

- Hero component with CTA
- Service cards grid
- Responsive design for mobile/tablet
- i18n translations integrated

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Conflict Resolution Strategy

### Low-Risk Files (Rare Conflicts)
- Individual page files
- Component files
- Translation JSON files
- Migration SQL files
- Documentation files

### High-Risk Files (May Conflict)
- `package.json` (dependencies)
- `tailwind.config.ts` (multiple tasks may extend)
- `middleware.ts` (i18n, security, etc.)
- `lib/supabase/client.ts` (shared utilities)

### Resolution Approach

1. **Prevent conflicts**: Review dependency graph before parallel execution
2. **Merge frequently**: Don't let branches diverge too long
3. **Communicate changes**: Subagents report file changes
4. **Main agent coordinates**: Decides merge order for high-risk files


## Best Practices

1. **Always branch from `develop`**: Never branch from `main` or other feature branches
2. **One task = one branch**: Don't mix multiple tasks in same branch
3. **Commit when complete**: Don't leave uncommitted work
4. **Update task status**: Always run `pnpm task:done` after committing
5. **Keep branches short-lived**: Merge to develop within 1-2 days
6. **Test before committing**: Run `pnpm dev`, `pnpm lint`, `pnpm type-check`
7. **Descriptive commits**: Include what changed and why
8. **Check GitHub Actions**: Ensure all status checks pass before merging

## Emergency Procedures

### If Subagent Fails Mid-Task

```bash
# Check branch status
git status

# Option 1: Continue work manually
git add .
git commit -m "chore: complete TASK-XXX after subagent failure"

# Option 2: Abandon and restart
git checkout develop
git branch -D feature/TASK-XXX-description
# Restart task
```

### If Merge Conflicts Occur

```bash
# View conflicting files
git status

# Resolve conflicts manually
# Edit files, choose correct version

# Complete merge
git add .
git commit -m "chore: resolve merge conflicts from TASK-XXX and TASK-YYY"
```

## Status Tracking

Use the task management CLI to track progress:

```bash
# View all task statuses
pnpm task:status

# Start a task (updates backlog)
pnpm task:start TASK-002

# Complete a task (updates backlog)
pnpm task:done TASK-002 "Tailwind configured with brand colors"
```

## Summary

- **Subagents**: Create branch → Work → Commit → Report
- **Main agent**: Review → Merge → Deploy
- **Branch naming**: `feature/TASK-XXX-description`
- **Commit format**: `<type>: <description> (TASK-XXX)`
- **Conflict resolution**: Main agent handles
