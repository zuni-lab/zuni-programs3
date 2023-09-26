use anchor_lang::prelude::*;

mod error;
mod instructions;
mod state;

use instructions::*;

declare_id!("4SwFwwPrYGRbctsxaK3iuLCdhPyRJy6cUVbe6GK1zSDr");

#[program]
pub mod verifiable_data_registry {
    use super::*;

    pub fn initialize_did(ctx: Context<InitializeDID>, did: String) -> Result<()> {
        initialize_did_handler(ctx, did)
    }

    pub fn add_verification_method(
        ctx: Context<AddVerificationMethod>,
        did: String,
        key_id: String,
        r#type: String,
        public_key_multibase: String,
        controller: Pubkey,
    ) -> Result<()> {
        add_verification_method_handler(ctx, did, key_id, r#type, public_key_multibase, controller)
    }

    pub fn add_authentication(
        ctx: Context<AddAuthentication>,
        did: String,
        key_id: String,
    ) -> Result<()> {
        add_authentication_handler(ctx, did, key_id)
    }

    pub fn add_assertion(ctx: Context<AddAssertion>, did: String, key_id: String) -> Result<()> {
        add_assertion_handler(ctx, did, key_id)
    }

    pub fn add_key_agreement(
        ctx: Context<AddKeyAgreement>,
        did: String,
        key_id: String,
    ) -> Result<()> {
        add_key_agreement_handler(ctx, did, key_id)
    }
}
