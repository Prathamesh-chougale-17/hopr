import prompts from "prompts";
import { FrameworkDetector } from "../detectors/index.js";
import { NextJsToTanStackMigrator } from "../migrators/nextjs-to-tanstack.js";
import { MigrationOptions } from "../migrators/base.js";
import { logger } from "../utils/logger.js";
import { FileSystem } from "../utils/file-system.js";

export interface MigrateCommandOptions {
  from?: string;
  to?: string;
  dryRun?: boolean;
  noBackup?: boolean;
  skipInstall?: boolean;
  yes?: boolean;
}

export async function migrateCommand(
  targetPath: string,
  options: MigrateCommandOptions,
): Promise<void> {
  try {
    // Resolve target path
    const projectPath = FileSystem.resolve(targetPath);

    // Check if path exists
    if (!(await FileSystem.exists(projectPath))) {
      logger.error(`Path does not exist: ${projectPath}`);
      process.exit(1);
    }

    // Check if it's a directory
    if (!(await FileSystem.isDirectory(projectPath))) {
      logger.error(`Path is not a directory: ${projectPath}`);
      process.exit(1);
    }

    logger.blank();
    logger.section("🔍 Detecting Project");
    logger.blank();

    // Detect framework
    const detection = await FrameworkDetector.detect(projectPath);

    logger.info(`Framework: ${detection.framework}`);
    logger.info(`Package Manager: ${detection.packageManager}`);
    logger.info(`Root Path: ${detection.rootPath}`);
    logger.blank();

    // Validate source framework
    const sourceFramework = options.from || detection.framework;

    if (sourceFramework === "unknown") {
      logger.error(
        "Could not detect framework. Please specify with --from flag.",
      );
      logger.info("Supported frameworks: nextjs");
      process.exit(1);
    }

    if (sourceFramework !== "nextjs") {
      logger.error(`Unsupported source framework: ${sourceFramework}`);
      logger.info(
        "Currently only Next.js → TanStack Start migration is supported.",
      );
      process.exit(1);
    }

    // Validate target framework
    const targetFramework = options.to || "tanstack-start";

    if (targetFramework !== "tanstack-start") {
      logger.error(`Unsupported target framework: ${targetFramework}`);
      logger.info(
        "Currently only Next.js → TanStack Start migration is supported.",
      );
      process.exit(1);
    }

    // Create migrator
    logger.section("📋 Migration Plan");
    logger.blank();

    const migrationOptions: MigrationOptions = {
      dryRun: options.dryRun,
      skipBackup: options.noBackup,
      skipInstall: options.skipInstall,
    };

    const migrator = new NextJsToTanStackMigrator(
      projectPath,
      detection,
      migrationOptions,
    );

    // Validate migration
    const validation = await migrator.validate();
    if (!validation.valid) {
      logger.error("Migration validation failed:");
      validation.errors.forEach((error) => logger.error(`  • ${error}`));
      process.exit(1);
    }

    // Show migration summary
    const summary = migrator.getSummary();
    summary.forEach((line) => {
      if (line === "") {
        logger.blank();
      } else {
        logger.info(line);
      }
    });

    logger.blank();

    // Confirm migration
    if (!options.yes && !options.dryRun) {
      const response = await prompts({
        type: "confirm",
        name: "confirm",
        message: "Do you want to proceed with the migration?",
        initial: false,
      });

      if (!response.confirm) {
        logger.warn("Migration cancelled");
        process.exit(0);
      }
    }

    if (options.dryRun) {
      logger.info("Dry run mode: No changes will be made");
      logger.blank();
    }

    // Run migration
    logger.section("🚀 Running Migration");
    logger.blank();

    const result = await migrator.migrate();

    // Show results
    logger.blank();
    logger.section("📊 Migration Results");
    logger.blank();

    if (result.success) {
      logger.success("Migration completed successfully!");
      logger.blank();

      if (result.filesCreated.length > 0) {
        logger.info("Files created:");
        logger.list(result.filesCreated);
        logger.blank();
      }

      if (result.filesModified.length > 0) {
        logger.info("Files modified:");
        logger.list(result.filesModified);
        logger.blank();
      }

      if (result.filesDeleted.length > 0) {
        logger.info("Files deleted:");
        logger.list(result.filesDeleted);
        logger.blank();
      }

      if (result.warnings.length > 0) {
        logger.warn("Warnings:");
        logger.list(result.warnings);
        logger.blank();
      }

      if (!options.dryRun) {
        logger.section("✅ Next Steps");
        logger.blank();
        logger.list([
          `1. Run: ${detection.packageManager === "bun" ? "bun install" : detection.packageManager + " install"}`,
          `2. Review the changes and test your application`,
          `3. Run: ${detection.packageManager === "bun" ? "bun run dev" : detection.packageManager + " run dev"}`,
          `4. Visit: http://localhost:3000`,
        ]);
        logger.blank();
        logger.info("Backup created at: .hopr-backup/");
      }
    } else {
      logger.error("Migration failed!");
      if (result.errors.length > 0) {
        logger.blank();
        logger.error("Errors:");
        logger.list(result.errors);
      }
      process.exit(1);
    }
  } catch (error) {
    logger.error(`Unexpected error: ${error}`);
    process.exit(1);
  }
}
