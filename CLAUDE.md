# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Turborepo monorepo containing multiple applications and shared packages. The repository uses Bun as the package manager and Turbo for build orchestration.

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
turbo dev --filter=web          # Next.js web app on port 3000
turbo dev --filter=docs         # Next.js docs app on port 3001
turbo dev --filter=tanstack-template  # TanStack Start app on port 3000
```

### Building

```bash
# Build all apps and packages
bun run build

# Build specific app
turbo build --filter=web
turbo build --filter=docs
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
# Run tests in tanstack-template app
cd apps/tanstack-template
bun run test
```

## Repository Structure

### Applications (`apps/`)

1. **web** - Next.js application (port 3000)
   - Uses Next.js 16 with App Router
   - Depends on `@repo/ui` shared component library

2. **docs** - Next.js documentation app (port 3001)
   - Uses Next.js 16 with App Router
   - Depends on `@repo/ui` shared component library

3. **tanstack-template** - TanStack Start application (port 3000)
   - Uses Vite, TanStack Router, and TanStack Start
   - File-based routing in `src/routes/`
   - Uses Nitro v2 for server functionality
   - Has its own testing setup with Vitest
   - Uses shadcn/ui components (install with `pnpx shadcn@latest add <component>`)

### Packages (`packages/`)

1. **cli** - Framework migration CLI tool (`hopr`)
   - Migrates projects between frameworks (Next.js → TanStack Start)
   - Auto-detects frameworks and package managers
   - Built with Commander, Babel, and Prettier
   - Run with: `cd packages/cli && bun run src/index.ts [command]`
   - See [packages/cli/USAGE.md](packages/cli/USAGE.md) for detailed usage

2. **@repo/ui** - Shared React component library
   - Components: button, card, code
   - Exports components from `src/*.tsx`
   - Generate new components: `turbo gen react-component`

3. **@repo/eslint-config** - Shared ESLint configurations
   - Exports: `./base`, `./next-js`, `./react-internal`

4. **@repo/typescript-config** - Shared TypeScript configurations
   - Base, Next.js, and React library configs

## Architecture Notes

### Turborepo Configuration

- Located in `turbo.json`
- Tasks: `build`, `lint`, `check-types`, `dev`
- Build task caches `.next/**` output (excludes cache)
- Dev task runs in persistent mode with no caching

### Workspace Dependencies

- Next.js apps (`web`, `docs`) share the `@repo/ui` component library
- All apps use shared ESLint and TypeScript configs from packages
- Workspace dependencies are declared with `"*"` version specifier

### TanStack Start vs Next.js

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

## Development Workflow

1. **Adding new apps:** Create in `apps/` directory and add to workspace config
2. **Shared code:** Add to `packages/` for use across multiple apps
3. **Type checking:** Run before committing to catch TypeScript errors
4. **Turbo filters:** Use `--filter=<app-name>` to run commands for specific apps

## hopr CLI Tool

The `hopr` CLI tool automates framework migrations:

### Quick Start

```bash
cd packages/cli
bun install
bun run src/index.ts detect ../../apps/web     # Detect framework
bun run src/index.ts migrate ../../apps/web    # Migrate project
```

### Commands

- `hopr detect [path]` - Detect framework and structure
- `hopr migrate <path> [options]` - Migrate between frameworks
  - `--dry-run` - Preview changes without applying
  - `--from <framework>` - Source framework (auto-detected)
  - `--to <framework>` - Target framework (default: tanstack-start)
  - `-y, --yes` - Skip confirmation

### Migration Features

- **Auto-detection:** Identifies framework and package manager
- **Safe by default:** Creates backups in `.hopr-backup/`
- **Smart transformations:** AST-based code modifications
- **File structure:** Renames and reorganizes routes automatically
- **Configuration:** Generates Vite config, router setup, etc.

See [packages/cli/USAGE.md](packages/cli/USAGE.md) for complete documentation.

## Important Notes

- Node.js version requirement: >=18
- The repository uses TypeScript 5.9.2 across all packages (CLI uses 5.9.2)
- All packages use ES modules (`"type": "module"`)
- Next.js apps use React 19.2.0
- TanStack template uses file-based routing with auto-generated route tree
- CLI tool uses Babel for AST transformations and Prettier for code formatting
