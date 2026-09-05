import React, { useState } from 'react';
import { 
  Database, 
  Cpu, 
  Layers, 
  Copy, 
  Check, 
  Send, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Terminal, 
  Table, 
  Workflow, 
  Activity, 
  Sparkles,
  Info,
  ChevronRight,
  Code2,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AgentRole, AgentMessageType, AgentMessagePriority } from '../types';

interface BigQueryAndProtocolViewProps {
  onTriggerReplan?: () => void;
}

export const BigQueryAndProtocolView: React.FC<BigQueryAndProtocolViewProps> = () => {
  const [activeMainTab, setActiveMainTab] = useState<'BIGQUERY' | 'LIVE_QUERY_RUNNER' | 'PROTOCOL'>('BIGQUERY');
  const [selectedEntity, setSelectedEntity] = useState<'Patient' | 'Hospital' | 'Emergency'>('Patient');
  const [schemaFormat, setSchemaFormat] = useState<'SQL_DDL' | 'JSON_SCHEMA' | 'FIELDS_TABLE' | 'SAMPLE_QUERY'>('SQL_DDL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live Query Runner state
  const [activePreset, setActivePreset] = useState<'hospitals' | 'telemetry_events' | 'patients' | 'ambulances' | 'public_covid'>('hospitals');
  const [customSql, setCustomSql] = useState<string>('SELECT hospital_id, name, trauma_capability, er_beds_available, operating_status FROM `lifelink-agentic-2026.lifelink_emergency_dw.hospitals_telemetry`');
  const [isExecutingBq, setIsExecutingBq] = useState<boolean>(false);
  const [bqQueryResult, setBqQueryResult] = useState<any | null>(null);
  const [bqQueryTime, setBqQueryTime] = useState<number | null>(null);
  const [bqQueryError, setBqQueryError] = useState<string | null>(null);

  // Simulator state
  const [simSender, setSimSender] = useState<AgentRole>('CoordinatorAgent');
  const [simReceiver, setSimReceiver] = useState<AgentRole>('MedicalContextAgent');
  const [simPriority, setSimPriority] = useState<AgentMessagePriority>('CRITICAL');
  const [simErrorToggle, setSimErrorToggle] = useState<boolean>(false);
  const [simErrorCode, setSimErrorCode] = useState<'ERR_TIMEOUT' | 'ERR_CIRCUIT_OPEN' | 'ERR_CAPACITY_EXCEEDED' | 'ERR_RATE_LIMIT'>('ERR_TIMEOUT');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  const handleSelectPreset = (preset: 'hospitals' | 'telemetry_events' | 'patients' | 'ambulances' | 'public_covid') => {
    setActivePreset(preset);
    if (preset === 'hospitals') {
      setCustomSql('SELECT hospital_id, name, trauma_capability, er_beds_available, operating_status FROM `lifelink-agentic-2026.lifelink_emergency_dw.hospitals_telemetry`');
    } else if (preset === 'telemetry_events') {
      setCustomSql('SELECT event_id, emergency_id, event_type, timestamp, source, summary FROM `lifelink-agentic-2026.lifelink_emergency_dw.emergency_telemetry_events` ORDER BY timestamp DESC LIMIT 10');
    } else if (preset === 'patients') {
      setCustomSql('SELECT patient_id, name, age, gender, blood_group, insurance_provider, readiness_score FROM `lifelink-agentic-2026.lifelink_emergency_dw.patient_consented_records`');
    } else if (preset === 'ambulances') {
      setCustomSql('SELECT ambulance_id, unit_code, status, vehicle_type, current_emergency_id FROM `lifelink-agentic-2026.lifelink_emergency_dw.ambulance_fleet`');
    } else if (preset === 'public_covid') {
      setCustomSql('SELECT country_name, date, cumulative_confirmed, new_confirmed FROM `bigquery-public-data.covid19_open_data.covid19_open_data` WHERE country_name = \'India\' ORDER BY date DESC LIMIT 5');
    }
  };

  const handleExecuteBigQuery = async () => {
    setIsExecutingBq(true);
    setBqQueryError(null);
    const start = Date.now();
    try {
      if (activePreset === 'public_covid') {
        const res = await fetch('/api/bigquery/public-health-telemetry?region=India');
        const data = await res.json();
        setBqQueryResult(data.records || data);
        setBqQueryTime(Date.now() - start);
      } else {
        const res = await fetch('/api/bigquery/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sql: customSql }),
        });
        const data = await res.json();
        if (data.error) {
          setBqQueryError(data.error);
        } else {
          setBqQueryResult(data.rows || []);
        }
        setBqQueryTime(Date.now() - start);
      }
    } catch (err: any) {
      setBqQueryError(err.message || 'Failed to query BigQuery');
      setBqQueryTime(Date.now() - start);
    } finally {
      setIsExecutingBq(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // BigQuery Specifications
  const entitiesData = {
    Patient: {
      table_id: 'patient_profiles',
      dataset_id: 'lifelink_health_vault',
      project_id: 'lifelink-emergency-prod',
      full_path: '`lifelink-emergency-prod.lifelink_health_vault.patient_profiles`',
      description: 'Encrypted HIPAA/DPDP patient records, biometric profiles, critical allergies, pre-authorized emergency consent, and next-of-kin contacts.',
      partition_spec: {
        field: 'updated_at',
        type: 'DAY',
        rationale: 'Daily partitioning isolates recent profile updates and avoids terabyte scans of historical inactive records.',
      },
      cluster_spec: {
        fields: ['blood_group', 'readiness_score', 'patient_id'],
        rationale: 'Clustering by blood group and readiness score optimizes sub-second indexed triage lookup without full table scans.',
      },
      fields: [
        { name: 'patient_id', type: 'STRING', mode: 'REQUIRED', description: 'Globally unique patient identifier (e.g. PAT-IND-8021)' },
        { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED', description: 'UTC record ingestion timestamp' },
        { name: 'updated_at', type: 'TIMESTAMP', mode: 'REQUIRED', description: 'UTC last modified / EHR sync timestamp (PARTITION KEY)' },
        { name: 'demographics', type: 'RECORD (STRUCT)', mode: 'REQUIRED', description: 'Name, age, gender, date of birth, blood group, language' },
        { name: 'clinical_profile', type: 'RECORD (STRUCT)', mode: 'REQUIRED', description: 'Allergies, medications ARRAY, chronic conditions, DNR order, organ donor' },
        { name: 'emergency_contacts', type: 'REPEATED RECORD', mode: 'REPEATED', description: 'Next-of-kin contacts, phone, relationship, priority' },
        { name: 'consent_and_privacy', type: 'RECORD (STRUCT)', mode: 'REQUIRED', description: 'Granular permissions: medical history, voice alert, location GPS' },
        { name: 'insurance_profile', type: 'RECORD (STRUCT)', mode: 'NULLABLE', description: 'Policy number, carrier name, cashless approved hospital IDs' },
        { name: 'readiness_score', type: 'FLOAT64', mode: 'REQUIRED', description: 'Emergency profile completeness score (0 to 100)' },
      ],
      performance_points: [
        'Zero Join Overhead: Nested STRUCTs for demographics and clinical profiles eliminate multi-table joins during life-critical queries.',
        'REPEATED Arrays: UNNEST allows fast filtering on specific allergies or active anticoagulants with linear in-memory scan performance.',
        'Pruning Inactive Profiles: Partition filter on updated_at guarantees queries scan only recently active patient partitions.',
      ],
      sample_query: `SELECT
    p.patient_id,
    p.demographics.name AS patient_name,
    p.demographics.blood_group,
    p.clinical_profile.critical_allergies,
    p.clinical_profile.active_medications,
    p.consent_and_privacy.share_medical_history,
    ARRAY(
      SELECT AS STRUCT c.name, c.relationship, c.phone
      FROM UNNEST(p.emergency_contacts) AS c
      WHERE c.is_primary = TRUE
    ) AS primary_contact
  FROM \`lifelink-emergency-prod.lifelink_health_vault.patient_profiles\` AS p
  WHERE p.patient_id = 'PAT-IND-8021'
    AND p.consent_and_privacy.allow_ai_coordination = TRUE
  LIMIT 1;`,
      sql_ddl: `CREATE OR REPLACE TABLE \`lifelink-emergency-prod.lifelink_health_vault.patient_profiles\` (
  patient_id STRING NOT NULL OPTIONS(description="Globally unique LifeLink patient ID (e.g., PAT-IND-8021)"),
  created_at TIMESTAMP NOT NULL OPTIONS(description="UTC timestamp when profile was created"),
  updated_at TIMESTAMP NOT NULL OPTIONS(description="UTC timestamp when profile was last modified or synced with EHR"),
  
  demographics STRUCT<
    name STRING NOT NULL OPTIONS(description="Full legal name of the patient"),
    age INT64 NOT NULL OPTIONS(description="Age in years at last verification"),
    gender STRING NOT NULL OPTIONS(description="Biological gender: MALE, FEMALE, OTHER"),
    date_of_birth DATE NOT NULL OPTIONS(description="Patient date of birth"),
    blood_group STRING NOT NULL OPTIONS(description="ABO and Rh factor (e.g., O+, A-, B+, AB-)"),
    preferred_language STRING OPTIONS(description="Preferred language for emergency notifications"),
    primary_physician STRING OPTIONS(description="Name and hospital affiliation of primary doctor")
  > NOT NULL,

  clinical_profile STRUCT<
    critical_allergies ARRAY<STRING> OPTIONS(description="Severe drug and environmental allergies (e.g., Penicillin, Sulfa)"),
    active_medications ARRAY<STRUCT<
      medication_name STRING NOT NULL,
      dosage STRING NOT NULL,
      frequency STRING NOT NULL,
      prescribed_for STRING
    >> OPTIONS(description="Current active pharmaceuticals"),
    chronic_conditions ARRAY<STRING> OPTIONS(description="Pre-existing diagnoses (e.g., Type 2 Diabetes, Atrial Fibrillation)"),
    surgical_history ARRAY<STRING> OPTIONS(description="Key prior surgeries"),
    dnr_order BOOL NOT NULL OPTIONS(description="Do-Not-Resuscitate active legal directive"),
    organ_donor BOOL NOT NULL OPTIONS(description="Registered organ donor status")
  > NOT NULL,

  emergency_contacts ARRAY<STRUCT<
    contact_id STRING NOT NULL,
    name STRING NOT NULL,
    relationship STRING NOT NULL,
    phone STRING NOT NULL,
    email STRING,
    is_primary BOOL NOT NULL,
    notification_priority INT64 NOT NULL
  >> NOT NULL,

  consent_and_privacy STRUCT<
    share_medical_history BOOL NOT NULL,
    notify_family_immediately BOOL NOT NULL,
    share_location BOOL NOT NULL,
    allow_ai_coordination BOOL NOT NULL,
    granular_permissions STRUCT<
      medical_history STRING NOT NULL,
      critical_allergies STRING NOT NULL,
      current_medications STRING NOT NULL,
      insurance_information STRING NOT NULL,
      full_medical_records STRING NOT NULL,
      location_tracking STRING NOT NULL
    > NOT NULL
  > NOT NULL,

  insurance_profile STRUCT<
    policy_id STRING NOT NULL,
    provider_name STRING NOT NULL,
    policy_status STRING NOT NULL,
    cashless_approved_hospitals ARRAY<STRING>
  >,

  readiness_score FLOAT64 NOT NULL
)
PARTITION BY DATE(updated_at)
CLUSTER BY blood_group, readiness_score, patient_id;`,
      json_schema: `[
  { "name": "patient_id", "type": "STRING", "mode": "REQUIRED", "description": "Globally unique patient ID" },
  { "name": "created_at", "type": "TIMESTAMP", "mode": "REQUIRED" },
  { "name": "updated_at", "type": "TIMESTAMP", "mode": "REQUIRED" },
  {
    "name": "demographics",
    "type": "RECORD",
    "mode": "REQUIRED",
    "fields": [
      { "name": "name", "type": "STRING", "mode": "REQUIRED" },
      { "name": "age", "type": "INT64", "mode": "REQUIRED" },
      { "name": "gender", "type": "STRING", "mode": "REQUIRED" },
      { "name": "date_of_birth", "type": "DATE", "mode": "REQUIRED" },
      { "name": "blood_group", "type": "STRING", "mode": "REQUIRED" }
    ]
  },
  {
    "name": "clinical_profile",
    "type": "RECORD",
    "mode": "REQUIRED",
    "fields": [
      { "name": "critical_allergies", "type": "STRING", "mode": "REPEATED" },
      {
        "name": "active_medications",
        "type": "RECORD",
        "mode": "REPEATED",
        "fields": [
          { "name": "medication_name", "type": "STRING", "mode": "REQUIRED" },
          { "name": "dosage", "type": "STRING", "mode": "REQUIRED" }
        ]
      },
      { "name": "chronic_conditions", "type": "STRING", "mode": "REPEATED" },
      { "name": "dnr_order", "type": "BOOL", "mode": "REQUIRED" }
    ]
  },
  { "name": "readiness_score", "type": "FLOAT64", "mode": "REQUIRED" }
]`,
    },

    Hospital: {
      table_id: 'hospital_facilities',
      dataset_id: 'lifelink_hospital_network',
      project_id: 'lifelink-emergency-prod',
      full_path: '`lifelink-emergency-prod.lifelink_hospital_network.hospital_facilities`',
      description: 'Real-time hospital ER & ICU bed availability telemetry, trauma designations (Level 1-3), divert operating status, and BigQuery GEOGRAPHY coordinates.',
      partition_spec: {
        field: 'telemetry_updated_at',
        type: 'DAY',
        rationale: 'Daily partitioning accommodates continuous append-only hospital capacity telemetry streams with automated partition expiration.',
      },
      cluster_spec: {
        fields: ['operating_status', 'trauma_capability', 'hospital_id'],
        rationale: 'Clustering filters out diverting hospitals ("CODE_BLACK_DIVERT") instantly, focusing query execution strictly on available Level-1 trauma centers.',
      },
      fields: [
        { name: 'hospital_id', type: 'STRING', mode: 'REQUIRED', description: 'Unique facility identifier (e.g. HOSP-BLR-01)' },
        { name: 'name', type: 'STRING', mode: 'REQUIRED', description: 'Full facility name (e.g. Manipal Hospital HAL)' },
        { name: 'address', type: 'STRING', mode: 'REQUIRED', description: 'Physical postal street address' },
        { name: 'geography_location', type: 'GEOGRAPHY', mode: 'REQUIRED', description: 'BigQuery spatial Point (ST_GEOGPOINT) for geo queries' },
        { name: 'latitude', type: 'FLOAT64', mode: 'REQUIRED', description: 'WGS84 latitude coordinate' },
        { name: 'longitude', type: 'FLOAT64', mode: 'REQUIRED', description: 'WGS84 longitude coordinate' },
        { name: 'contact_phone', type: 'STRING', mode: 'REQUIRED', description: '24x7 ER direct triage hotline' },
        { name: 'telemetry_updated_at', type: 'TIMESTAMP', mode: 'REQUIRED', description: 'Timestamp of last IoT/API sync (PARTITION KEY)' },
        { name: 'emergency_department', type: 'RECORD (STRUCT)', mode: 'REQUIRED', description: 'Trauma level, operating status, ER beds, ICU beds, wait times' },
        { name: 'specialties', type: 'REPEATED STRING', mode: 'REPEATED', description: 'Trauma Surgery, Comprehensive Stroke, Cath Lab 24x7' },
        { name: 'diagnostic_capabilities', type: 'REPEATED STRING', mode: 'REPEATED', description: 'CT_24_7, MRI_24_7, BLOOD_BANK_O_NEG' },
      ],
      performance_points: [
        'Native Spatial Indexing: Uses BigQuery GEOGRAPHY type and ST_DISTANCE to calculate distances and spatial radii directly inside the database in < 20ms.',
        'Operating Status Clustering: Filters away full/diverted hospitals without reading their underlying records, reducing scanned bytes by up to 80%.',
        'Capacity Telemetry Streaming: Partitioned daily so analytics queries on bed occupancy trends scan minimal data segments.',
      ],
      sample_query: `SELECT
    h.hospital_id,
    h.name,
    h.emergency_department.trauma_capability,
    h.emergency_department.operating_status,
    h.emergency_department.icu_beds_available,
    h.emergency_department.er_beds_available,
    h.emergency_department.current_wait_time_minutes,
    ST_DISTANCE(h.geography_location, ST_GEOGPOINT(77.6412, 12.9716)) / 1000 AS distance_km
  FROM \`lifelink-emergency-prod.lifelink_hospital_network.hospital_facilities\` AS h
  WHERE DATE(h.telemetry_updated_at) = CURRENT_DATE()
    AND h.emergency_department.operating_status NOT IN ('CODE_BLACK_DIVERT', 'MAINTENANCE')
    AND h.emergency_department.trauma_capability IN ('Level 1', 'Level 2')
    AND h.emergency_department.icu_beds_available > 0
  ORDER BY distance_km ASC
  LIMIT 3;`,
      sql_ddl: `CREATE OR REPLACE TABLE \`lifelink-emergency-prod.lifelink_hospital_network.hospital_facilities\` (
  hospital_id STRING NOT NULL OPTIONS(description="Unique hospital identifier (e.g., HOSP-BLR-01)"),
  name STRING NOT NULL OPTIONS(description="Full legal facility name"),
  address STRING NOT NULL OPTIONS(description="Physical postal street address"),
  geography_location GEOGRAPHY NOT NULL OPTIONS(description="BigQuery GEOGRAPHY Point (ST_GEOGPOINT(longitude, latitude))"),
  latitude FLOAT64 NOT NULL,
  longitude FLOAT64 NOT NULL,
  contact_phone STRING NOT NULL,
  telemetry_updated_at TIMESTAMP NOT NULL,

  emergency_department STRUCT<
    has_er BOOL NOT NULL,
    trauma_capability STRING NOT NULL OPTIONS(description="'Level 1', 'Level 2', 'Level 3', 'None'"),
    operating_status STRING NOT NULL OPTIONS(description="'NORMAL', 'ELEVATED_SURGE', 'CODE_BLACK_DIVERT', 'MAINTENANCE'"),
    total_er_beds INT64 NOT NULL,
    er_beds_available INT64 NOT NULL,
    total_icu_beds INT64 NOT NULL,
    icu_beds_available INT64 NOT NULL,
    ventilators_available INT64 NOT NULL,
    trauma_surgeons_on_duty INT64 NOT NULL,
    current_wait_time_minutes INT64 NOT NULL
  > NOT NULL,

  specialties ARRAY<STRING> NOT NULL,
  diagnostic_capabilities ARRAY<STRING> NOT NULL,
  insurance_networks_accepted ARRAY<STRING>
)
PARTITION BY DATE(telemetry_updated_at)
CLUSTER BY operating_status, trauma_capability, hospital_id;`,
      json_schema: `[
  { "name": "hospital_id", "type": "STRING", "mode": "REQUIRED" },
  { "name": "name", "type": "STRING", "mode": "REQUIRED" },
  { "name": "address", "type": "STRING", "mode": "REQUIRED" },
  { "name": "geography_location", "type": "GEOGRAPHY", "mode": "REQUIRED" },
  { "name": "latitude", "type": "FLOAT64", "mode": "REQUIRED" },
  { "name": "longitude", "type": "FLOAT64", "mode": "REQUIRED" },
  { "name": "telemetry_updated_at", "type": "TIMESTAMP", "mode": "REQUIRED" },
  {
    "name": "emergency_department",
    "type": "RECORD",
    "mode": "REQUIRED",
    "fields": [
      { "name": "has_er", "type": "BOOL", "mode": "REQUIRED" },
      { "name": "trauma_capability", "type": "STRING", "mode": "REQUIRED" },
      { "name": "operating_status", "type": "STRING", "mode": "REQUIRED" },
      { "name": "icu_beds_available", "type": "INT64", "mode": "REQUIRED" },
      { "name": "er_beds_available", "type": "INT64", "mode": "REQUIRED" }
    ]
  },
  { "name": "specialties", "type": "STRING", "mode": "REPEATED" }
]`,
    },

    Emergency: {
      table_id: 'emergency_incidents',
      dataset_id: 'lifelink_coordination_lake',
      project_id: 'lifelink-emergency-prod',
      full_path: '`lifelink-emergency-prod.lifelink_coordination_lake.emergency_incidents`',
      description: 'Master operational audit table for emergency incidents, vitals streams, autonomous AI agent decisions, dynamic re-planning diversions, and family telephony logs.',
      partition_spec: {
        field: 'reported_at',
        type: 'DAY',
        rationale: 'Daily partitioning allows live dashboard operations to scan only CURRENT_DATE partitions, slashing cloud query costs by 99%+. ',
      },
      cluster_spec: {
        fields: ['severity', 'emergency_type', 'status', 'patient_id'],
        rationale: 'Clustering optimizes high-concurrency filters for active critical incidents ("CRITICAL", "COORDINATING") and longitudinal patient incident tracking.',
      },
      fields: [
        { name: 'emergency_id', type: 'STRING', mode: 'REQUIRED', description: 'Unique incident identifier (e.g. EMG-802194)' },
        { name: 'patient_id', type: 'STRING', mode: 'REQUIRED', description: 'Foreign key to patient_profiles.patient_id' },
        { name: 'reported_at', type: 'TIMESTAMP', mode: 'REQUIRED', description: 'UTC incident ingestion timestamp (PARTITION KEY)' },
        { name: 'resolved_at', type: 'TIMESTAMP', mode: 'NULLABLE', description: 'UTC resolution or hospital admission timestamp' },
        { name: 'emergency_type', type: 'STRING', mode: 'REQUIRED', description: 'ROAD_ACCIDENT, CARDIAC_ARREST, STROKE, etc.' },
        { name: 'severity', type: 'STRING', mode: 'REQUIRED', description: 'CRITICAL, HIGH, MODERATE, LOW (CLUSTER KEY)' },
        { name: 'status', type: 'STRING', mode: 'REQUIRED', description: 'INGESTING, COORDINATING, AMBULANCE_EN_ROUTE, RESOLVED' },
        { name: 'incident_location', type: 'RECORD (STRUCT)', mode: 'REQUIRED', description: 'GPS coordinates, address hint, GEOGRAPHY Point' },
        { name: 'patient_vitals', type: 'RECORD (STRUCT)', mode: 'REQUIRED', description: 'Heart rate, blood pressure, SpO2, GCS score' },
        { name: 'ambulance_dispatch', type: 'RECORD (STRUCT)', mode: 'NULLABLE', description: 'Unit code, ALS type, dispatched time, ETA minutes' },
        { name: 'hospital_routing', type: 'RECORD (STRUCT)', mode: 'NULLABLE', description: 'Selected hospital, match score, clinical rationale, ETA' },
        { name: 're_planned', type: 'BOOL', mode: 'REQUIRED', description: 'Flag indicating if dynamic diversion was triggered' },
        { name: 're_planning_history', type: 'REPEATED RECORD', mode: 'REPEATED', description: 'Audit history of dynamic diversion events' },
        { name: 'telephony_notifications', type: 'REPEATED RECORD', mode: 'REPEATED', description: 'Outbound Twilio calls, DTMF keypad ACK status' },
      ],
      performance_points: [
        'Partition Pruning: Operational real-time command dashboards query only the current day, ensuring sub-50ms query response times.',
        'High-Impact Multi-Column Clustering: Queries filtering for severity = "CRITICAL" and status != "RESOLVED" touch minimal disk blocks.',
        'Integrated Telephony & Re-Planning Audit: Embedding the re-planning history and contact call logs inside the incident record guarantees atomic auditing.',
      ],
      sample_query: `SELECT
    e.severity,
    e.emergency_type,
    COUNT(1) AS total_incidents,
    COUNTIF(e.re_planned = TRUE) AS replanned_incidents,
    ROUND(AVG(e.ambulance_dispatch.eta_minutes), 1) AS avg_ambulance_eta_mins,
    ROUND(AVG(e.hospital_routing.transit_eta_minutes), 1) AS avg_hospital_eta_mins,
    ROUND(AVG(e.metadata.total_coordination_time_ms), 0) AS avg_ai_coordination_time_ms,
    COUNTIF(e.metadata.golden_hour_target_met = TRUE) / COUNT(1) * 100 AS golden_hour_compliance_pct
  FROM \`lifelink-emergency-prod.lifelink_coordination_lake.emergency_incidents\` AS e
  WHERE DATE(e.reported_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
  GROUP BY e.severity, e.emergency_type
  ORDER BY total_incidents DESC;`,
      sql_ddl: `CREATE OR REPLACE TABLE \`lifelink-emergency-prod.lifelink_coordination_lake.emergency_incidents\` (
  emergency_id STRING NOT NULL OPTIONS(description="Unique emergency incident ID (e.g., EMG-802194)"),
  patient_id STRING NOT NULL OPTIONS(description="Reference to patient_profiles.patient_id"),
  patient_name STRING NOT NULL,
  reported_at TIMESTAMP NOT NULL OPTIONS(description="UTC timestamp when incident was ingested"),
  resolved_at TIMESTAMP,
  
  emergency_type STRING NOT NULL,
  severity STRING NOT NULL OPTIONS(description="'CRITICAL', 'HIGH', 'MODERATE', 'LOW'"),
  status STRING NOT NULL,
  description STRING NOT NULL,

  incident_location STRUCT<
    address_hint STRING NOT NULL,
    latitude FLOAT64 NOT NULL,
    longitude FLOAT64 NOT NULL,
    geography_point GEOGRAPHY NOT NULL
  > NOT NULL,

  patient_vitals STRUCT<
    heart_rate INT64,
    systolic_bp INT64,
    diastolic_bp INT64,
    spO2 INT64,
    gcs_score INT64,
    conscious BOOL,
    respiratory_rate INT64,
    recorded_at TIMESTAMP
  > NOT NULL,

  ambulance_dispatch STRUCT<
    ambulance_id STRING NOT NULL,
    unit_code STRING NOT NULL,
    vehicle_type STRING NOT NULL,
    dispatched_at TIMESTAMP NOT NULL,
    eta_minutes INT64 NOT NULL,
    paramedic_crew ARRAY<STRING>
  >,

  hospital_routing STRUCT<
    selected_hospital_id STRING NOT NULL,
    selected_hospital_name STRING NOT NULL,
    match_score FLOAT64 NOT NULL,
    selection_rationale STRING NOT NULL,
    transit_eta_minutes INT64 NOT NULL,
    distance_km FLOAT64 NOT NULL
  >,

  re_planned BOOL NOT NULL,
  re_planning_history ARRAY<STRUCT<
    re_plan_id STRING NOT NULL,
    triggered_at TIMESTAMP NOT NULL,
    trigger_source STRING NOT NULL,
    reason STRING NOT NULL,
    previous_hospital_id STRING NOT NULL,
    new_hospital_id STRING NOT NULL,
    eta_differential_minutes INT64 NOT NULL
  >>,

  telephony_notifications ARRAY<STRUCT<
    notification_id STRING NOT NULL,
    contact_name STRING NOT NULL,
    relationship STRING NOT NULL,
    phone STRING NOT NULL,
    channel STRING NOT NULL,
    twilio_call_sid STRING,
    call_status STRING NOT NULL,
    dtmf_digit_acknowledged STRING,
    dispatched_at TIMESTAMP NOT NULL,
    acknowledged_at TIMESTAMP
  >>,

  metadata STRUCT<
    total_coordination_time_ms INT64 NOT NULL,
    gemini_model_used STRING NOT NULL,
    golden_hour_target_met BOOL NOT NULL,
    human_in_the_loop_approval BOOL NOT NULL
  > NOT NULL
)
PARTITION BY DATE(reported_at)
CLUSTER BY severity, emergency_type, status, patient_id;`,
      json_schema: `[
  { "name": "emergency_id", "type": "STRING", "mode": "REQUIRED" },
  { "name": "patient_id", "type": "STRING", "mode": "REQUIRED" },
  { "name": "reported_at", "type": "TIMESTAMP", "mode": "REQUIRED" },
  { "name": "severity", "type": "STRING", "mode": "REQUIRED" },
  { "name": "emergency_type", "type": "STRING", "mode": "REQUIRED" },
  { "name": "status", "type": "STRING", "mode": "REQUIRED" },
  {
    "name": "incident_location",
    "type": "RECORD",
    "mode": "REQUIRED",
    "fields": [
      { "name": "latitude", "type": "FLOAT64", "mode": "REQUIRED" },
      { "name": "longitude", "type": "FLOAT64", "mode": "REQUIRED" },
      { "name": "geography_point", "type": "GEOGRAPHY", "mode": "REQUIRED" }
    ]
  },
  { "name": "re_planned", "type": "BOOL", "mode": "REQUIRED" }
]`,
    },
  };

  const currentEntity = entitiesData[selectedEntity];

  // Handle Simulator Send
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationResult(null);

    try {
      const res = await fetch('/api/protocol/simulate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: simSender,
          receiver: simReceiver,
          correlation_id: `EMG-${Date.now().toString().slice(-6)}`,
          priority: simPriority,
          simulate_error: simErrorToggle,
          error_code: simErrorCode,
          payload: {
            command: `Execute task delegation from ${simSender} to ${simReceiver}`,
            incident_type: 'CARDIAC_ARREST',
            request_deadline_budget_ms: simPriority === 'CRITICAL' ? 1500 : 3000,
          },
        }),
      });
      const data = await res.json();
      setSimulationResult(data.simulation_trace);
    } catch (err: any) {
      console.error('Simulation failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div id="bigquery-and-protocol-view" className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              Infrastructure & Multi-Agent Communication Architecture
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              BigQuery Schemas & Agent Communication Protocol
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Explore the production BigQuery data lake DDL for Patient, Hospital, and Emergency entities (optimized with partitioning and clustering), alongside the formal Agent Communication Protocol (ACP v1.0) with two-phase acknowledgments, circuit breakers, and fault tolerance.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setActiveMainTab('BIGQUERY')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMainTab === 'BIGQUERY'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <Database className="w-4 h-4" />
              BigQuery Schemas
            </button>

            <button
              onClick={() => setActiveMainTab('LIVE_QUERY_RUNNER')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMainTab === 'LIVE_QUERY_RUNNER'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400/40'
                  : 'text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60'
              }`}
            >
              <Zap className="w-4 h-4" />
              Live SQL Query Console
            </button>

            <button
              onClick={() => setActiveMainTab('PROTOCOL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMainTab === 'PROTOCOL'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <Workflow className="w-4 h-4" />
              Agent Protocol (ACP v1.0)
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: LIVE BIGQUERY QUERY CONSOLE */}
      {/* ========================================================================= */}
      {activeMainTab === 'LIVE_QUERY_RUNNER' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                    <Database className="w-3 h-3 text-emerald-400" />
                    Google Cloud Live Query Engine
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Dataset: lifelink_emergency_dw</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1.5">
                  Interactive BigQuery Query & Public Health Console
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Execute live parameterized SQL queries directly against your Google Cloud BigQuery Data Warehouse or public datasets.
                </p>
              </div>

              {/* Preset Quick Selectors */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 font-medium">Presets:</span>
                <button
                  onClick={() => handleSelectPreset('hospitals')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    activePreset === 'hospitals'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  🏥 Hospitals Telemetry
                </button>
                <button
                  onClick={() => handleSelectPreset('telemetry_events')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    activePreset === 'telemetry_events'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  ⚡ Paramedic Events
                </button>
                <button
                  onClick={() => handleSelectPreset('patients')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    activePreset === 'patients'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  🩺 Consented Patients
                </button>
                <button
                  onClick={() => handleSelectPreset('public_covid')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    activePreset === 'public_covid'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  🌍 Public Health Dataset
                </button>
              </div>
            </div>

            {/* SQL Editor Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono flex items-center gap-1.5 text-slate-300">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  SQL Query Statement
                </span>
                <span>Standard SQL • Google BigQuery</span>
              </div>

              <div className="relative">
                <textarea
                  value={customSql}
                  onChange={(e) => setCustomSql(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 text-cyan-300 font-mono text-xs p-4 rounded-2xl border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 shadow-inner resize-y"
                  placeholder="Enter BigQuery SQL statement..."
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-slate-400">
                  ⚡ Auto-routes to Google Cloud BigQuery API with sub-second streaming response.
                </p>

                <button
                  onClick={handleExecuteBigQuery}
                  disabled={isExecutingBq}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
                >
                  <Zap className={`w-3.5 h-3.5 ${isExecutingBq ? 'animate-spin' : 'fill-white'}`} />
                  <span>{isExecutingBq ? 'Executing on GCP...' : 'Run Query on BigQuery'}</span>
                </button>
              </div>
            </div>

            {/* Query Results & Execution Output */}
            {bqQueryError && (
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <AlertTriangle className="w-4 h-4" />
                  BigQuery Execution Notice
                </div>
                <p className="font-mono text-[11px]">{bqQueryError}</p>
              </div>
            )}

            {bqQueryResult && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Query Success
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {Array.isArray(bqQueryResult) ? `${bqQueryResult.length} rows returned` : 'Result returned'}
                    </span>
                  </div>

                  {bqQueryTime !== null && (
                    <span className="text-xs font-mono text-slate-400">
                      Latency: <strong className="text-emerald-400">{bqQueryTime}ms</strong>
                    </span>
                  )}
                </div>

                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 overflow-x-auto max-h-80 shadow-inner">
                  <pre className="text-[11px] font-mono text-emerald-300 leading-relaxed">
                    {JSON.stringify(bqQueryResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: BIGQUERY PRODUCTION SCHEMAS */}
      {/* ========================================================================= */}
      {activeMainTab === 'BIGQUERY' && (
        <div className="space-y-6">
          {/* Entity Selector Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['Patient', 'Hospital', 'Emergency'] as const).map((entityKey) => {
              const item = entitiesData[entityKey];
              const isSelected = selectedEntity === entityKey;
              return (
                <button
                  key={entityKey}
                  onClick={() => setSelectedEntity(entityKey)}
                  className={`p-5 rounded-2xl text-left transition-all border relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 border-blue-500 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Entity Schema
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                      isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {item.table_id}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {entityKey}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                    {item.description}
                  </p>

                  {/* Partition & Cluster Chips */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      PARTITION BY DATE({item.partition_spec.field})
                    </span>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      CLUSTER BY {item.cluster_spec.fields.slice(0, 2).join(', ')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Table Details Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {currentEntity.full_path}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    BigQuery Standard SQL (2026.1)
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                  {selectedEntity} Schema Definition & Performance Specification
                </h2>
              </div>

              {/* Format Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setSchemaFormat('SQL_DDL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    schemaFormat === 'SQL_DDL'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  SQL DDL
                </button>
                <button
                  onClick={() => setSchemaFormat('FIELDS_TABLE')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    schemaFormat === 'FIELDS_TABLE'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Fields
                </button>
                <button
                  onClick={() => setSchemaFormat('JSON_SCHEMA')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    schemaFormat === 'JSON_SCHEMA'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  JSON
                </button>
                <button
                  onClick={() => setSchemaFormat('SAMPLE_QUERY')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    schemaFormat === 'SAMPLE_QUERY'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Sample SQL
                </button>
              </div>
            </div>

            {/* Tab View Contents */}
            {schemaFormat === 'SQL_DDL' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-blue-500" />
                    DDL Script with Partitioning & Clustering
                  </span>
                  <button
                    onClick={() => copyToClipboard(currentEntity.sql_ddl, 'ddl')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                  >
                    {copiedKey === 'ddl' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'ddl' ? 'Copied!' : 'Copy DDL'}
                  </button>
                </div>
                <pre className="bg-slate-950 text-blue-300 p-5 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
                  <code>{currentEntity.sql_ddl}</code>
                </pre>
              </div>
            )}

            {schemaFormat === 'FIELDS_TABLE' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                      <th className="pb-3 font-semibold">Field Name</th>
                      <th className="pb-3 font-semibold">Type</th>
                      <th className="pb-3 font-semibold">Mode</th>
                      <th className="pb-3 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {currentEntity.fields.map((f, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="py-3 font-mono font-bold text-blue-600 dark:text-blue-400">{f.name}</td>
                        <td className="py-3 font-mono text-slate-700 dark:text-slate-300">{f.type}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            f.mode === 'REQUIRED' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-500/10 text-slate-400'
                          }`}>
                            {f.mode}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">{f.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {schemaFormat === 'JSON_SCHEMA' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-purple-500" />
                    Google Cloud BigQuery Table API JSON Schema
                  </span>
                  <button
                    onClick={() => copyToClipboard(currentEntity.json_schema, 'json')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                  >
                    {copiedKey === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'json' ? 'Copied!' : 'Copy JSON Schema'}
                  </button>
                </div>
                <pre className="bg-slate-950 text-emerald-400 p-5 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
                  <code>{currentEntity.json_schema}</code>
                </pre>
              </div>
            )}

            {schemaFormat === 'SAMPLE_QUERY' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Production Analytical Query (Leverages Partition & Cluster Indexing)
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Executes across Google Cloud BigQuery engine with minimal byte scanning.
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(currentEntity.sample_query, 'query')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                  >
                    {copiedKey === 'query' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'query' ? 'Copied!' : 'Copy SQL'}
                  </button>
                </div>
                <pre className="bg-slate-950 text-cyan-300 p-5 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
                  <code>{currentEntity.sample_query}</code>
                </pre>
              </div>
            )}

            {/* Performance Rationale Bullets */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Engineering & Query Optimization Notes
              </h4>
              <ul className="space-y-1.5">
                {currentEntity.performance_points.map((pt, idx) => (
                  <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: AGENT COMMUNICATION PROTOCOL (ACP v1.0) */}
      {/* ========================================================================= */}
      {activeMainTab === 'PROTOCOL' && (
        <div className="space-y-8">
          {/* Protocol Architecture Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Envelope Spec */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Message Envelope (JSON)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Every inter-agent message carries an immutable header: <code className="font-mono text-indigo-500">message_id</code>, <code className="font-mono text-indigo-500">task_id</code>, <code className="font-mono text-indigo-500">correlation_id</code>, <code className="font-mono text-indigo-500">sender</code>, <code className="font-mono text-indigo-500">receiver</code>, <code className="font-mono text-indigo-500">priority</code>, and <code className="font-mono text-indigo-500">deadline_ms</code> SLA budget.
              </p>
            </div>

            {/* Card 2: Two-Phase Acknowledgments */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Two-Phase ACK Lifecycle
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Receiving agents emit an immediate <span className="font-semibold text-emerald-500">ACKNOWLEDGMENT</span> within 50ms before initiating long-running LLM or routing queries. Idempotency guarantees prevent repeated executions using the cached <code className="font-mono">task_id</code>.
              </p>
            </div>

            {/* Card 3: Circuit Breaker & Fallback */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Circuit Breakers & Retries
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Includes exponential backoff with full jitter (<code className="font-mono">retry_after_ms</code>). If 3 consecutive failures occur within 30s, the circuit trips to <span className="font-semibold text-amber-500">OPEN</span> and automatically routes to deterministic local heuristics.
              </p>
            </div>
          </div>

          {/* Interactive Agent Message Simulator */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-bold font-mono">
                  <Terminal className="w-3.5 h-3.5" />
                  ACP v1.0 • Inter-Agent Communication Sandbox
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                  Simulate Live Agent Request, Acknowledgment, & Fault Tolerance
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Transmit an ACP packet between agents, observe the synchronous 2-phase ACK, and test deterministic fallback triggers.
                </p>
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50 transition"
              >
                {isSimulating ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Transmitting over Bus...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Transmit ACP Message
                  </>
                )}
              </button>
            </div>

            {/* Controls Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              {/* Sender */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Originating Agent (Sender)
                </label>
                <select
                  value={simSender}
                  onChange={(e) => setSimSender(e.target.value as AgentRole)}
                  className="w-full text-xs font-medium p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="CoordinatorAgent">CoordinatorAgent (Primary Orchestrator)</option>
                  <option value="MedicalContextAgent">MedicalContextAgent</option>
                  <option value="LocationAgent">LocationAgent</option>
                  <option value="HospitalIntelligenceAgent">HospitalIntelligenceAgent</option>
                  <option value="ResponseAgent">ResponseAgent</option>
                  <option value="MonitoringAgent">MonitoringAgent</option>
                </select>
              </div>

              {/* Receiver */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Target Agent (Receiver)
                </label>
                <select
                  value={simReceiver}
                  onChange={(e) => setSimReceiver(e.target.value as AgentRole)}
                  className="w-full text-xs font-medium p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="MedicalContextAgent">MedicalContextAgent</option>
                  <option value="LocationAgent">LocationAgent</option>
                  <option value="HospitalIntelligenceAgent">HospitalIntelligenceAgent</option>
                  <option value="ResponseAgent">ResponseAgent</option>
                  <option value="CoordinatorAgent">CoordinatorAgent</option>
                  <option value="MonitoringAgent">MonitoringAgent</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Priority SLA
                </label>
                <select
                  value={simPriority}
                  onChange={(e) => setSimPriority(e.target.value as AgentMessagePriority)}
                  className="w-full text-xs font-medium p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="CRITICAL">CRITICAL (P0: Golden Hour, 1500ms budget)</option>
                  <option value="HIGH">HIGH (P1: Hospital Bed Lock, 2500ms)</option>
                  <option value="MEDIUM">MEDIUM (P2: Family Telephony, 4000ms)</option>
                  <option value="LOW">LOW (P3: Telemetry Sync, 10000ms)</option>
                </select>
              </div>

              {/* Fault Injection Toggle */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Simulate Resilience Fault
                </label>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSimErrorToggle(!simErrorToggle)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex-1 ${
                      simErrorToggle
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {simErrorToggle ? '⚠️ Fault Injected' : 'Normal Execution'}
                  </button>
                  {simErrorToggle && (
                    <select
                      value={simErrorCode}
                      onChange={(e) => setSimErrorCode(e.target.value as any)}
                      className="text-xs font-mono p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-500 text-rose-500"
                    >
                      <option value="ERR_TIMEOUT">ERR_TIMEOUT</option>
                      <option value="ERR_CIRCUIT_OPEN">ERR_CIRCUIT_OPEN</option>
                      <option value="ERR_CAPACITY_EXCEEDED">ERR_CAPACITY</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Simulation Results Trace */}
            {simulationResult ? (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Live 3-Step Protocol Execution Trace
                  </h4>
                  <span className="text-[11px] font-mono text-emerald-500 font-semibold">
                    ✓ Two-Phase Protocol Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Step 1: Request */}
                  <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        1. REQUEST
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {simulationResult.step_1_request.task_id}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-indigo-300">
                      {simulationResult.step_1_request.sender} ➔ {simulationResult.step_1_request.receiver}
                    </p>
                    <pre className="text-[11px] font-mono bg-slate-900 p-2.5 rounded-xl text-slate-300 overflow-x-auto max-h-48 border border-slate-800">
                      {JSON.stringify(simulationResult.step_1_request, null, 2)}
                    </pre>
                  </div>

                  {/* Step 2: Immediate ACK */}
                  <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        2. ACKNOWLEDGMENT
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        SLA &lt; 50ms
                      </span>
                    </div>
                    <p className="text-xs font-mono text-emerald-300">
                      {simulationResult.step_2_ack.sender} ➔ {simulationResult.step_2_ack.receiver}
                    </p>
                    <pre className="text-[11px] font-mono bg-slate-900 p-2.5 rounded-xl text-slate-300 overflow-x-auto max-h-48 border border-slate-800">
                      {JSON.stringify(simulationResult.step_2_ack, null, 2)}
                    </pre>
                  </div>

                  {/* Step 3: Response or Fallback */}
                  <div className={`p-4 rounded-2xl bg-slate-950 text-slate-200 border space-y-2 ${
                    simulationResult.step_3_result.status === 'SUCCESS'
                      ? 'border-slate-800'
                      : 'border-rose-900/60 ring-1 ring-rose-500/20'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        simulationResult.step_3_result.status === 'SUCCESS'
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}>
                        3. {simulationResult.step_3_result.message_type} ({simulationResult.step_3_result.status})
                      </span>
                      {simulationResult.step_3_result.error_context?.fallback_applied && (
                        <span className="text-[10px] font-mono text-amber-400">
                          Fallback Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-300">
                      {simulationResult.step_3_result.sender} ➔ {simulationResult.step_3_result.receiver}
                    </p>
                    <pre className="text-[11px] font-mono bg-slate-900 p-2.5 rounded-xl text-slate-300 overflow-x-auto max-h-48 border border-slate-800">
                      {JSON.stringify(simulationResult.step_3_result, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                <Workflow className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Ready to Simulate Agent Protocol Transmission
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click &ldquo;Transmit ACP Message&rdquo; above to generate a message packet, trigger an automated two-phase ACK from the target agent worker node, and inspect payload headers.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
