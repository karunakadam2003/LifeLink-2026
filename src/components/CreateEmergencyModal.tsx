import React, { useState } from 'react';
import { X, AlertTriangle, MapPin, User, FileText, Activity } from 'lucide-react';
import { EmergencyType, EmergencySeverity } from '../types.js';

interface CreateEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: {
    patient_id: string;
    emergency_type: EmergencyType;
    description: string;
    latitude: number;
    longitude: number;
    address_hint: string;
    severity: EmergencySeverity;
  }) => void;
  isLoading: boolean;
}

export const CreateEmergencyModal: React.FC<CreateEmergencyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [patientId, setPatientId] = useState('PAT-IND-8021');
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('ROAD_ACCIDENT');
  const [severity, setSeverity] = useState<EmergencySeverity>('CRITICAL');
  const [addressHint, setAddressHint] = useState('Indiranagar 100ft Road, Bengaluru');
  const [description, setDescription] = useState('Vehicle collision near metro pillar 128. Patient unresponsive with shallow breathing.');
  const [lat, setLat] = useState(12.9716);
  const [lon, setLon] = useState(77.6412);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      patient_id: patientId,
      emergency_type: emergencyType,
      description,
      latitude: lat,
      longitude: lon,
      address_hint: addressHint,
      severity,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-red-600 text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                Report Incident & Trigger Agent Pipeline
              </h3>
              <p className="text-xs text-slate-400">
                Dispatch autonomous multi-agent coordination for new medical emergency
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs text-slate-300">
          {/* Patient Selection */}
          <div>
            <label className="block font-bold text-slate-200 mb-1">Select Consented Patient Profile</label>
            <select
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
            >
              <option value="PAT-IND-8021">Aarav Sharma (34y, O+, Allergies: Penicillin, Sulfa)</option>
              <option value="PAT-IND-4419">Savithri Rao (72y, B+, AFib, Med: Apixaban)</option>
              <option value="PAT-IND-6102">Vikram Malhotra (48y, AB-, Severe Peanut Allergy, EpiPen)</option>
              <option value="PAT-IND-9912">Deepa Krishnan (58y, A+, Prior TIA Stroke History)</option>
            </select>
          </div>

          {/* Emergency Type & Severity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-200 mb-1">Emergency Type</label>
              <select
                value={emergencyType}
                onChange={e => setEmergencyType(e.target.value as EmergencyType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
              >
                <option value="ROAD_ACCIDENT">Road Accident</option>
                <option value="ELDERLY_FALL">Elderly Fall</option>
                <option value="CARDIAC_ARREST">Cardiac Arrest</option>
                <option value="STROKE_SYMPTOMS">Stroke Symptoms</option>
                <option value="ANAPHYLAXIS">Severe Anaphylaxis</option>
                <option value="SEVERE_RESPIRATORY">Respiratory Distress</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1">Severity Level</label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as EmergencySeverity)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
              >
                <option value="CRITICAL">CRITICAL (Immediate ALS)</option>
                <option value="HIGH">HIGH (Priority Response)</option>
                <option value="MODERATE">MODERATE</option>
              </select>
            </div>
          </div>

          {/* Location Hint */}
          <div>
            <label className="block font-bold text-slate-200 mb-1">Address / Landmark</label>
            <input
              type="text"
              value={addressHint}
              onChange={e => setAddressHint(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
              placeholder="e.g. Indiranagar 100ft Road, Bangalore"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-200 mb-1">Incident Description / Initial Triage Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
              placeholder="Provide context on patient condition..."
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Coordinating...' : 'Trigger Autonomous Agents'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
