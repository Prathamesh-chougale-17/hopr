import path from "path";
import { FileSystem } from "../utils/file-system.js";
import { logger } from "../utils/logger.js";
import { PackageManager } from "../detectors/types.js";

export interface PackageJsonUpdate {
  addDependencies?: Record<string, string>;
  addDevDependencies?: Record<string, string>;
  removeDependencies?: string[];
  removeDevDependencies?: string[];
  updateScripts?: Record<string, string>;
}

export class PackageTransformer {
  constructor(
    private projectPath: string,
    private packageManager: PackageManager
  ) {}

  /**
   * Update package.json for TanStack Start migration
   */
  async transformForTanStackStart(): Promise<void> {
    const packageJsonPath = path.join(this.projectPath, "package.json");
    const packageJson = await FileSystem.readJson(packageJsonPath);

    logger.info("Updating package.json...");

    // Remove Next.js dependencies
    const depsToRemove = ["next", "@tailwindcss/postcss"];
    for (const dep of depsToRemove) {
      if (packageJson.dependencies?.[dep]) {
        delete packageJson.dependencies[dep];
        logger.info(`  Removed dependency: ${dep}`);
      }
      if (packageJson.devDependencies?.[dep]) {
        delete packageJson.devDependencies[dep];
        logger.info(`  Removed devDependency: ${dep}`);
      }
    }

    // Add TanStack Start dependencies
    const newDependencies = {
      "@tanstack/react-router": "^1.132.0",
      "@tanstack/react-start": "^1.132.0",
      "@tanstack/nitro-v2-vite-plugin": "^1.132.31",
      "@tanstack/react-router-devtools": "^1.132.0",
      "@tanstack/react-devtools": "^0.7.0",
      "@tanstack/react-router-ssr-query": "^1.131.7",
      "@tanstack/router-plugin": "^1.132.0",
    };

    packageJson.dependencies = packageJson.dependencies || {};
    for (const [dep, version] of Object.entries(newDependencies)) {
      packageJson.dependencies[dep] = version;
      logger.info(`  Added dependency: ${dep}@${version}`);
    }

    // Add dev dependencies
    const newDevDependencies = {
      vite: "^7.1.7",
      "@vitejs/plugin-react": "^5.0.4",
      "@tailwindcss/vite": "^4.0.6",
      tailwindcss: "^4.0.6",
      "vite-tsconfig-paths": "^5.1.4",
    };

    packageJson.devDependencies = packageJson.devDependencies || {};
    for (const [dep, version] of Object.entries(newDevDependencies)) {
      packageJson.devDependencies[dep] = version;
      logger.info(`  Added devDependency: ${dep}@${version}`);
    }

    // Update scripts
    const currentPort = packageJson.scripts?.dev?.match(/--port (\d+)/)?.[1] || "3000";

    packageJson.scripts = {
      ...packageJson.scripts,
      dev: `vite dev --port ${currentPort}`,
      build: "vite build",
      serve: "vite preview",
      start: "node .output/server/index.mjs",
    };

    // Keep existing lint and check-types if they exist
    if (!packageJson.scripts.lint) {
      packageJson.scripts.lint = "eslint --max-warnings 0";
    }
    if (!packageJson.scripts["check-types"]) {
      packageJson.scripts["check-types"] = "tsc --noEmit";
    }

    logger.info("  Updated scripts for Vite");

    // Ensure type: module
    packageJson.type = "module";

    // Write updated package.json
    await FileSystem.writeJson(packageJsonPath, packageJson);
    logger.success("package.json updated successfully");
  }

  /**
   * Get install command for the detected package manager
   */
  getInstallCommand(): string {
    switch (this.packageManager) {
      case "bun":
        return "bun install";
      case "pnpm":
        return "pnpm install";
      case "yarn":
        return "yarn install";
      case "npm":
      default:
        return "npm install";
    }
  }

  /**
   * Get uninstall command
   */
  getUninstallCommand(packages: string[]): string {
    const pkgList = packages.join(" ");
    switch (this.packageManager) {
      case "bun":
        return `bun remove ${pkgList}`;
      case "pnpm":
        return `pnpm remove ${pkgList}`;
      case "yarn":
        return `yarn remove ${pkgList}`;
      case "npm":
      default:
        return `npm uninstall ${pkgList}`;
    }
  }

  /**
   * Get add command
   */
  getAddCommand(packages: string[], isDev = false): string {
    const pkgList = packages.join(" ");
    const devFlag = isDev ? "-D" : "";

    switch (this.packageManager) {
      case "bun":
        return `bun add ${devFlag} ${pkgList}`.trim();
      case "pnpm":
        return `pnpm add ${devFlag} ${pkgList}`.trim();
      case "yarn":
        return `yarn add ${isDev ? "--dev" : ""} ${pkgList}`.trim();
      case "npm":
      default:
        return `npm install ${devFlag} ${pkgList}`.trim();
    }
  }
}
