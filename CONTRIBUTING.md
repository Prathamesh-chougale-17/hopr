# Contributing to hopr

Thank you for your interest in contributing to hopr! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js >=18
- Bun 1.2.22 or later
- Git

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/hopr.git
   cd hopr
   ```

3. Install dependencies:
   ```bash
   bun install
   ```

4. Build all packages:
   ```bash
   bun run build
   ```

## Project Structure

```
hopr/
├── apps/
│   ├── cli/           # Main CLI application
│   ├── web/           # Next.js web app (for testing)
│   ├── docs/          # Next.js docs app (for testing)
│   └── tanstack-template/  # TanStack Start app (for testing)
├── packages/
│   ├── cli-core/      # Core utilities and detection
│   ├── cli-transformers/  # File and code transformers
│   ├── cli-migrators/ # Framework migrators
│   ├── ui/            # Shared UI components
│   ├── eslint-config/ # Shared ESLint config
│   └── typescript-config/  # Shared TypeScript config
└── .github/
    └── workflows/     # CI/CD workflows
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

Edit the code in the appropriate package or app.

### 3. Test Your Changes

```bash
# Run type checking
bun run check-types

# Run linting
bun run lint

# Test the CLI
cd apps/cli
bun run src/index.ts detect ../web
bun run src/index.ts migrate ../web --dry-run
```

### 4. Add a Changeset

If your changes should trigger a release:

```bash
bun changeset
```

Select the packages that changed and describe your changes.

### 5. Commit Your Changes

Follow conventional commits:

```bash
git add .
git commit -m "feat: add new migration feature"
# or
git commit -m "fix: resolve detection bug"
# or
git commit -m "docs: update README"
```

Commit types:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `chore:` Maintenance tasks
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `perf:` Performance improvements

### 6. Push and Create PR

```bash
git push origin your-branch-name
```

Then create a Pull Request on GitHub.

## Adding New Framework Support

To add support for migrating to/from a new framework:

1. **Create a Detector** (if needed):
   ```typescript
   // packages/cli-core/src/detectors/your-framework.ts
   export class YourFrameworkDetector {
     static async detect(projectPath: string): Promise<boolean> {
       // Detection logic
     }
   }
   ```

2. **Create a Migrator**:
   ```typescript
   // packages/cli-migrators/src/your-migration.ts
   export class YourMigrator extends BaseMigrator {
     async migrate(): Promise<MigrationResult> {
       // Migration logic
     }
   }
   ```

3. **Update Commands**:
   ```typescript
   // apps/cli/src/commands/migrate.ts
   // Add your migrator to the command logic
   ```

4. **Add Tests** (when test infrastructure is available)

5. **Update Documentation**:
   - Add to README.md
   - Update USAGE.md
   - Create migration guide in docs/

## Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Format code with Prettier
- Write descriptive variable and function names
- Add comments for complex logic
- Use async/await instead of promises

## Testing

Currently manual testing is used. When adding features:

1. Test on multiple operating systems (Windows, macOS, Linux)
2. Test with different package managers (bun, npm, pnpm, yarn)
3. Test edge cases and error scenarios

Future: Add unit and integration tests with Vitest.

## Documentation

When adding features:

1. Update README.md
2. Update USAGE.md
3. Add JSDoc comments to functions
4. Update CLAUDE.md if architecture changes
5. Create migration guides in docs/

## Pull Request Guidelines

### PR Title

Use conventional commit format:

```
feat: add SvelteKit migration support
fix: resolve Windows path issues
docs: improve installation instructions
```

### PR Description

Include:

1. **What**: What changes are being made
2. **Why**: Why these changes are needed
3. **How**: How the changes work
4. **Testing**: How you tested the changes
5. **Screenshots**: If applicable

Template:

```markdown
## Description
Brief description of changes

## Motivation
Why these changes are needed

## Changes
- Change 1
- Change 2

## Testing
- [ ] Tested on Windows
- [ ] Tested on macOS
- [ ] Tested on Linux
- [ ] Tested with bun
- [ ] Tested with npm

## Screenshots (if applicable)
```

### Review Process

1. All checks must pass (CI/CD)
2. At least one approval required
3. No merge conflicts
4. Changesets added (if needed)

## Reporting Issues

When reporting bugs:

1. **Search existing issues** first
2. **Use the bug template** (if available)
3. **Include**:
   - Operating system
   - Node.js version
   - Bun version
   - hopr version
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages or logs

## Feature Requests

When requesting features:

1. **Search existing issues** first
2. **Use the feature template** (if available)
3. **Describe**:
   - The problem you're solving
   - Your proposed solution
   - Alternative solutions considered
   - Additional context

## Questions

For questions:

1. Check existing documentation
2. Search closed issues
3. Open a discussion (not an issue)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Getting Help

- Read the documentation
- Check existing issues and PRs
- Ask questions in discussions
- Join community channels (if available)

## Thank You!

Your contributions make hopr better for everyone. We appreciate your time and effort! 🎉
