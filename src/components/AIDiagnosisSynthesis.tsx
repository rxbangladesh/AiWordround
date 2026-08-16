import React from 'react';
import {
  Brain,
  Sparkles,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Pill,
  FileText,
  Clock,
  ArrowRight,
  RefreshCw,
  Layers,
  ChevronDown,
  ChevronUp,
  Stethoscope,
} from 'lucide-react';
import { Patient, InvestigationResult } from '../types';

interface AIDiagnosisSynthesisProps {
  patient: Patient;
  onUpdatePrimaryDiagnosis?: (patientId: string, newDiagnosis: string) => void;
  onOpenCapture?: () => void;
  isReadOnly?: boolean;
}

interface DifferentialItem {
  diagnosis: string;
  likelihood: string;
  rationale: string;
}

interface CorrelationItem {
  prescription: string;
  labFinding: string;
  clinicalSignificance: string;
}

interface LabTrendLatestToOldest {
  testName: string;
  latestResult: string;
  oldestResult: string;
  trajectory: 'WORSENING' | 'IMPROVING' | 'STABLE' | 'FLUCTUATING';
  valuesSortedLatestToOldest: Array<{
    date: string;
    time?: string;
    result: string;
    unit?: string;
    flag?: string;
  }>;
}

interface SynthesisResult {
  suggestedDiagnosisName: string;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'PROVISIONAL';
  clinicalSummary: string;
  differentials: DifferentialItem[];
  prescriptionLabCorrelations: CorrelationItem[];
  labTrendsLatestToOldest: LabTrendLatestToOldest[];
  recommendedNextSteps: string[];
}

export const AIDiagnosisSynthesis: React.FC<AIDiagnosisSynthesisProps> = ({
  patient,
  onUpdatePrimaryDiagnosis,
  onOpenCapture,
  isReadOnly = false,
}) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [data, setData] = React.useState<SynthesisResult | null>(null);
  const [dataSource, setDataSource] = React.useState<'gemini-ai' | 'local-engine'>('local-engine');
  const [error, setError] = React.useState<string | null>(null);
  const [applied, setApplied] = React.useState<boolean>(false);
  const [sortOrder, setSortOrder] = React.useState<'latestToOldest' | 'oldestToLatest'>('latestToOldest');
  const [expandedSection, setExpandedSection] = React.useState<'all' | 'differentials' | 'correlations' | 'trends'>('all');

  // Cache synthesis results by patientId
  const synthesisCacheRef = React.useRef<Record<string, { data: SynthesisResult; source: 'gemini-ai' | 'local-engine' }>>({});

  // Trigger synthesis request
  const fetchSynthesis = async (forceRefresh: boolean = false) => {
    if (!forceRefresh && synthesisCacheRef.current[patient.patientId]) {
      const cached = synthesisCacheRef.current[patient.patientId];
      setData(cached.data);
      setDataSource(cached.source);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/diagnosis/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate AI diagnosis synthesis');
      }

      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        const source = json.source === 'gemini-ai' ? 'gemini-ai' : 'local-engine';
        setDataSource(source);
        synthesisCacheRef.current[patient.patientId] = { data: json.data, source };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.warn('AI Diagnosis synthesis notice:', err.message);
      setError(err.message || 'Error synthesizing patient reports');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch synthesis when patient changes or if not in cache
  React.useEffect(() => {
    fetchSynthesis(false);
  }, [patient.patientId]);

  const handleApplyDiagnosis = () => {
    if (isReadOnly) return;
    if (data?.suggestedDiagnosisName && onUpdatePrimaryDiagnosis) {
      onUpdatePrimaryDiagnosis(patient.patientId, data.suggestedDiagnosisName);
      setApplied(true);
      setTimeout(() => setApplied(false), 3000);
    }
  };

  // Process all investigations for latest-to-oldest trend sorting
  const sortedInvestigations = React.useMemo(() => {
    const list = [...patient.investigations];
    if (sortOrder === 'latestToOldest') {
      return list.sort((a, b) => new Date(`${b.date} ${b.time || '00:00'}`).getTime() - new Date(`${a.date} ${a.time || '00:00'}`).getTime());
    } else {
      return list.sort((a, b) => new Date(`${a.date} ${a.time || '00:00'}`).getTime() - new Date(`${b.date} ${b.time || '00:00'}`).getTime());
    }
  }, [patient.investigations, sortOrder]);

  // Group lab parameters
  const labParametersGrouped = React.useMemo(() => {
    const map: Record<string, InvestigationResult[]> = {};
    patient.investigations.forEach((inv) => {
      if (!map[inv.testName]) map[inv.testName] = [];
      map[inv.testName].push(inv);
    });

    return Object.entries(map).map(([testName, items]) => {
      const sorted = [...items].sort((a, b) => new Date(`${b.date} ${b.time || '00:00'}`).getTime() - new Date(`${a.date} ${a.time || '00:00'}`).getTime());
      const latest = sorted[0];
      const oldest = sorted[sorted.length - 1];

      const numLatest = parseFloat(latest.result) || 0;
      const numOldest = parseFloat(oldest.result) || 0;

      let trajectory: 'WORSENING' | 'IMPROVING' | 'STABLE' = 'STABLE';
      if (numLatest > numOldest * 1.1) {
        trajectory = testName.toLowerCase().includes('hb') || testName.toLowerCase().includes('platelet') ? 'IMPROVING' : 'WORSENING';
      } else if (numLatest < numOldest * 0.9) {
        trajectory = testName.toLowerCase().includes('hb') || testName.toLowerCase().includes('platelet') ? 'WORSENING' : 'IMPROVING';
      }

      return {
        testName,
        latest,
        oldest,
        historyDesc: sorted,
        trajectory,
      };
    });
  }, [patient.investigations]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0 transition-all">
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5 w-full sm:w-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-400/20 text-teal-300 border border-teal-400/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-300 animate-pulse" />
              <span>{dataSource === 'gemini-ai' ? 'Gemini 3.7 AI Diagnostician' : 'Clinical Diagnostic Engine'}</span>
            </span>
            <span className="text-[11px] sm:text-xs text-slate-400 font-mono">
              {patient.documents.length} Docs • {patient.investigations.length} Labs • {patient.medications.length} Rx
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Brain className="w-5 h-5 text-teal-400 shrink-0" />
            <span>AI Diagnostic Synthesis & Chronological Lab Trends</span>
          </h3>
          <p className="text-xs text-slate-300">
            Synthesizes all photographed reports & prescriptions into a unified working diagnosis and latest-to-oldest parameter progression.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={() => fetchSynthesis(true)}
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2.5 min-h-[40px] rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing Reports...' : 'Re-Synthesize AI Diagnosis'}</span>
          </button>

          {onOpenCapture && (
            <button
              onClick={onOpenCapture}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3.5 py-2.5 min-h-[40px] rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-teal-300" />
              <span>+ Photo Report/Rx</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Body Content */}
      <div className="p-3 sm:p-5 space-y-4 sm:space-y-6 text-slate-900">
        {loading && (
          <div className="py-12 text-center space-y-3 bg-slate-50/80 rounded-2xl border border-dashed border-teal-200">
            <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">
                Synthesizing Photograph Extraction Data & Prescriptions...
              </p>
              <p className="text-xs text-slate-500">
                Correlating lab trajectory, medication orders, and clinical notes for {patient.name}.
              </p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchSynthesis}
              className="text-red-700 font-bold underline hover:text-red-900"
            >
              Retry
            </button>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-6">
            {/* 1. PRIMARY SUGGESTED DIAGNOSIS CARD */}
            <div className="bg-gradient-to-br from-teal-50 via-emerald-50/40 to-slate-50 p-5 rounded-2xl border border-teal-200/80 space-y-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-200/60 pb-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-md border border-teal-200">
                    AI Suggested Primary Diagnosis
                  </span>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-teal-700" />
                    <span>{data.suggestedDiagnosisName}</span>
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${
                      data.confidenceLevel === 'HIGH'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : data.confidenceLevel === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    {data.confidenceLevel} Confidence
                  </span>

                  <button
                    onClick={handleApplyDiagnosis}
                    disabled={applied || isReadOnly}
                    title={isReadOnly ? 'Admin Read-Only: Diagnostic modification restricted to doctors' : 'Set as patient working diagnosis'}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs ${
                      isReadOnly
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed opacity-80'
                        : applied
                        ? 'bg-emerald-700 text-white'
                        : 'bg-teal-700 hover:bg-teal-800 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isReadOnly ? 'Diagnosis Locked (Admin Read-Only)' : applied ? 'Updated in Record!' : 'Set as Patient Diagnosis'}</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {data.clinicalSummary}
              </p>
            </div>

            {/* 2. DIFFERENTIAL DIAGNOSES & PRESCRIPTION CORRELATION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Differential Diagnoses */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <span>Differential Diagnoses & Evidence</span>
                </h4>
                <div className="space-y-2">
                  {data.differentials.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{item.diagnosis}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                            item.likelihood === 'HIGH'
                              ? 'bg-amber-100 text-amber-900 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {item.likelihood} Likelihood
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">{item.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prescription & Lab Correlations */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-amber-600" />
                  <span>Prescription & Lab Integration Insights</span>
                </h4>
                <div className="space-y-2">
                  {data.prescriptionLabCorrelations.length > 0 ? (
                    data.prescriptionLabCorrelations.map((corr, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-amber-950">
                          <span>💊 {corr.prescription}</span>
                          <span className="text-[11px] font-mono text-teal-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                            {corr.labFinding}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700">{corr.clinicalSignificance}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic p-3">No direct prescription-lab interactions detected.</p>
                  )}
                </div>
              </div>
            </div>

            {/* 3. CHRONOLOGICAL LAB REPORT TRENDS (LATEST TO OLDEST) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <h4 className="text-sm font-bold text-slate-900">
                      Chronological Lab Report Trends (Latest to Oldest)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Trajectory across photographed & extracted laboratory reports ({patient.investigations.length} recorded tests)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-600">Sort Sequence:</span>
                  <button
                    onClick={() => setSortOrder('latestToOldest')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                      sortOrder === 'latestToOldest'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    Latest → Oldest (Desc) ↓
                  </button>
                  <button
                    onClick={() => setSortOrder('oldestToLatest')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                      sortOrder === 'oldestToLatest'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    Oldest → Latest (Asc) ↑
                  </button>
                </div>
              </div>

              {/* Trajectory Highlights Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {labParametersGrouped.map((param) => {
                  const isWorsening = param.trajectory === 'WORSENING';
                  const isImproving = param.trajectory === 'IMPROVING';

                  return (
                    <div
                      key={param.testName}
                      className={`p-3.5 rounded-xl border space-y-2 text-xs transition-all ${
                        isWorsening
                          ? 'bg-red-50/50 border-red-200'
                          : isImproving
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 text-sm">{param.testName}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                            isWorsening
                              ? 'bg-red-100 text-red-900 border-red-300'
                              : isImproving
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-slate-200 text-slate-800 border-slate-300'
                          }`}
                        >
                          {isWorsening ? <TrendingUp className="w-3 h-3 text-red-600" /> : <TrendingDown className="w-3 h-3 text-emerald-600" />}
                          <span>{param.trajectory}</span>
                        </span>
                      </div>

                      {/* Timeline Sequence */}
                      <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-1 font-mono">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 text-[10px]">LATEST ({param.latest.date}):</span>
                          <span className={`font-bold text-xs ${param.latest.flag === 'CRITICAL' ? 'text-red-700 font-black' : 'text-slate-900'}`}>
                            {param.latest.result} {param.latest.unit}
                          </span>
                        </div>
                        {param.historyDesc.length > 1 && (
                          <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-1">
                            <span className="text-[10px]">OLDEST ({param.oldest.date}):</span>
                            <span>{param.oldest.result} {param.oldest.unit}</span>
                          </div>
                        )}
                      </div>

                      {/* Sequence String */}
                      <div className="text-[10px] text-slate-600 truncate font-mono">
                        Sequence: {param.historyDesc.map((h) => `${h.result}`).join(' → ')} {param.latest.unit}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Timestamped Investigation Log Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase">
                      <th className="p-2.5">Date & Time ({sortOrder === 'latestToOldest' ? 'Newest ↓' : 'Oldest ↑'})</th>
                      <th className="p-2.5">Test Parameter</th>
                      <th className="p-2.5">Extracted Result</th>
                      <th className="p-2.5">Reference Range</th>
                      <th className="p-2.5">Status Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sortedInvestigations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono text-slate-600 font-medium">
                          {inv.date} {inv.time || ''}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">{inv.testName}</td>
                        <td className="p-2.5 font-mono font-bold text-teal-800 text-sm">
                          {inv.result} {inv.unit}
                        </td>
                        <td className="p-2.5 text-slate-500">{inv.referenceRange}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                              inv.flag === 'CRITICAL'
                                ? 'bg-red-100 text-red-900 border border-red-300'
                                : inv.flag === 'HIGH'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : inv.flag === 'LOW'
                                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}
                          >
                            {inv.flag || 'NORMAL'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. RECOMMENDED CLINICAL PLAN */}
            <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Recommended Diagnostic & Management Plan</span>
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                {data.recommendedNextSteps.map((step, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 flex items-start gap-2"
                  >
                    <span className="text-teal-400 font-bold shrink-0">{idx + 1}.</span>
                    <span className="text-slate-200">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
