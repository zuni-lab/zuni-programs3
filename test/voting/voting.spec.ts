import assert from 'assert';
import {
  ecdhDecrypt,
  ecdhEncrypt,
  ecdsaSign,
  ecdsaVerify,
  genKeyPair,
} from 'src/crypto_lib';

describe('Crypto functions', function () {
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
      sender.private_key,
      receiver.public_key,
      plainText,
    );
    const decryptedPlaintext: string = ecdhDecrypt(
      receiver.private_key,
      sender.public_key,
      cipherText,
    );

    assert.equal(plainText.trim(), decryptedPlaintext.trim());
  });

  it('ECDSA with secp256k1', async () => {
    // Generate keys
    const signer = genKeyPair();
    const plainText = 'Hello World, this is ECDSA!';
    const signature: string = ecdsaSign(signer.private_key, plainText);
    const result: boolean = ecdsaVerify(
      signer.public_key,
      plainText,
      signature,
    );

    assert.equal(result, true);
  });
});
