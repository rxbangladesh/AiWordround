import React from 'react';
import { 
  User, 
  Clock, 
  AlertTriangle, 
  Activity, 
  FileText, 
  Plus, 
  Calendar, 
  ChevronLeft, 
  TrendingUp, 
  Pill, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  GitCompare,
  Pin,
  Trash2,
  Copy,
  Check,
  Search,
  StickyNote,
  MessageSquare,
  Tag,
  LogOut,
  Archive,
  Share2,
  Zap
} from 'lucide-react';
import { Patient, DailyRound, InvestigationResult, Medication, ClinicalNote } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AIDiagnosisSynthesis } from './AIDiagnosisSynthesis';
import { SharePatientModal } from './SharePatientModal';

interface PatientProfileProps {
  patient: Patient;
  onBack: () => void;
  onOpenAddRoundNote: (patient: Patient) => void;
  onOpenCapture: (patient?: Patient) => void;
  onOpenDischargeModal?: (patient: Patient) => void;
  onReadmitPatient?: (patientId: string) => void;
  onAddClinicalNote?: (patientId: string, note: { content: string; author: string; category: ClinicalNote['category']; isPinned?: boolean }) => void;
  onDeleteClinicalNote?: (patientId: string, noteId: string) => void;
  onTogglePinClinicalNote?: (patientId: string, noteId: string) => void;
  onAddPendingInvestigation?: (patientId: string, testName: string) => void;
  onRemovePendingInvestigation?: (patientId: string, testName: string) => void;
  onFulfillPendingInvestigation?: (
    patientId: string,
    pendingTestName: string,
    resultData: Omit<InvestigationResult, 'id'>
  ) => void;
  onUpdatePrimaryDiagnosis?: (patientId: string, newDiagnosis: string) => void;
}

export const PatientProfile: React.FC<PatientProfileProps> = ({
  patient,
  onBack,
  onOpenAddRoundNote,
  onOpenCapture,
  onOpenDischargeModal,
  onReadmitPatient,
  onAddClinicalNote,
  onDeleteClinicalNote,
  onTogglePinClinicalNote,
  onAddPendingInvestigation,
  onRemovePendingInvestigation,
  onFulfillPendingInvestigation,
  onUpdatePrimaryDiagnosis,
}) => {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'history' | 'notes' | 'rounds' | 'trends' | 'meds' | 'docs'>('overview');
  const [selectedLabTest, setSelectedLabTest] = React.useState<string>('Creatinine');
  const [compareRound, setCompareRound] = React.useState<{ current: DailyRound; previous: DailyRound | null } | null>(null);

  // Pending Investigations state & modal
  const [newPendingInvName, setNewPendingInvName] = React.useState<string>('');
  const [fulfillModalOpen, setFulfillModalOpen] = React.useState<boolean>(false);
  const [targetPendingItem, setTargetPendingItem] = React.useState<string>('');
  
  // Fulfill Report Form state
  const [reportTestName, setReportTestName] = React.useState<string>('');
  const [reportResult, setReportResult] = React.useState<string>('');
  const [reportNumericValue, setReportNumericValue] = React.useState<string>('');
  const [reportUnit, setReportUnit] = React.useState<string>('mg/dL');
  const [reportReferenceRange, setReportReferenceRange] = React.useState<string>('0.6 - 1.2');
  const [reportCategory, setReportCategory] = React.useState<InvestigationResult['category']>('RFT');
  const [reportFlag, setReportFlag] = React.useState<InvestigationResult['flag']>('NORMAL');

  // Clinical Notes local state & filters
  const [localNotes, setLocalNotes] = React.useState<ClinicalNote[]>(patient.clinicalNotes || []);
  const [noteCategoryFilter, setNoteCategoryFilter] = React.useState<string>('ALL');
  const [noteSearchQuery, setNoteSearchQuery] = React.useState<string>('');
  
  // New Note Form state
  const [newNoteContent, setNewNoteContent] = React.useState<string>('');
  const [newNoteAuthor, setNewNoteAuthor] = React.useState<string>('Dr. Sarah Jenkins');
  const [newNoteCategory, setNewNoteCategory] = React.useState<ClinicalNote['category']>('Observation');
  const [newNoteIsPinned, setNewNoteIsPinned] = React.useState<boolean>(false);
  const [copiedNoteId, setCopiedNoteId] = React.useState<string | null>(null);

  // Handlers for Pending Investigations
  const handleAddPendingInv = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newPendingInvName.trim()) return;
    if (onAddPendingInvestigation) {
      onAddPendingInvestigation(patient.patientId, newPendingInvName.trim());
    }
    setNewPendingInvName('');
  };

  const handleOpenFulfillModal = (pendingName: string) => {
    setTargetPendingItem(pendingName);
    setReportTestName(pendingName);
    setReportResult('');
    setReportNumericValue('');
    const lower = pendingName.toLowerCase();
    if (lower.includes('cbc') || lower.includes('hb') || lower.includes('platelet') || lower.includes('wbc')) {
      setReportCategory('CBC');
      setReportUnit('g/dL');
      setReportReferenceRange('12.0 - 15.5');
    } else if (lower.includes('creatinine') || lower.includes('urea') || lower.includes('rft') || lower.includes('renal')) {
      setReportCategory('RFT');
      setReportUnit('mg/dL');
      setReportReferenceRange('0.6 - 1.2');
    } else if (lower.includes('lft') || lower.includes('bilirubin') || lower.includes('sgot') || lower.includes('sgpt') || lower.includes('ast') || lower.includes('alt')) {
      setReportCategory('LFT');
      setReportUnit('mg/dL');
      setReportReferenceRange('0.2 - 1.2');
    } else if (lower.includes('potassium') || lower.includes('sodium') || lower.includes('electrolyte')) {
      setReportCategory('ELECTROLYTES');
      setReportUnit('mEq/L');
      setReportReferenceRange('3.5 - 5.0');
    } else if (lower.includes('usg') || lower.includes('ct') || lower.includes('x-ray') || lower.includes('xray') || lower.includes('ultrasound') || lower.includes('mri')) {
      setReportCategory('IMAGING');
      setReportUnit('Qualitative');
      setReportReferenceRange('Normal findings');
    } else {
      setReportCategory('OTHER');
      setReportUnit('');
      setReportReferenceRange('N/A');
    }
    setReportFlag('NORMAL');
    setFulfillModalOpen(true);
  };

  const handleSaveFulfilledReport = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!reportTestName.trim() || !reportResult.trim()) return;

    const numericVal = parseFloat(reportNumericValue);

    const resultPayload: Omit<InvestigationResult, 'id'> = {
      testName: reportTestName.trim(),
      category: reportCategory,
      result: reportResult.trim(),
      numericValue: isNaN(numericVal) ? undefined : numericVal,
      unit: reportUnit.trim(),
      referenceRange: reportReferenceRange.trim(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      confidence: 'HIGH',
      flag: reportFlag,
      doctorVerified: true,
    };

    if (onFulfillPendingInvestigation) {
      onFulfillPendingInvestigation(patient.patientId, targetPendingItem, resultPayload);
    }
    setFulfillModalOpen(false);
  };

  // Keep localNotes synced with patient.clinicalNotes
  React.useEffect(() => {
    if (patient.clinicalNotes) {
      setLocalNotes(patient.clinicalNotes);
    }
  }, [patient.clinicalNotes]);

  const handleAddNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newNoteContent.trim()) return;

    const notePayload = {
      content: newNoteContent.trim(),
      author: newNoteAuthor.trim() || 'Duty Doctor',
      category: newNoteCategory,
      isPinned: newNoteIsPinned,
    };

    if (onAddClinicalNote) {
      onAddClinicalNote(patient.patientId, notePayload);
    } else {
      const createdNote: ClinicalNote = {
        id: `cn-${Date.now()}`,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        ...notePayload,
      };
      setLocalNotes((prev) => [createdNote, ...prev]);
    }

    setNewNoteContent('');
    setNewNoteIsPinned(false);
  };

  const handleDeleteNote = (noteId: string) => {
    if (onDeleteClinicalNote) {
      onDeleteClinicalNote(patient.patientId, noteId);
    } else {
      setLocalNotes((prev) => prev.filter((n) => n.id !== noteId));
    }
  };

  const handleTogglePin = (noteId: string) => {
    if (onTogglePinClinicalNote) {
      onTogglePinClinicalNote(patient.patientId, noteId);
    } else {
      setLocalNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, isPinned: !n.isPinned } : n))
      );
    }
  };

  const handleCopyNoteText = (note: ClinicalNote) => {
    const textToCopy = `[Clinical Note - ${note.category}] (${note.date} by ${note.author})\n${note.content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  // Filtered Notes
  const filteredNotes = React.useMemo(() => {
    return localNotes
      .filter((n) => {
        if (noteCategoryFilter !== 'ALL' && n.category !== noteCategoryFilter) return false;
        if (noteSearchQuery.trim()) {
          const q = noteSearchQuery.toLowerCase();
          return (
            n.content.toLowerCase().includes(q) ||
            n.author.toLowerCase().includes(q) ||
            n.category.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [localNotes, noteCategoryFilter, noteSearchQuery]);

  // Extract unique lab test names available for this patient
  const labTestNames = React.useMemo(() => {
    const names = new Set<string>();
    patient.investigations.forEach((inv) => names.add(inv.testName));
    if (names.size === 0) names.add('Creatinine');
    return Array.from(names);
  }, [patient.investigations]);

  // Selected test trend data for chart
  const trendData = React.useMemo(() => {
    return patient.investigations
      .filter((inv) => inv.testName === selectedLabTest)
      .sort((a, b) => new Date(a.date).getTime() - new Date(a.date).getTime())
      .map((inv) => ({
        date: inv.date.slice(5), // e.g. "08-13"
        value: parseFloat(inv.result) || 0,
        unit: inv.unit,
        flag: inv.flag,
      }));
  }, [patient.investigations, selectedLabTest]);

  const isCritical = patient.priority === 'CRITICAL';
  const isAction = patient.priority === 'ACTION';

  return (
    <div className="p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto text-slate-900">
      {/* Back Button & Top Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3.5 py-2.5 min-h-[38px] rounded-xl transition-colors shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Ward Patients</span>
        </button>

        <div className="grid grid-cols-3 sm:flex items-center gap-2">
          <button
            onClick={() => onOpenAddRoundNote(patient)}
            className="flex items-center justify-center gap-1 bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-2.5 min-h-[38px] rounded-xl text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Round Note</span>
          </button>

          <button
            onClick={() => onOpenCapture(patient)}
            className="flex items-center justify-center gap-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold px-3 py-2.5 min-h-[38px] rounded-xl text-xs transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
          >
            <Camera className="w-4 h-4 shrink-0 text-teal-700" />
            <span>Capture Doc</span>
          </button>

          {patient.status !== 'DISCHARGED' ? (
            <button
              onClick={() => onOpenDischargeModal && onOpenDischargeModal(patient)}
              className="flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-3 py-2.5 min-h-[38px] rounded-xl text-xs transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
              title="Discharge patient and store complete medical records"
            >
              <LogOut className="w-4 h-4 text-red-600 shrink-0" />
              <span>Discharge</span>
            </button>
          ) : (
            onReadmitPatient && (
              <button
                onClick={() => onReadmitPatient(patient.patientId)}
                className="flex items-center justify-center gap-1 bg-teal-800 hover:bg-teal-900 text-white font-bold px-3 py-2.5 min-h-[38px] rounded-xl text-xs transition-all shadow-xs cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Re-Admit</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* DISCHARGED STORED RECORD BANNER */}
      {patient.status === 'DISCHARGED' && patient.dischargeData && (
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-teal-950 text-white p-4 sm:p-5 rounded-2xl border border-red-500/40 shadow-md space-y-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-500/30 text-red-200 border border-red-400/30 flex items-center gap-1">
                <Archive className="w-3 h-3 text-red-300" />
                <span>Stored Discharged Medical Record</span>
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Discharged: {patient.dischargeData.dischargeDate} ({patient.dischargeData.dischargedAt})
              </span>
            </div>
            {onReadmitPatient && (
              <button
                onClick={() => onReadmitPatient(patient.patientId)}
                className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-xl transition-all shadow-xs"
              >
                Re-Admit Patient
              </button>
            )}
          </div>
          <div className="text-xs space-y-1.5 pt-1 border-t border-white/10">
            <p className="font-bold text-amber-300">
              Condition on Discharge: <span className="text-white font-black bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/30">{patient.dischargeData.conditionOnDischarge}</span>
              <span className="text-slate-400 ml-2 font-mono">by {patient.dischargeData.dischargedBy || patient.consultant}</span>
            </p>
            <p className="text-slate-200 leading-relaxed">
              <strong>Discharge Summary:</strong> {patient.dischargeData.dischargeSummary}
            </p>
            {patient.dischargeData.followUpInstructions && (
              <p className="text-slate-300 leading-relaxed">
                <strong>Follow-Up Advice:</strong> {patient.dischargeData.followUpInstructions}
              </p>
            )}
          </div>
        </div>
      )}

      {/* PATIENT HEADER */}
      <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs bg-white ${
        isCritical ? 'border-red-300 ring-1 ring-red-200' :
        isAction ? 'border-amber-300' :
        'border-slate-200'
      }`}>
        <div className="flex items-start justify-between gap-3">
          {/* Left Column: Patient Name, Age/Sex, ID & Ward */}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-snug">
                {patient.name}
              </h1>
              <span className="text-xs sm:text-sm font-semibold text-slate-500 shrink-0">
                ({patient.age}{patient.sex[0]})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600 font-mono mt-1">
              <span>ID: <strong className="text-slate-900">{patient.patientId}</strong></span>
              <span>•</span>
              <span>Ward: <strong className="text-slate-900">{patient.ward.split('-')[0]}</strong></span>
              <span>•</span>
              <span>Admitted: <strong className="text-slate-900">{patient.admissionDate}</strong></span>
              {patient.consultant && (
                <>
                  <span>•</span>
                  <span className="text-slate-600 font-sans">Dr. {patient.consultant.replace(/^Dr\.\s*/i, '')}</span>
                </>
              )}
            </div>
          </div>
          {/* Right Column: Bed Number & Priority / Condition Badge */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {/* Bed Badge */}
            <span className="px-3 py-0.5 bg-slate-100 border border-slate-300 text-teal-900 font-mono font-black text-xs sm:text-sm rounded-lg shadow-2xs">
              {patient.bed}
            </span>

            {/* Priority / Condition Badge */}
            <div className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold flex items-center gap-1 shrink-0 whitespace-nowrap ${
              isCritical ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' :
              isAction ? 'bg-amber-50 text-amber-700 border-amber-200' :
              patient.priority === 'REVIEW' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
              'bg-emerald-50 text-emerald-700 border-emerald-200'
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

        {/* DIAGNOSIS, LATEST UPDATE & PENDING ACTIONS CARD (Highlight Section) */}
        <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-3">
          {/* Diagnosis & Latest Update */}
          <div className="bg-slate-50/90 border border-slate-200 p-3.5 rounded-xl space-y-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                DIAGNOSIS:
              </span>
              <p className="font-bold text-slate-900 text-sm sm:text-base mt-0.5">
                {patient.primaryDiagnosis}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>LATEST UPDATE:</span>
              </span>
              <p className="text-slate-800 font-medium text-xs sm:text-sm mt-0.5 leading-relaxed">
                {patient.lastUpdate}
              </p>
            </div>
          </div>

          {/* Pending Actions */}
          {((patient.pendingInvestigations && patient.pendingInvestigations.length > 0) || (patient.tasks && patient.tasks.some(t => t.status === 'PENDING'))) && (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-2">
              <div className="text-[10px] uppercase font-bold text-amber-900 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>PENDING ACTIONS</span>
                </span>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  {(patient.pendingInvestigations?.length || 0) + (patient.tasks?.filter(t => t.status === 'PENDING').length || 0)} Total
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {patient.pendingInvestigations?.map((inv, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOpenFulfillModal(inv)}
                    className="bg-white hover:bg-amber-100/60 border border-amber-300 text-amber-950 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Click to fulfill lab report"
                  >
                    <Zap className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>{inv}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded font-sans">Enter</span>
                  </button>
                ))}

                {patient.tasks?.filter(t => t.status === 'PENDING').map((t) => (
                  <span
                    key={t.id}
                    className="bg-white border border-teal-300 text-teal-950 text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-2xs flex items-center gap-1.5"
                  >
                    <FileText className="w-3 h-3 text-teal-700 shrink-0" />
                    <span className="truncate max-w-[240px]">{t.description}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex items-center gap-1 border border-slate-200 bg-slate-100/80 p-1 rounded-2xl overflow-x-auto text-xs font-semibold text-slate-600 no-scrollbar">
        {[
          { id: 'overview', label: 'Overview & Plan' },
          { id: 'notes', label: `Notes (${(localNotes || []).length})` },
          { id: 'history', label: 'History' },
          { id: 'rounds', label: `Rounds (${(patient.dailyRounds || []).length})` },
          { id: 'trends', label: 'Lab Trends' },
          { id: 'meds', label: `Meds (${(patient.medications || []).length})` },
          { id: 'docs', label: `Docs (${(patient.documents || []).length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap text-xs ${
              activeTab === tab.id
                ? 'bg-white text-teal-800 font-bold shadow-xs border border-slate-200'
                : 'hover:bg-slate-200/60 text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & PLAN */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 🔴 LAST UPDATE (MUST APPEAR BEFORE HISTORICAL INFORMATION!) */}
          <div className={`p-5 rounded-2xl border shadow-xs space-y-2 ${
            isCritical ? 'bg-red-50/90 border-red-200 text-red-950' :
            isAction ? 'bg-amber-50/90 border-amber-200 text-amber-950' :
            'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>🔴 LAST UPDATE (Most Important Clinical Change First)</span>
            </div>
            <p className="text-lg font-black leading-snug">
              {patient.lastUpdate}
            </p>
          </div>

          {/* 🤖 AI DIAGNOSIS SYNTHESIS & MULTI-REPORT / PRESCRIPTION CORRELATION */}
          <AIDiagnosisSynthesis
            patient={patient}
            onUpdatePrimaryDiagnosis={onUpdatePrimaryDiagnosis}
            onOpenCapture={onOpenCapture}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ACTIVE PROBLEMS */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Active Problems</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-800">
                {(patient.activeProblems || []).map((prob, idx) => (
                  <li key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                    <span>{prob}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* WORKING DIAGNOSIS & DIFFERENTIAL */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Working Diagnosis
              </h3>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-extrabold text-teal-800 text-base">
                  {patient.primaryDiagnosis}
                </p>
              </div>

              {patient.differentialDiagnoses && patient.differentialDiagnoses.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Differential Diagnoses:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.differentialDiagnoses.map((diff, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-md border border-slate-200 font-medium">
                        {diff}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PENDING INVESTIGATIONS */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Pending Investigations
                  </h3>
                </div>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {patient.pendingInvestigations?.length || 0} Pending
                </span>
              </div>

              {/* Add New Pending Investigation Input */}
              <form onSubmit={handleAddPendingInv} className="flex gap-2">
                <input
                  type="text"
                  value={newPendingInvName}
                  onChange={(e) => setNewPendingInvName(e.target.value)}
                  placeholder="Type investigation name manually (e.g. Sputum C&S, Serum Ferritin)..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-amber-600 font-medium"
                />
                <button
                  type="submit"
                  disabled={!newPendingInvName.trim()}
                  className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-2xs transition-all whitespace-nowrap"
                >
                  + Add Pending
                </button>
              </form>

              {/* Pending Investigations List */}
              {patient.pendingInvestigations && patient.pendingInvestigations.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {patient.pendingInvestigations.map((inv, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-amber-50/80 border border-amber-200 text-amber-950 rounded-xl text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-amber-600 animate-pulse">⏳</span>
                        <span className="font-mono font-bold text-slate-900">{inv}</span>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          onClick={() => handleOpenFulfillModal(inv)}
                          className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 shadow-2xs transition-all"
                          title="Enter Report Manually"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Fill Report</span>
                        </button>

                        <button
                          onClick={() => onOpenCapture(patient)}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                          title="Take Photo / Upload for OCR"
                        >
                          <Camera className="w-3 h-3 text-teal-300" />
                          <span>Scan Report</span>
                        </button>

                        <button
                          onClick={() => onRemovePendingInvestigation && onRemovePendingInvestigation(patient.patientId, inv)}
                          className="text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                          title="Remove from pending list"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  <p className="text-slate-600 text-xs font-medium">All ordered investigations fulfilled!</p>
                  <p className="text-[10px] text-slate-400">Type above to add new pending tests.</p>
                </div>
              )}
            </div>

            {/* TODAY'S PRIORITY & PLAN */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                Today's Ward Round Plan
              </h3>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div>
                  <span className="font-bold text-amber-800">Priority Goal:</span>{' '}
                  <span className="text-slate-900 font-semibold">{patient.todayPriority}</span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-bold text-teal-800">Detailed Action Plan:</span>
                  <p className="text-slate-800 whitespace-pre-line mt-1 font-medium leading-relaxed">
                    {patient.todayPlan}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK CLINICAL NOTES PREVIEW ON OVERVIEW */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Quick Clinical Notes & Handover Summary ({localNotes.length})
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('notes')}
                className="text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1"
              >
                <span>View All Notes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Note Input Box */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Jot down quick doctor observation or handover note..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-medium"
              />
              <button
                type="submit"
                disabled={!newNoteContent.trim()}
                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-2xs transition-all whitespace-nowrap"
              >
                + Save Note
              </button>
            </form>

            {/* Top 2 Recent or Pinned Notes */}
            {localNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {localNotes.slice(0, 2).map((note) => (
                  <div key={note.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-800 text-[11px] px-2 py-0.5 bg-white border border-slate-200 rounded">
                        {note.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{note.date} • {note.author}</span>
                    </div>
                    <p className="text-slate-800 font-medium line-clamp-2">{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-xs italic">No clinical notes recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB: CLINICAL NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {/* Header & Quick Intro */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <StickyNote className="w-5 h-5 text-teal-600" />
                  <span>Doctor & Care Team Clinical Notes</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Free-text observations, handovers, family communications, and nursing updates.
                </p>
              </div>

              {/* Quick Stats Pill */}
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg">
                  📝 {localNotes.length} Total Notes
                </span>
                <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
                  📌 {localNotes.filter((n) => n.isPinned).length} Pinned
                </span>
              </div>
            </div>

            {/* Quick Add Note Form */}
            <form onSubmit={handleAddNote} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <MessageSquare className="w-4 h-4 text-teal-600" />
                    <span>Jot Down New Observation</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Category Selection */}
                  <span className="text-slate-500 font-medium">Category:</span>
                  {(['Observation', 'Handover', 'Family Update', 'Nursing Note', 'General'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewNoteCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] border transition-all ${
                        newNoteCategory === cat
                          ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Type doctor observation, informal handover note, family conversation notes, or bedside findings..."
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-teal-600 min-h-[90px] shadow-2xs"
                rows={3}
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Author:</span>
                    <input
                      type="text"
                      value={newNoteAuthor}
                      onChange={(e) => setNewNoteAuthor(e.target.value)}
                      placeholder="Doctor Name"
                      className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={newNoteIsPinned}
                      onChange={(e) => setNewNoteIsPinned(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <Pin className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pin to Top</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!newNoteContent.trim()}
                  className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Clinical Note</span>
                </button>
              </div>
            </form>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={noteSearchQuery}
                  onChange={(e) => setNoteSearchQuery(e.target.value)}
                  placeholder="Search in notes (e.g. ultrasound, son, BP...)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-teal-600 font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-500 font-medium shrink-0">Filter:</span>
                {['ALL', 'Observation', 'Handover', 'Family Update', 'Nursing Note', 'General'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNoteCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border transition-all whitespace-nowrap ${
                      noteCategoryFilter === cat
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes Cards Display */}
          {filteredNotes.length > 0 ? (
            <div className="space-y-3">
              {filteredNotes.map((note) => {
                const categoryColors: Record<string, string> = {
                  'Observation': 'bg-teal-50 text-teal-800 border-teal-200',
                  'Handover': 'bg-purple-50 text-purple-800 border-purple-200',
                  'Family Update': 'bg-blue-50 text-blue-800 border-blue-200',
                  'Nursing Note': 'bg-emerald-50 text-emerald-800 border-emerald-200',
                  'General': 'bg-slate-100 text-slate-800 border-slate-200',
                };
                const badgeStyle = categoryColors[note.category] || categoryColors['General'];

                return (
                  <div
                    key={note.id}
                    className={`p-5 rounded-2xl border transition-all shadow-2xs bg-white space-y-3 ${
                      note.isPinned
                        ? 'border-amber-300 ring-2 ring-amber-100 bg-amber-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold border ${badgeStyle}`}>
                          {note.category}
                        </span>

                        {note.isPinned && (
                          <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                            <Pin className="w-3 h-3 text-amber-600 fill-amber-500" />
                            <span>Pinned</span>
                          </span>
                        )}

                        <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{note.date}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                          👤 {note.author}
                        </span>

                        <button
                          onClick={() => handleTogglePin(note.id)}
                          title={note.isPinned ? 'Unpin note' : 'Pin note'}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            note.isPinned
                              ? 'bg-amber-100 border-amber-300 text-amber-800'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-amber-600 hover:bg-slate-100'
                          }`}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleCopyNoteText(note)}
                          title="Copy note text"
                          className="p-1.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-500 hover:text-teal-700 hover:bg-slate-100 transition-colors"
                        >
                          {copiedNoteId === note.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          title="Delete note"
                          className="p-1.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                      {note.content}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <StickyNote className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No Clinical Notes Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {noteSearchQuery || noteCategoryFilter !== 'ALL'
                  ? 'No notes match your current search or category filter.'
                  : 'Start by writing a quick observation or handover note above.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CLINICAL HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900">Structured Clinical History</h2>
            <p className="text-xs text-slate-500">Recorded history upon admission and subsequent updates</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-teal-700 uppercase tracking-wider">Chief Complaints</span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-medium">
                {patient.chiefComplaints || 'Not documented'}
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-teal-700 uppercase tracking-wider">History of Present Illness (HPI)</span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-medium">
                {patient.hpi || 'Not documented'}
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-teal-700 uppercase tracking-wider">Past Medical History</span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-medium">
                {patient.pastMedicalHistory || 'Nil'}
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-teal-700 uppercase tracking-wider">Drug History & Allergies</span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-medium space-y-1">
                <div><strong className="text-slate-600">Meds:</strong> {patient.drugHistory || 'None'}</div>
                <div><strong className="text-red-700">Allergies:</strong> {patient.allergies || 'NKDA'}</div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-teal-700 uppercase tracking-wider">Personal / Family History</span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-medium">
                {patient.familyPersonalHistory || 'Unremarkable'}
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-teal-700 uppercase tracking-wider">Physical Examination Findings</span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-medium leading-relaxed">
                {patient.examinationSummary || 'Standard examination recorded'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DAILY ROUNDS & TIMELINE */}
      {activeTab === 'rounds' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Ward Round Progress Notes</h2>
              <p className="text-xs text-slate-500">Chronological history (Today → Yesterday → Previous days)</p>
            </div>
            <button
              onClick={() => onOpenAddRoundNote(patient)}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Today's Round Note</span>
            </button>
          </div>

          {/* Comparison View Modal if selected */}
          {compareRound && (
            <div className="p-5 bg-white border-2 border-teal-600 rounded-2xl space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                  <GitCompare className="w-5 h-5" />
                  <span>Comparing Round Notes: {compareRound.current.date} vs {compareRound.previous?.date || 'Prior'}</span>
                </div>
                <button
                  onClick={() => setCompareRound(null)}
                  className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-300 font-semibold"
                >
                  Close Compare
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Current Round */}
                <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-200 space-y-2">
                  <div className="font-bold text-teal-900 text-sm">{compareRound.current.date} (Latest Round)</div>
                  <div><strong className="text-slate-600">Complaints:</strong> {compareRound.current.complaints}</div>
                  <div><strong className="text-slate-600">Vitals:</strong> BP {compareRound.current.vitals.bp}, HR {compareRound.current.vitals.pulse}, Temp {compareRound.current.vitals.temperature}, SpO2 {compareRound.current.vitals.spo2} ({compareRound.current.vitals.oxygenRequirement})</div>
                  <div><strong className="text-slate-600">Assessment:</strong> {compareRound.current.assessment}</div>
                  <div><strong className="text-slate-600">Plan:</strong> {compareRound.current.plan}</div>
                </div>

                {/* Previous Round */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-700 text-sm">{compareRound.previous?.date || 'Previous Round'}</div>
                  {compareRound.previous ? (
                    <>
                      <div><strong className="text-slate-600">Complaints:</strong> {compareRound.previous.complaints}</div>
                      <div><strong className="text-slate-600">Vitals:</strong> BP {compareRound.previous.vitals.bp}, HR {compareRound.previous.vitals.pulse}, Temp {compareRound.previous.vitals.temperature}, SpO2 {compareRound.previous.vitals.spo2} ({compareRound.previous.vitals.oxygenRequirement})</div>
                      <div><strong className="text-slate-600">Assessment:</strong> {compareRound.previous.assessment}</div>
                      <div><strong className="text-slate-600">Plan:</strong> {compareRound.previous.plan}</div>
                    </>
                  ) : (
                    <p className="text-slate-500 italic">No prior round note recorded</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timeline List */}
          <div className="space-y-4">
            {(patient.dailyRounds || []).map((round, idx) => {
              const previousRound = (patient.dailyRounds || [])[idx + 1] || null;
              return (
                <div key={round.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-teal-50 text-teal-800 font-mono font-bold text-xs rounded-lg border border-teal-200">
                        📅 {round.date}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Authored by Attending Doctor
                      </span>
                    </div>

                    <button
                      onClick={() => setCompareRound({ current: round, previous: previousRound })}
                      className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-teal-800 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300 transition-colors font-medium shadow-2xs"
                    >
                      <GitCompare className="w-3.5 h-3.5 text-teal-600" />
                      <span>Compare with Previous Round</span>
                    </button>
                  </div>

                  {/* Vitals Summary Pill Bar */}
                  <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono">
                    <span className="text-slate-600 font-sans font-bold mr-1">Vitals:</span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-800 rounded font-semibold">BP: {round.vitals.bp}</span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-800 rounded font-semibold">HR: {round.vitals.pulse} bpm</span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-800 rounded font-semibold">Temp: {round.vitals.temperature}</span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-800 rounded font-semibold">RR: {round.vitals.respiratoryRate}</span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-800 rounded font-semibold">SpO2: {round.vitals.spo2}</span>
                    <span className="px-2 py-0.5 bg-teal-50 text-teal-800 rounded border border-teal-200 font-bold">O2: {round.vitals.oxygenRequirement}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-600 uppercase">Complaints & Examination</span>
                      <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-medium">
                        {round.complaints}
                        {round.examination && <span className="block mt-2 text-slate-700 border-t border-slate-200 pt-2 font-mono">Exam: {round.examination}</span>}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-teal-800 uppercase">Assessment & Plan</span>
                      <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-medium whitespace-pre-line">
                        <strong className="text-teal-700">Assessment:</strong> {round.assessment}
                        {'\n\n'}
                        <strong className="text-teal-700">Plan:</strong> {round.plan}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: INVESTIGATION TRENDS */}
      {activeTab === 'trends' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                <span>Laboratory Investigation Trends</span>
              </h2>
              <p className="text-xs text-slate-500">Chronological history with interactive graph visualization</p>
            </div>

            {/* Test Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 font-semibold">Parameter:</span>
              <select
                value={selectedLabTest}
                onChange={(e) => setSelectedLabTest(e.target.value)}
                className="bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 font-bold focus:outline-none focus:border-teal-600 shadow-2xs"
              >
                {labTestNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Graph Visualization */}
          {trendData.length > 0 ? (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#0d9488"
                      strokeWidth={3}
                      dot={{ r: 6, fill: '#0d9488', strokeWidth: 2, stroke: '#ffffff' }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Chronological Table View */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase font-bold">
                      <th className="p-3">Date / Time</th>
                      <th className="p-3">Parameter</th>
                      <th className="p-3">Result</th>
                      <th className="p-3">Reference Range</th>
                      <th className="p-3">Status Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(patient.investigations || [])
                      .filter((inv) => inv.testName === selectedLabTest)
                      .map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono text-slate-600">{inv.date} {inv.time || ''}</td>
                          <td className="p-3 font-bold text-slate-900">{inv.testName}</td>
                          <td className="p-3 font-mono font-bold text-teal-800">{inv.result} {inv.unit}</td>
                          <td className="p-3 text-slate-500">{inv.referenceRange}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inv.flag === 'CRITICAL' ? 'bg-red-100 text-red-800 border border-red-300' :
                              inv.flag === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              inv.flag === 'LOW' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                              'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}>
                              {inv.flag || 'NORMAL'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-xs italic">No lab results recorded for {selectedLabTest}</p>
          )}
        </div>
      )}

      {/* TAB 5: MEDICATIONS */}
      {activeTab === 'meds' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-600" />
            <span>Active & Discontinued Medications</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase font-bold">
                  <th className="p-3">Drug Name</th>
                  <th className="p-3">Dose</th>
                  <th className="p-3">Route</th>
                  <th className="p-3">Frequency</th>
                  <th className="p-3">Start Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(patient.medications || []).map((med) => (
                  <tr key={med.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{med.drugName}</td>
                    <td className="p-3 text-slate-700 font-mono">{med.dose}</td>
                    <td className="p-3 text-slate-700">{med.route}</td>
                    <td className="p-3 text-slate-700">{med.frequency}</td>
                    <td className="p-3 font-mono text-slate-500">{med.startDate}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        med.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-500 line-through border border-slate-200'
                      }`}>
                        {med.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: DOCUMENTS */}
      {activeTab === 'docs' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <span>Uploaded Medical Records & AI Extracted Sheets</span>
            </h2>
            <button
              onClick={() => onOpenCapture(patient)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-2xs cursor-pointer"
            >
              + Upload Document
            </button>
          </div>

          {(patient.documents || []).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(patient.documents || []).map((doc) => (
                <div key={doc.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-teal-800">{doc.documentType} Report</span>
                    <span className="text-slate-500 font-mono">{doc.uploadDate}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img src={doc.imageUri} alt="Doc preview" className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                    <div className="text-xs space-y-1">
                      <div className="font-semibold text-slate-800">
                        Extracted {doc.extractedFields?.length || 0} fields
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold border border-emerald-300">
                        {doc.verificationStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-xs italic">No documents uploaded for this patient yet.</p>
          )}
        </div>
      )}

      {/* FULFILL REPORT MODAL */}
      {fulfillModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Fill Report Result for Pending Test
                </h3>
              </div>
              <button
                onClick={() => setFulfillModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFulfilledReport} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Investigation Name</label>
                <input
                  type="text"
                  value={reportTestName}
                  onChange={(e) => setReportTestName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-teal-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Result / Value</label>
                  <input
                    type="text"
                    value={reportResult}
                    onChange={(e) => setReportResult(e.target.value)}
                    placeholder="e.g. 1.8 or Normal size"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-teal-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-teal-600"
                  >
                    <option value="CBC">CBC (Blood)</option>
                    <option value="RFT">RFT (Renal)</option>
                    <option value="LFT">LFT (Liver)</option>
                    <option value="ELECTROLYTES">Electrolytes</option>
                    <option value="COAGULATION">Coagulation</option>
                    <option value="CARDIAC">Cardiac</option>
                    <option value="INFLAMMATORY">Inflammatory</option>
                    <option value="IMAGING">Imaging (USG/CT/XRay)</option>
                    <option value="OTHER">Other Test</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Unit</label>
                  <input
                    type="text"
                    value={reportUnit}
                    onChange={(e) => setReportUnit(e.target.value)}
                    placeholder="mg/dL"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-medium focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ref. Range</label>
                  <input
                    type="text"
                    value={reportReferenceRange}
                    onChange={(e) => setReportReferenceRange(e.target.value)}
                    placeholder="0.6 - 1.2"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-medium focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Flag</label>
                  <select
                    value={reportFlag}
                    onChange={(e) => setReportFlag(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-slate-900 focus:outline-none focus:border-teal-600"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High ↑</option>
                    <option value="LOW">Low ↓</option>
                    <option value="CRITICAL">Critical ⚠️</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-[11px] text-teal-900 font-medium space-y-1">
                <p className="font-bold">✅ Auto-Fulfillment:</p>
                <p>Saving this result will record the report in patient history and automatically clear <strong>"{targetPendingItem}"</strong> from the pending list.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setFulfillModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Save Result & Fulfill Pending
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
