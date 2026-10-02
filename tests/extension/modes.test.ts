import { describe, it, expect } from 'vitest';
import { runMode } from '../../extension/json-privacy-masker/src/modes';

describe('Extension modes (reuse core tools)', () => {
  it('masks JSON', () => {
    const r = runMode('mask', '{"email":"a@b.com"}');
    expect(r.ok).toBe(true);
    expect(JSON.parse(r.output)).toEqual({ email: '[REDACTED]' });
  });

  it('pseudonymizes JSON with a fresh random seed each time', () => {
    const a = runMode('pseudonymize', '{"email":"a@b.com"}');
    const b = runMode('pseudonymize', '{"email":"a@b.com"}');
    expect(a.output).not.toContain('a@b.com');
    expect(a.output).not.toBe(b.output);
  });

  it('scrubs secrets from plain text', () => {
    const r = runMode('scrub', 'password=hunter22');
    expect(r.output).toBe('password=[REDACTED:password]');
  });

  it('points non-JSON selections to the scrubber', () => {
    const r = runMode('mask', 'just a log line');
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/\. Not JSON\? Try "Scrub secrets"\.$/);
  });
});
