import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { expect } from 'chai';
import { VerifiableDataRegistry } from '../target/types/verifiable_data_registry';

const ANCHOR_ERROR_ACCOUNT_NOT_INITIALIZED = 'AccountNotInitialized';
const ANCHOR_ERROR_UNAUTHORIZED = 'Unauthorized';

const DISCRIMINATOR = {
  did_document: 'did_document',
  verificationMehtod: 'verification_method',
  authentication: 'authentication',
  assertion: 'assertion',
  keyAgreement: 'key_agreement',
};

describe('verifiable-data-registry', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .VerifiableDataRegistry as Program<VerifiableDataRegistry>;

  describe('initializeDid()', () => {
    const did = 'did:zuni:solana:initializeDid';
    let didSeed: number[];
    let didPda: anchor.web3.PublicKey;

    before(() => {
      didSeed = [...Buffer.from(anchor.utils.sha256.hash(did)).subarray(0, 20)];
      [didPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(didSeed)],
        program.programId,
      );
    });

    it('Should initialize DID properly', async () => {
      await program.methods.initializeDid(didSeed, did).rpc();
      const didDocument = await program.account.didDocument.fetch(didPda);
      expect(didDocument.did === did);
      expect(didDocument.controller === provider.wallet.publicKey);
    });

    it('Fail to initialize duplicate DID', async () => {
      try {
        await program.methods.initializeDid(didSeed, did).rpc();
      } catch (err) {
        expect(err);
      }
    });
  });

  describe('addVerificationMethod()', () => {
    const did = 'did:zuni:solana:addVerificationMethod';
    const keyId = 'key1';
    const controller = provider.wallet.publicKey;
    const keyType = 'Ed25519VerificationKey2018';
    const publicKeyMultibase =
      'z6Mkq7J8v9Gy3aK4u5rMx5iZq6Mkq7J8v9Gy3aK4u5rMx5iZq';
    let didSeed: number[];
    let verificationSeed: number[];
    let verificationPda: anchor.web3.PublicKey;

    before(async () => {
      didSeed = [...Buffer.from(anchor.utils.sha256.hash(did)).subarray(0, 20)];
      await program.methods.initializeDid(didSeed, did).rpc();

      const data = did + keyId;
      const hashed = anchor.utils.sha256.hash(data);
      verificationSeed = [...Buffer.from(hashed).subarray(0, 20)];
      [verificationPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(verificationSeed)],
        program.programId,
      );
    });

    it('Should add verification method into DID properly', async () => {
      await program.methods
        .addVerificationMethod(
          didSeed,
          verificationSeed,
          keyId,
          keyType,
          publicKeyMultibase,
          controller,
        )
        .rpc();

      const verificationMethod = await program.account.verificationMethod.fetch(
        verificationPda,
      );
      expect(
        verificationMethod.discriminator === DISCRIMINATOR.verificationMehtod,
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
        const notExistDidSeed = [
          ...Buffer.from(anchor.utils.sha256.hash(notExistDid)).subarray(0, 20),
        ];
        await program.methods
          .addVerificationMethod(
            notExistDidSeed,
            verificationSeed,
            keyId,
            keyType,
            publicKeyMultibase,
            controller,
          )
          .rpc();
      } catch (err) {
        expect(
          err.error.errorCode.code === ANCHOR_ERROR_ACCOUNT_NOT_INITIALIZED,
        );
      }
    });

    it('Fail to add verification with no authen', async () => {
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

        const verificationSeed = [
          ...Buffer.from('verificationSeed').subarray(0, 20),
        ];

        await program.methods
          .addVerificationMethod(
            didSeed,
            verificationSeed,
            keyId,
            keyType,
            publicKeyMultibase,
            controller,
          )
          .accounts({ controller: malicious.publicKey })
          .signers([malicious])
          .rpc();
      } catch (err) {
        expect(err.error.errorCode.code === ANCHOR_ERROR_UNAUTHORIZED);
      }
    });
  });

  describe('addAuthentication()', () => {
    const did = 'did:zuni:solana:addAuthentication';
    const keyId = 'key1';
    let didSeed: number[];
    let verificationSeed: number[];
    let verificationPda: anchor.web3.PublicKey;
    let authenticationSeed: number[];
    let authenticationPda: anchor.web3.PublicKey;

    before(async () => {
      didSeed = [...Buffer.from(anchor.utils.sha256.hash(did)).subarray(0, 20)];
      await program.methods.initializeDid(didSeed, did).rpc();

      const verificationData = did + keyId;
      const verificationHashed = anchor.utils.sha256.hash(verificationData);
      verificationSeed = [...Buffer.from(verificationHashed).subarray(0, 20)];
      await program.methods
        .addVerificationMethod(
          didSeed,
          verificationSeed,
          keyId,
          'keyType',
          'publicKeyMultibase',
          provider.publicKey,
        )
        .rpc();
      [verificationPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(verificationSeed)],
        program.programId,
      );

      const authenticationData = DISCRIMINATOR.authentication + did + keyId;
      const authenticationHashed = anchor.utils.sha256.hash(authenticationData);
      authenticationSeed = [
        ...Buffer.from(authenticationHashed).subarray(0, 20),
      ];
      [authenticationPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(authenticationSeed)],
        program.programId,
      );
    });

    it('Should add Authentication into DID properly', async () => {
      await program.methods
        .addAuthentication(didSeed, verificationSeed, authenticationSeed)
        .accounts({
          verificationMethod: verificationPda,
        })
        .rpc();

      const authentication = await program.account.authentication.fetch(
        authenticationPda,
      );
      expect((authentication.discriminator = DISCRIMINATOR.authentication));
      expect(authentication.did === did);
      expect(authentication.keyId === keyId);
    });

    it('Fail to add Authentication without DID', async () => {
      try {
        const notExistDid = 'not exist';
        const notExistDidSeed = [
          ...Buffer.from(anchor.utils.sha256.hash(notExistDid)).subarray(0, 20),
        ];
        await program.methods
          .addAuthentication(
            notExistDidSeed,
            verificationSeed,
            authenticationSeed,
          )
          .accounts({
            verificationMethod: verificationPda,
          })
          .rpc();
      } catch (err) {
        expect(
          err.error.errorCode.code === ANCHOR_ERROR_ACCOUNT_NOT_INITIALIZED,
        );
      }
    });

    it('Fail to add Authentication without Verification Method', async () => {
      try {
        const notExistVerificationMethod = 'not exist';
        const notExistVerificationMethodSeed = [
          ...Buffer.from(
            anchor.utils.sha256.hash(notExistVerificationMethod),
          ).subarray(0, 20),
        ];
        const authenticationSeed = [
          ...Buffer.from('authenticationHashed').subarray(0, 20),
        ];
        await program.methods
          .addAuthentication(
            didSeed,
            notExistVerificationMethodSeed,
            authenticationSeed,
          )
          .accounts({
            verificationMethod: verificationPda,
          })
          .rpc();
      } catch (err) {
        expect(
          err.error.errorCode.code === ANCHOR_ERROR_ACCOUNT_NOT_INITIALIZED,
        );
      }
    });

    it('Fail to add Authentication with no authen', async () => {
      try {
        const malicious = anchor.web3.Keypair.generate();
        const transaction = new anchor.web3.Transaction().add(
          anchor.web3.SystemProgram.transfer({
            fromPubkey: provider.publicKey,
            toPubkey: malicious.publicKey,
            lamports: anchor.web3.LAMPORTS_PER_SOL, // number of SOL to send
          }),
        );
        await provider.sendAndConfirm(transaction);

        const authenticationHashed = anchor.utils.sha256.hash(
          'maliciousAuthentication',
        );
        const maliciousAuthenticationSeed = [
          ...Buffer.from(authenticationHashed).subarray(0, 20),
        ];
        await program.methods
          .addAuthentication(
            didSeed,
            verificationSeed,
            maliciousAuthenticationSeed,
          )
          .accounts({
            verificationMethod: verificationPda,
            controller: malicious.publicKey,
          })
          .signers([malicious])
          .rpc();
      } catch (err) {
        expect(err.error.errorCode.code === ANCHOR_ERROR_UNAUTHORIZED);
      }
    });
  });

  describe('addAssertion()', () => {
    const did = 'did:zuni:solana:addAssertion';
    const keyId = 'key1';
    let didSeed: number[];
    let verificationSeed: number[];
    let verificationPda: anchor.web3.PublicKey;
    let assertionSeed: number[];
    let assertionPda: anchor.web3.PublicKey;

    before(async () => {
      didSeed = [...Buffer.from(anchor.utils.sha256.hash(did)).subarray(0, 20)];
      await program.methods.initializeDid(didSeed, did).rpc();

      const verificationData = did + keyId;
      const verificationHashed = anchor.utils.sha256.hash(verificationData);
      verificationSeed = [...Buffer.from(verificationHashed).subarray(0, 20)];
      await program.methods
        .addVerificationMethod(
          didSeed,
          verificationSeed,
          keyId,
          'keyType',
          'publicKeyMultibase',
          provider.publicKey,
        )
        .rpc();
      [verificationPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(verificationSeed)],
        program.programId,
      );

      const assertionData = DISCRIMINATOR.assertion + did + keyId;
      const assertionHashed = anchor.utils.sha256.hash(assertionData);
      assertionSeed = [...Buffer.from(assertionHashed).subarray(0, 20)];
      [assertionPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(assertionSeed)],
        program.programId,
      );
    });

    it('Should add Assertion into DID properly', async () => {
      await program.methods
        .addAssertion(didSeed, verificationSeed, assertionSeed)
        .accounts({
          verificationMethod: verificationPda,
        })
        .rpc();

      const assertion = await program.account.assertion.fetch(assertionPda);
      expect((assertion.discriminator = DISCRIMINATOR.assertion));
      expect(assertion.did === did);
      expect(assertion.keyId === keyId);
    });

    it('Fail to add Assertion without DID', async () => {
      try {
        const notExistDid = 'not exist';
        const notExistDidSeed = [
          ...Buffer.from(anchor.utils.sha256.hash(notExistDid)).subarray(0, 20),
        ];
        await program.methods
          .addAssertion(notExistDidSeed, verificationSeed, assertionSeed)
          .accounts({
            verificationMethod: verificationPda,
          })
          .rpc();
      } catch (err) {
        expect(
          err.error.errorCode.code === ANCHOR_ERROR_ACCOUNT_NOT_INITIALIZED,
        );
      }
    });

    it('Fail to add Assertion without Verification Method', async () => {
      try {
        const notExistVerificationMethod = 'not exist';
        const notExistVerificationMethodSeed = [
          ...Buffer.from(
            anchor.utils.sha256.hash(notExistVerificationMethod),
          ).subarray(0, 20),
        ];
        const assertionSeed = [
          ...Buffer.from('authenticationHashed').subarray(0, 20),
        ];
        await program.methods
          .addAssertion(didSeed, notExistVerificationMethodSeed, assertionSeed)
          .accounts({
            verificationMethod: verificationPda,
          })
          .rpc();
      } catch (err) {
        expect(
          err.error.errorCode.code === ANCHOR_ERROR_ACCOUNT_NOT_INITIALIZED,
        );
      }
    });

    it('Fail to add Assertion with no authen', async () => {
      try {
        const malicious = anchor.web3.Keypair.generate();
        const transaction = new anchor.web3.Transaction().add(
          anchor.web3.SystemProgram.transfer({
            fromPubkey: provider.publicKey,
            toPubkey: malicious.publicKey,
            lamports: anchor.web3.LAMPORTS_PER_SOL, // number of SOL to send
          }),
        );
        await provider.sendAndConfirm(transaction);

        const assertionHashed = anchor.utils.sha256.hash('maliciousAssertion');
        const maliciousAssertionSeed = [
          ...Buffer.from(assertionHashed).subarray(0, 20),
        ];
        await program.methods
          .addAssertion(didSeed, verificationSeed, maliciousAssertionSeed)
          .accounts({
            verificationMethod: verificationPda,
            controller: malicious.publicKey,
          })
          .signers([malicious])
          .rpc();
      } catch (err) {
        expect(err.error.errorCode.code === ANCHOR_ERROR_UNAUTHORIZED);
      }
    });
  });

  describe('addKeyAgreement()', () => {
    const did = 'did:zuni:solana:addKeyAgreement';
    const keyId = 'key1';
    let didSeed: number[];
    let verificationSeed: number[];
    let verificationPda: anchor.web3.PublicKey;
    let keyAgreementSeed: number[];
    let keyAgreementPda: anchor.web3.PublicKey;

    before(async () => {
      didSeed = [...Buffer.from(anchor.utils.sha256.hash(did)).subarray(0, 20)];
      await program.methods.initializeDid(didSeed, did).rpc();

      const verificationData = did + keyId;
      const verificationHashed = anchor.utils.sha256.hash(verificationData);
      verificationSeed = [...Buffer.from(verificationHashed).subarray(0, 20)];
      await program.methods
        .addVerificationMethod(
          didSeed,
          verificationSeed,
          keyId,
          'keyType',
          'publicKeyMultibase',
          provider.publicKey,
        )
        .rpc();
      [verificationPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(verificationSeed)],
        program.programId,
      );

      const keyAgreementData = DISCRIMINATOR.keyAgreement + did + keyId;
      const keyAgreementHashed = anchor.utils.sha256.hash(keyAgreementData);
      keyAgreementSeed = [...Buffer.from(keyAgreementHashed).subarray(0, 20)];
      [keyAgreementPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(keyAgreementSeed)],
        program.programId,
      );
    });

    it('Should add KeyAgreement into DID properly', async () => {
      await program.methods
        .addKeyAgreement(didSeed, verificationSeed, keyAgreementSeed)
        .accounts({
          verificationMethod: verificationPda,
        })
        .rpc();

      const keyAgreement = await program.account.keyAgreement.fetch(
        keyAgreementPda,
      );
      expect((keyAgreement.discriminator = DISCRIMINATOR.keyAgreement));
      expect(keyAgreement.did === did);
      expect(keyAgreement.keyId === keyId);
    });

    it('Fail to add KeyAgreement without DID', async () => {
      try {
        const notExistDid = 'not exist';
        const notExistDidSeed = [
          ...Buffer.from(anchor.utils.sha256.hash(notExistDid)).subarray(0, 20),
        ];
        await program.methods
          .addKeyAgreement(notExistDidSeed, verificationSeed, keyAgreementSeed)
          .accounts({
            verificationMethod: verificationPda,
          })
          .rpc();
      } catch (err) {
        expect(
          err.error.errorCode.code === ANCHOR_ERROR_ACCOUNT_NOT_INITIALIZED,
        );
      }
    });

    it('Fail to add Authentication without Verification Method', async () => {
      try {
        const notExistVerificationMethod = 'not exist';
        const notExistVerificationMethodSeed = [
          ...Buffer.from(
            anchor.utils.sha256.hash(notExistVerificationMethod),
          ).subarray(0, 20),
        ];
        const keyAgreementSeed = [
          ...Buffer.from('authenticationHashed').subarray(0, 20),
        ];
        await program.methods
          .addKeyAgreement(
            didSeed,
            notExistVerificationMethodSeed,
            keyAgreementSeed,
          )
          .accounts({
            verificationMethod: verificationPda,
          })
          .rpc();
      } catch (err) {
        expect(
          err.error.errorCode.code === ANCHOR_ERROR_ACCOUNT_NOT_INITIALIZED,
        );
      }
    });

    it('Fail to add KeyAgreement with no authen', async () => {
      try {
        const malicious = anchor.web3.Keypair.generate();
        const transaction = new anchor.web3.Transaction().add(
          anchor.web3.SystemProgram.transfer({
            fromPubkey: provider.publicKey,
            toPubkey: malicious.publicKey,
            lamports: anchor.web3.LAMPORTS_PER_SOL, // number of SOL to send
          }),
        );
        await provider.sendAndConfirm(transaction);

        const keyAgreementHashed = anchor.utils.sha256.hash(
          'maliciousKeyAgreement',
        );
        const maliciousKeyAgreementSeed = [
          ...Buffer.from(keyAgreementHashed).subarray(0, 20),
        ];
        await program.methods
          .addKeyAgreement(didSeed, verificationSeed, maliciousKeyAgreementSeed)
          .accounts({
            verificationMethod: verificationPda,
            controller: malicious.publicKey,
          })
          .signers([malicious])
          .rpc();
      } catch (err) {
        expect(err.error.errorCode.code === ANCHOR_ERROR_UNAUTHORIZED);
      }
    });
  });
});
