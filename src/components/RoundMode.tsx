import React from 'react';
import { 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Camera, 
  CheckCircle2,
  TrendingUp,
  X,
  Plus,
  ShieldAlert
} from 'lucide-react';
import { Patient } from '../types';

interface RoundModeProps {
  patients: Patient[];
  onClose: () => void;
  onOpenAddRoundNote: (patient: Patient) => void;
  onOpenCapture: () => void;
  onSelectPatient: (patient: Patient) => void;
}

export const RoundMode: React.FC<RoundModeProps> = ({
  patients,
  onClose,
  onOpenAddRoundNote,
  onOpenCapture,
  onSelectPatient,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Sort patients by priority so critical ones are seen first during ward round
  const sortedPatients = React.useMemo(() => {
    const priorityRank: Record<string, number> = {
      CRITICAL: 1,
      ACTION: 2,
      REVIEW: 3,
      STABLE: 4,
    };
    return [...patients].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  }, [patients]);

  const patient = sortedPatients[currentIndex] || sortedPatients[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : sortedPatients.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < sortedPatients.length - 1 ? prev + 1 : 0));
  };

  // Keyboard arrow keys navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sortedPatients.length]);

  if (!patient) return null;

  const isCritical = patient.priority === 'CRITICAL';
  const isAction = patient.priority === 'ACTION';

  return (
    <div className="fixed inset-0 bg-slate-100/95 backdrop-blur-xs z-50 flex flex-col justify-between overflow-hidden text-slate-900">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-slate-950 font-bold shadow-2xs">
            <Zap className="w-6 h-6 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                BEDSIDE ROUND MODE
              </h2>
              <span className="text-xs text-amber-800 font-mono font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                Patient {currentIndex + 1} of {sortedPatients.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Use Left / Right arrow keys to switch patients quickly during round
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors border border-slate-200"
          title="Exit Round Mode"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Single Patient Focus Flashcard */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-4">
        {/* Patient Identity Bar */}
        <div className={`p-5 rounded-2xl border shadow-xs flex flex-wrap items-center justify-between gap-4 bg-white ${
          isCritical ? 'border-red-300' :
          isAction ? 'border-amber-300' :
          'border-slate-200'
        }`}>
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-slate-100 text-teal-800 font-mono font-black text-base rounded-lg border border-slate-200">
                {patient.bed}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {patient.name}
              </h1>
              <span className="text-sm font-normal text-slate-500">
                ({patient.age}Y / {patient.sex})
              </span>
            </div>
            <div className="text-xs text-slate-600 font-mono mt-1">
              ID: {patient.patientId} • Ward: {patient.ward} • Consultant: {patient.consultant}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-xl font-bold text-xs border ${
              isCritical ? 'bg-red-50 text-red-800 border-red-300 animate-pulse' :
              isAction ? 'bg-amber-50 text-amber-800 border-amber-300' :
              'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}>
              {patient.priority} PRIORITY
            </span>

            <button
              onClick={() => onSelectPatient(patient)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-teal-800 border border-slate-300 rounded-xl text-xs font-bold shadow-2xs"
            >
              Full Profile →
            </button>
          </div>
        </div>

        {/* 🔴 LAST UPDATE (Prominent Top Highlight!) */}
        <div className={`p-5 rounded-2xl border shadow-xs space-y-2 ${
          isCritical ? 'bg-red-50/90 border-red-200 text-red-950' :
          isAction ? 'bg-amber-50/90 border-amber-200 text-amber-950' :
          'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>🔴 LAST UPDATE (Important Clinical Change)</span>
          </div>
          <p className="text-lg sm:text-xl font-black leading-snug">
            {patient.lastUpdate}
          </p>
        </div>

        {/* Clinical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Working Diagnosis & Active Problems */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Working Diagnosis & Problems</span>
            </div>
            <div className="font-extrabold text-teal-800 text-base">
              {patient.primaryDiagnosis}
            </div>
            <ul className="space-y-1.5 text-xs text-slate-800">
              {patient.activeProblems.map((prob, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-teal-600">•</span>
                  <span className="font-medium">{prob}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pending Investigations */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Investigations
            </div>
            {patient.pendingInvestigations && patient.pendingInvestigations.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.pendingInvestigations.map((inv, idx) => (
                  <span
                    key={idx}
                    className="bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold"
                  >
                    ⏳ {inv}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-xs italic">No urgent investigations pending</p>
            )}
          </div>
        </div>

        {/* Today's Plan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="text-xs font-bold text-teal-800 uppercase tracking-wider">
            Today's Clinical Plan
          </div>
          <p className="text-slate-800 text-sm font-medium whitespace-pre-line leading-relaxed">
            {patient.todayPlan}
          </p>
        </div>
      </div>

      {/* Bottom Navigation & Action Bar */}
      <div className="bg-white border-t border-slate-200 p-4 sticky bottom-0 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Previous Patient */}
          <button
            onClick={handlePrev}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors shadow-2xs"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Prev Patient</span>
          </button>

          {/* Action Center */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAddRoundNote(patient)}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Round Note</span>
            </button>

            <button
              onClick={onOpenCapture}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-colors shadow-2xs"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Capture Doc</span>
            </button>
          </div>

          {/* Next Patient */}
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-colors shadow-xs"
          >
            <span className="hidden sm:inline">Next Patient</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
