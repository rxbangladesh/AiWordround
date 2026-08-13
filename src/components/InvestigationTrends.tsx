import React from 'react';
import { TrendingUp, Search, Calendar, Filter, Activity, ArrowUpRight, ArrowDownRight, Clock, ArrowDown, ArrowUp } from 'lucide-react';
import { Patient } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AIDiagnosisSynthesis } from './AIDiagnosisSynthesis';

interface InvestigationTrendsProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onUpdatePrimaryDiagnosis?: (patientId: string, newDiagnosis: string) => void;
}

export const InvestigationTrends: React.FC<InvestigationTrendsProps> = ({
  patients,
  onSelectPatient,
  onUpdatePrimaryDiagnosis,
}) => {
  const [selectedPatientId, setSelectedPatientId] = React.useState<string>(patients[0]?.patientId || '');
  const [selectedParameter, setSelectedParameter] = React.useState<string>('Creatinine');
  const [sortOrder, setSortOrder] = React.useState<'latestToOldest' | 'oldestToLatest'>('latestToOldest');

  const selectedPatient = patients.find((p) => p.patientId === selectedPatientId) || patients[0];

  // Unique parameters for selected patient
  const availableParameters = React.useMemo(() => {
    if (!selectedPatient) return [];
    const set = new Set<string>();
    selectedPatient.investigations.forEach((inv) => set.add(inv.testName));
    if (set.size === 0) set.add('Creatinine');
    return Array.from(set);
  }, [selectedPatient]);

  // Chronological parameter data (always ascending for chart left-to-right timeline)
  const parameterHistoryAsc = React.useMemo(() => {
    if (!selectedPatient) return [];
    return selectedPatient.investigations
      .filter((inv) => inv.testName === selectedParameter)
      .sort((a, b) => new Date(`${a.date} ${a.time || '00:00'}`).getTime() - new Date(`${b.date} ${b.time || '00:00'}`).getTime());
  }, [selectedPatient, selectedParameter]);

  // Parameter data sorted according to user preference (Latest -> Oldest or vice versa)
  const parameterHistoryTable = React.useMemo(() => {
    if (sortOrder === 'latestToOldest') {
      return [...parameterHistoryAsc].reverse();
    }
    return parameterHistoryAsc;
  }, [parameterHistoryAsc, sortOrder]);

  // Recharts formatted data
  const chartData = React.useMemo(() => {
    return parameterHistoryAsc.map((inv) => ({
      date: inv.date.slice(5),
      value: parseFloat(inv.result) || 0,
      unit: inv.unit,
      flag: inv.flag,
    }));
  }, [parameterHistoryAsc]);

  // Calculate trend arrow & string summary
  const trendSummary = React.useMemo(() => {
    if (parameterHistoryAsc.length === 0) return 'No historical data';
    const values = parameterHistoryAsc.map((i) => i.result);
    const unit = parameterHistoryAsc[0]?.unit || '';
    const firstVal = parseFloat(values[0]) || 0;
    const lastVal = parseFloat(values[values.length - 1]) || 0;
    const isUp = lastVal > firstVal;
    const isDown = lastVal < firstVal;

    return `${values.join(' → ')} ${unit} ${isUp ? '↑' : isDown ? '↓' : '→'}`;
  }, [parameterHistoryAsc]);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto text-slate-900">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-md text-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Ward Lab Intelligence
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
            Investigation Trend Analytics
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Track chronological laboratory progression (Creatinine, Hb, WBC, Electrolytes, LFT, INR).
          </p>
        </div>

        {/* Patient & Parameter Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 block">Select Patient:</label>
            <select
              value={selectedPatientId}
              onChange={(e) => {
                setSelectedPatientId(e.target.value);
              }}
              className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-teal-500"
            >
              {patients.map((p) => (
                <option key={p.patientId} value={p.patientId}>
                  {p.bed} - {p.name} ({p.patientId})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 block">Select Parameter:</label>
            <select
              value={selectedParameter}
              onChange={(e) => setSelectedParameter(e.target.value)}
              className="w-full bg-slate-800 text-teal-300 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-teal-500"
            >
              {availableParameters.map((param) => (
                <option key={param} value={param}>
                  {param}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedPatient && (
        <div className="space-y-6">
          {/* Patient Overview Summary Bar */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-teal-800 text-xs px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                  {selectedPatient.bed}
                </span>
                <h3 className="font-bold text-lg text-slate-900">{selectedPatient.name}</h3>
                <span className="text-xs text-slate-500">({selectedPatient.age}{selectedPatient.sex[0]})</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{selectedPatient.primaryDiagnosis}</p>
            </div>

            {/* Calculated Trend Summary */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-0.5">
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">Chronological Trend Sequence:</span>
              <div className="font-mono font-bold text-amber-800 text-sm">{trendSummary}</div>
            </div>
          </div>

          {/* Interactive Line Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                <span>{selectedParameter} Interactive Progression Chart</span>
              </h3>
            </div>

            {chartData.length > 0 ? (
              <div className="h-72 w-full bg-slate-50 p-4 rounded-xl border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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
            ) : (
              <p className="text-slate-500 text-xs italic py-8 text-center">No trend results recorded for {selectedParameter}</p>
            )}
          </div>

          {/* Chronological Table View */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Chronological Test Log Table ({selectedParameter})</span>
              </h3>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-600">Sort:</span>
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

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase font-bold">
                    <th className="p-3">Report Date & Time</th>
                    <th className="p-3">Test Name</th>
                    <th className="p-3">Result</th>
                    <th className="p-3">Reference Range</th>
                    <th className="p-3">Clinical Status Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {parameterHistoryTable.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-600 font-medium">{inv.date} {inv.time || ''}</td>
                      <td className="p-3 font-bold text-slate-900">{inv.testName}</td>
                      <td className="p-3 font-mono font-bold text-teal-800 text-sm">{inv.result} {inv.unit}</td>
                      <td className="p-3 text-slate-500">{inv.referenceRange}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                          inv.flag === 'CRITICAL' ? 'bg-red-50 text-red-800 border border-red-200' :
                          inv.flag === 'HIGH' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          inv.flag === 'LOW' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                          'bg-emerald-50 text-emerald-800 border border-emerald-200'
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

          {/* AI Multi-Report & Prescription Synthesis Section */}
          <AIDiagnosisSynthesis
            patient={selectedPatient}
            onUpdatePrimaryDiagnosis={onUpdatePrimaryDiagnosis}
          />
        </div>
      )}
    </div>
  );
};
