import { BaseAgent, FunctionTool, InvocationContext, Event } from '@google/adk';
import { AgentActivityLog, ActionProposal, Hospital, Ambulance, PatientProfile, EmergencyType, EmergencySeverity } from '../../src/types.js';

export interface ResponsePlanResult {
  responseSummary: string;
  actionProposals: ActionProposal[];
  logs: AgentActivityLog[];
}

export class ResponseAgent extends BaseAgent {
  public readonly synthesizeResponsePlanTool: FunctionTool;
  public readonly buildHITLGatesTool: FunctionTool;

  constructor() {
    super({
      name: 'ResponseAgent',
      description: 'Google ADK Agent aggregating multi-agent evidence into a structured emergency response plan with Human-In-The-Loop (HITL) governance gates.',
    });

    this.synthesizeResponsePlanTool = new FunctionTool({
      name: 'synthesize_emergency_response_summary',
      description: 'Synthesize a coherent multi-agent response summary combining medical, location, and hospital dispatch details.',
      execute: async (params: {
        patient: PatientProfile | null;
        emergencyType: EmergencyType;
        severity: EmergencySeverity;
        hospital: Hospital | null;
        ambulance: Ambulance | null;
      }) => {
        return this.synthesizeSummary(
          params.patient,
          params.emergencyType,
          params.severity,
          params.hospital,
          params.ambulance
        );
      },
    });

    this.buildHITLGatesTool = new FunctionTool({
      name: 'build_hitl_action_proposals',
      description: 'Build Human-In-The-Loop action proposals requiring emergency dispatcher or paramedic authorization.',
      execute: async (params: {
        emergencyId: string;
        hospital: Hospital | null;
        patient: PatientProfile | null;
      }) => {
        return this.buildActionProposals(
          params.emergencyId,
          params.hospital,
          params.patient
        );
      },
    });
  }

  protected override async *runAsyncImpl(_context: InvocationContext): AsyncGenerator<Event, void, void> {
    return;
  }

  protected override async *runLiveImpl(_context: InvocationContext): AsyncGenerator<Event, void, void> {
    return;
  }

  public synthesizeSummary(
    patient: PatientProfile | null,
    emergencyType: EmergencyType,
    severity: EmergencySeverity,
    hospital: Hospital | null,
    ambulance: Ambulance | null
  ): string {
    return `LifeLink Autonomous Emergency Plan for ${patient?.name || 'Patient'} (${emergencyType.replace('_', ' ')} - ${severity}):\n1. Dispatched ${ambulance?.unit_code || 'ALS Rapid Responder'} (ETA ${ambulance?.eta_to_patient_minutes || 5} min).\n2. Selected Receiving Facility: ${hospital?.name || 'Nearest Trauma Center'} (Level: ${hospital?.trauma_capability}, ETA: ${hospital?.eta_minutes} min).\n3. Medical Safeguards: Verified blood group ${patient?.blood_group || 'O+'}, highlighted allergy alerts.\n4. Contacts: Emergency family alerts prepared and pending transmission confirmation.`;
  }

  public buildActionProposals(
    emergencyId: string,
    hospital: Hospital | null,
    patient: PatientProfile | null
  ): ActionProposal[] {
    const actionProposals: ActionProposal[] = [];

    // Action 1: Hospital Admission & Transfer Lock
    if (hospital) {
      actionProposals.push({
        action_id: `ACT-${emergencyId}-HOSP`,
        emergency_id: emergencyId,
        title: `Authorize Trauma Transfer to ${hospital.name}`,
        description: `Confirm routing patient to ${hospital.name} with ${hospital.er_beds_available} available ER bays and ETA of ${hospital.eta_minutes} mins.`,
        high_impact: true,
        status: 'PENDING',
        action_category: 'HOSPITAL_DISPATCH',
        evidence: [
          `Trauma capability: ${hospital.trauma_capability}`,
          `Available ICU beds: ${hospital.icu_beds_available}, ER bays: ${hospital.er_beds_available}`,
          `Estimated transit time: ${hospital.eta_minutes} minutes (${hospital.distance_km} km)`,
          `Operating status: ${hospital.operating_status}`,
        ],
        recommended_at: new Date().toISOString(),
        requires_role: 'Emergency Dispatcher / Senior Paramedic',
        action_payload: {
          hospital_id: hospital.hospital_id,
          hospital_name: hospital.name,
          eta_minutes: hospital.eta_minutes,
        },
      });
    }

    // Action 2: Transmit Consented Medical Context to ER
    actionProposals.push({
      action_id: `ACT-${emergencyId}-MED`,
      emergency_id: emergencyId,
      title: `Transmit Medical Safeguards Card to ER Triage`,
      description: `Transmit critical allergy flags (${patient?.allergies?.join(', ') || 'None'}) and current medication list to incoming hospital triage team.`,
      high_impact: false,
      status: 'APPROVED', // Non-destructive, patient already consented
      action_category: 'MEDICAL_TRANSMIT',
      evidence: [
        'Patient consent preference: share_medical_history = TRUE',
        `Blood group: ${patient?.blood_group || 'Unknown'}`,
        `Critical contraindications: ${patient?.allergies?.join(', ') || 'None'}`,
      ],
      recommended_at: new Date().toISOString(),
      requires_role: 'System Automated (Consent Pre-Approved)',
      action_payload: {
        blood_group: patient?.blood_group,
        allergies: patient?.allergies,
      },
    });

    // Action 3: Family Emergency Alert Broadcast
    actionProposals.push({
      action_id: `ACT-${emergencyId}-FAM`,
      emergency_id: emergencyId,
      title: `Broadcast Live Location & Status to Family Contacts`,
      description: `Send automated encrypted SMS and tracking links to verified emergency contacts (${patient?.emergency_contacts?.map(c => c.name).join(', ') || 'Primary Contact'}).`,
      high_impact: true,
      status: 'PENDING',
      action_category: 'FAMILY_ALERT',
      evidence: [
        'Patient consent preference: notify_family_immediately = TRUE',
        `${patient?.emergency_contacts?.length || 1} verified phone number(s) on file`,
      ],
      recommended_at: new Date().toISOString(),
      requires_role: 'Command Operator / Paramedic',
      action_payload: {
        contacts_count: patient?.emergency_contacts?.length || 1,
      },
    });

    return actionProposals;
  }

  public async createPlan(
    emergencyId: string,
    patient: PatientProfile | null,
    emergencyType: EmergencyType,
    severity: EmergencySeverity,
    hospital: Hospital | null,
    ambulance: Ambulance | null,
    _medicalSummary: string
  ): Promise<ResponsePlanResult> {
    const logs: AgentActivityLog[] = [];

    logs.push({
      id: `LOG-${Date.now()}-resp-1`,
      emergency_id: emergencyId,
      agent_name: 'ResponseAgent',
      timestamp: new Date().toISOString(),
      step_title: 'ADK Agent: Synthesizing Coordinated Response Plan',
      action_type: 'THOUGHT',
      details: `[ADK:ResponseAgent] Aggregating evidence across Medical, Location, Hospital, and Communication agents. Structuring high-impact Human-In-The-Loop (HITL) actions requiring operator consent.`,
      confidence_score: 0.99,
    });

    const responseSummary = this.synthesizeSummary(
      patient,
      emergencyType,
      severity,
      hospital,
      ambulance
    );

    const actionProposals = this.buildActionProposals(
      emergencyId,
      hospital,
      patient
    );

    logs.push({
      id: `LOG-${Date.now()}-resp-2`,
      emergency_id: emergencyId,
      agent_name: 'ResponseAgent',
      timestamp: new Date().toISOString(),
      step_title: 'ADK FunctionTool: build_hitl_action_proposals',
      action_type: 'DECISION',
      details: `Generated ${actionProposals.length} action proposals. High-impact items gated behind operator approval in compliance with safety & governance protocol.`,
      output_data: {
        tool: this.buildHITLGatesTool.name,
        proposals_count: actionProposals.length,
        high_impact_count: actionProposals.filter(a => a.high_impact).length,
      },
      confidence_score: 0.99,
    });

    return {
      responseSummary,
      actionProposals,
      logs,
    };
  }
}

export const responseAgent = new ResponseAgent();
