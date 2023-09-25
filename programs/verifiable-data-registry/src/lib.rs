use anchor_lang::prelude::*;

declare_id!("4SwFwwPrYGRbctsxaK3iuLCdhPyRJy6cUVbe6GK1zSDr");

#[program]
pub mod verifiable_data_registry {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
