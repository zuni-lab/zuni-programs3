use anchor_lang::prelude::*;

use crate::error::VerifiableDataRegistryError;
use crate::state::*;

#[derive(Accounts)]
#[instruction(did: String, key_id: String)]
pub struct AddAuthentication<'info> {
    #[account(
        init,
        seeds=[Authentication::DISCRIMINATOR.as_bytes(), did.as_bytes(), key_id.as_bytes()],
        bump,
        payer = controller,
        space = 8 + 4+Authentication::DISCRIMINATOR.len() + 4+did.len() + 4+key_id.len()
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
    ctx.accounts.authentication.discriminator = Authentication::DISCRIMINATOR.to_string();
    ctx.accounts.authentication.did = did;
    ctx.accounts.authentication.key_id = key_id;
    Ok(())
}

#[derive(Accounts)]
#[instruction(did: String, key_id: String)]
pub struct AddAssertion<'info> {
    #[account(
        init,
        seeds=[Assertion::DISCRIMINATOR.as_bytes(), did.as_bytes(), key_id.as_bytes()],
        bump,
        payer = controller,
        space = 8 + 4+Assertion::DISCRIMINATOR.len() + 4+did.len() + 4+key_id.len()
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
    ctx.accounts.assertion.discriminator = Assertion::DISCRIMINATOR.to_string();
    ctx.accounts.assertion.did = did;
    ctx.accounts.assertion.key_id = key_id;
    Ok(())
}

#[derive(Accounts)]
#[instruction(did: String, key_id: String)]
pub struct AddKeyAgreement<'info> {
    #[account(
        init,
        seeds=[KeyAgreement::DISCRIMINATOR.as_bytes(), did.as_bytes(), key_id.as_bytes()],
        bump,
        payer = controller,
        space = 8 + 4+KeyAgreement::DISCRIMINATOR.len() + 4+did.len() + 4+key_id.len()
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
    ctx.accounts.key_agreement.discriminator = KeyAgreement::DISCRIMINATOR.to_string();
    ctx.accounts.key_agreement.did = did;
    ctx.accounts.key_agreement.key_id = key_id;
    Ok(())
}
