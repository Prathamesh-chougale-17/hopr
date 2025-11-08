import fs from "fs-extra";
import path from "path";
import { glob } from "glob";

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read file content
 */
export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, "utf-8");
}

/**
 * Write file content
 */
export async function writeFile(
  filePath: string,
  content: string
): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, "utf-8");
}

/**
 * Copy file
 */
export async function copyFile(
  source: string,
  destination: string
): Promise<void> {
  await fs.ensureDir(path.dirname(destination));
  await fs.copy(source, destination);
}

/**
 * Delete file or directory
 */
export async function remove(filePath: string): Promise<void> {
  await fs.remove(filePath);
}

/**
 * Read JSON file
 */
export async function readJSON<T = unknown>(filePath: string): Promise<T> {
  return fs.readJSON(filePath);
}

/**
 * Write JSON file
 */
export async function writeJSON(
  filePath: string,
  data: unknown
): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeJSON(filePath, data, { spaces: 2 });
}

/**
 * Find files matching pattern
 */
export async function findFiles(
  pattern: string,
  cwd: string
): Promise<string[]> {
  return glob(pattern, {
    cwd,
    absolute: true,
    nodir: true,
    dot: true,
  });
}

/**
 * Get relative path from base
 */
export function getRelativePath(from: string, to: string): string {
  return path.relative(from, to);
}

/**
 * Normalize path separators for cross-platform compatibility
 */
export function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

/**
 * Create backup of directory
 */
export async function createBackup(
  sourceDir: string,
  backupDir: string
): Promise<void> {
  // List of directories and files to exclude from backup
  const excludePatterns = [
    "node_modules",
    ".next",
    "dist",
    "build",
    ".turbo",
    ".git",
    ".hopr-backup",
    "coverage",
    ".cache",
    ".npm",
    ".yarn",
    "pnpm-lock.yaml",
    "package-lock.json",
    "yarn.lock",
    "bun.lockb",
  ];

  await fs.copy(sourceDir, backupDir, {
    filter: (src) => {
      const relativePath = path.relative(sourceDir, src);

      // Don't copy if it matches any exclude pattern
      return !excludePatterns.some(
        (pattern) =>
          relativePath.includes(pattern) || relativePath.startsWith(pattern)
      );
    },
  });
}

/**
 * Check if directory is empty
 */
export async function isDirectoryEmpty(dirPath: string): Promise<boolean> {
  try {
    const files = await fs.readdir(dirPath);
    return files.length === 0;
  } catch {
    return true;
  }
}
