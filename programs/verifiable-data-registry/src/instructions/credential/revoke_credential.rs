use anchor_lang::prelude::*;
use solana_program::{keccak, secp256k1_recover};

use crate::error::VerifiableDataRegistryError;
use crate::state::*;

pub fn revoke_credential_handler(
    ctx: Context<RevokeCredential>,
    _did: String,
    _authentication_id: String,
    credential_id: String,
    secp256k1_signature: Secp256k1Signature,
) -> Result<()> {
    require!(
        ctx.accounts
            .verification_method
            .r#type
            .eq("EcdsaSecp256k1VerificationKey2019"),
        VerifiableDataRegistryError::NotSupportKeyType
    );
    let hash = keccak::hash([credential_id.as_bytes(), b"REVOKE"].concat().as_ref());
    let signed_pubkey = secp256k1_recover::secp256k1_recover(
        hash.0.as_ref(),
        secp256k1_signature.recovery_id,
        secp256k1_signature.signature.as_ref(),
    )
    .unwrap();
    let (_, verification_pubkey) =
        multibase::decode(&ctx.accounts.verification_method.public_key_multibase).unwrap();
    require!(
        signed_pubkey.0.to_ascii_lowercase() == verification_pubkey.to_ascii_lowercase(),
        VerifiableDataRegistryError::Unauthorized
    );

    ctx.accounts.credential_state.status = CredentialStatus::Revoked;
    Ok(())
}

#[derive(Accounts)]
#[instruction(
    did: String,
    authentication_id: String,
    credential_id: String
)]
pub struct RevokeCredential<'info> {
    #[account(
        mut,
        seeds = [keccak::hash(credential_id.as_bytes()).as_ref()],
        bump,
        constraint = credential_state.status != CredentialStatus::Revoked
    )]
    pub credential_state: Account<'info, CredentialState>,
    #[account(
        seeds=[keccak::hash(did.as_bytes()).as_ref()],
        bump,
        constraint = did_document.did ==  authentication.did
    )]
    pub did_document: Account<'info, DidDocument>,
    #[account(
        seeds = [keccak::hash([
            did.as_bytes(), 
            authentication_id.as_bytes()
        ].concat().as_slice()).as_ref()],
        bump,
        constraint = verification_method.key_id ==  authentication.key_id
    )]
    pub verification_method: Account<'info, VerificationMethod>,
    #[account(
        seeds=[keccak::hash([
            did.as_bytes(), 
            Relationship::Authentication.as_bytes(), 
            authentication_id.as_bytes()
        ].concat().as_slice()).as_ref()],
        bump
    )]
    pub authentication: Account<'info, VerificationRelationship>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}


