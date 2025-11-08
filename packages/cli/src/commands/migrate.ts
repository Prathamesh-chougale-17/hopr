import { Command } from "commander";
import path from "path";
import { logger } from "../utils/index.js";
import { Migrator } from "../core/migrator.js";
import type { FrameworkType, MigrationOptions } from "../types/index.js";

export function createMigrateCommand(): Command {
  return new Command("migrate")
    .description("Migrate a project to a different framework")
    .argument("[path]", "Project directory path", ".")
    .option(
      "--to <framework>",
      "Target framework (tanstack-start)",
      "tanstack-start",
    )
    .option(
      "--dry",
      "Dry run mode (preview changes without writing files)",
      false,
    )
    .option("--no-backup", "Skip creating backup")
    .option("--backup-dir <path>", "Custom backup directory")
    .option("--skip-confirm", "Skip confirmation prompts", false)
    .action(
      async (
        projectPath: string,
        options: {
          to: string;
          dry: boolean;
          backup: boolean;
          backupDir?: string;
          skipConfirm: boolean;
        },
      ) => {
        try {
          const absolutePath = path.resolve(projectPath);

          // Validate target framework
          const validFrameworks = ["tanstack-start"];
          if (!validFrameworks.includes(options.to)) {
            logger.error(`Unsupported framework: ${options.to}`);
            logger.info(`Supported frameworks: ${validFrameworks.join(", ")}`);
            process.exit(1);
          }

          const migrationOptions: MigrationOptions = {
            sourceDir: absolutePath,
            targetFramework: options.to as FrameworkType,
            dryRun: options.dry,
            backup: options.backup,
            backupDir: options.backupDir,
            skipConfirm: options.skipConfirm,
          };

          const migrator = new Migrator(migrationOptions);
          await migrator.run();
        } catch (error) {
          logger.error(`Migration failed: ${error}`);
          process.exit(1);
        }
      },
    );
}
