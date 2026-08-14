import React from 'react';
import { 
  LogOut, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle2, 
  Printer, 
  RotateCcw, 
  ExternalLink, 
  Archive, 
  Building2, 
  Clock, 
  Activity, 
  HeartPulse, 
  Stethoscope, 
  X,
  FileCheck2,
  AlertTriangle,
  ChevronRight,
  Pill,
  Users
} from 'lucide-react';
import { Patient, DischargeData, UserAccount } from '../types';

interface DischargeListViewProps {
  patients: Patient[];
  currentUser?: UserAccount | null;
  onSelectPatient: (patient: Patient) => void;
  onReadmitPatient: (patientId: string) => void;
  onNavigateToDashboard?: () => void;
}

export const DischargeListView: React.FC<DischargeListViewProps> = ({
  patients,
  currentUser,
  onSelectPatient,
  onReadmitPatient,
  onNavigateToDashboard,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCondition, setSelectedCondition] = React.useState<string>('ALL');
  const [selectedWard, setSelectedWard] = React.useState<string>('ALL');
  const [selectedDoctor, setSelectedDoctor] = React.useState<string>('ALL');
  const [viewMode, setViewMode] = React.useState<'CARDS' | 'TABLE'>('CARDS');
  const [selectedPrintPatient, setSelectedPrintPatient] = React.useState<Patient | null>(null);
  const [readmitConfirmPatient, setReadmitConfirmPatient] = React.useState<Patient | null>(null);

  // Filter ONLY discharged patients
  const dischargedPatients = React.useMemo(() => {
    return patients.filter((p) => p.status === 'DISCHARGED');
  }, [patients]);

  // Extract unique wards and consultants from discharged patients
  const availableWards = React.useMemo(() => {
    const set = new Set<string>();
    dischargedPatients.forEach((p) => {
      if (p.ward) set.add(p.ward);
    });
    return Array.from(set);
  }, [dischargedPatients]);

  const availableDoctors = React.useMemo(() => {
    const set = new Set<string>();
    dischargedPatients.forEach((p) => {
      if (p.dischargeData?.dischargedBy) set.add(p.dischargeData.dischargedBy);
      else if (p.consultant) set.add(p.consultant);
    });
    return Array.from(set);
  }, [dischargedPatients]);

  // Filter and sort discharged patients
  const filteredDischarged = React.useMemo(() => {
    return dischargedPatients.filter((p) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchId = p.patientId.toLowerCase().includes(q);
        const matchDiag = p.primaryDiagnosis.toLowerCase().includes(q);
        const matchSummary = p.dischargeData?.dischargeSummary.toLowerCase().includes(q) || false;
        const matchDoctor = p.dischargeData?.dischargedBy?.toLowerCase().includes(q) || p.consultant.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchDiag && !matchSummary && !matchDoctor) {
          return false;
        }
      }

      // Condition filter
      if (selectedCondition !== 'ALL') {
        if (p.dischargeData?.conditionOnDischarge !== selectedCondition) {
          return false;
        }
      }

      // Ward filter
      if (selectedWard !== 'ALL') {
        if (p.ward !== selectedWard) return false;
      }

      // Doctor filter
      if (selectedDoctor !== 'ALL') {
        const docName = p.dischargeData?.dischargedBy || p.consultant;
        if (docName !== selectedDoctor) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort newest discharge date first
      const dateA = a.dischargeData?.dischargeDate || a.admissionDate;
      const dateB = b.dischargeData?.dischargeDate || b.admissionDate;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [dischargedPatients, searchQuery, selectedCondition, selectedWard, selectedDoctor]);

  // Summary statistics
  const stats = React.useMemo(() => {
    const total = dischargedPatients.length;
    const recoveredCount = dischargedPatients.filter(
      (p) => p.dischargeData?.conditionOnDischarge === 'RECOVERED' || p.dischargeData?.conditionOnDischarge === 'IMPROVED'
    ).length;
    const recoveredPercent = total > 0 ? Math.round((recoveredCount / total) * 100) : 0;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const todayDischarged = dischargedPatients.filter(
      (p) => p.dischargeData?.dischargeDate === todayStr
    ).length;

    const amaCount = dischargedPatients.filter(
      (p) => p.dischargeData?.conditionOnDischarge === 'AGAINST_MEDICAL_ADVICE'
    ).length;

    return { total, recoveredCount, recoveredPercent, todayDischarged, amaCount };
  }, [dischargedPatients]);

  const getConditionBadge = (condition?: DischargeData['conditionOnDischarge']) => {
    switch (condition) {
      case 'RECOVERED':
        return {
          label: 'Recovered',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500'
        };
      case 'IMPROVED':
        return {
          label: 'Improved',
          bg: 'bg-teal-50 text-teal-800 border-teal-300',
          dot: 'bg-teal-500'
        };
      case 'STABLE':
        return {
          label: 'Stable / Asymptomatic',
          bg: 'bg-blue-50 text-blue-800 border-blue-300',
          dot: 'bg-blue-500'
        };
      case 'TRANSFERRED':
        return {
          label: 'Transferred Out',
          bg: 'bg-purple-50 text-purple-800 border-purple-300',
          dot: 'bg-purple-500'
        };
      case 'AGAINST_MEDICAL_ADVICE':
        return {
          label: 'AMA (Against Advice)',
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          dot: 'bg-rose-500'
        };
      default:
        return {
          label: 'Discharged',
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          dot: 'bg-slate-500'
        };
    }
  };

  const calculateStayDays = (admDate: string, disDate?: string) => {
    if (!disDate) return 'N/A';
    try {
      const diffTime = Math.abs(new Date(disDate).getTime() - new Date(admDate).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${Math.max(1, diffDays)} day${diffDays === 1 ? '' : 's'}`;
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="p-3 sm:p-5 lg:p-6 space-y-5 max-w-[1600px] mx-auto text-slate-900">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-400/30 flex items-center gap-1">
                <Archive className="w-3 h-3" />
                <span>Archive Registry</span>
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {stats.total} Total Released Records
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Discharge & Released Patients</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Dedicated repository for all discharged inpatients. Securely archives discharge summaries, outpatient follow-up instructions, final investigation trends, and re-admission capabilities.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:self-start md:self-center shrink-0">
            {onNavigateToDashboard && (
              <button
                onClick={onNavigateToDashboard}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-teal-300" />
                <span>Active Inpatients Roster</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 mt-5 pt-4 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 sm:p-3">
            <div className="text-[10px] sm:text-xs font-semibold text-slate-300 flex items-center gap-1">
              <LogOut className="w-3.5 h-3.5 text-teal-400" />
              <span>Total Discharged</span>
            </div>
            <div className="text-lg sm:text-xl font-black text-white mt-1">
              {stats.total}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Archived patient files
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 sm:p-3">
            <div className="text-[10px] sm:text-xs font-semibold text-slate-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recovered / Improved</span>
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-300 mt-1">
              {stats.recoveredPercent}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {stats.recoveredCount} of {stats.total} patients
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 sm:p-3">
            <div className="text-[10px] sm:text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Today's Discharges</span>
            </div>
            <div className="text-lg sm:text-xl font-black text-cyan-300 mt-1">
              {stats.todayDischarged}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Processed today
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 sm:p-3">
            <div className="text-[10px] sm:text-xs font-semibold text-slate-300 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>AMA Discharges</span>
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-300 mt-1">
              {stats.amaCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Against medical advice
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, MRN/ID, diagnosis, discharge note, or discharging doctor..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('CARDS')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                viewMode === 'CARDS'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Card View
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table View
            </button>
          </div>
        </div>

        {/* Filter Chips & Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-xs">
          <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Condition:</span>
          </span>

          {['ALL', 'RECOVERED', 'IMPROVED', 'STABLE', 'TRANSFERRED', 'AGAINST_MEDICAL_ADVICE'].map((cond) => {
            const isSelected = selectedCondition === cond;
            const labelMap: Record<string, string> = {
              ALL: 'All Statuses',
              RECOVERED: 'Recovered',
              IMPROVED: 'Improved',
              STABLE: 'Stable',
              TRANSFERRED: 'Transferred',
              AGAINST_MEDICAL_ADVICE: 'AMA',
            };

            return (
              <button
                key={cond}
                onClick={() => setSelectedCondition(cond)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-700 text-white shadow-2xs font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {labelMap[cond] || cond}
              </button>
            );
          })}

          {availableWards.length > 1 && (
            <div className="ml-auto flex items-center gap-2">
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="ALL">All Wards</option>
                {availableWards.map((w) => (
                  <option key={w} value={w}>{w.split('-')[0]}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Discharged Patients Content */}
      {filteredDischarged.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto shadow-2xs">
            <Archive className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900">
              {dischargedPatients.length === 0 
                ? "No Discharged Patients Yet" 
                : "No Matching Discharged Records Found"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {dischargedPatients.length === 0
                ? "When a patient is discharged or released from their patient profile, their full medical file and release summary will appear strictly in this section."
                : "Try clearing your search query or adjusting the condition filter above."}
            </p>
          </div>

          {onNavigateToDashboard && (
            <button
              onClick={onNavigateToDashboard}
              className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>Go to Active Inpatients Roster</span>
            </button>
          )}
        </div>
      ) : viewMode === 'CARDS' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredDischarged.map((patient) => {
            const discharge = patient.dischargeData;
            const badge = getConditionBadge(discharge?.conditionOnDischarge);
            const stayDuration = calculateStayDays(patient.admissionDate, discharge?.dischargeDate);

            return (
              <div
                key={patient.patientId}
                className="bg-white border border-slate-200 hover:border-teal-300 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between"
              >
                {/* Card Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 hover:text-teal-700 transition-colors">
                          {patient.name}
                        </h3>
                        <span className="text-xs font-semibold text-slate-500">
                          ({patient.age}{patient.sex[0]})
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[10px] font-bold text-slate-700">
                          {patient.patientId}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1 flex-wrap">
                        <span>{patient.ward.split('-')[0]}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-700">Prev: {patient.bed}</span>
                        <span>•</span>
                        <span>Stay: <strong className="text-slate-800">{stayDuration}</strong></span>
                      </div>
                    </div>

                    {/* Condition Badge */}
                    <div className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 shrink-0 ${badge.bg}`}>
                      <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                    </div>
                  </div>

                  {/* Primary Diagnosis */}
                  <div className="bg-slate-50/90 border border-slate-200 p-3 rounded-xl space-y-1 text-xs">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      DIAGNOSIS:
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {patient.primaryDiagnosis}
                    </div>
                  </div>
                </div>

                {/* Discharge Summary & Latest Record */}
                {discharge && (
                  <div className="space-y-2 text-xs bg-teal-50/60 border border-teal-200/80 rounded-xl p-3">
                    <div className="flex items-center justify-between text-[11px] text-teal-950 font-bold border-b border-teal-200/60 pb-1.5 flex-wrap gap-1">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-700" />
                        <span>DISCHARGE RECORD: {discharge.dischargeDate} ({discharge.dischargedAt})</span>
                      </div>
                      <div className="text-slate-600 font-medium">
                        by <strong className="text-slate-900">{discharge.dischargedBy || patient.consultant}</strong>
                      </div>
                    </div>

                    <div className="text-slate-800 text-xs leading-relaxed">
                      <strong>Course & Summary:</strong> {discharge.dischargeSummary}
                    </div>

                    {discharge.followUpInstructions && (
                      <div className="text-teal-950 text-[11px] font-medium pt-1.5 border-t border-teal-200/60 flex items-start gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                        <span><strong>Follow-Up Advice:</strong> {discharge.followUpInstructions}</span>
                      </div>
                    )}

                    {/* Archived Investigations & Docs */}
                    {(patient.investigations?.length > 0 || patient.documents?.length > 0) && (
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600 flex-wrap">
                        <span className="font-semibold text-slate-500">Archived:</span>
                        {patient.investigations?.length > 0 && (
                          <span className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                            📊 {patient.investigations.length} Lab Tests
                          </span>
                        )}
                        {patient.documents?.length > 0 && (
                          <span className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                            📄 {patient.documents.length} OCR Docs
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Card Actions Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectPatient(patient)}
                      className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                      title="View complete medical history, lab trends, and notes"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Stored File</span>
                    </button>

                    <button
                      onClick={() => setSelectedPrintPatient(patient)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all border border-slate-200 cursor-pointer flex items-center gap-1.5"
                      title="Print or export official discharge certificate"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Print Slip</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setReadmitConfirmPatient(patient)}
                    className="px-2.5 py-1.5 rounded-lg text-teal-800 hover:text-teal-900 hover:bg-teal-50 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    title="Restore patient back into active ward inpatients"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-teal-700" />
                    <span>Re-Admit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Patient / ID</th>
                  <th className="py-3 px-3">Ward & Stay</th>
                  <th className="py-3 px-3">Discharge Diagnosis</th>
                  <th className="py-3 px-3">Condition</th>
                  <th className="py-3 px-3">Discharge Date & Dr</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredDischarged.map((patient) => {
                  const discharge = patient.dischargeData;
                  const badge = getConditionBadge(discharge?.conditionOnDischarge);
                  const stay = calculateStayDays(patient.admissionDate, discharge?.dischargeDate);

                  return (
                    <tr key={patient.patientId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{patient.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {patient.patientId} • {patient.age}{patient.sex[0]}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div>{patient.ward.split('-')[0]}</div>
                        <div className="text-[11px] text-slate-500 font-mono">Stay: {stay}</div>
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <div className="line-clamp-2 font-medium">{patient.primaryDiagnosis}</div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border inline-flex items-center gap-1 ${badge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{discharge?.dischargeDate || patient.admissionDate}</div>
                        <div className="text-[11px] text-slate-500">
                          {discharge?.dischargedBy || patient.consultant}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectPatient(patient)}
                            className="px-2.5 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px] transition-all"
                          >
                            View File
                          </button>
                          <button
                            onClick={() => setSelectedPrintPatient(patient)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                            title="Print Slip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setReadmitConfirmPatient(patient)}
                            className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-50"
                            title="Re-Admit"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINTABLE DISCHARGE SUMMARY SLIP MODAL */}
      {selectedPrintPatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">
                  Official Medical Discharge Slip Preview
                </h3>
              </div>
              <button
                onClick={() => setSelectedPrintPatient(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Document Paper */}
            <div className="p-6 sm:p-8 space-y-6 text-slate-900 bg-white" id="printable-discharge-slip">
              {/* Hospital Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-slate-900">
                  Apex Medical Center & Research Hospital
                </h2>
                <p className="text-xs text-slate-600 font-semibold">
                  Department of Internal Medicine & Subspecialties • Inpatient Discharge Certificate
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Tel: +1 (555) 019-2834 • Emergency: Ext 999 • MRN Archive ID: {selectedPrintPatient.patientId}
                </p>
              </div>

              {/* Patient Demographics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Patient Name:</span>
                  <p className="font-bold text-slate-900">{selectedPrintPatient.name}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Age / Sex:</span>
                  <p className="font-bold text-slate-900">{selectedPrintPatient.age} Yrs / {selectedPrintPatient.sex}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Admission Date:</span>
                  <p className="font-bold text-slate-900">{selectedPrintPatient.admissionDate}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Discharge Date:</span>
                  <p className="font-bold text-teal-800">
                    {selectedPrintPatient.dischargeData?.dischargeDate || 'Today'}
                  </p>
                </div>
              </div>

              {/* Diagnosis & Condition */}
              <div className="space-y-3 text-xs">
                <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Primary Discharge Diagnosis:
                  </span>
                  <p className="text-sm font-black text-slate-900">
                    {selectedPrintPatient.primaryDiagnosis}
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Condition on Discharge:
                  </span>
                  <p className="text-xs font-bold text-teal-900">
                    {selectedPrintPatient.dischargeData?.conditionOnDischarge || 'IMPROVED'}
                  </p>
                </div>

                {/* Hospital Course & Summary */}
                <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Summary of Hospital Course & Treatment:
                  </span>
                  <p className="text-xs leading-relaxed text-slate-800">
                    {selectedPrintPatient.dischargeData?.dischargeSummary || selectedPrintPatient.lastUpdate}
                  </p>
                </div>

                {/* Discharge Medications */}
                {selectedPrintPatient.medications && selectedPrintPatient.medications.length > 0 && (
                  <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Pill className="w-3 h-3 text-teal-700" />
                      <span>Discharge Medications & Regimen:</span>
                    </span>
                    <div className="space-y-1">
                      {selectedPrintPatient.medications.map((m, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-0.5 border-b border-slate-100 last:border-0">
                          <span className="font-bold text-slate-900">{m.drugName}</span>
                          <span className="text-slate-600 font-mono">{m.dose} • {m.route} • {m.frequency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow up & Advice */}
                <div className="border border-slate-200 rounded-xl p-3 bg-amber-50/50 space-y-1">
                  <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider">
                    Follow-Up Instructions & Urgent Warning Signs:
                  </span>
                  <p className="text-xs leading-relaxed text-slate-800">
                    {selectedPrintPatient.dischargeData?.followUpInstructions || 'Follow up in OPD in 2 weeks. Return immediately if symptoms worsen.'}
                  </p>
                </div>
              </div>

              {/* Signatures Footer */}
              <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs">
                <div>
                  <div className="h-10 border-b border-slate-300"></div>
                  <p className="font-bold text-slate-900 mt-1">Patient / Guardian Signature</p>
                  <p className="text-[10px] text-slate-500">Acknowledged receipt of discharge advice</p>
                </div>

                <div className="text-right">
                  <div className="h-10 border-b border-slate-300 flex items-end justify-end pb-1 font-mono text-teal-900 font-bold italic">
                    {selectedPrintPatient.dischargeData?.dischargedBy || selectedPrintPatient.consultant}
                  </div>
                  <p className="font-bold text-slate-900 mt-1">Discharging Medical Officer / Consultant</p>
                  <p className="text-[10px] text-slate-500">Apex Medical Center</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedPrintPatient(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Close Preview
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RE-ADMIT CONFIRMATION MODAL */}
      {readmitConfirmPatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900">
                Re-Admit Patient to Ward?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to re-admit <strong className="text-slate-900">{readmitConfirmPatient.name}</strong> ({readmitConfirmPatient.patientId}) back into active ward inpatients?
              </p>
              <p className="text-[11px] text-teal-800 bg-teal-50 p-2.5 rounded-xl border border-teal-200 font-medium">
                This will move the patient from the Discharged section back to your active Bed Roster with status set to ACTIVE.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setReadmitConfirmPatient(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onReadmitPatient(readmitConfirmPatient.patientId);
                  setReadmitConfirmPatient(null);
                }}
                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                Confirm Re-Admission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
