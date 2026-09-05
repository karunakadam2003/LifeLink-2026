import { BaseAgent, FunctionTool, InvocationContext, Event } from '@google/adk';
import { AgentActivityLog, EmergencyEvent, Emergency } from '../../src/types.js';

export interface MonitoringEvaluation {
  shouldReplan: boolean;
  reason: string;
  divertedHospitalId?: string;
  trafficMultiplier?: number;
  logs: AgentActivityLog[];
}

export class MonitoringAgent extends BaseAgent {
  public readonly evaluateTelemetryEventTool: FunctionTool;

  constructor() {
    super({
      name: 'MonitoringAgent',
      description: 'Google ADK Agent continuously monitoring real-time Pub/Sub telemetry events, hospital divert triggers, and transit congestion for dynamic replanning.',
    });

    this.evaluateTelemetryEventTool = new FunctionTool({
      name: 'evaluate_emergency_telemetry_event',
      description: 'Analyze hospital divert, traffic surge, or vitals degradation event against the active emergency status.',
      execute: async (params: {
        event: EmergencyEvent;
        currentEmergency: Emergency;
      }) => {
        return this.processTelemetryEvent(params.event, params.currentEmergency);
      },
    });
  }

  protected override async *runAsyncImpl(_context: InvocationContext): AsyncGenerator<Event, void, void> {
    return;
  }

  protected override async *runLiveImpl(_context: InvocationContext): AsyncGenerator<Event, void, void> {
    return;
  }

  public processTelemetryEvent(
    event: EmergencyEvent,
    currentEmergency: Emergency
  ) {
    let shouldReplan = false;
    let reason = '';
    let divertedHospitalId: string | undefined = undefined;
    let trafficMultiplier = 1.0;
    let evaluationType = 'NO_ACTION_REQUIRED';

    if (event.event_type === 'HOSPITAL_DIVERT_TRIGGERED') {
      const targetHospitalId = event.payload.hospital_id;
      if (targetHospitalId === currentEmergency.selected_hospital_id) {
        shouldReplan = true;
        divertedHospitalId = targetHospitalId;
        reason = `Selected facility ${currentEmergency.selected_hospital_name} issued CODE BLACK DIVERT due to ER capacity saturation/critical mass event. Immediate rerouting required.`;
        evaluationType = 'DIVERT_AFFECTS_ACTIVE_FACILITY';
      } else {
        evaluationType = 'DIVERT_NON_IMPACTING';
      }
    } else if (event.event_type === 'TRAFFIC_CONGESTION_SPIKE') {
      trafficMultiplier = event.payload.trafficMultiplier || 1.8;
      shouldReplan = true;
      reason = `Severe gridlock / road closure reported along active transit corridor. Route transit time increased by ${Math.round((trafficMultiplier - 1) * 100)}%. Re-evaluating alternative hospital trajectories.`;
      evaluationType = 'TRAFFIC_GRIDLOCK_DETECTED';
    } else if (event.event_type === 'VITALS_DETERIORATION') {
      shouldReplan = true;
      reason = `Patient vitals deteriorated sharply (SpO2 dropped below 88%, BP spike). Elevating priority to nearest Level 1 Trauma Center with immediate surgical ICU capability.`;
      evaluationType = 'CLINICAL_DETERIORATION';
    }

    return {
      shouldReplan,
      reason,
      divertedHospitalId,
      trafficMultiplier,
      evaluationType,
    };
  }

  public evaluateEvent(
    event: EmergencyEvent,
    currentEmergency: Emergency
  ): MonitoringEvaluation {
    const logs: AgentActivityLog[] = [];

    logs.push({
      id: `LOG-${Date.now()}-mon-1`,
      emergency_id: currentEmergency.emergency_id,
      agent_name: 'MonitoringAgent',
      timestamp: new Date().toISOString(),
      step_title: 'ADK Agent: Ingesting Pub/Sub Telemetry Event',
      action_type: 'THOUGHT',
      details: `[ADK:MonitoringAgent] Received event '${event.event_type}' from source '${event.source}'. Evaluating impact on active emergency workflow (Selected Hospital: ${currentEmergency.selected_hospital_name || 'None'}).`,
      input_data: { event_type: event.event_type, payload: event.payload },
      confidence_score: 0.99,
    });

    const evalResult = this.processTelemetryEvent(event, currentEmergency);

    if (evalResult.shouldReplan) {
      if (evalResult.evaluationType === 'DIVERT_AFFECTS_ACTIVE_FACILITY') {
        logs.push({
          id: `LOG-${Date.now()}-mon-2`,
          emergency_id: currentEmergency.emergency_id,
          agent_name: 'MonitoringAgent',
          timestamp: new Date().toISOString(),
          step_title: 'ADK Re-plan Trigger: Critical Facility Divert Detected',
          action_type: 'RE_PLAN_TRIGGER',
          details: evalResult.reason,
          output_data: {
            tool: this.evaluateTelemetryEventTool.name,
            compromised_hospital: evalResult.divertedHospitalId,
            action: 'TRIGGER_COORDINATOR_REPLAN',
          },
          confidence_score: 1.0,
        });
      } else if (evalResult.evaluationType === 'TRAFFIC_GRIDLOCK_DETECTED') {
        logs.push({
          id: `LOG-${Date.now()}-mon-2`,
          emergency_id: currentEmergency.emergency_id,
          agent_name: 'MonitoringAgent',
          timestamp: new Date().toISOString(),
          step_title: 'ADK Re-plan Trigger: Traffic Surge Event Detected',
          action_type: 'RE_PLAN_TRIGGER',
          details: evalResult.reason,
          output_data: {
            tool: this.evaluateTelemetryEventTool.name,
            trafficMultiplier: evalResult.trafficMultiplier,
            action: 'TRIGGER_COORDINATOR_REPLAN',
          },
          confidence_score: 0.98,
        });
      } else if (evalResult.evaluationType === 'CLINICAL_DETERIORATION') {
        logs.push({
          id: `LOG-${Date.now()}-mon-2`,
          emergency_id: currentEmergency.emergency_id,
          agent_name: 'MonitoringAgent',
          timestamp: new Date().toISOString(),
          step_title: 'ADK Re-plan Trigger: Patient Clinical Status Degradation Detected',
          action_type: 'RE_PLAN_TRIGGER',
          details: evalResult.reason,
          output_data: {
            tool: this.evaluateTelemetryEventTool.name,
            action: 'TRIGGER_COORDINATOR_REPLAN',
          },
          confidence_score: 0.99,
        });
      }
    } else {
      logs.push({
        id: `LOG-${Date.now()}-mon-2`,
        emergency_id: currentEmergency.emergency_id,
        agent_name: 'MonitoringAgent',
        timestamp: new Date().toISOString(),
        step_title: 'ADK Decision: Divert Event Non-Impacting',
        action_type: 'DECISION',
        details: `Diverted hospital ${event.payload.hospital_id} is not the active selected facility. No re-plan needed.`,
        confidence_score: 0.99,
      });
    }

    return {
      shouldReplan: evalResult.shouldReplan,
      reason: evalResult.reason,
      divertedHospitalId: evalResult.divertedHospitalId,
      trafficMultiplier: evalResult.trafficMultiplier,
      logs,
    };
  }
}

export const monitoringAgent = new MonitoringAgent();
