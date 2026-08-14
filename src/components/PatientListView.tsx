import React from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Clock, 
  Zap, 
  Plus, 
  Camera, 
  ChevronRight, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  BedDouble,
  FileText
} from 'lucide-react';
import { Patient, PriorityLevel } from '../types';

interface PatientListViewProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onOpenAddRoundNote?: (patient: Patient) => void;
  onOpenCapture?: (patient: Patient) => void;
  onOpenRoundMode?: () => void;
}

export const PatientListView: React.FC<PatientListViewProps> = ({
  patients,
  onSelectPatient,
  onOpenAddRoundNote,
  onOpenCapture,
  onOpenRoundMode,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [priorityFilter, setPriorityFilter] = React.useState<PriorityLevel | 'ALL' | 'PENDING_ACTIONS'>('ALL');
  const [wardFilter, setWardFilter] = React.useState<string>('ALL');

  // Filter only active (non-discharged) inpatients
  const activePatients = React.useMemo(() => {
    return patients.filter((p) => p.status !== 'DISCHARGED');
  }, [patients]);

  const availableWards = React.useMemo(() => {
    const set = new Set<string>();
    activePatients.forEach((p) => {
      if (p.ward) set.add(p.ward);
    });
    return Array.from(set);
  }, [activePatients]);

  // Filtered patient list
  const filteredPatients = React.useMemo(() => {
    return activePatients.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBed = p.bed.toLowerCase().includes(q);
        const matchId = p.patientId.toLowerCase().includes(q);
        const matchDiag = p.primaryDiagnosis.toLowerCase().includes(q);
        const matchUpdate = p.lastUpdate?.toLowerCase().includes(q);
        if (!matchName && !matchBed && !matchId && !matchDiag && !matchUpdate) {
          return false;
        }
      }

      // Ward filter
      if (wardFilter !== 'ALL' && p.ward !== wardFilter) {
        return false;
      }

      // Priority / Pending filter
      if (priorityFilter === 'PENDING_ACTIONS') {
        const hasPendingLabs = p.pendingInvestigations && p.pendingInvestigations.length > 0;
        const hasPendingTasks = p.tasks && p.tasks.some((t) => t.status === 'PENDING');
        return hasPendingLabs || hasPendingTasks;
      } else if (priorityFilter !== 'ALL') {
        return p.priority === priorityFilter;
      }

      return true;
    });
  }, [activePatients, searchQuery, wardFilter, priorityFilter]);

  // Count stats
  const criticalCount = activePatients.filter((p) => p.priority === 'CRITICAL').length;
  const actionCount = activePatients.filter((p) => p.priority === 'ACTION').length;
  const reviewCount = activePatients.filter((p) => p.priority === 'REVIEW').length;
  const stableCount = activePatients.filter((p) => p.priority === 'STABLE').length;
  const pendingCount = activePatients.filter((p) => 
    (p.pendingInvestigations && p.pendingInvestigations.length > 0) || 
    (p.tasks && p.tasks.some((t) => t.status === 'PENDING'))
  ).length;

  return (
    <div className="p-3 sm:p-5 lg:p-6 space-y-5 max-w-[1600px] mx-auto text-slate-900">
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-teal-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-teal-600 rounded-xl text-white shadow-2xs">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Active Inpatients List
                </h1>
                <p className="text-xs text-teal-300 font-medium">
                  Complete ward roster • Bed allocations, diagnoses, updates & pending actions
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenRoundMode && (
              <button
                onClick={onOpenRoundMode}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Fast Bedside Round</span>
              </button>
            )}
          </div>
        </div>

        {/* Condition Filter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4 pt-3 border-t border-teal-800/60">
          {[
            { id: 'ALL', label: 'All Patients', count: activePatients.length, color: 'border-slate-600 bg-slate-800/60 text-white' },
            { id: 'CRITICAL', label: 'Critical', count: criticalCount, color: 'border-red-500/50 bg-red-950/40 text-red-200' },
            { id: 'ACTION', label: 'Action Req.', count: actionCount, color: 'border-amber-500/50 bg-amber-950/40 text-amber-200' },
            { id: 'REVIEW', label: 'Review', count: reviewCount, color: 'border-yellow-500/50 bg-yellow-950/40 text-yellow-200' },
            { id: 'STABLE', label: 'Stable', count: stableCount, color: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-200' },
            { id: 'PENDING_ACTIONS', label: 'Pending Action', count: pendingCount, color: 'border-cyan-500/50 bg-cyan-950/40 text-cyan-200' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPriorityFilter(item.id as any)}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                priorityFilter === item.id 
                  ? 'ring-2 ring-teal-400 shadow-md font-bold' 
                  : 'opacity-85 hover:opacity-100'
              } ${item.color}`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider truncate">
                {item.label}
              </div>
              <div className="text-base font-black mt-0.5">
                {item.count}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bed number, patient name, MRN/ID, diagnosis, or update..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
          />
        </div>

        {availableWards.length > 1 && (
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Ward:</span>
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Wards ({activePatients.length})</option>
              {availableWards.map((w) => (
                <option key={w} value={w}>
                  {w.split('-')[0]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Patient Cards Grid */}
      {filteredPatients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
          <Users className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Patients Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No admitted patients match your search or filter criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setPriorityFilter('ALL');
              setWardFilter('ALL');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => {
            const isCritical = patient.priority === 'CRITICAL';
            const isAction = patient.priority === 'ACTION';
            const isReview = patient.priority === 'REVIEW';
            const hasPendingLabs = patient.pendingInvestigations && patient.pendingInvestigations.length > 0;
            const hasPendingTasks = patient.tasks && patient.tasks.some((t) => t.status === 'PENDING');

            return (
              <div
                key={patient.patientId}
                className={`rounded-2xl border shadow-2xs flex flex-col justify-between overflow-hidden bg-white transition-all hover:shadow-md ${
                  isCritical
                    ? 'border-red-300 ring-1 ring-red-100'
                    : isAction
                    ? 'border-amber-300 ring-1 ring-amber-100'
                    : isReview
                    ? 'border-yellow-300 ring-1 ring-yellow-100'
                    : 'border-slate-200 hover:border-teal-400'
                }`}
              >
                {/* 1. Header: Patient Name, ID, Ward, Bed Badge & Condition */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Patient Name & Demographics */}
                    <div className="min-w-0 flex-1">
                      <button
                        onClick={() => onSelectPatient(patient)}
                        className="font-bold text-base sm:text-lg text-slate-900 hover:text-teal-700 transition-colors text-left flex items-baseline gap-1.5 truncate max-w-full leading-snug cursor-pointer"
                      >
                        <span className="truncate">{patient.name}</span>
                        <span className="text-xs text-slate-500 font-semibold shrink-0">
                          ({patient.age}{patient.sex[0]})
                        </span>
                      </button>
                      <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="font-semibold text-slate-600">ID: {patient.patientId}</span>
                        <span>•</span>
                        <span className="truncate">{patient.ward}</span>
                      </div>
                    </div>

                    {/* Right: Bed Badge & Condition Status */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="px-2.5 py-0.5 bg-slate-900 text-white font-mono font-black text-xs rounded-lg shadow-2xs flex items-center gap-1.5">
                        <BedDouble className="w-3 h-3 text-teal-400" />
                        <span>{patient.bed}</span>
                      </span>

                      <div
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1 shrink-0 whitespace-nowrap ${
                          isCritical
                            ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                            : isAction
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : isReview
                            ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        <span>
                          {isCritical
                            ? '🔴 CRITICAL'
                            : isAction
                            ? '🟠 ACTION REQ.'
                            : isReview
                            ? '🟡 REVIEW'
                            : '🟢 STABLE'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. DIAGNOSIS Box */}
                  <div className="bg-slate-50/90 border border-slate-200/90 p-3 rounded-xl space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      DIAGNOSIS:
                    </span>
                    <p className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                      {patient.primaryDiagnosis}
                    </p>

                    {/* LATEST UPDATE */}
                    <div className="pt-2 mt-2 border-t border-slate-200/80">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>LATEST UPDATE:</span>
                      </span>
                      <p className="text-slate-800 font-medium text-xs mt-0.5 leading-relaxed line-clamp-3">
                        {patient.lastUpdate}
                      </p>
                    </div>
                  </div>

                  {/* 3. PENDING ACTIONS (Labs & Tasks) */}
                  {(hasPendingLabs || hasPendingTasks) && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-xl text-xs space-y-2">
                      <div className="text-[10px] uppercase font-bold text-amber-900 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>PENDING ACTIONS</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {patient.pendingInvestigations?.map((inv, idx) => (
                          <span
                            key={idx}
                            className="bg-white border border-amber-300 text-amber-900 text-[11px] font-mono font-bold px-2 py-0.5 rounded shadow-2xs flex items-center gap-1"
                          >
                            <Zap className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>{inv}</span>
                          </span>
                        ))}
                        {patient.tasks
                          ?.filter((t) => t.status === 'PENDING')
                          .map((t) => (
                            <span
                              key={t.id}
                              className="bg-white border border-teal-300 text-teal-900 text-[11px] font-medium px-2 py-0.5 rounded shadow-2xs flex items-center gap-1 truncate max-w-full"
                            >
                              <FileText className="w-3 h-3 text-teal-700 shrink-0" />
                              <span className="truncate">{t.description}</span>
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Card Actions Footer */}
                <div className="bg-slate-50 p-3 border-t border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {onOpenAddRoundNote && (
                      <button
                        onClick={() => onOpenAddRoundNote(patient)}
                        className="flex items-center gap-1 text-xs text-slate-700 hover:text-teal-700 font-bold py-1.5 px-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-teal-700" />
                        <span>+ Round Note</span>
                      </button>
                    )}

                    {onOpenCapture && (
                      <button
                        onClick={() => onOpenCapture(patient)}
                        className="flex items-center gap-1 text-xs text-slate-700 hover:text-teal-700 font-bold py-1.5 px-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-teal-700" />
                        <span>Capture Doc</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectPatient(patient)}
                    className="flex items-center gap-1 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 py-1.5 px-3 rounded-xl transition-all shadow-2xs cursor-pointer ml-auto"
                  >
                    <span>View Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
