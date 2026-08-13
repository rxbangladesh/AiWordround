import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Activity, 
  FileText, 
  Zap, 
  ChevronRight, 
  TrendingUp, 
  Plus, 
  Camera, 
  ArrowUpRight,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { Patient, PriorityLevel } from '../types';

interface DashboardProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onOpenPreRoundBrief?: () => void;
  onOpenRoundMode?: () => void;
  onOpenCapture?: () => void;
  onOpenAddRoundNote?: (patient: Patient) => void;
  onFilterPriority?: (priority: PriorityLevel | 'ALL') => void;
  selectedPriorityFilter?: PriorityLevel | 'ALL';
}

export const Dashboard: React.FC<DashboardProps> = ({
  patients,
  onSelectPatient,
  onOpenPreRoundBrief,
  onOpenRoundMode,
  onOpenCapture,
  onOpenAddRoundNote,
  onFilterPriority,
  selectedPriorityFilter,
}) => {
  const [internalPriorityFilter, setInternalPriorityFilter] = React.useState<PriorityLevel | 'ALL'>('ALL');
  const [viewMode, setViewMode] = React.useState<'ACTIVE' | 'DISCHARGED'>('ACTIVE');
  const activePriorityFilter = selectedPriorityFilter ?? internalPriorityFilter;

  const handleFilterPriority = (priority: PriorityLevel | 'ALL') => {
    setInternalPriorityFilter(priority);
    if (typeof onFilterPriority === 'function') {
      onFilterPriority(priority);
    }
  };

  // Sort patients by priority order: CRITICAL -> ACTION -> REVIEW -> STABLE
  const priorityRank: Record<PriorityLevel, number> = {
    CRITICAL: 1,
    ACTION: 2,
    REVIEW: 3,
    STABLE: 4,
  };

  const activePatients = React.useMemo(() => patients.filter(p => p.status !== 'DISCHARGED'), [patients]);
  const dischargedPatients = React.useMemo(() => patients.filter(p => p.status === 'DISCHARGED'), [patients]);

  const sortedPatients = React.useMemo(() => {
    let filtered = [...activePatients];
    if (activePriorityFilter !== 'ALL') {
      filtered = filtered.filter(p => p.priority === activePriorityFilter);
    }
    return filtered.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  }, [activePatients, activePriorityFilter]);

  const totalPatients = activePatients.length;
  const criticalCount = activePatients.filter(p => p.priority === 'CRITICAL').length;
  const actionCount = activePatients.filter(p => p.priority === 'ACTION').length;
  const reviewCount = activePatients.filter(p => p.priority === 'REVIEW').length;
  const stableCount = activePatients.filter(p => p.priority === 'STABLE').length;

  const totalPendingInvs = activePatients.reduce((acc, p) => acc + (p.pendingInvestigations?.length || 0), 0);
  const totalPendingTasks = activePatients.reduce(
    (acc, p) => acc + p.tasks.filter(t => t.status === 'PENDING').length,
    0
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 rounded-2xl border border-slate-800 shadow-xl text-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
              Ward Round Clinical Command
            </span>
            <span className="text-xs text-slate-400">
              Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            “What do I need to know and do for my patients today?”
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Prioritizing <span className="text-red-400 font-bold">Important</span> → <span className="text-amber-300 font-bold">New Change</span> → <span className="text-teal-300 font-bold">Trends</span> → <span className="text-slate-300 font-bold">Pending Plan</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
          <button
            onClick={onOpenPreRoundBrief}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg hover:shadow-teal-500/20 active:scale-98 transition-all text-sm"
          >
            <ClipboardList className="w-5 h-5 text-slate-950" />
            <span>START PRE-ROUND BRIEF</span>
          </button>

          <button
            onClick={onOpenRoundMode}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg active:scale-98 transition-all text-sm"
          >
            <Zap className="w-5 h-5 fill-slate-950" />
            <span>FAST ROUND MODE</span>
          </button>
        </div>
      </div>

      {/* Ward Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => handleFilterPriority('ALL')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activePriorityFilter === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className={`text-xs font-semibold ${activePriorityFilter === 'ALL' ? 'text-slate-300' : 'text-slate-500'}`}>Total Ward</div>
          <div className={`text-2xl font-black mt-1 ${activePriorityFilter === 'ALL' ? 'text-white' : 'text-slate-900'}`}>{totalPatients}</div>
          <div className={`text-[11px] mt-0.5 ${activePriorityFilter === 'ALL' ? 'text-slate-400' : 'text-slate-500'}`}>Admitted Patients</div>
        </button>

        <button
          onClick={() => handleFilterPriority('CRITICAL')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activePriorityFilter === 'CRITICAL'
              ? 'bg-red-700 text-white border-red-700 shadow-sm'
              : 'bg-white border-red-200 text-slate-900 hover:bg-red-50/50 shadow-xs'
          }`}
        >
          <div className={`flex items-center justify-between text-xs font-semibold ${activePriorityFilter === 'CRITICAL' ? 'text-red-100' : 'text-red-700'}`}>
            <span>Critical</span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          </div>
          <div className={`text-2xl font-black mt-1 ${activePriorityFilter === 'CRITICAL' ? 'text-white' : 'text-red-700'}`}>{criticalCount}</div>
          <div className={`text-[11px] mt-0.5 ${activePriorityFilter === 'CRITICAL' ? 'text-red-100' : 'text-red-600'}`}>🔴 Deteriorating</div>
        </button>

        <button
          onClick={() => handleFilterPriority('ACTION')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activePriorityFilter === 'ACTION'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-white border-amber-200 text-slate-900 hover:bg-amber-50/50 shadow-xs'
          }`}
        >
          <div className={`text-xs font-semibold ${activePriorityFilter === 'ACTION' ? 'text-amber-100' : 'text-amber-700'}`}>Action Req.</div>
          <div className={`text-2xl font-black mt-1 ${activePriorityFilter === 'ACTION' ? 'text-white' : 'text-amber-700'}`}>{actionCount}</div>
          <div className={`text-[11px] mt-0.5 ${activePriorityFilter === 'ACTION' ? 'text-amber-100' : 'text-amber-600'}`}>🟠 Pending Decisions</div>
        </button>

        <button
          onClick={() => handleFilterPriority('REVIEW')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activePriorityFilter === 'REVIEW'
              ? 'bg-yellow-600 text-white border-yellow-600 shadow-sm'
              : 'bg-white border-yellow-200 text-slate-900 hover:bg-yellow-50/50 shadow-xs'
          }`}
        >
          <div className={`text-xs font-semibold ${activePriorityFilter === 'REVIEW' ? 'text-yellow-100' : 'text-yellow-800'}`}>Review</div>
          <div className={`text-2xl font-black mt-1 ${activePriorityFilter === 'REVIEW' ? 'text-white' : 'text-yellow-800'}`}>{reviewCount}</div>
          <div className={`text-[11px] mt-0.5 ${activePriorityFilter === 'REVIEW' ? 'text-yellow-100' : 'text-yellow-700'}`}>🟡 Step-down check</div>
        </button>

        <button
          onClick={() => handleFilterPriority('STABLE')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activePriorityFilter === 'STABLE'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white border-emerald-200 text-slate-900 hover:bg-emerald-50/50 shadow-xs'
          }`}
        >
          <div className={`text-xs font-semibold ${activePriorityFilter === 'STABLE' ? 'text-emerald-100' : 'text-emerald-700'}`}>Stable</div>
          <div className={`text-2xl font-black mt-1 ${activePriorityFilter === 'STABLE' ? 'text-white' : 'text-emerald-700'}`}>{stableCount}</div>
          <div className={`text-[11px] mt-0.5 ${activePriorityFilter === 'STABLE' ? 'text-emerald-100' : 'text-emerald-600'}`}>🟢 Routine Progress</div>
        </button>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs text-left">
          <div className="text-xs font-semibold text-slate-500">Pending Actions</div>
          <div className="text-lg font-bold text-teal-700 mt-1">
            {totalPendingInvs} <span className="text-xs font-normal text-slate-500">Labs</span> | {totalPendingTasks} <span className="text-xs font-normal text-slate-500">Tasks</span>
          </div>
          <div className="text-[11px] text-teal-600 mt-0.5">Requires Ward Action</div>
        </div>
      </div>

      {/* Patient Cards Priority Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{viewMode === 'ACTIVE' ? "TODAY'S WARD PATIENTS" : 'DISCHARGED PATIENTS ARCHIVE'}</span>
            </h3>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode('ACTIVE')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === 'ACTIVE'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active Ward ({activePatients.length})
              </button>
              <button
                onClick={() => setViewMode('DISCHARGED')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === 'DISCHARGED'
                    ? 'bg-red-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Discharged Archive ({dischargedPatients.length})
              </button>
            </div>
          </div>

          {viewMode === 'ACTIVE' && (
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="text-slate-500 font-medium">Filter Priority:</span>
              {(['ALL', 'CRITICAL', 'ACTION', 'REVIEW', 'STABLE'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => handleFilterPriority(p)}
                  className={`px-2.5 py-1 rounded-lg font-semibold border transition-all ${
                    activePriorityFilter === p
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DISCHARGED PATIENTS ARCHIVE GRID */}
        {viewMode === 'DISCHARGED' && (
          <div>
            {dischargedPatients.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">No Discharged Patients in Archive</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When patients are discharged, their complete medical history, daily rounds, OCR files, and discharge summaries are saved securely here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dischargedPatients.map((p) => (
                  <div
                    key={p.patientId}
                    className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs hover:border-slate-400 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded font-bold text-[10px] uppercase">
                            Discharged
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {p.dischargeData?.dischargeDate || p.lastUpdate}
                          </span>
                        </div>
                        <h4
                          onClick={() => onSelectPatient(p)}
                          className="font-bold text-slate-900 text-base hover:text-teal-700 cursor-pointer transition-colors mt-1"
                        >
                          {p.name} ({p.age}Y / {p.sex})
                        </h4>
                        <div className="text-xs text-slate-500 font-mono">
                          ID: {p.patientId} • Ward: {p.ward}
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectPatient(p)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
                      >
                        View Record →
                      </button>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-slate-900">
                        Diagnosis: <span className="text-teal-800">{p.primaryDiagnosis}</span>
                      </p>
                      {p.dischargeData && (
                        <>
                          <p className="text-slate-700">
                            <strong>Condition:</strong> <span className="text-amber-800 font-bold">{p.dischargeData.conditionOnDischarge}</span>
                          </p>
                          <p className="text-slate-600 line-clamp-2">
                            <strong>Summary:</strong> {p.dischargeData.dischargeSummary}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Patient Cards Grid */}
        {viewMode === 'ACTIVE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedPatients.map((patient) => {
              const isCritical = patient.priority === 'CRITICAL';
              const isAction = patient.priority === 'ACTION';
              const isReview = patient.priority === 'REVIEW';

              return (
                <div
                  key={patient.patientId}
                  className={`rounded-xl border transition-all hover:border-slate-400 shadow-xs flex flex-col justify-between overflow-hidden bg-white ${
                    isCritical
                      ? 'border-red-300 hover:border-red-500'
                      : isAction
                      ? 'border-amber-300 hover:border-amber-500'
                      : isReview
                      ? 'border-yellow-300 hover:border-yellow-500'
                      : 'border-slate-200 hover:border-emerald-500'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 pb-3 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-teal-800 font-mono font-bold text-xs rounded-md">
                          {patient.bed}
                        </span>
                        <div>
                          <button
                            onClick={() => onSelectPatient(patient)}
                            className="font-bold text-base text-slate-900 hover:text-teal-700 transition-colors text-left flex items-center gap-1.5"
                          >
                            <span>{patient.name}</span>
                            <span className="text-xs text-slate-500 font-normal">({patient.age}{patient.sex[0]})</span>
                          </button>
                          <div className="text-xs text-slate-500 font-mono">
                            ID: {patient.patientId} • {patient.ward.split('-')[0]}
                          </div>
                        </div>
                      </div>

                      {/* Priority Badge */}
                      <div className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 shrink-0 ${
                        isCritical ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse' :
                        isAction ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        isReview ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        <span>
                          {isCritical ? '🔴 CRITICAL' :
                           isAction ? '🟠 ACTION REQ.' :
                           isReview ? '🟡 REVIEW' :
                           '🟢 STABLE'}
                        </span>
                      </div>
                    </div>

                    {/* LAST UPDATE (Highlighted Box) */}
                    <div className={`p-3 rounded-lg border text-xs font-medium space-y-1 ${
                      isCritical
                        ? 'bg-red-50/80 border-red-200 text-red-900'
                        : isAction
                        ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>LAST UPDATE / CLINICAL TREND</span>
                      </div>
                      <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                        {patient.lastUpdate}
                      </div>
                    </div>

                    {/* Main Diagnosis */}
                    <div>
                      <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                        Primary Diagnosis
                      </div>
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1 mt-0.5">
                        {patient.primaryDiagnosis}
                      </p>
                    </div>

                    {/* Pending Investigations */}
                    {patient.pendingInvestigations && patient.pendingInvestigations.length > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500 font-semibold shrink-0">Pending Labs:</span>
                        <div className="flex flex-wrap gap-1">
                          {patient.pendingInvestigations.map((inv, idx) => (
                            <span
                              key={idx}
                              className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] px-2 py-0.5 rounded font-mono font-medium"
                            >
                              {inv}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Today Priority & Plan */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="text-slate-500 font-semibold">Today's Focus:</div>
                      <p className="text-slate-700 line-clamp-2">{patient.todayPriority}</p>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="bg-slate-50 p-3 border-t border-slate-200 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenAddRoundNote?.(patient)}
                      className="flex items-center gap-1 text-xs text-slate-700 hover:text-teal-700 font-semibold py-1 px-2.5 rounded bg-white hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Round Note</span>
                    </button>

                    <button
                      onClick={() => onOpenCapture?.()}
                      className="flex items-center gap-1 text-xs text-slate-700 hover:text-teal-700 font-semibold py-1 px-2.5 rounded bg-white hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Capture</span>
                    </button>

                    <button
                      onClick={() => onSelectPatient?.(patient)}
                      className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline py-1 px-2 ml-auto"
                    >
                      <span>Full Profile</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
