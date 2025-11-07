# hopr

## 0.1.2

### Patch Changes

- ### Bug Fixes
  - Fixed CommonJS/ESM compatibility issue with `fast-glob` import
  - Fixed cross-platform build script compatibility (Windows, macOS, Linux)
  - Added proper TypeScript type declarations for `fs-extra` module
  - Fixed ESLint configuration import issues
  - Improved type safety with `PackageJson` interface

  ### Improvements
  - Build script now works on all platforms using Node.js for file permissions
  - Better type inference for JSON file reading operations
