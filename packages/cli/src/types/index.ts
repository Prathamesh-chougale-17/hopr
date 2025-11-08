export type FrameworkType = 'nextjs' | 'tanstack-start' | 'remix' | 'sveltekit' | 'astro' | 'nuxt'

export interface RouteInfo {
  /** Original file path */
  sourcePath: string
  /** Route pattern (e.g., '/posts/[slug]') */
  pattern: string
  /** Route type */
  type: 'page' | 'layout' | 'error' | 'loading' | 'not-found' | 'api'
  /** Dynamic parameters if any */
  params?: string[]
  /** Whether it's a catch-all route */
  isCatchAll?: boolean
  /** File content */
  content?: string
}

export interface ProjectStructure {
  /** Root directory of the project */
  rootDir: string
  /** Framework type detected */
  framework: FrameworkType
  /** Whether using src directory */
  useSrc: boolean
  /** App directory path (relative to rootDir) */
  appDir: string
  /** Public directory path */
  publicDir?: string
  /** All routes found */
  routes: RouteInfo[]
  /** Dependencies from package.json */
  dependencies: Record<string, string>
  /** Dev dependencies from package.json */
  devDependencies: Record<string, string>
  /** Package manager detected */
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun'
  /** Additional metadata */
  metadata?: {
    hasTailwind?: boolean
    hasTypescript?: boolean
    hasMiddleware?: boolean
    [key: string]: unknown
  }
}

export interface TransformedRoute {
  /** Target file path */
  targetPath: string
  /** Generated content */
  content: string
  /** Original route info */
  source: RouteInfo
}

export interface TransformedOutput {
  /** Target framework */
  framework: FrameworkType
  /** Transformed routes */
  routes: TransformedRoute[]
  /** Config files to generate */
  configs: Array<{
    path: string
    content: string
  }>
  /** Dependencies to add */
  dependencies: Record<string, string>
  /** Dev dependencies to add */
  devDependencies: Record<string, string>
  /** Dependencies to remove */
  removeDependencies: string[]
  /** Files to delete */
  filesToDelete: string[]
  /** Migration report */
  report: {
    totalRoutes: number
    transformedRoutes: number
    skippedRoutes: number
    warnings: string[]
    errors: string[]
  }
}

export interface MigrationOptions {
  /** Source project directory */
  sourceDir: string
  /** Target framework */
  targetFramework: FrameworkType
  /** Dry run mode (don't write files) */
  dryRun?: boolean
  /** Skip confirmations */
  skipConfirm?: boolean
  /** Create backup */
  backup?: boolean
  /** Backup directory */
  backupDir?: string
  /** Custom config file path */
  configPath?: string
}

export interface FrameworkAdapter {
  /** Framework name */
  name: FrameworkType

  /** Detect if this framework is used in the project */
  detect(projectPath: string): Promise<boolean>

  /** Analyze project structure */
  analyze(projectPath: string): Promise<ProjectStructure>

  /** Transform project structure to target format */
  transform(structure: ProjectStructure, targetFramework: FrameworkType): Promise<TransformedOutput>

  /** Generate files in target directory */
  generate(output: TransformedOutput, targetDir: string): Promise<void>
}

export interface HoprConfig {
  /** Source framework (auto-detected if not specified) */
  sourceFramework?: FrameworkType

  /** Target framework */
  targetFramework?: FrameworkType

  /** Custom transformation rules */
  transformRules?: {
    [key: string]: unknown
  }

  /** Files/patterns to ignore during migration */
  ignore?: string[]

  /** Custom file mappings */
  fileMappings?: Record<string, string>
}

export interface FileTransformation {
  /** Source file path */
  sourcePath: string
  /** Target file path */
  targetPath: string
  /** Transformation type */
  type: 'copy' | 'transform' | 'generate' | 'delete'
  /** File content (for transform/generate) */
  content?: string
  /** AST transformations to apply */
  transformations?: Array<{
    name: string
    description: string
  }>
}
