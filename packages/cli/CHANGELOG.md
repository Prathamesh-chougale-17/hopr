# hopr

## 1.0.6

### Patch Changes

- **Fixed Route Export Syntax**
  - **Corrected**: Now generates `export const Route = createFileRoute("/")({ component: Home })`
  - **Previous Issue**: Was generating `createFileRoute("/", { component: Home })` (incorrect syntax)
  - **Impact**: Routes now use the correct TanStack Router v1.132.0 API syntax with double function call

  **Fixed Tailwind v4 Detection**
  - **New Detection Method**: Checks for `tailwindcss` in package.json dependencies/devDependencies
  - **Reason**: Tailwind v4 no longer requires tailwind.config.ts/js configuration files
  - **Previous Method**: Was checking for existence of tailwind.config.ts/js files
  - **Impact**: CLI now properly detects Tailwind CSS v4 installations and includes Tailwind plugin in vite.config.ts

## 1.0.5

### Patch Changes

- **Fixed Route Export Syntax** ✅
  - **Corrected Page Routes**: Now generates `export const Route = createFileRoute("/")({ component: Home })` (correct syntax)
  - **Previous Issue**: Was generating `createFileRoute("/", { component: Home })` (incorrect)
  - Matches TanStack Router v1.132.0 API exactly

- **Fixed Tailwind v4 Detection** ✅
  - **New Detection Method**: Checks for `tailwindcss` in package.json dependencies/devDependencies
  - **Reason**: Tailwind v4 no longer requires tailwind.config.ts/js files
  - **Impact**: Properly detects Tailwind CSS v4 installations

- **Updated Root Route Pattern to Match TanStack Template**

  The root route transformer has been completely rewritten to match the exact pattern from tanstack-template:
  - **shellComponent Pattern**: Uses `shellComponent: RootDocument` instead of direct component
  - **RootDocument Function**: Accepts `{ children }` parameter and wraps with devtools
  - **Devtools Integration**:
    - Automatically includes `@tanstack/react-router-devtools`
    - Automatically includes `@tanstack/react-devtools`
    - Configured with bottom-right position and router panel plugin
  - **Children Wrapping**: Properly preserves existing layout structure while wrapping children
  - **Route Export Pattern**:

    ```tsx
    export const Route = createRootRoute({
      head: () => ({ meta: [...], links: [...] }),
      shellComponent: RootDocument
    })

    function RootDocument({ children }: { children: React.ReactNode }) {
      return (
        <html>
          <head><HeadContent /></head>
          <body>
            {children}
            <TanStackDevtools config={{...}} plugins={[...]} />
            <Scripts />
          </body>
        </html>
      )
    }
    ```

  - **Page Routes**: Continue using simple pattern `export const Route = createFileRoute("/")({ component: Home })`

  **Vite Config Updates**
  - Tailwind plugin now correctly placed before nitroV2Plugin
  - Added explicit srcDirectory and routesDirectory with comments
  - Matches tanstack-template vite.config.ts exactly

## 1.0.4

### Patch Changes

- **Updated Root Route Pattern to Match TanStack Template** ✅
  - **\_\_root.tsx**: Now uses `shellComponent` pattern with `RootDocument` function that accepts children
  - **Devtools Integration**: Automatically adds TanStack Router devtools panel and React devtools
  - **Children Wrapping**: Properly wraps children with devtools and Scripts components
  - **Route Export Pattern**:
    ```tsx
    export const Route = createRootRoute({
      head: () => ({ meta: [...], links: [...] }),
      shellComponent: RootDocument
    })
    ```
  - **Page Export Pattern**: `export const Route = createFileRoute("/")({ component: Home })`

- **Updated Configuration to Match TanStack Template**

  All generated configurations now reference the working `tanstack-template` for consistency:
  - **vite.config.ts**:
    - Uses `@tanstack/react-start/plugin/vite` (instead of `@tanstack/start/plugin/vite`)
    - Includes `nitroV2Plugin()` for Nitro v2 support
    - Uses `viteTsConfigPaths` with proper projects configuration
    - Removed hardcoded `srcDirectory` and `routesDirectory` (uses TanStack defaults)
  - **tsconfig.json**:
    - Updated `include` to `["**/*.ts", "**/*.tsx"]`
    - Added `types: ["vite/client"]`
    - Added `verbatimModuleSyntax: false`
    - Added `noUncheckedSideEffectImports: true`
    - Added path aliases: `"@/*": ["./src/*"]`
  - **Dependencies**: Updated to latest TanStack packages
    - `@tanstack/nitro-v2-vite-plugin: ^1.132.31`
    - `@tanstack/react-router-ssr-query: ^1.131.7`
    - `@tanstack/react-devtools: ^0.7.0`
    - All TanStack packages updated to `^1.132.0`
    - React updated to `^19.2.0`
    - Vite updated to `^7.1.7`
  - **Package Scripts**:
    - `dev: "vite dev --port 3000"`
    - `build: "vite build"`
    - `serve: "vite preview"` (replaced `start`)

  **Removed Backup Functionality**
  - Disabled automatic backup creation during migration
  - Users should use git or their own backup solution before running migrations
  - No backup folders will be created in the parent directory

  **Next.js Image Component Transformation**
  - Added AST transformer to convert Next.js `<Image>` components to standard HTML `<img>` tags
  - Automatically removes Next.js-specific props (`priority`, `fill`, `quality`, `placeholder`, `blurDataURL`, `loading`)
  - Preserves standard HTML attributes (`src`, `alt`, `width`, `height`, `className`)

  Example transformation:

  ```tsx
  // Before
  <Image src="/logo.svg" alt="Logo" width={100} height={20} priority />

  // After
  <img src="/logo.svg" alt="Logo" width={100} height={20} />
  ```

  **Dynamic CLI Version**
  - CLI now reads version from `package.json` dynamically
  - No need to manually update version in `cli.ts` file
  - Version stays in sync automatically

## 1.0.3

### Patch Changes

- **Updated Configuration to Match TanStack Template** ✅
  - **vite.config.ts**: Now uses `@tanstack/react-start/plugin/vite` and includes `nitroV2Plugin()`
  - **tsconfig.json**: Updated with exact configuration from tanstack-template including path aliases (`@/*`)
  - **Dependencies**: Updated to use latest TanStack packages including `@tanstack/nitro-v2-vite-plugin`, `@tanstack/react-router-ssr-query`
  - **Scripts**: Changed to match tanstack-template (`vite dev --port 3000`, `vite preview`)
  - All configurations now reference the working tanstack-template for consistency

- **Removed Backup Functionality** 🗑️
  - Disabled automatic backup creation during migration
  - Users should use git or their own backup solution before running migrations
  - No backup folders will be created in the parent directory

- **Next.js Image Component Transformation** ✅
  - Added AST transformer to convert Next.js `<Image>` components to standard HTML `<img>` tags
  - Automatically removes Next.js-specific props (`priority`, `fill`, `quality`, `placeholder`, `blurDataURL`, `loading`)
  - Preserves standard HTML attributes (`src`, `alt`, `width`, `height`, `className`)

  Example transformation:

  ```tsx
  // Before
  <Image src="/logo.svg" alt="Logo" width={100} height={20} priority />

  // After
  <img src="/logo.svg" alt="Logo" width={100} height={20} />
  ```

- **Dynamic CLI Version** ✅
  - CLI now reads version from package.json dynamically
  - No need to manually update version in cli.ts file

## 1.0.2

### Patch Changes

- **Removed Backup Functionality** 🗑️
  - **Change:** Disabled automatic backup creation during migration
  - **Reason:** Backup functionality has been removed to simplify the migration process
  - **Migration:** Users should use git or their own backup solution before running migrations
  - **Impact:** No backup folders will be created in the parent directory

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
