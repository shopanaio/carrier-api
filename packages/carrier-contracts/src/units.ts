// code and comments in English

/** Canonical units: weight in kilograms, dimensions in centimetres. */
export interface Weight {
  value: number;
  unit: 'kg' | 'g' | 'lb' | 'oz';
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'mm' | 'm' | 'in';
}

const KG_PER: Record<Weight['unit'], number> = { kg: 1, g: 0.001, lb: 0.45359237, oz: 0.028349523125 };
const CM_PER: Record<Dimensions['unit'], number> = { cm: 1, mm: 0.1, m: 100, in: 2.54 };

export function toKg(weight: Weight): number {
  return round(weight.value * KG_PER[weight.unit], 6);
}

export function fromKg(kg: number, unit: Weight['unit']): number {
  return round(kg / KG_PER[unit], 6);
}

export function toCm(dimensions: Dimensions): { length: number; width: number; height: number } {
  const factor = CM_PER[dimensions.unit];
  return {
    length: round(dimensions.length * factor, 4),
    width: round(dimensions.width * factor, 4),
    height: round(dimensions.height * factor, 4),
  };
}

export function fromCm(cm: number, unit: Dimensions['unit']): number {
  return round(cm / CM_PER[unit], 4);
}

/** Volumetric weight in kg for a given divisor (5000 is the common courier divisor, 4000 for some posts). */
export function volumetricWeightKg(dimensions: Dimensions, divisor = 5000): number {
  const { length, width, height } = toCm(dimensions);
  return round((length * width * height) / divisor, 3);
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
