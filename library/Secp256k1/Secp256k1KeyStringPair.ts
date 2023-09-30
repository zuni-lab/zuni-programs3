import { BaseClassValidator } from 'library/interfaces/BaseClassValidator';
import { ECCKeyStringPair } from 'library/interfaces/ECCKeyStringPair';
import { ECCPrivateKeyInterface } from 'library/interfaces/ECCPrivateKey';
import { ECCPublicKeyInterface } from 'library/interfaces/ECCPublicKey';
import { Secp256k1BasePoint } from './Secp256k1BasePoint';
import { Secp256k1PrivateKey } from './Secp256k1PrivateKey';
import { Secp256k1PublicKey } from './Secp256k1PublicKey';

export class Secp256k1KeyStringPair
  extends BaseClassValidator<Secp256k1KeyStringPair>
  implements ECCKeyStringPair<Secp256k1BasePoint>
{
  privateKey: Secp256k1PrivateKey;
  publicKey: Secp256k1PublicKey;

  constructor(data: {
    privateKey: Secp256k1PrivateKey;
    publicKey: Secp256k1PublicKey;
  }) {
    super(data);
    this.privateKey = data.privateKey;
    this.publicKey = data.publicKey;
  }

  getPublicKey(): ECCPublicKeyInterface<Secp256k1BasePoint> {
    return this.publicKey.clone();
  }

  getPrivateKey(): ECCPrivateKeyInterface<Secp256k1BasePoint> {
    return this.privateKey;
  }

  clone(): Secp256k1KeyStringPair {
    return new Secp256k1KeyStringPair({
      publicKey: this.publicKey.clone(),
      privateKey: this.privateKey.clone(),
    });
  }
}
