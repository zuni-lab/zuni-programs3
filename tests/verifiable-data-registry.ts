import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VerifiableDataRegistry } from "../target/types/verifiable_data_registry";
import { expect } from "chai";

const ANCHOR_ERROR_ACCOUNT_NOT_INITIALIZED = "AccountNotInitialized";
const ANCHOR_ERROR_UNAUTHORIZED = "Unauthorized";

describe("verifiable-data-registry", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .VerifiableDataRegistry as Program<VerifiableDataRegistry>;
  const did = "did:zuni:solana:4c6e6f6e6365";
  const keyId = "key1";
  const verificationRelationships = {
    authentication: "authentication",
    assertion: "assertion",
    keyAgreement: "key_agreement",
  };

  const [didPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(did)],
    program.programId
  );

  it.only("Should initialize DID properly", async () => {
    await program.methods.initializeDid(did).rpc();
    const didDocument = await program.account.didDocument.fetch(didPda);
    expect(didDocument.did === did);
    expect(didDocument.controller === provider.wallet.publicKey);

    const didAccounts = await provider.connection.getProgramAccounts(
      program.programId,
      {
        filters: [
          {
            memcmp: {
              offset: 8,
              bytes: provider.publicKey.toBase58(),
            },
          },
        ],
      }
    );
    console.log(
      // anchor.utils.bytes.utf8.decode(
      didAccounts[0].account.data.slice(8 + 32)
      // )
    );
  });

  it("Fail to initialize duplicate DID", async () => {
    try {
      await program.methods.initializeDid(did).rpc();
    } catch (err) {
      expect(err);
    }
  });

  it("Should add verification method into DID properly", async () => {
    const keyType = "Ed25519VerificationKey2018";
    const publicKeyMultibase =
      "z6Mkq7J8v9Gy3aK4u5rMx5iZq6Mkq7J8v9Gy3aK4u5rMx5iZq";
    const controller = provider.wallet.publicKey;
    await program.methods
      .addVerificationMethod(
        did,
        keyId,
        keyType,
        publicKeyMultibase,
        controller
      )
      .rpc();

    const [verificationMethodPda] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(did), Buffer.from(keyId)],
        program.programId
      );
    const verificationMethod = await program.account.verificationMethod.fetch(
      verificationMethodPda
    );
    expect(verificationMethod.did === did);
    expect(verificationMethod.keyId === keyId);
    expect(verificationMethod.rType === keyType);
    expect(verificationMethod.publicKeyMultibase === publicKeyMultibase);
    expect(verificationMethod.controller === controller);
  });

  it("Fail to add verification without DID", async () => {
    try {
      const notExistDid = "not exist";
      const keyType = "Ed25519VerificationKey2018";
      const publicKeyMultibase =
        "z6Mkq7J8v9Gy3aK4u5rMx5iZq6Mkq7J8v9Gy3aK4u5rMx5iZq";
      const controller = provider.wallet.publicKey;
      await program.methods
        .addVerificationMethod(
          notExistDid,
          keyId,
          keyType,
          publicKeyMultibase,
          controller
        )
        .rpc();
    } catch (err) {
      expect(err.error.errorCode.code === ANCHOR_ERROR_ACCOUNT_NOT_INITIALIZED);
    }
  });

  it("Fail to add verification with no authen", async () => {
    try {
      const malicious = anchor.web3.Keypair.generate();
      const transaction = new anchor.web3.Transaction().add(
        anchor.web3.SystemProgram.transfer({
          fromPubkey: provider.publicKey,
          toPubkey: malicious.publicKey,
          lamports: anchor.web3.LAMPORTS_PER_SOL, // number of SOL to send
        })
      );
      await provider.sendAndConfirm(transaction);
      const keyId = "key2";
      const keyType = "Ed25519VerificationKey2018";
      const publicKeyMultibase =
        "z6Mkq7J8v9Gy3aK4u5rMx5iZq6Mkq7J8v9Gy3aK4u5rMx5iZq";
      const controller = provider.wallet.publicKey;
      await program.methods
        .addVerificationMethod(
          did,
          keyId,
          keyType,
          publicKeyMultibase,
          controller
        )
        .accounts({ controller: malicious.publicKey })
        .signers([malicious])
        .rpc();
    } catch (err) {
      expect(err.error.errorCode.code === ANCHOR_ERROR_UNAUTHORIZED);
    }
  });

  it("Should add Authentication into DID properly", async () => {
    await program.methods.addAuthentication(did, keyId).rpc();

    const [authenticationPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from(verificationRelationships.authentication),
        Buffer.from(did),
        Buffer.from(keyId),
      ],
      program.programId
    );
    let authentication = await program.account.authentication.fetch(
      authenticationPda
    );
    expect(
      (authentication.discriminator = verificationRelationships.authentication)
    );
    expect(authentication.did === did);
    expect(authentication.keyId === keyId);
  });

  it("Fail to add Authentication without DID", async () => {
    try {
      const notExistDid = "not exist";
      await program.methods.addAuthentication(notExistDid, keyId).rpc();
    } catch (err) {
      expect(err.error.errorCode.code === ANCHOR_ERROR_ACCOUNT_NOT_INITIALIZED);
    }
  });

  it("Fail to add Authentication with no authen", async () => {
    try {
      const malicious = anchor.web3.Keypair.generate();
      const transaction = new anchor.web3.Transaction().add(
        anchor.web3.SystemProgram.transfer({
          fromPubkey: provider.publicKey,
          toPubkey: malicious.publicKey,
          lamports: anchor.web3.LAMPORTS_PER_SOL, // number of SOL to send
        })
      );
      const keyId = "key2";
      await provider.sendAndConfirm(transaction);
      await program.methods
        .addAuthentication(did, keyId)
        .accounts({ controller: malicious.publicKey })
        .signers([malicious])
        .rpc();
    } catch (err) {
      expect(err.error.errorCode.code === ANCHOR_ERROR_UNAUTHORIZED);
    }
  });

  it("Should add Assertion into DID properly", async () => {
    await program.methods.addAssertion(did, keyId).rpc();

    const [assertionPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from(verificationRelationships.assertion),
        Buffer.from(did),
        Buffer.from(keyId),
      ],
      program.programId
    );
    let assertion = await program.account.assertion.fetch(assertionPda);
    expect((assertion.discriminator = verificationRelationships.assertion));
    expect(assertion.did === did);
    expect(assertion.keyId === keyId);
  });

  it("Fail to add Assertion without DID", async () => {
    try {
      const notExistDid = "not exist";
      await program.methods.addAssertion(notExistDid, keyId).rpc();
    } catch (err) {
      expect(err.error.errorCode.code === ANCHOR_ERROR_ACCOUNT_NOT_INITIALIZED);
    }
  });

  it("Fail to add Assertion with no authen", async () => {
    try {
      const malicious = anchor.web3.Keypair.generate();
      const transaction = new anchor.web3.Transaction().add(
        anchor.web3.SystemProgram.transfer({
          fromPubkey: provider.publicKey,
          toPubkey: malicious.publicKey,
          lamports: anchor.web3.LAMPORTS_PER_SOL, // number of SOL to send
        })
      );
      const keyId = "key2";
      await provider.sendAndConfirm(transaction);
      await program.methods
        .addAssertion(did, keyId)
        .accounts({ controller: malicious.publicKey })
        .signers([malicious])
        .rpc();
    } catch (err) {
      expect(err.error.errorCode.code === ANCHOR_ERROR_UNAUTHORIZED);
    }
  });

  it("Should add Key Agreement into DID properly", async () => {
    await program.methods.addKeyAgreement(did, keyId).rpc();

    const [keyAgreementPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from(verificationRelationships.keyAgreement),
        Buffer.from(did),
        Buffer.from(keyId),
      ],
      program.programId
    );
    let keyAgreement = await program.account.keyAgreement.fetch(
      keyAgreementPda
    );
    expect(
      (keyAgreement.discriminator = verificationRelationships.keyAgreement)
    );
    expect(keyAgreement.did === did);
    expect(keyAgreement.keyId === keyId);
  });

  it("Fail to add Key Agreement without DID", async () => {
    try {
      const notExistDid = "not exist";
      await program.methods.addKeyAgreement(notExistDid, keyId).rpc();
    } catch (err) {
      expect(err.error.errorCode.code === ANCHOR_ERROR_ACCOUNT_NOT_INITIALIZED);
    }
  });

  it("Fail to add Key Agreement with no authen", async () => {
    try {
      const malicious = anchor.web3.Keypair.generate();
      const transaction = new anchor.web3.Transaction().add(
        anchor.web3.SystemProgram.transfer({
          fromPubkey: provider.publicKey,
          toPubkey: malicious.publicKey,
          lamports: anchor.web3.LAMPORTS_PER_SOL, // number of SOL to send
        })
      );
      const keyId = "key2";
      await provider.sendAndConfirm(transaction);
      await program.methods
        .addKeyAgreement(did, keyId)
        .accounts({ controller: malicious.publicKey })
        .signers([malicious])
        .rpc();
    } catch (err) {
      expect(err.error.errorCode.code === ANCHOR_ERROR_UNAUTHORIZED);
    }
  });
});
