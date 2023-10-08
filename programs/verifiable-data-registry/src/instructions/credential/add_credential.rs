use anchor_lang::prelude::*;

use crate::error::VerifiableDataRegistryError;
use crate::state::*;

#[derive(Accounts)]
#[instruction(
    did_seed: [u8; 20], 
    verification_seed: [u8; 20],
    authentication_seed: [u8; 20], 
    credential_seed: [u8; 20], 
    credential_id: String
)]
pub struct AddCredential<'info> {
    #[account(
        init,
        seeds=[credential_seed.as_slice()],
        bump,
        payer = payer,
        space = 8 + 4 + did_document.did.len() + 4 + credential_id.len() + 1 + 1 + 8
    )]
    pub credential_state: Account<'info, CredentialState>,
    #[account(seeds=[did_seed.as_slice()], bump)]
    pub did_document: Account<'info, DidDocument>,
    #[account(seeds=[verification_seed.as_slice()], bump)]
    pub verification_method: Account<'info, VerificationMethod>,
    #[account(seeds=[authentication_seed.as_slice()], bump)]
    pub authentication: Account<'info, Authentication>,
    pub issuer: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn add_credential_handler(
    ctx: Context<AddCredential>,
    _did_seed: [u8; 20],
    _verification_seed: [u8; 20],
    _authentication_seed: [u8; 20], 
    _credential_seed: [u8; 20],
    credential_id: String,
    expire_at: Option<u64>,
) -> Result<()> {
    require!(
        ctx.accounts.did_document.did == ctx.accounts.authentication.did,
        VerifiableDataRegistryError::AuthenticationNotBelongToDid,
    );
    require!(
        ctx.accounts.verification_method.key_id == ctx.accounts.authentication.key_id,
        VerifiableDataRegistryError::VerificationIdNotMatch,
    );
    let (_, verification_pubkey) = multibase::decode(ctx.accounts.verification_method.public_key_multibase.clone()).unwrap();
    require!(
        verification_pubkey == ctx.accounts.issuer.key().to_bytes(),
        VerifiableDataRegistryError::Unauthorized,
    );

    ctx.accounts.credential_state.issuer_did = ctx.accounts.did_document.did.clone();
    ctx.accounts.credential_state.credential_id = credential_id;
    ctx.accounts.credential_state.status = CredentialStatus::Active;
    ctx.accounts.credential_state.expire_at = expire_at;
    Ok(())
}
