import { utils as AESUtils, ModeOfOperation } from 'aes-js';
import { SHA256 } from 'crypto-js';
import { ec as EC } from 'elliptic';
import { assert } from 'chai';
import { Secp256k1KeyStringPair } from './interfaces/Secp256k1KeyStringPair.type';
const ec: EC = new EC('secp256k1');

export function getPublicKeyHex(keyPair: EC.KeyPair): string {
  return keyPair.getPublic('hex'); // compressed = true
}
export function getPrivateKeyHex(keyPair: EC.KeyPair): string {
  return keyPair.getPrivate().toString(16);
}

export function foldTo16Bytes(bytes: Uint8Array): Uint8Array {
  while (bytes.length > 16) {
    bytes[bytes.length - 17] =
      Number(bytes[bytes.length - 17]) ^ Number(bytes[bytes.length - 1]);
    bytes = bytes.slice(0, bytes.length - 1);
  }
  return bytes;
}

export function ecdhEncrypt(
  sender_priKey: string,
  receiver_pubkey: string,
  message: string,
): string {
  const sharedKey = ec
    .keyFromPublic(receiver_pubkey, 'hex')
    .getPublic()
    .mul(ec.keyFromPrivate(sender_priKey).getPrivate())
    .encode('hex', false);

  // CBC - Cipher-Block Chaining (recommended)

  // The initialization vector (must be 16 bytes)
  const iv = [];
  for (let i = 0; i < 16; ++i) iv.push(i);

  const sharedKeyBytes = foldTo16Bytes(AESUtils.hex.toBytes(sharedKey));

  const messageBytes = Array.from(AESUtils.utf8.toBytes(message));
  while (messageBytes.length % 16 !== 0) messageBytes.push(0);

  const aesCbc = new ModeOfOperation.cbc(sharedKeyBytes, iv);

  const cipherText = AESUtils.hex.fromBytes(aesCbc.encrypt(messageBytes));

  return cipherText;
}

export function ecdhDecrypt(
  receiver_priKey: any,
  sender_pubkey: any,
  cipherText: string,
): string {
  const sharedKey = ec
    .keyFromPublic(sender_pubkey, 'hex')
    .getPublic()
    .mul(ec.keyFromPrivate(receiver_priKey).getPrivate())
    .encode('hex', false);

  // CBC - Cipher-Block Chaining (recommended)

  // The initialization vector (must be 16 bytes)
  const iv = [];
  for (let i = 0; i < 16; ++i) iv.push(i);

  const sharedKeyBytes = foldTo16Bytes(AESUtils.hex.toBytes(sharedKey));

  const cipherTextBytes = AESUtils.hex.toBytes(cipherText);

  const aesCbc = new ModeOfOperation.cbc(sharedKeyBytes, iv);

  let plainText = AESUtils.utf8.fromBytes(aesCbc.decrypt(cipherTextBytes));

  while (plainText.length > 0 && plainText[plainText.length - 1] == '\x00')
    plainText = plainText.slice(0, -1);

  return plainText;
}

export function ecdsaSign(privateKey: string, message: string): string {
  const msgBytes = foldTo16Bytes(
    AESUtils.utf8.toBytes(SHA256(message).toString()),
  );

  return AESUtils.hex.fromBytes(
    ec.keyFromPrivate(privateKey).sign(msgBytes).toDER(),
  );
}

export function ecdsaVerify(
  publicKey: string,
  message: string,
  signature: string,
): boolean {
  const msgBytes: Uint8Array = foldTo16Bytes(
    AESUtils.utf8.toBytes(SHA256(message).toString()),
  );

  const signatureDER = AESUtils.hex.toBytes(signature);
  return ec.keyFromPublic(publicKey, 'hex').verify(msgBytes, signatureDER);
}

export function genKeyPair(): Secp256k1KeyStringPair {
  const key = ec.genKeyPair();
  return new Secp256k1KeyStringPair({
    privateKey: getPrivateKeyHex(key),
    publicKey: getPublicKeyHex(key),
  });
}

describe('Secp256k1 lib', function () {
  this.timeout(100000);

  before(async () => {
    return;
  });

  it('ECDH with secp256k1', async () => {
    // Generate keys
    const sender = genKeyPair();
    const receiver = genKeyPair();

    const plainText =
      '{"degree":{"type":"BachelorDegree","name":"Bachelor of Science and Arts"},"class":2025,"year":2024,"school_name":"HCMUS"}';
    const cipherText: string = ecdhEncrypt(
      sender.privateKey,
      receiver.publicKey,
      plainText,
    );
    const decryptedPlaintext: string = ecdhDecrypt(
      receiver.privateKey,
      sender.publicKey,
      cipherText,
    );

    assert.equal(plainText.trim(), decryptedPlaintext.trim());
  });

  it('ECDSA with secp256k1', async () => {
    // Generate keys
    const signer = genKeyPair();
    const plainText = 'Hello World, this is ECDSA!';
    const signature: string = ecdsaSign(signer.privateKey, plainText);
    const result: boolean = ecdsaVerify(signer.publicKey, plainText, signature);

    assert.equal(result, true);
  });
});
