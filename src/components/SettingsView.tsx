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
  Save,
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Trash2,
  Phone,
  Building2,
  Stethoscope,
  Award
} from 'lucide-react';
import { UserAccount } from '../types';
import { getStoredUsers, updatePassword, updatePin, updateUserProfile } from '../utils/auth';
import { PRESET_AVATARS, AVATAR_COLOR_THEMES } from '../utils/avatars';

interface SettingsViewProps {
  currentUser?: UserAccount | null;
  onLogout?: () => void;
  onUpdateUser?: (updatedUser: UserAccount) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onLogout,
  onUpdateUser,
}) => {
  // Profile state
  const [name, setName] = React.useState(currentUser?.name || '');
  const [department, setDepartment] = React.useState(currentUser?.department || '');
  const [specialty, setSpecialty] = React.useState(currentUser?.specialty || '');
  const [licenseNumber, setLicenseNumber] = React.useState(currentUser?.licenseNumber || '');
  const [hospitalName, setHospitalName] = React.useState(currentUser?.hospitalName || '');
  const [phone, setPhone] = React.useState(currentUser?.phone || '');
  const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>(currentUser?.avatarUrl);
  const [avatarColor, setAvatarColor] = React.useState<string>(currentUser?.avatarColor || 'from-teal-600 to-emerald-600');
  
  const [profileSuccess, setProfileSuccess] = React.useState(false);
  const [profileError, setProfileError] = React.useState<string | null>(null);
  const [showPresetPicker, setShowPresetPicker] = React.useState(false);

  // Sync state if currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setDepartment(currentUser.department);
      setSpecialty(currentUser.specialty || '');
      setLicenseNumber(currentUser.licenseNumber || '');
      setHospitalName(currentUser.hospitalName || '');
      setPhone(currentUser.phone || '');
      setAvatarUrl(currentUser.avatarUrl);
      setAvatarColor(currentUser.avatarColor || 'from-teal-600 to-emerald-600');
    }
  }, [currentUser]);

  // Password state
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passSuccess, setPassSuccess] = React.useState(false);
  const [passError, setPassError] = React.useState<string | null>(null);

  // PIN state
  const [newPin, setNewPin] = React.useState(currentUser?.pin || '1234');
  const [pinSuccess, setPinSuccess] = React.useState(false);
  const [pinError, setPinError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const allUsers = React.useMemo(() => getStoredUsers(), [passSuccess, pinSuccess, profileSuccess]);

  // Handle Photo Upload (file to data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    // Max 4MB
    if (file.size > 4 * 1024 * 1024) {
      setProfileError('Image size should be less than 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatarUrl(result);
      setProfileError(null);
    };
    reader.onerror = () => {
      setProfileError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  // Handle Save Profile
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    if (!currentUser) return;
    if (!name.trim()) {
      setProfileError('Doctor name cannot be empty.');
      return;
    }

    const result = updateUserProfile(currentUser.id, {
      name: name.trim(),
      department: department.trim() || 'Internal Medicine',
      specialty: specialty.trim() || department.trim(),
      licenseNumber: licenseNumber.trim(),
      hospitalName: hospitalName.trim(),
      phone: phone.trim(),
      avatarUrl: avatarUrl || undefined,
      avatarColor,
    });

    if (result.success && result.user) {
      setProfileSuccess(true);
      if (onUpdateUser) {
        onUpdateUser(result.user);
      }
      setTimeout(() => setProfileSuccess(false), 4000);
    } else {
      setProfileError(result.error || 'Failed to update profile details.');
    }
  };

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
              Doctor Profile & Clinical Settings
            </h2>
            <p className="text-xs text-slate-300">
              Customize your doctor profile, avatar pictures, credentials, PIN security, and AI system preferences.
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

      {/* Main Doctor Profile & Avatar Customizer Form */}
      <form onSubmit={handleProfileSubmit} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
            <UserCheck className="w-5 h-5 text-teal-600" />
            <span>Doctor Profile & Avatar Management</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-1 bg-teal-50 text-teal-800 font-bold uppercase rounded-lg border border-teal-200">
              {currentUser?.roleTitle || 'Verified Staff'}
            </span>
          </div>
        </div>

        {/* Feedback Alerts */}
        {profileError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        {profileSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">Profile and avatar updated successfully! Changes are applied across the entire EMR system.</span>
          </div>
        )}

        {/* Avatar Selection & Preview Section */}
        <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-teal-600" />
              <span>Profile Picture & Avatar</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Visible on bedside rounds, patient charts, order logs, and top navigation.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Live Avatar Preview Container */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br ${avatarColor} text-white font-black text-3xl flex items-center justify-center shadow-md overflow-hidden border-2 border-white ring-2 ring-slate-200`}>
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={name || 'Doctor'} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>{name ? name.charAt(0) : 'D'}</span>
                )}
                <span className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <span className="text-[11px] font-semibold text-slate-600">
                {avatarUrl ? 'Photo Avatar' : 'Initial Badge'}
              </span>
            </div>

            {/* Avatar Action Controls */}
            <div className="flex-1 space-y-3 w-full">
              <div className="flex flex-wrap gap-2">
                {/* Upload File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Picture</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPresetPicker(!showPresetPicker)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Choose Preset Avatar</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl(undefined)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    title="Remove picture and use initials badge"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>

              {/* Color Theme Selector for Avatar Background */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-slate-600 block">Avatar Gradient & Badge Theme:</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {AVATAR_COLOR_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setAvatarColor(theme.bgClass)}
                      className={`w-7 h-7 rounded-xl bg-gradient-to-br ${theme.bgClass} shadow-2xs transition-transform cursor-pointer relative ${
                        avatarColor === theme.bgClass ? 'ring-2 ring-teal-600 ring-offset-2 scale-110' : 'hover:scale-105'
                      }`}
                      title={theme.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preset Avatars Gallery Drawer/Grid */}
          {showPresetPicker && (
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3 animate-in fade-in zoom-in-95 duration-150 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                  <span>Select Curated Medical Staff Avatar:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPresetPicker(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
                {PRESET_AVATARS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(preset.url);
                      setShowPresetPicker(false);
                    }}
                    className={`group flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all cursor-pointer ${
                      avatarUrl === preset.url
                        ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-500/30'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover shadow-2xs group-hover:scale-105 transition-transform"
                    />
                    <span className="text-[10px] text-slate-600 font-medium truncate w-full text-center">
                      {preset.name.split('(')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Doctor Information Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-700 block mb-1 font-bold flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              <span>Doctor Full Name & Titles:</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Alex Rivera, MD, FACP"
              className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="text-slate-700 block mb-1 font-bold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-teal-600" />
              <span>Hospital Username / Email (Read-Only):</span>
            </label>
            <input
              type="text"
              readOnly
              value={currentUser?.email || 'doctor@hospital.org'}
              className="w-full bg-slate-100 text-slate-700 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-medium cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-slate-700 block mb-1 font-bold flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Ward & Clinical Department:</span>
            </label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Internal Medicine & Nephrology"
              className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="text-slate-700 block mb-1 font-bold flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              <span>Sub-Specialty / Clinical Focus:</span>
            </label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="e.g. Acute Dialysis, Hypertension & Glomerulonephritis"
              className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="text-slate-700 block mb-1 font-bold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-teal-600" />
              <span>Medical License ID / Registry Number:</span>
            </label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="e.g. MD-88294"
              className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono font-bold focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="text-slate-700 block mb-1 font-bold flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>Hospital Beeper / Contact Phone:</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. Ext. 4021 / +1 (555) 019-2834"
              className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Avatar Changes</span>
          </button>
        </div>
      </form>

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
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${u.avatarColor || 'from-teal-600 to-emerald-600'} text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-2xs`}>
                {u.avatarUrl ? (
                  <img 
                    src={u.avatarUrl} 
                    alt={u.name} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>{u.name.charAt(0)}</span>
                )}
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
