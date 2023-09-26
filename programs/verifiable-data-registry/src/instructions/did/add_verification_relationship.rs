use anchor_lang::prelude::*;

use crate::error::VerifiableDataRegistryError;
use crate::state::*;

#[derive(Accounts)]
#[instruction(did: String, key_id: String)]
pub struct AddAuthentication<'info> {
    #[account(
        init,
        seeds=[did.as_bytes(), key_id.as_bytes(), "authentication".as_bytes()],
        bump,
        payer = controller,
        space = 8 + 4+did.len() + 4+key_id.len() + 4+"authentication".len()
    )]
    pub authentication: Account<'info, Authentication>,
    #[account(seeds=[did.as_bytes()], bump)]
    pub did_document: Account<'info, DidDocument>,
    #[account(mut)]
    pub controller: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn add_authentication_handler(
    ctx: Context<AddAuthentication>,
    did: String,
    key_id: String,
) -> Result<()> {
    require!(
        ctx.accounts.did_document.controller == ctx.accounts.controller.key(),
        VerifiableDataRegistryError::Unauthorized,
    );
    ctx.accounts.authentication.did = did;
    ctx.accounts.authentication.key_id = key_id;
    Ok(())
}

#[derive(Accounts)]
#[instruction(did: String, key_id: String)]
pub struct AddAssertion<'info> {
    #[account(
        init,
        seeds=[did.as_bytes(), key_id.as_bytes(), "assertion".as_bytes()],
        bump,
        payer = controller,
        space = 8 + 4+did.len() + 4+key_id.len() + 4+"assertion".len()
    )]
    pub assertion: Account<'info, Assertion>,
    #[account(seeds=[did.as_bytes()], bump)]
    pub did_document: Account<'info, DidDocument>,
    #[account(mut)]
    pub controller: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn add_assertion_handler(
    ctx: Context<AddAssertion>,
    did: String,
    key_id: String,
) -> Result<()> {
    require!(
        ctx.accounts.did_document.controller == ctx.accounts.controller.key(),
        VerifiableDataRegistryError::Unauthorized,
    );
    ctx.accounts.assertion.did = did;
    ctx.accounts.assertion.key_id = key_id;
    Ok(())
}

#[derive(Accounts)]
#[instruction(did: String, key_id: String)]
pub struct AddKeyAgreement<'info> {
    #[account(
        init,
        seeds=[did.as_bytes(), key_id.as_bytes(), "key_agreement".as_bytes()],
        bump,
        payer = controller,
        space = 8 + 4+did.len() + 4+key_id.len() + 4+"key_agreement".len()
    )]
    pub key_agreement: Account<'info, KeyAgreement>,
    #[account(seeds=[did.as_bytes()], bump)]
    pub did_document: Account<'info, DidDocument>,
    #[account(mut)]
    pub controller: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn add_key_agreement_handler(
    ctx: Context<AddKeyAgreement>,
    did: String,
    key_id: String,
) -> Result<()> {
    require!(
        ctx.accounts.did_document.controller == ctx.accounts.controller.key(),
        VerifiableDataRegistryError::Unauthorized,
    );
    ctx.accounts.key_agreement.did = did;
    ctx.accounts.key_agreement.key_id = key_id;
    Ok(())
}
