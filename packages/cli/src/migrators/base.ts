import { DetectionResult } from "../detectors/types.js";

export interface MigrationOptions {
  dryRun?: boolean;
  skipBackup?: boolean;
  skipInstall?: boolean;
}

export interface MigrationResult {
  success: boolean;
  filesModified: string[];
  filesCreated: string[];
  filesDeleted: string[];
  errors: string[];
  warnings: string[];
}

export abstract class BaseMigrator {
  constructor(
    protected projectPath: string,
    protected detection: DetectionResult,
    protected options: MigrationOptions = {},
  ) {}

  /**
   * Run the migration
   */
  abstract migrate(): Promise<MigrationResult>;

  /**
   * Validate that migration is possible
   */
  abstract validate(): Promise<{ valid: boolean; errors: string[] }>;

  /**
   * Get migration summary
   */
  abstract getSummary(): string[];
}
