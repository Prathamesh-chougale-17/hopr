import { Command } from "commander";
import { createDetectCommand, createMigrateCommand } from "./commands/index.js";

const program = new Command();

program
  .name("hopr")
  .description(
    "A powerful CLI tool for migrating fullstack web projects between frameworks"
  )
  .version("1.0.0");

// Register commands
program.addCommand(createDetectCommand());
program.addCommand(createMigrateCommand());

// Parse arguments
program.parse();
