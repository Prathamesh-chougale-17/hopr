# Deprecation Notice

## Deprecated Versions: 0.1.0 - 0.2.4

**Critical Bug**: These versions have a critical bug in the `normalizeToSrcStructure` function where:
- Folders are created in `src/` directory
- Files are NOT migrated and remain in the root directory
- This leaves projects in a broken state after migration

## Recommended Action

**All users must upgrade to version 1.0.0 or later immediately.**

```bash
npm install -g hopr@latest
# or
npx hopr@latest migrate <path>
```

## What Was Fixed in 1.0.0+

- Fixed directory migration to properly copy all folder contents
- Added verification step before removing source files
- Improved cross-platform support (especially Windows)
- Enhanced error handling and logging

## Deprecation Commands (For Maintainers)

After publishing version 1.0.0, run these commands to deprecate old versions:

```bash
npm deprecate hopr@0.1.0 "Critical bug: Files not migrated to src/. Upgrade to 1.0.0+"
npm deprecate hopr@0.1.1 "Critical bug: Files not migrated to src/. Upgrade to 1.0.0+"
npm deprecate hopr@0.1.2 "Critical bug: Files not migrated to src/. Upgrade to 1.0.0+"
npm deprecate hopr@0.2.0 "Critical bug: Files not migrated to src/. Upgrade to 1.0.0+"
npm deprecate hopr@0.2.1 "Critical bug: Files not migrated to src/. Upgrade to 1.0.0+"
npm deprecate hopr@0.2.2 "Critical bug: Files not migrated to src/. Upgrade to 1.0.0+"
npm deprecate hopr@0.2.3 "Critical bug: Files not migrated to src/. Upgrade to 1.0.0+"
npm deprecate hopr@0.2.4 "Critical bug: Files not migrated to src/. Upgrade to 1.0.0+"
```

Or use a range (if all versions have the same issue):

```bash
npm deprecate hopr@">=0.1.0 <1.0.0" "Critical bug: Files not migrated to src/. Upgrade to 1.0.0+"
```
