// import * as anchor from '@coral-xyz/anchor';
// import { Program } from '@coral-xyz/anchor';
// import { keccak_256 } from '@noble/hashes/sha3';
// import { expect } from 'chai';
// import { VerifiableDataRegistry } from '../target/types/verifiable_data_registry';
// import {
//   findVerificationPdasWithKeyIds,
//   genKeyIds,
//   KEY_TYPE,
//   MULTIBASE_PREFIX,
// } from './utils';

// const ANCHOR_ERROR_ACCOUNT_NOT_INITIALIZED = 'AccountNotInitialized';
// const ANCHOR_ERROR_UNAUTHORIZED = 'Unauthorized';

// const VERIFICATION_RELATIONSHIP = {
//   authentication: {
//     discriminator: 'authentication',
//     input: { authentication: {} },
//   },
//   assertion: {
//     discriminator: 'assertion',
//     input: { assertion: {} },
//   },
//   keyAgreement: {
//     discriminator: 'key_agreement',
//     input: { keyAgreement: {} },
//   },
// };

// const duplicate_err = (address: string) => {
//   return `Allocate: account Address { address: ${address}, base: None } already in use`;
// };

// describe('DID', () => {
//   // Configure the client to use the local cluster.
//   const provider = anchor.AnchorProvider.env();
//   anchor.setProvider(provider);

//   const program = anchor.workspace
//     .VerifiableDataRegistry as Program<VerifiableDataRegistry>;

//   describe('initializeDid()', () => {
//     const did = 'did:zuni:solana:initializeDid';
//     const [didPda] = anchor.web3.PublicKey.findProgramAddressSync(
//       [keccak_256(did)],
//       program.programId,
//     );

//     it('Should initialize DID properly', async () => {
//       try {
//         await program.methods
//           .initializeDid(did)
//           .accounts({ didDocument: didPda })
//           .rpc();
//         const didDocument = await program.account.didDocument.fetch(didPda);
//         expect(didDocument.did === did);
//         expect(didDocument.controller === provider.wallet.publicKey);
//       } catch (error) {
//         console.log(error);
//       }
//     });

//     it('Fail to initialize duplicate DID', async () => {
//       try {
//         await program.methods
//           .initializeDid(did)
//           .accounts({ didDocument: didPda })
//           .rpc();
//       } catch (err) {
//         expect(
//           err.logs.find(
//             (log: string) => log === duplicate_err(didPda.toBase58()),
//           ),
//         );
//       }
//     });
//   });

//   describe('addVerificationMethod()', () => {
//     const did = 'did:zuni:solana:addVerificationMethod';
//     const [didPda] = anchor.web3.PublicKey.findProgramAddressSync(
//       [keccak_256(did)],
//       program.programId,
//     );
//     const keyIds = genKeyIds(5, did);
//     const controller = provider.wallet.publicKey;
//     const keyType = KEY_TYPE.ed25519;
//     const publicKeyMultibase =
//       MULTIBASE_PREFIX.base58btc + controller.toBase58();
//     const verificationPdas = findVerificationPdasWithKeyIds(
//       program.programId,
//       did,
//       keyIds,
//     );

//     before(async () => {
//       await program.methods
//         .initializeDid(did)
//         .accounts({ didDocument: didPda })
//         .rpc();
//     });

//     it('Should add verification method into DID properly', async () => {
//       const keyId = keyIds[0];
//       const verificationPda = verificationPdas[0];
//       await program.methods
//         .addVerificationMethod(
//           did,
//           keyId,
//           keyType,
//           publicKeyMultibase,
//           controller,
//         )
//         .accounts({
//           didDocument: didPda,
//           verificationMethod: verificationPda,
//         })
//         .rpc();

//       const verificationMethod = await program.account.verificationMethod.fetch(
//         verificationPda,
//       );

//       expect(verificationMethod.did === did);
//       expect(verificationMethod.keyId === keyId);
//       expect(verificationMethod.rType === keyType);
//       expect(verificationMethod.publicKeyMultibase === publicKeyMultibase);
//       expect(verificationMethod.controller === controller);
//     });

//     it('Fail to add verification without DID', async () => {
//       try {
//         const notExistDid = 'not exist';
//         const keyId = keyIds[0];
//         const verificationPda = verificationPdas[0];

//         await program.methods
//           .addVerificationMethod(
//             notExistDid,
//             keyId,
//             keyType,
//             publicKeyMultibase,
//             controller,
//           )
//           .accounts({
//             didDocument: didPda,
//             verificationMethod: verificationPda,
//           })
//           .rpc();
//       } catch (err) {
//         expect(
//           err.error.errorCode.code === ANCHOR_ERROR_ACCOUNT_NOT_INITIALIZED,
//         );
//       }
//     });

//     it('Fail to add verification with no auth', async () => {
//       try {
//         const malicious = anchor.web3.Keypair.generate();
//         const transaction = new anchor.web3.Transaction().add(
//           anchor.web3.SystemProgram.transfer({
//             fromPubkey: provider.publicKey,
//             toPubkey: malicious.publicKey,
//             lamports: anchor.web3.LAMPORTS_PER_SOL,
//           }),
//         );
//         await provider.sendAndConfirm(transaction);

//         const keyId = keyIds[2];
//         const verificationPda = verificationPdas[2];

//         await program.methods
//           .addVerificationMethod(
//             did,
//             keyId,
//             keyType,
//             publicKeyMultibase,
//             controller,
//           )
//           .accounts({
//             didDocument: didPda,
//             verificationMethod: verificationPda,
//             controller: malicious.publicKey,
//           })
//           .signers([malicious])
//           .rpc();
//       } catch (err) {
//         expect(err.error.errorCode.code === ANCHOR_ERROR_UNAUTHORIZED);
//       }
//     });
//   });

//   describe('addVerificationRelationship()', () => {
//     const did = 'did:zuni:solana:addVerificationRelationship';
//     const [didPda] = anchor.web3.PublicKey.findProgramAddressSync(
//       [keccak_256(did)],
//       program.programId,
//     );
//     const keyIds = genKeyIds(5, did);
//     const keyType = KEY_TYPE.ed25519;
//     const publicKeyMultibase =
//       MULTIBASE_PREFIX.base58btc +
//       anchor.web3.Keypair.generate().publicKey.toBase58();
//     const verificationPdas = findVerificationPdasWithKeyIds(
//       program.programId,
//       did,
//       keyIds,
//     );
//     const verificationRelationshipTypes = Object.values(
//       VERIFICATION_RELATIONSHIP,
//     );

//     before(async () => {
//       await program.methods
//         .initializeDid(did)
//         .accounts({ didDocument: didPda })
//         .rpc();
//     });

//     it('Should add verification relationship into DID properly', async () => {
//       const keyId = keyIds[0];
//       const verificationPda = verificationPdas[0];
//       await program.methods
//         .addVerificationMethod(
//           did,
//           keyId,
//           keyType,
//           publicKeyMultibase,
//           provider.wallet.publicKey,
//         )
//         .accounts({
//           didDocument: didPda,
//           verificationMethod: verificationPda,
//         })
//         .rpc();

//       for (const relationshipType of verificationRelationshipTypes) {
//         const [relationshipPda] = anchor.web3.PublicKey.findProgramAddressSync(
//           [
//             Buffer.from(
//               keccak_256(did + relationshipType.discriminator + keyId),
//             ),
//           ],
//           program.programId,
//         );
//         await program.methods
//           .addVerificationRelationship(did, relationshipType.input, keyId)
//           .accounts({
//             didDocument: didPda,
//             verificationMethod: verificationPda,
//             verificationRelationship: relationshipPda,
//           })
//           .rpc();

//         const verificationRelationship =
//           await program.account.verificationRelationship.fetch(relationshipPda);

//         expect(verificationRelationship.did === did);
//         expect(verificationRelationship.keyId === keyId);
//         expect(
//           JSON.stringify(verificationRelationship.relationship) ===
//             JSON.stringify(relationshipType.input),
//         );
//       }
//     });

//     it('Fail to add verification relationship with unauthorized', async () => {
//       const keyId = keyIds[1];
//       const verificationPda = verificationPdas[1];
//       await program.methods
//         .addVerificationMethod(
//           did,
//           keyId,
//           keyType,
//           publicKeyMultibase,
//           provider.wallet.publicKey,
//         )
//         .accounts({
//           didDocument: didPda,
//           verificationMethod: verificationPda,
//         })
//         .rpc();

//       for (const relationshipType of verificationRelationshipTypes) {
//         try {
//           const malicious = anchor.web3.Keypair.generate();
//           const transaction = new anchor.web3.Transaction().add(
//             anchor.web3.SystemProgram.transfer({
//               fromPubkey: provider.publicKey,
//               toPubkey: malicious.publicKey,
//               lamports: anchor.web3.LAMPORTS_PER_SOL,
//             }),
//           );
//           await provider.sendAndConfirm(transaction);

//           const [relationshipPda] =
//             anchor.web3.PublicKey.findProgramAddressSync(
//               [
//                 Buffer.from(
//                   keccak_256(did + relationshipType.discriminator + keyId),
//                 ),
//               ],
//               program.programId,
//             );

//           await program.methods
//             .addVerificationRelationship(did, relationshipType.input, keyId)
//             .accounts({
//               didDocument: didPda,
//               verificationMethod: verificationPda,
//               verificationRelationship: relationshipPda,
//               controller: malicious.publicKey,
//             })
//             .signers([malicious])
//             .rpc();
//         } catch (err) {
//           expect(err.error.errorCode.code === ANCHOR_ERROR_UNAUTHORIZED);
//         }
//       }
//     });
//   });
// });
