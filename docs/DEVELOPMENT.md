# Development Guide - Cross-Platform Setup

This guide helps you set up a seamless development environment across Mac and Windows.

## Prerequisites

### 1. Node.js Version Manager

**Mac/Linux:**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal, then:
nvm install 18
nvm use 18
nvm alias default 18
```

**Windows:**
1. Download **nvm-windows** from: https://github.com/coreybutler/nvm-windows/releases
2. Install `nvm-setup.exe` (latest version)
3. Open PowerShell or Command Prompt as Administrator:
```bash
nvm install 18
nvm use 18
```

**Auto-switch Node version:**
- This project includes `.nvmrc` file
- On Mac/Linux: `nvm use` will auto-detect
- On Windows: Run `nvm use` in project root

### 2. Git Configuration

**Set consistent line endings (run on both machines):**
```bash
git config --global core.autocrlf false
git config --global core.eol lf
```

This ensures files always use LF (Unix) line endings, even on Windows.

### 3. Cursor IDE Setup

**Install recommended extensions:**
- Open project in Cursor
- Click "Install Recommended Extensions" when prompted
- Or: Press `Cmd/Ctrl + Shift + P` → "Extensions: Show Recommended Extensions"

**Required extensions:**
- ESLint
- Prettier
- EditorConfig

## Initial Setup (Both Machines)

### 1. Clone Repository
```bash
git clone git@github.com:sainathyai/CollabCanva.git
cd CollabCanva
```

### 2. Install Dependencies
```bash
# Frontend
cd frontend
npm install

# Backend (once created in PR4)
cd ../backend
npm install
```

### 3. Environment Variables
```bash
# Copy example files
cp .env.example frontend/.env
cp .env.example backend/.env

# Edit with your values
# Mac: use nano, vim, or Cursor
# Windows: use notepad, Cursor, or any editor
```

## Development Workflow

### Starting Development Servers

**Mac/Linux:**
```bash
# Terminal 1 - Backend (after PR4)
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

**Windows (PowerShell):**
```powershell
# Terminal 1 - Backend (after PR4)
cd backend; npm run dev

# Terminal 2 - Frontend
cd frontend; npm run dev
```

### Code Formatting

**Auto-format on save** is enabled in `.vscode/settings.json`

**Manual format:**
```bash
# Format all files
npx prettier --write .

# Check formatting
npx prettier --check .
```

### Linting

```bash
# Frontend
cd frontend
npm run lint

# Backend (after PR4)
cd backend
npm run lint
```

## Git Workflow (Same on Both Machines)

### 1. Pull Latest Changes
```bash
git pull origin main
```

### 2. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes & Commit
```bash
git add .
git commit -m "Description of changes"
```

### 4. Push & Create PR
```bash
git push -u origin feature/your-feature-name
```

Then create PR on GitHub.

## Troubleshooting

### Windows-Specific Issues

**1. Line Ending Warnings:**
If you see git warnings about CRLF/LF:
```bash
git config core.autocrlf false
git rm --cached -r .
git reset --hard
```

**2. Permission Issues:**
- Run terminal/PowerShell as Administrator
- Or use WSL2 (Windows Subsystem for Linux)

**3. Node-gyp Build Errors:**
```bash
npm install --global windows-build-tools
```

### Mac-Specific Issues

**1. Command Not Found (after nvm install):**
Add to `~/.zshrc` or `~/.bash_profile`:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

**2. Permission Issues:**
```bash
sudo chown -R $(whoami) ~/.npm
```

## Syncing Between Machines

### What Gets Committed:
✅ `.nvmrc` - Node version
✅ `.editorconfig` - Editor settings
✅ `.prettierrc` - Code formatting
✅ `.vscode/settings.json` - Workspace settings
✅ `.vscode/extensions.json` - Recommended extensions
✅ Source code
✅ Configuration files

### What Doesn't Get Committed:
❌ `node_modules/` - Install locally with `npm install`
❌ `.env` files - Copy and configure locally
❌ `dist/` builds - Generate locally with `npm run build`
❌ OS-specific files (`.DS_Store`, `Thumbs.db`)
❌ User-specific IDE settings

## Best Practices

1. **Always pull before starting work:**
   ```bash
   git pull origin main
   ```

2. **Run `npm install` after pulling:**
   Dependencies might have changed.

3. **Check Node version:**
   ```bash
   node --version  # Should be v18.x.x
   ```

4. **Test before committing:**
   ```bash
   npm run build
   npm run lint
   ```

5. **Use consistent paths:**
   - Use `/` in code (works on both OS)
   - Avoid hardcoded absolute paths

## IDE Shortcuts (Same on Both)

| Action | Mac | Windows |
|--------|-----|---------|
| Command Palette | `Cmd + Shift + P` | `Ctrl + Shift + P` |
| Quick Open | `Cmd + P` | `Ctrl + P` |
| Format Document | `Shift + Option + F` | `Shift + Alt + F` |
| Terminal | `` Ctrl + ` `` | `` Ctrl + ` `` |
| Save All | `Cmd + K, S` | `Ctrl + K, S` |

## Need Help?

- Check GitHub Issues
- Review PRD_MVP.md and Tasks.md
- Run `npm run dev` for local testing

