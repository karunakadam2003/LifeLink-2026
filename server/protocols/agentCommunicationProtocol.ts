/**
 * LifeLink Agent Communication Protocol (ACP v1.0)
 *
 * Defines the peer-to-peer and orchestrated message contracts,
 * request/response payloads, two-phase acknowledgment lifecycle,
 * and resilient error-handling state machines across LifeLink autonomous agents.
 */

export type AgentRole =
  | 'CoordinatorAgent'
  | 'MedicalContextAgent'
  | 'LocationAgent'
  | 'HospitalIntelligenceAgent'
  | 'ResponseAgent'
  | 'MonitoringAgent';

export type AgentMessageType =
  | 'REQUEST'
  | 'RESPONSE'
  | 'ACKNOWLEDGMENT'
  | 'ERROR'
  | 'EVENT_BROADCAST';

export type AgentMessagePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AgentMessageStatus =
  | 'PENDING'
  | 'RECEIVED'
  | 'IN_PROGRESS'
  | 'SUCCESS'
  | 'FAILED'
  | 'TIMEOUT'
  | 'CIRCUIT_BROKEN'
  | 'REJECTED';

export type ProtocolErrorCode =
  | 'ERR_TIMEOUT'
  | 'ERR_VALIDATION'
  | 'ERR_CIRCUIT_OPEN'
  | 'ERR_CAPACITY_EXCEEDED'
  | 'ERR_DEPENDENCY_FAILED'
  | 'ERR_RATE_LIMIT'
  | 'ERR_PATIENT_CONSENT_DENIED'
  | 'ERR_NO_VIABLE_HOSPITAL';

export interface ProtocolErrorContext {
  error_code: ProtocolErrorCode;
  error_message: string;
  retry_count: number;
  max_retries: number;
  retry_after_ms?: number;
  circuit_status?: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  fallback_applied: boolean;
  fallback_details?: string;
  stack_trace?: string;
}

export interface AgentMessage<T = Record<string, any>> {
  protocol_version: 'ACP/1.0';
  message_id: string;          // Globally unique UUID for this message (MSG-...)
  task_id: string;             // Correlation ID for this specific task execution (TSK-...)
  correlation_id: string;      // Emergency incident ID root (EMG-...)
  sender: AgentRole;           // Identity of originating agent
  receiver: AgentRole | '*';   // Target agent or '*' for broadcast
  message_type: AgentMessageType;
  priority: AgentMessagePriority;
  status: AgentMessageStatus;
  timestamp: string;           // ISO-8601 UTC timestamp
  deadline_ms: number;         // SLA deadline budget for processing
  payload: T;                  // Task-specific strongly typed data
  error_context?: ProtocolErrorContext;
  ack_metadata?: {
    received_at: string;
    accepted: boolean;
    estimated_completion_ms: number;
    worker_node: string;
  };
}

// -----------------------------------------------------------------------------
// Specialized Task Payload Schemas for Agent Roles
// -----------------------------------------------------------------------------

// Coordinator -> MedicalContextAgent Request & Response
export interface MedicalContextRequestPayload {
  patient_id: string;
  emergency_type: string;
  incident_description: string;
  request_fields: Array<'allergies' | 'medications' | 'conditions' | 'contacts' | 'consent' | 'dnr'>;
}

export interface MedicalContextResponsePayload {
  patient_id: string;
  blood_group: string;
  allergies: string[];
  current_medications: string[];
  chronic_conditions: string[];
  dnr_active: boolean;
  authorized_emergency_contacts: Array<{
    name: string;
    phone: string;
    relationship: string;
    is_primary: boolean;
  }>;
  privacy_clearance: 'APPROVED_FULL' | 'APPROVED_MINIMAL' | 'RESTRICTED';
  recommended_specialties: string[];
}

// Coordinator -> LocationAgent Request & Response
export interface LocationRequestPayload {
  scene_latitude: number;
  scene_longitude: number;
  traffic_multiplier: number;
  candidate_hospital_ids: string[];
  need_ambulance_dispatch: boolean;
}

export interface LocationResponsePayload {
  scene_geohash: string;
  traffic_density: 'LIGHT' | 'MODERATE' | 'CONGESTED' | 'GRIDLOCK';
  nearest_ambulance: {
    ambulance_id: string;
    unit_code: string;
    type: 'ALS' | 'BLS';
    eta_minutes: number;
    distance_km: number;
  };
  hospital_routes: Array<{
    hospital_id: string;
    distance_km: number;
    transit_eta_minutes: number;
    traffic_delay_minutes: number;
    optimal_corridor_name: string;
  }>;
}

// Coordinator -> HospitalIntelligenceAgent Request & Response
export interface HospitalIntelligenceRequestPayload {
  incident_type: string;
  required_specialties: string[];
  patient_blood_group: string;
  candidate_hospitals: Array<{
    hospital_id: string;
    transit_eta_minutes: number;
    distance_km: number;
  }>;
  excluded_hospital_ids?: string[];
}

export interface HospitalIntelligenceResponsePayload {
  selected_hospital: {
    hospital_id: string;
    name: string;
    trauma_level: string;
    icu_beds_available: number;
    er_beds_available: number;
    wait_time_minutes: number;
    total_eta_minutes: number;
    match_score: number;
    clinical_rationale: string;
  };
  alternatives: Array<{
    hospital_id: string;
    name: string;
    match_score: number;
    rejection_reason: string;
  }>;
}

// Coordinator -> ResponseAgent Request & Response
export interface ResponseDispatchPayload {
  emergency_id: string;
  patient_name: string;
  patient_phone?: string;
  selected_hospital_id: string;
  ambulance_id: string;
  emergency_contacts: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
  voice_broadcast_required: boolean;
  sms_summary_required: boolean;
}

export interface ResponseDispatchResultPayload {
  ambulance_dispatch_status: 'CONFIRMED' | 'QUEUED' | 'FAILED';
  voice_calls_placed: Array<{
    contact_name: string;
    phone: string;
    call_sid: string;
    status: 'RINGING' | 'CONNECTED' | 'ACKNOWLEDGED';
  }>;
  hospital_er_pre_arrival_pushed: boolean;
}

// MonitoringAgent -> Coordinator Event Broadcast
export interface MonitoringEventPayload {
  emergency_id: string;
  event_category: 'HOSPITAL_DIVERT' | 'TRAFFIC_CONGESTION_SPIKE' | 'PATIENT_VITALS_COLLAPSE';
  affected_entity_id: string;
  metric_change: {
    before: number | string;
    after: number | string;
    threshold_exceeded: boolean;
  };
  suggested_action: 'RE_PLAN_IMMEDIATELY' | 'NOTIFY_PARAMEDIC' | 'STANDBY';
  telemetry_timestamp: string;
}

// -----------------------------------------------------------------------------
// Protocol State Machine: Acknowledgment, Retry, & Circuit Breaker Logic
// -----------------------------------------------------------------------------

export class AgentCommunicationEngine {
  private inMemoryIdempotencyCache: Map<string, AgentMessage> = new Map();
  private circuitBreakers: Map<AgentRole, { failures: number; state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'; lastFailure: number }> = new Map();

  // Create a standard outgoing request message
  public createRequest<T>(
    sender: AgentRole,
    receiver: AgentRole | '*',
    correlationId: string,
    payload: T,
    priority: AgentMessagePriority = 'HIGH',
    deadlineMs = 2500
  ): AgentMessage<T> {
    const taskId = `TSK-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const messageId = `MSG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    return {
      protocol_version: 'ACP/1.0',
      message_id: messageId,
      task_id: taskId,
      correlation_id: correlationId,
      sender,
      receiver,
      message_type: 'REQUEST',
      priority,
      status: 'PENDING',
      timestamp: new Date().toISOString(),
      deadline_ms: deadlineMs,
      payload,
    };
  }

  // Create an immediate Two-Phase ACK response
  public createAcknowledgment(request: AgentMessage, accepted = true, rejectionReason?: string): AgentMessage {
    return {
      protocol_version: 'ACP/1.0',
      message_id: `ACK-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      task_id: request.task_id,
      correlation_id: request.correlation_id,
      sender: request.receiver as AgentRole,
      receiver: request.sender,
      message_type: 'ACKNOWLEDGMENT',
      priority: request.priority,
      status: accepted ? 'RECEIVED' : 'REJECTED',
      timestamp: new Date().toISOString(),
      deadline_ms: request.deadline_ms,
      payload: {
        acknowledged_message_id: request.message_id,
        status: accepted ? 'ACCEPTED_FOR_EXECUTION' : 'REJECTED',
        reason: rejectionReason || (accepted ? 'Agent idle and resources committed.' : 'Queue limit reached.'),
      },
      ack_metadata: {
        received_at: new Date().toISOString(),
        accepted,
        estimated_completion_ms: Math.min(request.deadline_ms, 800),
        worker_node: `lifelink-agent-worker-${(request.receiver || 'default').toLowerCase()}`,
      },
    };
  }

  // Create a successful task response
  public createResponse<T>(request: AgentMessage, resultPayload: T): AgentMessage<T> {
    const responseMessage: AgentMessage<T> = {
      protocol_version: 'ACP/1.0',
      message_id: `RES-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      task_id: request.task_id,
      correlation_id: request.correlation_id,
      sender: request.receiver as AgentRole,
      receiver: request.sender,
      message_type: 'RESPONSE',
      priority: request.priority,
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
      deadline_ms: request.deadline_ms,
      payload: resultPayload,
    };

    // Store in idempotency cache
    this.inMemoryIdempotencyCache.set(request.task_id, responseMessage as any);
    this.recordSuccess(request.receiver as AgentRole);

    return responseMessage;
  }

  // Create an error response with circuit breaker state & fallback details
  public createError(
    request: AgentMessage,
    errorCode: ProtocolErrorCode,
    errorMessage: string,
    fallbackPayload?: any,
    fallbackDetails?: string
  ): AgentMessage {
    const receiver = request.receiver as AgentRole;
    this.recordFailure(receiver);
    const cb = this.getCircuitBreaker(receiver);

    const retryCount = (request.error_context?.retry_count || 0) + 1;
    const maxRetries = 3;
    // Exponential backoff with full jitter: base 200ms
    const baseBackoff = 200;
    const exponentialWait = baseBackoff * Math.pow(2, retryCount - 1);
    const jitteredWait = Math.floor(exponentialWait * (0.5 + Math.random() * 0.5));

    return {
      protocol_version: 'ACP/1.0',
      message_id: `ERR-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      task_id: request.task_id,
      correlation_id: request.correlation_id,
      sender: receiver,
      receiver: request.sender,
      message_type: 'ERROR',
      priority: request.priority,
      status: cb.state === 'OPEN' ? 'CIRCUIT_BROKEN' : 'FAILED',
      timestamp: new Date().toISOString(),
      deadline_ms: request.deadline_ms,
      payload: fallbackPayload || { execution_interrupted: true },
      error_context: {
        error_code: errorCode,
        error_message: errorMessage,
        retry_count: retryCount,
        max_retries: maxRetries,
        retry_after_ms: retryCount <= maxRetries ? jitteredWait : undefined,
        circuit_status: cb.state,
        fallback_applied: Boolean(fallbackPayload),
        fallback_details: fallbackDetails || (fallbackPayload ? 'Applied deterministic rule-based fallback.' : 'No fallback available.'),
      },
    };
  }

  // Circuit breaker helper
  private getCircuitBreaker(agent: AgentRole) {
    let cb = this.circuitBreakers.get(agent);
    if (!cb) {
      cb = { failures: 0, state: 'CLOSED', lastFailure: 0 };
      this.circuitBreakers.set(agent, cb);
    }
    // Auto reset from OPEN to HALF_OPEN after 15 seconds
    if (cb.state === 'OPEN' && Date.now() - cb.lastFailure > 15000) {
      cb.state = 'HALF_OPEN';
    }
    return cb;
  }

  private recordSuccess(agent: AgentRole) {
    const cb = this.getCircuitBreaker(agent);
    cb.failures = 0;
    cb.state = 'CLOSED';
  }

  private recordFailure(agent: AgentRole) {
    const cb = this.getCircuitBreaker(agent);
    cb.failures++;
    cb.lastFailure = Date.now();
    if (cb.failures >= 3) {
      cb.state = 'OPEN';
    }
  }

  // Check idempotency cache
  public getCachedResponse(taskId: string): AgentMessage | null {
    return this.inMemoryIdempotencyCache.get(taskId) || null;
  }
}

export const agentCommunicationEngine = new AgentCommunicationEngine();
