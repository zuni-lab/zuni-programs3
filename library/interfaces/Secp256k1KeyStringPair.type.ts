import BN from 'bn.js';
import { assert } from 'chai';
import { Length, Validate } from 'class-validator';
import { curve, ec as EC } from 'elliptic';
import {
  BaseClassValidator,
  ClassPropertyValidationError,
} from './BaseClassValidator';
import { IsHexadecimalWithoutPrefix } from './IsHexadecimalWithoutPrefix';
const ec: EC = new EC('secp256k1');

export class Secp256k1PublicKey extends BaseClassValidator<Secp256k1PublicKey> {
  @Validate(IsHexadecimalWithoutPrefix)
  @Length(129, 130)
  publicKey: string;

  constructor(publicKey: string) {
    super({ publicKey });
    this.publicKey = publicKey;
  }

  toCurvePoint(): curve.base.BasePoint {
    return ec.keyFromPublic(this.publicKey, 'hex').getPublic();
  }

  toVoterId(): string {
    const p = this.toCurvePoint();
    return p.getX().mul(p.getY()).add(p.getX().add(p.getY())).toString(10);
  }

  mul(input: BN): curve.base.BasePoint {
    return this.toCurvePoint().mul(input);
  }

  toHexString(): string {
    return this.publicKey;
  }

  clone(): Secp256k1PublicKey {
    return new Secp256k1PublicKey(this.publicKey);
  }
}

export class Secp256k1PrivateKey extends BaseClassValidator<Secp256k1PrivateKey> {
  @Validate(IsHexadecimalWithoutPrefix)
  @Length(50, 64)
  privateKey: string;

  constructor(privateKey: string) {
    super({ privateKey });
    this.privateKey = privateKey;
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

export class Secp256k1KeyStringPair extends BaseClassValidator<Secp256k1KeyStringPair> {
  privateKey: Secp256k1PrivateKey;
  publicKey: Secp256k1PublicKey;

  constructor(data: Required<Secp256k1KeyStringPair>) {
    super(data);
    this.privateKey = data.privateKey;
    this.publicKey = data.publicKey;
  }
}

describe('Secp256k1KeyStringPair class tests', function () {
  it('create new key string pair objects', async () => {
    const key = new Secp256k1KeyStringPair({
      privateKey: new Secp256k1PrivateKey(
        '208a39787da39e9f78b54aeb2ff38812bbd8ad822485c3a8784adbf84c805725',
      ),
      publicKey: new Secp256k1PublicKey(
        '04a07317ce3131e9aa055d28f68c082a836f72712596c18295b9d7e8d1d9f440da1fd3c39c31dda7925773cf9aae5c3f405148f65713056539317077e1498313fe',
      ),
    });
    assert.throws(() => {
      const key = new Secp256k1KeyStringPair({
        privateKey: new Secp256k1PrivateKey('hello'),
        publicKey: new Secp256k1PublicKey('good bye'),
      });
    }, ClassPropertyValidationError);
  });
});
