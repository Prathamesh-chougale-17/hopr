export type Framework =
  | "nextjs"
  | "tanstack-start"
  | "remix"
  | "sveltekit"
  | "astro"
  | "nuxt"
  | "unknown";

export type PackageManager = "bun" | "npm" | "yarn" | "pnpm";

export interface PackageJson {
  name?: string;
  version?: string;
  type?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  [key: string]: unknown;
}

export interface ProjectStructure {
  hasSrcFolder: boolean;
  hasAppFolder: boolean;
  hasAppFolderInSrc: boolean;
  hasPagesFolder: boolean;
  hasNextConfig: boolean;
  hasViteConfig: boolean;
  packageJsonPath: string;
}

export interface DetectionResult {
  framework: Framework;
  packageManager: PackageManager;
  structure: ProjectStructure;
  rootPath: string;
}
