import path from "path";
import { FileSystem } from "../utils/file-system.js";
import { logger } from "../utils/logger.js";
import prettier from "prettier";

export class ConfigTransformer {
  constructor(private projectPath: string) {}

  /**
   * Create vite.config.ts
   */
  async createViteConfig(): Promise<void> {
    const viteConfigPath = path.join(this.projectPath, "vite.config.ts");

    logger.info("Creating vite.config.ts...");

    const content = `import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";

export default defineConfig({
  plugins: [
    nitroV2Plugin(),
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart({
      srcDirectory: "src",
      router: {
        routesDirectory: "routes",
      },
    }),
    viteReact(),
  ],
});
`;

    const formatted = await prettier.format(content, {
      parser: "typescript",
      semi: true,
      singleQuote: false,
      trailingComma: "es5",
    });

    await FileSystem.writeFile(viteConfigPath, formatted);
    logger.success("vite.config.ts created");
  }

  /**
   * Create src/router.tsx
   */
  async createRouterConfig(): Promise<void> {
    const hasSrc = await FileSystem.exists(path.join(this.projectPath, "src"));
    const routerPath = hasSrc
      ? path.join(this.projectPath, "src", "router.tsx")
      : path.join(this.projectPath, "router.tsx");

    logger.info("Creating router.tsx...");

    const content = `import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
`;

    const formatted = await prettier.format(content, {
      parser: "typescript",
      semi: true,
      singleQuote: false,
      trailingComma: "es5",
    });

    await FileSystem.writeFile(routerPath, formatted);
    logger.success("router.tsx created");
  }

  /**
   * Create or update tailwind.config.ts
   */
  async createTailwindConfig(): Promise<void> {
    const tailwindConfigPath = path.join(this.projectPath, "tailwind.config.ts");

    // Only create if it doesn't exist
    if (await FileSystem.exists(tailwindConfigPath)) {
      logger.info("tailwind.config.ts already exists, skipping");
      return;
    }

    logger.info("Creating tailwind.config.ts...");

    const content = `import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
`;

    const formatted = await prettier.format(content, {
      parser: "typescript",
      semi: true,
      singleQuote: false,
      trailingComma: "es5",
    });

    await FileSystem.writeFile(tailwindConfigPath, formatted);
    logger.success("tailwind.config.ts created");
  }

  /**
   * Create .gitignore entries for TanStack Start
   */
  async updateGitignore(): Promise<void> {
    const gitignorePath = path.join(this.projectPath, ".gitignore");

    if (!(await FileSystem.exists(gitignorePath))) {
      logger.info("No .gitignore found, skipping");
      return;
    }

    logger.info("Updating .gitignore...");

    let content = await FileSystem.readFile(gitignorePath);

    // Remove Next.js specific entries
    content = content.replace(/^\.next\/?.*$/gm, "");

    // Add TanStack Start specific entries
    const entriesToAdd = [".output", ".vinxi", "routeTree.gen.ts"];

    for (const entry of entriesToAdd) {
      if (!content.includes(entry)) {
        content += `\n${entry}`;
      }
    }

    // Clean up multiple newlines
    content = content.replace(/\n{3,}/g, "\n\n").trim() + "\n";

    await FileSystem.writeFile(gitignorePath, content);
    logger.success(".gitignore updated");
  }

  /**
   * Rename globals.css to styles.css
   */
  async renameGlobalCss(): Promise<void> {
    const possiblePaths = [
      path.join(this.projectPath, "src", "app", "globals.css"),
      path.join(this.projectPath, "src", "globals.css"),
      path.join(this.projectPath, "app", "globals.css"),
    ];

    for (const cssPath of possiblePaths) {
      if (await FileSystem.exists(cssPath)) {
        const newPath = path.join(
          this.projectPath,
          "src",
          "styles.css"
        );

        logger.info(`Renaming globals.css to styles.css`);
        await FileSystem.move(cssPath, newPath);
        return;
      }
    }

    logger.info("No globals.css found to rename");
  }
}
