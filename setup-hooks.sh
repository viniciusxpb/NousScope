#!/bin/bash
echo "Installing git hooks..."

HOOK_DIR=".git/hooks"
PRE_COMMIT="$HOOK_DIR/pre-commit"

if [ ! -d "$HOOK_DIR" ]; then
  mkdir -p "$HOOK_DIR"
fi

cat > "$PRE_COMMIT" << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."
node angular-cleanup.js
if [ $? -ne 0 ]; then
  echo "❌ Linting failed! Commit aborted."
  exit 1
fi
EOF

chmod +x "$PRE_COMMIT"
echo "✅ Git hooks installed!"
