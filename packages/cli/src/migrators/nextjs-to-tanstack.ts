import path from "path";
import { BaseMigrator, MigrationResult } from "./base.js";
import { FileTransformer } from "../transformers/file-transformer.js";
import { PackageTransformer } from "../transformers/package-transformer.js";
import { CodeTransformer } from "../transformers/code-transformer.js";
import { ConfigTransformer } from "../transformers/config-transformer.js";
import { BackupManager } from "../utils/backup.js";
import { FileSystem } from "../utils/file-system.js";
import { logger } from "../utils/logger.js";

export class NextJsToTanStackMigrator extends BaseMigrator {
  private result: MigrationResult = {
    success: false,
    filesModified: [],
    filesCreated: [],
    filesDeleted: [],
    errors: [],
    warnings: [],
  };

  /**
   * Validate migration prerequisites
   */
  async validate(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check if it's a Next.js project
    if (this.detection.framework !== "nextjs") {
      errors.push("Project is not a Next.js application");
    }

    // Check if it uses App Router
    if (
      !this.detection.structure.hasAppFolder &&
      !this.detection.structure.hasAppFolderInSrc
    ) {
      errors.push(
        "Project does not use Next.js App Router. Only App Router is supported."
      );
    }

    // Check for package.json
    if (!(await FileSystem.exists(this.detection.structure.packageJsonPath))) {
      errors.push("package.json not found");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get migration summary
   */
  getSummary(): string[] {
    return [
      `Framework: Next.js → TanStack Start`,
      `Package Manager: ${this.detection.packageManager}`,
      `Project Path: ${this.projectPath}`,
      `Has src/ folder: ${this.detection.structure.hasSrcFolder ? "Yes" : "No"}`,
      ``,
      `The following changes will be made:`,
      `  • Remove Next.js dependencies`,
      `  • Install TanStack Start and Vite`,
      `  • Transform file structure (app/ → routes/)`,
      `  • Update code for TanStack Router`,
      `  • Generate configuration files`,
      `  • Update package.json scripts`,
    ];
  }

  /**
   * Run the complete migration
   */
  async migrate(): Promise<MigrationResult> {
    const totalSteps = 10;
    let currentStep = 0;

    try {
      // Step 1: Validate
      currentStep++;
      logger.step(currentStep, totalSteps, "Validating project...");
      const validation = await this.validate();
      if (!validation.valid) {
        this.result.errors.push(...validation.errors);
        return this.result;
      }

      // Step 2: Create backup
      if (!this.options.skipBackup && !this.options.dryRun) {
        currentStep++;
        logger.step(currentStep, totalSteps, "Creating backup...");
        const backupManager = new BackupManager(this.projectPath);
        await backupManager.createBackup(this.projectPath);
      }

      // Step 3: Normalize project structure
      currentStep++;
      logger.step(currentStep, totalSteps, "Normalizing project structure...");
      if (!this.options.dryRun) {
        const fileTransformer = new FileTransformer(this.projectPath);
        await fileTransformer.normalizeToSrcStructure();
      }

      // Step 4: Update package.json
      currentStep++;
      logger.step(currentStep, totalSteps, "Updating package.json...");
      if (!this.options.dryRun) {
        const packageTransformer = new PackageTransformer(
          this.projectPath,
          this.detection.packageManager
        );
        await packageTransformer.transformForTanStackStart();
        this.result.filesModified.push("package.json");
      }

      // Step 5: Transform file structure (keep in app directory)
      currentStep++;
      logger.step(currentStep, totalSteps, "Transforming file structure...");
      if (!this.options.dryRun) {
        const fileTransformer = new FileTransformer(this.projectPath);
        await fileTransformer.transformRootLayout();
        await fileTransformer.transformHomePage();
        await fileTransformer.transformDynamicRoutes();
        await fileTransformer.transformCatchAllRoutes();
        await fileTransformer.moveCssFiles();
      }

      // Step 6: Transform code
      currentStep++;
      logger.step(currentStep, totalSteps, "Transforming code...");
      if (!this.options.dryRun) {
        // Transform root layout
        const rootLayoutPath = path.join(
          this.projectPath,
          "src",
          "app",
          "__root.tsx"
        );
        if (await FileSystem.exists(rootLayoutPath)) {
          await CodeTransformer.transformRootLayout(rootLayoutPath);
          this.result.filesModified.push("src/app/__root.tsx");
        }

        // Transform index page
        const indexPath = path.join(
          this.projectPath,
          "src",
          "app",
          "index.tsx"
        );
        if (await FileSystem.exists(indexPath)) {
          await CodeTransformer.transformRoutePage(indexPath, "/");
          this.result.filesModified.push("src/app/index.tsx");
        }

        // Transform other route files
        const routeFiles = await FileSystem.findFiles("**/*.tsx", {
          cwd: path.join(this.projectPath, "src", "app"),
          ignore: ["__root.tsx", "index.tsx"],
        });

        for (const file of routeFiles) {
          const fullPath = path.join(this.projectPath, "src", "app", file);
          const routePath = CodeTransformer.getRoutePathFromFile(fullPath);
          await CodeTransformer.transformRoutePage(fullPath, routePath);
          this.result.filesModified.push(`src/app/${file}`);
        }
      }

      // Step 7: Create configuration files
      currentStep++;
      logger.step(currentStep, totalSteps, "Creating configuration files...");
      if (!this.options.dryRun) {
        const configTransformer = new ConfigTransformer(this.projectPath);
        await configTransformer.createTsConfig();
        await configTransformer.createViteConfig();
        await configTransformer.createRouterConfig();
        await configTransformer.createTailwindConfig();
        await configTransformer.renameGlobalCss();
        await configTransformer.updateGitignore();

        this.result.filesCreated.push("tsconfig.json");
        this.result.filesCreated.push("vite.config.ts");
        this.result.filesCreated.push("src/router.tsx");
      }

      // Step 8: Remove old TypeScript config (if exists)
      currentStep++;
      logger.step(currentStep, totalSteps, "Cleaning up old configs...");
      // This step is now handled by creating new config above

      // Step 9: Delete Next.js files
      currentStep++;
      logger.step(currentStep, totalSteps, "Removing Next.js files...");
      if (!this.options.dryRun) {
        const fileTransformer = new FileTransformer(this.projectPath);
        await fileTransformer.deleteNextJsFiles();
        this.result.filesDeleted.push(
          "next.config.*",
          "next-env.d.ts",
          "postcss.config.*"
        );
      }

      // Step 10: Installation instructions
      currentStep++;
      logger.step(currentStep, totalSteps, "Migration complete!");

      if (!this.options.skipInstall && !this.options.dryRun) {
        logger.blank();
        logger.info("Next steps:");
        const packageTransformer = new PackageTransformer(
          this.projectPath,
          this.detection.packageManager
        );
        logger.list([
          `Run: ${packageTransformer.getInstallCommand()}`,
          `Run: ${this.detection.packageManager === "bun" ? "bun run dev" : this.detection.packageManager + " run dev"}`,
          `Visit: http://localhost:3000`,
        ]);
      }

      this.result.success = true;
    } catch (error) {
      this.result.errors.push(
        error instanceof Error ? error.message : String(error)
      );
      logger.error(`Migration failed: ${error}`);
    }

    return this.result;
  }
}
