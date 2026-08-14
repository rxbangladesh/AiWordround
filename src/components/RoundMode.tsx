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
  onOpenCapture: (patient?: Patient) => void;
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

  // Sort active patients by priority so critical ones are seen first during ward round
  const activePatients = React.useMemo(() => {
    return patients.filter((p) => p.status !== 'DISCHARGED');
  }, [patients]);

  const sortedPatients = React.useMemo(() => {
    const priorityRank: Record<string, number> = {
      CRITICAL: 1,
      ACTION: 2,
      REVIEW: 3,
      STABLE: 4,
    };
    return [...activePatients].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  }, [activePatients]);

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
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 max-w-4xl mx-auto w-full space-y-4">
        <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
          isCritical
            ? 'border-red-300 ring-1 ring-red-200'
            : isAction
            ? 'border-amber-300'
            : 'border-slate-200'
        }`}>
          {/* Card Header: 2-column layout (Left: Patient Name & ID, Right: Bed No & Condition) */}
          <div className="p-4 sm:p-5 space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              {/* Left Column: Patient Name, Age/Sex, ID & Ward */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h1 className="font-extrabold text-xl sm:text-2xl text-slate-900 leading-snug">
                    {patient.name}
                  </h1>
                  <span className="text-sm text-slate-500 font-semibold shrink-0">
                    ({patient.age}{patient.sex[0]})
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="font-semibold text-slate-600">ID: {patient.patientId}</span>
                  <span>•</span>
                  <span>Ward: {patient.ward.split('-')[0]}</span>
                  {patient.consultant && (
                    <>
                      <span>•</span>
                      <span className="text-slate-600 font-sans">Dr. {patient.consultant.replace(/^Dr\.\s*/i, '')}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Right Column: Bed Number & Clinical Condition / Priority */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {/* Bed Badge */}
                <span className="px-3 py-0.5 bg-slate-100 border border-slate-300 text-teal-900 font-mono font-black text-xs sm:text-sm rounded-lg shadow-2xs">
                  {patient.bed}
                </span>

                {/* Priority / Condition Badge */}
                <div className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold flex items-center gap-1 shrink-0 whitespace-nowrap ${
                  isCritical ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse' :
                  isAction ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  patient.priority === 'REVIEW' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                  'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  <span>
                    {isCritical ? '🔴 CRITICAL' :
                     isAction ? '🟠 ACTION REQ.' :
                     patient.priority === 'REVIEW' ? '🟡 REVIEW' :
                     '🟢 STABLE'}
                  </span>
                </div>
              </div>
            </div>

            {/* LAST UPDATE / CLINICAL TREND (Highlighted Box) */}
            <div className={`p-3.5 rounded-xl border text-xs font-medium space-y-1.5 ${
              isCritical
                ? 'bg-red-50/80 border-red-200 text-red-900'
                : isAction
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>LAST UPDATE / CLINICAL TREND</span>
              </div>
              <div className="font-bold text-slate-900 text-sm sm:text-base leading-relaxed">
                {patient.lastUpdate}
              </div>
            </div>

            {/* Clinical Diagnosis & Active Problems */}
            <div className="space-y-1">
              <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                Primary Diagnosis
              </div>
              <p className="text-sm font-bold text-slate-900">
                {patient.primaryDiagnosis}
              </p>
              {patient.activeProblems && patient.activeProblems.length > 0 && (
                <div className="pt-1">
                  <ul className="flex flex-wrap gap-1.5 text-xs text-slate-700">
                    {patient.activeProblems.map((prob, idx) => (
                      <li key={idx} className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-medium">
                        • {prob}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Pending Investigations */}
            {patient.pendingInvestigations && patient.pendingInvestigations.length > 0 ? (
              <div className="space-y-1">
                <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                  Pending Labs & Investigations:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {patient.pendingInvestigations.map((inv, idx) => (
                    <span
                      key={idx}
                      className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-2.5 py-1 rounded-lg font-mono font-semibold flex items-center gap-1 shadow-2xs"
                    >
                      ⏳ {inv}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Today's Focus / Clinical Plan */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="text-teal-800 font-bold uppercase tracking-wider text-[11px]">Today's Clinical Plan & Focus:</div>
              <p className="text-slate-800 text-xs sm:text-sm font-medium whitespace-pre-line leading-relaxed">
                {patient.todayPlan || patient.todayPriority}
              </p>
            </div>
          </div>

          {/* Quick Header Action Link */}
          <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono text-[11px]">Admitted: {patient.admissionDate}</span>
            <button
              onClick={() => onSelectPatient(patient)}
              className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>View Full EMR Profile</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
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
              onClick={() => onOpenCapture(patient)}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-colors shadow-2xs cursor-pointer"
              title="Capture / Upload Medical Document"
            >
              <Camera className="w-4 h-4 text-teal-700" />
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
