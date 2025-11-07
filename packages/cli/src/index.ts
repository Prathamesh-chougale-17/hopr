#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { migrateCommand } from "./commands/migrate.js";
import { detectCommand } from "./commands/detect.js";
import { logger } from "./utils/logger.js";

// Get package.json version
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJsonPath = path.join(__dirname, "..", "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

const program = new Command();

program
  .name("hopr")
  .description(
    "CLI tool for migrating fullstack web projects between frameworks",
  )
  .version(packageJson.version);

// Migrate command
program
  .command("migrate")
  .description("Migrate a project from one framework to another")
  .argument("<path>", "Path to the project directory")
  .option(
    "--from <framework>",
    "Source framework (auto-detected if not specified)",
  )
  .option("--to <framework>", "Target framework (default: tanstack-start)")
  .option("--dry-run", "Preview changes without applying them")
  .option("--no-backup", "Skip creating a backup before migration")
  .option("--skip-install", "Skip running package installation")
  .option("-y, --yes", "Skip confirmation prompts")
  .action(async (targetPath: string, options) => {
    await migrateCommand(targetPath, options);
  });

// Detect command
program
  .command("detect")
  .description("Detect the framework used in a project")
  .argument("[path]", "Path to the project directory", ".")
  .action(async (targetPath: string) => {
    await detectCommand(targetPath);
  });

// Error handling
program.showHelpAfterError("(add --help for additional information)");

// Parse arguments
try {
  await program.parseAsync(process.argv);
} catch (error) {
  logger.error(`Error: ${error}`);
  process.exit(1);
}
