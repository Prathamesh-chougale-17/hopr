import path from "path";
import { FileSystem } from "../utils/file-system.js";
import { NextJsDetector } from "./nextjs.js";
import { DetectionResult, Framework, PackageManager } from "./types.js";

export class FrameworkDetector {
  /**
   * Detect package manager from lockfiles
   */
  static async detectPackageManager(
    projectPath: string,
  ): Promise<PackageManager> {
    if (await FileSystem.exists(path.join(projectPath, "bun.lockb"))) {
      return "bun";
    }
    if (await FileSystem.exists(path.join(projectPath, "pnpm-lock.yaml"))) {
      return "pnpm";
    }
    if (await FileSystem.exists(path.join(projectPath, "yarn.lock"))) {
      return "yarn";
    }
    if (await FileSystem.exists(path.join(projectPath, "package-lock.json"))) {
      return "npm";
    }

    // Default to npm if no lockfile found
    return "npm";
  }

  /**
   * Detect framework used in the project
   */
  static async detectFramework(projectPath: string): Promise<Framework> {
    // Check for Next.js
    if (await NextJsDetector.detect(projectPath)) {
      return "nextjs";
    }

    // Check for TanStack Start
    const packageJsonPath = path.join(projectPath, "package.json");
    if (await FileSystem.exists(packageJsonPath)) {
      try {
        const packageJson = await FileSystem.readJson(packageJsonPath);
        const dependencies = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        if ("@tanstack/react-start" in dependencies) {
          return "tanstack-start";
        }

        if ("@remix-run/react" in dependencies) {
          return "remix";
        }

        if ("@sveltejs/kit" in dependencies) {
          return "sveltekit";
        }

        if ("astro" in dependencies) {
          return "astro";
        }

        if ("nuxt" in dependencies) {
          return "nuxt";
        }
      } catch {
        // Fall through to unknown
      }
    }

    return "unknown";
  }

  /**
   * Perform full project detection
   */
  static async detect(projectPath: string): Promise<DetectionResult> {
    const resolvedPath = FileSystem.resolve(projectPath);

    const framework = await this.detectFramework(resolvedPath);
    const packageManager = await this.detectPackageManager(resolvedPath);

    let structure;
    if (framework === "nextjs") {
      structure = await NextJsDetector.analyzeStructure(resolvedPath);
    } else {
      // Default structure for other frameworks
      structure = {
        hasSrcFolder: await FileSystem.exists(path.join(resolvedPath, "src")),
        hasAppFolder: await FileSystem.exists(path.join(resolvedPath, "app")),
        hasAppFolderInSrc: await FileSystem.exists(
          path.join(resolvedPath, "src", "app"),
        ),
        hasPagesFolder: await FileSystem.exists(
          path.join(resolvedPath, "pages"),
        ),
        hasNextConfig: false,
        hasViteConfig: await FileSystem.exists(
          path.join(resolvedPath, "vite.config.ts"),
        ),
        packageJsonPath: path.join(resolvedPath, "package.json"),
      };
    }

    return {
      framework,
      packageManager,
      structure,
      rootPath: resolvedPath,
    };
  }
}

export * from "./types.js";
export { NextJsDetector } from "./nextjs.js";
