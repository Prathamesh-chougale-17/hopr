import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NextJsDetector } from "@cli/detectors/nextjs";
import path from "path";
import fs from "fs-extra";
import os from "os";

describe("NextJsDetector", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `hopr-test-nextjs-${Date.now()}`);
    await fs.ensureDir(tempDir);
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe("detect", () => {
    it("should detect Next.js project", async () => {
      const packageJson = {
        dependencies: { next: "^16.0.0" },
      };
      await fs.writeJson(path.join(tempDir, "package.json"), packageJson);

      const result = await NextJsDetector.detect(tempDir);
      expect(result).toBe(true);
    });

    it("should detect Next.js in devDependencies", async () => {
      const packageJson = {
        devDependencies: { next: "^16.0.0" },
      };
      await fs.writeJson(path.join(tempDir, "package.json"), packageJson);

      const result = await NextJsDetector.detect(tempDir);
      expect(result).toBe(true);
    });

    it("should return false for non-Next.js project", async () => {
      const packageJson = {
        dependencies: { react: "^19.2.0" },
      };
      await fs.writeJson(path.join(tempDir, "package.json"), packageJson);

      const result = await NextJsDetector.detect(tempDir);
      expect(result).toBe(false);
    });

    it("should return false if package.json does not exist", async () => {
      const result = await NextJsDetector.detect(tempDir);
      expect(result).toBe(false);
    });
  });

  describe("analyzeStructure", () => {
    it("should analyze App Router structure", async () => {
      await fs.ensureDir(path.join(tempDir, "app"));
      await fs.writeFile(path.join(tempDir, "next.config.js"), "");
      await fs.writeJson(path.join(tempDir, "package.json"), {});

      const structure = await NextJsDetector.analyzeStructure(tempDir);

      expect(structure.hasAppFolder).toBe(true);
      expect(structure.hasSrcFolder).toBe(false);
      expect(structure.hasNextConfig).toBe(true);
      expect(structure.hasPagesFolder).toBe(false);
    });

    it("should analyze src/app structure", async () => {
      await fs.ensureDir(path.join(tempDir, "src", "app"));
      await fs.writeJson(path.join(tempDir, "package.json"), {});

      const structure = await NextJsDetector.analyzeStructure(tempDir);

      expect(structure.hasSrcFolder).toBe(true);
      expect(structure.hasAppFolderInSrc).toBe(true);
    });

    it("should detect Pages Router", async () => {
      await fs.ensureDir(path.join(tempDir, "pages"));
      await fs.writeJson(path.join(tempDir, "package.json"), {});

      const structure = await NextJsDetector.analyzeStructure(tempDir);

      expect(structure.hasPagesFolder).toBe(true);
      expect(structure.hasAppFolder).toBe(false);
    });

    it("should detect vite.config files", async () => {
      await fs.writeFile(path.join(tempDir, "vite.config.ts"), "");
      await fs.writeJson(path.join(tempDir, "package.json"), {});

      const structure = await NextJsDetector.analyzeStructure(tempDir);

      expect(structure.hasViteConfig).toBe(true);
    });
  });

  describe("isAppRouter", () => {
    it("should return true for App Router project", async () => {
      await fs.ensureDir(path.join(tempDir, "app"));

      const result = await NextJsDetector.isAppRouter(tempDir);
      expect(result).toBe(true);
    });

    it("should return true for src/app structure", async () => {
      await fs.ensureDir(path.join(tempDir, "src", "app"));

      const result = await NextJsDetector.isAppRouter(tempDir);
      expect(result).toBe(true);
    });

    it("should return false for Pages Router", async () => {
      await fs.ensureDir(path.join(tempDir, "pages"));

      const result = await NextJsDetector.isAppRouter(tempDir);
      expect(result).toBe(false);
    });
  });

  describe("isPagesRouter", () => {
    it("should return true for Pages Router project", async () => {
      await fs.ensureDir(path.join(tempDir, "pages"));

      const result = await NextJsDetector.isPagesRouter(tempDir);
      expect(result).toBe(true);
    });

    it("should return true for src/pages structure", async () => {
      await fs.ensureDir(path.join(tempDir, "src", "pages"));

      const result = await NextJsDetector.isPagesRouter(tempDir);
      expect(result).toBe(true);
    });

    it("should return false for App Router", async () => {
      await fs.ensureDir(path.join(tempDir, "app"));

      const result = await NextJsDetector.isPagesRouter(tempDir);
      expect(result).toBe(false);
    });
  });
});
