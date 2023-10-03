import { ModeOfOperation, utils as AESUtils } from 'aes-js';
import { BN } from 'bn.js';
import { assert } from 'chai';
import { SHA256 } from 'crypto-js';
import { DEFAULT_BABYJUB_PRIVATE_KEY_STRING } from '../constants/VotingConstants';
import { BabyJubBasePoint } from './BabyJubBasePoint';
import { BabyJubKeyStringPair } from './BabyJubKeyStringPair';
import { BabyJubPrivateKey } from './BabyJubPrivateKey';
import { BabyJubPublicKey } from './BabyJubPublicKey';
import { FFMathUtility } from './FFMathUtility';

export class BabyJubUtility {
  private static randomPrivateKeyString() {
    const buffer: Array<number> = new Array(
      FFMathUtility.MAX_BABYJUB_PRIVATE_KEY_HEX_LENGTH,
    );
    for (let i = 0; i < buffer.length; ++i) {
      buffer[i] = Math.floor(Math.random() * 16);
    }
    return buffer.map((x) => x.toString(16)).join('');
  }

  private static randomPublicKeyString() {
    const buffer: Array<number> = new Array(
      FFMathUtility.MAX_BABYJUB_PRIVATE_KEY_HEX_LENGTH * 2,
    );
    for (let i = 0; i < buffer.length; ++i) {
      buffer[i] = Math.floor(Math.random() * 16);
    }
    return buffer.map((x) => x.toString(16)).join('');
  }

  private static foldTo16Bytes(bytes: Uint8Array): Uint8Array {
    while (bytes.length > 16) {
      bytes[bytes.length - 17] =
        Number(bytes[bytes.length - 17]) ^ Number(bytes[bytes.length - 1]);
      bytes = bytes.slice(0, bytes.length - 1);
    }
    return bytes;
  }

  static genKeyPair(): BabyJubKeyStringPair {
    const privateKeyStr = BabyJubUtility.randomPrivateKeyString();
    const publicKeyPoint = FFMathUtility.mulPointEscalar(
      FFMathUtility.getBabyJubGenerator(),
      new BN(privateKeyStr, 'hex').toString(10),
    );
    const publicKeyStr = FFMathUtility.PointToHex(publicKeyPoint);
    const decryptedPoint = FFMathUtility.PointFromHex(publicKeyStr);
    assert.equal(
      decryptedPoint.flat().toString() == publicKeyPoint.flat().toString(),
      true,
    );
    assert.equal(
      FFMathUtility.PointToHex(publicKeyPoint) == publicKeyStr,
      true,
    );
    return new BabyJubKeyStringPair({
      privateKey: new BabyJubPrivateKey(privateKeyStr),
      publicKey: new BabyJubPublicKey(publicKeyStr),
    });
  }

  static getDefaultPublicKey(): BabyJubPublicKey {
    const publicKeyStr = FFMathUtility.PointToHex(
      FFMathUtility.mulPointEscalar(
        FFMathUtility.getBabyJubGenerator(),
        new BN(DEFAULT_BABYJUB_PRIVATE_KEY_STRING, 'hex').toString(10),
      ),
    );
    return new BabyJubPublicKey(publicKeyStr);
  }
  static getDefaultPrivateKey(): BabyJubPrivateKey {
    return new BabyJubPrivateKey(DEFAULT_BABYJUB_PRIVATE_KEY_STRING);
  }

  static getGenerator(): BabyJubBasePoint {
    return new BabyJubBasePoint(FFMathUtility.getBabyJubGenerator());
  }

  // ECC algorithms
  static ecdhEncrypt(
    sender_priKey: BabyJubPrivateKey,
    receiver_pubkey: BabyJubPublicKey,
    message: string,
  ): string {
    // TODO: @galin-chung-nguyen should use a random value for safer encryption
    const sharedKey = FFMathUtility.PointToHex(
      receiver_pubkey.toBasePoint().mul(sender_priKey.toBN()).getRawPoint(),
    );

    // CBC - Cipher-Block Chaining (recommended)

    // The initialization vector (must be 16 bytes)
    const iv: number[] = [];
    for (let i = 0; i < 16; ++i) iv.push(i);

    const sharedKeyBytes = BabyJubUtility.foldTo16Bytes(
      AESUtils.hex.toBytes(sharedKey),
    );

    const messageBytes = Array.from(AESUtils.utf8.toBytes(message));
    while (messageBytes.length % 16 !== 0) messageBytes.push(0);

    const aesCbc = new ModeOfOperation.cbc(sharedKeyBytes, iv);

    const cipherText = AESUtils.hex.fromBytes(aesCbc.encrypt(messageBytes));

    return cipherText;
  }

  static ecdhDecrypt(
    receiver_priKey: BabyJubPrivateKey,
    sender_pubkey: BabyJubPublicKey,
    cipherText: string,
  ): string {
    const sharedKey = FFMathUtility.PointToHex(
      sender_pubkey.toBasePoint().mul(receiver_priKey.toBN()).getRawPoint(),
    );

    // CBC - Cipher-Block Chaining (recommended)

    // The initialization vector (must be 16 bytes)
    const iv: number[] = [];
    for (let i = 0; i < 16; ++i) iv.push(i);

    const sharedKeyBytes = BabyJubUtility.foldTo16Bytes(
      AESUtils.hex.toBytes(sharedKey),
    );

    const cipherTextBytes = AESUtils.hex.toBytes(cipherText);

    const aesCbc = new ModeOfOperation.cbc(sharedKeyBytes, iv);

    let plainText = AESUtils.utf8.fromBytes(aesCbc.decrypt(cipherTextBytes));

    while (plainText.length > 0 && plainText[plainText.length - 1] == '\x00')
      plainText = plainText.slice(0, -1);

    return plainText;
  }

  static ecdsaSign(privateKey: BabyJubPrivateKey, message: string): string {
    const msgBytes = BabyJubUtility.foldTo16Bytes(
      AESUtils.utf8.toBytes(SHA256(message).toString()),
    );

    return FFMathUtility.PointToHex(
      FFMathUtility.mulPointEscalar(
        privateKey.toPublicKey().toCurvePoint(),
        new BN(msgBytes).toString(10),
      ),
    );
  }

  static ecdsaVerify(
    publicKey: BabyJubPublicKey,
    message: string,
    signature: string,
  ): boolean {
    const msgBytes = BabyJubUtility.foldTo16Bytes(
      AESUtils.utf8.toBytes(SHA256(message).toString()),
    );

    const generatedSignature = FFMathUtility.PointToHex(
      FFMathUtility.mulPointEscalar(
        publicKey.toCurvePoint(),
        new BN(msgBytes).toString(10),
      ),
    );

    return signature === generatedSignature;
  }
}
