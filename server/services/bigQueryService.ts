import { BigQuery } from '@google-cloud/bigquery';
import { PATIENTS_DATABASE, HOSPITALS_DATABASE, AMBULANCES_DATABASE } from '../data/mockBigQuery.js';
import { PatientProfile, Hospital, Ambulance, EmergencyEvent } from '../../src/types.js';

export interface BigQueryStatus {
  isGcpConnected: boolean;
  projectId: string;
  datasetId: string;
  tables: {
    emergencyEvents: string;
    hospitals: string;
    patients: string;
    ambulances: string;
  };
  liveRowCount?: {
    emergencyEvents?: number;
    hospitals?: number;
    patients?: number;
    ambulances?: number;
  };
  lastSyncTimestamp?: string;
  errorNote?: string;
}

export interface PublicDatasetHealthInsight {
  query: string;
  dataset: string;
  source: string;
  records: any[];
  executionTimeMs: number;
}

class BigQueryService {
  private bq: BigQuery | null = null;
  private isConnected = false;
  private projectId: string;
  private datasetId: string;
  private keyFilename: string;

  private analyticsEvents: EmergencyEvent[] = [];
  private hospitalsState: Hospital[] = JSON.parse(JSON.stringify(HOSPITALS_DATABASE));
  private ambulancesState: Ambulance[] = JSON.parse(JSON.stringify(AMBULANCES_DATABASE));
  private patientsState: PatientProfile[] = JSON.parse(JSON.stringify(PATIENTS_DATABASE));
  private lastErrorNote: string = '';
  private isInitialized = false;

  constructor() {
    this.projectId = process.env.GCP_PROJECT_ID || 'lifelink-agentic-2026';
    this.datasetId = process.env.GCP_BIGQUERY_DATASET || 'lifelink_emergency_dw';
    this.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS || './gcp-credentials.json';

    this.initializeBigQuery().catch(err => {
      console.warn('[BigQuery Service] Initialization note:', err?.message || err);
    });
  }

  private async initializeBigQuery(): Promise<void> {
    try {
      this.bq = new BigQuery({
        projectId: this.projectId,
        keyFilename: this.keyFilename,
      });

      console.log(`[BigQuery Service] Verifying BigQuery dataset '${this.datasetId}' in project '${this.projectId}'...`);
      const dataset = this.bq.dataset(this.datasetId);
      const [datasetExists] = await dataset.exists();

      if (!datasetExists) {
        console.log(`[BigQuery Service] Creating BigQuery dataset '${this.datasetId}' in US location...`);
        await this.bq.createDataset(this.datasetId, { location: 'US' });
      }

      // Ensure tables exist with appropriate schemas
      await this.ensureTablesExist(dataset);

      this.isConnected = true;
      this.isInitialized = true;
      console.log(`[BigQuery Service] Successfully connected to live GCP BigQuery (Dataset: ${this.datasetId})`);

      // Seed synthetic data if newly initialized
      await this.seedSyntheticDataToBigQuery();
    } catch (err: any) {
      this.isConnected = false;
      this.lastErrorNote = err?.message || String(err);
      console.info(`[BigQuery Service] Live GCP BigQuery notice: ${this.lastErrorNote}. Operating with high-performance local warehouse state.`);
    }
  }

  private async ensureTablesExist(dataset: any): Promise<void> {
    // 1. Emergency Events Table
    const eventsTable = dataset.table('emergency_telemetry_events');
    const [eventsExist] = await eventsTable.exists();
    if (!eventsExist) {
      await dataset.createTable('emergency_telemetry_events', {
        schema: [
          { name: 'event_id', type: 'STRING', mode: 'REQUIRED' },
          { name: 'emergency_id', type: 'STRING', mode: 'REQUIRED' },
          { name: 'event_type', type: 'STRING', mode: 'REQUIRED' },
          { name: 'timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
          { name: 'source', type: 'STRING', mode: 'NULLABLE' },
          { name: 'summary', type: 'STRING', mode: 'NULLABLE' },
          { name: 'payload_json', type: 'STRING', mode: 'NULLABLE' },
        ],
      });
      console.log('[BigQuery Service] Created table: emergency_telemetry_events');
    }

    // 2. Hospitals Table
    const hospitalsTable = dataset.table('hospitals_telemetry');
    const [hospitalsExist] = await hospitalsTable.exists();
    if (!hospitalsExist) {
      await dataset.createTable('hospitals_telemetry', {
        schema: [
          { name: 'hospital_id', type: 'STRING', mode: 'REQUIRED' },
          { name: 'name', type: 'STRING', mode: 'REQUIRED' },
          { name: 'latitude', type: 'FLOAT64', mode: 'REQUIRED' },
          { name: 'longitude', type: 'FLOAT64', mode: 'REQUIRED' },
          { name: 'trauma_capability', type: 'STRING', mode: 'NULLABLE' },
          { name: 'er_beds_available', type: 'INT64', mode: 'NULLABLE' },
          { name: 'operating_status', type: 'STRING', mode: 'NULLABLE' },
          { name: 'contact_phone', type: 'STRING', mode: 'NULLABLE' },
          { name: 'data_json', type: 'STRING', mode: 'NULLABLE' },
        ],
      });
      console.log('[BigQuery Service] Created table: hospitals_telemetry');
    }

    // 3. Ambulances Table
    const ambulancesTable = dataset.table('ambulance_fleet');
    const [ambulancesExist] = await ambulancesTable.exists();
    if (!ambulancesExist) {
      await dataset.createTable('ambulance_fleet', {
        schema: [
          { name: 'ambulance_id', type: 'STRING', mode: 'REQUIRED' },
          { name: 'unit_code', type: 'STRING', mode: 'REQUIRED' },
          { name: 'latitude', type: 'FLOAT64', mode: 'REQUIRED' },
          { name: 'longitude', type: 'FLOAT64', mode: 'REQUIRED' },
          { name: 'status', type: 'STRING', mode: 'NULLABLE' },
          { name: 'vehicle_type', type: 'STRING', mode: 'NULLABLE' },
          { name: 'current_emergency_id', type: 'STRING', mode: 'NULLABLE' },
          { name: 'data_json', type: 'STRING', mode: 'NULLABLE' },
        ],
      });
      console.log('[BigQuery Service] Created table: ambulance_fleet');
    }

    // 4. Patients Table
    const patientsTable = dataset.table('patient_consented_records');
    const [patientsExist] = await patientsTable.exists();
    if (!patientsExist) {
      await dataset.createTable('patient_consented_records', {
        schema: [
          { name: 'patient_id', type: 'STRING', mode: 'REQUIRED' },
          { name: 'name', type: 'STRING', mode: 'REQUIRED' },
          { name: 'age', type: 'INT64', mode: 'NULLABLE' },
          { name: 'gender', type: 'STRING', mode: 'NULLABLE' },
          { name: 'blood_group', type: 'STRING', mode: 'NULLABLE' },
          { name: 'insurance_provider', type: 'STRING', mode: 'NULLABLE' },
          { name: 'readiness_score', type: 'INT64', mode: 'NULLABLE' },
          { name: 'profile_json', type: 'STRING', mode: 'NULLABLE' },
        ],
      });
      console.log('[BigQuery Service] Created table: patient_consented_records');
    }
  }

  public async seedSyntheticDataToBigQuery(): Promise<void> {
    if (!this.isConnected || !this.bq) return;

    try {
      const dataset = this.bq.dataset(this.datasetId);

      // Seed hospitals if empty
      const [hospRows] = await this.bq.query({
        query: `SELECT COUNT(1) as cnt FROM \`${this.projectId}.${this.datasetId}.hospitals_telemetry\``,
      });
      if (hospRows && hospRows[0] && hospRows[0].cnt === 0) {
        const hospInserts = this.hospitalsState.map(h => ({
          hospital_id: h.hospital_id,
          name: h.name,
          latitude: h.latitude,
          longitude: h.longitude,
          trauma_capability: h.trauma_capability,
          er_beds_available: h.er_beds_available,
          operating_status: h.operating_status,
          contact_phone: h.contact_phone,
          data_json: JSON.stringify(h),
        }));
        await dataset.table('hospitals_telemetry').insert(hospInserts);
        console.log(`[BigQuery Service] Seeded ${hospInserts.length} synthetic hospitals into BigQuery.`);
      }

      // Seed patients if empty
      const [patRows] = await this.bq.query({
        query: `SELECT COUNT(1) as cnt FROM \`${this.projectId}.${this.datasetId}.patient_consented_records\``,
      });
      if (patRows && patRows[0] && patRows[0].cnt === 0) {
        const patInserts = this.patientsState.map(p => ({
          patient_id: p.patient_id,
          name: p.name,
          age: p.age,
          gender: p.gender,
          blood_group: p.blood_group,
          insurance_provider: p.insurance_provider,
          readiness_score: p.readiness_score,
          profile_json: JSON.stringify(p),
        }));
        await dataset.table('patient_consented_records').insert(patInserts);
        console.log(`[BigQuery Service] Seeded ${patInserts.length} synthetic patient profiles into BigQuery.`);
      }

      // Seed ambulances if empty
      const [ambRows] = await this.bq.query({
        query: `SELECT COUNT(1) as cnt FROM \`${this.projectId}.${this.datasetId}.ambulance_fleet\``,
      });
      if (ambRows && ambRows[0] && ambRows[0].cnt === 0) {
        const ambInserts = this.ambulancesState.map(a => ({
          ambulance_id: a.ambulance_id,
          unit_code: a.unit_code,
          latitude: a.latitude,
          longitude: a.longitude,
          status: a.status,
          vehicle_type: a.vehicle_type,
          current_emergency_id: a.current_emergency_id || null,
          data_json: JSON.stringify(a),
        }));
        await dataset.table('ambulance_fleet').insert(ambInserts);
        console.log(`[BigQuery Service] Seeded ${ambInserts.length} synthetic ambulances into BigQuery.`);
      }
    } catch (err: any) {
      console.warn('[BigQuery Service] Note on seeding synthetic records:', err?.message || err);
    }
  }

  public async getPatientProfile(patientId: string): Promise<PatientProfile | null> {
    if (this.isConnected && this.bq) {
      try {
        const query = `
          SELECT profile_json 
          FROM \`${this.projectId}.${this.datasetId}.patient_consented_records\` 
          WHERE patient_id = @patientId
          LIMIT 1
        `;
        const [rows] = await this.bq.query({
          query,
          params: { patientId },
        });

        if (rows && rows.length > 0 && rows[0].profile_json) {
          return typeof rows[0].profile_json === 'string'
            ? JSON.parse(rows[0].profile_json)
            : rows[0].profile_json;
        }
      } catch (err: any) {
        console.warn(`[BigQuery Service] Query error for patient ${patientId}, falling back to cache:`, err?.message || err);
      }
    }

    const patient = this.patientsState.find(p => p.patient_id === patientId);
    return patient ? JSON.parse(JSON.stringify(patient)) : null;
  }

  public async getAllHospitals(): Promise<Hospital[]> {
    if (this.isConnected && this.bq) {
      try {
        const query = `
          SELECT hospital_id, name, latitude, longitude, trauma_level, er_beds_available, operating_status, contact_number, data_json 
          FROM \`${this.projectId}.${this.datasetId}.hospitals_telemetry\`
        `;
        const [rows] = await this.bq.query({ query });
        if (rows && rows.length > 0) {
          return rows.map((r: any) => {
            if (r.data_json) {
              const parsed = typeof r.data_json === 'string' ? JSON.parse(r.data_json) : r.data_json;
              return {
                ...parsed,
                er_beds_available: Number(r.er_beds_available ?? parsed.er_beds_available),
                operating_status: r.operating_status || parsed.operating_status,
              };
            }
            return r as Hospital;
          });
        }
      } catch (err: any) {
        console.warn('[BigQuery Service] Query error for hospitals, falling back to cache:', err?.message || err);
      }
    }

    return JSON.parse(JSON.stringify(this.hospitalsState));
  }

  public async getHospitalById(hospitalId: string): Promise<Hospital | null> {
    const hospitals = await this.getAllHospitals();
    const hospital = hospitals.find(h => h.hospital_id === hospitalId);
    return hospital ? JSON.parse(JSON.stringify(hospital)) : null;
  }

  public async updateHospitalStatus(
    hospitalId: string,
    status: Hospital['operating_status'],
    erBeds?: number
  ): Promise<Hospital | null> {
    const hospital = this.hospitalsState.find(h => h.hospital_id === hospitalId);
    if (hospital) {
      hospital.operating_status = status;
      if (typeof erBeds === 'number') {
        hospital.er_beds_available = erBeds;
      }

      // Asynchronously update BigQuery table if live
      if (this.isConnected && this.bq) {
        this.bq.query({
          query: `
            UPDATE \`${this.projectId}.${this.datasetId}.hospitals_telemetry\`
            SET operating_status = @status, er_beds_available = @erBeds
            WHERE hospital_id = @hospitalId
          `,
          params: {
            status,
            erBeds: typeof erBeds === 'number' ? erBeds : hospital.er_beds_available,
            hospitalId,
          },
        }).catch(err => {
          console.warn(`[BigQuery Service] Asynchronous hospital update error in BQ:`, err?.message || err);
        });
      }

      return JSON.parse(JSON.stringify(hospital));
    }
    return null;
  }

  public async getAllAmbulances(): Promise<Ambulance[]> {
    if (this.isConnected && this.bq) {
      try {
        const query = `
          SELECT ambulance_id, vehicle_number, latitude, longitude, status, equipment_level, current_emergency_id, data_json
          FROM \`${this.projectId}.${this.datasetId}.ambulance_fleet\`
        `;
        const [rows] = await this.bq.query({ query });
        if (rows && rows.length > 0) {
          return rows.map((r: any) => {
            if (r.data_json) {
              const parsed = typeof r.data_json === 'string' ? JSON.parse(r.data_json) : r.data_json;
              return {
                ...parsed,
                status: r.status || parsed.status,
                current_emergency_id: r.current_emergency_id || parsed.current_emergency_id,
              };
            }
            return r as Ambulance;
          });
        }
      } catch (err: any) {
        console.warn('[BigQuery Service] Query error for ambulances, falling back to cache:', err?.message || err);
      }
    }

    return JSON.parse(JSON.stringify(this.ambulancesState));
  }

  public async updateAmbulanceStatus(
    ambulanceId: string,
    status: Ambulance['status'],
    currentEmergencyId?: string
  ): Promise<Ambulance | null> {
    const amb = this.ambulancesState.find(a => a.ambulance_id === ambulanceId);
    if (amb) {
      amb.status = status;
      if (currentEmergencyId !== undefined) {
        amb.current_emergency_id = currentEmergencyId;
      }

      // Asynchronously update BigQuery table
      if (this.isConnected && this.bq) {
        this.bq.query({
          query: `
            UPDATE \`${this.projectId}.${this.datasetId}.ambulance_fleet\`
            SET status = @status, current_emergency_id = @currentEmergencyId
            WHERE ambulance_id = @ambulanceId
          `,
          params: {
            status,
            currentEmergencyId: currentEmergencyId ?? null,
            ambulanceId,
          },
        }).catch(err => {
          console.warn(`[BigQuery Service] Asynchronous ambulance update error in BQ:`, err?.message || err);
        });
      }

      return JSON.parse(JSON.stringify(amb));
    }
    return null;
  }

  public async logEvent(event: EmergencyEvent): Promise<void> {
    this.analyticsEvents.unshift(event);

    // Stream directly into BigQuery if connected
    if (this.isConnected && this.bq) {
      try {
        const dataset = this.bq.dataset(this.datasetId);
        const table = dataset.table('emergency_telemetry_events');
        await table.insert([
          {
            event_id: event.event_id,
            emergency_id: event.emergency_id,
            event_type: event.event_type,
            timestamp: event.timestamp || new Date().toISOString(),
            source: event.source || 'LIFELINK_AGENT',
            summary: event.summary || '',
            payload_json: JSON.stringify(event.payload || {}),
          },
        ]);
      } catch (err: any) {
        console.warn(`[BigQuery Service] Streaming insert into BigQuery error:`, err?.message || err);
      }
    }
  }

  public async getRecentEvents(emergencyId?: string, limit = 50): Promise<EmergencyEvent[]> {
    if (this.isConnected && this.bq) {
      try {
        let query = `
          SELECT event_id, emergency_id, event_type, timestamp, source, summary, payload_json
          FROM \`${this.projectId}.${this.datasetId}.emergency_telemetry_events\`
        `;
        const params: any = { limit };

        if (emergencyId) {
          query += ` WHERE emergency_id = @emergencyId`;
          params.emergencyId = emergencyId;
        }

        query += ` ORDER BY timestamp DESC LIMIT @limit`;

        const [rows] = await this.bq.query({ query, params });
        if (rows && rows.length > 0) {
          return rows.map((r: any) => ({
            event_id: r.event_id,
            emergency_id: r.emergency_id,
            event_type: r.event_type,
            timestamp: r.timestamp?.value || r.timestamp,
            source: r.source,
            summary: r.summary,
            payload: r.payload_json ? (typeof r.payload_json === 'string' ? JSON.parse(r.payload_json) : r.payload_json) : {},
          }));
        }
      } catch (err: any) {
        console.warn('[BigQuery Service] Query error for recent events, using local cache:', err?.message || err);
      }
    }

    if (emergencyId) {
      return this.analyticsEvents.filter(e => e.emergency_id === emergencyId).slice(0, limit);
    }
    return this.analyticsEvents.slice(0, limit);
  }

  /**
   * Execute custom BigQuery SQL query directly
   */
  public async executeQuery(sqlQuery: string, params?: Record<string, any>): Promise<any[]> {
    if (!this.isConnected || !this.bq) {
      throw new Error('BigQuery live connection is currently not active.');
    }

    const [rows] = await this.bq.query({
      query: sqlQuery,
      params,
    });
    return rows;
  }

  /**
   * Query BigQuery Public Datasets for public health / population baseline telemetry
   */
  public async getPublicHealthContext(region = 'India'): Promise<PublicDatasetHealthInsight> {
    const startTime = Date.now();
    const query = `
      SELECT 
        country_name, 
        date, 
        cumulative_confirmed, 
        new_confirmed,
        cumulative_deceased
      FROM \`bigquery-public-data.covid19_open_data.covid19_open_data\`
      WHERE country_name = @region AND cumulative_confirmed IS NOT NULL
      ORDER BY date DESC
      LIMIT 5
    `;

    if (this.isConnected && this.bq) {
      try {
        const [rows] = await this.bq.query({
          query,
          params: { region },
        });

        return {
          query,
          dataset: 'bigquery-public-data.covid19_open_data.covid19_open_data',
          source: 'Google Cloud BigQuery Public Datasets',
          records: rows.map(r => ({
            country: r.country_name,
            date: r.date?.value || r.date,
            cumulative_confirmed: Number(r.cumulative_confirmed || 0),
            new_confirmed: Number(r.new_confirmed || 0),
            cumulative_deceased: Number(r.cumulative_deceased || 0),
          })),
          executionTimeMs: Date.now() - startTime,
        };
      } catch (err: any) {
        console.warn('[BigQuery Service] Public dataset query error, using synthetic telemetry fallback:', err?.message || err);
      }
    }

    // Resilient fallback with synthetic public dataset structure
    return {
      query,
      dataset: 'bigquery-public-data.covid19_open_data.covid19_open_data',
      source: 'Google Cloud BigQuery Public Datasets (Synthetic Fallback)',
      records: [
        { country: region, date: '2026-09-01', cumulative_confirmed: 44998390, new_confirmed: 142, cumulative_deceased: 531930 },
        { country: region, date: '2026-08-31', cumulative_confirmed: 44998248, new_confirmed: 128, cumulative_deceased: 531928 },
        { country: region, date: '2026-08-30', cumulative_confirmed: 44998120, new_confirmed: 156, cumulative_deceased: 531925 },
      ],
      executionTimeMs: Date.now() - startTime,
    };
  }

  public getStatus(): BigQueryStatus {
    return {
      isGcpConnected: this.isConnected,
      projectId: this.projectId,
      datasetId: this.datasetId,
      tables: {
        emergencyEvents: `${this.projectId}.${this.datasetId}.emergency_telemetry_events`,
        hospitals: `${this.projectId}.${this.datasetId}.hospitals_telemetry`,
        patients: `${this.projectId}.${this.datasetId}.patient_consented_records`,
        ambulances: `${this.projectId}.${this.datasetId}.ambulance_fleet`,
      },
      lastSyncTimestamp: new Date().toISOString(),
      errorNote: this.lastErrorNote || undefined,
    };
  }

  public resetHospitalsToDefault() {
    this.hospitalsState = JSON.parse(JSON.stringify(HOSPITALS_DATABASE));
  }
}

export const bigQueryService = new BigQueryService();
