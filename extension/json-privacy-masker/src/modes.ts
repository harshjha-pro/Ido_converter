// The extension's single purpose — mask sensitive values locally — exposed as three ways to do it,
// all calling the same core code as the website.
import { run as mask } from '../../../core/developers/json-pii-masker';
import { run as pseudonymize } from '../../../core/developers/pseudonymizer';
import { run as scrub, type Finding } from '../../../core/developers/secret-scrubber';

export type Mode = 'mask' | 'pseudonymize' | 'scrub';

export const MODE_LABELS: Record<Mode, string> = {
  mask: 'Mask sensitive values (JSON)',
  pseudonymize: 'Replace with consistent fakes (JSON)',
  scrub: 'Scrub secrets (logs or any text)',
};

export interface ModeResult {
  ok: boolean;
  output: string;
  message: string;
}

function randomSeed(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export function runMode(mode: Mode, input: string): ModeResult {
  if (mode === 'scrub') {
    const r = scrub(input);
    if (!r.ok) return { ok: false, output: '', message: r.error ?? 'Error' };
    const findings = (r.meta?.findings as Finding[]).map(f => `${f.label}: ${f.count}`).join(', ');
    return { ok: true, output: r.output ?? '', message: `Redacted ${r.meta?.total ?? 0} secrets${findings ? ` (${findings})` : ''}. Review before sharing.` };
  }

  const r = mode === 'mask' ? mask(input) : pseudonymize(input, { seed: randomSeed() });
  if (!r.ok) {
    // Selections are often logs rather than JSON; point to the mode that handles them.
    const error = (r.error ?? 'Error').replace(/([^.])$/, '$1.');
    const hint = error.startsWith('Invalid JSON') ? ' Not JSON? Try "Scrub secrets".' : '';
    return { ok: false, output: '', message: `${error}${hint}` };
  }
  return { ok: true, output: r.output ?? '', message: `Replaced ${r.meta?.replacementCount ?? 0} values. Review before sharing.` };
}
