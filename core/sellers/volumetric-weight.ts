import type { ToolResult } from '../shared/types';

export type DimensionUnit = 'cm' | 'in';

export interface VolumetricInput {
  length: number;
  width: number;
  height: number;
  unit: DimensionUnit;
  /**
   * Courier's volumetric divisor for the chosen unit. Deliberately no default: divisors differ by
   * courier and service, and AGENTS.md rule 4 forbids unsourced values (see docs/rules-and-sources.md).
   */
  divisor: number;
  /** Optional actual (scale) weight in the result unit: kg for cm, lb for inches. */
  actualWeight?: number;
}

export interface VolumetricResult {
  volume: number;
  volumeUnit: 'cm³' | 'in³';
  volumetricWeight: number;
  weightUnit: 'kg' | 'lb';
  actualWeight: number | null;
  /** Which weight is higher; couriers usually charge the higher one, but practice varies. */
  higher: 'volumetric' | 'actual' | 'equal' | null;
  higherWeight: number;
  formula: string;
}

export const FORMULA_TEXT = 'Volumetric weight = (length × width × height) ÷ divisor';

const round3 = (n: number) => Math.round(n * 1000) / 1000;

function positive(name: string, v: unknown): string | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return `${name} must be a number`;
  if (v <= 0) return `${name} must be more than 0`;
  return null;
}

export function calculate(input: VolumetricInput): ToolResult<VolumetricResult> {
  if (input.unit !== 'cm' && input.unit !== 'in') return { ok: false, error: 'Unit must be cm or in' };
  const error =
    positive('Length', input.length) ??
    positive('Width', input.width) ??
    positive('Height', input.height) ??
    (input.divisor === undefined || Number.isNaN(input.divisor)
      ? "Enter your courier's divisor (check their rate card)"
      : positive('Divisor', input.divisor));
  if (error) return { ok: false, error };

  const hasActual = input.actualWeight !== undefined && !Number.isNaN(input.actualWeight);
  if (hasActual && (typeof input.actualWeight !== 'number' || !Number.isFinite(input.actualWeight) || input.actualWeight < 0)) {
    return { ok: false, error: 'Actual weight must be 0 or more' };
  }

  const volume = input.length * input.width * input.height;
  const volumetricWeight = round3(volume / input.divisor);
  const actualWeight = hasActual ? round3(input.actualWeight as number) : null;

  let higher: VolumetricResult['higher'] = null;
  if (actualWeight !== null) {
    higher = volumetricWeight > actualWeight ? 'volumetric' : actualWeight > volumetricWeight ? 'actual' : 'equal';
  }

  return {
    ok: true,
    output: {
      volume: round3(volume),
      volumeUnit: input.unit === 'cm' ? 'cm³' : 'in³',
      volumetricWeight,
      weightUnit: input.unit === 'cm' ? 'kg' : 'lb',
      actualWeight,
      higher,
      higherWeight: actualWeight === null ? volumetricWeight : Math.max(volumetricWeight, actualWeight),
      formula: FORMULA_TEXT,
    },
  };
}

/** ToolResult contract entry point: input is a JSON object with the VolumetricInput fields. */
export function run(input: string): ToolResult<VolumetricResult> {
  if (!input || input.trim() === '') return { ok: false, error: 'Input is empty' };
  try {
    const parsed = JSON.parse(input);
    if (typeof parsed !== 'object' || parsed === null) throw new Error();
    return calculate(parsed as VolumetricInput);
  } catch {
    return { ok: false, error: 'Input must be JSON with length, width, height, unit and divisor' };
  }
}
