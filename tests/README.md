# Sprint Orchestrator Test Suite

This directory contains automated tests for the Sprint Orchestrator framework.

## Test Structure

```
tests/
├── fixtures/              # Test data and fixtures
│   ├── sample-sprint.md          # Sample sprint file for testing
│   └── ecommerce-project/        # Ecommerce project documentation
│       ├── README.md
│       └── docs/
│           ├── features.md
│           ├── technical-requirements.md
│           └── roadmap.md
├── helpers/              # Test utilities
│   └── test-setup.js      # Test environment setup/teardown
├── unit/                  # Unit tests
│   ├── test-install.js           # Tests for install.js script
│   └── test-sprint-scripts.js    # Tests for all sprint scripts
├── setup-evaluation-project.sh   # Script to create evaluation project
└── evaluation-project/           # Manual evaluation project (created by setup script)
```

## Running Tests

### Run all tests
```bash
pnpm test
```

### Run unit tests only
```bash
pnpm test:unit
```

### Run specific test file
```bash
node tests/unit/test-install.js
node tests/unit/test-sprint-scripts.js
```

## Manual Evaluation

For manual evaluation of Claude commands (`/orchestrator`, `/workstream-agent`, `/generate-sprint`), use the evaluation project:

```bash
# Setup evaluation project (one time)
./tests/setup-evaluation-project.sh

# Navigate to evaluation project
cd tests/evaluation-project

# Follow evaluation steps in docs/evaluation.md
```

The evaluation project provides a clean test environment for manual testing of LLM commands.

## Test Framework

Tests use Node.js built-in test runner (available in Node.js 18+). No external dependencies required.

## Test Coverage

### Unit Tests (`tests/unit/`)

**test-install.js**: Tests for `install.js` script
- Directory creation
- Symlink creation
- Package.json updates
- .gitignore updates
- Error handling
- Conflict detection

### Manual Evaluation

**Claude Commands**: `/orchestrator`, `/workstream-agent`, `/generate-sprint`

These are LLM commands (not scripts) and are evaluated manually using the evaluation project:
- See `docs/evaluation.md` for evaluation procedures
- Use `tests/evaluation-project/` for manual testing
- Run `./tests/setup-evaluation-project.sh` to create evaluation project

## Fixtures

### sample-sprint.md
A complete sprint file following the framework's sprint format. Used to test sprint parsing and validation.

### ecommerce-project/
A complete project documentation structure including:
- **README.md**: Project overview with features and requirements
- **docs/features.md**: Detailed feature descriptions
- **docs/technical-requirements.md**: Technical specifications
- **docs/roadmap.md**: Development roadmap with sprints

This fixture is used to test the `/generate-sprint` command's ability to extract tasks from real-world documentation.

## Test Helpers

### test-setup.js

Provides utilities for test environment management:

- **createTempDir()**: Create temporary directories for testing
- **initGitRepo()**: Initialize Git repositories
- **copyFixtures()**: Copy fixture files to test directories
- **createPackageJson()**: Create package.json files
- **cleanup()**: Clean up all temporary directories

## Writing New Tests

### Example Test Structure

```javascript
const { test } = require('node:test');
const assert = require('node:assert');
const TestSetup = require('../helpers/test-setup');

const setup = new TestSetup();

test.beforeEach(() => {
  // Set up test environment
  const tempDir = setup.createTempDir();
  setup.initGitRepo(tempDir);
  process.chdir(tempDir);
});

test.afterEach(() => {
  // Clean up
  setup.cleanup();
});

test('test description', () => {
  // Test implementation
  assert.ok(true, 'Test assertion');
});
```

## Test Isolation

Each test runs in its own temporary directory and Git repository. Tests are completely isolated and can run in parallel.

## CI/CD Integration

Tests are designed to run in CI/CD pipelines:
- No external dependencies
- Fast execution
- Deterministic results
- Proper cleanup

## Contributing

When adding new features:
1. Add tests for new functionality
2. Ensure all tests pass
3. Update this README if adding new test categories

