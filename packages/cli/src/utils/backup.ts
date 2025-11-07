import path from "path";
import { FileSystem } from "./file-system.js";
import { logger } from "./logger.js";

export class BackupManager {
  private backupDir: string;

  constructor(projectPath: string) {
    this.backupDir = path.join(projectPath, ".hopr-backup");
  }

  /**
   * Create a backup of the project
   */
  async createBackup(projectPath: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(this.backupDir, timestamp);

    logger.info("Creating backup...");

    // Copy entire project to backup directory
    await FileSystem.ensureDir(backupPath);

    // Backup critical files
    const filesToBackup = await FileSystem.findFiles(
      ["**/*.{ts,tsx,js,jsx,json,css,md}", "**/.{config,env}*"],
      {
        cwd: projectPath,
        ignore: [
          "**/node_modules/**",
          "**/dist/**",
          "**/.next/**",
          "**/.hopr-backup/**",
        ],
      },
    );

    for (const file of filesToBackup) {
      const srcPath = path.join(projectPath, file);
      const destPath = path.join(backupPath, file);
      await FileSystem.copy(srcPath, destPath);
    }

    logger.success(`Backup created at: ${backupPath}`);
  }

  /**
   * Get rollback instructions
   */
  getRollbackInstructions(): string[] {
    return [
      "To rollback the migration:",
      `1. Delete the current project files`,
      `2. Restore from backup at: ${this.backupDir}`,
      `3. Run: bun install (or your package manager)`,
      "",
      "Or use git to revert changes if you're in a git repository.",
    ];
  }

  /**
   * Check if backups exist
   */
  async hasBackups(): Promise<boolean> {
    if (!(await FileSystem.exists(this.backupDir))) {
      return false;
    }
    return !(await FileSystem.isEmptyDir(this.backupDir));
  }

  /**
   * List all backups
   */
  async listBackups(): Promise<string[]> {
    if (!(await FileSystem.exists(this.backupDir))) {
      return [];
    }
    return await FileSystem.findFiles("*", { cwd: this.backupDir });
  }
}
