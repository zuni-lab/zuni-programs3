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
pub struct VerificationRelationship {
    pub did: String,
    pub relationship: Relationship,
    pub key_id: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum Relationship {
    Authentication,
    Assertion,
    KeyAgreement,
}

impl Relationship {
    pub fn as_bytes(&self) -> &[u8] {
        match self {
            Relationship::Authentication => b"authentication",
            Relationship::Assertion => b"assertion",
            Relationship::KeyAgreement => b"key_agreement",
        }
    }
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

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct Secp256k1Signature {
    pub recovery_id: u8,
    pub signature: [u8; 64],
}
