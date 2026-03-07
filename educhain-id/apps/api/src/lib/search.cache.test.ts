import { buildCacheKey } from './search.cache';

describe('search.cache', () => {
  describe('buildCacheKey', () => {
    it('should produce a deterministic key from params', () => {
      const params = { q: 'react', skill: 'typescript', limit: 20 };
      const k1 = buildCacheKey(params);
      const k2 = buildCacheKey(params);

      expect(k1).toBe(k2);
      expect(k1).toMatch(/^search:students:[0-9a-f]{16}$/);
    });

    it('should produce the same key regardless of param order', () => {
      const a = buildCacheKey({ q: 'react', skill: 'ts' });
      const b = buildCacheKey({ skill: 'ts', q: 'react' });
      expect(a).toBe(b);
    });

    it('should produce different keys for different params', () => {
      const a = buildCacheKey({ q: 'react' });
      const b = buildCacheKey({ q: 'vue' });
      expect(a).not.toBe(b);
    });
  });
});
