# hopr - Industry-Standard Project Structure

This document outlines the production-ready, industry-standard structure of the hopr CLI monorepo.

## Overview

hopr is built as a Turborepo monorepo with:
- Shared packages for modularity and reusability
- Changesets for version management
- GitHub Actions for CI/CD
- npm registry publishing setup

## Directory Structure

```
hopr/
├── .changeset/                 # Changesets configuration and changelog entries
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
│   ├── cli/                    # Main CLI application (publishable)
│   │   ├── src/
│   │   │   ├── commands/       # CLI commands (migrate, detect)
│   │   │   └── index.ts        # CLI entry point
│   │   ├── dist/               # Built output
│   │   ├── package.json        # Package configuration for npm
│   │   ├── tsconfig.json
│   │   ├── README.md
│   │   ├── USAGE.md
│   │   ├── DEVELOPMENT.md
│   │   └── QUICK_REFERENCE.md
│   │
│   ├── web/                    # Next.js app (for testing migrations)
│   ├── docs/                   # Next.js docs app (for testing migrations)
│   └── tanstack-template/      # TanStack Start app (migration target example)
│
├── packages/
│   ├── cli-core/               # Core utilities package (publishable)
│   │   ├── src/
│   │   │   ├── detectors/      # Framework detection logic
│   │   │   └── utils/          # File system, logging, backup
│   │   ├── dist/               # Built output
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── cli-transformers/       # Transformers package (publishable)
│   │   ├── src/
│   │   │   ├── file-transformer.ts
│   │   │   ├── code-transformer.ts
│   │   │   ├── package-transformer.ts
│   │   │   └── config-transformer.ts
│   │   ├── dist/               # Built output
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── cli-migrators/          # Migrators package (publishable)
│   │   ├── src/
│   │   │   ├── base.ts         # Base migrator interface
│   │   │   └── nextjs-to-tanstack.ts
│   │   ├── dist/               # Built output
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui/                     # Shared UI components
│   ├── eslint-config/          # Shared ESLint configuration
│   └── typescript-config/      # Shared TypeScript configuration
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
├── CLAUDE.md                   # Claude Code guidance
└── CLI_IMPLEMENTATION_SUMMARY.md  # Implementation summary
```

## Package Architecture

### Published Packages

All CLI-related packages are published to npm with `@hopr` scope:

1. **hopr** (`apps/cli`)
   - Main CLI application
   - Executable entry point
   - Command orchestration
   - User interaction

2. **@hopr/cli-core** (`packages/cli-core`)
   - Framework detection
   - File system utilities
   - Logging and backup
   - Shared types

3. **@hopr/cli-transformers** (`packages/cli-transformers`)
   - File transformations
   - AST-based code transformations
   - Package.json updates
   - Configuration generation

4. **@hopr/cli-migrators** (`packages/cli-migrators`)
   - Migration orchestration
   - Framework-specific migrators
   - Migration pipeline

### Dependency Graph

```
hopr (CLI)
 ├─→ @hopr/cli-core
 ├─→ @hopr/cli-transformers
 │    └─→ @hopr/cli-core
 └─→ @hopr/cli-migrators
      ├─→ @hopr/cli-core
      └─→ @hopr/cli-transformers
```

### Internal Packages (Not Published)

- **@repo/ui** - Shared React components
- **@repo/eslint-config** - Shared ESLint rules
- **@repo/typescript-config** - Shared TypeScript configs

## Version Management

### Changesets Workflow

1. **Make changes** to code
2. **Create changeset**: `bun changeset`
3. **Commit changeset**: Git commit the `.changeset/*.md` file
4. **Open PR**: Submit pull request
5. **Merge PR**: Changesets Action creates "Version Packages" PR
6. **Review versions**: Check version bumps and changelogs
7. **Merge version PR**: Packages are automatically published

### Linked Versions

All CLI packages are linked together in `.changeset/config.json`:

```json
{
  "linked": [
    ["hopr", "@hopr/cli-core", "@hopr/cli-transformers", "@hopr/cli-migrators"]
  ]
}
```

This means they all version together for consistency.

## CI/CD Pipeline

### Workflows

1. **CI (ci.yml)**
   - Runs on: Push to main, PRs
   - Jobs: Lint, Type check, Build
   - Purpose: Ensure code quality

2. **Release (release.yml)**
   - Runs on: Push to main
   - Jobs: Build and publish packages
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

### Build Order

1. **cli-core** → Built first (no dependencies)
2. **cli-transformers** → Depends on cli-core
3. **cli-migrators** → Depends on cli-core and cli-transformers
4. **hopr (CLI app)** → Depends on all above

## Publishing Strategy

### Access Control

All packages use public access:

```json
{
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

### Package Contents

Each package specifies files to include:

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

# Make changes to packages/cli-core, etc.

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
cd apps/cli
bun run src/index.ts detect ../web
bun run src/index.ts migrate ../web --dry-run

# Link globally for testing
npm link

# Test globally
hopr --version
hopr detect .

# Unlink
npm unlink -g hopr
```

## Best Practices Implemented

### 1. Modularity
- Separated concerns into focused packages
- Reusable components across projects
- Clear dependency boundaries

### 2. Type Safety
- Full TypeScript implementation
- Strict mode enabled
- Composite projects for incremental builds

### 3. Version Management
- Automated with Changesets
- Semantic versioning
- Linked package versions

### 4. CI/CD
- Automated testing
- Multi-platform testing
- Automated releases

### 5. Documentation
- Comprehensive README
- Usage guides
- Contributing guidelines
- Publishing instructions

### 6. Package Management
- Workspace dependencies
- Exact versions
- Public access configured

### 7. Code Quality
- ESLint for linting
- TypeScript for type checking
- Prettier for formatting
- Turbo for caching

## Security Considerations

- No secrets in repository
- NPM_TOKEN stored in GitHub Secrets
- Use automation tokens
- Public access for all packages
- MIT License clearly stated

## Scalability

The architecture supports:
- Adding new framework migrations
- Adding new shared packages
- Independent package versioning (if needed)
- Multi-language support (future)
- Plugin system (future)

## Maintenance

### Regular Tasks

- Update dependencies regularly
- Review and merge Dependabot PRs
- Monitor CI/CD pipelines
- Respond to issues
- Review PRs

### Versioning Guidelines

- **Major (1.0.0)**: Breaking changes
- **Minor (0.1.0)**: New features
- **Patch (0.0.1)**: Bug fixes

## Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Changesets Documentation](https://github.com/changesets/changesets)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [npm Publishing Documentation](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

---

This structure follows industry best practices for:
- Monorepo management
- Package publishing
- Version control
- CI/CD automation
- Documentation
- Open source projects
