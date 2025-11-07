# hopr CLI - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         hopr CLI                                 │
│                    (Main Application)                            │
│                                                                   │
│  ┌────────────────────┐        ┌─────────────────────┐         │
│  │  CLI Commands      │        │  User Interface     │         │
│  │                    │        │                     │         │
│  │  • migrate         │───────▶│  • Prompts          │         │
│  │  • detect          │        │  • Progress bars    │         │
│  │                    │        │  • Colored output   │         │
│  └────────────────────┘        └─────────────────────┘         │
│           │                                                      │
│           │                                                      │
└───────────┼──────────────────────────────────────────────────────┘
            │
            │ uses
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   @hopr/cli-core                                 │
│                 (Core Functionality)                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Framework Detection                                      │  │
│  │  ┌──────────────────┐  ┌──────────────────┐            │  │
│  │  │ NextJsDetector   │  │ FrameworkDetector│            │  │
│  │  │                  │  │                  │            │  │
│  │  │ • detect()       │  │ • detect()       │            │  │
│  │  │ • analyzeStructure│ │ • detectPM()     │            │  │
│  │  └──────────────────┘  └──────────────────┘            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Utilities                                                │  │
│  │  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐ │  │
│  │  │ FileSystem   │  │ Logger        │  │ BackupMgr    │ │  │
│  │  │              │  │               │  │              │ │  │
│  │  │ • read()     │  │ • info()      │  │ • create()   │ │  │
│  │  │ • write()    │  │ • success()   │  │ • list()     │ │  │
│  │  │ • move()     │  │ • error()     │  │ • rollback() │ │  │
│  │  └──────────────┘  └───────────────┘  └──────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
            │
            │ used by
            ▼
┌─────────────────────────────────────────────────────────────────┐
│              @hopr/cli-transformers                              │
│               (Code & File Transformers)                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  File Transformers                                        │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  FileTransformer                                   │  │  │
│  │  │                                                     │  │  │
│  │  │  • transformRootLayout()                           │  │  │
│  │  │  • transformHomePage()                             │  │  │
│  │  │  • transformDynamicRoutes()                        │  │  │
│  │  │  • moveCssFiles()                                  │  │  │
│  │  │  • deleteNextJsFiles()                             │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Code Transformers (AST-based)                           │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  CodeTransformer                                   │  │  │
│  │  │                                                     │  │  │
│  │  │  • transformRootLayout()   [Babel AST]            │  │  │
│  │  │  • transformRoutePage()    [Babel AST]            │  │  │
│  │  │  • transformTsConfig()                             │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Package Transformer                                      │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  PackageTransformer                                │  │  │
│  │  │                                                     │  │  │
│  │  │  • transformForTanStackStart()                     │  │  │
│  │  │  • getInstallCommand()                             │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Config Transformers                                      │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  ConfigTransformer                                 │  │  │
│  │  │                                                     │  │  │
│  │  │  • createViteConfig()                              │  │  │
│  │  │  • createRouterConfig()                            │  │  │
│  │  │  • createTailwindConfig()                          │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
            │
            │ used by
            ▼
┌─────────────────────────────────────────────────────────────────┐
│               @hopr/cli-migrators                                │
│              (Migration Orchestration)                           │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Base Migrator (Abstract)                                │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  BaseMigrator                                      │  │  │
│  │  │                                                     │  │  │
│  │  │  • abstract migrate()                              │  │  │
│  │  │  • abstract validate()                             │  │  │
│  │  │  • abstract getSummary()                           │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js → TanStack Migrator                             │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  NextJsToTanStackMigrator                          │  │  │
│  │  │                                                     │  │  │
│  │  │  Migration Steps (10 steps):                       │  │  │
│  │  │  1. Validation                                     │  │  │
│  │  │  2. Backup Creation                                │  │  │
│  │  │  3. Structure Normalization                        │  │  │
│  │  │  4. Package.json Updates                           │  │  │
│  │  │  5. File Transformations                           │  │  │
│  │  │  6. Code Transformations                           │  │  │
│  │  │  7. TypeScript Config Updates                      │  │  │
│  │  │  8. Config File Generation                         │  │  │
│  │  │  9. Cleanup                                        │  │  │
│  │  │  10. Instructions                                  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ runs command
     │
     ▼
┌─────────────────┐
│  CLI Parser     │ (Commander.js)
│  • hopr detect  │
│  • hopr migrate │
└────┬────────────┘
     │
     ├──────────────────────────────────┐
     │                                   │
     │ detect                            │ migrate
     │                                   │
     ▼                                   ▼
┌────────────────┐              ┌─────────────────────┐
│ DetectCommand  │              │  MigrateCommand     │
└────┬───────────┘              └────┬────────────────┘
     │                               │
     │ uses                          │ uses
     │                               │
     ▼                               ▼
┌─────────────────┐              ┌──────────────────────┐
│FrameworkDetector│              │  Migrator Factory    │
│                 │              │  (creates migrator)  │
│ • detectFramework│             └──────┬───────────────┘
│ • detectPM      │                     │
│ • analyzeStructure│                   │ creates
└────┬────────────┘                     │
     │                                  ▼
     │ returns DetectionResult   ┌──────────────────────┐
     │                           │ NextJsToTanStackMigrator│
     ▼                           └──────┬───────────────┘
┌────────────────┐                     │
│  Display Info  │                     │ orchestrates
└────────────────┘                     │
                                       ▼
                            ┌────────────────────────┐
                            │  Migration Pipeline    │
                            │                        │
                            │  1. Validate           │
                            │  2. Backup             │
                            │  3. Normalize          │
                            │  4. Update package.json│
                            │  5. Transform files    │
                            │  6. Transform code     │
                            │  7. Update tsconfig    │
                            │  8. Generate configs   │
                            │  9. Cleanup            │
                            │  10. Instructions      │
                            └────┬───────────────────┘
                                 │
                                 │ uses
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │   File   │ │   Code   │ │ Package  │
              │Transformer│ │Transformer│ │Transformer│
              └──────────┘ └──────────┘ └──────────┘
                    │            │            │
                    │            │            │
                    └────────────┴────────────┘
                                 │
                                 │ modifies
                                 ▼
                        ┌────────────────┐
                        │  Project Files │
                        │                │
                        │  • Routes      │
                        │  • Configs     │
                        │  • Dependencies│
                        └────────────────┘
```

## Component Interaction Flow

```
User Input
    │
    ▼
┌───────────────────────────────────────┐
│         hopr CLI Application          │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │      Command Parser             │ │
│  │  (Commander.js)                 │ │
│  └────────────┬────────────────────┘ │
│               │                       │
│  ┌────────────▼────────────────────┐ │
│  │   Command Handlers              │ │
│  │   • MigrateCommand              │ │
│  │   • DetectCommand               │ │
│  └────────────┬────────────────────┘ │
└───────────────┼───────────────────────┘
                │
                │ delegates to
                ▼
┌───────────────────────────────────────┐
│        @hopr/cli-core                 │
│                                       │
│  ┌─────────────────┐                 │
│  │    Detectors    │                 │
│  │                 │                 │
│  │  Framework      │                 │
│  │  Package Manager│                 │
│  │  Structure      │                 │
│  └────────┬────────┘                 │
│           │                           │
│           │ provides                  │
│           │ DetectionResult           │
└───────────┼───────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│      @hopr/cli-migrators              │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │   Migration Orchestrator        │ │
│  │                                 │ │
│  │   NextJsToTanStackMigrator      │ │
│  │                                 │ │
│  │   • Validates project           │ │
│  │   • Coordinates transformations │ │
│  │   • Manages backup              │ │
│  │   • Reports results             │ │
│  └────────────┬────────────────────┘ │
└───────────────┼───────────────────────┘
                │
                │ uses
                ▼
┌───────────────────────────────────────┐
│     @hopr/cli-transformers            │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │   Transformation Layer          │ │
│  │                                 │ │
│  │   ┌───────────────────────────┐│ │
│  │   │  FileTransformer          ││ │
│  │   │  • Rename files           ││ │
│  │   │  • Move files             ││ │
│  │   │  • Delete files           ││ │
│  │   └───────────────────────────┘│ │
│  │                                 │ │
│  │   ┌───────────────────────────┐│ │
│  │   │  CodeTransformer          ││ │
│  │   │  • Parse AST (Babel)      ││ │
│  │   │  • Transform imports      ││ │
│  │   │  • Update components      ││ │
│  │   │  • Format with Prettier   ││ │
│  │   └───────────────────────────┘│ │
│  │                                 │ │
│  │   ┌───────────────────────────┐│ │
│  │   │  PackageTransformer       ││ │
│  │   │  • Update dependencies    ││ │
│  │   │  • Update scripts         ││ │
│  │   └───────────────────────────┘│ │
│  │                                 │ │
│  │   ┌───────────────────────────┐│ │
│  │   │  ConfigTransformer        ││ │
│  │   │  • Generate vite.config   ││ │
│  │   │  • Generate router.tsx    ││ │
│  │   │  • Update .gitignore      ││ │
│  │   └───────────────────────────┘│ │
│  └─────────────────────────────────┘ │
└───────────────────────────────────────┘
                │
                │ reads/writes
                ▼
┌───────────────────────────────────────┐
│          File System                  │
│                                       │
│  • Source project files               │
│  • Backup directory                   │
│  • Modified files                     │
│  • Generated configs                  │
└───────────────────────────────────────┘
```

## Package Dependency Graph

```
                    hopr
                     │
                     │ depends on
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
    cli-core   cli-transformers  cli-migrators
         ▲           │           │
         │           │ depends on│
         │           └────┬──────┘
         │                │
         │                │
         └────────────────┘
              depends on
```

## Technology Stack Layers

```
┌─────────────────────────────────────────────────────────┐
│                  User Interface Layer                    │
│                                                          │
│  Commander.js │ Prompts │ Chalk │ Ora                   │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│                  Application Layer                       │
│                                                          │
│  CLI Commands │ Orchestration │ Validation              │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│                   Business Logic Layer                   │
│                                                          │
│  Detectors │ Migrators │ Transformers                   │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│                    Utility Layer                         │
│                                                          │
│  FileSystem │ Logger │ Backup │ AST Tools              │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│                  Infrastructure Layer                    │
│                                                          │
│  Node.js │ TypeScript │ Babel │ Prettier               │
└──────────────────────────────────────────────────────────┘
```

## Build & Deployment Pipeline

```
┌─────────────────────────────────────────────────────────┐
│                   Developer Workflow                     │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │  Make Changes   │
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │  Add Changeset  │
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │  Commit & Push  │
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │   Open PR       │
            └────────┬────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   CI Pipeline (GitHub Actions)          │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │    Lint     │  │ Type Check  │  │    Build    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Test on Multiple Platforms               │  │
│  │  Windows │ macOS │ Linux │ Node 18,20,22       │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────┘
                     │ All checks pass
                     ▼
            ┌─────────────────┐
            │   Merge PR      │
            └────────┬────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Release Pipeline (GitHub Actions)          │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │      Changesets Action                          │   │
│  │  • Detects changesets                           │   │
│  │  • Creates "Version Packages" PR                │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │  Review & Merge │
            │  Version PR     │
            └────────┬────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Publish Pipeline                            │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │    Build    │→ │   Publish   │→ │  Create Tag │    │
│  │  Packages   │  │   to npm    │  │             │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │  Available on   │
            │   npm Registry  │
            └─────────────────┘
```

## Key Design Principles

1. **Separation of Concerns**
   - Each package has a single responsibility
   - Clear boundaries between layers

2. **Dependency Inversion**
   - High-level modules don't depend on low-level modules
   - Both depend on abstractions

3. **Modularity**
   - Packages can be used independently
   - Easy to extend and maintain

4. **Type Safety**
   - Full TypeScript implementation
   - Strict type checking throughout

5. **Error Handling**
   - Graceful error handling at each layer
   - Clear error messages for users

6. **Testability**
   - Pure functions where possible
   - Dependency injection for testing

---

This architecture follows SOLID principles and industry best practices for building maintainable, scalable CLI tools.
