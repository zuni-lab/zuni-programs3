use anchor_lang::prelude::*;

use crate::state::*;

#[derive(Accounts)]
#[instruction(seed: [u8; 20], did: String)]
pub struct InitializeDID<'info> {
    #[account(
        init,
        seeds=[seed.as_slice()],
        bump,
        payer = controller,
        space = 8 + 32 + 4 + DidDocument::DISCRIMINATOR.len() + 4 + did.len())]
    pub did_document: Account<'info, DidDocument>,
    #[account(mut)]
    pub controller: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn initialize_did_handler(
    ctx: Context<InitializeDID>,
    _seed: [u8; 20],
    did: String,
) -> Result<()> {
    ctx.accounts.did_document.controller = ctx.accounts.controller.key();
    ctx.accounts.did_document.discriminator = DidDocument::DISCRIMINATOR.to_string();
    ctx.accounts.did_document.did = did;
    Ok(())
}
