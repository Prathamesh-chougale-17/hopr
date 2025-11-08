# hopr CLI - Development Plan

## Project Overview
Build a cross-platform CLI tool that migrates fullstack web projects between frameworks (starting with Next.js → TanStack Start).

## Architecture

### Core Structure
```
packages/
  └── hopr/                   # Main CLI package (published to npm)
      ├── src/
      │   ├── cli.ts         # Entry point with command registration
      │   ├── commands/      # CLI commands (migrate, detect, plugin)
      │   ├── core/          # Core migration engine
      │   ├── plugins/       # Framework-specific adapters
      │   ├── utils/         # Shared utilities
      │   └── types/         # TypeScript type definitions
      ├── templates/         # Code generation templates
      └── package.json       # CLI package manifest
```

### Technology Stack
- **Language**: TypeScript (ES modules)
- **CLI Framework**: commander.js (simple, popular)
- **AST Parsing**: @babel/parser, @babel/traverse, recast
- **File Operations**: fs-extra
- **Progress UI**: ora, picocolors
- **Prompts**: prompts
- **Package Manager Detection**: which-pm

## Implementation Phases

### Phase 1: Project Setup ✓
- [x] Create packages/hopr directory structure
- [x] Initialize package.json with proper metadata
- [x] Configure TypeScript with ES modules
- [x] Set up build configuration
- [x] Add to workspace

### Phase 2: Core Framework
- [ ] Create type definitions for framework adapters
- [ ] Implement project detection utilities
- [ ] Build configuration loader (hopr.config.json)
- [ ] Create backup/restore functionality
- [ ] Implement dry-run mode
- [ ] Build diff viewer

### Phase 3: Next.js Plugin
- [ ] Framework detection (next.config.*, package.json)
- [ ] Project structure analyzer:
  - Detect app/src structure
  - Map routes (app/page.tsx, app/[slug]/page.tsx)
  - Find API routes
  - Identify layouts and error boundaries
- [ ] AST-based code transformers:
  - Convert async Server Components → route loaders
  - Transform params/searchParams
  - Convert metadata → head() function
  - Transform 'use server' → createServerFn()
- [ ] File structure mapping

### Phase 4: TanStack Start Plugin
- [ ] Code generation for:
  - __root.tsx from layout.tsx
  - index.tsx from page.tsx
  - Dynamic routes ($param.tsx)
  - Catch-all routes ($.tsx)
  - API routes
- [ ] Generate vite.config.ts
- [ ] Generate router.tsx
- [ ] Update package.json dependencies
- [ ] Configure Tailwind CSS v4

### Phase 5: CLI Commands
- [ ] `hopr detect` - Detect current framework
- [ ] `hopr migrate --to <framework>` - Run migration
- [ ] `hopr migrate --dry` - Preview changes
- [ ] `hopr plugin add <name>` - Add framework plugin
- [ ] Progress logging and user confirmations

### Phase 6: Testing & Polish
- [ ] Add unit tests for transformers
- [ ] Integration tests with sample projects
- [ ] Error handling and validation
- [ ] CLI help documentation
- [ ] Migration report generation

### Phase 7: Publishing
- [ ] Configure npm publish settings
- [ ] Add bin entry to package.json
- [ ] Create README with examples
- [ ] Set version to 1.0.0
- [ ] Test with npx hopr@latest

## Key Features

### Must-Have (v1.0.0)
- [x] Automatic framework detection
- [ ] Next.js → TanStack Start migration
- [ ] Dry-run mode
- [ ] Backup creation
- [ ] Progress indicators
- [ ] File diff preview
- [ ] User confirmations

### Nice-to-Have (Future)
- [ ] Remix plugin
- [ ] SvelteKit plugin
- [ ] Incremental migration
- [ ] Custom transformation rules
- [ ] Migration rollback
- [ ] Migration templates

## Migration Mapping (Next.js → TanStack Start)

| Next.js | TanStack Start |
|---------|---------------|
| `app/layout.tsx` | `app/__root.tsx` |
| `app/page.tsx` | `app/index.tsx` |
| `app/about/page.tsx` | `app/about.tsx` |
| `app/posts/[slug]/page.tsx` | `app/posts/$slug.tsx` |
| `app/posts/[...slug]/page.tsx` | `app/posts/$.tsx` |
| `app/api/hello/route.ts` | `app/api/hello.ts` |
| `export const metadata` | `Route.head()` |
| `async function Page()` | `Route.loader` + `Route.useLoaderData()` |
| `params.slug` | `Route.useParams().slug` |
| `searchParams.page` | `Route.useSearch().page` |
| `'use server'` | `createServerFn()` |
| `next/link` | `@tanstack/react-router` |
| `next/image` | `@unpic/react` |

## Dependencies to Install

### Core
- commander
- picocolors
- ora
- prompts
- fs-extra
- which-pm

### AST/Parsing
- @babel/parser
- @babel/traverse
- @babel/types
- @babel/generator
- recast

### Dev
- @types/node
- @types/babel__traverse
- @types/fs-extra
- tsup (for building)

## Success Criteria
1. Successfully migrate a Next.js app to TanStack Start
2. Handle both `app/` and `src/app/` structures
3. Generate working code with proper routing
4. Update dependencies correctly
5. CLI is installable via npm/npx
