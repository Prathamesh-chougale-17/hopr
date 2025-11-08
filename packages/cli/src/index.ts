// Public API exports
export type * from './types/index.js'
export { Migrator, detectFramework } from './core/migrator.js'
export { detectNextJs, analyzeNextJsProject } from './plugins/nextjs/index.js'
export { transformToTanStackStart } from './plugins/tanstack/index.js'
