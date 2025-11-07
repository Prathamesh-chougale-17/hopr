import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PackageTransformer } from '@cli/transformers/package-transformer';
import { FileSystem } from '@cli/utils/file-system';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';

describe('PackageTransformer', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `hopr-test-pkg-${Date.now()}`);
    await fs.ensureDir(tempDir);
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('transformForTanStackStart', () => {
    it('should update package.json for TanStack Start', async () => {
      const originalPackageJson = {
        name: 'test-app',
        version: '1.0.0',
        dependencies: {
          next: '^16.0.0',
          react: '^19.2.0',
          '@tailwindcss/postcss': '^4.0.0',
        },
        devDependencies: {
          typescript: '^5.0.0',
        },
        scripts: {
          dev: 'next dev --port 3000',
          build: 'next build',
        },
      };

      await fs.writeJson(path.join(tempDir, 'package.json'), originalPackageJson);

      const transformer = new PackageTransformer(tempDir, 'npm');
      await transformer.transformForTanStackStart();

      const updatedPackageJson = await fs.readJson(path.join(tempDir, 'package.json'));

      // Check removed dependencies
      expect(updatedPackageJson.dependencies.next).toBeUndefined();
      expect(updatedPackageJson.dependencies['@tailwindcss/postcss']).toBeUndefined();

      // Check added dependencies
      expect(updatedPackageJson.dependencies['@tanstack/react-start']).toBeDefined();
      expect(updatedPackageJson.dependencies['@tanstack/react-router']).toBeDefined();

      // Check added dev dependencies
      expect(updatedPackageJson.devDependencies.vite).toBeDefined();
      expect(updatedPackageJson.devDependencies['@vitejs/plugin-react']).toBeDefined();

      // Check updated scripts
      expect(updatedPackageJson.scripts.dev).toBe('vite dev --port 3000');
      expect(updatedPackageJson.scripts.build).toBe('vite build');
      expect(updatedPackageJson.scripts.serve).toBe('vite preview');

      // Check type: module
      expect(updatedPackageJson.type).toBe('module');
    });

    it('should preserve port number in dev script', async () => {
      const packageJson = {
        scripts: {
          dev: 'next dev --port 3001',
        },
      };

      await fs.writeJson(path.join(tempDir, 'package.json'), packageJson);

      const transformer = new PackageTransformer(tempDir, 'npm');
      await transformer.transformForTanStackStart();

      const updated = await fs.readJson(path.join(tempDir, 'package.json'));
      expect(updated.scripts.dev).toBe('vite dev --port 3001');
    });

    it('should use default port 3000 if not specified', async () => {
      const packageJson = {
        scripts: {
          dev: 'next dev',
        },
      };

      await fs.writeJson(path.join(tempDir, 'package.json'), packageJson);

      const transformer = new PackageTransformer(tempDir, 'npm');
      await transformer.transformForTanStackStart();

      const updated = await fs.readJson(path.join(tempDir, 'package.json'));
      expect(updated.scripts.dev).toBe('vite dev --port 3000');
    });

    it('should preserve existing lint and check-types scripts', async () => {
      const packageJson = {
        scripts: {
          lint: 'eslint . --custom-flag',
          'check-types': 'tsc --custom-option',
        },
      };

      await fs.writeJson(path.join(tempDir, 'package.json'), packageJson);

      const transformer = new PackageTransformer(tempDir, 'npm');
      await transformer.transformForTanStackStart();

      const updated = await fs.readJson(path.join(tempDir, 'package.json'));
      expect(updated.scripts.lint).toBe('eslint . --custom-flag');
      expect(updated.scripts['check-types']).toBe('tsc --custom-option');
    });
  });

  describe('getInstallCommand', () => {
    it('should return correct command for npm', () => {
      const transformer = new PackageTransformer(tempDir, 'npm');
      expect(transformer.getInstallCommand()).toBe('npm install');
    });

    it('should return correct command for bun', () => {
      const transformer = new PackageTransformer(tempDir, 'bun');
      expect(transformer.getInstallCommand()).toBe('bun install');
    });

    it('should return correct command for pnpm', () => {
      const transformer = new PackageTransformer(tempDir, 'pnpm');
      expect(transformer.getInstallCommand()).toBe('pnpm install');
    });

    it('should return correct command for yarn', () => {
      const transformer = new PackageTransformer(tempDir, 'yarn');
      expect(transformer.getInstallCommand()).toBe('yarn install');
    });
  });

  describe('getUninstallCommand', () => {
    it('should return correct uninstall command for npm', () => {
      const transformer = new PackageTransformer(tempDir, 'npm');
      expect(transformer.getUninstallCommand(['next', 'package2'])).toBe(
        'npm uninstall next package2'
      );
    });

    it('should return correct uninstall command for bun', () => {
      const transformer = new PackageTransformer(tempDir, 'bun');
      expect(transformer.getUninstallCommand(['next'])).toBe('bun remove next');
    });

    it('should return correct uninstall command for pnpm', () => {
      const transformer = new PackageTransformer(tempDir, 'pnpm');
      expect(transformer.getUninstallCommand(['next'])).toBe('pnpm remove next');
    });

    it('should return correct uninstall command for yarn', () => {
      const transformer = new PackageTransformer(tempDir, 'yarn');
      expect(transformer.getUninstallCommand(['next'])).toBe('yarn remove next');
    });
  });

  describe('getAddCommand', () => {
    it('should return correct add command for npm', () => {
      const transformer = new PackageTransformer(tempDir, 'npm');
      expect(transformer.getAddCommand(['vite', 'react'])).toBe('npm install vite react');
      expect(transformer.getAddCommand(['typescript'], true)).toBe(
        'npm install -D typescript'
      );
    });

    it('should return correct add command for bun', () => {
      const transformer = new PackageTransformer(tempDir, 'bun');
      expect(transformer.getAddCommand(['vite'])).toBe('bun add vite');
      expect(transformer.getAddCommand(['typescript'], true)).toBe('bun add -D typescript');
    });

    it('should return correct add command for pnpm', () => {
      const transformer = new PackageTransformer(tempDir, 'pnpm');
      expect(transformer.getAddCommand(['vite'])).toBe('pnpm add vite');
      expect(transformer.getAddCommand(['typescript'], true)).toBe('pnpm add -D typescript');
    });

    it('should return correct add command for yarn', () => {
      const transformer = new PackageTransformer(tempDir, 'yarn');
      expect(transformer.getAddCommand(['vite'])).toBe('yarn add vite');
      expect(transformer.getAddCommand(['typescript'], true)).toBe(
        'yarn add --dev typescript'
      );
    });
  });
});
