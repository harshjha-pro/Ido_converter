import { describe, it, expect } from 'vitest';
import { computeCrop, findQuality, run, PRESETS, allPresetsReviewed, upscaleFactor, getPreset } from '../../core/forms/visa-photo-sizer';
import fs from 'fs';
import path from 'path';

const crops = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'visa-photo-sizer', 'crops.json'), 'utf-8'));

describe('Visa photo sizer: presets (AGENTS.md rules 4 and 5)', () => {
  it('has 2–3 countries to start', () => {
    expect(new Set(PRESETS.map(p => p.country)).size).toBeGreaterThanOrEqual(2);
    expect(new Set(PRESETS.map(p => p.country)).size).toBeLessThanOrEqual(3);
  });

  it('every preset has an official https source and a last-checked date', () => {
    for (const p of PRESETS) {
      expect(p.source.url, p.id).toMatch(/^https:\/\/(?:[\w-]+\.)*(?:gov\.in|passportindia\.gov\.in|state\.gov|gov\.uk)\//);
      expect(p.lastChecked, p.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.rules.length, p.id).toBeGreaterThan(0);
    }
  });

  it('print presets match their physical aspect ratio', () => {
    for (const p of PRESETS.filter(x => x.widthMm && x.heightMm)) {
      expect(p.outputWidth / p.outputHeight, p.id).toBeCloseTo(p.widthMm! / p.heightMm!, 2);
    }
  });

  it('UK digital output meets the official minimum size; US visa output is square within range', () => {
    const uk = getPreset('uk-passport-digital')!;
    expect(uk.outputWidth).toBeGreaterThanOrEqual(600);
    expect(uk.outputHeight).toBeGreaterThanOrEqual(750);
    const us = getPreset('us-visa-digital')!;
    expect(us.outputWidth).toBe(us.outputHeight);
    expect(us.outputWidth).toBeGreaterThanOrEqual(600);
    expect(us.outputWidth).toBeLessThanOrEqual(1200);
  });

  it('is not publishable until every preset has a reviewer', () => {
    expect(allPresetsReviewed(PRESETS.map(p => ({ ...p, reviewedBy: 'A. Reviewer' })))).toBe(true);
    expect(allPresetsReviewed([{ ...PRESETS[0], reviewedBy: '' }])).toBe(false);
  });
});

describe('Visa photo sizer: crop math', () => {
  for (const c of crops) {
    it(c.name, () => {
      const r = computeCrop(c.req);
      expect(r.ok).toBe(true);
      for (const k of ['sx', 'sy', 'sw', 'sh'] as const) expect(r.output![k]).toBeCloseTo(c.expected[k], 6);
    });
  }

  it('crop always keeps the requested shape and stays inside the image', () => {
    for (const aspect of [1, 35 / 45, 0.8]) {
      for (const zoom of [1, 1.5, 3]) {
        for (const cx of [0, 0.3, 1]) {
          const r = computeCrop({ imageWidth: 1234, imageHeight: 987, aspect, zoom, centerX: cx, centerY: 1 - cx }).output!;
          expect(r.sw / r.sh).toBeCloseTo(aspect, 6);
          expect(r.sx).toBeGreaterThanOrEqual(0);
          expect(r.sy).toBeGreaterThanOrEqual(0);
          expect(r.sx + r.sw).toBeLessThanOrEqual(1234 + 1e-9);
          expect(r.sy + r.sh).toBeLessThanOrEqual(987 + 1e-9);
        }
      }
    }
  });

  it.each([
    [{ imageWidth: 0, imageHeight: 10, aspect: 1, zoom: 1, centerX: 0.5, centerY: 0.5 }, 'Image width must be more than 0'],
    [{ imageWidth: 10, imageHeight: 10, aspect: 1, zoom: 0.5, centerX: 0.5, centerY: 0.5 }, 'Zoom must be 1 or more'],
    [{ imageWidth: 10, imageHeight: 10, aspect: 1, zoom: 1, centerX: 2, centerY: 0.5 }, 'Position must be between 0 and 1'],
  ])('rejects invalid crop %#', (req, error) => {
    expect(computeCrop(req)).toEqual({ ok: false, error });
  });

  it('reports when the crop must be enlarged', () => {
    const preset = getPreset('uk-passport-digital')!;
    expect(upscaleFactor({ sx: 0, sy: 0, sw: 450, sh: 562.5 }, preset)).toBeCloseTo(2, 6);
  });

  it('run() returns a crop plan for a preset', () => {
    const r = run(JSON.stringify({ presetId: 'us-visa-digital', imageWidth: 4000, imageHeight: 3000 }));
    expect(r.output).toEqual({ crop: { sx: 500, sy: 0, sw: 3000, sh: 3000 }, outputWidth: 600, outputHeight: 600 });
    expect(run('')).toEqual({ ok: false, error: 'Input is empty' });
    expect(run('{"presetId":"xx"}')).toEqual({ ok: false, error: 'Unknown preset' });
  });
});

describe('Visa photo sizer: file size search (synthetic encoder)', () => {
  // Size grows with quality like a real JPEG encoder: 40 KB at q=0.1 up to ~400 KB at q=1.
  const encoder = (scale = 1) => async (q: number) => Math.round((40000 + 360000 * q * q) * scale);

  it('keeps high quality when there is no limit', async () => {
    const r = await findQuality(encoder(), { minBytes: null, maxBytes: null });
    expect(r).toMatchObject({ quality: 0.92, withinLimits: true });
  });

  it('finds the highest quality under a 240 KB maximum', async () => {
    const r = await findQuality(encoder(), { minBytes: null, maxBytes: 240000 });
    expect(r.withinLimits).toBe(true);
    expect(r.bytes).toBeLessThanOrEqual(240000);
    expect(r.bytes).toBeGreaterThan(220000);
  });

  it('raises quality to reach a minimum size', async () => {
    const r = await findQuality(encoder(0.13), { minBytes: 50000, maxBytes: 10000000 });
    expect(r.quality).toBe(1);
    expect(r.withinLimits).toBe(true);
  });

  it('says so when the minimum cannot be reached', async () => {
    const r = await findQuality(encoder(0.05), { minBytes: 50000, maxBytes: 10000000 });
    expect(r.withinLimits).toBe(false);
    expect(r.message).toMatch(/below the 50 KB minimum/);
  });

  it('says so when the maximum cannot be reached', async () => {
    const r = await findQuality(encoder(10), { minBytes: null, maxBytes: 240000 });
    expect(r.withinLimits).toBe(false);
    expect(r.message).toMatch(/Could not get under 240 KB/);
  });
});
