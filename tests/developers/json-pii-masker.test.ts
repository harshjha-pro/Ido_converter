import { describe, it, expect } from 'vitest';
import { run } from '../../core/developers/json-pii-masker';
import fs from 'fs';
import path from 'path';

const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures', 'json-pii-masker');

describe('JSON PII Masker', () => {
  it('should handle empty input', () => {
    const result = run('');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Input is empty');
  });

  it('should handle invalid JSON', () => {
    const result = run('{ bad: json }');
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Invalid JSON/);
  });

  it('should mask normal JSON payload', () => {
    const input = fs.readFileSync(path.join(FIXTURES_DIR, 'normal.json'), 'utf-8');
    const result = run(input, { maskStyle: 'placeholder' });
    
    expect(result.ok).toBe(true);
    expect(result.meta?.replacementCount).toBeGreaterThan(0);
    
    const output = JSON.parse(result.output!);
    expect(output.user.name).toBe('[REDACTED]');
    expect(output.user.email).toBe('[REDACTED]');
    expect(output.user.password).toBe('[REDACTED]');
    expect(output.user.token).toBe('[REDACTED]');
    
    // Check that inside the bio, email and phone were masked
    expect(output.user.profile.bio).not.toContain('jane.doe@example.com');
    expect(output.user.profile.bio).not.toContain('555-987-6543');
    expect(output.user.profile.bio).toContain('[REDACTED]');

    // Check non-string values matched by key
    expect(output.user.isAdmin).toBe(true);
  });

  it('should handle partial masking correctly', () => {
    const input = JSON.stringify({ email: "hello@world.com", phone: "+1-555-0000", key: "short" });
    const result = run(input, { maskStyle: 'partial' });
    const output = JSON.parse(result.output!);
    
    expect(output.email).toBe('h***o@world.com');
    expect(output.phone).toBe('+*********0');
  });

  it('should handle full masking correctly', () => {
    const input = JSON.stringify({ email: "hello@world.com" });
    const result = run(input, { maskStyle: 'full' });
    const output = JSON.parse(result.output!);
    
    expect(output.email).toBe('***************');
  });

  it('should handle large arrays', () => {
    const arr = Array(1000).fill({ email: "test@test.com", "clean": "data" });
    const result = run(JSON.stringify(arr), { maskStyle: 'placeholder' });
    
    expect(result.ok).toBe(true);
    expect(result.meta?.replacementCount).toBe(1000);
    const output = JSON.parse(result.output!);
    expect(output[0].email).toBe('[REDACTED]');
    expect(output[999].email).toBe('[REDACTED]');
  });

  it('should handle unicode', () => {
    const input = JSON.stringify({ name: "Jöhn Døe 🤡", password: "秘密" });
    const result = run(input, { maskStyle: 'placeholder' });
    const output = JSON.parse(result.output!);
    expect(output.name).toBe('[REDACTED]');
    expect(output.password).toBe('[REDACTED]');
  });

  it('LEAK TEST: No secrets must survive', () => {
    const input = fs.readFileSync(path.join(FIXTURES_DIR, 'leak.json'), 'utf-8');
    const result = run(input, { maskStyle: 'placeholder' });
    
    expect(result.ok).toBe(true);
    
    const outputString = result.output!;
    
    // Explicitly assert that the exact secrets are NOT in the output string
    expect(outputString).not.toContain('admin@secret-corp.com');
    expect(outputString).not.toContain('+1-800-555-0199');
    expect(outputString).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    expect(outputString).not.toContain('ABCDE1234F');
    expect(outputString).not.toContain('1234-5678-9012');
    expect(outputString).not.toContain('this must go');
    expect(outputString).not.toContain('this must go too');
    for (const secret of [
      'fghij5678k', '98765 43210', '87654-32109', '7654321098',
      'tok-variant-camel', 'pw-variant-kebab', 'sk-live-variant-snake', 'bearer-secret-value',
      'nested-pw-current', 'nested-pw-old', '5550001111', '9123456780', '234567890123',
      'राहुल शर्मा', 'rahul.sharma@example.in', 'Priya Ramanathan', 'priya.r@example.co.in',
    ]) {
      expect(outputString).not.toContain(secret);
    }
    // Structure must survive masking
    const output = JSON.parse(outputString);
    expect(output.leaks).toHaveLength(8);
    expect(output.customers).toHaveLength(2);
  });

  it('should match key names regardless of case and separators, by whole words', () => {
    const input = JSON.stringify({
      EMAIL: 'a', accessToken: 'b', 'user-password': 'c', api_key: 'd', 'Contact.Phone': 'e',
      company: 'Acme', filename: 'report.pdf', expand: 'yes',
    });
    const output = JSON.parse(run(input).output!);
    for (const k of ['EMAIL', 'accessToken', 'user-password', 'api_key', 'Contact.Phone']) {
      expect(output[k]).toBe('[REDACTED]');
    }
    expect(output.company).toBe('Acme');
    expect(output.filename).toBe('report.pdf');
    expect(output.expand).toBe('yes');
  });

  it('should over-mask rather than leak when a key contains a sensitive word', () => {
    const output = JSON.parse(run(JSON.stringify({ display_name: 'Asha', file_name: 'a.txt' })).output!);
    expect(output.display_name).toBe('[REDACTED]');
    expect(output.file_name).toBe('[REDACTED]');
  });

  it('should mask everything nested under a sensitive key', () => {
    const input = JSON.stringify({ secret: { a: 'x', b: [1, true, null], c: { d: 'y' } } });
    const output = JSON.parse(run(input).output!);
    expect(output.secret).toEqual({ a: '[REDACTED]', b: ['[REDACTED]', '[REDACTED]', null], c: { d: '[REDACTED]' } });
  });

  it('should mask phone-like numbers but leave ordinary numbers and booleans alone', () => {
    const input = JSON.stringify({ mobileNumber: 9876543210, contact: 9876543210, count: 42, price: 199.5, ok: false });
    const output = JSON.parse(run(input).output!);
    expect(output.mobileNumber).toBe('[REDACTED]');
    expect(output.contact).toBe('[REDACTED]');
    expect(output.count).toBe(42);
    expect(output.price).toBe(199.5);
    expect(output.ok).toBe(false);
  });

  it('should count every masked value, not just every string', () => {
    const input = JSON.stringify({ note: 'a@b.com and c@d.com and 9876543210' });
    const result = run(input);
    expect(result.meta?.replacementCount).toBe(3);
  });

  it('should respect disabled pattern options', () => {
    const input = JSON.stringify({ note: 'a@b.com 9876543210' });
    const output = JSON.parse(run(input, { maskEmail: false, maskPhone: false }).output!);
    expect(output.note).toBe('a@b.com 9876543210');
  });

  it('should handle top-level primitives and empty containers', () => {
    expect(run('"x@y.com"').output).toBe('"[REDACTED]"');
    expect(run('[]').output).toBe('[]');
    expect(run('null').output).toBe('null');
  });
});
