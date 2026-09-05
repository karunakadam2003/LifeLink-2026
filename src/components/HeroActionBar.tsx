import React from 'react';
import { AlertOctagon, RefreshCw, Car, Flame, HeartPulse, PlusCircle, Shuffle } from 'lucide-react';

interface HeroActionBarProps {
  onTriggerHero: () => void;
  onTriggerDivert: () => void;
  onTriggerTraffic: () => void;
  onTriggerVitalsDrop: () => void;
  onOpenCreateModal: () => void;
  onSelectArchetype: (archetype: 'ROAD_ACCIDENT' | 'ELDERLY_FALL' | 'CARDIAC_ARREST' | 'STROKE_SYMPTOMS') => void;
  isRePlanned: boolean;
  isLoading: boolean;
  selectedHospitalName?: string;
}

export const HeroActionBar: React.FC<HeroActionBarProps> = ({
  onTriggerHero,
  onTriggerDivert,
  onTriggerTraffic,
  onTriggerVitalsDrop,
  onOpenCreateModal,
  onSelectArchetype,
  isRePlanned,
  isLoading,
  selectedHospitalName,
}) => {
  return (
    <div className="bg-slate-900/90 border-b border-slate-800 backdrop-blur px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Quick Archetype Selector */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px] mr-1">
            Test Scenarios:
          </span>

          <button
            onClick={() => onSelectArchetype('ROAD_ACCIDENT')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-red-950/70 border border-red-800/80 text-red-200 hover:bg-red-900 font-medium transition"
            title="Bangalore Indiranagar multi-vehicle road collision (Aarav Sharma)"
            id="btn-scenario-road-accident"
          >
            <Car className="w-3.5 h-3.5 text-red-400" />
            <span>Road Accident (Hero)</span>
          </button>

          <button
            onClick={() => onSelectArchetype('ELDERLY_FALL')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-amber-950/60 border border-amber-800/70 text-amber-200 hover:bg-amber-900/80 font-medium transition"
            title="Elderly fall with AFib & anticoagulants (Savithri Rao)"
            id="btn-scenario-fall"
          >
            <HeartPulse className="w-3.5 h-3.5 text-amber-400" />
            <span>Elderly Fall + AFib</span>
          </button>

          <button
            onClick={() => onSelectArchetype('STROKE_SYMPTOMS')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-purple-950/60 border border-purple-800/70 text-purple-200 hover:bg-purple-900/80 font-medium transition"
            title="Acute Stroke symptoms with TIA history (Deepa Krishnan)"
            id="btn-scenario-stroke"
          >
            <Flame className="w-3.5 h-3.5 text-purple-400" />
            <span>Stroke in Transit</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 font-medium transition"
            id="btn-custom-emergency"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Custom Incident</span>
          </button>
        </div>

        {/* Right: Real-Time Event & Chaos Injector (Demonstrates Autonomous Re-planning) */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <span className="font-semibold text-amber-400/90 uppercase tracking-wider text-[11px] flex items-center gap-1">
            <Shuffle className="w-3 h-3" /> Re-Planning Events:
          </span>

          <button
            onClick={onTriggerDivert}
            disabled={isLoading || isRePlanned}
            id="btn-trigger-divert"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-bold transition shadow-sm ${
              isRePlanned
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-amber-600 hover:bg-amber-500 text-slate-950 border border-amber-400 animate-pulse'
            }`}
            title={`Simulate selected hospital (${selectedHospitalName || 'Manipal'}) going to CODE BLACK DIVERT to trigger autonomous re-plan`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{isRePlanned ? '✓ Divert Re-plan Done' : '⚡ Hospital Divert Event'}</span>
          </button>

          <button
            onClick={onTriggerTraffic}
            disabled={isLoading}
            id="btn-trigger-traffic"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-orange-950/70 border border-orange-800 text-orange-200 hover:bg-orange-900 transition font-medium"
            title="Simulate sudden traffic gridlock doubling ETA"
          >
            <Car className="w-3.5 h-3.5 text-orange-400" />
            <span>Traffic Surge</span>
          </button>

          <button
            onClick={onTriggerVitalsDrop}
            disabled={isLoading}
            id="btn-trigger-vitals"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-rose-950/70 border border-rose-800 text-rose-200 hover:bg-rose-900 transition font-medium"
            title="Simulate patient clinical decompensation"
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            <span>Vitals Drop</span>
          </button>
        </div>
      </div>
    </div>
  );
};
