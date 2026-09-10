import React, { useState, useEffect } from 'react';
import { Header, AppPersonaTab, UserRolePane } from './components/Header';
import { ConsumerPassportView } from './components/ConsumerPassportView';
import { FocusedEmergencyView } from './components/FocusedEmergencyView';
import { SimulationRunnerView } from './components/SimulationRunnerView';
import { EmergencyPreferencesView } from './components/EmergencyPreferencesView';
import { FamilyPortalView } from './components/FamilyPortalView';
import { HospitalIntakeView } from './components/HospitalIntakeView';
import { AgentWorkflowView } from './components/AgentWorkflowView';
import { AboutTechView } from './components/AboutTechView';
import { InvestorBusinessView } from './components/InvestorBusinessView';
import { ProductStoryView } from './components/ProductStoryView';
import { BigQueryAndProtocolView } from './components/BigQueryAndProtocolView';
import { AgentEvaluationModal } from './components/AgentEvaluationModal';
import { CreateEmergencyModal } from './components/CreateEmergencyModal';
import { Emergency, Hospital, Ambulance, AgentActivityLog, ActionProposal, EmergencyEvent, PatientProfile, EmergencyType } from './types';
import { Activity, ShieldAlert, Radio, ArrowRight, ShieldCheck, Heart, Sparkles, Building2, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Default patient profile fallback
const DEFAULT_PATIENT: PatientProfile = {
  patient_id: 'PAT-IND-8021',
  name: 'Aarav Sharma',
  age: 34,
  gender: 'MALE',
  blood_group: 'O+',
  allergies: ['Penicillin', 'Sulfa drugs'],
  medications: ['Metformin 500mg daily'],
  relevant_conditions: ['Type 2 Diabetes', 'Mild Asthma (inhaler prn)'],
  emergency_contacts: [
    {
      contact_id: 'CNT-01',
      name: 'Priya Sharma',
      relationship: 'Spouse',
      phone: '+91 7066377652',
      is_primary: true,
      notification_status: 'PENDING',
    },
    {
      contact_id: 'CNT-02',
      name: 'Rajesh Sharma',
      relationship: 'Brother',
      phone: '+91 98450 54321',
      is_primary: false,
      notification_status: 'PENDING',
    },
  ],
  consent_preferences: {
    share_medical_history: true,
    notify_family_immediately: true,
    share_location: true,
    dnr_status: false,
    allow_ai_coordination: true,
  },
  data_sharing_permissions: {
    medical_history: 'ALLOWED',
    critical_allergies: 'ALLOWED',
    current_medications: 'ALLOWED',
    insurance_information: 'ALLOWED',
    full_medical_records: 'ASK_FIRST',
    location_tracking: 'ALLOWED',
  },
  readiness_score: 96,
  insurance_id: 'STAR-HEALTH-993821-GL',
  insurance_provider: 'Star Health Premier Health Shield',
  preferred_language: 'English, Hindi, Kannada',
  primary_physician: 'Dr. Anand Raman, Manipal Health',
};

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRolePane>('CITIZEN');
  const [currentTab, setCurrentTab] = useState<AppPersonaTab>('CONSUMER_PASSPORT');
  const [currentEmergency, setCurrentEmergency] = useState<Emergency | null>(null);
  const [patient, setPatient] = useState<PatientProfile>(DEFAULT_PATIENT);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [logs, setLogs] = useState<AgentActivityLog[]>([]);
  const [proposals, setProposals] = useState<ActionProposal[]>([]);
  const [events, setEvents] = useState<EmergencyEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvalOpen, setIsEvalOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Fetch initial emergency or list
  const fetchEmergencyData = async (emergencyId?: string) => {
    try {
      // 1. Fetch emergencies
      const res = await fetch('/api/emergencies');
      if (res.ok) {
        const emergencies: Emergency[] = await res.json();
        const target = emergencyId
          ? emergencies.find((e) => e.emergency_id === emergencyId)
          : emergencies[emergencies.length - 1];

        if (target) {
          const detailRes = await fetch(`/api/emergencies/${target.emergency_id}`);
          if (detailRes.ok) {
            const data = await detailRes.json();
            setCurrentEmergency(data.emergency);
            setLogs(data.logs || []);
            setProposals(data.proposals || []);
            setEvents(data.events || []);
          }
        }
      }

      // 2. Fetch hospitals & ambulances
      const hospRes = await fetch('/api/hospitals');
      if (hospRes.ok) {
        setHospitals(await hospRes.json());
      }
      const ambRes = await fetch('/api/ambulances');
      if (ambRes.ok) {
        setAmbulances(await ambRes.json());
      }

      // 3. Fetch patients
      const patRes = await fetch('/api/patients');
      if (patRes.ok) {
        const patientsList: PatientProfile[] = await patRes.json();
        if (patientsList.length > 0) {
          setPatient(patientsList[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching LifeLink data:', err);
    }
  };

  useEffect(() => {
    fetchEmergencyData();
    const interval = setInterval(() => {
      if (currentEmergency?.emergency_id) {
        fetchEmergencyData(currentEmergency.emergency_id);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [currentEmergency?.emergency_id]);

  // Reset Demo to Hero Scenario (Road Accident in Bangalore)
  const handleResetDemo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/reset-demo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCurrentEmergency(data.emergency);
        setLogs(data.logs || []);
        setProposals(data.proposals || []);
        setEvents(data.events || []);
        await fetchEmergencyData(data.emergency.emergency_id);
        setActiveRole('CITIZEN');
        setCurrentTab('CONSUMER_EMERGENCY');
      }
    } catch (err) {
      console.error('Failed to reset demo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate Pub/Sub Events
  const handleSimulateEvent = async (eventType: string, payload: Record<string, any> = {}) => {
    if (!currentEmergency) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/emergencies/${currentEmergency.emergency_id}/simulate-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: eventType, payload }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentEmergency(data.emergency);
        setLogs(data.logs || []);
        setProposals(data.proposals || []);
        setEvents(data.events || []);
        if (eventType === 'HOSPITAL_DIVERT_TRIGGERED' || eventType === 'TRAFFIC_CONGESTION_SPIKE') {
          const hospRes = await fetch('/api/hospitals');
          if (hospRes.ok) {
            setHospitals(await hospRes.json());
          }
        }
      }
    } catch (err) {
      console.error(`Failed to simulate event ${eventType}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger from Consumer Passport
  const handleTriggerEmergency = async (type: EmergencyType, description: string) => {
    setIsLoading(true);
    try {
      const params = {
        patient_id: patient.patient_id,
        emergency_type: type,
        description: description,
        latitude: 12.9716,
        longitude: 77.6412,
        address_hint: 'Indiranagar 100ft Rd, Bengaluru',
        severity: type === 'ELDERLY_FALL' ? 'HIGH' : 'CRITICAL',
      };

      const res = await fetch('/api/emergencies/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentEmergency(data.emergency);
        setLogs(data.logs || []);
        setProposals(data.proposals || []);
        setEvents(data.events || []);
        setActiveRole('CITIZEN');
        setCurrentTab('CONSUMER_EMERGENCY');
      }
    } catch (err) {
      console.error('Failed to trigger emergency:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update patient profile
  const handleUpdatePatient = async (updated: PatientProfile) => {
    setPatient(updated);
    try {
      await fetch(`/api/patients/${updated.patient_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Failed to update patient:', err);
    }
  };

  // Approve HITL Action
  const handleApproveAction = async (actionId: string) => {
    if (!currentEmergency) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/emergencies/${currentEmergency.emergency_id}/approve-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_id: actionId }),
      });
      if (res.ok) {
        const data = await res.json();
        setProposals((prev) =>
          prev.map((p) => (p.action_id === actionId ? { ...p, status: 'APPROVED' } : p))
        );
        if (data.emergency) setCurrentEmergency(data.emergency);
      }
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reject HITL Action
  const handleRejectAction = async (actionId: string) => {
    if (!currentEmergency) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/emergencies/${currentEmergency.emergency_id}/reject-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_id: actionId }),
      });
      if (res.ok) {
        setProposals((prev) =>
          prev.map((p) => (p.action_id === actionId ? { ...p, status: 'REJECTED' } : p))
        );
      }
    } catch (err) {
      console.error('Rejection failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedHospital = hospitals.find(
    (h) => h.hospital_id === currentEmergency?.selected_hospital_id
  ) || hospitals[0];

  const assignedAmbulance = ambulances.find(
    (a) => a.ambulance_id === currentEmergency?.ambulance_id
  ) || ambulances[0];

  const isEmergencyActive = !!currentEmergency && currentEmergency.status !== 'RESOLVED';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* 1. Header with Role & Persona Tab Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeRole={activeRole}
        onSelectRole={setActiveRole}
        hasActiveEmergency={isEmergencyActive}
        onResetDemo={handleResetDemo}
        onOpenEvaluation={() => setIsEvalOpen(true)}
        isLoading={isLoading}
      />

      {/* 2. Global Live Incident Notice Banner (Visible when emergency is active and user is outside tracker) */}
      {isEmergencyActive && currentTab !== 'CONSUMER_EMERGENCY' && (
        <div className="bg-gradient-to-r from-rose-950 via-red-950 to-slate-950 border-b border-rose-800/80 px-4 sm:px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2 text-rose-200">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <strong className="text-white font-bold">Active Live Emergency Incident:</strong>
            <span className="font-semibold text-rose-300">
              {patient.name} ({currentEmergency?.emergency_type?.replace(/_/g, ' ')})
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-300 hidden sm:inline">
              Ambulance: {assignedAmbulance?.unit_code || 'En Route'} ➔ {selectedHospital?.name || 'Selected Facility'}
            </span>
          </div>

          <button
            onClick={() => {
              setActiveRole('CITIZEN');
              setCurrentTab('CONSUMER_EMERGENCY');
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition"
          >
            <span>Jump to Live Tracker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Main Content Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        {/* VIEW 1: Consumer Passport & Protection Home */}
        {currentTab === 'CONSUMER_PASSPORT' && (
          <ConsumerPassportView
            patient={patient}
            onUpdatePatient={handleUpdatePatient}
            onTriggerEmergency={handleTriggerEmergency}
            onViewLiveEmergency={() => {
              setActiveRole('CITIZEN');
              setCurrentTab('CONSUMER_EMERGENCY');
            }}
            onLaunchSimulation={() => {
              setActiveRole('CITIZEN');
              setCurrentTab('SIMULATION_RUNNER');
            }}
            onOpenPreferences={() => {
              setActiveRole('CITIZEN');
              setCurrentTab('EMERGENCY_PREFERENCES');
            }}
            hasActiveEmergency={isEmergencyActive}
          />
        )}

        {/* VIEW 2: Focused Live Emergency Experience ("WE'RE ON IT") */}
        {currentTab === 'CONSUMER_EMERGENCY' && (
          currentEmergency ? (
            <FocusedEmergencyView
              emergency={currentEmergency}
              patient={patient}
              hospitals={hospitals}
              ambulances={ambulances}
              events={events}
              onTriggerReplan={(reason) => handleSimulateEvent('TRAFFIC_CONGESTION_SPIKE', { reason })}
              onSimulateHospitalDivert={(hospitalId) =>
                handleSimulateEvent('HOSPITAL_DIVERT_TRIGGERED', { hospital_id: hospitalId })
              }
              onResolveEmergency={() => {
                if (currentEmergency) {
                  setCurrentEmergency({ ...currentEmergency, status: 'RESOLVED' });
                }
              }}
              onViewOperatorDashboard={() => {
                setActiveRole('TECH_INVESTOR');
                setCurrentTab('AGENT_WORKFLOW');
              }}
            />
          ) : (
            <div className="text-center py-20 space-y-4">
              <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
              <h2 className="text-xl font-bold text-white">No Active Emergency</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                No incident is currently being coordinated. You can trigger an incident simulation from your Home screen or click &ldquo;Launch Hero Demo&rdquo;.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setActiveRole('CITIZEN');
                    setCurrentTab('CONSUMER_PASSPORT');
                  }}
                  className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Go to Home Screen
                </button>
                <button
                  onClick={handleResetDemo}
                  className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30"
                >
                  Launch Hero Demo
                </button>
              </div>
            </div>
          )
        )}

        {/* VIEW 3: Interactive Simulation Runner (Demo for Judges) */}
        {currentTab === 'SIMULATION_RUNNER' && (
          <SimulationRunnerView
            patient={patient}
            hospitals={hospitals}
            ambulances={ambulances}
            onLaunchFullEmergency={handleTriggerEmergency}
            onViewArchitecture={() => {
              setActiveRole('TECH_INVESTOR');
              setCurrentTab('AGENT_WORKFLOW');
            }}
          />
        )}

        {/* VIEW 4: Family Portal */}
        {currentTab === 'FAMILY_PORTAL' && (
          <FamilyPortalView
            emergency={currentEmergency}
            patient={patient}
            hospitals={hospitals}
            ambulances={ambulances}
          />
        )}

        {/* VIEW 5: Emergency Preferences & Autonomy */}
        {currentTab === 'EMERGENCY_PREFERENCES' && (
          <EmergencyPreferencesView
            patient={patient}
            onUpdatePatient={handleUpdatePatient}
          />
        )}

        {/* VIEW 6: Hospital Intake ER Portal */}
        {currentTab === 'HOSPITAL_PORTAL' && (
          <HospitalIntakeView
            hospital={selectedHospital || hospitals[0]}
            emergency={currentEmergency}
            patient={patient}
            ambulance={assignedAmbulance || ambulances[0]}
            onSimulateDivert={(hospitalId) =>
              handleSimulateEvent('HOSPITAL_DIVERT_TRIGGERED', { hospital_id: hospitalId })
            }
          />
        )}

        {/* VIEW 7: Inside LifeLink (Agent Command Center & Governance) */}
        {currentTab === 'AGENT_WORKFLOW' && (
          <AgentWorkflowView
            logs={logs}
            events={events}
            proposals={proposals}
            onApproveProposal={handleApproveAction}
            onRejectProposal={handleRejectAction}
            onTriggerEvent={handleSimulateEvent}
          />
        )}

        {/* VIEW 8: About Google Cloud & ADK Tech */}
        {currentTab === 'ABOUT_TECH' && (
          <AboutTechView
            onLaunchSimulation={() => setCurrentTab('SIMULATION_RUNNER')}
            onViewArchitecture={() => {
              setActiveRole('TECH_INVESTOR');
              setCurrentTab('AGENT_WORKFLOW');
            }}
          />
        )}

        {/* VIEW 9: BigQuery Production Schemas, Live Query Console & ACP */}
        {currentTab === 'SCHEMAS_PROTOCOL' && (
          <BigQueryAndProtocolView />
        )}

        {/* VIEW 10: Business & Investor ARR Dashboard */}
        {currentTab === 'INVESTOR_HUB' && (
          <InvestorBusinessView />
        )}

        {/* VIEW 11: Product Story Narrative */}
        {currentTab === 'PRODUCT_STORY' && (
          <ProductStoryView
            onLaunchLiveDemo={handleResetDemo}
          />
        )}
      </main>

      {/* Evaluation Benchmark Modal */}
      <AgentEvaluationModal
        isOpen={isEvalOpen}
        onClose={() => setIsEvalOpen(false)}
      />

      {/* Create Custom Incident Modal */}
      <CreateEmergencyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (params) => {
          setIsLoading(true);
          setIsCreateOpen(false);
          try {
            const res = await fetch('/api/emergencies/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(params),
            });
            if (res.ok) {
              const data = await res.json();
              setCurrentEmergency(data.emergency);
              setLogs(data.logs || []);
              setProposals(data.proposals || []);
              setEvents(data.events || []);
              setActiveRole('CITIZEN');
              setCurrentTab('CONSUMER_EMERGENCY');
            }
          } catch (err) {
            console.error('Failed to create custom emergency:', err);
          } finally {
            setIsLoading(false);
          }
        }}
        isLoading={isLoading}
      />
    </div>
  );
}
