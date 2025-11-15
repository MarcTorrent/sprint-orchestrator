#!/bin/bash

# Setup script for manual evaluation project
# Creates a test project in tests/evaluation-project/ for manual testing

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRAMEWORK_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
EVAL_PROJECT_DIR="$SCRIPT_DIR/evaluation-project"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 SETTING UP EVALUATION PROJECT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create evaluation project directory
if [ -d "$EVAL_PROJECT_DIR" ]; then
  echo "⚠️  Evaluation project already exists at: $EVAL_PROJECT_DIR"
  read -p "Remove and recreate? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf "$EVAL_PROJECT_DIR"
  else
    echo "Keeping existing project. Exiting."
    exit 0
  fi
fi

mkdir -p "$EVAL_PROJECT_DIR"
cd "$EVAL_PROJECT_DIR"

echo "📁 Created evaluation project directory: $EVAL_PROJECT_DIR"
echo ""

# Initialize Git repository
echo "🔧 Initializing Git repository..."
git init
git config user.name "Test User"
git config user.email "test@example.com"
git checkout -b develop
git commit --allow-empty -m "Initial commit"
echo "✅ Git repository initialized"
echo ""

# Create package.json
echo "📦 Creating package.json..."
cat > package.json <<EOF
{
  "name": "evaluation-project",
  "version": "1.0.0",
  "description": "Test project for Sprint Orchestrator evaluation",
  "scripts": {}
}
EOF
echo "✅ package.json created"
echo ""

# Create .gitignore
echo "🙈 Creating .gitignore..."
cat > .gitignore <<EOF
node_modules/
.env
*.log
.DS_Store
EOF
echo "✅ .gitignore created"
echo ""

# Copy sprint-orchestrator framework
echo "📚 Copying Sprint Orchestrator framework..."
mkdir -p sprint-orchestrator
cp -r "$FRAMEWORK_ROOT/scripts" sprint-orchestrator/
cp -r "$FRAMEWORK_ROOT/.claude" sprint-orchestrator/ 2>/dev/null || true
cp -r "$FRAMEWORK_ROOT/templates" sprint-orchestrator/
cp "$FRAMEWORK_ROOT/install.js" sprint-orchestrator/
cp "$FRAMEWORK_ROOT/uninstall.js" sprint-orchestrator/
echo "✅ Framework copied"
echo ""

# Install framework
echo "🚀 Installing framework..."
node sprint-orchestrator/install.js
echo "✅ Framework installed"
echo ""

# Copy sample sprint file
echo "📋 Copying sample sprint file..."
mkdir -p .claude/backlog
cp "$SCRIPT_DIR/fixtures/sample-sprint.md" .claude/backlog/sprint-1-subscribe.md
echo "✅ Sample sprint file copied"
echo ""

# Create README for evaluation project
echo "📝 Creating evaluation README..."
cat > README.md <<EOF
# Sprint Orchestrator Evaluation Project

This is a test project for manually evaluating the Sprint Orchestrator framework.

## Quick Start

1. **Run automated unit tests** (from framework root):
   \`\`\`bash
   cd ../..
   pnpm test:unit
   \`\`\`

2. **Run manual evaluation** (follow steps in \`docs/evaluation.md\`):
   \`\`\`bash
   # From this directory
   pnpm sprint:analyze .claude/backlog/sprint-1-subscribe.md
   pnpm sprint:create-workstreams
   pnpm sprint:orchestrate
   \`\`\`

3. **Clean up after evaluation**:
   \`\`\`bash
   pnpm sprint:cleanup-all
   \`\`\`

## Project Structure

- \`sprint-orchestrator/\` - Framework files (symlinked/copied)
- \`.claude/backlog/\` - Sprint backlog files
- \`.claude/sprint-config.json\` - Runtime configuration (auto-generated)

## Evaluation Steps

See \`../../docs/evaluation.md\` for complete evaluation procedures.

## Cleanup

To completely remove this evaluation project:

\`\`\`bash
cd ../..
rm -rf tests/evaluation-project
\`\`\`
EOF
echo "✅ README created"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ EVALUATION PROJECT SETUP COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next steps:"
echo "   1. cd tests/evaluation-project"
echo "   2. Follow evaluation steps in docs/evaluation.md"
echo "   3. Run: pnpm sprint:analyze .claude/backlog/sprint-1-subscribe.md"
echo ""

