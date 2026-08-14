import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Activity, 
  Zap, 
  ChevronRight, 
  Plus, 
  Camera, 
  Stethoscope, 
  Users,
  Search,
  BedDouble,
  BellRing,
  ClipboardList,
  Sparkles
} from 'lucide-react';
import { Patient, PriorityLevel, UserAccount } from '../types';

export type DashboardFilter = PriorityLevel | 'ALL' | 'PENDING_ACTION';

interface DashboardProps {
  currentUser?: UserAccount | null;
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onOpenPreRoundBrief?: () => void;
  onOpenRoundMode?: () => void;
  onOpenCapture?: (patient?: Patient) => void;
  onOpenAddRoundNote?: (patient: Patient) => void;
  onOpenDischargeList?: () => void;
  onFilterPriority?: (priority: PriorityLevel | 'ALL') => void;
  selectedPriorityFilter?: PriorityLevel | 'ALL';
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  patients,
  onSelectPatient,
  onOpenPreRoundBrief,
  onOpenRoundMode,
  onOpenCapture,
  onOpenAddRoundNote,
  onOpenDischargeList,
  onFilterPriority,
  selectedPriorityFilter,
}) => {
  const [internalFilter, setInternalFilter] = React.useState<DashboardFilter>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [rosterScope, setRosterScope] = React.useState<'MY_PATIENTS' | 'ALL_WARD'>('ALL_WARD');

  const activeFilter: DashboardFilter = (selectedPriorityFilter as DashboardFilter) ?? internalFilter;

  const handleFilterChange = (filter: DashboardFilter) => {
    setInternalFilter(filter);
    if (typeof onFilterPriority === 'function') {
      if (filter === 'PENDING_ACTION') {
        onFilterPriority('ALL');
      } else {
        onFilterPriority(filter);
      }
    }
  };

  // Sort patients by priority order: CRITICAL -> ACTION -> REVIEW -> STABLE
  const priorityRank: Record<PriorityLevel, number> = {
    CRITICAL: 1,
    ACTION: 2,
    REVIEW: 3,
    STABLE: 4,
  };

  // Filter based on doctor scope
  const scopedPatients = React.useMemo(() => {
    if (!currentUser || rosterScope === 'ALL_WARD' || currentUser.role === 'CLINICAL_ADMIN') {
      return patients;
    }
    const cleanDocName = currentUser.name.toLowerCase().replace('dr.', '').split(',')[0].trim();
    const myPatients = patients.filter((p) => {
      if (p.assignedDoctorId && p.assignedDoctorId === currentUser.id) return true;
      if (p.consultant && p.consultant.toLowerCase().includes(cleanDocName)) return true;
      return false;
    });

    return myPatients.length > 0 ? myPatients : patients;
  }, [patients, currentUser, rosterScope]);

  // Only active inpatients on main dashboard (discharged go to Discharge List)
  const activePatients = React.useMemo(() => scopedPatients.filter(p => p.status !== 'DISCHARGED'), [scopedPatients]);

  // Condition counts
  const totalPatients = activePatients.length;
  const criticalCount = activePatients.filter(p => p.priority === 'CRITICAL').length;
  const actionCount = activePatients.filter(p => p.priority === 'ACTION').length;
  const reviewCount = activePatients.filter(p => p.priority === 'REVIEW').length;
  const stableCount = activePatients.filter(p => p.priority === 'STABLE').length;
  
  const pendingActionPatients = React.useMemo(() => {
    return activePatients.filter(
      p => (p.pendingInvestigations && p.pendingInvestigations.length > 0) ||
           (p.tasks && p.tasks.some(t => t.status === 'PENDING'))
    );
  }, [activePatients]);

  const pendingActionCount = pendingActionPatients.length;

  // Filter & Search
  const filteredPatients = React.useMemo(() => {
    let list = [...activePatients];

    if (activeFilter === 'PENDING_ACTION') {
      list = list.filter(
        p => (p.pendingInvestigations && p.pendingInvestigations.length > 0) ||
             (p.tasks && p.tasks.some(t => t.status === 'PENDING'))
      );
    } else if (activeFilter !== 'ALL') {
      list = list.filter(p => p.priority === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        p => p.name.toLowerCase().includes(q) ||
             p.bed.toLowerCase().includes(q) ||
             p.patientId.toLowerCase().includes(q) ||
             p.primaryDiagnosis.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  }, [activePatients, activeFilter, searchQuery]);

  return (
    <div className="p-3 sm:p-5 lg:p-6 space-y-5 max-w-[1600px] mx-auto text-slate-900">
      
      {/* 1. Condition & Status Command Bar (Quick Filters) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {/* ALL PATIENTS */}
        <button
          onClick={() => handleFilterChange('ALL')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeFilter === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
              : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${activeFilter === 'ALL' ? 'text-slate-300' : 'text-slate-500'}`}>
              All Patients
            </span>
            <Users className={`w-4 h-4 ${activeFilter === 'ALL' ? 'text-teal-400' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-black tracking-tight ${activeFilter === 'ALL' ? 'text-white' : 'text-slate-900'}`}>
              {totalPatients}
            </div>
            <div className={`text-[11px] font-medium truncate ${activeFilter === 'ALL' ? 'text-slate-300' : 'text-slate-500'}`}>
              Admitted Inpatients
            </div>
          </div>
        </button>

        {/* CRITICAL */}
        <button
          onClick={() => handleFilterChange('CRITICAL')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeFilter === 'CRITICAL'
              ? 'bg-red-700 text-white border-red-700 shadow-md ring-2 ring-red-500/30'
              : 'bg-white border-red-200 text-slate-900 hover:bg-red-50/50 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${activeFilter === 'CRITICAL' ? 'text-red-100' : 'text-red-700'}`}>
              Critical
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-black tracking-tight ${activeFilter === 'CRITICAL' ? 'text-white' : 'text-red-700'}`}>
              {criticalCount}
            </div>
            <div className={`text-[11px] font-medium truncate ${activeFilter === 'CRITICAL' ? 'text-red-100' : 'text-red-600'}`}>
              🔴 High Risk / Deteriorating
            </div>
          </div>
        </button>

        {/* ACTION REQUIRED */}
        <button
          onClick={() => handleFilterChange('ACTION')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeFilter === 'ACTION'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-500/30'
              : 'bg-white border-amber-200 text-slate-900 hover:bg-amber-50/50 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${activeFilter === 'ACTION' ? 'text-amber-100' : 'text-amber-700'}`}>
              Action Req.
            </span>
            <AlertTriangle className={`w-4 h-4 ${activeFilter === 'ACTION' ? 'text-amber-200' : 'text-amber-600'}`} />
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-black tracking-tight ${activeFilter === 'ACTION' ? 'text-white' : 'text-amber-700'}`}>
              {actionCount}
            </div>
            <div className={`text-[11px] font-medium truncate ${activeFilter === 'ACTION' ? 'text-amber-100' : 'text-amber-600'}`}>
              🟠 Urgent Intervention
            </div>
          </div>
        </button>

        {/* REVIEWS */}
        <button
          onClick={() => handleFilterChange('REVIEW')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeFilter === 'REVIEW'
              ? 'bg-yellow-600 text-white border-yellow-600 shadow-md ring-2 ring-yellow-500/30'
              : 'bg-white border-yellow-200 text-slate-900 hover:bg-yellow-50/50 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${activeFilter === 'REVIEW' ? 'text-yellow-100' : 'text-yellow-800'}`}>
              Reviews
            </span>
            <Clock className={`w-4 h-4 ${activeFilter === 'REVIEW' ? 'text-yellow-200' : 'text-yellow-700'}`} />
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-black tracking-tight ${activeFilter === 'REVIEW' ? 'text-white' : 'text-yellow-800'}`}>
              {reviewCount}
            </div>
            <div className={`text-[11px] font-medium truncate ${activeFilter === 'REVIEW' ? 'text-yellow-100' : 'text-yellow-700'}`}>
              🟡 Step-Down / Evaluation
            </div>
          </div>
        </button>

        {/* STABLE */}
        <button
          onClick={() => handleFilterChange('STABLE')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeFilter === 'STABLE'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/30'
              : 'bg-white border-emerald-200 text-slate-900 hover:bg-emerald-50/50 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${activeFilter === 'STABLE' ? 'text-emerald-100' : 'text-emerald-700'}`}>
              Stable
            </span>
            <CheckCircle2 className={`w-4 h-4 ${activeFilter === 'STABLE' ? 'text-emerald-200' : 'text-emerald-600'}`} />
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-black tracking-tight ${activeFilter === 'STABLE' ? 'text-white' : 'text-emerald-700'}`}>
              {stableCount}
            </div>
            <div className={`text-[11px] font-medium truncate ${activeFilter === 'STABLE' ? 'text-emerald-100' : 'text-emerald-600'}`}>
              🟢 Routine Monitoring
            </div>
          </div>
        </button>

        {/* PENDING ACTION */}
        <button
          onClick={() => handleFilterChange('PENDING_ACTION')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeFilter === 'PENDING_ACTION'
              ? 'bg-teal-800 text-white border-teal-800 shadow-md ring-2 ring-teal-600/30'
              : 'bg-white border-teal-200 text-slate-900 hover:bg-teal-50/50 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${activeFilter === 'PENDING_ACTION' ? 'text-teal-100' : 'text-teal-800'}`}>
              Pending Action
            </span>
            <Zap className={`w-4 h-4 ${activeFilter === 'PENDING_ACTION' ? 'text-amber-300' : 'text-amber-500'}`} />
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-black tracking-tight ${activeFilter === 'PENDING_ACTION' ? 'text-white' : 'text-teal-800'}`}>
              {pendingActionCount}
            </div>
            <div className={`text-[11px] font-medium truncate ${activeFilter === 'PENDING_ACTION' ? 'text-teal-100' : 'text-teal-700'}`}>
              ⚡ Pending Labs & Tasks
            </div>
          </div>
        </button>
      </div>

      {/* 2. Search & Controls Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bed no, patient name, ID, diagnosis..."
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick View Controls */}
        <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
          {/* Active Filter Pill */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold">Showing:</span>
            <span className="font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
              {activeFilter === 'ALL' ? 'All Patients' :
               activeFilter === 'CRITICAL' ? '🔴 Critical' :
               activeFilter === 'ACTION' ? '🟠 Action Required' :
               activeFilter === 'REVIEW' ? '🟡 Reviews' :
               activeFilter === 'STABLE' ? '🟢 Stable' :
               '⚡ Pending Action'} ({filteredPatients.length})
            </span>
          </div>

          {/* Quick Round Mode Trigger */}
          {onOpenRoundMode && (
            <button
              onClick={onOpenRoundMode}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Fast Round</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Patient Cards Grid */}
      {filteredPatients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
          <Users className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="font-bold text-slate-800 text-sm">No Patients Match the Current Filter</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery ? `No matching records found for "${searchQuery}".` : `There are currently no patients under the ${activeFilter} category.`}
          </p>
          <button
            onClick={() => {
              handleFilterChange('ALL');
              setSearchQuery('');
            }}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>Reset to All Patients</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredPatients.map((patient) => {
            const isCritical = patient.priority === 'CRITICAL';
            const isAction = patient.priority === 'ACTION';
            const isReview = patient.priority === 'REVIEW';

            return (
              <div
                key={patient.patientId}
                onClick={() => onSelectPatient(patient)}
                className={`rounded-2xl border transition-all hover:shadow-md hover:border-teal-500 shadow-2xs flex flex-col justify-between overflow-hidden bg-white cursor-pointer group ${
                  isCritical
                    ? 'border-red-300 hover:border-red-500 ring-1 ring-red-100'
                    : isAction
                    ? 'border-amber-300 hover:border-amber-500 ring-1 ring-amber-100'
                    : isReview
                    ? 'border-yellow-300 hover:border-yellow-500 ring-1 ring-yellow-100'
                    : 'border-slate-200 hover:border-teal-500'
                }`}
              >
                {/* Top Basic Info: Bed No, Patient Name, Demographics & Condition */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Patient Name, Age/Sex, ID & Ward */}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-teal-700 transition-colors flex items-baseline gap-1.5 truncate leading-snug">
                        <span className="truncate">{patient.name}</span>
                        <span className="text-xs text-slate-500 font-semibold shrink-0">
                          ({patient.age}{patient.sex[0]})
                        </span>
                      </h4>
                      <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="font-semibold text-slate-700">ID: {patient.patientId}</span>
                        <span>•</span>
                        <span className="text-slate-600 truncate">{patient.ward}</span>
                      </div>
                    </div>

                    {/* Right: Bed No & Condition Status Badge */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {/* Bed Badge */}
                      <span className="px-3 py-1 bg-slate-900 text-white font-mono font-black text-xs rounded-xl shadow-2xs flex items-center gap-1.5">
                        <BedDouble className="w-3.5 h-3.5 text-teal-400" />
                        <span>{patient.bed}</span>
                      </span>

                      {/* Condition / Status Badge */}
                      <div className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold flex items-center gap-1 shrink-0 whitespace-nowrap ${
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
                  </div>
                </div>

                {/* Card Footer: 2-Row View Patient Action */}
                <div className="bg-slate-50/90 px-4 py-3 border-t border-slate-100 flex flex-col gap-2">
                  <span className="text-xs font-semibold text-slate-500 group-hover:text-teal-700 transition-colors text-center sm:text-left">
                    Click to open full clinical profile
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPatient(patient);
                    }}
                    className="w-full flex items-center justify-center gap-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 group-hover:bg-teal-800 py-2.5 px-4 rounded-xl transition-all shadow-2xs cursor-pointer"
                  >
                    <span>View Patient</span>
                    <ChevronRight className="w-4 h-4" />
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

