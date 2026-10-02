import { describe, it, expect } from 'vitest';
import { run } from '../core/developers/json-pii-masker';

describe('JSON PII Masker', () => {
  it('should return ok', () => {
    const result = run('{}');
    expect(result.ok).toBe(true);
  });
});
