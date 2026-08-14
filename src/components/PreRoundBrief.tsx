import React from 'react';
import { 
  ClipboardList, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Zap, 
  ChevronRight, 
  ShieldCheck,
  RefreshCw,
  Search,
  Check
} from 'lucide-react';
import { Patient, PriorityLevel, PreRoundBriefSummary } from '../types';

interface PreRoundBriefProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onOpenRoundMode: () => void;
}

export const PreRoundBrief: React.FC<PreRoundBriefProps> = ({
  patients,
  onSelectPatient,
  onOpenRoundMode,
}) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [aiSummaries, setAiSummaries] = React.useState<PreRoundBriefSummary[]>([]);
  const [dataSource, setDataSource] = React.useState<'gemini-ai' | 'local-engine'>('local-engine');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const hasFetchedRef = React.useRef(false);

  // Only active inpatients in Pre-Round Brief
  const activePatients = React.useMemo(() => {
    return patients.filter((p) => p.status !== 'DISCHARGED');
  }, [patients]);

  // Generate brief on button click or initial mount
  const generateBrief = React.useCallback(async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/brief/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patients: activePatients }),
      });
      const data = await response.json();
      if (data.success && data.summaries) {
        setAiSummaries(data.summaries);
        if (data.source) {
          setDataSource(data.source);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch AI pre-round brief:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [activePatients]);

  React.useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      generateBrief();
    }
  }, [generateBrief]);

  // Sort patients by priority
  const sortedPatients = React.useMemo(() => {
    const priorityRank: Record<PriorityLevel, number> = {
      CRITICAL: 1,
      ACTION: 2,
      REVIEW: 3,
      STABLE: 4,
    };
    return [...activePatients].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  }, [activePatients]);

  const copyPatientSummary = (p: Patient) => {
    const text = `BED: ${p.bed} - ${p.name} (${p.age}${p.sex[0]})
LAST UPDATE: ${p.lastUpdate}
DIAGNOSIS: ${p.primaryDiagnosis}
PROBLEMS: ${(p.activeProblems || []).join(', ')}
PENDING INVS: ${(p.pendingInvestigations || []).join(', ')}
TODAY'S PRIORITY: ${p.todayPriority}
TODAY'S PLAN: ${p.todayPlan}`;
    navigator.clipboard.writeText(text);
    setCopiedId(p.patientId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto text-slate-900">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-md text-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Pre-Round Ward Executive Brief
            </span>
            <span className="text-xs text-slate-400">
              {patients.length} Ward Patients Reviewed
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
            Pre-Round Clinical Brief
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Prioritized by clinical severity. Deteriorations, worsening lab trends, and pending acute actions listed first.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={generateBrief}
            disabled={isGenerating}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/40 px-4 py-2.5 min-h-[40px] rounded-xl font-bold text-xs shadow-xs transition-all whitespace-nowrap cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Analyzing Ward...' : 'START / REFRESH BRIEF'}</span>
          </button>

          <button
            onClick={onOpenRoundMode}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold px-4 py-2.5 min-h-[40px] rounded-xl text-xs shadow-xs transition-all hover:brightness-110 whitespace-nowrap cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>ENTER ROUND MODE</span>
          </button>
        </div>
      </div>

      {/* Safety Mandatory Disclaimer Box */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed font-medium">
          <span className="font-bold">MANDATORY CLINICAL DISCLAIMER:</span>{' '}
          AI-generated summary — verify against the original record before clinical decision-making. Extract accurately. Never guess. Always verify before saving.
        </div>
      </div>

      {/* Pre-Round Brief List */}
      <div className="space-y-4">
        {sortedPatients.map((patient, index) => {
          const isCritical = patient.priority === 'CRITICAL';
          const isAction = patient.priority === 'ACTION';

          return (
            <div
              key={patient.patientId}
              className={`rounded-2xl border shadow-xs overflow-hidden transition-all bg-white ${
                isCritical
                  ? 'border-red-300 hover:border-red-500'
                  : isAction
                  ? 'border-amber-300 hover:border-amber-500'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Patient Title Bar: 2-column layout */}
              <div className={`p-3.5 sm:p-4 flex items-start justify-between gap-3 border-b ${
                isCritical ? 'bg-red-50/80 border-red-200' :
                isAction ? 'bg-amber-50/80 border-amber-200' :
                'bg-slate-100/80 border-slate-200'
              }`}>
                {/* Left Column: Patient Name & ID */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      #{index + 1}
                    </span>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 truncate">
                      {patient.name}
                    </h3>
                    <span className="text-xs text-slate-500 font-semibold shrink-0">({patient.age}{patient.sex[0]})</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="font-semibold text-slate-600">ID: {patient.patientId}</span>
                    <span>•</span>
                    <span>Ward: {patient.ward.split('-')[0]}</span>
                  </div>
                </div>

                {/* Right Column: Bed Number & Clinical Condition */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 bg-white border border-slate-300 font-mono font-black text-xs text-teal-900 rounded-lg shadow-2xs">
                      {patient.bed}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold border whitespace-nowrap ${
                      isCritical ? 'bg-red-100 text-red-800 border-red-300 animate-pulse' :
                      isAction ? 'bg-amber-100 text-amber-800 border-amber-300' :
                      patient.priority === 'REVIEW' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                      'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {patient.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => copyPatientSummary(patient)}
                      className="p-1.5 text-xs text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                      title="Copy Patient Summary to Clipboard"
                    >
                      {copiedId === patient.patientId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[10px] text-emerald-700 font-bold whitespace-nowrap">Copied</span>
                        </>
                      ) : (
                        <span className="text-[10px] font-semibold whitespace-nowrap">Copy Brief</span>
                      )}
                    </button>

                    <button
                      onClick={() => onSelectPatient(patient)}
                      className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-0.5 shadow-2xs whitespace-nowrap"
                    >
                      <span>Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Brief Content - Ordered STRICTLY as requested */}
              <div className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-4">
                {/* 1. LAST UPDATE (MUST COME FIRST!) */}
                <div className={`p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm space-y-1.5 ${
                  isCritical
                    ? 'bg-red-50/85 border-red-200 text-red-950'
                    : isAction
                    ? 'bg-amber-50/85 border-amber-200 text-amber-950'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5 text-amber-800">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>1. LAST UPDATE / CLINICAL TREND</span>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                      isCritical
                        ? 'bg-red-100/90 text-red-800 border-red-300'
                        : isAction
                        ? 'bg-amber-100/90 text-amber-900 border-amber-300'
                        : 'bg-slate-200/80 text-slate-700 border-slate-300'
                    }`}>
                      Priority Review Item
                    </span>
                  </div>
                  <p className="font-extrabold text-sm sm:text-base leading-snug sm:leading-relaxed text-slate-900">
                    {patient.lastUpdate}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs">
                  {/* 2. CURRENT PROBLEMS */}
                  <div className="bg-slate-50/90 p-3 sm:p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>2. Current Active Problems</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-800">
                      {(patient.activeProblems || []).map((prob, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-teal-600 font-bold">•</span>
                          <span className="font-medium leading-relaxed">{prob}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 3. WORKING DIAGNOSIS */}
                  <div className="bg-slate-50/90 p-3 sm:p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                      3. Working Diagnosis
                    </div>
                    <p className="font-bold text-teal-900 text-sm leading-snug">
                      {patient.primaryDiagnosis}
                    </p>
                    {patient.differentialDiagnoses && patient.differentialDiagnoses.length > 0 && (
                      <div className="text-[11px] text-slate-600 pt-1.5 border-t border-slate-200">
                        <span className="font-semibold text-slate-700">Differential:</span>{' '}
                        {patient.differentialDiagnoses.join(' • ')}
                      </div>
                    )}
                  </div>

                  {/* 4. INVESTIGATION STATUS */}
                  <div className="bg-slate-50/90 p-3 sm:p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                      4. Investigation Status & Pending Labs
                    </div>
                    {patient.pendingInvestigations && patient.pendingInvestigations.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {patient.pendingInvestigations.map((inv, i) => (
                          <span
                            key={i}
                            className="bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 shadow-2xs"
                          >
                            ⏳ {inv}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-xs italic">No urgent investigations pending</p>
                    )}
                  </div>

                  {/* 5. TODAY'S PRIORITY & 6. TODAY'S PLAN */}
                  <div className="bg-slate-50/90 p-3 sm:p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                      5. Today's Priority & Plan
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="font-bold text-amber-800 text-[11px] uppercase tracking-wider">Focus Priority: </span>
                        <p className="text-slate-900 font-bold text-xs mt-0.5">{patient.todayPriority}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-200">
                        <span className="font-bold text-teal-800 text-[11px] uppercase tracking-wider">Clinical Action Plan: </span>
                        <p className="text-slate-800 whitespace-pre-line text-xs font-medium mt-0.5 leading-relaxed">{patient.todayPlan}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
