use anchor_lang::prelude::*;

use crate::error::VerifiableDataRegistryError;
use crate::state::*;

#[derive(Accounts)]
#[instruction(did_seed: [u8; 20], verification_seed: [u8; 20], key_id: String, r#type: String, public_key_multibase: String)]
pub struct AddVerificationMethod<'info> {
    #[account(
        init,
        seeds=[verification_seed.as_slice()],
        bump,
        payer = controller,
        space = 
            8 + 32
            + 4 + did_document.did.len() + 4 + key_id.len() 
            + 4 + r#type.len() + 4 + public_key_multibase.len()
    )]
    pub verification_method: Account<'info, VerificationMethod>,
    #[account(seeds=[did_seed.as_slice()], bump)]
    pub did_document: Account<'info, DidDocument>,
    #[account(mut)]
    pub controller: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn add_verification_method_handler(
    ctx: Context<AddVerificationMethod>,
    _did_seed: [u8; 20],
    _verification_seed: [u8; 20],
    key_id: String,
    r#type: String,
    public_key_multibase: String,
    controller: Pubkey,
) -> Result<()> {
    require!(
        ctx.accounts.did_document.controller == ctx.accounts.controller.key(),
        VerifiableDataRegistryError::Unauthorized,
    );
    ctx.accounts.verification_method.controller = controller; // controller of key, not did
    ctx.accounts.verification_method.did = ctx.accounts.did_document.did.clone();
    ctx.accounts.verification_method.key_id = key_id;
    ctx.accounts.verification_method.r#type = r#type;
    ctx.accounts.verification_method.public_key_multibase = public_key_multibase;
    Ok(())
}
