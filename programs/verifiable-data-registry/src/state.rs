use anchor_lang::prelude::*;

#[account]
pub struct DidDocument {
    pub controller: Pubkey,
    pub did: String,
}

#[account]
pub struct VerificationMethod {
    pub controller: Pubkey,
    pub did: String,
    pub key_id: String,
    pub r#type: String,
    pub public_key_multibase: String,
}

#[account]
pub struct Authentication {
    pub did: String,
    pub key_id: String,
}

#[account]
pub struct Assertion {
    pub did: String,
    pub key_id: String,
}

#[account]
pub struct KeyAgreement {
    pub did: String,
    pub key_id: String,
}

#[account]
pub struct CredentialState {
    pub issuer_did: String,
    pub credential_id: String,
    pub status: CredentialStatus,
    pub expire_at: Option<u64>, // Unix timestamps in milliseconds
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum CredentialStatus {
    Active,
    Revoked,
}
