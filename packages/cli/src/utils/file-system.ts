import fs from "fs-extra";
import path from "path";
import { glob } from "fast-glob";

export class FileSystem {
  /**
   * Check if a file exists
   */
  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Read a file as string
   */
  static async readFile(filePath: string): Promise<string> {
    return await fs.readFile(filePath, "utf-8");
  }

  /**
   * Write content to a file
   */
  static async writeFile(filePath: string, content: string): Promise<void> {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, "utf-8");
  }

  /**
   * Read and parse JSON file
   */
  static async readJson<T = any>(filePath: string): Promise<T> {
    return await fs.readJson(filePath);
  }

  /**
   * Write JSON to file with formatting
   */
  static async writeJson(filePath: string, data: any): Promise<void> {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeJson(filePath, data, { spaces: 2 });
  }

  /**
   * Copy a file or directory
   */
  static async copy(src: string, dest: string): Promise<void> {
    await fs.copy(src, dest);
  }

  /**
   * Move a file or directory
   */
  static async move(src: string, dest: string): Promise<void> {
    await fs.ensureDir(path.dirname(dest));
    await fs.move(src, dest, { overwrite: true });
  }

  /**
   * Remove a file or directory
   */
  static async remove(filePath: string): Promise<void> {
    await fs.remove(filePath);
  }

  /**
   * Find files matching glob patterns
   */
  static async findFiles(
    patterns: string | string[],
    options?: { cwd?: string; ignore?: string[] }
  ): Promise<string[]> {
    const defaultIgnore = ["**/node_modules/**", "**/dist/**", "**/.next/**"];
    const ignorePatterns = options?.ignore
      ? [...defaultIgnore, ...options.ignore]
      : defaultIgnore;

    return await glob(patterns, {
      cwd: options?.cwd,
      ignore: ignorePatterns,
      absolute: false,
    });
  }

  /**
   * Check if directory is empty
   */
  static async isEmptyDir(dirPath: string): Promise<boolean> {
    const files = await fs.readdir(dirPath);
    return files.length === 0;
  }

  /**
   * Ensure directory exists
   */
  static async ensureDir(dirPath: string): Promise<void> {
    await fs.ensureDir(dirPath);
  }

  /**
   * Check if path is a directory
   */
  static async isDirectory(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Get file extension
   */
  static getExtension(filePath: string): string {
    return path.extname(filePath);
  }

  /**
   * Join paths
   */
  static join(...paths: string[]): string {
    return path.join(...paths);
  }

  /**
   * Resolve absolute path
   */
  static resolve(...paths: string[]): string {
    return path.resolve(...paths);
  }

  /**
   * Get directory name
   */
  static dirname(filePath: string): string {
    return path.dirname(filePath);
  }

  /**
   * Get base name
   */
  static basename(filePath: string, ext?: string): string {
    return path.basename(filePath, ext);
  }
}
