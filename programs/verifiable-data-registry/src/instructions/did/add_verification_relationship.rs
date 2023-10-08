use anchor_lang::prelude::*;

use crate::error::VerifiableDataRegistryError;
use crate::state::*;

#[derive(Accounts)]
#[instruction(did_seed: [u8; 20], verification_seed: [u8; 20], authentication_seed: [u8; 20])]
pub struct AddAuthentication<'info> {
    #[account(
        init,
        seeds=[authentication_seed.as_slice()],
        bump,
        payer = controller,
        space = 
            8 + 4 + Authentication::DISCRIMINATOR.len() 
            + 4 + verification_method.did.len() + 4 + verification_method.key_id.len()
    )]
    pub authentication: Account<'info, Authentication>,
    #[account(seeds=[did_seed.as_slice()], bump)]
    pub did_document: Account<'info, DidDocument>,
    #[account(seeds=[verification_seed.as_slice()], bump)]
    pub verification_method: Account<'info, VerificationMethod>,
    #[account(mut)]
    pub controller: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn add_authentication_handler(
    ctx: Context<AddAuthentication>,
    _did_seed: [u8; 20],
    _veirifcation_seed: [u8; 20],
    _authentication_seed: [u8; 20],
) -> Result<()> {
    require!(
        ctx.accounts.did_document.controller == ctx.accounts.controller.key(),
        VerifiableDataRegistryError::Unauthorized,
    );
    ctx.accounts.authentication.discriminator = Authentication::DISCRIMINATOR.to_string();
    ctx.accounts.authentication.did = ctx.accounts.verification_method.did.clone();
    ctx.accounts.authentication.key_id = ctx.accounts.verification_method.key_id.clone();
    Ok(())
}

#[derive(Accounts)]
#[instruction(did_seed: [u8; 20], verification_seed: [u8; 20], assertion_seed: [u8; 20])]
pub struct AddAssertion<'info> {
    #[account(
        init,
        seeds=[assertion_seed.as_slice()],
        bump,
        payer = controller,
        space = 
            8 + 4 + Assertion::DISCRIMINATOR.len() 
            + 4 + verification_method.did.len() + 4 + verification_method.key_id.len()
    )]
    pub assertion: Account<'info, Assertion>,
    #[account(seeds=[did_seed.as_slice()], bump)]
    pub did_document: Account<'info, DidDocument>,
    #[account(seeds=[verification_seed.as_slice()], bump)]
    pub verification_method: Account<'info, VerificationMethod>,
    #[account(mut)]
    pub controller: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn add_assertion_handler(
    ctx: Context<AddAssertion>,
    _did_seed: [u8; 20],
    _veirifcation_seed: [u8; 20],
    _assertion_seed: [u8; 20],
) -> Result<()> {
    require!(
        ctx.accounts.did_document.controller == ctx.accounts.controller.key(),
        VerifiableDataRegistryError::Unauthorized,
    );
    ctx.accounts.assertion.discriminator = Assertion::DISCRIMINATOR.to_string();
    ctx.accounts.assertion.did = ctx.accounts.verification_method.did.clone();
    ctx.accounts.assertion.key_id = ctx.accounts.verification_method.key_id.clone();
    Ok(())
}

#[derive(Accounts)]
#[instruction(did_seed: [u8; 20], verification_seed: [u8; 20], key_agreement_seed: [u8; 20])]
pub struct AddKeyAgreement<'info> {
    #[account(
        init,
        seeds=[key_agreement_seed.as_slice()],
        bump,
        payer = controller,
        space = 
            8 + 4 + KeyAgreement::DISCRIMINATOR.len() 
            + 4 + verification_method.did.len() + 4 + verification_method.key_id.len()
    )]
    pub key_agreement: Account<'info, KeyAgreement>,
    #[account(seeds=[did_seed.as_slice()], bump)]
    pub did_document: Account<'info, DidDocument>,
    #[account(seeds=[verification_seed.as_slice()], bump)]
    pub verification_method: Account<'info, VerificationMethod>,
    #[account(mut)]
    pub controller: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn add_key_agreement_handler(
    ctx: Context<AddKeyAgreement>,
    _did_seed: [u8; 20],
    _veirifcation_seed: [u8; 20],
    _key_agreement_seed: [u8; 20],
) -> Result<()> {
    require!(
        ctx.accounts.did_document.controller == ctx.accounts.controller.key(),
        VerifiableDataRegistryError::Unauthorized,
    );
    ctx.accounts.key_agreement.discriminator = KeyAgreement::DISCRIMINATOR.to_string();
    ctx.accounts.key_agreement.did = ctx.accounts.verification_method.did.clone();
    ctx.accounts.key_agreement.key_id = ctx.accounts.verification_method.key_id.clone();
    Ok(())
}
