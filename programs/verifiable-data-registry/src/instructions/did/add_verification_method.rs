use anchor_lang::prelude::*;
use solana_program::keccak;

use crate::state::*;

#[derive(Accounts)]
#[instruction(did: String, key_id: String, r#type: String, public_key_multibase: String)]
pub struct AddVerificationMethod<'info> {
    #[account(
        init,
        seeds = [keccak::hash([did.as_bytes(), key_id.as_bytes()].concat().as_slice()).as_ref()],
        bump,
        payer = controller,
        space = 
            8 + 32 + 4 + did_document.did.len() + 4 + key_id.len() 
            + 4 + r#type.len() + 4 + public_key_multibase.len()
    )]
    pub verification_method: Account<'info, VerificationMethod>,
    #[account(
        seeds = [keccak::hash(did.as_bytes()).as_ref()], 
        bump,
        constraint = 
            did_document.controller == controller.key()
            && did_document.did == did,
    )]
    pub did_document: Account<'info, DidDocument>,
    #[account(mut)]
    pub controller: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn add_verification_method_handler(
    ctx: Context<AddVerificationMethod>,
    did: String,
    key_id: String,
    r#type: String,
    public_key_multibase: String,
    controller: Pubkey,
) -> Result<()> {
    ctx.accounts.verification_method.controller = controller; // controller of key, not did
    ctx.accounts.verification_method.did = did;
    ctx.accounts.verification_method.key_id = key_id;
    ctx.accounts.verification_method.r#type = r#type;
    ctx.accounts.verification_method.public_key_multibase = public_key_multibase;
    Ok(())
}
