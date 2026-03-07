import { generateCredentialHash } from './credential.crypto';

/**
 * Tests specifically for canonical JSON hashing behavior.
 * Ensures deterministic output for complex nested structures.
 */
describe('Canonical JSON hashing', () => {
  it('should handle null values', () => {
    const h1 = generateCredentialHash({ a: null, b: 'test' });
    const h2 = generateCredentialHash({ b: 'test', a: null });
    expect(h1).toBe(h2);
  });

  it('should handle array values', () => {
    const h1 = generateCredentialHash({ tags: ['a', 'b', 'c'] });
    const h2 = generateCredentialHash({ tags: ['a', 'b', 'c'] });
    expect(h1).toBe(h2);
  });

  it('should NOT produce same hash for different array orders', () => {
    const h1 = generateCredentialHash({ tags: ['a', 'b'] });
    const h2 = generateCredentialHash({ tags: ['b', 'a'] });
    expect(h1).not.toBe(h2);
  });

  it('should handle boolean and number values', () => {
    const h1 = generateCredentialHash({ flag: true, count: 42 });
    const h2 = generateCredentialHash({ count: 42, flag: true });
    expect(h1).toBe(h2);
  });

  it('should handle triple-nested objects', () => {
    const h1 = generateCredentialHash({
      level1: {
        level2: {
          level3: { z: 1, a: 2 },
          x: 'val',
        },
        m: true,
      },
    });
    const h2 = generateCredentialHash({
      level1: {
        m: true,
        level2: {
          x: 'val',
          level3: { a: 2, z: 1 },
        },
      },
    });
    expect(h1).toBe(h2);
  });

  it('should handle empty objects', () => {
    const hash = generateCredentialHash({});
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should differentiate between string and number types', () => {
    const h1 = generateCredentialHash({ value: '42' });
    const h2 = generateCredentialHash({ value: 42 } as any);
    expect(h1).not.toBe(h2);
  });

  it('should handle mixed nested arrays and objects', () => {
    const h1 = generateCredentialHash({
      data: [{ name: 'Alice', score: 95 }, { name: 'Bob', score: 87 }],
      meta: { version: 1 },
    });
    const h2 = generateCredentialHash({
      meta: { version: 1 },
      data: [{ score: 95, name: 'Alice' }, { score: 87, name: 'Bob' }],
    });
    expect(h1).toBe(h2);
  });
});
