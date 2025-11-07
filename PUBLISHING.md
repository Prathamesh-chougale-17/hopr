# Publishing Guide

This document outlines the process for publishing the `hopr` CLI and related packages to npm.

## Prerequisites

1. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com)
2. **npm Token**: Generate an automation token from your npm account settings
3. **GitHub Secrets**: Add `NPM_TOKEN` to your repository secrets

## Package Structure

The repository publishes multiple packages:

- `hopr` - Main CLI package
- `@hopr/cli-core` - Core utilities and framework detection
- `@hopr/cli-transformers` - Code and file transformers
- `@hopr/cli-migrators` - Framework migrators

## Local Publishing Setup

### 1. Login to npm

```bash
npm login
```

### 2. Build all packages

```bash
bun run build
```

### 3. Test locally

```bash
# Link the CLI globally
cd apps/cli
npm link

# Test the CLI
hopr --version
hopr detect .
```

### 4. Unlink after testing

```bash
npm unlink -g hopr
```

## Version Management with Changesets

### Adding a changeset

When you make changes that should be released:

```bash
bun changeset
```

This will prompt you to:
1. Select which packages changed
2. Choose version bump type (major/minor/patch)
3. Write a summary

### Version bumping

To update versions based on changesets:

```bash
bun run version-packages
```

This will:
- Update package.json versions
- Generate/update CHANGELOG.md
- Delete consumed changesets

### Manual publishing

To publish all packages:

```bash
bun run release
```

This will:
- Build all packages
- Publish to npm
- Create git tags

## Automated Publishing (GitHub Actions)

### Setup

1. Add `NPM_TOKEN` to GitHub repository secrets:
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm automation token

### Workflow

The release process is automated:

1. **Create changesets** in your PR
   ```bash
   bun changeset
   git add .changeset
   git commit -m "chore: add changeset"
   ```

2. **Merge PR** to main branch

3. **Changesets Action** creates a "Version Packages" PR

4. **Review and merge** the Version Packages PR

5. **Packages are published** automatically

## Manual Publishing Steps

If you need to publish manually:

### 1. Ensure you're on main

```bash
git checkout main
git pull origin main
```

### 2. Build packages

```bash
bun run build
```

### 3. Publish with changesets

```bash
bun changeset publish
```

### 4. Push tags

```bash
git push --follow-tags
```

## Package Configuration

Each package has `publishConfig` in package.json:

```json
{
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

## Version Strategy

We use [Semantic Versioning](https://semver.org/):

- **Major (1.0.0)**: Breaking changes
- **Minor (0.1.0)**: New features, backwards compatible
- **Patch (0.0.1)**: Bug fixes, backwards compatible

## Pre-release Versions

For pre-release versions:

```bash
# Create a pre-release changeset
bun changeset --snapshot preview

# Version with pre-release
bun changeset version --snapshot preview

# Publish with tag
bun changeset publish --tag preview
```

## Troubleshooting

### Cannot publish - package already exists

If you get a version conflict:

```bash
# Check current version on npm
npm view hopr version

# Update local version to be higher
bun changeset version
```

### 401 Unauthorized

Verify your npm token:

```bash
npm whoami
```

If not logged in:

```bash
npm login
```

### Build failures

Ensure all packages build successfully:

```bash
# Clean and rebuild
bun run clean
bun run build
```

## Testing Before Publishing

### 1. Dry run

```bash
bun changeset publish --dry-run
```

### 2. Test installation

```bash
# Pack packages
cd apps/cli
npm pack

# Install locally
npm install -g ./hopr-0.1.0.tgz

# Test
hopr --version
```

## Post-Publishing

After publishing:

1. **Verify on npm**: Check [npmjs.com/package/hopr](https://www.npmjs.com/package/hopr)
2. **Test installation**: `npx hopr@latest --version`
3. **Update documentation**: Update version numbers in README
4. **Announce release**: Create GitHub release with changelog

## CI/CD Pipeline

The GitHub Actions workflow (`release.yml`):

1. Runs on every push to `main`
2. Checks for changesets
3. Creates Version Packages PR if changesets exist
4. Publishes when Version Packages PR is merged
5. Creates git tags for published versions

## Security

- Never commit `NPM_TOKEN` to the repository
- Use automation tokens, not legacy tokens
- Enable 2FA on your npm account
- Review published files before releasing

## Links

- [npm Documentation](https://docs.npmjs.com/)
- [Changesets Documentation](https://github.com/changesets/changesets)
- [Semantic Versioning](https://semver.org/)
- [GitHub Actions](https://docs.github.com/en/actions)
