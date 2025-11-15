---
description: Generate sprint backlog files from project documentation. Extracts tasks, estimates story points, assigns agents, splits into sprints, and creates rich sprint files with priorities and acceptance criteria. Does NOT define workstreams - that's the orchestrator's responsibility. Usage: /generate-sprint [--max-story-points=40] [--docs="docs/,README.md"]
---

# Sprint Generator Command

Generate comprehensive sprint backlog files from your project documentation. This command intelligently extracts tasks, estimates effort, assigns agents to tasks, and splits work into manageable sprints. **Important**: This command does NOT define workstreams or group tasks into workstreams - that is exclusively the orchestrator's responsibility.

## Step 1: Understand the Project Context

Before generating sprints, analyze the project to understand:

1. **Project Structure**: Review codebase organization (frontend/backend, services, components)
2. **Existing Agents**: Check if there are agent definitions in documentation or code comments
3. **Technology Stack**: Understand languages, frameworks, and tools used
4. **Documentation Sources**: Identify where tasks/features are documented

**Key files to review:**
- `README.md` - Project overview and setup
- `docs/` directory - Feature documentation
- `CLAUDE.md` - Project-specific context
- Codebase structure - Understand architecture
- Previous sprint files (if any) - Understand patterns

## Step 2: Extract All Tasks

Read through all project documentation and extract tasks. Look for:

- TODO comments in code
- Feature lists in markdown files
- Roadmap items
- Implementation plans
- Bug reports or issues
- Requirements documentation

**Extract for each task:**
- Description (what needs to be done)
- Source file/section (where it was found)
- Context (surrounding documentation)

## Step 3: Estimate Story Points

For each extracted task, estimate story points using standard Fibonacci scale (1, 2, 3, 5, 8, 13, 21):

**Estimation Guidelines:**
- **1 SP**: Trivial changes (typo fixes, simple config)
- **2 SP**: Small features (single component, simple API endpoint)
- **3 SP**: Medium features (multiple components, moderate complexity)
- **5 SP**: Large features (significant refactoring, complex integrations)
- **8 SP**: Very large features (major refactoring, new subsystems)
- **13+ SP**: Epic-level work (should be broken down)

**Consider:**
- Code complexity
- Testing requirements
- Documentation needs
- Integration complexity
- Unknowns/risks

## Step 4: Assign Agents to Tasks

**Important**: This command assigns agents to tasks, but does NOT define workstreams or group tasks into workstreams. Workstream definition is the orchestrator's exclusive responsibility.

Analyze each task to determine:

**Agent Type**: Based on task nature
- `ui-engineer` / `frontend-engineer` - UI components, styling, client-side
- `backend-engineer` / `api-engineer` - APIs, services, server-side
- `fullstack-engineer` - Full-stack features
- `qa-engineer` / `test-engineer` - Testing, quality assurance
- `devops-engineer` - Infrastructure, CI/CD, deployment
- `data-engineer` - Data pipelines, analytics
- Or project-specific agents (check project documentation for defined agents)

**Priority**: Based on business value and dependencies
- `P0` - Critical, blocks other work
- `P1` - High priority, important for sprint goal
- `P2` - Medium priority, nice to have
- `P3` - Low priority, can be deferred

**Note**: Workstream assignment happens later when the orchestrator analyzes the sprint file using `/orchestrator` command or `pnpm sprint:analyze`.

## Step 5: Define Acceptance Criteria

For each task, create detailed acceptance criteria:

- Specific, testable requirements
- Edge cases to handle
- Performance considerations
- Accessibility requirements (if UI)
- Error handling
- Documentation needs

## Step 6: Identify Dependencies

Map dependencies between tasks:

- **Depends on**: Tasks that must complete first
- **Blocks**: Tasks that depend on this one
- Consider technical dependencies (APIs before UI)
- Consider logical dependencies (foundation before features)

## Step 7: Split into Sprints

Group tasks into sprints based on:

**Default Parameters:**
- Maximum story points per sprint: **40 SP** (configurable via `--max-story-points`)
- Sprint duration: **2 weeks** (typical)
- Consider workstream balance (don't overload one agent)
- Respect dependencies (don't split dependent tasks across sprints)
- Group related workstreams when possible

**Sprint Naming:**
- `Sprint 1: [Theme/Goal]`
- `Sprint 2: [Theme/Goal]`
- Use descriptive names based on sprint goals

**Sprint Goals:**
- Define 2-4 objectives per sprint
- Make goals specific and measurable
- Align with sprint tasks

## Step 8: Generate Sprint Files

For each sprint, create a file in `.claude/backlog/sprint-X-<name>.md` following the format defined in `sprint-status-management.md`:

### File Structure:

```markdown
# Sprint X: [Name]

**Status**: TODO
**Start Date**: YYYY-MM-DD
**Target End**: YYYY-MM-DD
**Progress**: 0/X tasks complete (0%)

**Duration**: 2 weeks
**Goal**: [Brief sprint goal]
**Target Velocity**: X story points

## Sprint Objectives

1. Objective 1
2. Objective 2
3. Objective 3

## Tasks

### [TASK-XXX] Task Title

**Status**: TODO
**Priority**: P0 | P1 | P2 | P3
**Effort**: X story points
**Agent**: agent-name (e.g., ui-engineer, backend-engineer)
**Phase**: Phase name or number

**Description**:
Detailed description of what needs to be done.

**Acceptance Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Dependencies**:
- **Depends on**: TASK-YYY (if any)
- **Blocks**: TASK-ZZZ (if any)

---

**Note**: Workstreams section will be added by the orchestrator when analyzing the sprint file.

## Sprint Summary

**Total Story Points**: X
**Critical Path**: TASK-XXX → TASK-YYY → TASK-ZZZ
**Risk Areas**: Description of risks

**Sprint Success Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2
```

## Step 9: Verify and Refine

After generating all sprint files:

1. **Review sprint balance**: Ensure story points are reasonable per sprint
2. **Check dependencies**: Verify no circular dependencies
3. **Review agent assignments**: Ensure agents are appropriate for each task
4. **Review priorities**: Ensure P0 tasks are in early sprints
5. **Check acceptance criteria**: Ensure they're specific and testable

**Note**: Workstream grouping happens later when the orchestrator analyzes the sprint file.

## Usage Examples

### Basic Usage

```
/generate-sprint
```

This will:
- Scan `docs/` directory and `README.md` for tasks
- Use default max 40 story points per sprint
- Generate sprint files in `.claude/backlog/`

### Custom Max Story Points

```
/generate-sprint --max-story-points=30
```

Useful for:
- Shorter sprints (1 week)
- Smaller teams
- More conservative planning

### Custom Documentation Sources

```
/generate-sprint --docs="docs/,ROADMAP.md,PROJECT.md"
```

Specify custom paths:
- Comma-separated list of directories or files
- Relative to project root
- Can mix directories and files

### Combined Options

```
/generate-sprint --max-story-points=50 --docs="docs/features/,docs/roadmap.md"
```

## Output

The command generates:

1. **Multiple sprint files**: `.claude/backlog/sprint-1-<name>.md`, `sprint-2-<name>.md`, etc.
2. **Summary**: Total tasks, total story points, number of sprints
3. **Next steps**: Instructions for using the generated sprints

## Next Steps After Generation

1. **Review generated sprints**: Check that tasks are properly organized and agents are assigned
2. **Adjust if needed**: Manually refine priorities, dependencies, agent assignments, or estimates
3. **Start with Sprint 1**: Use `/orchestrator` to begin sprint execution
   - The orchestrator will analyze the sprint file and define workstreams
   - The orchestrator groups tasks into workstreams based on dependencies and parallelization opportunities
   - Run: `pnpm sprint:analyze .claude/backlog/sprint-1-<name>.md --interactive`
4. **Create workstreams**: `pnpm sprint:create-workstreams`

## Important Notes

- **Story point estimates are initial**: Adjust based on team velocity
- **Agent assignments are suggestions**: Review and adjust based on project structure and agent availability
- **Workstreams are NOT defined**: The orchestrator is exclusively responsible for defining workstreams and grouping tasks. Use `/orchestrator` command or `sprint:analyze --interactive` to define workstreams
- **Dependencies are suggestions**: Review and adjust based on actual work
- **Acceptance criteria are starting points**: Expand based on requirements
- **Sprint goals should be validated**: Ensure they align with project objectives

## Best Practices

1. **Start conservative**: Lower story points per sprint initially
2. **Assign agents appropriately**: Match agent types to task requirements
3. **Respect dependencies**: Don't split dependent tasks across sprints
4. **Group related work**: Keep similar tasks in same sprint
5. **Review regularly**: Adjust estimates based on actual velocity
6. **Let orchestrator handle workstreams**: Don't try to group tasks into workstreams - that's the orchestrator's job

---

**This command uses Claude's understanding of your project to create intelligent, well-structured sprint backlogs.**

