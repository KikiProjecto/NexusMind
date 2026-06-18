module nexusmind::agent_registry {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use std::string::{Self, String};
    use sui::vec_map::{Self, VecMap};
    use sui::clock::{Self, Clock};

    // === Errors ===
    const E_NOT_ADMIN: u64 = 1;
    const E_AGENT_ALREADY_REGISTERED: u64 = 2;
    const E_AGENT_NOT_FOUND: u64 = 3;
    const E_INVALID_ROLE: u64 = 4;

    // === Constants ===
    const ROLE_ORCHESTRATOR: vector<u8> = b"orchestrator";
    const ROLE_RESEARCHER: vector<u8> = b"researcher";
    const ROLE_TRADER: vector<u8> = b"trader";
    const ROLE_MONITOR: vector<u8> = b"monitor";

    // === Objects ===
    public struct AdminCap has key, store { id: UID }

    public struct AgentRegistry has key {
        id: UID,
        agents: VecMap<address, AgentInfo>,
        total_registered: u64,
    }

    public struct AgentInfo has store, copy, drop {
        role: String,
        namespace: String,
        registered_at: u64,
        is_active: bool,
        artifact_count: u64,
    }

    public struct AgentCap has key, store {
        id: UID,
        agent_address: address,
        role: String,
        namespace: String,
    }

    // === Events ===
    public struct AgentRegistered has copy, drop {
        agent_address: address,
        role: String,
        namespace: String,
        timestamp: u64,
    }

    public struct AgentDeactivated has copy, drop {
        agent_address: address,
        timestamp: u64,
    }

    // === Init ===
    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap { id: object::new(ctx) };
        transfer::transfer(admin_cap, tx_context::sender(ctx));

        let registry = AgentRegistry {
            id: object::new(ctx),
            agents: vec_map::empty(),
            total_registered: 0,
        };
        transfer::share_object(registry);
    }

    // === Public Functions ===
    public fun register_agent(
        _admin: &AdminCap,
        registry: &mut AgentRegistry,
        agent_address: address,
        role: String,
        namespace: String,
        clock: &Clock,
        ctx: &mut TxContext,
    ): AgentCap {
        assert!(
            !vec_map::contains(&registry.agents, &agent_address),
            E_AGENT_ALREADY_REGISTERED
        );

        let info = AgentInfo {
            role: role,
            namespace: namespace,
            registered_at: clock::timestamp_ms(clock),
            is_active: true,
            artifact_count: 0,
        };

        vec_map::insert(&mut registry.agents, agent_address, info);
        registry.total_registered = registry.total_registered + 1;

        event::emit(AgentRegistered {
            agent_address,
            role: role,
            namespace: namespace,
            timestamp: clock::timestamp_ms(clock),
        });

        AgentCap {
            id: object::new(ctx),
            agent_address,
            role: role,
            namespace: namespace,
        }
    }

    public fun increment_artifact_count(
        cap: &AgentCap,
        registry: &mut AgentRegistry,
    ) {
        let info = vec_map::get_mut(&mut registry.agents, &cap.agent_address);
        info.artifact_count = info.artifact_count + 1;
    }

    // === View Functions ===
    public fun get_agent_info(
        registry: &AgentRegistry,
        agent_address: address,
    ): AgentInfo {
        *vec_map::get(&registry.agents, &agent_address)
    }

    public fun agent_count(registry: &AgentRegistry): u64 {
        registry.total_registered
    }
    
    public fun agent_cap_address(cap: &AgentCap): address {
        cap.agent_address
    }
    
    public fun agent_cap_role(cap: &AgentCap): String {
        cap.role
    }
    
    // For testing
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}
