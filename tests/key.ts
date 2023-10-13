import aesjs from 'aes-js';
import { expect } from 'chai';
import { ec as EC } from 'elliptic';

function ecdhEncrypt(
  sender: EC.KeyPair,
  receiverPubkey: string,
  message: string,
): string {
  const ec = new EC('secp256k1');
  const receiver = ec.keyFromPublic(receiverPubkey, 'hex');
  const sharedKey = sender.derive(receiver.getPublic()).toArray();

  const aesCtr = new aesjs.ModeOfOperation.ctr(sharedKey);

  const messageBytes = aesjs.utils.utf8.toBytes(message);
  const encryptedBytes = aesCtr.encrypt(messageBytes);
  const cipherText = aesjs.utils.hex.fromBytes(encryptedBytes);

  return cipherText;
}

function ecdhDecrypt(
  receiver: EC.KeyPair,
  senderPubkey: string,
  cipherText: string,
): string {
  const ec = new EC('secp256k1');

  const sender = ec.keyFromPublic(senderPubkey, 'hex');
  const sharedKey = receiver.derive(sender.getPublic()).toArray();

  const aesCtr = new aesjs.ModeOfOperation.ctr(sharedKey);

  const encryptedBytes = aesjs.utils.hex.toBytes(cipherText);
  const decryptedBytes = aesCtr.decrypt(encryptedBytes);
  const message = aesjs.utils.utf8.fromBytes(decryptedBytes);

  return message;
}

describe.only('Test key', () => {
  it('Encrypt - Decrypt', () => {
    const ec = new EC('secp256k1');
    const sender = ec.genKeyPair();
    const receiver = ec.genKeyPair();

    const data = sender.getPrivate('hex');

    const encrypted = ecdhEncrypt(sender, receiver.getPublic('hex'), data);
    const decrypted = ecdhDecrypt(receiver, sender.getPublic('hex'), encrypted);

    expect(decrypted).to.equal(data);
  });
});
