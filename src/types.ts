export type PrivacyShareLevel = 'ALLOWED' | 'ASK_FIRST' | 'REQUIRE_EXPLICIT_APPROVAL';

export interface DataSharingPermissions {
  medical_history: PrivacyShareLevel;
  critical_allergies: PrivacyShareLevel;
  current_medications: PrivacyShareLevel;
  insurance_information: PrivacyShareLevel;
  full_medical_records: PrivacyShareLevel;
  location_tracking: PrivacyShareLevel;
}

export interface RecommendationExplanation {
  recommended_hospital_id: string;
  recommended_hospital_name: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  key_reasons: string[];
  alternatives_considered: {
    hospital_name: string;
    decision: 'REJECTED';
    reason: string;
  }[];
  data_points_considered: string[];
  calculated_at: string;
}

export interface TimelineMilestone {
  time_offset: string;
  timestamp_label: string;
  title: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  actor: string;
  description: string;
}

export interface PatientProfile {
  patient_id: string;
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  blood_group: string;
  allergies: string[];
  medications: string[];
  relevant_conditions: string[];
  emergency_contacts: {
    contact_id: string;
    name: string;
    relationship: string;
    phone: string;
    is_primary: boolean;
    notification_status: 'PENDING' | 'SENT' | 'DELIVERED' | 'ACKNOWLEDGED';
  }[];
  consent_preferences: {
    share_medical_history: boolean;
    notify_family_immediately: boolean;
    share_location: boolean;
    dnr_status: boolean;
    allow_ai_coordination: boolean;
  };
  data_sharing_permissions: DataSharingPermissions;
  insurance_id: string;
  insurance_provider?: string;
  preferred_language?: string;
  primary_physician?: string;
  readiness_score: number;
}

export interface Hospital {
  hospital_id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  emergency_capability: boolean;
  trauma_capability: 'Level 1' | 'Level 2' | 'Level 3' | 'None';
  specialties: string[];
  total_beds: number;
  icu_beds_available: number;
  er_beds_available: number;
  operating_status: 'NORMAL' | 'ELEVATED_SURGE' | 'CODE_BLACK_DIVERT' | 'MAINTENANCE';
  current_wait_time_minutes: number;
  distance_km: number;
  eta_minutes: number;
  contact_phone: string;
  match_score?: number;
  selection_rationale?: string;
}

export interface Ambulance {
  ambulance_id: string;
  unit_code: string;
  vehicle_type: 'ALS' | 'BLS' | 'CRITICAL_CARE';
  latitude: number;
  longitude: number;
  status: 'AVAILABLE' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'TRANSPORTING' | 'MAINTENANCE';
  paramedic_crew: string[];
  equipment: string[];
  current_emergency_id?: string;
  eta_to_patient_minutes?: number;
}

export type EmergencyType =
  | 'ROAD_ACCIDENT'
  | 'CARDIAC_ARREST'
  | 'ELDERLY_FALL'
  | 'STROKE_SYMPTOMS'
  | 'SEVERE_RESPIRATORY'
  | 'ANAPHYLAXIS';

export type EmergencySeverity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export type EmergencyStatus =
  | 'INGESTING'
  | 'REASONING'
  | 'ACTION_REQUIRED'
  | 'COORDINATING'
  | 'AMBULANCE_EN_ROUTE'
  | 'RE_PLANNING'
  | 'RESOLVED';

export interface Vitals {
  heart_rate: number;
  systolic_bp: number;
  diastolic_bp: number;
  spO2: number;
  gcs_score: number; // Glasgow Coma Scale (3-15)
  conscious: boolean;
  respiratory_rate: number;
}

export interface Emergency {
  emergency_id: string;
  patient_id: string;
  patient_name: string;
  emergency_type: EmergencyType;
  description: string;
  reported_at: string;
  latitude: number;
  longitude: number;
  address_hint: string;
  severity: EmergencySeverity;
  status: EmergencyStatus;
  vitals: Vitals;
  selected_hospital_id?: string;
  selected_hospital_name?: string;
  alternative_hospitals: Hospital[];
  ambulance_id?: string;
  ambulance_unit?: string;
  ambulance_eta_minutes?: number;
  re_planned: boolean;
  re_plan_reason?: string;
  original_hospital_id?: string;
  original_hospital_name?: string;
  response_summary?: string;
  medical_emergency_card?: {
    critical_summary: string;
    blood_group: string;
    verified_allergies: string[];
    relevant_meds: string[];
    key_conditions: string[];
    privacy_notice: string;
  };
  dispatch_audio_text?: string;
  emergency_voice_call?: {
    call_id: string;
    target_contact_name: string;
    target_phone: string;
    relationship: string;
    call_status: 'INITIATED' | 'RINGING' | 'CONNECTED' | 'VOICE_NOTE_PLAYING' | 'COMPLETED' | 'ACKNOWLEDGED';
    call_timestamp: string;
    voice_script: string;
    audio_base64?: string;
    summary_sms_delivered: boolean;
    duration_seconds: number;
    telephony_gateway?: 'TWILIO_REST_API' | 'TWILIO_SIP_SIMULATOR' | 'SIP_TRUNK';
    twilio_call_sid?: string;
    twiml_preview?: string;
  };
}

export interface AgentActivityLog {
  id: string;
  emergency_id: string;
  agent_name:
    | 'CoordinatorAgent'
    | 'MedicalContextAgent'
    | 'LocationAgent'
    | 'HospitalIntelligenceAgent'
    | 'CommunicationAgent'
    | 'ResponseAgent'
    | 'MonitoringAgent';
  timestamp: string;
  step_title: string;
  action_type:
    | 'THOUGHT'
    | 'TOOL_CALL'
    | 'TOOL_RESULT'
    | 'DELEGATION'
    | 'DECISION'
    | 'RE_PLAN_TRIGGER'
    | 'NOTIFICATION';
  details: string;
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  confidence_score?: number;
}

export interface EmergencyEvent {
  event_id: string;
  emergency_id: string;
  event_type:
    | 'INCIDENT_DETECTED'
    | 'HOSPITAL_DIVERT_TRIGGERED'
    | 'TRAFFIC_CONGESTION_SPIKE'
    | 'VITALS_DETERIORATION'
    | 'CONTACT_ACKNOWLEDGED'
    | 'AMBULANCE_DISPATCHED'
    | 'HUMAN_APPROVAL_GRANTED'
    | 'RE_PLAN_COMPLETED';
  timestamp: string;
  source: 'PUB_SUB_SYSTEM' | 'AMBULANCE_IOT' | 'HOSPITAL_PORTAL' | 'COMMAND_OPERATOR' | 'AGENT_CORE';
  payload: Record<string, any>;
  summary: string;
}

export interface ActionProposal {
  action_id: string;
  emergency_id: string;
  title: string;
  description: string;
  high_impact: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  action_category: 'HOSPITAL_DISPATCH' | 'AMBULANCE_ASSIGNMENT' | 'FAMILY_ALERT' | 'MEDICAL_TRANSMIT' | 'RE_ROUTE_TRANSFER';
  evidence: string[];
  recommended_at: string;
  requires_role: string;
  action_payload: Record<string, any>;
}

export interface SystemMetrics {
  total_emergencies_managed: number;
  average_response_planning_time_ms: number;
  average_hospital_match_score: number;
  re_planning_success_rate_percent: number;
  agent_task_completion_rate_percent: number;
  average_time_saved_minutes: number;
  data_sources_correlated: number;
  system_uptime_percent: number;
  gemini_token_efficiency_score: number;
}

// ==========================================
// BigQuery Schemas & Metadata Types
// ==========================================
export interface BigQueryColumnSchema {
  name: string;
  type: 'STRING' | 'INT64' | 'FLOAT64' | 'BOOL' | 'TIMESTAMP' | 'DATE' | 'GEOGRAPHY' | 'RECORD';
  mode: 'REQUIRED' | 'NULLABLE' | 'REPEATED';
  description: string;
  fields?: BigQueryColumnSchema[];
}

export interface BigQueryTableMetadata {
  table_id: string;
  dataset_id: string;
  project_id: string;
  entity: 'Patient' | 'Hospital' | 'Emergency';
  description: string;
  partition_spec: {
    field: string;
    type: 'DAY' | 'MONTH' | 'YEAR';
    description: string;
  };
  cluster_spec: {
    fields: string[];
    description: string;
  };
  sql_ddl: string;
  json_schema: BigQueryColumnSchema[];
  performance_rationale: string[];
  sample_query: {
    title: string;
    sql: string;
    explanation: string;
  };
}

// ==========================================
// Agent Communication Protocol (ACP v1.0)
// ==========================================
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

export interface AgentProtocolMessage<T = Record<string, any>> {
  protocol_version: 'ACP/1.0';
  message_id: string;
  task_id: string;
  correlation_id: string;
  sender: AgentRole;
  receiver: AgentRole | '*';
  message_type: AgentMessageType;
  priority: AgentMessagePriority;
  status: AgentMessageStatus;
  timestamp: string;
  deadline_ms: number;
  payload: T;
  error_context?: ProtocolErrorContext;
  ack_metadata?: {
    received_at: string;
    accepted: boolean;
    estimated_completion_ms: number;
    worker_node: string;
  };
}

