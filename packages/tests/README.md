# @repo/tests

Comprehensive test suite for the hopr CLI using Vitest.

## Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with UI
bun test:ui

# Run tests with coverage
bun test:coverage
```

## Test Structure

```
src/
├── detectors/
│   ├── framework-detector.test.ts    # Framework detection tests
│   └── nextjs-detector.test.ts       # Next.js specific detection
├── transformers/
│   ├── package-transformer.test.ts   # Package.json transformation
│   └── code-transformer.test.ts      # Code transformation utilities
└── utils/
    └── file-system.test.ts           # File system utilities
```

## Test Coverage

The test suite covers:

### Detectors
- ✅ Package manager detection (bun, npm, pnpm, yarn)
- ✅ Framework detection (Next.js, TanStack Start, Remix, SvelteKit, etc.)
- ✅ Project structure analysis
- ✅ App Router vs Pages Router detection

### Transformers
- ✅ Package.json transformations
- ✅ Dependency updates
- ✅ Script updates
- ✅ Package manager specific commands
- ✅ Route path conversions

### Utilities
- ✅ File system operations (read, write, copy, move, remove)
- ✅ JSON handling
- ✅ Directory operations
- ✅ File pattern matching
- ✅ Path utilities

## Writing Tests

### Example Test

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileSystem } from '@cli/utils/file-system';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';

describe('MyFeature', () => {
  let tempDir: string;

  beforeEach(async () => {
    // Create temp directory for isolated testing
    tempDir = path.join(os.tmpdir(), `hopr-test-${Date.now()}`);
    await fs.ensureDir(tempDir);
  });

  afterEach(async () => {
    // Clean up
    await fs.remove(tempDir);
  });

  it('should do something', async () => {
    // Test implementation
    expect(true).toBe(true);
  });
});
```

### Best Practices

1. **Isolation**: Use temporary directories for each test
2. **Cleanup**: Always remove temporary files after tests
3. **Async/Await**: Use async tests for async operations
4. **Descriptive Names**: Use clear, descriptive test names
5. **Arrange-Act-Assert**: Follow the AAA pattern

## Continuous Integration

Tests run automatically on:
- Every pull request
- Every push to main branch
- Before publishing packages

## Coverage Goals

- **Overall**: >80%
- **Detectors**: >90%
- **Transformers**: >80%
- **Utilities**: >85%

## Debugging Tests

```bash
# Run specific test file
bun test src/detectors/framework-detector.test.ts

# Run tests matching pattern
bun test --grep "detect Next.js"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/vitest run
```

## Future Tests

Planned test coverage:

- [ ] File transformer tests
- [ ] Config transformer tests
- [ ] Migration orchestration tests
- [ ] CLI command tests
- [ ] Integration tests
- [ ] E2E tests

## Contributing

When adding new features:

1. Write tests first (TDD)
2. Ensure tests pass locally
3. Maintain or improve coverage
4. Update this README if needed
