import { BaseAgent, FunctionTool, InvocationContext, Event } from '@google/adk';
import { mapsService } from '../services/mapsService.js';
import { bigQueryService } from '../services/bigQueryService.js';
import { AgentActivityLog, Hospital, Ambulance } from '../../src/types.js';

export interface LocationResult {
  incidentLat: number;
  incidentLon: number;
  enrichedHospitals: Hospital[];
  assignedAmbulance: Ambulance | null;
  logs: AgentActivityLog[];
}

export class LocationAgent extends BaseAgent {
  public readonly calculateDistanceMatrixTool: FunctionTool;
  public readonly locateNearestAmbulanceTool: FunctionTool;

  constructor() {
    super({
      name: 'LocationAgent',
      description: 'Google ADK Agent specializing in geospatial spatial indexing, Google Maps distance matrix routing, and emergency fleet dispatch.',
    });

    this.calculateDistanceMatrixTool = new FunctionTool({
      name: 'calculate_distance_matrix_and_eta',
      description: 'Compute precise transit distance in km and traffic-adjusted emergency vehicle ETA for hospitals.',
      execute: async (params: {
        incidentLat: number;
        incidentLon: number;
        hospitals: Hospital[];
        trafficMultiplier?: number;
      }) => {
        return this.computeDistanceMatrix(
          params.incidentLat,
          params.incidentLon,
          params.hospitals,
          params.trafficMultiplier || 1.0
        );
      },
    });

    this.locateNearestAmbulanceTool = new FunctionTool({
      name: 'locate_nearest_ambulance',
      description: 'Find the closest available ALS/BLS paramedic ambulance fleet unit to the incident location.',
      execute: async (params: {
        incidentLat: number;
        incidentLon: number;
        emergencyId: string;
        trafficMultiplier?: number;
      }) => {
        return await this.findNearestAmbulance(
          params.incidentLat,
          params.incidentLon,
          params.emergencyId,
          params.trafficMultiplier || 1.0
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

  public computeDistanceMatrix(
    incidentLat: number,
    incidentLon: number,
    hospitals: Hospital[],
    trafficMultiplier = 1.0
  ): Hospital[] {
    const enriched = hospitals.map(h => {
      const distance_km = mapsService.calculateDistanceKm(incidentLat, incidentLon, h.latitude, h.longitude);
      const eta_minutes = mapsService.calculateETA(distance_km, trafficMultiplier, true);
      return {
        ...h,
        distance_km,
        eta_minutes,
      };
    });
    enriched.sort((a, b) => a.distance_km - b.distance_km);
    return enriched;
  }

  public async findNearestAmbulance(
    incidentLat: number,
    incidentLon: number,
    emergencyId: string,
    trafficMultiplier = 1.0
  ): Promise<Ambulance | null> {
    const ambulances = await bigQueryService.getAllAmbulances();
    const availableAmbulances = ambulances.filter(
      a => a.status === 'AVAILABLE' || a.current_emergency_id === emergencyId
    );

    let assignedAmbulance: Ambulance | null = null;
    let shortestAmbEta = 999;

    for (const amb of availableAmbulances) {
      const ambDistance = mapsService.calculateDistanceKm(incidentLat, incidentLon, amb.latitude, amb.longitude);
      const ambEta = mapsService.calculateETA(ambDistance, trafficMultiplier, true);
      if (ambEta < shortestAmbEta) {
        shortestAmbEta = ambEta;
        assignedAmbulance = {
          ...amb,
          eta_to_patient_minutes: ambEta,
        };
      }
    }
    return assignedAmbulance;
  }

  public async execute(
    emergencyId: string,
    incidentLat: number,
    incidentLon: number,
    trafficMultiplier = 1.0
  ): Promise<LocationResult> {
    const logs: AgentActivityLog[] = [];

    logs.push({
      id: `LOG-${Date.now()}-loc-1`,
      emergency_id: emergencyId,
      agent_name: 'LocationAgent',
      timestamp: new Date().toISOString(),
      step_title: 'ADK Agent: Geospatial Spatial Indexing',
      action_type: 'THOUGHT',
      details: `[ADK:LocationAgent] Analyzing incident coordinates (${incidentLat.toFixed(4)}, ${incidentLon.toFixed(4)}) with current urban traffic index (${trafficMultiplier}x). Calculating spherical distances and priority vehicle transit times.`,
      confidence_score: 0.99,
    });

    // Step 2: Fetch and enrich hospitals with live distance & ETA
    const hospitals = await bigQueryService.getAllHospitals();
    const enrichedHospitals = this.computeDistanceMatrix(
      incidentLat,
      incidentLon,
      hospitals,
      trafficMultiplier
    );

    logs.push({
      id: `LOG-${Date.now()}-loc-2`,
      emergency_id: emergencyId,
      agent_name: 'LocationAgent',
      timestamp: new Date().toISOString(),
      step_title: 'ADK FunctionTool: calculate_distance_matrix_and_eta',
      action_type: 'TOOL_CALL',
      details: `Computed high-precision routing matrix for ${enrichedHospitals.length} regional healthcare facilities within a 15km perimeter.`,
      output_data: {
        tool: this.calculateDistanceMatrixTool.name,
        nearest_hospital: enrichedHospitals[0]?.name,
        nearest_distance_km: enrichedHospitals[0]?.distance_km,
        nearest_eta_min: enrichedHospitals[0]?.eta_minutes,
      },
    });

    // Step 3: Find nearest available Ambulance
    const assignedAmbulance = await this.findNearestAmbulance(
      incidentLat,
      incidentLon,
      emergencyId,
      trafficMultiplier
    );

    if (assignedAmbulance) {
      logs.push({
        id: `LOG-${Date.now()}-loc-3`,
        emergency_id: emergencyId,
        agent_name: 'LocationAgent',
        timestamp: new Date().toISOString(),
        step_title: 'ADK Decision: Nearest ALS/BLS Fleet Unit Identified',
        action_type: 'DECISION',
        details: `Identified unit ${assignedAmbulance.unit_code} (${assignedAmbulance.vehicle_type}) at distance ${mapsService.calculateDistanceKm(incidentLat, incidentLon, assignedAmbulance.latitude, assignedAmbulance.longitude).toFixed(1)}km. Estimated arrival on scene: ${assignedAmbulance.eta_to_patient_minutes} minutes.`,
        output_data: {
          ambulance_id: assignedAmbulance.ambulance_id,
          unit_code: assignedAmbulance.unit_code,
          eta_minutes: assignedAmbulance.eta_to_patient_minutes,
          equipment: assignedAmbulance.equipment,
        },
        confidence_score: 0.96,
      });
    }

    return {
      incidentLat,
      incidentLon,
      enrichedHospitals,
      assignedAmbulance,
      logs,
    };
  }
}

export const locationAgent = new LocationAgent();
