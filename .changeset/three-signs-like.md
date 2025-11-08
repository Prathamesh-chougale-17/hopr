---
"hopr": major
---

**BREAKING CHANGE**: Fixed critical directory migration bug in normalizeToSrcStructure. Previous versions (0.1.0 - 0.2.4) had a bug where folders were created in src/ but files were not properly migrated, leaving them in the root directory.

**All users should upgrade to this version immediately.** Previous versions (0.1.0 - 0.2.4) are deprecated due to this critical bug.

Changes include:
- Switched from fs.move() to copy + remove approach for better cross-platform support, especially on Windows
- Added verification step to ensure copy completed before removing source
- Enhanced error handling and logging for better debugging
- Updated FileSystem.copy() to ensure parent directories exist and use overwrite option

This ensures all project folders (app, components, lib, etc.) and their files are successfully moved to the src/ directory during migration.
