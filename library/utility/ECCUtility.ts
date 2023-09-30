import { assert } from 'chai';
import { Secp256k1BasePoint } from 'library/Secp256k1/Secp256k1BasePoint';
import { Secp256k1KeyStringPair } from 'library/Secp256k1/Secp256k1KeyStringPair';
import { Secp256k1PrivateKey } from 'library/Secp256k1/Secp256k1PrivateKey';
import { Secp256k1PublicKey } from 'library/Secp256k1/Secp256k1PublicKey';
import { Secp256k1Utility } from 'library/Secp256k1/Secp256k1Utility';
import { BasePoint } from '../interfaces/BasePoint';
import { ECCKeyStringPair } from '../interfaces/ECCKeyStringPair';
import { ECCPrivateKeyInterface } from '../interfaces/ECCPrivateKey';
import { ECCPublicKeyInterface } from '../interfaces/ECCPublicKey';

export class ECCUtility {
  // getGenerator
  static getGenerator<P extends BasePoint<P>>(): BasePoint<P>;
  static getGenerator<Secp256k1BasePoint>(): BasePoint<Secp256k1BasePoint> {
    return Secp256k1Utility.getGenerator();
  }

  // getDefaultPublicKey
  static getDefaultPublicKey<
    P extends BasePoint<P>,
  >(): ECCPublicKeyInterface<P>;
  static getDefaultPublicKey<Secp256k1BasePoint>(): Secp256k1PublicKey {
    return Secp256k1Utility.getDefaultPublicKey();
  }

  // getDefaultPrivateKey
  static getDefaultPrivateKey<
    P extends BasePoint<P>,
  >(): ECCPrivateKeyInterface<P>;
  static getDefaultPrivateKey<Secp256k1BasePoint>(): Secp256k1PrivateKey {
    return Secp256k1Utility.getDefaultPrivateKey();
  }

  // genKeyPair
  static genKeyPair<P extends BasePoint<P>>(): ECCKeyStringPair<P>;
  static genKeyPair<Secp256k1BasePoint>(): Secp256k1KeyStringPair {
    return Secp256k1Utility.genKeyPair();
  }

  // ecdhEncrypt
  static ecdhEncrypt<P extends BasePoint<P>>(
    sender_priKey: ECCPrivateKeyInterface<P>,
    receiver_pubkey: ECCPublicKeyInterface<P>,
    message: string,
  ): string;
  static ecdhEncrypt<Secp256k1BasePoint>(
    sender_priKey: Secp256k1PrivateKey,
    receiver_pubkey: Secp256k1PublicKey,
    message: string,
  ): string {
    return Secp256k1Utility.ecdhEncrypt(
      sender_priKey,
      receiver_pubkey,
      message,
    );
  }

  // ecdhDecrypt
  static ecdhDecrypt<P extends BasePoint<P>>(
    receiver_priKey: ECCPrivateKeyInterface<P>,
    sender_pubkey: ECCPublicKeyInterface<P>,
    cipherText: string,
  ): string;
  static ecdhDecrypt<Secp256k1BasePoint>(
    receiver_priKey: Secp256k1PrivateKey,
    sender_pubkey: Secp256k1PublicKey,
    cipherText: string,
  ): string {
    return Secp256k1Utility.ecdhDecrypt(
      receiver_priKey,
      sender_pubkey,
      cipherText,
    );
  }

  //ecdsaSign
  static ecdsaSign<P extends BasePoint<P>>(
    privateKey: ECCPrivateKeyInterface<P>,
    message: string,
  ): string;
  static ecdsaSign<Secp256k1BasePoint>(
    privateKey: Secp256k1PrivateKey,
    message: string,
  ): string {
    return Secp256k1Utility.ecdsaSign(privateKey, message);
  }

  // ecdsaVerify
  static ecdsaVerify<P extends BasePoint<P>>(
    publicKey: ECCPublicKeyInterface<P>,
    message: string,
    signature: string,
  ): boolean;
  static ecdsaVerify<Secp256k1BasePoint>(
    publicKey: Secp256k1PublicKey,
    message: string,
    signature: string,
  ): boolean {
    return Secp256k1Utility.ecdsaVerify(publicKey, message, signature);
  }
}

describe('ECCUtility lib', function () {
  this.timeout(100000);

  before(async () => {
    return;
  });

  it('ECDH test', () => {
    const testRunner = <P extends BasePoint<P>>() => {
      const sender = ECCUtility.genKeyPair();
      const receiver = ECCUtility.genKeyPair();

      const plainText =
        '{"degree":{"type":"BachelorDegree","name":"Bachelor of Science and Arts"},"class":2025,"year":2024,"school_name":"HCMUS"}';
      const cipherText: string = ECCUtility.ecdhEncrypt(
        sender.getPrivateKey(),
        receiver.getPublicKey(),
        plainText,
      );
      const decryptedPlaintext: string = ECCUtility.ecdhDecrypt(
        receiver.getPrivateKey(),
        sender.getPublicKey(),
        cipherText,
      );

      assert.equal(plainText.trim(), decryptedPlaintext.trim());
    };

    testRunner<Secp256k1BasePoint>();
  });

  it('ECDSA test', async () => {
    const testRunner = <P extends BasePoint<P>>() => {
      // Generate keys
      const signer = ECCUtility.genKeyPair();
      const plainText = 'Hello World, this is ECDSA!';
      const signature: string = ECCUtility.ecdsaSign(
        signer.getPrivateKey(),
        plainText,
      );
      const result: boolean = ECCUtility.ecdsaVerify(
        signer.getPublicKey(),
        plainText,
        signature,
      );

      assert.equal(result, true);
    };

    testRunner<Secp256k1BasePoint>();
  });
});
