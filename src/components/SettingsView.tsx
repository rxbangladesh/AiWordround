import React from 'react';
import { 
  Settings, 
  Cpu, 
  ShieldCheck, 
  UserCheck, 
  Key, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  LogOut,
  Save
} from 'lucide-react';
import { UserAccount } from '../types';
import { getStoredUsers, updatePassword, updatePin } from '../utils/auth';

interface SettingsViewProps {
  currentUser?: UserAccount | null;
  onLogout?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onLogout,
}) => {
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passSuccess, setPassSuccess] = React.useState(false);
  const [passError, setPassError] = React.useState<string | null>(null);

  const [newPin, setNewPin] = React.useState(currentUser?.pin || '1234');
  const [pinSuccess, setPinSuccess] = React.useState(false);
  const [pinError, setPinError] = React.useState<string | null>(null);

  const allUsers = React.useMemo(() => getStoredUsers(), [passSuccess, pinSuccess]);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(false);

    if (!currentUser) return;
    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    const result = updatePassword(currentUser.id, oldPassword, newPassword);
    if (result.success) {
      setPassSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(false), 4000);
    } else {
      setPassError(result.error || 'Failed to update password.');
    }
  };

  const handlePinChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setPinSuccess(false);

    if (!currentUser) return;
    if (!/^\d{4}$/.test(newPin)) {
      setPinError('PIN must be exactly 4 digits.');
      return;
    }

    const result = updatePin(currentUser.id, newPin);
    if (result.success) {
      setPinSuccess(true);
      setTimeout(() => setPinSuccess(false), 4000);
    } else {
      setPinError(result.error || 'Failed to update PIN.');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto text-slate-900">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md text-slate-100 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-950 text-teal-400 rounded-2xl border border-teal-800">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Clinical Settings & Security
            </h2>
            <p className="text-xs text-slate-300">
              Account credentials, password management, PIN configuration, and AI engine status.
            </p>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        )}
      </div>

      {/* Doctor & Ward Profile */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <UserCheck className="w-5 h-5 text-teal-600" />
            <span>Logged-In Doctor Profile</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-teal-50 text-teal-700 font-bold uppercase rounded-md border border-teal-200">
            {currentUser?.roleTitle || 'Verified Staff'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-slate-600 block mb-1 font-semibold">Doctor Name:</label>
            <input
              type="text"
              readOnly
              value={currentUser?.name || 'Dr. Alex Rivera, MD'}
              className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded-xl px-3 py-2 font-bold"
            />
          </div>
          <div>
            <label className="text-slate-600 block mb-1 font-semibold">Email & Hospital Username:</label>
            <input
              type="text"
              readOnly
              value={currentUser?.email || 'alex.rivera@hospital.org'}
              className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded-xl px-3 py-2 font-mono font-medium"
            />
          </div>
          <div>
            <label className="text-slate-600 block mb-1 font-semibold">Ward & Department:</label>
            <input
              type="text"
              readOnly
              value={currentUser?.department || 'Internal Medicine & Nephrology'}
              className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded-xl px-3 py-2 font-medium"
            />
          </div>
          <div>
            <label className="text-slate-600 block mb-1 font-semibold">Medical License ID:</label>
            <input
              type="text"
              readOnly
              value={currentUser?.licenseNumber || 'MD-88294'}
              className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold"
            />
          </div>
        </div>
      </div>

      {/* Password & PIN Security Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Change Password Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Key className="w-4 h-4 text-amber-600" />
            <span>Change Account Password</span>
          </div>

          {passError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>{passError}</span>
            </div>
          )}

          {passSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Password updated successfully!</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-2.5 text-xs">
            <div>
              <label className="text-slate-600 block mb-1 font-semibold">Current Password:</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-1 font-semibold">New Password (min 6 chars):</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-1 font-semibold">Confirm New Password:</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer mt-1"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Password</span>
            </button>
          </form>
        </div>

        {/* Change Bedside PIN Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Lock className="w-4 h-4 text-teal-600" />
              <span>Bedside Screen Quick PIN</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use a 4-digit numeric code for rapid unlocking on mobile tablets during bedside ward rounds without typing long passwords.
            </p>

            {pinError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            {pinSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>4-digit PIN updated!</span>
              </div>
            )}

            <form onSubmit={handlePinChange} className="space-y-2.5 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">4-Digit PIN:</label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 1234"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-base tracking-widest text-center font-bold focus:outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>Save Bedside PIN</span>
              </button>
            </form>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <span className="font-bold text-slate-700 block">Security Best Practice:</span>
            <span>Always lock the screen from the top-right menu whenever stepping away from the patient bedside.</span>
          </div>
        </div>
      </div>

      {/* Registered Staff Accounts */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Users className="w-4 h-4 text-slate-700" />
          <span>Active Clinical Staff Accounts ({allUsers.length})</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          {allUsers.map((u) => (
            <div
              key={u.id}
              className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                currentUser?.id === u.id
                  ? 'bg-teal-50/80 border-teal-300 text-teal-900'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${u.avatarColor || 'from-teal-600 to-emerald-600'} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                {u.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold truncate">{u.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{u.roleTitle}</div>
              </div>
              {currentUser?.id === u.id && (
                <span className="text-[10px] font-bold bg-teal-600 text-white px-1.5 py-0.5 rounded">
                  Active
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Engine Box */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Cpu className="w-5 h-5 text-teal-600" />
          <span>Gemini AI Engine Status</span>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Primary AI Model:</span>
            <span className="font-mono font-bold text-teal-800">gemini-3.7-flash (with latest fallback)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Structured Response Schema:</span>
            <span className="font-mono text-emerald-700 font-semibold">Enabled (Strict JSON Schema)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">API Key Storage:</span>
            <span className="text-slate-800 font-mono">Server-Side Environment (`GEMINI_API_KEY`)</span>
          </div>
        </div>
      </div>

      {/* Clinical Safety Protocol */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          <span>Clinical Safety Mandates</span>
        </div>
        <ul className="space-y-2 text-xs text-slate-700 list-disc list-inside bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
          <li>All AI-generated summaries MUST be reviewed and verified by an attending physician prior to clinical decision-making.</li>
          <li>Extracted laboratory figures preserve exact decimal precision, units, and reference ranges. Low-confidence OCR items are explicitly flagged as "Unclear — please verify".</li>
          <li>Patient information is stored locally in authenticated browser state and server proxies without external leaks.</li>
        </ul>
      </div>
    </div>
  );
};
