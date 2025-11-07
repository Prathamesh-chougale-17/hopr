# hopr CLI - Quick Reference

## Installation

```bash
cd apps/cli
bun install
```

## Commands

### Detect Framework

```bash
# Current directory
hopr detect .

# Specific path
hopr detect ../web
hopr detect /path/to/project
```

### Migrate Project

```bash
# Basic migration
hopr migrate ./apps/web

# Dry run (preview only)
hopr migrate ./apps/web --dry-run

# Skip confirmation
hopr migrate ./apps/web -y

# Custom frameworks
hopr migrate ./apps/web --from nextjs --to tanstack-start

# Skip backup (not recommended)
hopr migrate ./apps/web --no-backup
```

## Development

```bash
# Run CLI directly
cd apps/cli
bun run src/index.ts [command]

# Build
bun run build

# Run built version
node dist/index.js [command]

# Type check
bun run check-types

# Lint
bun run lint
```

## Common Workflows

### Test Detection

```bash
cd apps/cli
bun run src/index.ts detect ../web
bun run src/index.ts detect ../docs
bun run src/index.ts detect ../tanstack-template
```

### Preview Migration

```bash
cd apps/cli
bun run src/index.ts migrate ../web --dry-run
```

### Run Migration

```bash
cd apps/cli
bun run src/index.ts migrate ../web

# Then in the migrated project
cd ../web
bun install
bun run dev
```

## File Transformations

| Next.js | TanStack Start |
|---------|----------------|
| `app/layout.tsx` | `routes/__root.tsx` |
| `app/page.tsx` | `routes/index.tsx` |
| `app/about/page.tsx` | `routes/about.tsx` |
| `app/posts/[id]/page.tsx` | `routes/posts/$id.tsx` |
| `app/[...slug]/page.tsx` | `routes/$.tsx` |
| `next.config.js` | `vite.config.ts` |

## Code Changes

```tsx
// Before (Next.js)
import Link from "next/link"
import Image from "next/image"
export default function Page() { ... }

// After (TanStack)
import { Link } from "@tanstack/react-router"
import { createFileRoute } from "@tanstack/react-router"
export const Route = createFileRoute("/")({ component: Page })
function Page() { ... }
```

## Package Changes

### Removed
- `next`
- `@tailwindcss/postcss`

### Added
- `@tanstack/react-start`
- `@tanstack/react-router`
- `vite`
- `@vitejs/plugin-react`
- `@tailwindcss/vite`

## Rollback

If migration fails:

```bash
# Files are backed up in .hopr-backup/
# Restore manually or use git:
git checkout .
git clean -fd
```

## Troubleshooting

### CLI not found
```bash
# Make sure you're in the right directory
cd apps/cli
```

### Permission errors
```bash
# On Unix systems
chmod +x dist/index.js
```

### TypeScript errors after migration
```bash
cd <migrated-project>
bun install  # Install new dependencies
```

### Dev server won't start
```bash
# Delete node_modules and reinstall
rm -rf node_modules
bun install
```

## Help

```bash
hopr --help                 # General help
hopr migrate --help         # Migration help
hopr detect --help          # Detection help
hopr --version              # Show version
```

## Documentation

- [README.md](./README.md) - Overview
- [USAGE.md](./USAGE.md) - Detailed usage
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Architecture
- [Migration Guide](../../docs/nextjs-to-tanstack-start.md) - Manual migration steps

## Support

- Check logs for error messages
- Review backup files in `.hopr-backup/`
- Read the migration guide
- Check GitHub issues
