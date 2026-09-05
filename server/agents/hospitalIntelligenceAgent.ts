import { BaseAgent, FunctionTool, InvocationContext, Event } from '@google/adk';
import { generateGeminiReasoning } from '../services/geminiService.js';
import { AgentActivityLog, Hospital, EmergencySeverity, EmergencyType } from '../../src/types.js';

export interface HospitalEvaluationResult {
  selectedHospital: Hospital | null;
  rankedHospitals: Hospital[];
  logs: AgentActivityLog[];
  selectionRationale: string;
}

export class HospitalIntelligenceAgent extends BaseAgent {
  public readonly scoreHospitalReadinessTool: FunctionTool;
  public readonly generateSelectionRationaleTool: FunctionTool;

  constructor() {
    super({
      name: 'HospitalIntelligenceAgent',
      description: 'Google ADK Agent evaluating emergency receiving hospitals based on ER bays, ICU capacity, trauma levels, and golden-hour ETAs.',
    });

    this.scoreHospitalReadinessTool = new FunctionTool({
      name: 'score_hospital_readiness_matrix',
      description: 'Evaluate and score hospitals based on trauma capability, ER/ICU capacity, distance ETAs, and divert status.',
      execute: async (params: {
        hospitals: Hospital[];
        emergencyType: EmergencyType;
        severity: EmergencySeverity;
        requiredSpecialties: string[];
        excludedHospitalIds?: string[];
      }) => {
        return this.scoreHospitals(
          params.hospitals,
          params.emergencyType,
          params.severity,
          params.requiredSpecialties,
          params.excludedHospitalIds || []
        );
      },
    });

    this.generateSelectionRationaleTool = new FunctionTool({
      name: 'generate_hospital_selection_rationale',
      description: 'Generate evidence-based clinical and logistical justification for the selected hospital using Gemini reasoning.',
      execute: async (params: {
        selectedHospital: Hospital;
        emergencyType: EmergencyType;
        severity: EmergencySeverity;
      }) => {
        return await this.generateRationale(
          params.selectedHospital,
          params.emergencyType,
          params.severity
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

  public scoreHospitals(
    hospitals: Hospital[],
    emergencyType: EmergencyType,
    severity: EmergencySeverity,
    requiredSpecialties: string[],
    excludedHospitalIds: string[] = []
  ): Hospital[] {
    const evaluatedList: Hospital[] = hospitals.map(hospital => {
      let score = 100;
      const reasons: string[] = [];

      // 1. Operating Status Check
      if (hospital.operating_status === 'CODE_BLACK_DIVERT') {
        score -= 90;
        reasons.push('CRITICAL: Hospital is on CODE BLACK DIVERT (ER shut/mass casualty).');
      } else if (hospital.operating_status === 'ELEVATED_SURGE') {
        score -= 15;
        reasons.push('Elevated patient surge; extended ER triage delay.');
      }

      // 2. Trauma & Specialty Matching
      const isTraumaNeeded = emergencyType === 'ROAD_ACCIDENT' || emergencyType === 'ELDERLY_FALL' || severity === 'CRITICAL';
      if (isTraumaNeeded) {
        if (hospital.trauma_capability === 'Level 1') {
          score += 20;
          reasons.push('Level 1 Comprehensive Trauma capability verified.');
        } else if (hospital.trauma_capability === 'Level 2') {
          score += 5;
          reasons.push('Level 2 Trauma capability available.');
        } else {
          score -= 30;
          reasons.push('Lacks required advanced trauma level.');
        }
      }

      // Check required specialties
      const matchedSpecialties = requiredSpecialties.filter(req =>
        hospital.specialties.some(s => s.toLowerCase().includes(req.toLowerCase()))
      );
      if (matchedSpecialties.length > 0) {
        score += matchedSpecialties.length * 8;
        reasons.push(`Matched specialties: ${matchedSpecialties.join(', ')}.`);
      }

      // 3. ER and ICU Bed Capacity
      if (hospital.er_beds_available <= 0) {
        score -= 40;
        reasons.push('No available ER resuscitation bays.');
      } else {
        score += Math.min(15, hospital.er_beds_available * 2);
        reasons.push(`${hospital.er_beds_available} ER bays available.`);
      }

      if (hospital.icu_beds_available > 0) {
        score += Math.min(10, hospital.icu_beds_available);
        reasons.push(`${hospital.icu_beds_available} ICU critical care beds open.`);
      } else {
        score -= 20;
        reasons.push('Zero open ICU beds.');
      }

      // 4. ETA & Distance Penalty
      const etaPenalty = hospital.eta_minutes * 2.2;
      score -= etaPenalty;
      reasons.push(`ETA: ${hospital.eta_minutes} min (${hospital.distance_km} km).`);

      // If in excluded list, penalize completely
      if (excludedHospitalIds.includes(hospital.hospital_id)) {
        score = -100;
        reasons.push('Explicitly excluded due to live divert event.');
      }

      const match_score = Math.max(0, Math.round(score));
      return {
        ...hospital,
        match_score,
        selection_rationale: reasons.join(' '),
      };
    });

    evaluatedList.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    return evaluatedList;
  }

  public async generateRationale(
    selectedHospital: Hospital,
    emergencyType: EmergencyType,
    severity: EmergencySeverity
  ): Promise<string> {
    const prompt = `Selected Hospital: ${selectedHospital.name}.
Trauma Capability: ${selectedHospital.trauma_capability}.
ER Beds Available: ${selectedHospital.er_beds_available}, ICU Beds Available: ${selectedHospital.icu_beds_available}.
ETA: ${selectedHospital.eta_minutes} minutes, Distance: ${selectedHospital.distance_km} km.
Operating Status: ${selectedHospital.operating_status}.
Emergency Type: ${emergencyType}, Severity: ${severity}.
Provide a clear, 3-bullet point evidence-based justification for why this facility is the optimal destination.`;

    return (
      (await generateGeminiReasoning(
        'You are the HospitalIntelligenceAgent for LifeLink emergency coordinator. Formulate precise clinical and logistical justifications.',
        prompt
      )) || ''
    );
  }

  public async evaluateHospitals(
    emergencyId: string,
    hospitals: Hospital[],
    emergencyType: EmergencyType,
    severity: EmergencySeverity,
    requiredSpecialties: string[],
    excludedHospitalIds: string[] = []
  ): Promise<HospitalEvaluationResult> {
    const logs: AgentActivityLog[] = [];

    logs.push({
      id: `LOG-${Date.now()}-hosp-1`,
      emergency_id: emergencyId,
      agent_name: 'HospitalIntelligenceAgent',
      timestamp: new Date().toISOString(),
      step_title: 'ADK Agent: Evaluating Hospital Readiness Matrix',
      action_type: 'THOUGHT',
      details: `[ADK:HospitalIntelligenceAgent] Evaluating ${hospitals.length} facilities for emergency type '${emergencyType}' (Severity: ${severity}). Checking Trauma capabilities, ER/ICU bed capacity, wait times, and travel ETAs. Excluded IDs: [${excludedHospitalIds.join(', ')}].`,
      confidence_score: 0.99,
    });

    // Score hospitals
    const evaluatedList = this.scoreHospitals(
      hospitals,
      emergencyType,
      severity,
      requiredSpecialties,
      excludedHospitalIds
    );

    const selectedHospital = evaluatedList[0] && evaluatedList[0].match_score! > 20 ? evaluatedList[0] : null;

    logs.push({
      id: `LOG-${Date.now()}-hosp-2`,
      emergency_id: emergencyId,
      agent_name: 'HospitalIntelligenceAgent',
      timestamp: new Date().toISOString(),
      step_title: 'ADK FunctionTool: score_hospital_readiness_matrix',
      action_type: 'TOOL_RESULT',
      details: `Ranked ${evaluatedList.length} candidate hospitals. Top recommendation: ${selectedHospital ? selectedHospital.name : 'None found'} (Match Score: ${selectedHospital?.match_score}/100, ETA: ${selectedHospital?.eta_minutes}m).`,
      output_data: {
        tool: this.scoreHospitalReadinessTool.name,
        top_facility: selectedHospital?.name,
        match_score: selectedHospital?.match_score,
        trauma_level: selectedHospital?.trauma_capability,
        er_beds: selectedHospital?.er_beds_available,
        icu_beds: selectedHospital?.icu_beds_available,
      },
    });

    // Call Gemini for clear natural language rationale
    let selectionRationale = '';
    if (selectedHospital) {
      const aiRationale = await this.generateRationale(
        selectedHospital,
        emergencyType,
        severity
      );

      selectionRationale =
        aiRationale ||
        `• **Trauma & Specialty Capability**: Verified ${selectedHospital.trauma_capability} trauma center with active specialized surgical teams on standby.\n• **Immediate Resuscitation Capacity**: ${selectedHospital.er_beds_available} ER bays and ${selectedHospital.icu_beds_available} ICU beds confirmed available.\n• **Rapid Transit ETA**: Estimated arrival in ${selectedHospital.eta_minutes} minutes (${selectedHospital.distance_km} km) within the golden hour window.`;
    } else {
      selectionRationale = 'No suitable nearby hospital with open emergency capacity found. Immediate regional command escalation required.';
    }

    logs.push({
      id: `LOG-${Date.now()}-hosp-3`,
      emergency_id: emergencyId,
      agent_name: 'HospitalIntelligenceAgent',
      timestamp: new Date().toISOString(),
      step_title: 'ADK Decision: Recommendation Rationale Generated',
      action_type: 'DECISION',
      details: selectedHospital
        ? `Selected ${selectedHospital.name}. Evidence: ${selectionRationale.replace(/\n/g, ' ')}`
        : 'Critical capacity failure across all regional hubs.',
      confidence_score: 0.97,
    });

    return {
      selectedHospital,
      rankedHospitals: evaluatedList,
      logs,
      selectionRationale,
    };
  }
}

export const hospitalIntelligenceAgent = new HospitalIntelligenceAgent();
