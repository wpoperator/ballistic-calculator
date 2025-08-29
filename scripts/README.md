# Scripts Directory

Professional script organization following industry standards used by major tech companies (Google, Microsoft, Netflix, etc.).

## 📁 Directory Structure

```
scripts/
├── dev/                    # Development environment scripts
│   ├── windows/           # Windows batch files (.bat)
│   └── unix/              # Unix shell scripts (.sh)
├── prod/                   # Production environment scripts
│   ├── windows/           # Windows batch files (.bat)
│   └── unix/              # Unix shell scripts (.sh)
└── deploy/                 # Deployment and CI/CD scripts
    ├── windows/           # Windows batch files (.bat)
    └── unix/              # Unix shell scripts (.sh)
```

## 🎯 Naming Convention

**Format**: `{action}.{extension}`

### Available Actions:
- `start` - Start the environment
- `stop` - Stop the environment
- `restart` - Restart the environment
- `logs` - View logs
- `clean` - Clean/reset environment
- `build` - Build images/artifacts
- `deploy` - Deploy to target environment

### Platform Extensions:
- `.bat` - Windows batch files
- `.sh` - Unix shell scripts (Linux/macOS)

## 🚀 Usage Examples

### Development (Current Focus)
```bash
# Windows
scripts\dev\windows\start.bat
scripts\dev\windows\logs.bat
scripts\dev\windows\clean.bat

# Unix (Linux/macOS)
./scripts/dev/unix/start.sh
./scripts/dev/unix/logs.sh
./scripts/dev/unix/clean.sh
```

### Production (Future Use)
```bash
# Windows
scripts\prod\windows\start.bat

# Unix
./scripts/prod/unix/start.sh
```

### Deployment (Future Use)
```bash
# Windows
scripts\deploy\windows\build.bat

# Unix
./scripts/deploy/unix/build.sh
```

## 🏢 Industry Standards

This structure follows patterns used by:
- **Google** - Separates dev/prod/deploy concerns
- **Microsoft** - Platform-specific script organization
- **Netflix** - Environment-based directory structure
- **HashiCorp** - Action-based naming convention

## 🔧 Quick Setup

**For Windows Development:**
1. Navigate to `scripts\dev\windows\`
2. Double-click `start.bat`

**For Unix Development:**
1. Make scripts executable: `chmod +x scripts/dev/unix/*.sh`
2. Run: `./scripts/dev/unix/start.sh`

## 📚 Additional Resources

- See `DOCKER-DEV-WORKFLOW.md` for detailed Docker commands
- Each script is self-contained and can be run independently
- All paths are relative to project root directory
