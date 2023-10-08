use anchor_lang::error_code;

#[error_code]
pub enum VerifiableDataRegistryError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Authentication not belong to DID")]
    AuthenticationNotBelongToDid,
    #[msg("Verification ID not match")]
    VerificationIdNotMatch,
}
