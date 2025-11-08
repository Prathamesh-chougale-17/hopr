import whichPm from "which-pm";

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

/**
 * Detect package manager used in project
 */
export async function detectPackageManager(
  projectPath: string,
): Promise<PackageManager> {
  try {
    const result = await whichPm(projectPath);
    if (result?.name) {
      return result.name as PackageManager;
    }
  } catch {
    // Fall through to default
  }
  return "npm";
}

/**
 * Get install command for package manager
 */
export function getInstallCommand(pm: PackageManager): string {
  switch (pm) {
    case "npm":
      return "npm install";
    case "yarn":
      return "yarn install";
    case "pnpm":
      return "pnpm install";
    case "bun":
      return "bun install";
  }
}

/**
 * Get add package command
 */
export function getAddCommand(pm: PackageManager, dev = false): string {
  const devFlag = dev ? "-D" : "";
  switch (pm) {
    case "npm":
      return `npm install ${dev ? "--save-dev" : ""}`;
    case "yarn":
      return `yarn add ${devFlag}`;
    case "pnpm":
      return `pnpm add ${devFlag}`;
    case "bun":
      return `bun add ${devFlag}`;
  }
}

/**
 * Get remove package command
 */
export function getRemoveCommand(pm: PackageManager): string {
  switch (pm) {
    case "npm":
      return "npm uninstall";
    case "yarn":
      return "yarn remove";
    case "pnpm":
      return "pnpm remove";
    case "bun":
      return "bun remove";
  }
}
