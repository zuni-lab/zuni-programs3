use anchor_lang::prelude::*;
use solana_program::{keccak, secp256k1_recover};

use crate::error::VerifiableDataRegistryError;
use crate::state::*;

pub fn add_credential_handler(
    ctx: Context<AddCredential>,
    did: String,
    _authentication_id: String,
    credential_id: String,
    expire_at: Option<u64>,
    secp256k1_signature: Secp256k1Signature,
) -> Result<()> {
    msg!("secp: {:?}", secp256k1_signature.signature);
    require!(
        ctx.accounts
            .verification_method
            .r#type
            .eq("EcdsaSecp256k1VerificationKey2019"),
        VerifiableDataRegistryError::NotSupportKeyType
    );
    let hash = keccak::hash(credential_id.as_bytes());
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

    ctx.accounts.credential_state.issuer_did = did;
    ctx.accounts.credential_state.credential_id = credential_id;
    ctx.accounts.credential_state.status = CredentialStatus::Active;
    ctx.accounts.credential_state.expire_at = expire_at;
    Ok(())
}

#[derive(Accounts)]
#[instruction(
    did: String,
    authentication_id: String,
    credential_id: String
)]
pub struct AddCredential<'info> {
    #[account(
        init,
        seeds=[keccak::hash(credential_id.as_bytes()).as_ref()],
        bump,
        payer = payer,
        space = 8 + (4 + did_document.did.len()) + (4 + credential_id.len()) + 1 + (1 + 8)
    )]
    pub credential_state: Account<'info, CredentialState>,
    #[account(
        seeds=[keccak::hash(did.as_bytes()).as_ref()],
        bump,
        constraint = did_document.did ==  authentication.did
    )]
    pub did_document: Account<'info, DidDocument>,
    #[account(
        seeds=[keccak::hash([did.as_bytes(), authentication_id.as_bytes()].concat().as_slice()).as_ref()],
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

