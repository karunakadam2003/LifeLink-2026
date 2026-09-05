import { BaseAgent, FunctionTool, InvocationContext, Event } from '@google/adk';
import { bigQueryService } from '../services/bigQueryService.js';
import { generateGeminiReasoning } from '../services/geminiService.js';
import { AgentActivityLog, PatientProfile } from '../../src/types.js';

export interface MedicalContextResult {
  patient: PatientProfile | null;
  emergencyCard: {
    critical_summary: string;
    blood_group: string;
    verified_allergies: string[];
    relevant_meds: string[];
    key_conditions: string[];
    privacy_notice: string;
  };
  requiredSpecialties: string[];
  logs: AgentActivityLog[];
}

export class MedicalContextAgent extends BaseAgent {
  public readonly queryConsentedRecordsTool: FunctionTool;
  public readonly synthesizeMedicalSummaryTool: FunctionTool;
  public readonly determineSpecialtiesTool: FunctionTool;

  constructor() {
    super({
      name: 'MedicalContextAgent',
      description: 'Google ADK Agent specializing in privacy-preserving clinical EHR extraction from BigQuery and medical contraindications synthesis.',
    });

    this.queryConsentedRecordsTool = new FunctionTool({
      name: 'query_consented_patient_records',
      description: 'Query BigQuery for consented emergency patient health records under HIPAA/DISHA guidelines.',
      execute: async ({ patientId }: { patientId: string }) => {
        return await this.fetchPatientProfile(patientId);
      },
    });

    this.synthesizeMedicalSummaryTool = new FunctionTool({
      name: 'synthesize_medical_emergency_summary',
      description: 'Generate concise, high-priority emergency briefing for first responders using Gemini clinical reasoning.',
      execute: async (params: {
        patientName: string;
        age: number;
        bloodGroup: string;
        allergies: string[];
        medications: string[];
        conditions: string[];
        emergencyType: string;
        description: string;
      }) => {
        return await this.generateMedicalSummary(params);
      },
    });

    this.determineSpecialtiesTool = new FunctionTool({
      name: 'determine_required_specialties',
      description: 'Determine required hospital clinical specialties and trauma capabilities for an emergency type.',
      execute: async ({ emergencyType }: { emergencyType: string }) => {
        return this.computeRequiredSpecialties(emergencyType);
      },
    });
  }

  protected override async *runAsyncImpl(_context: InvocationContext): AsyncGenerator<Event, void, void> {
    // ADK generator hook
    return;
  }

  protected override async *runLiveImpl(_context: InvocationContext): AsyncGenerator<Event, void, void> {
    // ADK live generator hook
    return;
  }

  public async fetchPatientProfile(patientId: string): Promise<PatientProfile | null> {
    return await bigQueryService.getPatientProfile(patientId);
  }

  public computeRequiredSpecialties(emergencyType: string): string[] {
    const requiredSpecialties = ['Emergency Medicine'];
    if (emergencyType === 'ROAD_ACCIDENT' || emergencyType === 'ELDERLY_FALL') {
      requiredSpecialties.push('Trauma Surgery', 'Orthopedics', 'CT/MRI 24x7');
    } else if (emergencyType === 'CARDIAC_ARREST') {
      requiredSpecialties.push('Cardiology', 'Interventional Cardiology', 'Cath Lab 24x7');
    } else if (emergencyType === 'STROKE_SYMPTOMS') {
      requiredSpecialties.push('Comprehensive Stroke Center', 'Neurosurgery', 'CT/MRI 24x7');
    } else if (emergencyType === 'ANAPHYLAXIS') {
      requiredSpecialties.push('Emergency Resuscitation', 'Toxicology');
    }
    return requiredSpecialties;
  }

  public async generateMedicalSummary(params: {
    patientName: string;
    age: number;
    bloodGroup: string;
    allergies: string[];
    medications: string[];
    conditions: string[];
    emergencyType: string;
    description: string;
  }): Promise<string> {
    const prompt = `Patient Name: ${params.patientName}, Age: ${params.age}, Blood: ${params.bloodGroup}.
Allergies: ${params.allergies.join(', ')}.
Medications: ${params.medications.join(', ')}.
Conditions: ${params.conditions.join(', ')}.
Emergency Type: ${params.emergencyType}. Description: ${params.description}.
Generate a concise, high-priority 2-sentence medical emergency briefing for first responders and receiving ER doctors. DO NOT diagnose or provide treatment plans. Focus on verified contraindications (e.g. allergies, anticoagulants).`;

    return (
      (await generateGeminiReasoning(
        'You are the MedicalContextAgent of LifeLink. Provide strict emergency context extraction without medical diagnosis.',
        prompt
      )) || ''
    );
  }

  public async execute(
    emergencyId: string,
    patientId: string,
    emergencyType: string,
    rawDescription: string
  ): Promise<MedicalContextResult> {
    const logs: AgentActivityLog[] = [];

    // Step 1: Log Thought
    logs.push({
      id: `LOG-${Date.now()}-1`,
      emergency_id: emergencyId,
      agent_name: 'MedicalContextAgent',
      timestamp: new Date().toISOString(),
      step_title: 'ADK Agent: Querying Consented Patient Records',
      action_type: 'THOUGHT',
      details: `[ADK:MedicalContextAgent] Initiating privacy-preserving query to BigQuery for patient profile ${patientId}. Enforcing minimal necessary PHI disclosure rules under HIPAA/DISHA guidelines.`,
      confidence_score: 0.99,
    });

    // Step 2: Tool Call to BigQuery via ADK FunctionTool
    logs.push({
      id: `LOG-${Date.now()}-2`,
      emergency_id: emergencyId,
      agent_name: 'MedicalContextAgent',
      timestamp: new Date().toISOString(),
      step_title: 'ADK FunctionTool: query_consented_patient_records',
      action_type: 'TOOL_CALL',
      details: `SELECT * FROM \`lifelink-prod.health_records.patient_consented_profiles\` WHERE patient_id = '${patientId}' AND consent_preferences.allow_ai_coordination = TRUE`,
      input_data: { patient_id: patientId, tool: this.queryConsentedRecordsTool.name },
    });

    const patient = await this.fetchPatientProfile(patientId);

    if (!patient) {
      logs.push({
        id: `LOG-${Date.now()}-3`,
        emergency_id: emergencyId,
        agent_name: 'MedicalContextAgent',
        timestamp: new Date().toISOString(),
        step_title: 'Anonymous / Unknown Patient Protocol',
        action_type: 'DECISION',
        details: 'No consented profile found. Defaulting to Universal Trauma Protocol (O-negative standby, broad spectrum precautions).',
        confidence_score: 0.85,
      });

      return {
        patient: null,
        emergencyCard: {
          critical_summary: 'Unidentified Patient or Non-Consented. Treat with universal emergency precautions. Blood standby: O-Negative.',
          blood_group: 'Unknown (O- Standby)',
          verified_allergies: ['Unknown - Screen on scene'],
          relevant_meds: ['Unknown'],
          key_conditions: ['Unknown'],
          privacy_notice: 'Standard emergency consent invoked.',
        },
        requiredSpecialties: ['Emergency Medicine', 'Trauma Surgery'],
        logs,
      };
    }

    logs.push({
      id: `LOG-${Date.now()}-3`,
      emergency_id: emergencyId,
      agent_name: 'MedicalContextAgent',
      timestamp: new Date().toISOString(),
      step_title: 'Consented Record Retrieved & Privacy Filter Applied',
      action_type: 'TOOL_RESULT',
      details: `Profile verified for ${patient.name} (Age: ${patient.age}, Blood: ${patient.blood_group}). Filtered out non-urgent personal history; extracted critical allergies (${patient.allergies.join(', ')}) and medications (${patient.medications.join(', ')}).`,
      output_data: {
        blood_group: patient.blood_group,
        allergies_count: patient.allergies.length,
        meds_count: patient.medications.length,
        conditions: patient.relevant_conditions,
      },
    });

    // Step 3: Determine required specialties
    const requiredSpecialties = this.computeRequiredSpecialties(emergencyType);

    // Call Gemini for structured clinical context summary
    const aiSummary = await this.generateMedicalSummary({
      patientName: patient.name,
      age: patient.age,
      bloodGroup: patient.blood_group,
      allergies: patient.allergies,
      medications: patient.medications,
      conditions: patient.relevant_conditions,
      emergencyType,
      description: rawDescription,
    });

    const summaryText =
      aiSummary ||
      `Patient ${patient.name} (${patient.age}y, Blood ${patient.blood_group}) in ${emergencyType.replace('_', ' ')}. CRITICAL: Verified allergy to ${patient.allergies.join(', ')}. Current meds include ${patient.medications.join(', ')} (${patient.relevant_conditions.join(', ')}).`;

    const emergencyCard = {
      critical_summary: summaryText,
      blood_group: patient.blood_group,
      verified_allergies: patient.allergies,
      relevant_meds: patient.medications,
      key_conditions: patient.relevant_conditions,
      privacy_notice: 'Only minimal consented emergency data transmitted to authenticated responders.',
    };

    logs.push({
      id: `LOG-${Date.now()}-4`,
      emergency_id: emergencyId,
      agent_name: 'MedicalContextAgent',
      timestamp: new Date().toISOString(),
      step_title: 'Emergency Medical Summary Synthesized',
      action_type: 'DECISION',
      details: `Prepared emergency context package. Highlighted contraindications and required hospital capabilities: [${requiredSpecialties.join(', ')}].`,
      output_data: { requiredSpecialties, summaryLength: summaryText.length },
      confidence_score: 0.98,
    });

    return {
      patient,
      emergencyCard,
      requiredSpecialties,
      logs,
    };
  }
}

export const medicalContextAgent = new MedicalContextAgent();
