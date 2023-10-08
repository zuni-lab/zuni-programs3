use anchor_lang::prelude::*;

mod error;
mod instructions;
mod state;

use instructions::*;

declare_id!("DaSnbN9itw4MSTaw2ZMa6h72cgazzSmBBFYb7PtvpYow");

#[program]
pub mod verifiable_data_registry {
    use super::*;

    pub fn initialize_did(ctx: Context<InitializeDID>, seed: [u8; 20], did: String) -> Result<()> {
        initialize_did_handler(ctx, seed, did)
    }

    pub fn add_verification_method(
        ctx: Context<AddVerificationMethod>,
        did_seed: [u8; 20],
        verification_seed: [u8; 20],
        key_id: String,
        r#type: String,
        public_key_multibase: String,
        controller: Pubkey,
    ) -> Result<()> {
        add_verification_method_handler(
            ctx,
            did_seed,
            verification_seed,
            key_id,
            r#type,
            public_key_multibase,
            controller,
        )
    }

    pub fn add_authentication(
        ctx: Context<AddAuthentication>,
        did_seed: [u8; 20],
        verification_seed: [u8; 20],
        authentication_seed: [u8; 20],
    ) -> Result<()> {
        add_authentication_handler(ctx, did_seed, verification_seed, authentication_seed)
    }

    pub fn add_assertion(
        ctx: Context<AddAssertion>,
        did_seed: [u8; 20],
        verification_seed: [u8; 20],
        assertion_seed: [u8; 20],
    ) -> Result<()> {
        add_assertion_handler(ctx, did_seed, verification_seed, assertion_seed)
    }

    pub fn add_key_agreement(
        ctx: Context<AddKeyAgreement>,
        did_seed: [u8; 20],
        verification_seed: [u8; 20],
        key_agreement_seed: [u8; 20],
    ) -> Result<()> {
        add_key_agreement_handler(ctx, did_seed, verification_seed, key_agreement_seed)
    }

    pub fn add_credential(
        ctx: Context<AddCredential>,
        did_seed: [u8; 20],
        verification_seed: [u8; 20],
        authentication_seed: [u8; 20],
        credential_seed: [u8; 20],
        credential_id: String,
        expire_at: Option<u64>,
    ) -> Result<()> {
        add_credential_handler(
            ctx,
            did_seed,
            verification_seed,
            authentication_seed,
            credential_seed,
            credential_id,
            expire_at,
        )
    }

    pub fn revoke_credential(
        ctx: Context<RevokeCredential>,
        did_seed: [u8; 20],
        verification_seed: [u8; 20],
        authentication_seed: [u8; 20],
        credential_seed: [u8; 20],
    ) -> Result<()> {
        revoke_credential_handler(
            ctx,
            did_seed,
            verification_seed,
            authentication_seed,
            credential_seed,
        )
    }
}
