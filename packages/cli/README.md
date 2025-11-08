# hopr

A powerful CLI tool for migrating fullstack web projects between frameworks.

## Features

- 🔍 Automatic framework detection
- 🚀 Next.js → TanStack Start migration
- 🛡️ Safe by default with automatic backups
- 🎯 AST-based code transformations
- 📊 Detailed migration reports
- 🔄 Dry-run mode to preview changes
- 🎨 Cross-platform support

## Installation

```bash
# Global installation
npm install -g hopr

# Or use with npx
npx hopr@latest migrate ./my-project
```

## Usage

### Detect Framework

```bash
# Detect framework in current directory
hopr detect

# Detect framework in specific directory
hopr detect ./my-project
```

### Migrate Project

```bash
# Migrate to TanStack Start (with confirmation)
hopr migrate --to tanstack-start

# Dry run (preview changes without modifying files)
hopr migrate --to tanstack-start --dry

# Skip backup creation
hopr migrate --to tanstack-start --no-backup

# Skip confirmation prompts
hopr migrate --to tanstack-start --skip-confirm

# Custom backup directory
hopr migrate --to tanstack-start --backup-dir ./my-backup
```

## Supported Migrations

| Source | Target | Status |
|--------|--------|--------|
| Next.js (App Router) | TanStack Start | ✅ Supported |

## Migration Features

### Next.js → TanStack Start

- ✅ Converts `layout.tsx` → `__root.tsx`
- ✅ Converts `page.tsx` → route files (`index.tsx`, etc.)
- ✅ Handles dynamic routes (`[slug]` → `$slug`)
- ✅ Handles catch-all routes (`[...slug]` → `$.tsx`)
- ✅ Transforms metadata exports → `head()` function
- ✅ Converts async Server Components → `loader` functions
- ✅ Updates dependencies automatically
- ✅ Generates Vite configuration
- ✅ Handles both `app/` and `src/app/` structures
- ✅ Preserves Tailwind CSS configuration

## Example

```bash
# Before migration (Next.js)
my-app/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── posts/
│       └── [slug]/
│           └── page.tsx
├── next.config.ts
└── package.json

# Run migration
hopr migrate --to tanstack-start

# After migration (TanStack Start)
my-app/
├── src/
│   ├── app/
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   └── posts/
│   │       └── $slug.tsx
│   └── router.tsx
├── vite.config.ts
└── package.json
```

## Configuration

Create a `hopr.config.json` file in your project root for custom configuration:

```json
{
  "sourceFramework": "nextjs",
  "targetFramework": "tanstack-start",
  "ignore": ["**/test/**", "**/*.spec.ts"],
  "transformRules": {}
}
```

## Safety

- **Automatic Backups**: Creates `.hopr-backup/` directory before migration
- **Dry Run Mode**: Preview all changes before applying them
- **Confirmation Prompts**: Asks for confirmation before making changes
- **Detailed Reports**: Shows exactly what was transformed

## Limitations

Current limitations for Next.js → TanStack Start migration:

- API routes require manual review
- Middleware not yet supported
- Image optimization requires `@unpic/react`
- Server Actions need conversion to `createServerFn()`

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Development mode
bun run dev

# Type checking
bun run check-types
```

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.
