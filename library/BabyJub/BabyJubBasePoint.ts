import BN from 'bn.js';
import { Point } from 'circomlibjs';
import { ec as BabyJubCurveInterface } from 'elliptic';
import { BasePoint } from 'library/interfaces/BasePoint';
import { FFMathUtility } from './FFMathUtility';
type BabyJubCurvePoint = Point;
export { BabyJubCurveInterface, BabyJubCurvePoint };

export class BabyJubBasePoint implements BasePoint<BabyJubCurvePoint> {
  point: BabyJubCurvePoint;
  constructor(p: BabyJubCurvePoint) {
    this.point = p;
  }

  add(other: BabyJubBasePoint): BabyJubBasePoint {
    this.point.toString();
    return new BabyJubBasePoint(
      FFMathUtility.addPoint(this.point, other.point),
    );
  }
  mul(k: BN): BasePoint<BabyJubCurvePoint> {
    return new BabyJubBasePoint(
      FFMathUtility.mulPointEscalar(this.point, k.toString()),
    );
  }
  getX(): BN {
    return new BN(this.point[0]);
  }
  getY(): BN {
    return new BN(this.point[1]);
  }
  eq(other: BabyJubBasePoint): boolean {
    return this.point[0] === other.point[0] && this.point[1] === other.point[1];
  }
  getRawPoint(): BabyJubCurvePoint {
    return this.point;
  }
}
