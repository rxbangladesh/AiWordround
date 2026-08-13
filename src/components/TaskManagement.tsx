import React from 'react';
import { CheckSquare, Square, Plus, Filter, AlertTriangle, User, Calendar } from 'lucide-react';
import { Patient, Task, TaskCategory } from '../types';

interface TaskManagementProps {
  patients: Patient[];
  onToggleTask: (patientId: string, taskId: string) => void;
  onAddTask: (patientId: string, description: string, category: TaskCategory) => void;
  onSelectPatient: (patient: Patient) => void;
}

export const TaskManagement: React.FC<TaskManagementProps> = ({
  patients,
  onToggleTask,
  onAddTask,
  onSelectPatient,
}) => {
  const [filterCategory, setFilterCategory] = React.useState<TaskCategory | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = React.useState<'ALL' | 'PENDING' | 'COMPLETED'>('PENDING');

  // New task form state
  const [selectedPatientId, setSelectedPatientId] = React.useState<string>(patients[0]?.patientId || '');
  const [newTaskDesc, setNewTaskDesc] = React.useState('');
  const [newTaskCategory, setNewTaskCategory] = React.useState<TaskCategory>('INVESTIGATION');

  // Aggregate all tasks across patients
  const allTasks = React.useMemo(() => {
    const list: { patient: Patient; task: Task }[] = [];
    patients.forEach((p) => {
      p.tasks.forEach((t) => {
        list.push({ patient: p, task: t });
      });
    });
    return list;
  }, [patients]);

  const filteredTasks = React.useMemo(() => {
    return allTasks.filter(({ task }) => {
      if (filterCategory !== 'ALL' && task.category !== filterCategory) return false;
      if (filterStatus !== 'ALL' && task.status !== filterStatus) return false;
      return true;
    });
  }, [allTasks, filterCategory, filterStatus]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskDesc || typeof newTaskDesc !== 'string' || !newTaskDesc.trim() || !selectedPatientId) return;
    onAddTask(selectedPatientId, newTaskDesc.trim(), newTaskCategory);
    setNewTaskDesc('');
  };

  const categories: TaskCategory[] = [
    'INVESTIGATION',
    'REPORT_REVIEW',
    'PROCEDURE',
    'MEDICATION_REVIEW',
    'SPECIALIST_OPINION',
    'COUNSELLING',
    'CONSENT',
    'FOLLOW_UP',
    'DISCHARGE_PLANNING',
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-slate-900">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md text-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Ward Task Command
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mt-1">
            Today's Ward Tasks & Action Items
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Manage pending investigations, specialist opinions, consents, and discharge planning.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterStatus === 'PENDING'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Pending ({allTasks.filter((t) => t.task.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setFilterStatus('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterStatus === 'COMPLETED'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Completed ({allTasks.filter((t) => t.task.status === 'COMPLETED').length})
          </button>
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterStatus === 'ALL'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Tasks
          </button>
        </div>
      </div>

      {/* Add Task Quick Form */}
      <form onSubmit={handleCreateTask} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-3">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          + Add New Action Task for Patient
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-teal-600 shadow-2xs"
          >
            {patients.map((p) => (
              <option key={p.patientId} value={p.patientId}>
                {p.bed} - {p.name}
              </option>
            ))}
          </select>

          <select
            value={newTaskCategory}
            onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
            className="bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-teal-600 shadow-2xs"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <input
            type="text"
            value={newTaskDesc}
            onChange={(e) => setNewTaskDesc(e.target.value)}
            placeholder="e.g., Obtain informed consent for blood transfusion..."
            className="bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-600 shadow-2xs"
          />

          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </form>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(({ patient, task }) => {
            const isCompleted = task.status === 'COMPLETED';
            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all shadow-2xs flex items-start justify-between gap-4 ${
                  isCompleted
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggleTask(patient.patientId, task.id)}
                    className="mt-0.5 text-teal-600 hover:text-teal-700 transition-colors shrink-0"
                  >
                    {isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-teal-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 hover:text-teal-600" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectPatient(patient)}
                        className="font-bold text-slate-900 text-sm hover:text-teal-700 transition-colors"
                      >
                        {patient.bed} • {patient.name}
                      </button>
                      <span className="text-xs text-slate-500 font-mono">({patient.patientId})</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-amber-800 border border-slate-200 rounded text-[10px] font-mono font-semibold">
                        {task.category}
                      </span>
                    </div>

                    <p className={`text-xs ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}>
                      {task.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onToggleTask(patient.patientId, task.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors ${
                    isCompleted
                      ? 'bg-slate-100 text-slate-500 border-slate-200'
                      : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  {isCompleted ? 'Done' : 'Mark Done'}
                </button>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs italic shadow-2xs">
            No tasks found matching current filters.
          </div>
        )}
      </div>
    </div>
  );
};
