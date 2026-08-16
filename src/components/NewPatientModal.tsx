import React from 'react';
import { X, UserPlus, Check, Stethoscope } from 'lucide-react';
import { Patient, PriorityLevel, UserAccount } from '../types';

interface NewPatientModalProps {
  currentUser?: UserAccount | null;
  onClose: () => void;
  onAddPatient: (patient: Patient) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  currentUser,
  onClose,
  onAddPatient,
}) => {
  const [name, setName] = React.useState('');
  const [age, setAge] = React.useState<number>(50);
  const [sex, setSex] = React.useState<'Male' | 'Female' | 'Other'>('Male');
  const [bed, setBed] = React.useState('Bed 18');
  const [ward, setWard] = React.useState(currentUser?.assignedWard || 'Ward 3B - Nephrology/Internal Med');
  const [consultant, setConsultant] = React.useState(currentUser?.name || 'Dr. Alex Rivera, MD');
  const [primaryDiagnosis, setPrimaryDiagnosis] = React.useState('');
  const [priority, setPriority] = React.useState<PriorityLevel>('ACTION');
  const [lastUpdate, setLastUpdate] = React.useState('');
  const [todayPriority, setTodayPriority] = React.useState('');
  const [todayPlan, setTodayPlan] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const safeName = typeof name === 'string' ? name.trim() : '';
    const safeDiagnosis = typeof primaryDiagnosis === 'string' ? primaryDiagnosis.trim() : '';
    if (!safeName || !safeDiagnosis) return;

    const safeBed = typeof bed === 'string' && bed.trim() ? bed.trim() : 'Bed 18';
    const safeLastUpdate = typeof lastUpdate === 'string' && lastUpdate.trim() ? lastUpdate.trim() : 'Newly admitted patient. Baseline evaluation pending.';
    const safeTodayPriority = typeof todayPriority === 'string' && todayPriority.trim() ? todayPriority.trim() : 'Initial ward admission workup';
    const safeTodayPlan = typeof todayPlan === 'string' && todayPlan.trim() ? todayPlan.trim() : '1. Complete initial history and physical exam\n2. Order baseline laboratory panel';

    const newPt: Patient = {
      patientId: `PT-${Math.floor(10000 + Math.random() * 90000)}`,
      name: safeName,
      age: Number(age) || 50,
      sex,
      bed: safeBed,
      ward,
      admissionDate: new Date().toISOString().split('T')[0],
      consultant,
      assignedDoctorId: currentUser?.id,
      primaryDiagnosis: safeDiagnosis,
      activeProblems: [safeDiagnosis],
      priority,
      lastUpdate: safeLastUpdate,
      pendingInvestigations: ['Baseline CBC', 'Baseline RFT'],
      todayPriority: safeTodayPriority,
      todayPlan: safeTodayPlan,
      chiefComplaints: 'Admitted for acute clinical evaluation.',
      hpi: 'Newly admitted patient to ward.',
      pastMedicalHistory: 'Not yet recorded',
      drugHistory: 'None',
      allergies: 'NKDA',
      familyPersonalHistory: 'Not recorded',
      examinationSummary: 'Vitals stable on arrival.',
      dailyRounds: [
        {
          id: `rd-init-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          complaints: 'Newly admitted',
          vitals: { bp: '120/80', pulse: '76', temperature: '36.8°C', respiratoryRate: '16', spo2: '98%', oxygenRequirement: 'Room air' },
          examination: 'Initial ward examination.',
          assessment: safeDiagnosis,
          plan: safeTodayPlan || 'Initial workup',
          tasks: []
        }
      ],
      investigations: [],
      medications: [],
      documents: [],
      tasks: [
        {
          id: `t-init-${Date.now()}`,
          patientId: '',
          description: 'Complete admission medication reconciliation',
          category: 'MEDICATION_REVIEW',
          status: 'PENDING'
        }
      ]
    };

    onAddPatient(newPt);
    onClose();
  };

  if (currentUser?.role === 'ADMIN') {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl p-6 text-slate-900 space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">Clinical Admission Restricted</h3>
            <p className="text-xs text-slate-600 mt-1">
              Administrator accounts have Read-Only governance over clinical records and hospital rosters. Direct patient admissions and modifications are reserved for active clinical staff.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden text-slate-900 space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl border border-teal-200">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Admit New Ward Patient</h3>
              <p className="text-xs text-slate-500">Enter patient identifiers and initial diagnosis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 rounded-lg border border-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Patient Full Name:*</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 font-medium shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Age:*</label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 font-mono shadow-2xs"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Sex:*</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as any)}
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-2 py-2 shadow-2xs"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Bed Number:*</label>
              <input
                type="text"
                required
                value={bed}
                onChange={(e) => setBed(e.target.value)}
                placeholder="Bed 18"
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 font-mono shadow-2xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Priority Level:*</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 font-bold shadow-2xs"
              >
                <option value="CRITICAL">🔴 CRITICAL</option>
                <option value="ACTION">🟠 ACTION REQUIRED</option>
                <option value="REVIEW">🟡 REVIEW</option>
                <option value="STABLE">🟢 STABLE</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Primary Diagnosis:*</label>
            <input
              type="text"
              required
              value={primaryDiagnosis}
              onChange={(e) => setPrimaryDiagnosis(e.target.value)}
              placeholder="e.g. Community Acquired Pneumonia"
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-teal-800 shadow-2xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Last Update / Recent Change:</label>
            <input
              type="text"
              value={lastUpdate}
              onChange={(e) => setLastUpdate(e.target.value)}
              placeholder="e.g. Admitted with high fever and cough..."
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 shadow-2xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-xs flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>ADMIT PATIENT</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
