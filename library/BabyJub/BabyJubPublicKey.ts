import { BN } from 'bn.js';
import { Validate } from 'class-validator';
import { BaseClassValidator } from 'library/interfaces/BaseClassValidator';
import { ECCPublicKeyInterface } from 'library/interfaces/ECCPublicKey';
import { IsHexadecimalWithoutPrefix } from 'library/interfaces/IsHexadecimalWithoutPrefix';
import { BabyJubBasePoint, BabyJubCurvePoint } from './BabyJubBasePoint';
import { FFMathUtility } from './FFMathUtility';

export class BabyJubPublicKey
  extends BaseClassValidator<BabyJubPublicKey>
  implements ECCPublicKeyInterface<BabyJubCurvePoint>
{
  @Validate(IsHexadecimalWithoutPrefix)
  // @Length(127, 130)
  publicKey: string;

  constructor(publicKey: string) {
    super({ publicKey });
    this.publicKey = publicKey;
  }

  toCurvePoint(): BabyJubCurvePoint {
    return FFMathUtility.PointFromHex(this.publicKey);
  }
  toBasePoint(): BabyJubBasePoint {
    return new BabyJubBasePoint(this.toCurvePoint());
  }

  toVoterId(): string {
    const x = new BN(this.toCurvePoint()[0]);
    const y = new BN(this.toCurvePoint()[1]);
    return x.mul(y).add(x.add(y)).toString(10);
  }

  toHexString(): string {
    return this.publicKey;
  }

  clone(): BabyJubPublicKey {
    return new BabyJubPublicKey(this.publicKey);
  }
}
