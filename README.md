# hopr

> A powerful CLI tool for migrating fullstack web projects between frameworks

[![npm version](https://img.shields.io/npm/v/hopr.svg)](https://www.npmjs.com/package/hopr)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/yourusername/hopr/workflows/CI/badge.svg)](https://github.com/yourusername/hopr/actions)

## Features

- 🔍 **Auto-detection** - Automatically identifies source framework and package manager
- 🔄 **Smart Migration** - Intelligent code transformations using AST
- 📦 **Package Manager Agnostic** - Works with bun, npm, pnpm, and yarn
- 💾 **Safe by Default** - Creates backups before making changes
- 🎯 **Framework Support** - Currently supports Next.js → TanStack Start
- 🚀 **Cross-platform** - Works on Windows, macOS, and Linux

## Installation

Global installation:

\`\`\`bash
npm install -g hopr

# or

bun add -g hopr
\`\`\`

Run without installing:

\`\`\`bash
npx hopr@latest migrate ./my-project
\`\`\`

## Quick Start

\`\`\`bash

# Detect framework

hopr detect ./my-project

# Preview migration

hopr migrate ./my-project --dry-run

# Run migration

hopr migrate ./my-project
\`\`\`

## Documentation

- [Usage Guide](apps/cli/USAGE.md)
- [Development Guide](apps/cli/DEVELOPMENT.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Publishing Guide](PUBLISHING.md)

## License

MIT © hopr contributors
