use anchor_lang::prelude::*;

#[account]
pub struct DidDocument {
    pub did: String,
    pub controller: Pubkey,
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
