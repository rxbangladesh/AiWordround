import React from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Building2, 
  Stethoscope, 
  Eye, 
  Trash2, 
  FileText, 
  Users, 
  PlusCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { UserAccount, Patient, UserRole } from '../types';
import { getStoredUsers, approveDoctor, rejectDoctor, deleteDoctor, registerNewUser } from '../utils/auth';

interface AdminConsoleProps {
  currentUser?: UserAccount | null;
  patients?: Patient[];
  onSwitchUser?: (user: UserAccount) => void;
  onNavigateToDashboard?: () => void;
  onSelectDoctor?: (user: UserAccount) => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  currentUser,
  patients = [],
  onSwitchUser,
  onNavigateToDashboard,
  onSelectDoctor,
}) => {
  const [users, setUsers] = React.useState<UserAccount[]>(() => getStoredUsers());
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = React.useState<string>('ALL');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [actionSuccessMessage, setActionSuccessMessage] = React.useState<string | null>(null);

  // Quick Add Doctor Modal State
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newDocName, setNewDocName] = React.useState('');
  const [newDocEmail, setNewDocEmail] = React.useState('');
  const [newDocRole, setNewDocRole] = React.useState<UserRole>('ATTENDING_PHYSICIAN');
  const [newDocDept, setNewDocDept] = React.useState('Internal Medicine');
  const [newDocSpecialty, setNewDocSpecialty] = React.useState('');
  const [newDocLicense, setNewDocLicense] = React.useState('');
  const [newDocAutoApprove, setNewDocAutoApprove] = React.useState(true);

  const refreshUsers = () => {
    setUsers(getStoredUsers());
  };

  const showNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  // Handle Doctor Approval
  const handleApprove = (user: UserAccount) => {
    const res = approveDoctor(user.id, currentUser.name);
    if (res.success) {
      refreshUsers();
      showNotification(`✓ Doctor account approved: ${user.name} now has full clinical dashboard access.`);
    }
  };

  // Handle Doctor Rejection
  const handleReject = (user: UserAccount) => {
    const reason = prompt('Please enter the reason for rejection (optional):', 'Medical license verification could not be validated with the national medical board.');
    if (reason !== null) {
      const res = rejectDoctor(user.id, reason);
      if (res.success) {
        refreshUsers();
        showNotification(`Doctor application marked as rejected: ${user.name}`);
      }
    }
  };

  // Handle Doctor Deletion
  const handleDelete = (user: UserAccount) => {
    if (confirm(`Are you sure you want to permanently delete the account for ${user.name}?`)) {
      const res = deleteDoctor(user.id);
      if (res.success) {
        refreshUsers();
        showNotification(`Deleted account: ${user.name}`);
      }
    }
  };

  // Handle Quick Add Doctor by Admin
  const handleCreateDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim() || !newDocEmail.trim()) return;

    const res = registerNewUser(
      newDocName,
      newDocEmail,
      'doctor123',
      newDocRole,
      newDocDept,
      newDocLicense || `MD-${Math.floor(10000 + Math.random() * 90000)}`,
      '1234',
      newDocSpecialty || newDocDept,
      'St. Jude Metropolitan Hospital',
      newDocAutoApprove
    );

    if (res.success) {
      setShowAddModal(false);
      setNewDocName('');
      setNewDocEmail('');
      setNewDocSpecialty('');
      setNewDocLicense('');
      refreshUsers();
      showNotification(`✓ New medical staff profile created: ${res.user?.name} (${newDocAutoApprove ? 'Approved & Ready' : 'Pending Approval'})`);
    } else {
      alert(res.error || 'Failed to create doctor account.');
    }
  };

  // Filtered lists
  const pendingUsers = users.filter((u) => u.approvalStatus === 'PENDING');
  
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.licenseNumber && u.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.approvalStatus === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate patient counts per doctor
  const getDoctorPatientCount = (doctorName: string) => {
    return (patients || []).filter((p) => p.consultant?.toLowerCase().includes(doctorName.toLowerCase().replace('dr.', '').trim()) || p.consultant === doctorName).length;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-5 sm:p-6 text-white border border-slate-700/80 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">Hospital Administration & Doctor Approvals</h1>
                  <span className="bg-teal-900/80 text-teal-300 border border-teal-700/80 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    SaaS Portal Admin
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Manage medical licenses, approve doctor registration applications, and oversee multi-tenant ward permissions.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Provision Doctor Account</span>
            </button>
            {onNavigateToDashboard && (
              <button
                onClick={onNavigateToDashboard}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4 text-teal-400" />
                <span>Ward Dashboard</span>
              </button>
            )}
          </div>
        </div>

        {/* Global SaaS Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/60 text-xs">
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-semibold block">Pending Approvals</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xl font-black ${pendingUsers.length > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-200'}`}>
                {pendingUsers.length}
              </span>
              {pendingUsers.length > 0 && (
                <span className="text-[10px] font-bold bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800">
                  Action Required
                </span>
              )}
            </div>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-semibold block">Active Doctors & Staff</span>
            <span className="text-xl font-black text-emerald-400 mt-1 block">
              {users.filter((u) => u.approvalStatus === 'APPROVED').length}
            </span>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-semibold block">Total Inpatient Roster</span>
            <span className="text-xl font-black text-teal-300 mt-1 block">
              {(patients || []).length} Patients
            </span>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-semibold block">Hospital Unit</span>
            <span className="text-sm font-bold text-slate-200 mt-1 block truncate">
              {currentUser?.hospitalName || 'St. Jude Hospital'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Success Toast */}
      {actionSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-950">
            ✕
          </button>
        </div>
      )}

      {/* SECTION 1: PENDING DOCTOR REGISTRATION APPLICATIONS (CRITICAL QUEUE) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center font-black text-sm">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Doctor Registration Approvals Queue
                </h2>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-mono text-[10px] font-extrabold rounded-full border border-amber-300">
                  {pendingUsers.length} Pending Verification
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Review submitted medical license IDs and grant access to doctor-specific dashboards.
              </p>
            </div>
          </div>

          <button
            onClick={refreshUsers}
            className="text-xs text-slate-600 hover:text-teal-700 font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </button>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="bg-slate-50/70 border border-dashed border-slate-200 rounded-xl p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-800">All Doctor Registrations Approved</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are no pending doctor registration requests. New registrations from the login screen will appear here for verification.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="bg-amber-50/40 border border-amber-200 rounded-xl p-4 space-y-3.5 shadow-2xs hover:border-amber-300 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${user.avatarColor || 'from-rose-600 to-red-600'} text-white font-black flex items-center justify-center text-sm shrink-0 shadow-xs`}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-slate-900">{user.name}</h3>
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.2 rounded-full">
                          Pending Approval
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-teal-800">{user.roleTitle}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{user.department} • {user.specialty || 'General'}</p>
                    </div>
                  </div>
                </div>

                {/* License & Verification Badges */}
                <div className="bg-white/80 p-3 rounded-lg border border-amber-200/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Medical License ID:</span>
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {user.licenseNumber || 'Not Specified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Clinical Email:</span>
                    <span className="font-semibold text-slate-800">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Applied At:</span>
                    <span className="text-slate-600 font-mono text-[11px]">{user.registeredAt || 'Recent'}</span>
                  </div>
                </div>

                {/* Admin Approval Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleApprove(user)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Approve & Grant Access</span>
                  </button>

                  <button
                    onClick={() => handleReject(user)}
                    className="bg-white hover:bg-red-50 text-red-700 border border-red-200 font-semibold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
                    title="Reject Application"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: APPROVED DOCTORS & CLINICAL STAFF DIRECTORY */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-700" />
              <span>Medical Staff Directory & SaaS Multi-Doctor Rosters</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any doctor to simulate their isolated dashboard view or manage permissions.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search staff, license, department..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500 w-44 sm:w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved Only</option>
              <option value="PENDING">Pending Only</option>
              <option value="REJECTED">Rejected Only</option>
            </select>
          </div>
        </div>

        {/* Directory Table / Cards */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/50">
                <th className="py-3 px-3">Doctor / Staff Name</th>
                <th className="py-3 px-3">Role & Specialty</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">License ID</th>
                <th className="py-3 px-3">Assigned Patients</th>
                <th className="py-3 px-3">Account Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const patientCount = getDoctorPatientCount(user.name);
                const isCurrent = currentUser?.id === user.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${user.avatarColor || 'from-teal-600 to-emerald-600'} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded border border-teal-200">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{user.roleTitle}</div>
                      <div className="text-[11px] text-teal-700">{user.specialty || user.department}</div>
                    </td>

                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {user.department}
                    </td>

                    <td className="py-3 px-3 font-mono font-semibold text-slate-600">
                      {user.licenseNumber || '—'}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-extrabold text-teal-900 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 text-xs">
                        {patientCount} active cases
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {user.approvalStatus === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Approved</span>
                        </span>
                      )}
                      {user.approvalStatus === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Pending</span>
                        </span>
                      )}
                      {user.approvalStatus === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          <UserX className="w-3 h-3 text-red-600" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {user.approvalStatus === 'APPROVED' && (
                          <button
                            onClick={() => {
                              if (onSwitchUser) onSwitchUser(user);
                              else if (onSelectDoctor) onSelectDoctor(user);
                            }}
                            className="bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-700 font-bold px-2.5 py-1 rounded-lg text-xs transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                            title={`Switch to ${user.name}'s individual SaaS Dashboard`}
                          >
                            <span>Switch View</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {user.approvalStatus === 'PENDING' && (
                          <button
                            onClick={() => handleApprove(user)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                        )}

                        {!isCurrent && (
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                            title="Delete Doctor Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: PROVISION NEW DOCTOR BY ADMIN */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-700" />
                <h3 className="text-base font-bold text-slate-900">Provision New Doctor Profile</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDoctorSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Doctor Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g. Dr. Daniel Foster, MD, FACP"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Clinical Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newDocRole}
                    onChange={(e) => setNewDocRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-teal-500"
                  >
                    <option value="ATTENDING_PHYSICIAN">Attending Consultant</option>
                    <option value="RESIDENT_DOCTOR">Senior Resident</option>
                    <option value="WARD_NURSE">Ward Staff Nurse</option>
                    <option value="CLINICAL_ADMIN">Clinical Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Medical License ID
                  </label>
                  <input
                    type="text"
                    value={newDocLicense}
                    onChange={(e) => setNewDocLicense(e.target.value)}
                    placeholder="e.g. MD-66102"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Department / Ward Unit
                </label>
                <input
                  type="text"
                  value={newDocDept}
                  onChange={(e) => setNewDocDept(e.target.value)}
                  placeholder="e.g. Cardiology & CCU"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Specialty Sub-domain
                </label>
                <input
                  type="text"
                  value={newDocSpecialty}
                  onChange={(e) => setNewDocSpecialty(e.target.value)}
                  placeholder="e.g. Heart Failure & Electrophysiology"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newDocEmail}
                  onChange={(e) => setNewDocEmail(e.target.value)}
                  placeholder="doctor.name@hospital.org"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newDocAutoApprove}
                    onChange={(e) => setNewDocAutoApprove(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="font-semibold text-slate-800">
                    Immediately Approve & Activate Account (Skip verification queue)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs"
                >
                  Create & Save Doctor Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
