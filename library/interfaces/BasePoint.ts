import BN from 'bn.js';

export abstract class BasePoint<CurvePoint> {
  // abstract encode(enc: "hex", compact: boolean): string;
  // abstract encode(enc: "array" | undefined, compact: boolean): number[];
  // abstract encodeCompressed(enc: "hex"): string;
  // abstract encodeCompressed(enc?: "array"): number[];
  // abstract validate(): boolean;
  // abstract precompute(power: number): BasePoint;
  // abstract dblp(k: number): BasePoint;
  // abstract inspect(): string;
  // abstract isInfinity(): boolean;
  abstract add(p: BasePoint<CurvePoint>): BasePoint<CurvePoint>;
  abstract mul(k: BN): BasePoint<CurvePoint>;
  // abstract dbl(): BasePoint;
  abstract getX(): BN;
  abstract getY(): BN;
  abstract eq(p: BasePoint<CurvePoint>): boolean;
  // abstract neg(): BasePoint;
}
