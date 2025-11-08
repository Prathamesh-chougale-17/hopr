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
   * Rename layout.tsx to __root.tsx (keep in app directory)
   */
  async transformRootLayout(): Promise<void> {
    const possiblePaths = [
      path.join(this.projectPath, "src", "app", "layout.tsx"),
      path.join(this.projectPath, "app", "layout.tsx"),
    ];

    for (const layoutPath of possiblePaths) {
      if (await FileSystem.exists(layoutPath)) {
        const dir = FileSystem.dirname(layoutPath);
        const newPath = path.join(dir, "__root.tsx");

        logger.info(`Transforming root layout: ${layoutPath} → ${newPath}`);

        // Move file (rename in same directory)
        await FileSystem.move(layoutPath, newPath);
        return;
      }
    }

    logger.warn("No layout.tsx found to transform");
  }

  /**
   * Rename page.tsx to index.tsx (keep in app directory)
   */
  async transformHomePage(): Promise<void> {
    const possiblePaths = [
      path.join(this.projectPath, "src", "app", "page.tsx"),
      path.join(this.projectPath, "app", "page.tsx"),
    ];

    for (const pagePath of possiblePaths) {
      if (await FileSystem.exists(pagePath)) {
        const dir = FileSystem.dirname(pagePath);
        const newPath = path.join(dir, "index.tsx");

        logger.info(`Transforming home page: ${pagePath} → ${newPath}`);

        // Move file (rename in same directory)
        await FileSystem.move(pagePath, newPath);
        return;
      }
    }

    logger.warn("No page.tsx found to transform");
  }

  /**
   * Transform dynamic routes: [slug]/page.tsx → $slug.tsx
   * Example: posts/[slug]/page.tsx → posts/$slug.tsx
   */
  async transformDynamicRoutes(): Promise<void> {
    const appDirs = [
      path.join(this.projectPath, "src", "app"),
      path.join(this.projectPath, "app"),
    ];

    for (const appDir of appDirs) {
      if (await FileSystem.exists(appDir)) {
        // Find all page.tsx files in dynamic routes
        const files = await FileSystem.findFiles("**/[*]/page.tsx", {
          cwd: appDir,
        });

        for (const file of files) {
          const fullPath = path.join(appDir, file);
          const dir = FileSystem.dirname(fullPath);
          const parentDir = FileSystem.dirname(dir);

          // Get the dynamic segment name (e.g., "slug" from "[slug]")
          const dirName = FileSystem.basename(dir);
          const paramName = dirName.replace(/\[([^\]]+)\]/, "$1");

          // New file: $slug.tsx in parent directory
          const newPath = path.join(parentDir, `$${paramName}.tsx`);

          logger.info(`Transforming dynamic route: ${file} → $${paramName}.tsx`);
          await FileSystem.move(fullPath, newPath);

          // Remove the now-empty directory
          await FileSystem.remove(dir);
        }

        return;
      }
    }
  }

  /**
   * Transform catch-all routes: [...slug]/page.tsx → $.tsx
   * Example: posts/[...slug]/page.tsx → posts/$.tsx
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
          const parentDir = FileSystem.dirname(dir);

          // New file: $.tsx in parent directory
          const newPath = path.join(parentDir, "$.tsx");

          logger.info(`Transforming catch-all route: ${file} → $.tsx`);
          await FileSystem.move(fullPath, newPath);

          // Remove the now-empty directory
          await FileSystem.remove(dir);
        }

        return;
      }
    }
  }

  /**
   * CSS files handling - kept in app directory, renamed in ConfigTransformer
   */
  async moveCssFiles(): Promise<void> {
    // CSS files stay in their app directory
    // They are renamed from globals.css to styles.css in ConfigTransformer.renameGlobalCss()
    logger.info("CSS files will be handled by ConfigTransformer");
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
   * Move all folders except public and build artifacts to src/
   */
  async normalizeToSrcStructure(): Promise<void> {
    const srcDir = path.join(this.projectPath, "src");

    // If src/ already exists, skip normalization
    if (await FileSystem.exists(srcDir)) {
      logger.info("src/ folder already exists, skipping normalization");
      return;
    }

    logger.info("Normalizing project structure to src/ folder");

    // Create src directory
    await FileSystem.ensureDir(srcDir);

    // Folders to exclude from moving to src (only public and build/config artifacts)
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
      'coverage',
      '.husky',
      '.vscode',
      '.idea',
      'src'
    ];

    // Read all items in the project root
    const items = await FileSystem.readDir(this.projectPath);

    for (const item of items) {
      const itemPath = path.join(this.projectPath, item);

      // Skip if doesn't exist (might have been moved already)
      if (!(await FileSystem.exists(itemPath))) {
        continue;
      }

      const stats = await FileSystem.stat(itemPath);

      // Only move directories, and skip excluded ones
      if (stats.isDirectory() && !excludedFolders.includes(item)) {
        const destPath = path.join(srcDir, item);
        logger.info(`  Moving ${item}/ → src/${item}/`);
        // Use copy + remove for more reliable directory moving on Windows
        await FileSystem.copy(itemPath, destPath);
        await FileSystem.remove(itemPath);
      }
    }

    logger.success("Project structure normalized to src/ folder");
  }
}
