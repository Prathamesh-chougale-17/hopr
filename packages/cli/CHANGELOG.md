# hopr

## 1.0.2

### Patch Changes

- **Next.js Image Component Transformation** ✅
  - **Problem:** Next.js `<Image>` components were not being transformed during migration, leaving undefined component references in the migrated code
  - **Solution:** Added AST transformer to convert Next.js `<Image>` components to standard HTML `<img>` tags
  - **Features:**
    - Automatically converts `<Image>` to `<img>` in all page components
    - Removes Next.js-specific props (`priority`, `fill`, `quality`, `placeholder`, `blurDataURL`, `loading`)
    - Preserves standard HTML attributes (`src`, `alt`, `width`, `height`, `className`)
  - **Example:**
    ```tsx
    // Before
    <Image src="/logo.svg" alt="Logo" width={100} height={20} priority />

    // After
    <img src="/logo.svg" alt="Logo" width={100} height={20} />
    ```

## 1.0.1

### Patch Changes

- ### Issues Resolved:
  1. **Backup Directory Location Issue** ✅
     - **Problem:** Backup was trying to copy the project into a subdirectory of itself (`.hopr-backup` inside the project)
     - **Error:** `Cannot copy to a subdirectory of itself`
     - **Solution:** Changed backup location to be a sibling directory of the project with timestamp:
       - Before: `project/.hopr-backup`
       - After: `parent/project-backup-1699411200000`
  2. **Unnecessary Files in Backup** ✅
     - **Problem:** Large directories like node_modules and `.next` were being copied
     - **Solution:** Enhanced exclusion list to skip:
       - node_modules
       - `.next`
       - `dist`
       - `build`
       - .turbo
       - .git
       - `coverage`
       - `.cache`
       - Lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lockb`)

## 1.0.0

### Major Changes

- 0959cda: **BREAKING CHANGE**: Fixed critical directory migration bug in normalizeToSrcStructure. Previous versions (0.1.0 - 0.2.4) had a bug where folders were created in src/ but files were not properly migrated, leaving them in the root directory.

  **All users should upgrade to this version immediately.** Previous versions (0.1.0 - 0.2.4) are deprecated due to this critical bug.

  Changes include:
  - Switched from fs.move() to copy + remove approach for better cross-platform support, especially on Windows
  - Added verification step to ensure copy completed before removing source
  - Enhanced error handling and logging for better debugging
  - Updated FileSystem.copy() to ensure parent directories exist and use overwrite option

  This ensures all project folders (app, components, lib, etc.) and their files are successfully moved to the src/ directory during migration.

## 0.2.4

### Patch Changes

- Fix directory migration in normalizeToSrcStructure to properly move all folders (and their contents) except public to src/. Changes include:
  - Switched from fs.move() to copy + remove approach for better cross-platform support, especially on Windows
  - Added verification step to ensure copy completed before removing source
  - Enhanced error handling and logging for better debugging
  - Updated FileSystem.copy() to ensure parent directories exist and use overwrite option

  This ensures all project folders (app, components, lib, etc.) and their files are successfully moved to the src/ directory during migration.

## 0.2.3

### Patch Changes

- Fix directory migration in normalizeToSrcStructure to properly move all folders except public to src/. Changed from using fs.move() to a more reliable copy + remove approach for better cross-platform support, especially on Windows. This ensures all project folders (app, components, lib, etc.) are successfully moved to the src/ directory during migration.

## 0.2.2

### Patch Changes

- ## Fix: Proper src/ Structure Normalization

  ### Critical Fix
  - **Structure normalization order**: Now correctly moves `app/` to `src/app/` FIRST before moving other folders
  - This ensures the migration guide's expected structure is achieved: `src/app/` directory

  ### Before This Fix

  ```
  app/ → src/components/ (wrong! moved everything at once)
  components/ → src/app/
  ```

  ### After This Fix

  ```
  app/ → src/app/ (correct! app moved first)
  components/ → src/components/
  ```

  This matches the official TanStack Start migration guide structure requirements.

## 0.2.1

### Patch Changes

- ## Critical Migration Guide Compliance Fixes

  ### Bug Fixes
  - **Routes directory**: Fixed routes incorrectly moving to `src/routes/` instead of staying in `src/app/`
  - **Vite config**: Updated to use `routesDirectory: "app"` matching TanStack Start guide
  - **Link transformation**: Fixed href→to only applying to `<Link>` components, not `<a>` tags
  - **Route structure**: Dynamic routes now correctly transform to flat structure (`$slug.tsx` not `$slug/index.tsx`)

  ### Migration Now Follows Official Guide

  Per the [TanStack Start migration guide](https://tanstack.com/router/latest/docs/framework/react/start/migrate-from-next-js):
  - Routes stay in `src/app/` directory
  - `layout.tsx` → `__root.tsx` (in same directory)
  - `page.tsx` → `index.tsx` (in same directory)
  - `[slug]/page.tsx` → `$slug.tsx` (flat structure)
  - Only `<Link href>` transforms to `<Link to>`, `<a href>` preserved

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
