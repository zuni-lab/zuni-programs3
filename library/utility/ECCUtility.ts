import { assert } from 'chai';
import {
  BabyJubBasePoint,
  BabyJubCurvePoint,
} from 'library/BabyJub/BabyJubBasePoint';
import { BabyJubKeyStringPair } from 'library/BabyJub/BabyJubKeyStringPair';
import { BabyJubPrivateKey } from 'library/BabyJub/BabyJubPrivateKey';
import { BabyJubPublicKey } from 'library/BabyJub/BabyJubPublicKey';
import { BabyJubUtility } from 'library/BabyJub/BabyJubUtility';
import { FFMathUtility } from 'library/BabyJub/FFMathUtility';
import { ECCCurvePoint } from 'library/interfaces/BasePoint';
import { InvalidContextError } from 'library/interfaces/InvalidContextError';
import {
  Secp256k1BasePoint,
  Secp256k1CurvePoint,
} from 'library/Secp256k1/Secp256k1BasePoint';
import { Secp256k1KeyStringPair } from 'library/Secp256k1/Secp256k1KeyStringPair';
import { Secp256k1PrivateKey } from 'library/Secp256k1/Secp256k1PrivateKey';
import { Secp256k1PublicKey } from 'library/Secp256k1/Secp256k1PublicKey';
import { Secp256k1Utility } from 'library/Secp256k1/Secp256k1Utility';
import { BasePoint } from '../interfaces/BasePoint';
import { ECCKeyStringPair } from '../interfaces/ECCKeyStringPair';
import { ECCPrivateKeyInterface } from '../interfaces/ECCPrivateKey';
import { ECCPublicKeyInterface } from '../interfaces/ECCPublicKey';
import { CurvePointBasedUtility } from './CurvePointBasedUtility';

export class ECCUtility extends CurvePointBasedUtility {
  // newPublicKey
  static newPublicKey<P extends ECCCurvePoint>(
    publicKeyString: string,
  ): ECCPublicKeyInterface<P> {
    const context = ECCUtility.assertContextInitialized();
    //
    if (context instanceof Secp256k1BasePoint) {
      return new Secp256k1PublicKey(
        publicKeyString,
      ) as any as ECCPublicKeyInterface<P>;
    } else if (context instanceof BabyJubBasePoint) {
      return new BabyJubPublicKey(
        publicKeyString,
      ) as any as ECCPublicKeyInterface<P>;
    } else {
      throw new InvalidContextError(
        `${context} is not a valid curve point context`,
      );
    }
  }

  // newPrivateKey
  static newPrivateKey<P extends ECCCurvePoint>(
    privateKeyString: string,
  ): ECCPrivateKeyInterface<P> {
    const context = ECCUtility.assertContextInitialized();
    //
    if (context instanceof Secp256k1BasePoint) {
      return new Secp256k1PrivateKey(
        privateKeyString,
      ) as any as ECCPrivateKeyInterface<P>;
    } else if (context instanceof BabyJubBasePoint) {
      return new BabyJubPublicKey(
        privateKeyString,
      ) as any as ECCPrivateKeyInterface<P>;
    } else {
      throw new InvalidContextError(
        `${context} is not a valid curve point context`,
      );
    }
  }

  // newKeyPair
  static newKeyPair<P extends ECCCurvePoint>(
    privateKey: ECCPrivateKeyInterface<P>,
    publicKey: ECCPublicKeyInterface<P>,
  ): ECCKeyStringPair<P> {
    const context = ECCUtility.assertContextInitialized();
    //
    if (context instanceof Secp256k1BasePoint) {
      return new Secp256k1KeyStringPair({
        privateKey: privateKey as any as Secp256k1PrivateKey,
        publicKey: publicKey as any as Secp256k1PublicKey,
      }) as any as ECCKeyStringPair<P>;
    } else if (context instanceof BabyJubBasePoint) {
      return new BabyJubKeyStringPair({
        privateKey: privateKey as any as BabyJubPrivateKey,
        publicKey: publicKey as any as BabyJubPublicKey,
      }) as any as ECCKeyStringPair<P>;
    } else {
      throw new InvalidContextError(
        `${context} is not a valid curve point context`,
      );
    }
  }

  // newKeyPairFromKeyStrings
  static newKeyPairFromKeyStrings<P extends ECCCurvePoint>(
    privateKey: string,
    publicKey: string,
  ): ECCKeyStringPair<P> {
    const context = ECCUtility.assertContextInitialized();
    //
    if (context instanceof Secp256k1BasePoint) {
      return new Secp256k1KeyStringPair({
        privateKey: new Secp256k1PrivateKey(privateKey),
        publicKey: new Secp256k1PublicKey(publicKey),
      }) as any as ECCKeyStringPair<P>;
    } else if (context instanceof BabyJubBasePoint) {
      return new BabyJubKeyStringPair({
        privateKey: new BabyJubPrivateKey(privateKey),
        publicKey: new BabyJubPublicKey(publicKey),
      }) as any as ECCKeyStringPair<P>;
    } else {
      throw new InvalidContextError(
        `${context} is not a valid curve point context`,
      );
    }
  }

  // getGenerator
  static getGenerator<P extends ECCCurvePoint>(): BasePoint<P> {
    const context = ECCUtility.assertContextInitialized();
    //
    if (context instanceof Secp256k1BasePoint) {
      return Secp256k1Utility.getGenerator() as any as BasePoint<P>;
    } else if (context instanceof BabyJubBasePoint) {
      return new BabyJubBasePoint(
        FFMathUtility.getBabyJubGenerator(),
      ) as any as BasePoint<P>;
    } else {
      throw new InvalidContextError(
        `${context} is not a valid curve point context`,
      );
    }
  }

  // getDefaultPublicKey
  static getDefaultPublicKey<
    P extends ECCCurvePoint,
  >(): ECCPublicKeyInterface<P> {
    const context = ECCUtility.assertContextInitialized();
    //
    if (context instanceof Secp256k1BasePoint) {
      return Secp256k1Utility.getDefaultPublicKey() as any as ECCPublicKeyInterface<P>;
    } else if (context instanceof BabyJubBasePoint) {
      return BabyJubUtility.getDefaultPublicKey() as any as ECCPublicKeyInterface<P>;
    } else {
      throw new InvalidContextError(
        `${context} is not a valid curve point context`,
      );
    }
  }

  // getDefaultPrivateKey
  static getDefaultPrivateKey<
    P extends ECCCurvePoint,
  >(): ECCPrivateKeyInterface<P> {
    const context = ECCUtility.assertContextInitialized();
    //
    if (context instanceof Secp256k1BasePoint) {
      return Secp256k1Utility.getDefaultPrivateKey() as any as ECCPrivateKeyInterface<P>;
    } else if (context instanceof BabyJubBasePoint) {
      return BabyJubUtility.getDefaultPrivateKey() as any as ECCPrivateKeyInterface<P>;
    } else {
      throw new InvalidContextError(
        `${context} is not a valid curve point context`,
      );
    }
  }

  // genKeyPair
  static genKeyPair<P extends ECCCurvePoint>(): ECCKeyStringPair<P> {
    const context = ECCUtility.assertContextInitialized();
    //
    if (context instanceof Secp256k1BasePoint) {
      return Secp256k1Utility.genKeyPair() as any as ECCKeyStringPair<P>;
    } else if (context instanceof BabyJubBasePoint) {
      return BabyJubUtility.genKeyPair() as any as ECCKeyStringPair<P>;
    } else {
      throw new InvalidContextError(
        `${context} is not a valid curve point context`,
      );
    }
  }

  // ecdhEncrypt
  static ecdhEncrypt<P extends ECCCurvePoint>(
    sender_priKey: ECCPrivateKeyInterface<P>,
    receiver_pubkey: ECCPublicKeyInterface<P>,
    message: string,
  ): string {
    const context = ECCUtility.assertContextInitialized();
    //
    if (context instanceof Secp256k1BasePoint) {
      return Secp256k1Utility.ecdhEncrypt(
        sender_priKey as any as Secp256k1PrivateKey,
        receiver_pubkey as any as Secp256k1PublicKey,
        message,
      );
    } else if (context instanceof BabyJubBasePoint) {
      return BabyJubUtility.ecdhEncrypt(
        sender_priKey as any as BabyJubPrivateKey,
        receiver_pubkey as any as BabyJubPublicKey,
        message,
      );
    } else {
      throw new InvalidContextError(
        `${context} is not a valid curve point context`,
      );
    }
  }
  // ecdhDecrypt
  static ecdhDecrypt<P extends ECCCurvePoint>(
    receiver_priKey: ECCPrivateKeyInterface<P>,
    sender_pubkey: ECCPublicKeyInterface<P>,
    cipherText: string,
  ): string {
    const context = ECCUtility.assertContextInitialized();
    //
    if (context instanceof Secp256k1BasePoint) {
      return Secp256k1Utility.ecdhDecrypt(
        receiver_priKey as any as Secp256k1PrivateKey,
        sender_pubkey as any as Secp256k1PublicKey,
        cipherText,
      );
    } else if (context instanceof BabyJubBasePoint) {
      return BabyJubUtility.ecdhDecrypt(
        receiver_priKey as any as BabyJubPrivateKey,
        sender_pubkey as any as BabyJubPublicKey,
        cipherText,
      );
    } else {
      throw new InvalidContextError(
        `${context} is not a valid curve point context`,
      );
    }
  }

  //ecdsaSign
  static ecdsaSign<P extends ECCCurvePoint>(
    privateKey: ECCPrivateKeyInterface<P>,
    message: string,
  ): string {
    const context = ECCUtility.assertContextInitialized();
    //
    if (context instanceof Secp256k1BasePoint) {
      return Secp256k1Utility.ecdsaSign(
        privateKey as any as Secp256k1PrivateKey,
        message,
      );
    } else if (context instanceof BabyJubBasePoint) {
      return BabyJubUtility.ecdsaSign(
        privateKey as any as BabyJubPrivateKey,
        message,
      );
    } else {
      throw new InvalidContextError(
        `${context} is not a valid curve point context`,
      );
    }
  }

  // ecdsaVerify
  static ecdsaVerify<P extends ECCCurvePoint>(
    publicKey: ECCPublicKeyInterface<P>,
    message: string,
    signature: string,
  ): boolean {
    const context = ECCUtility.assertContextInitialized();
    //
    if (context instanceof Secp256k1BasePoint) {
      return Secp256k1Utility.ecdsaVerify(
        publicKey as any as Secp256k1PublicKey,
        message,
        signature,
      );
    } else if (context instanceof BabyJubBasePoint) {
      return BabyJubUtility.ecdsaVerify(
        publicKey as any as BabyJubPublicKey,
        message,
        signature,
      );
    } else {
      throw new InvalidContextError(
        `${context} is not a valid curve point context`,
      );
    }
  }
}

describe('ECCUtility lib', function () {
  this.timeout(100000);

  before(async () => {
    await FFMathUtility.initialize(); // BabyJub math
  });

  it('ECDH test', () => {
    const testRunner = <_P extends ECCCurvePoint>() => {
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

    ECCUtility.init('secp256k1');
    testRunner<Secp256k1CurvePoint>();
    //
    ECCUtility.init('babyjub');
    testRunner<BabyJubCurvePoint>();
  });

  it('ECDSA test', async () => {
    const testRunner = <_P extends ECCCurvePoint>() => {
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

    ECCUtility.init('secp256k1');
    testRunner<Secp256k1CurvePoint>();
    //
    ECCUtility.init('babyjub');
    testRunner<BabyJubCurvePoint>();
  });
});
