import { describe, it, expect } from 'vitest';
import { buildXlsx, crc32 } from '../../core/shared/xlsx';

describe('xlsx writer', () => {
  it('crc32 matches the standard check value', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
  });

  it('produces a zip with the workbook parts', () => {
    const bytes = buildXlsx([{ name: 'Data', rows: [['a', 'b'], [1, 'x & <y>']] }]);
    expect([...bytes.slice(0, 4)]).toEqual([0x50, 0x4b, 0x03, 0x04]);
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain('xl/worksheets/sheet1.xml');
    expect(text).toContain('x &amp; &lt;y&gt;');
    expect(text).toContain('<v>1</v>');
  });

  it('makes sheet names valid and unique', () => {
    const text = new TextDecoder().decode(buildXlsx([
      { name: 'B2B: April/2026 [long name over thirty-one chars]', rows: [['x']] },
      { name: 'B2B: April/2026 [long name over thirty-one chars]', rows: [['y']] },
    ]));
    const names = [...text.matchAll(/<sheet name="([^"]+)"/g)].map(m => m[1]);
    expect(names).toHaveLength(2);
    expect(new Set(names).size).toBe(2);
    for (const n of names) {
      expect(n.length).toBeLessThanOrEqual(31);
      expect(n).not.toMatch(/[[\]:*?/\\]/);
    }
  });

  it('drops characters XML forbids', () => {
    const text = new TextDecoder().decode(buildXlsx([{ name: 'S', rows: [['bad\u0001char']] }]));
    expect(text).toContain('badchar');
  });
});
