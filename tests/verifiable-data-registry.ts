import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { keccak_256 } from '@noble/hashes/sha3';
import { expect } from 'chai';
import { ec as EC } from 'elliptic';
import { VerifiableDataRegistry } from '../target/types/verifiable_data_registry';

const ANCHOR_ERROR_ACCOUNT_NOT_INITIALIZED = 'AccountNotInitialized';
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

// const duplicate_err = (address) => {
//   return `Allocate: account Address { address: ${address}, base: None } already in use`;
// };

// const DISCRIMINATOR = {
//   authentication: 'authentication',
//   assertion: 'assertion',
//   keyAgreement: 'key_agreement',
// };

describe('verifiable-data-registry', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .VerifiableDataRegistry as Program<VerifiableDataRegistry>;

  describe('initializeDid()', () => {
    const did = 'did:zuni:solana:initializeDid';
    const [didPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [keccak_256(did)],
      program.programId,
    );

    it('Should initialize DID properly', async () => {
      try {
        await program.methods
          .initializeDid(did)
          .accounts({ didDocument: didPda })
          .rpc();
        const didDocument = await program.account.didDocument.fetch(didPda);
        expect(didDocument.did === did);
        expect(didDocument.controller === provider.wallet.publicKey);
      } catch (error) {
        console.log(error);
      }
    });

    it('Fail to initialize duplicate DID', async () => {
      try {
        await program.methods
          .initializeDid(did)
          .accounts({ didDocument: didPda })
          .rpc();
      } catch (err) {
        const duplicate_err = `Allocate: account Address { address: ${didPda.toBase58()}, base: None } already in use`;
        expect(err.logs.find((log: string) => log === duplicate_err));
      }
    });
  });

  describe('addVerificationMethod()', () => {
    const did = 'did:zuni:solana:addVerificationMethod';
    const [didPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [keccak_256(did)],
      program.programId,
    );
    const keyId = did + 'key1';
    const controller = provider.wallet.publicKey;
    const keyType = 'Ed25519VerificationKey2018';
    const publicKeyMultibase =
      'z6Mkq7J8v9Gy3aK4u5rMx5iZq6Mkq7J8v9Gy3aK4u5rMx5iZq';
    const [verificationPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(keccak_256(did + keyId))],
      program.programId,
    );

    before(async () => {
      await program.methods
        .initializeDid(did)
        .accounts({ didDocument: didPda })
        .rpc();
    });

    it('Should add verification method into DID properly', async () => {
      await program.methods
        .addVerificationMethod(
          did,
          keyId,
          keyType,
          publicKeyMultibase,
          controller,
        )
        .accounts({
          didDocument: didPda,
          verificationMethod: verificationPda,
        })
        .rpc();

      const verificationMethod = await program.account.verificationMethod.fetch(
        verificationPda,
      );

      expect(verificationMethod.did === did);
      expect(verificationMethod.keyId === keyId);
      expect(verificationMethod.rType === keyType);
      expect(verificationMethod.publicKeyMultibase === publicKeyMultibase);
      expect(verificationMethod.controller === controller);
    });

    it('Fail to add verification without DID', async () => {
      try {
        const notExistDid = 'not exist';
        await program.methods
          .addVerificationMethod(
            notExistDid,
            keyId,
            keyType,
            publicKeyMultibase,
            controller,
          )
          .accounts({
            didDocument: didPda,
            verificationMethod: verificationPda,
          })
          .rpc();
      } catch (err) {
        expect(
          err.error.errorCode.code === ANCHOR_ERROR_ACCOUNT_NOT_INITIALIZED,
        );
      }
    });

    it('Fail to add verification with no auth', async () => {
      try {
        const malicious = anchor.web3.Keypair.generate();
        const transaction = new anchor.web3.Transaction().add(
          anchor.web3.SystemProgram.transfer({
            fromPubkey: provider.publicKey,
            toPubkey: malicious.publicKey,
            lamports: anchor.web3.LAMPORTS_PER_SOL,
          }),
        );
        await provider.sendAndConfirm(transaction);

        const newKeyId = 'newKeyId';
        const [newVerificationPda] =
          anchor.web3.PublicKey.findProgramAddressSync(
            [keccak_256(did + newKeyId)],
            program.programId,
          );

        await program.methods
          .addVerificationMethod(
            did,
            keyId,
            keyType,
            publicKeyMultibase,
            controller,
          )
          .accounts({
            didDocument: didPda,
            verificationMethod: newVerificationPda,
            controller: malicious.publicKey,
          })
          .signers([malicious])
          .rpc();
      } catch (err) {
        expect(err.error.errorCode.code === ANCHOR_ERROR_UNAUTHORIZED);
      }
    });
  });

  describe('addVerificationRelationship()', () => {
    const did = 'did:zuni:solana:addVerificationRelationship';
    const [didPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [keccak_256(did)],
      program.programId,
    );
    const keyId = did + '#key-relationship';
    const [verificationPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(keccak_256(did + keyId))],
      program.programId,
    );

    before(async () => {
      await program.methods
        .initializeDid(did)
        .accounts({ didDocument: didPda })
        .rpc();

      const publicKeyMultibase =
        'z' + anchor.web3.Keypair.generate().publicKey.toBase58();
      await program.methods
        .addVerificationMethod(
          did,
          keyId,
          'keyType',
          publicKeyMultibase,
          provider.publicKey,
        )
        .accounts({
          didDocument: didPda,
          verificationMethod: verificationPda,
        })
        .rpc();
    });

    it('Should add verification relationship into DID properly', async () => {
      const [relationshipPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from(
            keccak_256(
              did +
                VERIFICATION_RELATIONSHIP.authentication.discriminator +
                keyId,
            ),
          ),
        ],
        program.programId,
      );
      await program.methods
        .addVerificationRelationship(
          did,
          VERIFICATION_RELATIONSHIP.authentication.input,
          keyId,
        )
        .accounts({
          didDocument: didPda,
          verificationMethod: verificationPda,
          verificationRelationship: relationshipPda,
        })
        .rpc();

      const verificationRelationship =
        await program.account.verificationRelationship.fetch(relationshipPda);

      expect(verificationRelationship.did === did);
      expect(verificationRelationship.keyId === keyId);
      expect(
        JSON.stringify(verificationRelationship.relationship) ===
          JSON.stringify(VERIFICATION_RELATIONSHIP.authentication.input),
      );
    });
  });

  describe('addCredential()', () => {
    const did = 'did:zuni:solana:addCredential';
    const keyId = did + '#key-addCredential';
    const credentialId = 'addCredential';
    const keyType = 'EcdsaSecp256k1VerificationKey2019';
    const expireAt = new anchor.BN(new Date().getTime());

    const ec = new EC('secp256k1');
    const authenticationKeypair = ec.genKeyPair();
    const publicKeyMultibase =
      'f' + authenticationKeypair.getPublic().encode('hex', false).slice(2);

    const [didPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(keccak_256(did))],
      program.programId,
    );
    const [verificationPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(keccak_256(did + keyId))],
      program.programId,
    );
    const [authenticationPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from(
          keccak_256(
            did +
              VERIFICATION_RELATIONSHIP.authentication.discriminator +
              keyId,
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
          keyId,
          keyType,
          publicKeyMultibase,
          provider.publicKey,
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
          keyId,
        )
        .accounts({
          didDocument: didPda,
          verificationMethod: verificationPda,
          verificationRelationship: authenticationPda,
        })
        .rpc();
    });

    it('Should add Credential properly', async () => {
      const msg = keccak_256(credentialId);
      const fullSignature = authenticationKeypair.sign(msg, {
        canonical: true,
      });
      if (fullSignature.recoveryParam === null) {
        throw new Error('Failed to sign');
      }

      const [credentialPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(keccak_256(credentialId))],
        program.programId,
      );

      await program.methods
        .addCredential(
          did,
          keyId,
          credentialId,
          expireAt,
          fullSignature.recoveryParam,
          [...fullSignature.r.toBuffer(), ...fullSignature.s.toBuffer()],
        )
        .accounts({
          didDocument: didPda,
          verificationMethod: verificationPda,
          authentication: authenticationPda,
          credentialState: credentialPda,
        })
        .rpc();
      const credential = await program.account.credentialState.fetch(
        credentialPda,
      );
      const active = { active: {} };
      expect(credential.issuerDid === did);
      expect(credential.credentialId === credentialId);
      expect(JSON.stringify(credential.status) === JSON.stringify(active));
      expect(credential.expireAt === expireAt);
    });
  });

  describe('revokeCredential()', () => {
    const did = 'did:zuni:solana:revokeCredential';
    const keyId = did + '#key-revokeCredential';
    const credentialId = 'revokeCredential';
    const keyType = 'EcdsaSecp256k1VerificationKey2019';
    const expireAt = new anchor.BN(new Date().getTime());

    const ec = new EC('secp256k1');
    const authenticationKeypair = ec.genKeyPair();
    const publicKeyMultibase =
      'z' +
      anchor.utils.bytes.bs58.encode(
        Buffer.from(authenticationKeypair.getPublic('hex').slice(2), 'hex'),
      );

    const [didPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(keccak_256(did))],
      program.programId,
    );
    const [verificationPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(keccak_256(did + keyId))],
      program.programId,
    );
    const [authenticationPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from(
          keccak_256(
            did +
              VERIFICATION_RELATIONSHIP.authentication.discriminator +
              keyId,
          ),
        ),
      ],
      program.programId,
    );
    const [credentialPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(keccak_256(credentialId))],
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
          keyId,
          keyType,
          publicKeyMultibase,
          provider.publicKey,
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
          keyId,
        )
        .accounts({
          didDocument: didPda,
          verificationMethod: verificationPda,
          verificationRelationship: authenticationPda,
        })
        .rpc();

      const msg = keccak_256(credentialId);
      const fullSignature = authenticationKeypair.sign(msg, {
        canonical: true,
      });
      if (fullSignature.recoveryParam === null) {
        throw new Error('Failed to sign');
      }
      await program.methods
        .addCredential(
          did,
          keyId,
          credentialId,
          expireAt,
          fullSignature.recoveryParam,
          [...fullSignature.r.toBuffer(), ...fullSignature.s.toBuffer()],
        )
        .accounts({
          didDocument: didPda,
          verificationMethod: verificationPda,
          authentication: authenticationPda,
          credentialState: credentialPda,
        })
        .rpc();
    });

    it('Should revoke Credential properly', async () => {
      const revokeMsg = keccak_256(credentialId + 'REVOKE');
      const revokeSignature = authenticationKeypair.sign(revokeMsg, {
        canonical: true,
      });

      if (revokeSignature.recoveryParam === null) {
        throw new Error('Failed to sign msg');
      }

      await program.methods
        .revokeCredential(
          did,
          keyId,
          credentialId,
          revokeSignature.recoveryParam,
          [...revokeSignature.r.toBuffer(), ...revokeSignature.s.toBuffer()],
        )
        .accounts({
          credentialState: credentialPda,
          didDocument: didPda,
          verificationMethod: verificationPda,
          authentication: authenticationPda,
        })
        .rpc();

      const credential = await program.account.credentialState.fetch(
        credentialPda,
      );

      const revoked = { active: {} };

      expect(credential.issuerDid === did);
      expect(credential.credentialId === credentialId);
      expect(JSON.stringify(credential.status) === JSON.stringify(revoked));
    });
  });
});
