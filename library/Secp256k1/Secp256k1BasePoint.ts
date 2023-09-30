import BN from 'bn.js';
import { curve, ec as Secp256k1CurveInterface } from 'elliptic';
import { BasePoint } from 'library/interfaces/BasePoint';
const ec: Secp256k1CurveInterface = new Secp256k1CurveInterface('secp256k1');
export const Secp256k1Curve = ec;
export { Secp256k1CurveInterface };

export class Secp256k1BasePoint implements BasePoint<curve.base.BasePoint> {
  point: curve.base.BasePoint;
  constructor(p: curve.base.BasePoint) {
    this.point = p;
  }
  add(other: Secp256k1BasePoint): Secp256k1BasePoint {
    return new Secp256k1BasePoint(this.point.add(other.point));
  }
  mul(k: BN): BasePoint<curve.base.BasePoint> {
    return new Secp256k1BasePoint(this.point.mul(k));
  }
  getX(): BN {
    return this.point.getX();
  }
  getY(): BN {
    return this.point.getY();
  }
  eq(other: Secp256k1BasePoint): boolean {
    return this.point.eq(other.point);
  }
}
