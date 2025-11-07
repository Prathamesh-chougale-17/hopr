import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FrameworkDetector } from '@cli/detectors';
import { FileSystem } from '@cli/utils/file-system';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';

describe('FrameworkDetector', () => {
  let tempDir: string;

  beforeEach(async () => {
    // Create a temporary directory for testing
    tempDir = path.join(os.tmpdir(), `hopr-test-${Date.now()}`);
    await fs.ensureDir(tempDir);
  });

  afterEach(async () => {
    // Clean up temporary directory
    await fs.remove(tempDir);
  });

  describe('detectPackageManager', () => {
    it('should detect bun from bun.lockb', async () => {
      await fs.writeFile(path.join(tempDir, 'bun.lockb'), '');
      const pm = await FrameworkDetector.detectPackageManager(tempDir);
      expect(pm).toBe('bun');
    });

    it('should detect pnpm from pnpm-lock.yaml', async () => {
      await fs.writeFile(path.join(tempDir, 'pnpm-lock.yaml'), '');
      const pm = await FrameworkDetector.detectPackageManager(tempDir);
      expect(pm).toBe('pnpm');
    });

    it('should detect yarn from yarn.lock', async () => {
      await fs.writeFile(path.join(tempDir, 'yarn.lock'), '');
      const pm = await FrameworkDetector.detectPackageManager(tempDir);
      expect(pm).toBe('yarn');
    });

    it('should detect npm from package-lock.json', async () => {
      await fs.writeFile(path.join(tempDir, 'package-lock.json'), '');
      const pm = await FrameworkDetector.detectPackageManager(tempDir);
      expect(pm).toBe('npm');
    });

    it('should default to npm if no lockfile found', async () => {
      const pm = await FrameworkDetector.detectPackageManager(tempDir);
      expect(pm).toBe('npm');
    });
  });

  describe('detectFramework', () => {
    it('should detect Next.js from dependencies', async () => {
      const packageJson = {
        dependencies: {
          next: '^16.0.0',
          react: '^19.2.0',
        },
      };
      await fs.writeJson(path.join(tempDir, 'package.json'), packageJson);

      const framework = await FrameworkDetector.detectFramework(tempDir);
      expect(framework).toBe('nextjs');
    });

    it('should detect TanStack Start from dependencies', async () => {
      const packageJson = {
        dependencies: {
          '@tanstack/react-start': '^1.0.0',
          react: '^19.2.0',
        },
      };
      await fs.writeJson(path.join(tempDir, 'package.json'), packageJson);

      const framework = await FrameworkDetector.detectFramework(tempDir);
      expect(framework).toBe('tanstack-start');
    });

    it('should detect Remix from dependencies', async () => {
      const packageJson = {
        dependencies: {
          '@remix-run/react': '^2.0.0',
        },
      };
      await fs.writeJson(path.join(tempDir, 'package.json'), packageJson);

      const framework = await FrameworkDetector.detectFramework(tempDir);
      expect(framework).toBe('remix');
    });

    it('should detect SvelteKit from dependencies', async () => {
      const packageJson = {
        dependencies: {
          '@sveltejs/kit': '^2.0.0',
        },
      };
      await fs.writeJson(path.join(tempDir, 'package.json'), packageJson);

      const framework = await FrameworkDetector.detectFramework(tempDir);
      expect(framework).toBe('sveltekit');
    });

    it('should return unknown for unrecognized frameworks', async () => {
      const packageJson = {
        dependencies: {
          react: '^19.2.0',
        },
      };
      await fs.writeJson(path.join(tempDir, 'package.json'), packageJson);

      const framework = await FrameworkDetector.detectFramework(tempDir);
      expect(framework).toBe('unknown');
    });

    it('should return unknown if package.json does not exist', async () => {
      const framework = await FrameworkDetector.detectFramework(tempDir);
      expect(framework).toBe('unknown');
    });
  });

  describe('detect', () => {
    it('should provide complete detection results', async () => {
      // Create a Next.js project structure
      const packageJson = {
        dependencies: {
          next: '^16.0.0',
          react: '^19.2.0',
        },
      };
      await fs.writeJson(path.join(tempDir, 'package.json'), packageJson);
      await fs.writeFile(path.join(tempDir, 'bun.lockb'), '');
      await fs.ensureDir(path.join(tempDir, 'app'));

      const result = await FrameworkDetector.detect(tempDir);

      expect(result.framework).toBe('nextjs');
      expect(result.packageManager).toBe('bun');
      expect(result.rootPath).toBe(tempDir);
      expect(result.structure.hasAppFolder).toBe(true);
      expect(result.structure.hasSrcFolder).toBe(false);
    });

    it('should detect src folder structure', async () => {
      const packageJson = {
        dependencies: {
          next: '^16.0.0',
        },
      };
      await fs.writeJson(path.join(tempDir, 'package.json'), packageJson);
      await fs.ensureDir(path.join(tempDir, 'src', 'app'));

      const result = await FrameworkDetector.detect(tempDir);

      expect(result.structure.hasSrcFolder).toBe(true);
      expect(result.structure.hasAppFolderInSrc).toBe(true);
    });
  });
});
