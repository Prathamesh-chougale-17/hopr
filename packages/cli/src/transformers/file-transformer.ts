import path from "path";
import { FileSystem } from "../utils/file-system.js";
import { logger } from "../utils/logger.js";

export interface FileTransformation {
  type: "rename" | "move" | "delete" | "create";
  from?: string;
  to?: string;
  content?: string;
}

export class FileTransformer {
  constructor(private projectPath: string) {}

  /**
   * Rename layout.tsx to __root.tsx
   */
  async transformRootLayout(): Promise<void> {
    const possiblePaths = [
      path.join(this.projectPath, "src", "app", "layout.tsx"),
      path.join(this.projectPath, "app", "layout.tsx"),
    ];

    for (const layoutPath of possiblePaths) {
      if (await FileSystem.exists(layoutPath)) {
        const dir = FileSystem.dirname(layoutPath);
        const routesDir = dir.replace(/[/\\]app$/, "/routes");
        const newPath = path.join(routesDir, "__root.tsx");

        logger.info(`Transforming root layout: ${layoutPath} → ${newPath}`);

        // Ensure routes directory exists
        await FileSystem.ensureDir(routesDir);

        // Move file
        await FileSystem.move(layoutPath, newPath);
        return;
      }
    }

    logger.warn("No layout.tsx found to transform");
  }

  /**
   * Rename page.tsx to index.tsx
   */
  async transformHomePage(): Promise<void> {
    const possiblePaths = [
      path.join(this.projectPath, "src", "app", "page.tsx"),
      path.join(this.projectPath, "app", "page.tsx"),
    ];

    for (const pagePath of possiblePaths) {
      if (await FileSystem.exists(pagePath)) {
        const dir = FileSystem.dirname(pagePath);
        const routesDir = dir.replace(/[/\\]app$/, "/routes");
        const newPath = path.join(routesDir, "index.tsx");

        logger.info(`Transforming home page: ${pagePath} → ${newPath}`);

        // Ensure routes directory exists
        await FileSystem.ensureDir(routesDir);

        // Move file
        await FileSystem.move(pagePath, newPath);
        return;
      }
    }

    logger.warn("No page.tsx found to transform");
  }

  /**
   * Transform dynamic routes: [slug]/page.tsx → $slug/index.tsx
   */
  async transformDynamicRoutes(): Promise<void> {
    const appDirs = [
      path.join(this.projectPath, "src", "app"),
      path.join(this.projectPath, "app"),
    ];

    for (const appDir of appDirs) {
      if (await FileSystem.exists(appDir)) {
        const routesDir = appDir.replace(/[/\\]app$/, "/routes");

        // Find all page.tsx files in dynamic routes
        const files = await FileSystem.findFiles("**/[*]/page.tsx", {
          cwd: appDir,
        });

        for (const file of files) {
          const fullPath = path.join(appDir, file);
          const relativePath = path.relative(appDir, fullPath);

          // Transform [slug] → $slug
          const newRelativePath = relativePath
            .replace(/\[([^\]]+)\]/g, "$$$1")
            .replace(/page\.tsx$/, "index.tsx");

          const newPath = path.join(routesDir, newRelativePath);

          logger.info(
            `Transforming dynamic route: ${file} → ${newRelativePath}`
          );
          await FileSystem.move(fullPath, newPath);
        }

        return;
      }
    }
  }

  /**
   * Transform catch-all routes: [...slug]/page.tsx → $.tsx
   */
  async transformCatchAllRoutes(): Promise<void> {
    const appDirs = [
      path.join(this.projectPath, "src", "app"),
      path.join(this.projectPath, "app"),
    ];

    for (const appDir of appDirs) {
      if (await FileSystem.exists(appDir)) {
        // Find all catch-all routes
        const files = await FileSystem.findFiles("**/[...*/page.tsx", {
          cwd: appDir,
        });

        for (const file of files) {
          const fullPath = path.join(appDir, file);
          const dir = FileSystem.dirname(fullPath);
          const newDir = dir
            .replace(/[/\\]app[/\\]/, "/routes/")
            .replace(/\[\.\.\..*?\]$/, "");
          const newPath = path.join(newDir, "$.tsx");

          logger.info(`Transforming catch-all route: ${file} → $.tsx`);
          await FileSystem.move(fullPath, newPath);
        }

        return;
      }
    }
  }

  /**
   * Move all remaining route files from app/ to routes/
   */
  async moveRemainingRoutes(): Promise<void> {
    const appDirs = [
      path.join(this.projectPath, "src", "app"),
      path.join(this.projectPath, "app"),
    ];

    for (const appDir of appDirs) {
      if (await FileSystem.exists(appDir)) {
        const routesDir = appDir.replace(/[/\\]app$/, "/routes");

        // Find all remaining .tsx and .ts files
        const files = await FileSystem.findFiles("**/*.{tsx,ts}", {
          cwd: appDir,
          ignore: ["**/node_modules/**", "**/*.d.ts"],
        });

        for (const file of files) {
          const fullPath = path.join(appDir, file);

          // Skip if already moved
          if (!(await FileSystem.exists(fullPath))) {
            continue;
          }

          const newPath = path.join(routesDir, file);

          // Skip if already in routes
          if (
            fullPath.includes("/routes/") ||
            fullPath.includes("\\routes\\")
          ) {
            continue;
          }

          logger.info(`Moving route file: ${file}`);
          await FileSystem.move(fullPath, newPath);
        }

        return;
      }
    }
  }

  /**
   * Move CSS files to appropriate location
   */
  async moveCssFiles(): Promise<void> {
    const appDirs = [
      path.join(this.projectPath, "src", "app"),
      path.join(this.projectPath, "app"),
    ];

    for (const appDir of appDirs) {
      if (await FileSystem.exists(appDir)) {
        const srcDir =
          appDir.includes("/src/") || appDir.includes("\\src\\")
            ? path.join(this.projectPath, "src")
            : this.projectPath;

        // Find CSS files
        const cssFiles = await FileSystem.findFiles("**/*.css", {
          cwd: appDir,
        });

        for (const cssFile of cssFiles) {
          const fullPath = path.join(appDir, cssFile);
          const fileName = FileSystem.basename(cssFile);

          // Move to src/ root or project root
          const newPath = path.join(srcDir, fileName);

          if (fullPath !== newPath) {
            logger.info(`Moving CSS file: ${cssFile} → ${fileName}`);
            await FileSystem.move(fullPath, newPath);
          }
        }

        return;
      }
    }
  }

  /**
   * Delete Next.js specific files
   */
  async deleteNextJsFiles(): Promise<void> {
    const filesToDelete = [
      "next.config.js",
      "next.config.mjs",
      "next.config.ts",
      "next-env.d.ts",
      "postcss.config.js",
      "postcss.config.mjs",
      "postcss.config.cjs",
      ".next",
    ];

    for (const file of filesToDelete) {
      const filePath = path.join(this.projectPath, file);
      if (await FileSystem.exists(filePath)) {
        logger.info(`Deleting Next.js file: ${file}`);
        await FileSystem.remove(filePath);
      }
    }
  }

  /**
   * Normalize project structure to use src/ folder
   * Moves all folders except public to src/
   */
  async normalizeToSrcStructure(): Promise<void> {
    const srcDir = path.join(this.projectPath, "src");

    // If src/ already exists, skip normalization
    if (await FileSystem.exists(srcDir)) {
      logger.info("src/ folder already exists, skipping normalization");
      return;
    }

    logger.info("Normalizing project structure: moving folders to src/");

    // Create src directory
    await FileSystem.ensureDir(srcDir);

    // Folders to exclude from moving to src
    const excludedFolders = [
      'public',
      'node_modules',
      '.git',
      '.next',
      '.output',
      '.turbo',
      '.nitro',
      'dist',
      'build',
      'coverage'
    ];

    // Read all items in the project root
    const items = await FileSystem.readDir(this.projectPath);

    for (const item of items) {
      const itemPath = path.join(this.projectPath, item);
      const stats = await FileSystem.stat(itemPath);

      // Only move directories, and skip excluded ones and src itself
      if (stats.isDirectory() && !excludedFolders.includes(item) && item !== 'src') {
        const destPath = path.join(srcDir, item);
        logger.info(`  Moving ${item}/ → src/${item}/`);
        await FileSystem.move(itemPath, destPath);
      }
    }

    logger.success("Project structure normalized to src/ folder");
  }
}
