# Sprint Cleanup Documentation

## Overview

The sprint system creates worktrees, branches, and configuration files during development. This document explains how to clean up these resources when needed.

## Cleanup Scripts

### `pnpm sprint:cleanup-all`

**Purpose**: Complete cleanup of all sprint workstreams, worktrees, and configuration.

**What it removes**:
- All worktrees created by sprint system
- All workstream branches (feature/*-workstream)
- Sprint configuration file (.claude/sprint-config.json)

**What it preserves**:
- Main repository and develop branch
- Any non-workstream branches
- Source code and other files

**Usage**:
```bash
pnpm sprint:cleanup-all
```

**When to use**:
- Before testing the sprint system from scratch
- When worktrees get corrupted or out of sync
- When switching between different sprints
- For general maintenance and cleanup

**Safety**:
- Only removes resources created by the sprint system
- Preserves all source code and main repository state
- Provides detailed output of what's being removed

### `pnpm sprint:cleanup`

**Purpose**: Clean up completed workstreams after they've been merged.

**What it removes**:
- Worktrees for completed workstreams
- Local branches for merged workstreams
- Updates sprint configuration

**Usage**:
```bash
pnpm sprint:cleanup [sprint-file]
```

**When to use**:
- After workstreams have been merged to develop
- For incremental cleanup during sprint execution

## Manual Cleanup Steps

If you need to clean up manually:

### 1. List Current Worktrees
```bash
git worktree list
```

### 2. Remove Worktrees
```bash
git worktree remove <worktree-path>
```

### 3. List and Remove Workstream Branches
```bash
# List all branches
git branch -a

# Remove workstream branches
git branch -D feature/<workstream-name>-workstream
```

### 4. Remove Sprint Configuration
```bash
rm .claude/sprint-config.json
```

### 5. Verify Clean State
```bash
git worktree list
git branch
ls .claude/sprint-config.json  # Should not exist
```

## Troubleshooting

### Worktree Won't Remove
```bash
# Force remove if needed
git worktree remove --force <worktree-path>
```

### Branch Won't Delete
```bash
# Check if branch is checked out
git branch

# Switch to different branch first
git checkout develop

# Then delete
git branch -D feature/<workstream-name>-workstream
```

### Permission Issues
```bash
# Check file permissions
ls -la <worktree-path>

# Fix permissions if needed
chmod -R 755 <worktree-path>
```

## Best Practices

1. **Always use `pnpm sprint:cleanup-all`** for complete reset
2. **Use `pnpm sprint:cleanup`** for incremental cleanup during sprints
3. **Verify clean state** after cleanup before starting new work
4. **Commit changes** before cleanup to avoid losing work
5. **Test cleanup** in a safe environment first

## Integration with Testing

The cleanup script is designed to be used in testing workflows:

```bash
# Complete test cycle
pnpm sprint:cleanup-all                    # Clean slate
pnpm sprint:analyze sprint-file.md         # Analyze sprint
pnpm sprint:create-workstreams sprint-file.md  # Create workstreams
pnpm sprint:orchestrate sprint-file.md     # Check status
# ... test workstreams ...
pnpm sprint:cleanup-all                    # Clean up after testing
```

This ensures each test starts from a known clean state.
