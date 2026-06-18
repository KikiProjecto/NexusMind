module nexusmind::seal_policies {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::vector;
    use nexusmind::agent_registry::{Self, AgentCap, AgentRegistry};

    // === Objects ===
    public struct AgentAllowlist has key, store {
        id: UID,
        name: vector<u8>,
        allowed_agents: vector<address>,
        owner: address,
    }

    // === Errors ===
    const E_NOT_ALLOWED: u64 = 1;
    const E_NOT_OWNER: u64 = 2;

    public fun create_allowlist(
        name: vector<u8>,
        ctx: &mut TxContext,
    ): AgentAllowlist {
        AgentAllowlist {
            id: object::new(ctx),
            name,
            allowed_agents: vector::empty(),
            owner: tx_context::sender(ctx),
        }
    }

    public fun add_agent(
        allowlist: &mut AgentAllowlist,
        agent_address: address,
        ctx: &TxContext,
    ) {
        assert!(allowlist.owner == tx_context::sender(ctx), E_NOT_OWNER);
        if (!vector::contains(&allowlist.allowed_agents, &agent_address)) {
            vector::push_back(&mut allowlist.allowed_agents, agent_address);
        }
    }

    // seal_approve entry — called by Seal key servers
    // This is what Seal calls to verify access rights
    entry fun seal_approve(
        _id: vector<u8>,
        allowlist: &AgentAllowlist,
        ctx: &TxContext,
    ) {
        let caller = tx_context::sender(ctx);
        assert!(
            vector::contains(&allowlist.allowed_agents, &caller) || 
            allowlist.owner == caller,
            E_NOT_ALLOWED
        );
    }
}
