import { BasePoint, ECCCurvePoint } from './BasePoint';

export abstract class ECCPublicKeyInterface<P extends ECCCurvePoint> {
  abstract toCurvePoint(): P;
  abstract toBasePoint(): BasePoint<P>;
  abstract toVoterId(): string;
  abstract toHexString(): string;
  abstract clone(): ECCPublicKeyInterface<P>;
}
