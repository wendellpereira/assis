# Python Linting Configuration

This project is configured with **Ruff**, a fast Python linter and formatter, to maintain code quality and consistency.

## Configuration Files

### `pyproject.toml`
- Main configuration file for Ruff
- Configured to use **single quotes** for strings
- Targets Python 3.9+
- Includes comprehensive linting rules (pyflakes, pycodestyle, etc.)

### `.vscode/settings.json`
- VS Code specific settings for auto-linting
- Configured to run Ruff on save
- Auto-fixes issues when possible
- Sets Python interpreter to virtual environment

## Features

### ✅ Auto-Linting on Save
- Automatically runs Ruff when you save any Python file
- Fixes issues automatically when possible
- Shows remaining issues in the editor

### ✅ Quote Style Enforcement
- **Single quotes** (`'`) for regular strings
- **Double quotes** (`"`) for docstrings
- Consistent formatting across the project

### ✅ Code Quality Rules
- PEP 8 compliance
- Import organization
- Unused variable detection
- Type annotation modernization
- And many more...

## Usage

### Manual Linting
```bash
# Check all files
ruff check src/

# Fix issues automatically
ruff check src/ --fix

# Include unsafe fixes
ruff check src/ --fix --unsafe-fixes

# Format code
ruff format src/
```

### VS Code Integration
The project is pre-configured for VS Code with:
- Auto-linting on save
- Auto-formatting on save
- Import organization
- Error highlighting

## Virtual Environment Setup

The linter is configured to use the project's virtual environment:
- Python interpreter: `./.venv/bin/python`
- Ruff executable: `./.venv/bin/ruff`

This ensures that import resolution works correctly and the linter has access to all project dependencies.

## Benefits

1. **Consistent Code Style**: All code follows the same formatting rules
2. **Early Error Detection**: Catches issues before they become problems
3. **Automatic Fixes**: Many issues are fixed automatically
4. **Import Resolution**: Proper Python environment detection eliminates false warnings
5. **Fast Performance**: Ruff is significantly faster than other Python linters

## Troubleshooting

If you see import resolution warnings:
1. Ensure you're using the virtual environment: `source .venv/bin/activate`
2. Check that VS Code is using the correct Python interpreter
3. Verify that dependencies are installed: `pip install -r requirements.txt`

The configuration should eliminate the "import could not be resolved" warnings you were seeing before.
