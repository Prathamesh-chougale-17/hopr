import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileSystem } from 'hopr/utils/file-system';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';

describe('FileSystem', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `hopr-test-fs-${Date.now()}`);
    await fs.ensureDir(tempDir);
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('exists', () => {
    it('should return true for existing file', async () => {
      const filePath = path.join(tempDir, 'test.txt');
      await fs.writeFile(filePath, 'content');

      const exists = await FileSystem.exists(filePath);
      expect(exists).toBe(true);
    });

    it('should return false for non-existing file', async () => {
      const filePath = path.join(tempDir, 'nonexistent.txt');

      const exists = await FileSystem.exists(filePath);
      expect(exists).toBe(false);
    });

    it('should return true for existing directory', async () => {
      const dirPath = path.join(tempDir, 'testdir');
      await fs.ensureDir(dirPath);

      const exists = await FileSystem.exists(dirPath);
      expect(exists).toBe(true);
    });
  });

  describe('readFile and writeFile', () => {
    it('should write and read file content', async () => {
      const filePath = path.join(tempDir, 'test.txt');
      const content = 'Hello, World!';

      await FileSystem.writeFile(filePath, content);
      const readContent = await FileSystem.readFile(filePath);

      expect(readContent).toBe(content);
    });

    it('should create parent directories when writing', async () => {
      const filePath = path.join(tempDir, 'nested', 'deep', 'file.txt');
      const content = 'nested content';

      await FileSystem.writeFile(filePath, content);
      const readContent = await FileSystem.readFile(filePath);

      expect(readContent).toBe(content);
      expect(await FileSystem.exists(path.join(tempDir, 'nested', 'deep'))).toBe(true);
    });
  });

  describe('readJson and writeJson', () => {
    it('should write and read JSON', async () => {
      const filePath = path.join(tempDir, 'data.json');
      const data = { name: 'test', value: 42, nested: { key: 'value' } };

      await FileSystem.writeJson(filePath, data);
      const readData = await FileSystem.readJson(filePath);

      expect(readData).toEqual(data);
    });

    it('should format JSON with proper indentation', async () => {
      const filePath = path.join(tempDir, 'formatted.json');
      const data = { key: 'value' };

      await FileSystem.writeJson(filePath, data);
      const content = await fs.readFile(filePath, 'utf-8');

      expect(content).toContain('\n');
      expect(content).toContain('  '); // 2 spaces indentation
    });
  });

  describe('copy', () => {
    it('should copy file', async () => {
      const srcPath = path.join(tempDir, 'source.txt');
      const destPath = path.join(tempDir, 'dest.txt');
      const content = 'copy me';

      await fs.writeFile(srcPath, content);
      await FileSystem.copy(srcPath, destPath);

      const destContent = await fs.readFile(destPath, 'utf-8');
      expect(destContent).toBe(content);
    });

    it('should copy directory recursively', async () => {
      const srcDir = path.join(tempDir, 'srcdir');
      const destDir = path.join(tempDir, 'destdir');

      await fs.ensureDir(srcDir);
      await fs.writeFile(path.join(srcDir, 'file1.txt'), 'content1');
      await fs.ensureDir(path.join(srcDir, 'nested'));
      await fs.writeFile(path.join(srcDir, 'nested', 'file2.txt'), 'content2');

      await FileSystem.copy(srcDir, destDir);

      expect(await FileSystem.exists(path.join(destDir, 'file1.txt'))).toBe(true);
      expect(await FileSystem.exists(path.join(destDir, 'nested', 'file2.txt'))).toBe(true);
    });
  });

  describe('move', () => {
    it('should move file', async () => {
      const srcPath = path.join(tempDir, 'source.txt');
      const destPath = path.join(tempDir, 'dest.txt');
      const content = 'move me';

      await fs.writeFile(srcPath, content);
      await FileSystem.move(srcPath, destPath);

      expect(await FileSystem.exists(srcPath)).toBe(false);
      expect(await FileSystem.exists(destPath)).toBe(true);

      const destContent = await fs.readFile(destPath, 'utf-8');
      expect(destContent).toBe(content);
    });

    it('should create parent directories when moving', async () => {
      const srcPath = path.join(tempDir, 'source.txt');
      const destPath = path.join(tempDir, 'nested', 'deep', 'dest.txt');

      await fs.writeFile(srcPath, 'content');
      await FileSystem.move(srcPath, destPath);

      expect(await FileSystem.exists(destPath)).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove file', async () => {
      const filePath = path.join(tempDir, 'remove.txt');
      await fs.writeFile(filePath, 'content');

      await FileSystem.remove(filePath);

      expect(await FileSystem.exists(filePath)).toBe(false);
    });

    it('should remove directory recursively', async () => {
      const dirPath = path.join(tempDir, 'removedir');
      await fs.ensureDir(dirPath);
      await fs.writeFile(path.join(dirPath, 'file.txt'), 'content');

      await FileSystem.remove(dirPath);

      expect(await FileSystem.exists(dirPath)).toBe(false);
    });
  });

  describe('findFiles', () => {
    beforeEach(async () => {
      // Create test file structure
      await fs.writeFile(path.join(tempDir, 'file1.ts'), '');
      await fs.writeFile(path.join(tempDir, 'file2.js'), '');
      await fs.ensureDir(path.join(tempDir, 'src'));
      await fs.writeFile(path.join(tempDir, 'src', 'index.ts'), '');
      await fs.writeFile(path.join(tempDir, 'src', 'utils.ts'), '');
      await fs.ensureDir(path.join(tempDir, 'node_modules'));
      await fs.writeFile(path.join(tempDir, 'node_modules', 'dep.ts'), '');
    });

    it('should find files by pattern', async () => {
      const files = await FileSystem.findFiles('**/*.ts', { cwd: tempDir });

      expect(files).toHaveLength(3);
      expect(files).toContain('file1.ts');
      expect(files).toContain('src/index.ts');
      expect(files).toContain('src/utils.ts');
    });

    it('should ignore node_modules by default', async () => {
      const files = await FileSystem.findFiles('**/*.ts', { cwd: tempDir });

      expect(files).not.toContain('node_modules/dep.ts');
    });

    it('should support custom ignore patterns', async () => {
      const files = await FileSystem.findFiles('**/*.ts', {
        cwd: tempDir,
        ignore: ['**/src/**'],
      });

      expect(files).toHaveLength(1);
      expect(files).toContain('file1.ts');
    });
  });

  describe('isDirectory', () => {
    it('should return true for directory', async () => {
      const dirPath = path.join(tempDir, 'testdir');
      await fs.ensureDir(dirPath);

      const isDir = await FileSystem.isDirectory(dirPath);
      expect(isDir).toBe(true);
    });

    it('should return false for file', async () => {
      const filePath = path.join(tempDir, 'file.txt');
      await fs.writeFile(filePath, 'content');

      const isDir = await FileSystem.isDirectory(filePath);
      expect(isDir).toBe(false);
    });

    it('should return false for non-existent path', async () => {
      const nonExistentPath = path.join(tempDir, 'nonexistent');

      const isDir = await FileSystem.isDirectory(nonExistentPath);
      expect(isDir).toBe(false);
    });
  });

  describe('path utilities', () => {
    it('getExtension should return file extension', () => {
      expect(FileSystem.getExtension('file.ts')).toBe('.ts');
      expect(FileSystem.getExtension('file.test.ts')).toBe('.ts');
      expect(FileSystem.getExtension('noext')).toBe('');
    });

    it('join should join paths correctly', () => {
      const joined = FileSystem.join('a', 'b', 'c.txt');
      expect(joined).toBe(path.join('a', 'b', 'c.txt'));
    });

    it('dirname should return directory name', () => {
      const dir = FileSystem.dirname('/path/to/file.txt');
      expect(dir).toBe(path.dirname('/path/to/file.txt'));
    });

    it('basename should return base name', () => {
      expect(FileSystem.basename('/path/to/file.txt')).toBe('file.txt');
      expect(FileSystem.basename('/path/to/file.txt', '.txt')).toBe('file');
    });
  });
});
