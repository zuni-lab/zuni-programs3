use anchor_lang::error_code;

#[error_code]
pub enum VerifiableDataRegistryError {
    #[msg("Unauthorized")]
    Unauthorized,
}
