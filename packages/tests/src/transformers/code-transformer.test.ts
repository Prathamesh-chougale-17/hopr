import { describe, it, expect } from 'vitest';
import { CodeTransformer } from '@cli/transformers/code-transformer';

describe('CodeTransformer', () => {
  describe('getRoutePathFromFile', () => {
    it('should convert index.tsx to /', () => {
      const filePath = 'src/routes/index.tsx';
      const routePath = CodeTransformer.getRoutePathFromFile(filePath);
      expect(routePath).toBe('/');
    });

    it('should convert about.tsx to /about', () => {
      const filePath = 'src/routes/about.tsx';
      const routePath = CodeTransformer.getRoutePathFromFile(filePath);
      expect(routePath).toBe('/about');
    });

    it('should convert posts/$id.tsx to /posts/$id', () => {
      const filePath = 'src/routes/posts/$id.tsx';
      const routePath = CodeTransformer.getRoutePathFromFile(filePath);
      expect(routePath).toBe('/posts/$id');
    });

    it('should convert nested routes correctly', () => {
      const filePath = 'src/routes/blog/posts/index.tsx';
      const routePath = CodeTransformer.getRoutePathFromFile(filePath);
      expect(routePath).toBe('/blog/posts');
    });

    it('should handle Windows paths', () => {
      const filePath = 'src\\routes\\about.tsx';
      const routePath = CodeTransformer.getRoutePathFromFile(filePath);
      expect(routePath).toBe('/about');
    });

    it('should return / for paths without routes directory', () => {
      const filePath = 'src/components/Button.tsx';
      const routePath = CodeTransformer.getRoutePathFromFile(filePath);
      expect(routePath).toBe('/');
    });

    it('should handle .ts extension', () => {
      const filePath = 'src/routes/api/users.ts';
      const routePath = CodeTransformer.getRoutePathFromFile(filePath);
      expect(routePath).toBe('/api/users');
    });

    it('should handle catch-all routes', () => {
      const filePath = 'src/routes/$.tsx';
      const routePath = CodeTransformer.getRoutePathFromFile(filePath);
      expect(routePath).toBe('/$');
    });
  });
});
