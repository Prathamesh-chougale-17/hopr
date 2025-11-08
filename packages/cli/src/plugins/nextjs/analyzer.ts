import path from "path";
import {
  fileExists,
  readJSON,
  findFiles,
  normalizePath,
  readFile,
} from "../../utils/index.js";
import { detectPackageManager } from "../../utils/package-manager.js";
import type { ProjectStructure, RouteInfo } from "../../types/index.js";
import { usesSrcDirectory } from "./detector.js";

/**
 * Analyze Next.js project structure
 */
export async function analyzeNextJsProject(
  projectPath: string,
): Promise<ProjectStructure> {
  const useSrc = await usesSrcDirectory(projectPath);
  const appDir = useSrc
    ? path.join(projectPath, "src", "app")
    : path.join(projectPath, "app");
  const publicDir = path.join(projectPath, "public");

  // Read package.json
  const packageJsonPath = path.join(projectPath, "package.json");
  const packageJson = await readJSON<{
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  }>(packageJsonPath);

  // Detect package manager
  const packageManager = await detectPackageManager(projectPath);

  // Find all routes
  const routes = await findRoutes(appDir, projectPath);

  // Detect metadata - Check for Tailwind v4 in package.json instead of config files
  const hasTailwind =
    Boolean(packageJson.dependencies?.tailwindcss) ||
    Boolean(packageJson.devDependencies?.tailwindcss);

  const hasTypescript = await fileExists(
    path.join(projectPath, "tsconfig.json"),
  );

  const hasMiddleware =
    (await fileExists(path.join(projectPath, "middleware.ts"))) ||
    (await fileExists(path.join(projectPath, "middleware.js"))) ||
    (await fileExists(path.join(projectPath, "src", "middleware.ts"))) ||
    (await fileExists(path.join(projectPath, "src", "middleware.js")));

  return {
    rootDir: projectPath,
    framework: "nextjs",
    useSrc,
    appDir: useSrc ? "src/app" : "app",
    publicDir: (await fileExists(publicDir)) ? "public" : undefined,
    routes,
    dependencies: packageJson.dependencies || {},
    devDependencies: packageJson.devDependencies || {},
    packageManager,
    metadata: {
      hasTailwind,
      hasTypescript,
      hasMiddleware,
    },
  };
}

/**
 * Find all routes in Next.js app directory
 */
async function findRoutes(
  appDir: string,
  projectRoot: string,
): Promise<RouteInfo[]> {
  const routes: RouteInfo[] = [];

  // Find all route files
  const patterns = [
    "**/page.{ts,tsx,js,jsx}",
    "**/layout.{ts,tsx,js,jsx}",
    "**/error.{ts,tsx,js,jsx}",
    "**/loading.{ts,tsx,js,jsx}",
    "**/not-found.{ts,tsx,js,jsx}",
    "**/route.{ts,js}", // API routes
  ];

  for (const pattern of patterns) {
    const files = await findFiles(pattern, appDir);

    for (const file of files) {
      const routeInfo = await analyzeRouteFile(file, appDir, projectRoot);
      if (routeInfo) {
        routes.push(routeInfo);
      }
    }
  }

  return routes;
}

/**
 * Analyze individual route file
 */
async function analyzeRouteFile(
  filePath: string,
  appDir: string,
  projectRoot: string,
): Promise<RouteInfo | null> {
  try {
    const relativePath = path.relative(appDir, filePath);
    const fileName = path.basename(filePath);
    const dirPath = path.dirname(relativePath);

    // Determine route type
    let type: RouteInfo["type"];
    if (fileName.startsWith("page.")) type = "page";
    else if (fileName.startsWith("layout.")) type = "layout";
    else if (fileName.startsWith("error.")) type = "error";
    else if (fileName.startsWith("loading.")) type = "loading";
    else if (fileName.startsWith("not-found.")) type = "not-found";
    else if (fileName.startsWith("route.")) type = "api";
    else return null;

    // Build route pattern
    const pattern = dirPath === "." ? "/" : `/${normalizePath(dirPath)}`;

    // Extract dynamic params
    const params: string[] = [];
    let isCatchAll = false;

    const segments = pattern.split("/").filter(Boolean);
    for (const segment of segments) {
      if (segment.startsWith("[...") && segment.endsWith("]")) {
        // Catch-all route
        isCatchAll = true;
        params.push(segment.slice(4, -1));
      } else if (segment.startsWith("[") && segment.endsWith("]")) {
        // Dynamic route
        params.push(segment.slice(1, -1));
      }
    }

    // Read file content
    const content = await readFile(filePath);

    return {
      sourcePath: path.relative(projectRoot, filePath),
      pattern,
      type,
      params: params.length > 0 ? params : undefined,
      isCatchAll,
      content,
    };
  } catch (error) {
    console.error(`Error analyzing route file ${filePath}:`, error);
    return null;
  }
}
