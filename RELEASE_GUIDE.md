# Release Guide for hopr CLI v1.0.0

This guide covers releasing version 1.0.0 which fixes a critical bug and deprecating all previous versions.

## Pre-Release Checklist

- [x] Critical bug fixed (directory migration)
- [x] All tests passing (74 tests)
- [x] Type checking passes
- [x] Linting passes
- [x] Changeset created (major version)
- [x] Deprecation documentation created

## Release Steps

### 1. Version Bump and Publish

```bash
# Make sure you're on the main branch and it's clean
git status

# Run changeset version to bump version to 1.0.0
bunx changeset version

# Build the package
bun run build

# Run all quality checks
bun run lint
bun run check-types
bun run test

# Commit the version bump
git add .
git commit -m "chore(release): bump version to 1.0.0"

# Publish to npm
cd packages/cli
npm publish

# Or use changeset publish
bunx changeset publish

# Push changes and tags
git push
git push --tags
```

### 2. Deprecate Old Versions

**IMPORTANT**: Only run this AFTER version 1.0.0 is successfully published to npm.

**Option A: Using the script (recommended)**

```bash
# On Unix/Mac/Linux
bash scripts/deprecate-old-versions.sh

# On Windows
scripts\deprecate-old-versions.bat
```

**Option B: Manual deprecation**

```bash
# Make sure you're logged in to npm
npm login

# Deprecate all versions from 0.1.0 to 0.2.4
npm deprecate hopr@">=0.1.0 <1.0.0" "Critical bug: Files not migrated to src/ directory. Upgrade to 1.0.0 or later immediately."
```

### 3. Verify Deprecation

```bash
# View all versions and their deprecation status
npm view hopr versions

# View specific version info
npm view hopr@0.2.4
```

You should see a deprecation warning on old versions.

### 4. Update GitHub Release

1. Go to https://github.com/Prathamesh-Chougale-17/hopr/releases
2. Click "Draft a new release"
3. Tag: `hopr@1.0.0` (or `v1.0.0`)
4. Title: `hopr v1.0.0 - Critical Bug Fix`
5. Description:

````markdown
## 🚨 Critical Update - Upgrade Required

This release fixes a **critical bug** in versions 0.1.0 - 0.2.4 where files were not being properly migrated to the `src/` directory.

### ⚠️ Action Required

**All users must upgrade immediately.** Previous versions (0.1.0 - 0.2.4) have been deprecated.

```bash
npm install -g hopr@latest
# or
npx hopr@latest migrate <path>
```
````

### 🐛 Bug Fixes

- **CRITICAL**: Fixed directory migration in normalizeToSrcStructure
  - Folders were being created in src/ but files remained in root
  - Switched from fs.move() to copy + remove for reliability
  - Added verification before removing source files
  - Enhanced error handling and logging

### 🔧 Improvements

- Better cross-platform support (especially Windows)
- Improved FileSystem.copy() with parent directory creation
- More detailed logging during migration process

### 📦 What's Changed

See [CHANGELOG.md](CHANGELOG.md) for full details.

**Full Changelog**: https://github.com/Prathamesh-Chougale-17/hopr/compare/hopr@0.2.4...hopr@1.0.0

````

## Post-Release

1. Announce on social media/dev.to/etc (optional)
2. Monitor for issues
3. Update documentation if needed

## Rollback Plan (if needed)

If critical issues are found in 1.0.0:

```bash
# Unpublish within 72 hours
npm unpublish hopr@1.0.0

# Or deprecate if after 72 hours
npm deprecate hopr@1.0.0 "Critical issue found. Use 0.2.4 or wait for 1.0.1"

# Then fix and release 1.0.1
````

## Verification Commands

```bash
# Check published version
npm view hopr version

# Check all versions
npm view hopr versions

# Test installation
npm install -g hopr@latest

# Verify CLI works
hopr --version
hopr --help
```
