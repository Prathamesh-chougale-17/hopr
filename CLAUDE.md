# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Turborepo monorepo containing template applications demonstrating Next.js and TanStack Start. The repository uses Bun as the package manager and Turbo for build orchestration. The main product, `hopr`, is a CLI tool published to npm that migrates projects between frameworks.

## Package Manager

**Important:** This project uses **Bun** (v1.2.22) as its package manager, not npm, yarn, or pnpm.

- Install dependencies: `bun install`
- Run scripts: `bun run <script>`

## Common Commands

### Development

```bash
# Run all apps in development mode
bun run dev

# Run specific app with Turbo filter
turbo dev --filter=next-template      # Next.js app on port 3000
turbo dev --filter=tanstack-template  # TanStack Start app on port 3000
```

### Building

```bash
# Build all apps
bun run build

# Build specific app
turbo build --filter=next-template
turbo build --filter=tanstack-template
```

### Linting and Type Checking

```bash
# Lint all packages
bun run lint

# Type check all packages
bun run check-types

# Format code with Prettier
bun run format
```

### Testing

```bash
# Run all tests
bun run test

# Run tests in tanstack-template app
cd apps/tanstack-template
bun run test
```

### Version Management (Changesets)

```bash
# Create a changeset (when making changes that should be released)
bun changeset

# Bump versions based on changesets
bun changeset version

# Publish packages to npm (after building)
bun run release
```

## Repository Structure

### Applications (`apps/`)

1. **next-template** - Next.js template application
   - Uses Next.js 16 with App Router
   - React 19.2.0
   - Tailwind CSS v4
   - Runs on port 3000

2. **tanstack-template** - TanStack Start template application
   - Uses Vite, TanStack Router, and TanStack Start
   - File-based routing in `src/routes/`
   - Uses Nitro v2 for server functionality
   - Testing setup with Vitest
   - shadcn/ui components (install with `bunx shadcn@latest add <component>`)
   - Runs on port 3000

### Packages (`packages/`)

1. **@repo/eslint-config** - Shared ESLint configurations
   - Exports: `./base`, `./next-js`, `./react-internal`

## Architecture Notes

### Turborepo Configuration

- Located in `turbo.json`
- Tasks: `build`, `lint`, `check-types`, `test`, `dev`
- Build task caches `.next/**` and `dist/**` outputs
- Test task depends on build and caches `coverage/**`
- Dev task runs in persistent mode with no caching

### hopr CLI Tool (Published to npm)

The `hopr` CLI is a **published npm package** (not a workspace package). It's the main product of this repository and automates framework migrations.

**Installation:**
```bash
npm install -g hopr
# or run without installing
npx hopr@latest migrate ./my-project
```

**Key Features:**
- Auto-detects frameworks (Next.js, TanStack Start) and package managers
- Safe by default: Creates backups in `.hopr-backup/`
- AST-based code transformations using Babel
- Intelligent file structure reorganization
- Currently supports: Next.js → TanStack Start

**Testing hopr locally:**
The CLI package has been removed from the workspace. To test local changes to the CLI:
1. Clone the hopr CLI repository separately
2. Build and publish to npm (or use `npm link`)
3. Install globally or use `npx` to test

**Version Management:**
- Uses Changesets for version management
- See [RELEASE_GUIDE.md](RELEASE_GUIDE.md) for publishing workflow
- See [DEPRECATION.md](DEPRECATION.md) for information about deprecated versions

### Migration Guide

The repository contains a migration guide in [docs/nextjs-to-tanstack-start.md](docs/nextjs-to-tanstack-start.md) showing how to convert Next.js apps to TanStack Start. Key differences:

- **Routing:** TanStack uses `__root.tsx`, `index.tsx`, and `$param.tsx` patterns vs Next.js App Router conventions
- **Data Loading:** Uses route `loader` functions with `Route.useLoaderData()` instead of async components
- **Server Functions:** Uses `createServerFn()` instead of `'use server'` directive
- **Build Tool:** Uses Vite instead of Next.js webpack-based build

### Adding shadcn Components (tanstack-template only)

```bash
cd apps/tanstack-template
bunx shadcn@latest add <component-name>
```

## Release Workflow

This project uses Changesets for version management and releases:

1. **Make changes** - Develop features/fixes in the templates
2. **Create changeset** - Run `bun changeset` and document changes
3. **Version packages** - Run `bun changeset version` to bump versions
4. **Publish** - Run `bun run release` to build and publish to npm

See [RELEASE_GUIDE.md](RELEASE_GUIDE.md) for detailed release instructions, especially for major version releases.

**Note:** The `hopr` CLI tool is maintained separately and is not part of this workspace's release process.

## Important Notes

- Node.js version requirement: >=18
- TypeScript 5.9.2+ is used across the repository
- All packages use ES modules (`"type": "module"`)
- Both templates use React 19.2.0
- TanStack template uses file-based routing with auto-generated route tree
- The repository's primary purpose is to provide template applications showcasing the migration target (TanStack Start) and source (Next.js) for the `hopr` CLI tool