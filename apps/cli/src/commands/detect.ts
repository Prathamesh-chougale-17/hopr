import { FrameworkDetector } from "@hopr/cli-core/detectors/index.js";
import { logger } from "@hopr/cli-core/utils/logger.js";
import { FileSystem } from "@hopr/cli-core/utils/file-system.js";

export async function detectCommand(targetPath: string): Promise<void> {
  try {
    // Resolve target path
    const projectPath = FileSystem.resolve(targetPath);

    // Check if path exists
    if (!(await FileSystem.exists(projectPath))) {
      logger.error(`Path does not exist: ${projectPath}`);
      process.exit(1);
    }

    logger.blank();
    logger.section("🔍 Project Detection");
    logger.blank();

    // Detect framework
    const detection = await FrameworkDetector.detect(projectPath);

    // Display results
    logger.info("Detection Results:");
    logger.blank();

    logger.list([
      `Framework: ${detection.framework}`,
      `Package Manager: ${detection.packageManager}`,
      `Root Path: ${detection.rootPath}`,
    ]);

    logger.blank();
    logger.info("Project Structure:");
    logger.blank();

    logger.list([
      `Has src/ folder: ${detection.structure.hasSrcFolder ? "Yes" : "No"}`,
      `Has app/ folder: ${detection.structure.hasAppFolder ? "Yes" : "No"}`,
      `Has src/app/ folder: ${detection.structure.hasAppFolderInSrc ? "Yes" : "No"}`,
      `Has pages/ folder: ${detection.structure.hasPagesFolder ? "Yes" : "No"}`,
      `Has Next.js config: ${detection.structure.hasNextConfig ? "Yes" : "No"}`,
      `Has Vite config: ${detection.structure.hasViteConfig ? "Yes" : "No"}`,
    ]);

    logger.blank();

    // Suggest migration path
    if (detection.framework === "nextjs") {
      logger.success("✅ This project can be migrated to TanStack Start");
      logger.info("Run: hopr migrate . --to tanstack-start");
    } else if (detection.framework === "unknown") {
      logger.warn("⚠️  Could not detect a supported framework");
    } else {
      logger.info(`ℹ️  Framework: ${detection.framework}`);
      logger.info("Migration support coming soon!");
    }

    logger.blank();
  } catch (error) {
    logger.error(`Detection failed: ${error}`);
    process.exit(1);
  }
}
