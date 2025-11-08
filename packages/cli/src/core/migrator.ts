import path from "path";
import ora from "ora";
import prompts from "prompts";
import {
  writeFile,
  writeJSON,
  readJSON,
  remove,
  logger,
  showFileSummary,
} from "../utils/index.js";
import type {
  MigrationOptions,
  ProjectStructure,
  TransformedOutput,
} from "../types/index.js";
import { detectNextJs, analyzeNextJsProject } from "../plugins/nextjs/index.js";
import { transformToTanStackStart } from "../plugins/tanstack/index.js";

/**
 * Main migration orchestrator
 */
export class Migrator {
  constructor(private options: MigrationOptions) {}

  async run(): Promise<void> {
    try {
      logger.header("🚀 hopr - Framework Migration Tool");
      logger.blank();

      // Step 1: Detect framework
      const spinner = ora("Detecting framework...").start();
      const isNextJs = await detectNextJs(this.options.sourceDir);

      if (!isNextJs) {
        spinner.fail("Could not detect Next.js project");
        logger.error("Currently only Next.js projects are supported");
        process.exit(1);
      }

      spinner.succeed("Detected Next.js project");

      // Step 2: Analyze project
      spinner.start("Analyzing project structure...");
      const structure = await analyzeNextJsProject(this.options.sourceDir);
      spinner.succeed(`Found ${structure.routes.length} routes`);

      // Display project info
      this.displayProjectInfo(structure);

      // Step 3: Confirm migration
      if (!this.options.skipConfirm && !this.options.dryRun) {
        const { confirmed } = await prompts({
          type: "confirm",
          name: "confirmed",
          message: `Migrate to ${this.options.targetFramework}?`,
          initial: true,
        });

        if (!confirmed) {
          logger.info("Migration cancelled");
          process.exit(0);
        }
      }

      // Step 4: Backup disabled
      // Backup functionality has been removed

      // Step 5: Transform
      spinner.start("Transforming code...");
      const output = await this.transform(structure);
      spinner.succeed("Code transformation complete");

      // Step 6: Generate files
      if (this.options.dryRun) {
        logger.info("Dry run mode - no files will be written");
        this.displayDryRun(output);
      } else {
        spinner.start("Writing files...");
        await this.generateFiles(output);
        spinner.succeed("Files written successfully");

        // Step 7: Update package.json
        spinner.start("Updating package.json...");
        await this.updatePackageJson(output);
        spinner.succeed("package.json updated");

        // Step 8: Cleanup
        spinner.start("Cleaning up...");
        await this.cleanup(output);
        spinner.succeed("Cleanup complete");
      }

      // Display report
      logger.blank();
      this.displayReport(output);

      logger.blank();
      logger.success("Migration completed successfully! 🎉");
      logger.blank();
      logger.info("Next steps:");
      logger.step(`1. Run: ${structure.packageManager} install`);
      logger.step(`2. Run: ${structure.packageManager} run dev`);
      logger.step("3. Review generated files and make necessary adjustments");
      logger.blank();
    } catch (error) {
      logger.error(`Migration failed: ${error}`);
      process.exit(1);
    }
  }

  private displayProjectInfo(structure: ProjectStructure): void {
    logger.blank();
    logger.info("Project Information:");
    logger.step(`Framework: ${structure.framework}`);
    logger.step(`Package Manager: ${structure.packageManager}`);
    logger.step(`Uses src: ${structure.useSrc ? "Yes" : "No"}`);
    logger.step(`App Directory: ${structure.appDir}`);
    logger.step(
      `TypeScript: ${structure.metadata?.hasTypescript ? "Yes" : "No"}`,
    );
    logger.step(
      `Tailwind CSS: ${structure.metadata?.hasTailwind ? "Yes" : "No"}`,
    );
    logger.blank();
  }

  private async transform(
    structure: ProjectStructure,
  ): Promise<TransformedOutput> {
    switch (this.options.targetFramework) {
      case "tanstack-start":
        return transformToTanStackStart(structure);
      default:
        throw new Error(
          `Unsupported target framework: ${this.options.targetFramework}`,
        );
    }
  }

  private async generateFiles(output: TransformedOutput): Promise<void> {
    // Move files first
    if (output.filesToMove) {
      for (const { from, to } of output.filesToMove) {
        const fromPath = path.join(this.options.sourceDir, from);
        const toPath = path.join(this.options.sourceDir, to);
        try {
          const {
            copyFile,
            remove: removeUtil,
            fileExists,
          } = await import("../utils/index.js");
          if (await fileExists(fromPath)) {
            await copyFile(fromPath, toPath);
            await removeUtil(fromPath);
            showFileSummary("update", `${from} → ${to}`);
          }
        } catch (error) {
          // File might not exist, continue
        }
      }
    }

    // Move directories
    if (output.directoriesToMove) {
      for (const { from, to } of output.directoriesToMove) {
        const fromPath = path.join(this.options.sourceDir, from);
        const toPath = path.join(this.options.sourceDir, to);
        try {
          const {
            remove: removeUtil,
            fileExists,
          } = await import("../utils/index.js");
          const fs = await import("fs-extra");
          if (await fileExists(fromPath)) {
            await fs.default.copy(fromPath, toPath);
            await removeUtil(fromPath);
            showFileSummary("update", `${from}/ → ${to}/`);
          }
        } catch (error) {
          // Directory might not exist, continue
        }
      }
    }

    // Delete old source files before writing new ones
    for (const file of output.filesToDelete) {
      const filePath = path.join(this.options.sourceDir, file);
      try {
        await remove(filePath);
        showFileSummary("delete", file);
      } catch {
        // Ignore if file doesn't exist
      }
    }

    // Write transformed routes
    for (const route of output.routes) {
      const filePath = path.join(this.options.sourceDir, route.targetPath);
      await writeFile(filePath, route.content);
      showFileSummary("create", route.targetPath);
    }

    // Write config files
    for (const config of output.configs) {
      const filePath = path.join(this.options.sourceDir, config.path);
      await writeFile(filePath, config.content);
      showFileSummary("create", config.path);
    }
  }

  private async updatePackageJson(output: TransformedOutput): Promise<void> {
    const packageJsonPath = path.join(this.options.sourceDir, "package.json");
    const packageJson = await readJSON<{
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      scripts?: Record<string, string>;
      [key: string]: unknown;
    }>(packageJsonPath);

    // Remove old dependencies
    for (const dep of output.removeDependencies) {
      if (packageJson.dependencies?.[dep]) {
        delete packageJson.dependencies[dep];
      }
      if (packageJson.devDependencies?.[dep]) {
        delete packageJson.devDependencies[dep];
      }
    }

    // Add new dependencies
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...output.dependencies,
    };

    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      ...output.devDependencies,
    };

    // Update scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      dev: "vite dev",
      build: "vite build",
      start: "node .output/server/index.mjs",
    };

    // Add type: module
    packageJson.type = "module";

    await writeJSON(packageJsonPath, packageJson);
  }

  private async cleanup(_output: TransformedOutput): Promise<void> {
    // Cleanup is now done in generateFiles before writing new files
    // This method is kept for backwards compatibility but doesn't do anything
  }

  private displayDryRun(output: TransformedOutput): void {
    logger.blank();
    logger.info("Files that would be created/modified:");
    logger.blank();

    if (output.filesToMove) {
      for (const { from, to } of output.filesToMove) {
        showFileSummary("update", `${from} → ${to}`);
      }
    }

    if (output.directoriesToMove) {
      for (const { from, to } of output.directoriesToMove) {
        showFileSummary("update", `${from}/ → ${to}/`);
      }
    }

    for (const route of output.routes) {
      showFileSummary("create", route.targetPath);
    }

    for (const config of output.configs) {
      showFileSummary("create", config.path);
    }

    logger.blank();
    logger.info("Files that would be deleted:");
    logger.blank();

    for (const file of output.filesToDelete) {
      showFileSummary("delete", file);
    }
  }

  private displayReport(output: TransformedOutput): void {
    logger.header("Migration Report");
    logger.info(`Total routes: ${output.report.totalRoutes}`);
    logger.info(`Transformed: ${output.report.transformedRoutes}`);
    logger.info(`Skipped: ${output.report.skippedRoutes}`);

    if (output.report.warnings.length > 0) {
      logger.blank();
      logger.warn("Warnings:");
      for (const warning of output.report.warnings) {
        logger.warn(`  ${warning}`);
      }
    }

    if (output.report.errors.length > 0) {
      logger.blank();
      logger.error("Errors:");
      for (const error of output.report.errors) {
        logger.error(`  ${error}`);
      }
    }
  }
}

/**
 * Detect framework in project directory
 */
export async function detectFramework(
  projectPath: string,
): Promise<string | null> {
  if (await detectNextJs(projectPath)) {
    return "nextjs";
  }

  return null;
}
