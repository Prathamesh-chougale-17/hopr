import path from "path";
import type {
  ProjectStructure,
  TransformedOutput,
  TransformedRoute,
  RouteInfo,
} from "../../types/index.js";
import {
  transformLayoutToRoot,
  transformPageToRoute,
} from "../nextjs/transformers/index.js";
import { logger, normalizePath } from "../../utils/index.js";

/**
 * Transform Next.js structure to TanStack Start
 */
export async function transformToTanStackStart(
  structure: ProjectStructure
): Promise<TransformedOutput> {
  const transformedRoutes: TransformedRoute[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  // Process routes
  for (const route of structure.routes) {
    try {
      const transformed = await transformRoute(route, structure);
      if (transformed) {
        transformedRoutes.push(transformed);
      }
    } catch (error) {
      errors.push(`Failed to transform ${route.sourcePath}: ${error}`);
    }
  }

  // Generate config files
  const configs = [
    generateViteConfig(structure),
    generateRouterConfig(),
    generateTsConfig(structure),
  ];

  // Update dependencies
  const dependencies = generateDependencies(structure);
  const devDependencies = generateDevDependencies(structure);
  const removeDependencies = ["next"];

  // Files to delete
  const filesToDelete = [
    "next.config.js",
    "next.config.mjs",
    "next.config.ts",
    "postcss.config.js",
    "postcss.config.mjs",
  ];

  return {
    framework: "tanstack-start",
    routes: transformedRoutes,
    configs,
    dependencies,
    devDependencies,
    removeDependencies,
    filesToDelete,
    report: {
      totalRoutes: structure.routes.length,
      transformedRoutes: transformedRoutes.length,
      skippedRoutes: structure.routes.length - transformedRoutes.length,
      warnings,
      errors,
    },
  };
}

/**
 * Transform individual route
 */
async function transformRoute(
  route: RouteInfo,
  structure: ProjectStructure
): Promise<TransformedRoute | null> {
  const { type, sourcePath, pattern, params, isCatchAll, content } = route;

  if (!content) return null;

  let targetPath: string;
  let transformedContent: string;

  switch (type) {
    case "layout": {
      // Only transform root layout
      if (pattern === "/") {
        targetPath = path.join(structure.appDir, "__root.tsx");
        transformedContent = transformLayoutToRoot(content);
      } else {
        // Nested layouts are not directly supported in the same way
        return null;
      }
      break;
    }

    case "page": {
      targetPath = convertPagePath(
        pattern,
        params,
        isCatchAll,
        structure.appDir
      );
      const routePath = convertToTanStackRoutePath(pattern, params, isCatchAll);
      transformedContent = transformPageToRoute(content, routePath);
      break;
    }

    case "api": {
      // API routes need special handling
      targetPath = path.join(
        structure.appDir,
        "api",
        normalizePath(pattern) + ".ts"
      );
      transformedContent = transformApiRoute(content);
      break;
    }

    case "error":
    case "loading":
    case "not-found":
      // These need manual implementation in TanStack Start
      return null;

    default:
      return null;
  }

  return {
    targetPath,
    content: transformedContent,
    source: route,
  };
}

/**
 * Convert Next.js page path to TanStack Start path
 */
function convertPagePath(
  pattern: string,
  params: string[] | undefined,
  isCatchAll: boolean | undefined,
  appDir: string
): string {
  if (pattern === "/") {
    return path.join(appDir, "index.tsx");
  }

  let segments = pattern.split("/").filter(Boolean);

  // Handle dynamic segments
  segments = segments.map((segment) => {
    if (segment.startsWith("[...") && segment.endsWith("]")) {
      // Catch-all: [...slug] -> $.tsx
      return "$";
    } else if (segment.startsWith("[") && segment.endsWith("]")) {
      // Dynamic: [slug] -> $slug
      const param = segment.slice(1, -1);
      return `$${param}`;
    }
    return segment;
  });

  const fileName = segments.pop() || "index";
  const filePath =
    segments.length > 0
      ? path.join(appDir, ...segments, `${fileName}.tsx`)
      : path.join(appDir, `${fileName}.tsx`);

  return filePath;
}

/**
 * Convert pattern to TanStack route path string
 */
function convertToTanStackRoutePath(
  pattern: string,
  params: string[] | undefined,
  isCatchAll: boolean | undefined
): string {
  if (pattern === "/") return "/";

  let segments = pattern.split("/").filter(Boolean);

  segments = segments.map((segment) => {
    if (segment.startsWith("[...") && segment.endsWith("]")) {
      return "$";
    } else if (segment.startsWith("[") && segment.endsWith("]")) {
      const param = segment.slice(1, -1);
      return `$${param}`;
    }
    return segment;
  });

  return "/" + segments.join("/");
}

/**
 * Transform API route
 */
function transformApiRoute(content: string): string {
  // Basic transformation - this would need more sophisticated handling
  return `import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/endpoint')({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({ message: 'Hello' })
      }
    }
  }
})
`;
}

/**
 * Generate vite.config.ts
 */
function generateViteConfig(structure: ProjectStructure): {
  path: string;
  content: string;
} {
  const routesDir = structure.useSrc ? "app" : "app";
  const srcDir = structure.useSrc ? "src" : "src";

  return {
    path: "vite.config.ts",
    content: `import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    ${structure.metadata?.hasTailwind ? "tailwindcss()," : ""}
    tsconfigPaths(),
    tanstackStart({
      srcDirectory: '${srcDir}',
      router: {
        routesDirectory: '${routesDir}',
      },
    }),
    viteReact(),
  ],
})
`,
  };
}

/**
 * Generate router.tsx
 */
function generateRouterConfig(): { path: string; content: string } {
  return {
    path: "src/router.tsx",
    content: `import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
  })

  return router
}
`,
  };
}

/**
 * Generate updated tsconfig.json
 */
function generateTsConfig(structure: ProjectStructure): {
  path: string;
  content: string;
} {
  return {
    path: "tsconfig.json",
    content: JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          module: "ESNext",
          skipLibCheck: true,
          moduleResolution: "bundler",
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: "react-jsx",
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
        },
        include: ["src"],
      },
      null,
      2
    ),
  };
}

/**
 * Generate dependencies
 */
function generateDependencies(
  structure: ProjectStructure
): Record<string, string> {
  return {
    "@tanstack/react-router": "^2.0.0",
    "@tanstack/react-start": "^2.0.0",
    react: structure.dependencies["react"] || "^19.0.0",
    "react-dom": structure.dependencies["react-dom"] || "^19.0.0",
  };
}

/**
 * Generate dev dependencies
 */
function generateDevDependencies(
  structure: ProjectStructure
): Record<string, string> {
  const devDeps: Record<string, string> = {
    "@tanstack/react-router-plugin": "^2.0.0",
    "@vitejs/plugin-react": "latest",
    vite: "latest",
    "vite-tsconfig-paths": "latest",
    typescript: structure.devDependencies["typescript"] || "^5.0.0",
  };

  if (structure.metadata?.hasTailwind) {
    devDeps["@tailwindcss/vite"] = "latest";
    devDeps["tailwindcss"] = "latest";
  }

  return devDeps;
}
