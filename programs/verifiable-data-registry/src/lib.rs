use anchor_lang::prelude::*;

mod error;
mod instructions;
mod state;

use instructions::*;
use state::*;

declare_id!("DaSnbN9itw4MSTaw2ZMa6h72cgazzSmBBFYb7PtvpYow");

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

    pub fn add_verification_relationship(
        ctx: Context<AddVerificationRelationship>,
        did: String,
        relationship: Relationship,
        key_id: String,
    ) -> Result<()> {
        add_verification_relationship_handler(ctx, did, relationship, key_id)
    }

    pub fn add_credential(
        ctx: Context<AddCredential>,
        did: String,
        authentication_id: String,
        credential_id: String,
        expire_at: Option<u64>,
        // secp256k1_signature: Secp256k1Signature,
        recovery_id: u8,
        signature: [u8; 64],
    ) -> Result<()> {
        add_credential_handler(
            ctx,
            did,
            authentication_id,
            credential_id,
            expire_at,
            Secp256k1Signature {
                recovery_id,
                signature,
            },
        )
    }

    pub fn revoke_credential(
        ctx: Context<RevokeCredential>,
        did: String,
        authentication_id: String,
        credential_id: String,
        // secp256k1_signature: Secp256k1Signature,
        recovery_id: u8,
        signature: [u8; 64],
    ) -> Result<()> {
        revoke_credential_handler(
            ctx,
            did,
            authentication_id,
            credential_id,
            Secp256k1Signature {
                recovery_id,
                signature,
            },
        )
    }
}
