use anchor_lang::prelude::*;
use solana_program::keccak;

use crate::state::*;

#[derive(Accounts)]
#[instruction(did: String)]
pub struct InitializeDID<'info> {
    #[account(
        init,
        seeds = [keccak::hash(did.as_bytes()).as_ref()],
        bump,
        payer = controller,
        space = 8 + 32 + 4 + did.len())]
    pub did_document: Account<'info, DidDocument>,
    #[account(mut)]
    pub controller: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn initialize_did_handler(ctx: Context<InitializeDID>, did: String) -> Result<()> {
    ctx.accounts.did_document.controller = ctx.accounts.controller.key();
    ctx.accounts.did_document.did = did;
    Ok(())
}
