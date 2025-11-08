import { Command } from "commander";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createDetectCommand, createMigrateCommand } from "./commands/index.js";

// Get package.json path relative to this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, "../package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

const program = new Command();

program
  .name("hopr")
  .description(
    "A powerful CLI tool for migrating fullstack web projects between frameworks"
  )
  .version(packageJson.version);

// Register commands
program.addCommand(createDetectCommand());
program.addCommand(createMigrateCommand());

// Parse arguments
program.parse();
