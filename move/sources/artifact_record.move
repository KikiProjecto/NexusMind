module nexusmind::artifact_record {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use std::string::String;
    use sui::vec_map::{Self, VecMap};
    use sui::clock::{Self, Clock};
    use nexusmind::agent_registry::{Self, AgentCap};

    // === Errors ===
    const E_UNAUTHORIZED: u64 = 1;
    const E_INVALID_TYPE: u64 = 2;

    // === Objects ===
    public struct AgentArtifact has key, store {
        id: UID,
        blob_id: u256,                      // Walrus blob ID (content-addressed)
        walrus_object_id: address,          // Sui object ID of Walrus blob registration
        agent_address: address,
        agent_role: String,
        artifact_type: String,              // "report" | "signal" | "log" | "dataset" | "summary"
        task_id: String,
        workflow_id: address,
        is_encrypted: bool,                 // true if sealed with Seal
        seal_policy_id: address,            // Seal policy object ID (if encrypted)
        created_epoch: u64,
        created_at_ms: u64,
        content_hash: vector<u8>,           // SHA3-256 of plaintext content
        metadata: VecMap<String, String>,   // Arbitrary key-value metadata
    }

    public struct ArtifactRegistry has key {
        id: UID,
        total_artifacts: u64,
    }

    // === Events ===
    public struct ArtifactCreated has copy, drop {
        artifact_id: ID,
        blob_id: u256,
        agent_address: address,
        artifact_type: String,
        task_id: String,
        is_encrypted: bool,
        timestamp: u64,
    }

    fun init(ctx: &mut TxContext) {
        transfer::share_object(ArtifactRegistry {
            id: object::new(ctx),
            total_artifacts: 0,
        });
    }

    public fun record_artifact(
        cap: &AgentCap,
        registry: &mut ArtifactRegistry,
        blob_id: u256,
        walrus_object_id: address,
        artifact_type: String,
        task_id: String,
        workflow_id: address,
        is_encrypted: bool,
        seal_policy_id: address,
        content_hash: vector<u8>,
        metadata: VecMap<String, String>,
        clock: &Clock,
        ctx: &mut TxContext,
    ): AgentArtifact {
        let artifact = AgentArtifact {
            id: object::new(ctx),
            blob_id,
            walrus_object_id,
            agent_address: agent_registry::agent_cap_address(cap),
            agent_role: agent_registry::agent_cap_role(cap),
            artifact_type,
            task_id,
            workflow_id,
            is_encrypted,
            seal_policy_id,
            created_epoch: tx_context::epoch(ctx),
            created_at_ms: clock::timestamp_ms(clock),
            content_hash,
            metadata,
        };

        event::emit(ArtifactCreated {
            artifact_id: object::id(&artifact),
            blob_id,
            agent_address: artifact.agent_address,
            artifact_type: artifact.artifact_type,
            task_id: artifact.task_id,
            is_encrypted,
            timestamp: clock::timestamp_ms(clock),
        });

        registry.total_artifacts = registry.total_artifacts + 1;
        artifact
    }
}
