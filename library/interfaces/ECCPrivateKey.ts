import BN from 'bn.js';
import { BasePoint } from './BasePoint';

export abstract class ECCPrivateKeyInterface<P extends BasePoint<P>> {
  abstract toBN(): BN;
  abstract toHexString(): string;
  abstract clone(): ECCPrivateKeyInterface<P>;
}
