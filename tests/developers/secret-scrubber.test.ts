import { describe, it, expect } from 'vitest';
import { run, type Finding } from '../../core/developers/secret-scrubber';
import fs from 'fs';
import path from 'path';

// Built at runtime so no token-shaped string is committed (GitHub push protection blocks those, even fakes).
const STRIPE_KEY = ['sk', 'live', 'FAKE51HxYz0123456789abcdEF'].join('_');
const SLACK_TOKEN = ['xoxb', '000000000000', '0000000000000', 'FAKEfakeFAKEfake'].join('-');
const LOG = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'secret-scrubber', 'leak.log'), 'utf-8')
  .replace('__STRIPE_KEY__', STRIPE_KEY)
  .replace('__SLACK_TOKEN__', SLACK_TOKEN);
const findings = (text: string) => run(text).meta?.findings as Finding[];
const countOf = (text: string, type: string) => findings(text).find(f => f.type === type)?.count ?? 0;

describe('Log and Secret Scrubber', () => {
  it('rejects empty input', () => {
    expect(run('\n  ')).toEqual({ ok: false, error: 'Input is empty' });
  });

  it('leaves clean text unchanged', () => {
    const text = 'INFO server started on port 8080\nWARN slow query 1200ms';
    const result = run(text);
    expect(result.output).toBe(text);
    expect(result.meta?.total).toBe(0);
  });

  it('LEAK TEST: no secret in a realistic log survives', () => {
    const out = run(LOG).output!;
    for (const secret of [
      'AKIAIOSFODNN7EXAMPLE', 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      'Pg-Sup3r$ecret!', 'm0ng0FakePass99', 'redisFakeSecret42', 'hunter2-but-longer',
      STRIPE_KEY, 'ghp_FAKEaBcDeFgHiJkLmNoPqRsTuVwXyZ012345',
      SLACK_TOKEN, 'AIzaSyFAKE-1234567890abcdefghijklmnopqr', 'sk-proj-FAKEabcdef',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', 'FAKEsignatureFAKE', 'YWRtaW46Q2hhbmdlTWUxMjM=',
      'Asha@2026!', 'Asha%402026%21', 'cs_FAKE_9f8e7d6c5b4a', 'AK-FAKE-1122334455',
      'MIIEowIBAAKCAQEA', 'b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQ', 'FAKEtruncated',
    ]) {
      expect(out, `leaked: ${secret}`).not.toContain(secret);
    }
  });

  it('keeps the readable parts of the log', () => {
    const out = run(LOG).output!;
    expect(out).toContain('postgres://orders_admin:[REDACTED:connection_string_password]@db.internal:5432/orders');
    expect(out).toContain('POST /v1/orders 201 38ms');
    expect(out).toContain('"username":"asha"');
    expect(out).toContain('shutting down');
  });

  it('labels each secret by type and lists findings without the secret values', () => {
    const list = findings(LOG);
    const types = list.map(f => f.type);
    for (const t of ['private_key', 'connection_string_password', 'aws_access_key', 'aws_secret_key', 'stripe_key',
      'github_token', 'slack_token', 'google_api_key', 'api_key', 'jwt', 'basic_auth', 'password']) {
      expect(types).toContain(t);
    }
    expect(list.find(f => f.type === 'private_key')?.count).toBe(2);
    expect(list.find(f => f.type === 'connection_string_password')?.count).toBe(3);
    expect(JSON.stringify(list)).not.toContain('hunter2');
    expect(list.find(f => f.type === 'aws_access_key')?.lines).toEqual([2]);
  });

  it('does not count placeholders like ***, ${VAR} or <secret> as secrets', () => {
    const text = 'password=*** api_key=${API_KEY} token: <your-token> secret="[REDACTED:password]"';
    expect(run(text).meta?.total).toBe(0);
  });

  it('redacts a JWT on its own', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.abcdefghijk';
    expect(run(`token issued ${jwt} ok`).output).toBe('token issued [REDACTED:jwt] ok');
  });

  it('handles JSON, YAML and query-string password forms', () => {
    expect(run('{"password": "p@ss w0rd"}').output).toBe('{"password": "[REDACTED:password]"}');
    expect(run("db_password: 'abc123'").output).toBe("db_password: '[REDACTED:password]'");
    expect(run('/login?pwd=abc123&x=1').output).toBe('/login?pwd=[REDACTED:password]&x=1');
  });

  it('respects disabled detectors', () => {
    expect(countOf('Authorization: Bearer abcdefghijklmnop', 'bearer_token')).toBe(1);
    expect(run('Authorization: Bearer abcdefghijklmnop', { disabled: ['bearer_token'] }).meta?.total).toBe(0);
  });

  it('handles very large logs', () => {
    const big = Array.from({ length: 20000 }, (_, i) => `line ${i} user=u${i} password=pw${i}`).join('\n');
    const result = run(big);
    expect(result.meta?.total).toBe(20000);
    expect(result.output).not.toMatch(/password=pw\d/);
  });

  it('handles Unicode text around secrets', () => {
    expect(run('उपयोगकर्ता राहुल password=गुप्त123 ✓').output).toBe('उपयोगकर्ता राहुल password=[REDACTED:password] ✓');
  });
});
