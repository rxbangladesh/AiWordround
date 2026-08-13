import React from 'react';
import { X, Check, FileCheck2, Activity, Plus } from 'lucide-react';
import { Patient, DailyRound, DailyVitals } from '../types';

interface DailyRoundModalProps {
  patient: Patient;
  onClose: () => void;
  onSaveRound: (patientId: string, roundNote: Omit<DailyRound, 'id'>) => void;
}

export const DailyRoundModal: React.FC<DailyRoundModalProps> = ({
  patient,
  onClose,
  onSaveRound,
}) => {
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [complaints, setComplaints] = React.useState('');
  const [vitals, setVitals] = React.useState<DailyVitals>({
    bp: '120/80',
    pulse: '76',
    temperature: '36.8°C',
    respiratoryRate: '16',
    spo2: '98%',
    oxygenRequirement: 'Room air',
  });
  const [examination, setExamination] = React.useState('');
  const [assessment, setAssessment] = React.useState('');
  const [plan, setPlan] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const safeAssessment = typeof assessment === 'string' ? assessment.trim() : '';
    const safePlan = typeof plan === 'string' ? plan.trim() : '';
    if (!safeAssessment || !safePlan) return;

    onSaveRound(patient.patientId, {
      date,
      complaints: complaints || 'No acute overnight complaints',
      vitals,
      examination: examination || 'Systemic examination unremarkable',
      assessment: safeAssessment,
      plan: safePlan,
      tasks: [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden text-slate-900 space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl border border-teal-200">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                Add Daily Ward Round Note
              </h3>
              <p className="text-xs text-slate-500">
                {patient.bed} • {patient.name} ({patient.patientId})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 rounded-lg border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Date */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Round Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold focus:outline-none focus:border-teal-600 shadow-2xs"
            />
          </div>

          {/* Vitals Grid */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-teal-800 uppercase tracking-wider block">
              Patient Vitals
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-slate-600 block text-[10px]">BP (mmHg)</label>
                <input
                  type="text"
                  value={vitals.bp}
                  onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded px-2 py-1 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-600 block text-[10px]">Pulse (bpm)</label>
                <input
                  type="text"
                  value={vitals.pulse}
                  onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded px-2 py-1 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-600 block text-[10px]">Temp (°C)</label>
                <input
                  type="text"
                  value={vitals.temperature}
                  onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded px-2 py-1 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-600 block text-[10px]">RR (/min)</label>
                <input
                  type="text"
                  value={vitals.respiratoryRate}
                  onChange={(e) => setVitals({ ...vitals, respiratoryRate: e.target.value })}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded px-2 py-1 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-600 block text-[10px]">SpO2 (%)</label>
                <input
                  type="text"
                  value={vitals.spo2}
                  onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded px-2 py-1 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-600 block text-[10px]">O2 Requirement</label>
                <input
                  type="text"
                  value={vitals.oxygenRequirement}
                  onChange={(e) => setVitals({ ...vitals, oxygenRequirement: e.target.value })}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded px-2 py-1"
                />
              </div>
            </div>
          </div>

          {/* Today's Complaints */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Today's Complaints / Symptoms:</label>
            <input
              type="text"
              value={complaints}
              onChange={(e) => setComplaints(e.target.value)}
              placeholder="e.g., Reduced urine output overnight, mild nausea..."
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 shadow-2xs"
            />
          </div>

          {/* Examination */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Examination Findings:</label>
            <textarea
              rows={2}
              value={examination}
              onChange={(e) => setExamination(e.target.value)}
              placeholder="e.g., Chest clear bilateral breath sounds, pedal edema 2+..."
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 shadow-2xs"
            />
          </div>

          {/* Assessment */}
          <div>
            <label className="font-bold text-teal-800 block mb-1">Clinical Assessment:*</label>
            <input
              type="text"
              required
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              placeholder="e.g., AKI Stage 2 on CKD - worsening azotemia..."
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 font-medium shadow-2xs"
            />
          </div>

          {/* Plan */}
          <div>
            <label className="font-bold text-teal-800 block mb-1">Round Plan:*</label>
            <textarea
              rows={3}
              required
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="1. Urgent Renal Ultrasound\n2. Hold ACE inhibitor\n3. Recheck RFT in evening..."
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 font-medium shadow-2xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>SAVE ROUND NOTE</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
