use anchor_lang::prelude::*;

declare_id!("8SmFN6YA4VBf3SKtYeB9oDcffdbukRKakBp5JYcnqtEc");

#[program]
pub mod private_voting {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
