# Extraction Summary

This document describes what was extracted from the test repository and what was excluded.

## Source Repository
**Location**: `~/Projects/ManoMano/test-parallel-workflows`
**Type**: Next.js test application with sprint orchestration framework

## Extracted Components (Essential Framework)

### Scripts (10 files)
All sprint orchestration scripts were extracted from `/scripts`:
- `sprint-orchestrate.js` - Main orchestrator entry point
- `sprint-analyze.js` - Analyze sprint backlog for workstreams
- `sprint-create-workstreams.js` - Create worktrees and branches
- `sprint-resume.js` - Resume work on a specific workstream
- `sprint-complete.js` - Mark workstream as complete
- `sprint-status.js` - Show workstream status
- `sprint-push.js` - Push workstream to remote
- `sprint-sync-all.js` - Sync all workstreams with develop
- `sprint-cleanup.js` - Clean up after sprint completion
- `sprint-cleanup-all.js` - Complete cleanup for testing

### Claude Commands (2 files)
From `/.claude/commands`:
- `orchestrator.md` - Initialize Claude as orchestrator
- `workstream-agent.md` - Initialize Claude as workstream agent

### Workflow Documentation (4 files)
From `/.claude/workflow`:
- `sprint-workstreams.md` - Complete workflow documentation (900+ lines)
- `development-workflow.md` - Quality gates and TDD cycle
- `git-workflow.md` - Version control guidelines
- `sprint-status-management.md` - Status tracking procedures

### Templates (1 file)
From `/.claude/backlog` (adapted as template):
- `sprint-template.md` - Example sprint backlog structure

### Documentation (2 files)
From `/docs`:
- `evaluation.md` - System evaluation and testing results
- `cleanup.md` - Cleanup procedures

### Configuration Files
- `CLAUDE.md` - Claude Code entry point and integration guide
- `package.json` - Script definitions and metadata
- `README.md` - Usage instructions and integration guide
- `integration-guide.md` - Quick integration steps
- `extraction-summary.md` - This document
- `LICENSE` - MIT License
- `.gitignore` - Ignore patterns for runtime files

## Excluded Components (Test Application)

### Next.js Application Code
- `/src/app/` - Next.js app router pages
- `/components/` - React components
- `/public/` - Static assets

### Next.js Configuration
- `next.config.ts`
- `next-env.d.ts`
- `postcss.config.mjs`
- `tailwind.config.ts`
- `tsconfig.json`
- `.next/` - Build output

### Test-Specific Files
- `.claude/backlog/sprint-1-subscribe.md` - Example sprint backlog
- `.claude/sprint-config.json` - Runtime configuration (excluded via .gitignore)
- `.claude/settings.local.json` - Local settings (excluded via .gitignore)

### Dependencies
- `node_modules/` - Not needed (framework has no dependencies)
- `pnpm-lock.yaml` - Not needed for this framework
- Next.js/React/Tailwind dependencies - Test app only

### Other Test Files
- `eslint.config.mjs`
- Test-specific documentation

## Size Comparison

### Source Repository
- Total: ~150MB (with node_modules)
- Code: ~50MB
- Framework scripts: ~40KB

### Extracted Framework
- Total: ~100KB
- Pure framework with no dependencies
- 99.9% size reduction

## Usage as Git Submodule

This extracted framework can now be used as a git submodule in any project:

```bash
git submodule add <repo-url> sprint-orchestrator
```

Then add the scripts to your project's `package.json` and copy/link the Claude commands.

## Validation

The extracted framework:
- ✅ Contains all essential orchestration logic
- ✅ Has no external dependencies (pure Node.js)
- ✅ Is fully documented
- ✅ Has been tested (100% test success rate in source)
- ✅ Is ready for use as a git submodule
- ✅ Is framework-agnostic (works with any project type)

## Date Extracted
November 10, 2024

## Extracted By
Claude Code (Sonnet 4.5)
