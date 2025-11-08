import { Command } from "commander";
import path from "path";
import { logger } from "../utils/index.js";
import { detectFramework } from "../core/migrator.js";

export function createDetectCommand(): Command {
  return new Command("detect")
    .description("Detect the framework used in a project")
    .argument("[path]", "Project directory path", ".")
    .action(async (projectPath: string) => {
      try {
        const absolutePath = path.resolve(projectPath);
        logger.info(`Analyzing project at: ${absolutePath}`);
        logger.blank();

        const framework = await detectFramework(absolutePath);

        if (framework) {
          logger.success(`Detected framework: ${framework}`);
        } else {
          logger.warn("Could not detect a supported framework");
          logger.info("Supported frameworks: Next.js (App Router)");
        }
      } catch (error) {
        logger.error(`Detection failed: ${error}`);
        process.exit(1);
      }
    });
}
