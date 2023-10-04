import BN from 'bn.js';
import { Length, Validate } from 'class-validator';
import { ec as EC } from 'elliptic';
import { DEFAULT_SECP256K1_PRIVATE_KEY_STRING } from 'library/constants/VotingConstants';
import { BaseClassValidator } from 'library/interfaces/BaseClassValidator';
import { ECCPrivateKeyInterface } from 'library/interfaces/ECCPrivateKey';
import { IsHexadecimalWithoutPrefix } from 'library/interfaces/IsHexadecimalWithoutPrefix';
import { Secp256k1BasePoint } from './Secp256k1BasePoint';
const ec: EC = new EC('secp256k1');

export class Secp256k1PrivateKey
  extends BaseClassValidator<Secp256k1PrivateKey>
  implements ECCPrivateKeyInterface<Secp256k1BasePoint>
{
  @Validate(IsHexadecimalWithoutPrefix)
  @Length(50, 64)
  privateKey: string;

  constructor(privateKey: string) {
    super({ privateKey });
    this.privateKey = privateKey;
  }

  static getDefaultSecp256k1PrivateKey(): Secp256k1PrivateKey {
    return new Secp256k1PrivateKey(DEFAULT_SECP256K1_PRIVATE_KEY_STRING);
  }

  toBN(): BN {
    return ec.keyFromPrivate(this.privateKey).getPrivate();
  }

  toHexString(): string {
    return this.privateKey;
  }

  clone(): Secp256k1PrivateKey {
    return new Secp256k1PrivateKey(this.privateKey);
  }
}
