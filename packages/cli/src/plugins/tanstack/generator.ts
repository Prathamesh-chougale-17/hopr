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
import { normalizePath } from "../../utils/index.js";

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

  // Files to delete - include old Next.js route files
  const filesToDelete = [
    "next.config.js",
    "next.config.mjs",
    "next.config.ts",
    "postcss.config.js",
    "postcss.config.mjs",
  ];

  // Add original source files to delete list
  for (const route of structure.routes) {
    if (route.sourcePath && !filesToDelete.includes(route.sourcePath)) {
      filesToDelete.push(route.sourcePath);
    }
  }

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
        // TanStack Start uses src/routes/__root.tsx
        targetPath = "src/routes/__root.tsx";
        transformedContent = transformLayoutToRoot(content);
      } else {
        // Nested layouts are not directly supported in the same way
        return null;
      }
      break;
    }

    case "page": {
      // Convert to src/routes/ structure
      targetPath = convertPagePath(pattern, params, isCatchAll);
      const routePath = convertToTanStackRoutePath(pattern, params, isCatchAll);
      transformedContent = transformPageToRoute(content, routePath);
      break;
    }

    case "api": {
      // API routes need special handling
      targetPath = path.join("src/routes/api", normalizePath(pattern) + ".ts");
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
 * All routes go into src/routes/
 */
function convertPagePath(
  pattern: string,
  params: string[] | undefined,
  isCatchAll: boolean | undefined
): string {
  if (pattern === "/") {
    return "src/routes/index.tsx";
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
      ? path.join("src/routes", ...segments, `${fileName}.tsx`)
      : path.join("src/routes", `${fileName}.tsx`);

  return normalizePath(filePath);
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
  return {
    path: "vite.config.ts",
    content: `import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/start/vite'
import viteReact from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
${structure.metadata?.hasTailwind ? "import tailwindcss from '@tailwindcss/vite'\n" : ""}
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    ${structure.metadata?.hasTailwind ? "tailwindcss()," : ""}
    tsconfigPaths(),
    tanstackStart(),
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
    "@tanstack/react-router": "^1.98.0",
    "@tanstack/start": "^1.98.0",
    "@vinxi/react": "^0.2.4",
    react: structure.dependencies["react"] || "^19.0.0",
    "react-dom": structure.dependencies["react-dom"] || "^19.0.0",
    vinxi: "^0.5.3",
  };
}

/**
 * Generate dev dependencies
 */
function generateDevDependencies(
  structure: ProjectStructure
): Record<string, string> {
  const devDeps: Record<string, string> = {
    "@tanstack/router-devtools": "^1.98.0",
    "@tanstack/router-plugin": "^1.98.2",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    vite: "^6.0.7",
    "vite-tsconfig-paths": "^5.1.4",
    typescript: structure.devDependencies["typescript"] || "^5.0.0",
  };

  if (structure.metadata?.hasTailwind) {
    devDeps["@tailwindcss/vite"] = "^4.0.0";
    devDeps["tailwindcss"] = "^4.0.0";
  }

  return devDeps;
}
