import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { keccak_256 } from '@noble/hashes/sha3';
import { expect } from 'chai';
import { ec as EC } from 'elliptic';
import { VerifiableDataRegistry } from '../target/types/verifiable_data_registry';
import {
  findVerificationPdasWithKeyIds,
  genKeyIds,
  KEY_TYPE,
  MULTIBASE_PREFIX,
} from './utils';

// const ANCHOR_ERROR_ACCOUNT_NOT_INITIALIZED = 'AccountNotInitialized';
const ANCHOR_ERROR_UNAUTHORIZED = 'Unauthorized';

const VERIFICATION_RELATIONSHIP = {
  authentication: {
    discriminator: 'authentication',
    input: { authentication: {} },
  },
  assertion: {
    discriminator: 'assertion',
    input: { assertion: {} },
  },
  keyAgreement: {
    discriminator: 'key_agreement',
    input: { keyAgreement: {} },
  },
};

// const duplicate_err = (address: string) => {
//   return `Allocate: account Address { address: ${address}, base: None } already in use`;
// };

describe('Credential', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .VerifiableDataRegistry as Program<VerifiableDataRegistry>;

  const CREDENTIAL_STATUS = {
    active: {},
    revoked: {},
  };

  describe('addCredential()', () => {
    const did = 'did:zuni:solana:addCredential';
    const [didPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [keccak_256(did)],
      program.programId,
    );
    const keyIds = genKeyIds(1, did);
    const keyType = KEY_TYPE.secp256k1;
    const ec = new EC('secp256k1');
    const verificationKeyPair = ec.genKeyPair();
    const verificationPdas = findVerificationPdasWithKeyIds(
      program.programId,
      did,
      keyIds,
    );
    const verificationPublicKeyMultibase =
      MULTIBASE_PREFIX.hex +
      verificationKeyPair.getPublic().encode('hex', false).slice(2);
    const authenticationId = keyIds[0];
    const verificationPda = verificationPdas[0];
    const [authenticationPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from(
          keccak_256(
            did +
              VERIFICATION_RELATIONSHIP.authentication.discriminator +
              authenticationId,
          ),
        ),
      ],
      program.programId,
    );

    before(async () => {
      await program.methods
        .initializeDid(did)
        .accounts({ didDocument: didPda })
        .rpc();
      await program.methods
        .addVerificationMethod(
          did,
          authenticationId,
          keyType,
          verificationPublicKeyMultibase,
          provider.wallet.publicKey,
        )
        .accounts({
          didDocument: didPda,
          verificationMethod: verificationPda,
        })
        .rpc();

      await program.methods
        .addVerificationRelationship(
          did,
          VERIFICATION_RELATIONSHIP.authentication.input,
          authenticationId,
        )
        .accounts({
          didDocument: didPda,
          verificationMethod: verificationPda,
          verificationRelationship: authenticationPda,
        })
        .rpc();
    });

    it('Should issue credential properly', async () => {
      const credentialId = 'issue1';
      const hashedCredentialId = keccak_256(credentialId);
      const [credentialPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [hashedCredentialId],
        program.programId,
      );
      const expiredAt = new Date().getTime();
      const signature = verificationKeyPair.sign(hashedCredentialId);

      if (signature.recoveryParam === null) {
        throw new Error('recoveryParam is undefined');
      }

      await program.methods
        .addCredential(
          did,
          authenticationId,
          credentialId,
          new anchor.BN(expiredAt),
          signature.recoveryParam,
          [...signature.r.toBuffer(), ...signature.s.toBuffer()],
        )
        .accounts({
          didDocument: didPda,
          verificationMethod: verificationPda,
          authentication: authenticationPda,
          credentialState: credentialPda,
        })
        .rpc();

      const credentialState = await program.account.credentialState.fetch(
        credentialPda,
      );

      expect(credentialState.credentialId === credentialId);
      expect((credentialState.issuerDid = did));
      expect(credentialState.expireAt?.toString() === expiredAt.toString());
      expect(
        credentialState.status.toString() ===
          CREDENTIAL_STATUS.active.toString(),
      );
    });

    it('Fail with wrong signature', async () => {
      try {
        const credentialId = 'issue2';
        const hashedCredentialId = keccak_256(credentialId);
        const [credentialPda] = anchor.web3.PublicKey.findProgramAddressSync(
          [hashedCredentialId],
          program.programId,
        );
        const expiredAt = new Date().getTime();
        const malicious = ec.genKeyPair();
        const signature = malicious.sign(hashedCredentialId);

        if (signature.recoveryParam === null) {
          throw new Error('recoveryParam is undefined');
        }

        await program.methods
          .addCredential(
            did,
            authenticationId,
            credentialId,
            new anchor.BN(expiredAt),
            signature.recoveryParam,
            [...signature.r.toBuffer(), ...signature.s.toBuffer()],
          )
          .accounts({
            didDocument: didPda,
            verificationMethod: verificationPda,
            authentication: authenticationPda,
            credentialState: credentialPda,
          })
          .rpc();
      } catch (error) {
        expect(error.error.errorCode.code === ANCHOR_ERROR_UNAUTHORIZED);
      }
    });
  });

  describe('revokeCredential()', () => {
    const did = 'did:zuni:solana:revokeCredential';
    const [didPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [keccak_256(did)],
      program.programId,
    );
    const keyIds = genKeyIds(1, did);
    const keyType = KEY_TYPE.secp256k1;
    const ec = new EC('secp256k1');
    const verificationKeyPair = ec.genKeyPair();
    const verificationPdas = findVerificationPdasWithKeyIds(
      program.programId,
      did,
      keyIds,
    );
    const verificationPublicKeyMultibase =
      MULTIBASE_PREFIX.hex +
      verificationKeyPair.getPublic().encode('hex', false).slice(2);
    const authenticationId = keyIds[0];
    const verificationPda = verificationPdas[0];
    const [authenticationPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from(
          keccak_256(
            did +
              VERIFICATION_RELATIONSHIP.authentication.discriminator +
              authenticationId,
          ),
        ),
      ],
      program.programId,
    );

    before(async () => {
      await program.methods
        .initializeDid(did)
        .accounts({ didDocument: didPda })
        .rpc();
      await program.methods
        .addVerificationMethod(
          did,
          authenticationId,
          keyType,
          verificationPublicKeyMultibase,
          provider.wallet.publicKey,
        )
        .accounts({
          didDocument: didPda,
          verificationMethod: verificationPda,
        })
        .rpc();

      await program.methods
        .addVerificationRelationship(
          did,
          VERIFICATION_RELATIONSHIP.authentication.input,
          authenticationId,
        )
        .accounts({
          didDocument: didPda,
          verificationMethod: verificationPda,
          verificationRelationship: authenticationPda,
        })
        .rpc();
    });

    it('Should revoke credential properly', async () => {
      const credentialId = 'revoke1';
      const [credentialPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [keccak_256(credentialId)],
        program.programId,
      );
      const issueMsg = keccak_256(credentialId);
      const issueSignature = verificationKeyPair.sign(issueMsg);
      if (issueSignature.recoveryParam === null) {
        throw new Error('recoveryParam is undefined');
      }
      await program.methods
        .addCredential(
          did,
          authenticationId,
          credentialId,
          null,
          issueSignature.recoveryParam,
          [...issueSignature.r.toBuffer(), ...issueSignature.s.toBuffer()],
        )
        .accounts({
          didDocument: didPda,
          verificationMethod: verificationPda,
          authentication: authenticationPda,
          credentialState: credentialPda,
        })
        .rpc();

      const revokeMsg = keccak_256(credentialId + 'REVOKE');
      const revokeSignature = verificationKeyPair.sign(revokeMsg);
      if (revokeSignature.recoveryParam === null) {
        throw new Error('recoveryParam is undefined');
      }

      await program.methods
        .revokeCredential(
          did,
          authenticationId,
          credentialId,
          revokeSignature.recoveryParam,
          [...revokeSignature.r.toBuffer(), ...revokeSignature.s.toBuffer()],
        )
        .accounts({
          didDocument: didPda,
          verificationMethod: verificationPda,
          authentication: authenticationPda,
          credentialState: credentialPda,
        })
        .rpc();

      const credentialState = await program.account.credentialState.fetch(
        credentialPda,
      );
      expect(credentialState.credentialId === credentialId);
      expect((credentialState.issuerDid = did));
      expect(
        credentialState.status.toString() ===
          CREDENTIAL_STATUS.revoked.toString(),
      );
    });

    it('Fail with wrong signature', async () => {
      try {
        const credentialId = 'revoke2';
        const [credentialPda] = anchor.web3.PublicKey.findProgramAddressSync(
          [keccak_256(credentialId)],
          program.programId,
        );
        const issueMsg = keccak_256(credentialId);
        const issueSignature = verificationKeyPair.sign(issueMsg);
        if (issueSignature.recoveryParam === null) {
          throw new Error('recoveryParam is undefined');
        }
        await program.methods
          .addCredential(
            did,
            authenticationId,
            credentialId,
            null,
            issueSignature.recoveryParam,
            [...issueSignature.r.toBuffer(), ...issueSignature.s.toBuffer()],
          )
          .accounts({
            didDocument: didPda,
            verificationMethod: verificationPda,
            authentication: authenticationPda,
            credentialState: credentialPda,
          })
          .rpc();

        const revokeMsg = keccak_256(credentialId + 'REVOKE');
        const malicious = ec.genKeyPair();
        const revokeSignature = malicious.sign(revokeMsg);
        if (revokeSignature.recoveryParam === null) {
          throw new Error('recoveryParam is undefined');
        }

        await program.methods
          .revokeCredential(
            did,
            authenticationId,
            credentialId,
            revokeSignature.recoveryParam,
            [...revokeSignature.r.toBuffer(), ...revokeSignature.s.toBuffer()],
          )
          .accounts({
            didDocument: didPda,
            verificationMethod: verificationPda,
            authentication: authenticationPda,
            credentialState: credentialPda,
          })
          .rpc();
      } catch (error) {
        expect(error.error.errorCode.code === ANCHOR_ERROR_UNAUTHORIZED);
      }
    });
  });
});
