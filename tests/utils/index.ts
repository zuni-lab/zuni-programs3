import { web3 } from '@coral-xyz/anchor';
import { keccak_256 } from '@noble/hashes/sha3';

export const MULTIBASE_PREFIX = {
  base64: 'm',
  base58btc: 'z',
  hex: 'h',
};

export const KEY_TYPE = {
  secp256k1: 'EcdsaSecp256k1VerificationKey2019',
  ed25519: 'Ed25519VerificationKey2018',
};

export const genKeyIds = (numberOfKeys: number, did: string) => {
  const keyIds: string[] = [];
  for (let i = 0; i < numberOfKeys; i++) {
    keyIds.push(`${did}#key-${i}`);
  }
  return keyIds;
};

export const findVerificationPdasWithKeyIds = (
  programId: web3.PublicKey,
  did: string,
  keyIds: string[],
) => {
  let verificationPdas: web3.PublicKey[] = [];
  for (const keyId of keyIds) {
    const [verificationPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from(keccak_256(did + keyId))],
      programId,
    );
    verificationPdas.push(verificationPda);
  }
  return verificationPdas;
};
