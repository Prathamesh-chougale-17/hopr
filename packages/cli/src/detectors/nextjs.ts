import path from "path";
import { FileSystem } from "../utils/file-system.js";
import { ProjectStructure } from "./types.js";

export class NextJsDetector {
  /**
   * Detect if project is a Next.js project
   */
  static async detect(projectPath: string): Promise<boolean> {
    const packageJsonPath = path.join(projectPath, "package.json");

    if (!(await FileSystem.exists(packageJsonPath))) {
      return false;
    }

    try {
      const packageJson = await FileSystem.readJson(packageJsonPath);
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      return "next" in dependencies;
    } catch {
      return false;
    }
  }

  /**
   * Analyze Next.js project structure
   */
  static async analyzeStructure(
    projectPath: string,
  ): Promise<ProjectStructure> {
    const hasSrcFolder = await FileSystem.exists(path.join(projectPath, "src"));
    const hasAppFolder = await FileSystem.exists(path.join(projectPath, "app"));
    const hasAppFolderInSrc = await FileSystem.exists(
      path.join(projectPath, "src", "app"),
    );
    const hasPagesFolder =
      (await FileSystem.exists(path.join(projectPath, "pages"))) ||
      (await FileSystem.exists(path.join(projectPath, "src", "pages")));

    const nextConfigFiles = [
      "next.config.js",
      "next.config.mjs",
      "next.config.ts",
    ];
    let hasNextConfig = false;

    for (const configFile of nextConfigFiles) {
      if (await FileSystem.exists(path.join(projectPath, configFile))) {
        hasNextConfig = true;
        break;
      }
    }

    const viteConfigFiles = [
      "vite.config.js",
      "vite.config.mjs",
      "vite.config.ts",
    ];
    let hasViteConfig = false;

    for (const configFile of viteConfigFiles) {
      if (await FileSystem.exists(path.join(projectPath, configFile))) {
        hasViteConfig = true;
        break;
      }
    }

    return {
      hasSrcFolder,
      hasAppFolder,
      hasAppFolderInSrc,
      hasPagesFolder,
      hasNextConfig,
      hasViteConfig,
      packageJsonPath: path.join(projectPath, "package.json"),
    };
  }

  /**
   * Check if Next.js project uses App Router
   */
  static async isAppRouter(projectPath: string): Promise<boolean> {
    const structure = await this.analyzeStructure(projectPath);
    return structure.hasAppFolder || structure.hasAppFolderInSrc;
  }

  /**
   * Check if Next.js project uses Pages Router
   */
  static async isPagesRouter(projectPath: string): Promise<boolean> {
    const structure = await this.analyzeStructure(projectPath);
    return structure.hasPagesFolder;
  }
}
