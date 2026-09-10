import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Phone, 
  Building2, 
  FileText, 
  MapPin, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Heart, 
  Sparkles, 
  Plus, 
  Trash2,
  HelpCircle,
  Shield,
  Save,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PatientProfile, PrivacyShareLevel } from '../types';

interface EmergencyPreferencesViewProps {
  patient: PatientProfile;
  onUpdatePatient: (updated: PatientProfile) => void;
  onTestContact?: (contact: PatientProfile['emergency_contacts'][0]) => void;
}

export const EmergencyPreferencesView: React.FC<EmergencyPreferencesViewProps> = ({
  patient,
  onUpdatePatient,
  onTestContact,
}) => {
  const [profile, setProfile] = useState<PatientProfile>(patient);
  const [isSaved, setIsSaved] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRel, setNewContactRel] = useState('Family');
  const [showAddContact, setShowAddContact] = useState(false);

  // Sync if prop changes
  React.useEffect(() => {
    setProfile(patient);
  }, [patient]);

  const handleSave = () => {
    onUpdatePatient(profile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleConsentToggle = (key: keyof typeof profile.consent_preferences) => {
    const updated = {
      ...profile,
      consent_preferences: {
        ...profile.consent_preferences,
        [key]: !profile.consent_preferences[key],
      },
    };
    setProfile(updated);
    onUpdatePatient(updated);
  };

  const handlePermissionChange = (field: keyof typeof profile.data_sharing_permissions, value: PrivacyShareLevel) => {
    const updated = {
      ...profile,
      data_sharing_permissions: {
        ...profile.data_sharing_permissions,
        [field]: value,
      },
    };
    setProfile(updated);
    onUpdatePatient(updated);
  };

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    const newContact = {
      contact_id: `CNT-${Date.now().toString().slice(-4)}`,
      name: newContactName.trim(),
      relationship: newContactRel,
      phone: newContactPhone.trim(),
      is_primary: profile.emergency_contacts.length === 0,
      notification_status: 'PENDING' as const,
    };
    const updated = {
      ...profile,
      emergency_contacts: [...profile.emergency_contacts, newContact],
    };
    setProfile(updated);
    onUpdatePatient(updated);
    setNewContactName('');
    setNewContactPhone('');
    setShowAddContact(false);
  };

  const handleRemoveContact = (id: string) => {
    const updated = {
      ...profile,
      emergency_contacts: profile.emergency_contacts.filter((c) => c.contact_id !== id),
    };
    setProfile(updated);
    onUpdatePatient(updated);
  };

  return (
    <div id="emergency-preferences-container" className="max-w-5xl mx-auto space-y-8 pb-16 text-white">
      {/* 1. Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              User-Controlled Emergency Autonomy
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Emergency Preferences & Permissions
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              You decide what LifeLink is permitted to do on your behalf during an emergency. Your preferences determine who is notified, what medical facts are shared, and what actions run automatically.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isSaved && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 className="w-4 h-4" />
                Preferences Saved
              </span>
            )}
            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* 2. SECTION: Automation & Autonomy Controls (What can LifeLink do automatically?) */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-indigo-400" />
            Autonomous Action Permissions
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure which emergency steps LifeLink coordinates autonomously versus requiring manual confirmation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              key: 'notify_family_immediately' as const,
              title: 'Notify Emergency Contacts Automatically',
              desc: 'Immediately dispatch authenticated SMS tracking link and automated voice call to loved ones upon emergency confirmation.',
              active: profile.consent_preferences.notify_family_immediately,
            },
            {
              key: 'allow_ai_coordination' as const,
              title: 'Autonomous Ambulance Dispatch Coordination',
              desc: 'Permit AI agents to immediately request and coordinate the nearest Advanced Life Support (ALS) unit without waiting for manual confirmation.',
              active: profile.consent_preferences.allow_ai_coordination,
            },
            {
              key: 'share_location' as const,
              title: 'Automatic Geolocation Sharing',
              desc: 'Share live GPS location coordinates strictly with responding paramedics, ER trauma team, and verified family contacts.',
              active: profile.consent_preferences.share_location,
            },
            {
              key: 'share_medical_history' as const,
              title: 'Transmit Pre-Arrival Medical Flags',
              desc: 'Provide critical blood type, drug allergies, and active medications directly to assigned trauma surgeons to prevent medical contraindications.',
              active: profile.consent_preferences.share_medical_history,
            },
          ].map((item) => (
            <div
              key={item.key}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                item.active
                  ? 'bg-indigo-950/30 border-indigo-500/40 text-white'
                  : 'bg-slate-800/30 border-slate-700/60 text-slate-400'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    item.active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.active ? 'Autonomous' : 'Manual Approval'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleConsentToggle(item.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    item.active
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {item.active ? 'Enabled (Automatic)' : 'Disabled (Ask First)'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. SECTION: Trusted Contacts Management */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Phone className="w-5 h-5 text-emerald-400" />
              Trusted Emergency Contacts
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Who should LifeLink reach when an emergency is detected?
            </p>
          </div>

          <button
            onClick={() => setShowAddContact(!showAddContact)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            Add Emergency Contact
          </button>
        </div>

        {/* Add Contact Drawer */}
        <AnimatePresence>
          {showAddContact && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4 overflow-hidden"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                New Emergency Contact
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Full Name (e.g. Priya Sharma)"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="tel"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="Phone Number (e.g. +91 98450 12345)"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={newContactRel}
                  onChange={(e) => setNewContactRel(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                  <option value="Doctor">Primary Doctor</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddContact(false)}
                  className="px-4 py-2 rounded-xl bg-slate-700 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddContact}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md"
                >
                  Add Contact
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Existing Contacts List */}
        <div className="space-y-3">
          {profile.emergency_contacts.map((contact) => (
            <div
              key={contact.contact_id}
              className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold">
                  {contact.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{contact.name}</p>
                    {contact.is_primary && (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800">
                        Primary Contact
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {contact.relationship} • {contact.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {onTestContact && (
                  <button
                    onClick={() => onTestContact(contact)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-300 border border-slate-700 flex items-center gap-1.5 transition"
                  >
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    Test Voice Alert
                  </button>
                )}
                {profile.emergency_contacts.length > 1 && (
                  <button
                    onClick={() => handleRemoveContact(contact.contact_id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 border border-slate-700 transition"
                    title="Remove Contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SECTION: Healthcare & Hospital Preferences */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-blue-400" />
            Healthcare Network & Hospital Preferences
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Specify preferred healthcare provider networks and insurance coverage for automated admission matching.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Insurance Policy & TPA
            </label>
            <input
              type="text"
              value={profile.insurance_provider}
              onChange={(e) => setProfile({ ...profile, insurance_provider: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-500">Expedites cashless emergency ER intake registration.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Preferred Primary Physician
            </label>
            <input
              type="text"
              value={profile.primary_physician || ''}
              onChange={(e) => setProfile({ ...profile, primary_physician: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-500">ER physicians can contact your doctor during hospitalization.</p>
          </div>
        </div>
      </div>

      {/* 5. Trust & Safety Guarantee Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-white text-sm">LifeLink Trust & Responsible AI Commitment</p>
            <p className="text-slate-300 leading-relaxed max-w-xl">
              LifeLink helps coordinate emergency assistance using the permissions you provide. You remain in complete control of your emergency preferences and data disclosures at all times.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-indigo-300 bg-indigo-950/80 px-3 py-1.5 rounded-xl border border-indigo-700 shrink-0">
          SOC-2 & DPDP Compliant
        </span>
      </div>
    </div>
  );
};
