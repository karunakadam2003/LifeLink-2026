import React, { useState } from 'react';
import { Hospital, Ambulance, Emergency } from '../types.js';
import { Navigation, MapPin, Building2, Car, ZoomIn, ZoomOut, Compass, Info, CheckCircle } from 'lucide-react';

interface GeospatialMapProps {
  emergency: Emergency;
  hospitals: Hospital[];
  ambulances: Ambulance[];
}

export const GeospatialMap: React.FC<GeospatialMapProps> = ({
  emergency,
  hospitals,
  ambulances,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedPin, setSelectedPin] = useState<{ type: 'HOSPITAL' | 'AMBULANCE' | 'INCIDENT'; data: any } | null>(null);

  // Center around Bangalore coordinates
  // Map bounds: Lat ~ 12.85 to 13.08, Lon ~ 77.55 to 77.68
  const mapCenterLat = 12.9600;
  const mapCenterLon = 77.6250;
  const latSpan = 0.20;
  const lonSpan = 0.16;

  // Convert lat/lon to SVG 0-1000 coordinate space
  const projectCoords = (lat: number, lon: number): [number, number] => {
    const x = ((lon - (mapCenterLon - lonSpan / 2)) / lonSpan) * 900 + 50;
    const y = (((mapCenterLat + latSpan / 2) - lat) / latSpan) * 550 + 25;
    return [Math.max(40, Math.min(960, x)), Math.max(30, Math.min(570, y))];
  };

  const incidentCoords = projectCoords(emergency.latitude, emergency.longitude);

  const selectedHospital = hospitals.find(h => h.hospital_id === emergency.selected_hospital_id);
  const selectedHospCoords = selectedHospital ? projectCoords(selectedHospital.latitude, selectedHospital.longitude) : null;

  const originalHospital = emergency.original_hospital_id ? hospitals.find(h => h.hospital_id === emergency.original_hospital_id) : null;
  const originalHospCoords = originalHospital ? projectCoords(originalHospital.latitude, originalHospital.longitude) : null;

  const assignedAmbulance = ambulances.find(a => a.ambulance_id === emergency.ambulance_id) || ambulances[0];
  const ambCoords = assignedAmbulance ? projectCoords(assignedAmbulance.latitude, assignedAmbulance.longitude) : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col relative">
      {/* Map Header / Toolbar */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Google Maps Platform • Live Dispatch Radar (Bangalore Metro)
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-semibold text-emerald-300">Live GPS Telemetry</span>
          </div>

          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.8))}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Map Viewport */}
      <div className="relative w-full h-[380px] bg-[#0b1120] overflow-hidden select-none">
        {/* SVG Road Network & Vector Overlay */}
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full object-cover transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" />
            </pattern>

            {/* Glowing filter for active route */}
            <filter id="glow-route" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Pulse gradient */}
            <radialGradient id="pulse-grad">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#ef4444" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Grid */}
          <rect width="1000" height="600" fill="url(#grid-pattern)" />

          {/* Stylized Urban Corridors (MG Road, Old Airport Rd, Outer Ring Rd, Koramangala) */}
          <g stroke="#334155" strokeWidth="3" opacity="0.4" fill="none" strokeLinecap="round">
            {/* Outer Ring Road */}
            <path d="M 120 120 C 350 150, 750 180, 880 480" />
            {/* Old Airport Road Corridor */}
            <path d="M 320 280 L 780 240" stroke="#475569" strokeWidth="4" />
            {/* Indiranagar 100ft Rd */}
            <path d="M 620 160 L 630 380" stroke="#475569" strokeWidth="3.5" />
            {/* Hosur / Koramangala Rd */}
            <path d="M 420 260 L 580 520" />
            {/* Bellary Road North */}
            <path d="M 380 40 L 420 260" />
            {/* MG Road Central */}
            <path d="M 340 220 L 520 250" strokeWidth="4" />
          </g>

          {/* Route: Ambulance to Incident Scene */}
          {ambCoords && incidentCoords && (
            <g>
              <line
                x1={ambCoords[0]}
                y1={ambCoords[1]}
                x2={incidentCoords[0]}
                y2={incidentCoords[1]}
                stroke="#38bdf8"
                strokeWidth="3.5"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
            </g>
          )}

          {/* Route: Previous Compromised Route if Re-planned */}
          {emergency.re_planned && originalHospCoords && incidentCoords && (
            <g opacity="0.6">
              <line
                x1={incidentCoords[0]}
                y1={incidentCoords[1]}
                x2={originalHospCoords[0]}
                y2={originalHospCoords[1]}
                stroke="#ef4444"
                strokeWidth="3"
                strokeDasharray="4 4"
              />
              <text
                x={(incidentCoords[0] + originalHospCoords[0]) / 2 + 10}
                y={(incidentCoords[1] + originalHospCoords[1]) / 2 - 10}
                fill="#f87171"
                fontSize="11"
                fontWeight="bold"
              >
                ✕ ROUTE CANCELLED (ER DIVERTED)
              </text>
            </g>
          )}

          {/* Active Optimal Route: Incident to Selected Hospital */}
          {selectedHospCoords && incidentCoords && (
            <g filter="url(#glow-route)">
              <line
                x1={incidentCoords[0]}
                y1={incidentCoords[1]}
                x2={selectedHospCoords[0]}
                y2={selectedHospCoords[1]}
                stroke="#10b981"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              {/* Route Label */}
              <rect
                x={(incidentCoords[0] + selectedHospCoords[0]) / 2 - 45}
                y={(incidentCoords[1] + selectedHospCoords[1]) / 2 - 16}
                width="90"
                height="22"
                rx="6"
                fill="#064e3b"
                stroke="#34d399"
                strokeWidth="1"
              />
              <text
                x={(incidentCoords[0] + selectedHospCoords[0]) / 2}
                y={(incidentCoords[1] + selectedHospCoords[1]) / 2 - 1}
                fill="#ecfdf5"
                fontSize="10.5"
                fontWeight="bold"
                textAnchor="middle"
              >
                ETA {selectedHospital?.eta_minutes}m • FASTEST
              </text>
            </g>
          )}

          {/* Hospital Pins */}
          {hospitals.map(hosp => {
            const [hx, hy] = projectCoords(hosp.latitude, hosp.longitude);
            const isSelected = hosp.hospital_id === emergency.selected_hospital_id;
            const isDiverted = hosp.operating_status === 'CODE_BLACK_DIVERT';
            const isOriginalDiverted = hosp.hospital_id === emergency.original_hospital_id;

            return (
              <g
                key={hosp.hospital_id}
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => setSelectedPin({ type: 'HOSPITAL', data: hosp })}
              >
                {/* Halo for Selected */}
                {isSelected && (
                  <circle cx={hx} cy={hy} r="22" fill="#10b981" fillOpacity="0.25" className="animate-ping" />
                )}

                {/* Base circle */}
                <circle
                  cx={hx}
                  cy={hy}
                  r={isSelected ? "14" : "10"}
                  fill={isDiverted ? "#ef4444" : isSelected ? "#10b981" : "#3b82f6"}
                  stroke="#ffffff"
                  strokeWidth="2"
                />

                {/* Hospital Icon Cross */}
                <path
                  d={`M ${hx} ${hy - 5} L ${hx} ${hy + 5} M ${hx - 5} ${hy} L ${hx + 5} ${hy}`}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Label */}
                <text
                  x={hx}
                  y={hy + 22}
                  fill={isSelected ? "#34d399" : isDiverted ? "#f87171" : "#cbd5e1"}
                  fontSize={isSelected ? "11.5" : "9.5"}
                  fontWeight={isSelected ? "bold" : "normal"}
                  textAnchor="middle"
                  className="drop-shadow-md"
                >
                  {hosp.name.split(' ')[0]} {hosp.name.split(' ')[1]}
                  {isDiverted && ' [DIVERT]'}
                </text>
              </g>
            );
          })}

          {/* Ambulance Icon */}
          {ambCoords && (
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPin({ type: 'AMBULANCE', data: assignedAmbulance })}
            >
              <circle cx={ambCoords[0]} cy={ambCoords[1]} r="18" fill="#38bdf8" fillOpacity="0.2" className="animate-pulse" />
              <circle cx={ambCoords[0]} cy={ambCoords[1]} r="11" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
              <text x={ambCoords[0]} y={ambCoords[1] + 4} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                🚑
              </text>
              <text x={ambCoords[0]} y={ambCoords[1] + 20} fill="#7dd3fc" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                {assignedAmbulance.unit_code.split('-')[0]}
              </text>
            </g>
          )}

          {/* Incident Scene Pin with Wave Pulse */}
          {incidentCoords && (
            <g
              className="cursor-pointer"
              onClick={() => setSelectedPin({ type: 'INCIDENT', data: emergency })}
            >
              <circle cx={incidentCoords[0]} cy={incidentCoords[1]} r="30" fill="url(#pulse-grad)" className="animate-ping" />
              <circle cx={incidentCoords[0]} cy={incidentCoords[1]} r="14" fill="#dc2626" stroke="#ffffff" strokeWidth="2.5" />
              <text x={incidentCoords[0]} y={incidentCoords[1] + 4} fill="#ffffff" fontSize="10" fontWeight="black" textAnchor="middle">
                ⚠️
              </text>
              <text x={incidentCoords[0]} y={incidentCoords[1] - 18} fill="#fca5a5" fontSize="10.5" fontWeight="black" textAnchor="middle">
                ACCIDENT SCENE
              </text>
            </g>
          )}
        </svg>

        {/* Map Legend Floating Pill */}
        <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-slate-300 flex items-center space-x-3 shadow-lg">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Incident</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Selected Hospital</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Candidate Hub</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white" />
            <span>Code Black (Diverted)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span>ALS Ambulance</span>
          </div>
        </div>

        {/* Selected Pin Details Overlay Popup */}
        {selectedPin && (
          <div className="absolute top-3 right-3 max-w-xs bg-slate-950/95 backdrop-blur border border-slate-700 rounded-xl p-3 text-xs text-white shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
              <span className="font-bold text-sky-300 uppercase tracking-wider text-[10px]">
                {selectedPin.type === 'HOSPITAL' ? 'Facility Telemetry' : selectedPin.type === 'AMBULANCE' ? 'Fleet Unit' : 'Incident Details'}
              </span>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            {selectedPin.type === 'HOSPITAL' && (
              <div className="space-y-1">
                <div className="font-bold text-sm text-white">{selectedPin.data.name}</div>
                <div className="text-slate-300">Trauma Level: <span className="font-semibold text-emerald-400">{selectedPin.data.trauma_capability}</span></div>
                <div className="text-slate-300">Status: <span className={`font-semibold ${selectedPin.data.operating_status === 'CODE_BLACK_DIVERT' ? 'text-red-400' : 'text-emerald-400'}`}>{selectedPin.data.operating_status}</span></div>
                <div className="text-slate-300">ER Bays: <span className="font-bold text-white">{selectedPin.data.er_beds_available}</span> | ICU: <span className="font-bold text-white">{selectedPin.data.icu_beds_available}</span></div>
                <div className="text-slate-300">ETA from scene: <span className="font-bold text-amber-400">{selectedPin.data.eta_minutes} mins</span> ({selectedPin.data.distance_km} km)</div>
              </div>
            )}
            {selectedPin.type === 'AMBULANCE' && (
              <div className="space-y-1">
                <div className="font-bold text-sm text-white">{selectedPin.data.unit_code}</div>
                <div className="text-slate-300">Type: <span className="font-semibold text-sky-400">{selectedPin.data.vehicle_type}</span></div>
                <div className="text-slate-300">Status: <span className="font-bold text-emerald-400">{selectedPin.data.status}</span></div>
                <div className="text-[11px] text-slate-400">Crew: {selectedPin.data.paramedic_crew?.join(', ')}</div>
              </div>
            )}
            {selectedPin.type === 'INCIDENT' && (
              <div className="space-y-1">
                <div className="font-bold text-sm text-white">{selectedPin.data.emergency_type.replace(/_/g, ' ')}</div>
                <div className="text-slate-300">{selectedPin.data.description}</div>
                <div className="text-[11px] text-slate-400">{selectedPin.data.address_hint}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
