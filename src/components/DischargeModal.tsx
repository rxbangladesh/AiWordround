import React from 'react';
import { LogOut, X, CheckCircle2, AlertTriangle, FileText, Calendar, User, ShieldCheck } from 'lucide-react';
import { Patient, DischargeData } from '../types';

interface DischargeModalProps {
  patient: Patient;
  isOpen?: boolean;
  onClose: () => void;
  onConfirmDischarge: (patientId: string, dischargeData: DischargeData) => void;
}

export const DischargeModal: React.FC<DischargeModalProps> = ({
  patient,
  isOpen = true,
  onClose,
  onConfirmDischarge,
}) => {
  const [dischargeDate, setDischargeDate] = React.useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [conditionOnDischarge, setConditionOnDischarge] = React.useState<
    DischargeData['conditionOnDischarge']
  >('IMPROVED');
  const [dischargeSummary, setDischargeSummary] = React.useState<string>(
    `Patient ${patient.name} admitted on ${patient.admissionDate} with ${patient.primaryDiagnosis}. Course in hospital stable following treatment plan. Discharged with medications as prescribed.`
  );
  const [followUpInstructions, setFollowUpInstructions] = React.useState<string>(
    'Follow up in OPD Clinic in 2 weeks with CBC/RFT. Return immediately if high fever, worsening breathlessness, or severe pain occurs.'
  );
  const [dischargedBy, setDischargedBy] = React.useState<string>(
    patient.consultant || 'Duty Medical Officer'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: DischargeData = {
      dischargeDate,
      conditionOnDischarge,
      dischargeSummary,
      followUpInstructions,
      dischargedBy,
      dischargedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onConfirmDischarge(patient.patientId, data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-teal-400/20 px-2 py-0.5 rounded border border-teal-400/30">
                Patient Discharge Protocol
              </span>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                Discharge & Store Patient Record
              </h3>
              <p className="text-xs text-slate-300">
                {patient.name} ({patient.patientId}) • Bed {patient.bed}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs text-slate-900">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs">
              Discharging will mark bed <strong className="font-mono">{patient.bed}</strong> as vacant and securely archive all patient records, daily rounds, lab trends, and OCR documents into local stored records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Discharge Date */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>Discharge Date:</span>
              </label>
              <input
                type="date"
                required
                value={dischargeDate}
                onChange={(e) => setDischargeDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Condition on Discharge */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Condition on Discharge:</span>
              </label>
              <select
                value={conditionOnDischarge}
                onChange={(e) => setConditionOnDischarge(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="RECOVERED">Recovered</option>
                <option value="IMPROVED">Improved</option>
                <option value="STABLE">Stable / Asymptomatic</option>
                <option value="TRANSFERRED">Transferred to another facility</option>
                <option value="AGAINST_MEDICAL_ADVICE">Against Medical Advice (AMA)</option>
              </select>
            </div>
          </div>

          {/* Discharge Summary */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>Discharge Summary & Hospital Course:</span>
            </label>
            <textarea
              required
              rows={3}
              value={dischargeSummary}
              onChange={(e) => setDischargeSummary(e.target.value)}
              placeholder="Enter brief clinical discharge summary..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>

          {/* Follow Up Instructions */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>Follow-Up Instructions & Clinic Advice:</span>
            </label>
            <textarea
              rows={2}
              value={followUpInstructions}
              onChange={(e) => setFollowUpInstructions(e.target.value)}
              placeholder="Enter OPD follow up instructions..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>

          {/* Discharging Consultant / Doctor */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Discharging Officer / Consultant:</span>
            </label>
            <input
              type="text"
              required
              value={dischargedBy}
              onChange={(e) => setDischargedBy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-colors text-xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-md flex items-center gap-1.5 text-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Discharge & Store Data</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
