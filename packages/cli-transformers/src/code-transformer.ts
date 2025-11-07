import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { FileSystem } from "@hopr/cli-core";
import { logger } from "@hopr/cli-core";
import prettier from "prettier";

export class CodeTransformer {
  /**
   * Transform root layout file (__root.tsx)
   */
  static async transformRootLayout(filePath: string): Promise<void> {
    logger.info(`Transforming code in: ${filePath}`);

    const content = await FileSystem.readFile(filePath);
    const ast = parse(content, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });

    let hasChanges = false;
    const importsToAdd = new Set<string>();
    const importsToRemove = new Set<string>();

    // Add necessary imports
    importsToAdd.add(
      `import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";`
    );

    traverse(ast, {
      // Remove Next.js Metadata import
      ImportDeclaration(path) {
        const source = path.node.source.value;

        if (source === "next" || source === "next/font/local") {
          importsToRemove.add(path.toString());
          path.remove();
          hasChanges = true;
        }

        // Transform CSS imports to add ?url suffix
        if (source.endsWith(".css")) {
          const newSource = `${source}?url`;
          path.node.source.value = newSource;
          hasChanges = true;
        }
      },

      // Remove metadata export
      ExportNamedDeclaration(path) {
        if (
          path.node.declaration &&
          t.isVariableDeclaration(path.node.declaration)
        ) {
          const declarations = path.node.declaration.declarations;
          for (const decl of declarations) {
            if (t.isIdentifier(decl.id) && decl.id.name === "metadata") {
              path.remove();
              hasChanges = true;
            }
          }
        }
      },
    });

    if (!hasChanges) {
      logger.info("  No automatic changes needed for root layout");
    }

    // Manual transformation guide
    const transformed = `import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TanStack Start App" }
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootLayout,
});

function RootLayout() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
        <TanStackRouterDevtools />
      </body>
    </html>
  );
}
`;

    // Format with prettier
    const formatted = await prettier.format(transformed, {
      parser: "typescript",
      semi: true,
      singleQuote: false,
      trailingComma: "es5",
    });

    await FileSystem.writeFile(filePath, formatted);
    logger.success(`  Transformed root layout`);
  }

  /**
   * Transform route page files (index.tsx, etc.)
   */
  static async transformRoutePage(
    filePath: string,
    routePath: string
  ): Promise<void> {
    logger.info(`Transforming code in: ${filePath}`);

    const content = await FileSystem.readFile(filePath);

    // Simple regex-based transformation for basic cases
    let transformed = content;

    // Add createFileRoute import if not present
    if (!transformed.includes("@tanstack/react-router")) {
      transformed =
        `import { createFileRoute } from "@tanstack/react-router";\n\n` +
        transformed;
    }

    // Transform default export to createFileRoute pattern
    const defaultExportRegex = /export\s+default\s+function\s+(\w+)/;
    const match = transformed.match(defaultExportRegex);

    if (match) {
      const componentName = match[1];
      transformed = transformed.replace(
        defaultExportRegex,
        `export const Route = createFileRoute("${routePath}")({
  component: ${componentName},
});\n\nfunction ${componentName}`
      );
    }

    // Transform Next.js Link to TanStack Link
    transformed = transformed.replace(
      /import\s+Link\s+from\s+["']next\/link["']/g,
      'import { Link } from "@tanstack/react-router"'
    );

    // Transform href to to prop
    transformed = transformed.replace(/\shref=/g, " to=");

    // Transform Next.js Image to regular img
    transformed = transformed.replace(
      /import\s+Image\s+from\s+["']next\/image["']/g,
      "// import Image from 'next/image' // TODO: Replace with <img> or @unpic/react"
    );

    // Format with prettier
    const formatted = await prettier.format(transformed, {
      parser: "typescript",
      semi: true,
      singleQuote: false,
      trailingComma: "es5",
    });

    await FileSystem.writeFile(filePath, formatted);
    logger.success(`  Transformed route page`);
  }

  /**
   * Get route path from file path
   */
  static getRoutePathFromFile(filePath: string): string {
    // Extract route path from file path
    // e.g., src/routes/index.tsx → /
    // e.g., src/routes/about.tsx → /about
    // e.g., src/routes/posts/$id.tsx → /posts/$id

    const routesIndex = filePath.indexOf("/routes/") !== -1
      ? filePath.indexOf("/routes/")
      : filePath.indexOf("\\routes\\");

    if (routesIndex === -1) {
      return "/";
    }

    const afterRoutes = filePath.substring(routesIndex + 8); // "/routes/".length
    let routePath = afterRoutes
      .replace(/\.tsx?$/, "") // Remove extension
      .replace(/\/index$/, "") // Remove /index
      .replace(/\\/g, "/"); // Normalize to forward slashes

    // Handle root index
    if (routePath === "index" || routePath === "") {
      return "/";
    }

    // Ensure leading slash
    if (!routePath.startsWith("/")) {
      routePath = "/" + routePath;
    }

    return routePath;
  }

  /**
   * Update tsconfig.json for TanStack Start
   */
  static async transformTsConfig(projectPath: string): Promise<void> {
    const tsconfigPath = FileSystem.join(projectPath, "tsconfig.json");

    if (!(await FileSystem.exists(tsconfigPath))) {
      logger.warn("tsconfig.json not found");
      return;
    }

    logger.info("Updating tsconfig.json...");

    const content = await FileSystem.readFile(tsconfigPath);
    const tsconfig = JSON.parse(content);

    // Update compiler options
    tsconfig.compilerOptions = tsconfig.compilerOptions || {};

    // Remove Next.js specific options
    if (tsconfig.compilerOptions.plugins) {
      tsconfig.compilerOptions.plugins = tsconfig.compilerOptions.plugins.filter(
        (plugin: any) => plugin.name !== "next"
      );
      if (tsconfig.compilerOptions.plugins.length === 0) {
        delete tsconfig.compilerOptions.plugins;
      }
    }

    // Update for Vite
    tsconfig.compilerOptions.types = tsconfig.compilerOptions.types || [];
    if (!tsconfig.compilerOptions.types.includes("vite/client")) {
      tsconfig.compilerOptions.types.push("vite/client");
    }

    // Remove next-env.d.ts from includes
    if (tsconfig.include) {
      tsconfig.include = tsconfig.include.filter(
        (item: string) => item !== "next-env.d.ts"
      );
    }

    // Update moduleResolution if needed
    if (tsconfig.compilerOptions.moduleResolution === "node") {
      tsconfig.compilerOptions.moduleResolution = "bundler";
    }

    await FileSystem.writeJson(tsconfigPath, tsconfig);
    logger.success("tsconfig.json updated");
  }
}
