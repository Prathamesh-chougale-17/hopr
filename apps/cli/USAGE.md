# hopr CLI - Usage Guide

## Quick Start

### Installation (Development)

```bash
cd apps/cli
bun install
```

### Running the CLI

```bash
# Run directly with bun
cd apps/cli
bun run src/index.ts [command]

# Or build and run
bun run build
node dist/index.js [command]
```

## Commands

### 1. Detect Framework

Detect which framework is used in a project:

```bash
hopr detect [path]
```

**Examples:**

```bash
# Detect current directory
hopr detect .

# Detect specific directory
hopr detect ./apps/web

# Detect relative path
hopr detect ../../my-project
```

**Output:**
- Framework type (nextjs, tanstack-start, remix, etc.)
- Package manager (bun, npm, pnpm, yarn)
- Project structure details
- Migration suggestions

### 2. Migrate Project

Migrate a project from one framework to another:

```bash
hopr migrate <path> [options]
```

**Options:**

- `--from <framework>` - Source framework (auto-detected if not specified)
- `--to <framework>` - Target framework (default: tanstack-start)
- `--dry-run` - Preview changes without applying them
- `--no-backup` - Skip creating a backup before migration
- `--skip-install` - Skip running package installation
- `-y, --yes` - Skip confirmation prompts

**Examples:**

```bash
# Migrate with auto-detection and confirmation
hopr migrate ./apps/web

# Migrate current directory
hopr migrate .

# Dry run to preview changes
hopr migrate ./apps/web --dry-run

# Skip confirmation prompt
hopr migrate ./apps/web -y

# Skip backup creation (not recommended)
hopr migrate ./apps/web --no-backup

# Skip package installation
hopr migrate ./apps/web --skip-install
```

## Migration Process

When you run `hopr migrate`, the following steps are performed:

### 1. Project Detection
- Detects the framework (Next.js, etc.)
- Identifies package manager (bun, npm, pnpm, yarn)
- Analyzes project structure

### 2. Validation
- Checks if migration is supported
- Validates project structure
- Ensures App Router is being used (for Next.js)

### 3. Backup Creation
- Creates `.hopr-backup/` directory
- Copies all source files for rollback

### 4. Structure Normalization
- Moves `app/` to `src/app/` if needed
- Ensures consistent directory structure

### 5. Package.json Updates
- Removes Next.js dependencies
- Adds TanStack Start and Vite dependencies
- Updates scripts for Vite

### 6. File Structure Transformation
- `app/layout.tsx` → `routes/__root.tsx`
- `app/page.tsx` → `routes/index.tsx`
- `[slug]/page.tsx` → `$slug/index.tsx`
- `[...slug]/page.tsx` → `$.tsx`
- Moves CSS files to appropriate locations

### 7. Code Transformation
- Updates imports (Next.js → TanStack)
- Transforms components to use TanStack Router
- Converts `Link` components (href → to)
- Updates Image components
- Transforms server components to loaders

### 8. Configuration Files
- Creates `vite.config.ts`
- Creates `src/router.tsx`
- Creates/updates `tailwind.config.ts`
- Updates `tsconfig.json`
- Updates `.gitignore`

### 9. Cleanup
- Removes `next.config.*`
- Removes `next-env.d.ts`
- Removes `postcss.config.*`
- Removes `.next/` directory

### 10. Installation Instructions
- Displays next steps
- Shows installation command
- Provides dev server command

## Next.js to TanStack Start Migration

### What Gets Migrated

✅ **File Structure**
- App Router structure → TanStack Start routes
- Dynamic routes → Dollar sign routes ($slug)
- Catch-all routes → Dollar sign routes ($)

✅ **Dependencies**
- Removes: `next`, `@tailwindcss/postcss`
- Adds: `@tanstack/react-start`, `vite`, and related packages

✅ **Code Transformations**
- Root layout with metadata → createRootRoute
- Page components → createFileRoute
- Link components (href → to)
- Import statements

✅ **Configuration**
- Creates Vite configuration
- Creates router configuration
- Updates TypeScript config
- Updates package.json scripts

### Manual Steps Required

After migration, you may need to:

1. **Review CSS Modules**: Convert CSS modules to Tailwind utilities if needed
2. **Update Image Components**: Replace `next/image` with `<img>` or `@unpic/react`
3. **Font Loading**: Convert `next/font` to Fontsource packages
4. **Server Functions**: Convert `'use server'` to `createServerFn()`
5. **API Routes**: Update to TanStack Start server routes
6. **Metadata**: Convert to head() function in routes

### Rollback

If something goes wrong:

1. Your original files are in `.hopr-backup/[timestamp]/`
2. Delete the current files
3. Restore from backup
4. Run `bun install` (or your package manager)

Or use git if you have uncommitted changes:

```bash
git checkout .
git clean -fd
```

## Examples

### Migrate Next.js App to TanStack Start

```bash
# Preview the migration
cd apps/cli
bun run src/index.ts migrate ../web --dry-run

# Run the actual migration
bun run src/index.ts migrate ../web

# Follow the instructions
cd ../web
bun install
bun run dev
```

### Detect Multiple Projects

```bash
# Check all apps
hopr detect apps/web
hopr detect apps/docs
hopr detect apps/tanstack-template
```

## Troubleshooting

### Common Issues

**1. "Could not detect framework"**
- Make sure you're in the correct directory
- Check that `package.json` exists
- Specify framework with `--from nextjs`

**2. "Project does not use App Router"**
- Only Next.js App Router is supported
- Pages Router migration coming soon

**3. "Migration validation failed"**
- Check the error messages
- Ensure your project structure matches requirements

**4. TypeScript errors after migration**
- Run `bun install` to get new dependencies
- Check `tsconfig.json` is correctly updated
- May need to add `/// <reference types="vite/client" />`

**5. Dev server won't start**
- Delete `node_modules` and reinstall
- Check `vite.config.ts` is created correctly
- Ensure `src/router.tsx` exists

## Development

### Project Structure

```
apps/cli/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── commands/             # Commands (migrate, detect)
│   │   ├── migrate.ts
│   │   └── detect.ts
│   ├── detectors/            # Framework detection
│   │   ├── index.ts
│   │   ├── nextjs.ts
│   │   └── types.ts
│   ├── migrators/            # Migration logic
│   │   ├── base.ts
│   │   └── nextjs-to-tanstack.ts
│   ├── transformers/         # File & code transformers
│   │   ├── file-transformer.ts
│   │   ├── code-transformer.ts
│   │   ├── package-transformer.ts
│   │   └── config-transformer.ts
│   └── utils/                # Utility functions
│       ├── logger.ts
│       ├── file-system.ts
│       └── backup.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Adding New Migrations

To add support for new framework migrations:

1. Create a new detector in `src/detectors/`
2. Create a new migrator in `src/migrators/`
3. Implement the `BaseMigrator` interface
4. Add to the migration command logic

### Testing

```bash
# Test detection
bun run src/index.ts detect ../web

# Test dry run
bun run src/index.ts migrate ../web --dry-run

# Test actual migration (on a copy!)
cp -r ../web ../web-test
bun run src/index.ts migrate ../web-test -y
```

## Support

- For issues, check the [GitHub repository](https://github.com/yourusername/hopr)
- Read the [migration guide](../../docs/nextjs-to-tanstack-start.md)
- Review the [README](./README.md)
