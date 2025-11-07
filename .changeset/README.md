# Changesets

Hello! 👋

This folder contains [Changesets](https://github.com/changesets/changesets) configuration and changelog entries.

## What are changesets?

Changesets are a way to manage your versioning and changelogs with a focus on monorepos. They help you version packages, generate changelogs, and publish packages to npm.

## How to use

### Adding a changeset

When you make a change that should be released, run:

```bash
bun changeset
```

This will prompt you to:
1. Select which packages have changed
2. Choose the type of change (major, minor, patch)
3. Write a summary of the changes

### Versioning packages

To bump versions based on changesets:

```bash
bun changeset version
```

This will:
- Update package.json versions
- Generate/update CHANGELOG.md files
- Delete consumed changeset files

### Publishing packages

To publish packages to npm:

```bash
bun changeset publish
```

This will:
- Build all packages
- Publish to npm registry
- Create git tags for published versions

## CI/CD Integration

The GitHub Actions workflow automatically:
- Creates a PR with version bumps when changesets are added
- Publishes packages when the version PR is merged
- Validates changesets on every PR

## Learn More

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Turborepo + Changesets Guide](https://turbo.build/repo/docs/handbook/publishing-packages)
