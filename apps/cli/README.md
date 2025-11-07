# @hopr/cli

A powerful CLI tool for migrating fullstack web projects between frameworks.

## Features

- 🔍 **Auto-detection**: Automatically detects the source framework
- 🔄 **Smart Migration**: Intelligent code transformations and file restructuring
- 📦 **Package Manager Agnostic**: Works with npm, yarn, pnpm, and bun
- 💾 **Safe by Default**: Creates backups before making changes
- 🎯 **Framework Support**: Currently supports Next.js → TanStack Start

## Installation

```bash
bun install
```

## Usage

```bash
# Migrate a project
hopr migrate ./path/to/project

# Migrate current directory
hopr migrate .

# Dry run (preview changes without applying)
hopr migrate ./path/to/project --dry-run

# Detect framework only
hopr detect ./path/to/project

# Show version
hopr --version

# Show help
hopr --help
```

## Supported Migrations

### Next.js → TanStack Start

Migrates a Next.js App Router application to TanStack Start, including:

- ✅ Dependency updates
- ✅ File structure transformation
- ✅ Route file migrations
- ✅ Component code transformations
- ✅ Configuration file generation
- ✅ Import statement updates

## Development

```bash
# Run in development mode
bun run dev

# Build for production
bun run build

# Run built CLI
bun run start

# Type check
bun run check-types

# Lint
bun run lint
```

## Architecture

- `src/index.ts` - CLI entry point
- `src/commands/` - Command implementations
- `src/detectors/` - Framework detection logic
- `src/migrators/` - Migration implementations
- `src/transformers/` - File and code transformers
- `src/utils/` - Utility functions

## License

MIT
