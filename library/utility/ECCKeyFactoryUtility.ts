import { ECCKeyStringPair } from 'library/interfaces/ECCKeyStringPair';
import { ECCPrivateKeyInterface } from 'library/interfaces/ECCPrivateKey';
import { ECCPublicKeyInterface } from 'library/interfaces/ECCPublicKey';
import { Secp256k1KeyStringPair } from 'library/Secp256k1/Secp256k1KeyStringPair';
import { Secp256k1PrivateKey } from 'library/Secp256k1/Secp256k1PrivateKey';
import { Secp256k1PublicKey } from 'library/Secp256k1/Secp256k1PublicKey';
import { BasePoint } from '../interfaces/BasePoint';

// use this instead of constructors in generic functions
export class ECCKeyFactoryUtility {
  // newPublicKey
  static newPublicKey<P extends BasePoint<P>>(
    publicKeyString: string,
  ): ECCPublicKeyInterface<P>;
  static newPublicKey<Secp256k1BasePoint>(
    publicKeyString: string,
  ): Secp256k1PublicKey {
    return new Secp256k1PublicKey(publicKeyString);
  }

  // newPrivateKey
  static newPrivateKey<P extends BasePoint<P>>(
    privateKeyString: string,
  ): ECCPrivateKeyInterface<P>;
  static newPrivateKey<Secp256k1BasePoint>(
    privateKeyString: string,
  ): Secp256k1PrivateKey {
    return new Secp256k1PrivateKey(privateKeyString);
  }

  // newKeyPair
  static newKeyPair<P extends BasePoint<P>>(
    privateKey: ECCPrivateKeyInterface<P>,
    publicKey: ECCPublicKeyInterface<P>,
  ): ECCKeyStringPair<P>;
  static newKeyPair<Secp256k1BasePoint>(
    privateKey: Secp256k1PrivateKey,
    publicKey: Secp256k1PublicKey,
  ): Secp256k1KeyStringPair {
    return new Secp256k1KeyStringPair({
      privateKey,
      publicKey,
    });
  }

  // newKeyPairFromKeyStrings
  static newKeyPairFromKeyStrings<P extends BasePoint<P>>(
    privateKey: string,
    publicKey: string,
  ): ECCKeyStringPair<P>;
  static newKeyPairFromKeyStrings<Secp256k1BasePoint>(
    privateKey: string,
    publicKey: string,
  ): Secp256k1KeyStringPair {
    return new Secp256k1KeyStringPair({
      privateKey: new Secp256k1PrivateKey(privateKey),
      publicKey: new Secp256k1PublicKey(publicKey),
    });
  }
}
