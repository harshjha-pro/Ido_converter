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
  });
});
