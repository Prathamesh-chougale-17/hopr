import path from 'path'
import { fileExists, readJSON } from '../../utils/index.js'

/**
 * Detect if project is using Next.js
 */
export async function detectNextJs(projectPath: string): Promise<boolean> {
  try {
    // Check for package.json with next dependency
    const packageJsonPath = path.join(projectPath, 'package.json')
    if (await fileExists(packageJsonPath)) {
      const packageJson = await readJSON<{
        dependencies?: Record<string, string>
        devDependencies?: Record<string, string>
      }>(packageJsonPath)

      const hasNext =
        packageJson.dependencies?.next !== undefined ||
        packageJson.devDependencies?.next !== undefined

      if (!hasNext) return false
    }

    // Check for Next.js config files
    const configFiles = [
      'next.config.js',
      'next.config.mjs',
      'next.config.ts',
    ]

    for (const configFile of configFiles) {
      if (await fileExists(path.join(projectPath, configFile))) {
        return true
      }
    }

    // Check for app directory (App Router)
    const appDir = path.join(projectPath, 'app')
    const srcAppDir = path.join(projectPath, 'src', 'app')

    if (await fileExists(appDir) || await fileExists(srcAppDir)) {
      return true
    }

    return false
  } catch {
    return false
  }
}

/**
 * Detect if using App Router (vs Pages Router)
 */
export async function isAppRouter(projectPath: string): Promise<boolean> {
  const appDir = path.join(projectPath, 'app')
  const srcAppDir = path.join(projectPath, 'src', 'app')

  return (await fileExists(appDir)) || (await fileExists(srcAppDir))
}

/**
 * Detect if project uses src directory
 */
export async function usesSrcDirectory(projectPath: string): Promise<boolean> {
  const srcAppDir = path.join(projectPath, 'src', 'app')
  return await fileExists(srcAppDir)
}
