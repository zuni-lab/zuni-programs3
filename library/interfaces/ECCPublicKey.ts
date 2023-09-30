import { BasePoint } from './BasePoint';

export abstract class ECCPublicKeyInterface<P extends BasePoint<P>> {
  abstract toCurvePoint(): P;
  abstract toVoterId(): string;
  abstract toHexString(): string;
  abstract clone(): ECCPublicKeyInterface<P>;
}
