use anchor_lang::prelude::*;
use solana_program::keccak;

use crate::state::*;

#[derive(Accounts)]
#[instruction(did: String, relationship: Relationship, key_id: String, )]
pub struct AddVerificationRelationship<'info> {
    #[account(
        init,
        seeds=[keccak::hash([
            did.as_bytes(), 
            relationship.as_bytes(), 
            key_id.as_bytes()
        ].concat().as_slice()).as_ref()],
        bump,
        payer = controller,
        space = 8 + (4 + verification_method.did.len()) + 1 + (4 + verification_method.key_id.len())
    )]
    pub verification_relationship: Account<'info, VerificationRelationship>,
    #[account(
        seeds=[keccak::hash(did.as_bytes()).as_ref()], 
        bump,
        constraint = 
            did_document.controller == controller.key()
            && did_document.did == did
    )]
    pub did_document: Account<'info, DidDocument>,
    #[account(
        seeds=[keccak::hash([did.as_bytes(), key_id.as_bytes()].concat().as_slice()).as_ref()], 
        bump,
        constraint = verification_method.key_id == key_id
    )]
    pub verification_method: Account<'info, VerificationMethod>,
    #[account(mut)]
    pub controller: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn add_verification_relationship_handler(
    ctx: Context<AddVerificationRelationship>,
    did: String, 
    relationship: Relationship,
    key_id: String, 
) -> Result<()> {
    ctx.accounts.verification_relationship.did = did;
    ctx.accounts.verification_relationship.relationship = relationship;
    ctx.accounts.verification_relationship.key_id = key_id;
    Ok(())
}

