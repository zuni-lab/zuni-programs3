import {
  BaseClassValidator,
  ClassPropertyValidationError,
} from './BaseClassValidator';
import { assert } from 'chai';
import { IsHexadecimalWithoutPrefix } from './IsHexadecimalWithoutPrefix';
import { Length, Validate } from 'class-validator';

export class Secp256k1KeyStringPair extends BaseClassValidator {
  @Validate(IsHexadecimalWithoutPrefix)
  @Length(63, 64)
  privateKey: string;

  @Validate(IsHexadecimalWithoutPrefix)
  @Length(129, 130)
  publicKey: string;

  constructor(data: Partial<Secp256k1KeyStringPair>) {
    super(data);
    Object.assign(this, data);
  }
}

describe('Secp256k1KeyStringPair class tests', function () {
  it('create new key string pair objects', async () => {
    const key = new Secp256k1KeyStringPair({
      privateKey:
        '208a39787da39e9f78b54aeb2ff38812bbd8ad822485c3a8784adbf84c805725',
      publicKey:
        '04a07317ce3131e9aa055d28f68c082a836f72712596c18295b9d7e8d1d9f440da1fd3c39c31dda7925773cf9aae5c3f405148f65713056539317077e1498313fe',
    });
    assert.throws(() => {
      const key = new Secp256k1KeyStringPair({
        privateKey: 'hello',
        publicKey: 'goodbye',
      });
    }, ClassPropertyValidationError);
  });
});
