# hopr - Simplified Project Structure

This document outlines the production-ready structure of the hopr CLI monorepo.

## Overview

hopr is built as a Turborepo monorepo with:
- Single publishable CLI package in `packages/cli`
- Shared internal packages for configuration
- Changesets for version management
- GitHub Actions for CI/CD
- npm registry publishing setup

## Directory Structure

```
hopr/
├── .changeset/                 # Changesets configuration
│   ├── config.json
│   └── README.md
│
├── .github/
│   └── workflows/              # GitHub Actions workflows
│       ├── ci.yml              # Continuous Integration
│       ├── release.yml         # Automated releases
│       └── test-cli.yml        # CLI testing on multiple platforms
│
├── apps/
│   ├── web/                    # Next.js app (for testing migrations)
│   ├── docs/                   # Next.js docs app (for testing migrations)
│   └── tanstack-template/      # TanStack Start app (migration target example)
│
├── packages/
│   ├── cli/                    # Main CLI package (publishable as "hopr")
│   │   ├── src/
│   │   │   ├── commands/       # CLI commands (migrate, detect)
│   │   │   ├── detectors/      # Framework detection
│   │   │   ├── migrators/      # Migration implementations
│   │   │   ├── transformers/   # Code and file transformers
│   │   │   ├── utils/          # Utilities (logger, file-system, backup)
│   │   │   └── index.ts        # Entry point
│   │   ├── dist/               # Built output
│   │   ├── package.json        # v0.1.0, publishable to npm
│   │   ├── tsconfig.json
│   │   ├── README.md
│   │   ├── USAGE.md
│   │   └── DEVELOPMENT.md
│   │
│   ├── ui/                     # Shared UI components (@repo/ui)
│   ├── eslint-config/          # Shared ESLint config (@repo/eslint-config)
│   └── typescript-config/      # Shared TypeScript config (@repo/typescript-config)
│
├── docs/
│   └── nextjs-to-tanstack-start.md  # Migration guide
│
├── .npmrc                      # npm configuration
├── package.json                # Root package configuration
├── turbo.json                  # Turborepo configuration
├── bun.lockb                   # Lock file (Bun)
├── LICENSE                     # MIT License
├── README.md                   # Main documentation
├── CONTRIBUTING.md             # Contribution guidelines
├── PUBLISHING.md               # Publishing guide
└── CLAUDE.md                   # Claude Code guidance
```

## Package Architecture

### Published Package

**hopr** (`packages/cli`)
- Main CLI application
- Executable entry point (`hopr` command)
- All functionality in single package:
  - Framework detection
  - File and code transformers
  - Migration implementations
  - Utilities (logging, file system, backup)

### Internal Packages (Not Published)

- **@repo/ui** - Shared React components
- **@repo/eslint-config** - Shared ESLint rules
- **@repo/typescript-config** - Shared TypeScript configs

## CLI Package Structure

```
packages/cli/
├── src/
│   ├── commands/
│   │   ├── migrate.ts          # Migration command
│   │   └── detect.ts           # Detection command
│   │
│   ├── detectors/
│   │   ├── index.ts            # Framework detector
│   │   ├── nextjs.ts           # Next.js detector
│   │   └── types.ts            # Type definitions
│   │
│   ├── migrators/
│   │   ├── base.ts             # Base migrator
│   │   └── nextjs-to-tanstack.ts  # Next.js → TanStack
│   │
│   ├── transformers/
│   │   ├── file-transformer.ts      # File operations
│   │   ├── code-transformer.ts      # AST transformations
│   │   ├── package-transformer.ts   # package.json updates
│   │   └── config-transformer.ts    # Config generation
│   │
│   ├── utils/
│   │   ├── logger.ts           # Colored logging
│   │   ├── file-system.ts      # File system utilities
│   │   └── backup.ts           # Backup management
│   │
│   └── index.ts                # CLI entry point
│
├── dist/                       # Built output
├── package.json                # Package configuration
├── tsconfig.json               # TypeScript config
├── README.md                   # Package documentation
├── USAGE.md                    # Usage guide
└── DEVELOPMENT.md              # Development guide
```

## Version Management

### Changesets Workflow

1. **Make changes** to code
2. **Create changeset**: `bun changeset`
3. **Commit changeset**: Git commit the `.changeset/*.md` file
4. **Open PR**: Submit pull request
5. **Merge PR**: Changesets Action creates "Version Packages" PR
6. **Review versions**: Check version bumps and changelogs
7. **Merge version PR**: Package is automatically published to npm

## CI/CD Pipeline

### Workflows

1. **CI (ci.yml)**
   - Runs on: Push to main, PRs
   - Jobs: Lint, Type check, Build
   - Purpose: Ensure code quality

2. **Release (release.yml)**
   - Runs on: Push to main
   - Jobs: Build and publish package
   - Triggers: When changesets exist
   - Creates: Version Packages PR or publishes

3. **Test CLI (test-cli.yml)**
   - Runs on: PRs affecting CLI
   - Jobs: Test on Windows, macOS, Linux
   - Node versions: 18, 20, 22
   - Purpose: Cross-platform compatibility

### Required Secrets

- `NPM_TOKEN` - For publishing to npm registry

## Build System

### Turborepo Tasks

Defined in `turbo.json`:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "lint": {},
    "check-types": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## Publishing Strategy

### Access Control

Package uses public access:

```json
{
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

### Package Contents

Package specifies files to include:

```json
{
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

### Pre-publish Hooks

```json
{
  "scripts": {
    "prepublishOnly": "bun run build"
  }
}
```

## Development Workflow

### Initial Setup

```bash
git clone https://github.com/yourusername/hopr.git
cd hopr
bun install
bun run build
```

### Making Changes

```bash
# Create branch
git checkout -b feature/your-feature

# Make changes to packages/cli

# Add changeset
bun changeset

# Commit and push
git add .
git commit -m "feat: your feature"
git push origin feature/your-feature

# Create PR on GitHub
```

### Local Testing

```bash
# Test CLI locally
cd packages/cli
bun run src/index.ts detect ../../apps/web
bun run src/index.ts migrate ../../apps/web --dry-run

# Link globally for testing
npm link

# Test globally
hopr --version
hopr detect .

# Unlink
npm unlink -g hopr
```

## Best Practices Implemented

### 1. Simplicity
- Single package instead of multiple packages
- All code in one place
- Easier to maintain and understand

### 2. Type Safety
- Full TypeScript implementation
- Strict mode enabled
- Comprehensive type definitions

### 3. Version Management
- Automated with Changesets
- Semantic versioning
- Clear changelog

### 4. CI/CD
- Automated testing
- Multi-platform testing
- Automated releases

### 5. Documentation
- Comprehensive README
- Usage guides
- Contributing guidelines
- Publishing instructions

### 6. Code Quality
- ESLint for linting
- TypeScript for type checking
- Prettier for formatting
- Turbo for caching

## Security Considerations

- No secrets in repository
- NPM_TOKEN stored in GitHub Secrets
- Use automation tokens
- Public access for package
- MIT License clearly stated

## Scalability

The architecture supports:
- Adding new framework migrations
- Adding new commands
- Independent versioning
- Multi-language support (future)
- Plugin system (future)

## Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Changesets Documentation](https://github.com/changesets/changesets)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [npm Publishing Documentation](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

---

This simplified structure follows industry best practices with a focus on:
- **Simplicity** - Single package, easier to maintain
- **Clarity** - Clear directory structure
- **Maintainability** - Well-organized code
- **Professionalism** - Complete documentation
