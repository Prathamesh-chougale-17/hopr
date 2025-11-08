# hopr

## 0.2.0

### Minor Changes

- ## Major Migration Improvements and Fixes

  ### Breaking Changes
  - TypeScript configuration is now completely regenerated to match TanStack Start requirements
  - Project structure normalization now moves ALL folders (except public) to src/

  ### Features
  - **Smart folder migration**: Automatically moves all project folders to src/ except excluded ones (public, node_modules, etc.)
  - **TanStack-compliant tsconfig.json**: Generates fresh TypeScript configuration matching TanStack Start template
  - **Improved file system utilities**: Added readDir() and stat() methods for better file operations

  ### Bug Fixes
  - Fixed missing @types/fs-extra dependency causing CI/CD type errors
  - Fixed ESLint config export issue preventing linting
  - Fixed import issues in code transformer

  ### Internal Improvements
  - Added comprehensive test suite with 74 passing tests
  - Implemented Husky pre-commit hooks for quality assurance
  - Updated GitHub workflows to enforce testing before releases
  - All quality checks now pass: linting, type checking, and tests

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
