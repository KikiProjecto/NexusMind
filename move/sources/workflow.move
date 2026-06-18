module nexusmind::workflow {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use std::string::String;
    use std::vector;
    use sui::clock::{Self, Clock};
    use nexusmind::agent_registry::{Self, AgentCap};

    // === State Constants ===
    const STATE_PENDING: u8 = 0;
    const STATE_RUNNING: u8 = 1;
    const STATE_COMPLETED: u8 = 2;
    const STATE_FAILED: u8 = 3;

    // === Errors ===
    const E_NOT_ORCHESTRATOR: u64 = 1;

    // === Objects ===
    public struct Workflow has key {
        id: UID,
        name: String,
        description: String,
        state: u8,
        orchestrator: address,
        assigned_agents: vector<address>,
        artifact_ids: vector<ID>,
        task_count: u64,
        completed_tasks: u64,
        created_at: u64,
        updated_at: u64,
        error_message: vector<u8>,
    }

    // === Events ===
    public struct WorkflowCreated has copy, drop {
        workflow_id: ID,
        name: String,
        orchestrator: address,
        timestamp: u64,
    }

    public struct WorkflowStateChanged has copy, drop {
        workflow_id: ID,
        old_state: u8,
        new_state: u8,
        timestamp: u64,
    }

    public struct ArtifactLinked has copy, drop {
        workflow_id: ID,
        artifact_id: ID,
        agent_address: address,
        timestamp: u64,
    }

    public fun create_workflow(
        cap: &AgentCap,
        name: String,
        description: String,
        task_count: u64,
        clock: &Clock,
        ctx: &mut TxContext,
    ): Workflow {
        // Require orchestrator role? Or any agent can create? Assume any, but orchestrator owns it.
        let orchestrator = agent_registry::agent_cap_address(cap);
        let timestamp = clock::timestamp_ms(clock);
        let workflow = Workflow {
            id: object::new(ctx),
            name,
            description,
            state: STATE_PENDING,
            orchestrator,
            assigned_agents: vector::empty(),
            artifact_ids: vector::empty(),
            task_count,
            completed_tasks: 0,
            created_at: timestamp,
            updated_at: timestamp,
            error_message: vector::empty(),
        };

        event::emit(WorkflowCreated {
            workflow_id: object::id(&workflow),
            name: workflow.name,
            orchestrator,
            timestamp,
        });

        workflow
    }

    public fun update_state(
        workflow: &mut Workflow,
        cap: &AgentCap,
        new_state: u8,
        clock: &Clock,
    ) {
        assert!(agent_registry::agent_cap_address(cap) == workflow.orchestrator, E_NOT_ORCHESTRATOR);
        let old_state = workflow.state;
        workflow.state = new_state;
        workflow.updated_at = clock::timestamp_ms(clock);

        event::emit(WorkflowStateChanged {
            workflow_id: object::id(workflow),
            old_state,
            new_state,
            timestamp: workflow.updated_at,
        });
    }

    public fun assign_agent(
        workflow: &mut Workflow,
        cap: &AgentCap,
        agent_address: address,
        clock: &Clock,
    ) {
        assert!(agent_registry::agent_cap_address(cap) == workflow.orchestrator, E_NOT_ORCHESTRATOR);
        if (!vector::contains(&workflow.assigned_agents, &agent_address)) {
            vector::push_back(&mut workflow.assigned_agents, agent_address);
        };
        workflow.updated_at = clock::timestamp_ms(clock);
    }

    public fun link_artifact(
        workflow: &mut Workflow,
        cap: &AgentCap,
        artifact_id: ID,
        clock: &Clock,
    ) {
        // Any assigned agent or orchestrator can link
        let caller = agent_registry::agent_cap_address(cap);
        if (!vector::contains(&workflow.assigned_agents, &caller) && caller != workflow.orchestrator) {
            abort E_NOT_ORCHESTRATOR
        };

        vector::push_back(&mut workflow.artifact_ids, artifact_id);
        workflow.updated_at = clock::timestamp_ms(clock);

        event::emit(ArtifactLinked {
            workflow_id: object::id(workflow),
            artifact_id,
            agent_address: caller,
            timestamp: workflow.updated_at,
        });
    }

    public fun complete_task(
        workflow: &mut Workflow,
        cap: &AgentCap,
        clock: &Clock,
    ) {
        // In real app, might verify role
        workflow.completed_tasks = workflow.completed_tasks + 1;
        workflow.updated_at = clock::timestamp_ms(clock);
        
        if (workflow.completed_tasks == workflow.task_count) {
            update_state(workflow, cap, STATE_COMPLETED, clock);
        };
    }
}
