import React from 'react';
import { 
  Stethoscope, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  UserCheck, 
  KeyRound, 
  Hospital, 
  ArrowRight, 
  Sparkles,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  Clock,
  Building2,
  ShieldAlert,
  ArrowLeft,
  Shield,
  Hash
} from 'lucide-react';
import { UserAccount, UserRole } from '../types';
import { 
  authenticateUser, 
  authenticateUserWithPin, 
  registerNewUser, 
  approveDoctor, 
  getStoredUsers 
} from '../utils/auth';

interface LoginScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
  onRegisterDoctor?: (newDoc: Partial<UserAccount>) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = React.useState<'login' | 'register' | 'admin'>('login');
  
  // Doctor Sign In Mode: Password vs. PIN toggle in the same section
  const [loginMethod, setLoginMethod] = React.useState<'password' | 'pin'>('password');
  const [email, setEmail] = React.useState('alex.rivera@hospital.org');
  const [password, setPassword] = React.useState('doctor123');
  const [doctorPin, setDoctorPin] = React.useState('1234');
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Admin Login Tab State
  const [adminAuthMethod, setAdminAuthMethod] = React.useState<'password' | 'pin'>('password');
  const [adminEmail, setAdminEmail] = React.useState('admin@hospital.org');
  const [adminPassword, setAdminPassword] = React.useState('admin123');
  const [adminPin, setAdminPin] = React.useState('9999');
  const [showAdminPassword, setShowAdminPassword] = React.useState(false);

  // Pending Approval State
  const [pendingAccount, setPendingAccount] = React.useState<UserAccount | null>(null);
  const [registrationDoneUser, setRegistrationDoneUser] = React.useState<UserAccount | null>(null);

  // Register Form State
  const [regName, setRegName] = React.useState('');
  const [regEmail, setRegEmail] = React.useState('');
  const [regPassword, setRegPassword] = React.useState('');
  const [regRole, setRegRole] = React.useState<UserRole>('ATTENDING_PHYSICIAN');
  const [regDepartment, setRegDepartment] = React.useState('Internal Medicine & Nephrology');
  const [regSpecialty, setRegSpecialty] = React.useState('Nephrology & Renal Medicine');
  const [regLicense, setRegLicense] = React.useState('');
  const [regPin, setRegPin] = React.useState('1234');

  const availableUsers = React.useMemo(() => getStoredUsers(), [activeTab, pendingAccount]);

  // Handle Standard Doctor Login (Password or PIN)
  const handleDoctorLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPendingAccount(null);
    setIsSubmitting(true);

    setTimeout(() => {
      let result;
      if (loginMethod === 'password') {
        result = authenticateUser(email, password);
      } else {
        result = authenticateUserWithPin(email, doctorPin);
      }
      setIsSubmitting(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else if (result.isPendingApproval && result.user) {
        setPendingAccount(result.user);
      } else {
        setError(result.error || 'Authentication failed. Please verify your credentials.');
      }
    }, 200);
  };

  // Handle Admin Login Submit
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      let result;
      if (adminAuthMethod === 'password') {
        result = authenticateUser(adminEmail, adminPassword);
      } else {
        result = authenticateUserWithPin(adminEmail, adminPin);
      }
      setIsSubmitting(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || 'Clinical Administrator authentication failed.');
      }
    }, 200);
  };

  // Handle Instant Approval in Demo
  const handleInstantApproveAndLogin = (userToApprove: UserAccount) => {
    const res = approveDoctor(userToApprove.id, 'Dr. William Bradley, MD (Clinical Admin)');
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    }
  };

  // Handle New Doctor Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('Please fill in all required clinical registration fields.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const result = registerNewUser(
      regName,
      regEmail,
      regPassword,
      regRole,
      regDepartment,
      regLicense || `MD-${Math.floor(10000 + Math.random() * 90000)}`,
      regPin || '1234',
      regSpecialty || regDepartment,
      'St. Jude Metropolitan Hospital',
      false // requires admin approval!
    );

    if (result.success && result.user) {
      setRegistrationDoneUser(result.user);
      setRegName('');
      setRegEmail('');
      setRegPassword('');
    } else {
      setError(result.error || 'Failed to register doctor profile.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-3 selection:bg-teal-500 selection:text-white font-sans relative overflow-y-auto">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Unified Authentication Card */}
      <div className="w-full max-w-sm sm:max-w-md my-auto relative z-10">
        
        {/* VIEW A: Awaiting Approval Modal/Banner (Shown when a pending doctor registers or attempts login) */}
        {(pendingAccount || registrationDoneUser) ? (
          <div className="w-full bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-950/40">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-800/80 inline-block mb-1.5">
                  Verification In Progress
                </span>
                <h2 className="text-lg font-black text-white">
                  Registration Submitted & Pending Admin Approval
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                  Doctor account for <span className="font-bold text-white">{(pendingAccount || registrationDoneUser)?.name}</span> has been securely registered in the hospital directory.
                </p>
              </div>
            </div>

            {/* Application Ticket Details */}
            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <span className="text-slate-400">Doctor Name:</span>
                <span className="font-bold text-white">{(pendingAccount || registrationDoneUser)?.name}</span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <span className="text-slate-400">Clinical Role:</span>
                <span className="font-semibold text-teal-300">{(pendingAccount || registrationDoneUser)?.roleTitle}</span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <span className="text-slate-400">Medical License ID:</span>
                <span className="font-mono font-bold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                  {(pendingAccount || registrationDoneUser)?.licenseNumber || 'Verified Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <span className="text-slate-400">Assigned Unit:</span>
                <span className="text-slate-300">{(pendingAccount || registrationDoneUser)?.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Approval Requirement:</span>
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Clinical Admin Review</span>
                </span>
              </div>
            </div>

            {/* Action buttons for testing/reviewing */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleInstantApproveAndLogin(pendingAccount || registrationDoneUser!)}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold min-h-[42px] py-2 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 text-xs transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Instant Approve & Open My Dashboard</span>
              </button>

              <button
                onClick={() => {
                  setPendingAccount(null);
                  setRegistrationDoneUser(null);
                  setActiveTab('admin');
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold min-h-[40px] py-2 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-all cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Log In as Admin to Review Approvals</span>
              </button>

              <button
                onClick={() => {
                  setPendingAccount(null);
                  setRegistrationDoneUser(null);
                  setActiveTab('login');
                }}
                className="w-full text-slate-400 hover:text-slate-200 font-semibold text-xs py-1.5 min-h-[36px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In Screen</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5">
            
            {/* Integrated Card Header: Smooth, Compact, Clean */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="font-bold tracking-tight text-sm sm:text-base text-white leading-none">
                    AI Ward Round
                  </h1>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-normal mt-0.5">
                    Inpatient & Decision Support System
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded-full border border-slate-800 shrink-0">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-medium text-slate-300">Online</span>
              </div>
            </div>

            {/* Tabs Selector: 1. Sign In 2. Doctor Register 3. Admin Login */}
            <div className="grid grid-cols-3 gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800/80">
              <button
                onClick={() => { setActiveTab('login'); setError(null); }}
                className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer font-bold text-[11px] sm:text-xs min-h-[36px] ${
                  activeTab === 'login'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Sign In</span>
              </button>
              <button
                onClick={() => { setActiveTab('register'); setError(null); }}
                className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer font-bold text-[11px] sm:text-xs min-h-[36px] ${
                  activeTab === 'register'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Register</span>
              </button>
              <button
                onClick={() => { setActiveTab('admin'); setError(null); }}
                className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer font-bold text-[11px] sm:text-xs min-h-[36px] ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-teal-300 border border-teal-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="truncate">Admin</span>
              </button>
            </div>

            {/* TAB 1: DOCTOR SIGN IN WITH IN-SECTION PASSWORD OR PIN TOGGLE */}
            {activeTab === 'login' && (
              <form onSubmit={handleDoctorLoginSubmit} className="space-y-3">
                <div className="space-y-2.5">
                  {/* Doctor Identifier */}
                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-300 mb-1">
                      Doctor Email or License ID
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="doctor@hospital.org or MD-88294"
                        className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* CREDENTIALS SECTION: TOGGLE BETWEEN PASSWORD OR 4-DIGIT PIN */}
                  <div className="bg-slate-950/80 p-2.5 sm:p-3 rounded-xl border border-slate-800 space-y-2">
                    {/* Header with Switch Button */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[11px] sm:text-xs font-bold text-slate-200 block truncate">
                          {loginMethod === 'password' ? 'Password' : 'Quick Bedside PIN'}
                        </span>
                        <span className="text-[10px] text-teal-400/90 font-mono block">
                          {loginMethod === 'password' ? 'Default: doctor123' : 'Default: 1234'}
                        </span>
                      </div>

                      {/* Pill toggle */}
                      <div className="inline-flex p-0.5 bg-slate-900 border border-slate-700/80 rounded-lg text-[10px] font-bold shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setLoginMethod('password');
                            setError(null);
                          }}
                          className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer min-h-[26px] ${
                            loginMethod === 'password'
                              ? 'bg-teal-600 text-white shadow-2xs'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Lock className="w-3 h-3 shrink-0" />
                          <span>Password</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLoginMethod('pin');
                            setError(null);
                          }}
                          className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer min-h-[26px] ${
                            loginMethod === 'pin'
                              ? 'bg-teal-600 text-white shadow-2xs'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <KeyRound className="w-3 h-3 shrink-0" />
                          <span>PIN</span>
                        </button>
                      </div>
                    </div>

                    {/* Input based on selected method */}
                    {loginMethod === 'password' ? (
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter doctor password"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-9 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-teal-400 absolute left-3 top-2.5" />
                          <input
                            type="password"
                            maxLength={4}
                            required
                            value={doctorPin}
                            onChange={(e) => setDoctorPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="4-Digit PIN (e.g. 1234)"
                            className="w-full bg-slate-900 border border-teal-600/50 rounded-xl py-2 pl-9 pr-9 text-sm tracking-widest text-center text-teal-300 placeholder-slate-500 focus:outline-hidden focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors font-mono"
                          />
                        </div>

                        {/* Quick PIN helper */}
                        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 px-0.5">
                          <span>Doctor PIN: <strong className="text-teal-300 font-mono">1234</strong></span>
                          <button
                            type="button"
                            onClick={() => setDoctorPin('1234')}
                            className="text-teal-400 hover:text-teal-300 font-bold cursor-pointer py-0.5 px-1.5 rounded hover:bg-slate-900 transition-colors"
                          >
                            Fill 1234
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Remember me & Need an account */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1.5 pt-0.5">
                  <label className="flex items-center gap-2 text-slate-400 hover:text-slate-300 cursor-pointer min-h-[26px]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                    />
                    <span className="text-[11px] sm:text-xs">Keep active session (1 Day)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-teal-400 hover:text-teal-300 font-semibold cursor-pointer text-left sm:text-right text-[11px] sm:text-xs py-0.5"
                  >
                    Need an account? Register →
                  </button>
                </div>

                {error && (
                  <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-lg shadow-teal-950/40 transition-all cursor-pointer min-h-[42px]"
                >
                  <span>{isSubmitting ? 'Authenticating Doctor...' : `Sign In with ${loginMethod === 'password' ? 'Password' : '4-Digit PIN'}`}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </form>
            )}

            {/* TAB 2: DOCTOR REGISTRATION */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3 sm:space-y-3.5">
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1">
                    Doctor Full Name & Credentials <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Dr. Alexander Vance, MD"
                    className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1">
                      Clinical Role <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:border-teal-500"
                    >
                      <option value="ATTENDING_PHYSICIAN">Attending Physician</option>
                      <option value="RESIDENT_DOCTOR">Resident Medical Officer</option>
                      <option value="WARD_NURSE">Ward Staff Nurse</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1">
                      Medical License ID <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regLicense}
                      onChange={(e) => setRegLicense(e.target.value)}
                      placeholder="e.g. MD-90184"
                      className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1">
                      Ward / Department <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      placeholder="e.g. Ward 3B Nephrology"
                      className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1">
                      Clinical Specialty
                    </label>
                    <input
                      type="text"
                      value={regSpecialty}
                      onChange={(e) => setRegSpecialty(e.target.value)}
                      placeholder="e.g. Acute Renal Care"
                      className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1">
                      Clinical Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      placeholder="doctor@hospital.org"
                      className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:border-teal-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1">
                    Quick Bedside 4-Digit PIN
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234"
                    className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-hidden focus:border-teal-500 font-mono"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold min-h-[44px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-900/30 transition-all text-xs sm:text-sm cursor-pointer mt-2"
                >
                  <UserPlus className="w-4 h-4 shrink-0" />
                  <span>Submit Doctor Registration</span>
                </button>
              </form>
            )}

            {/* TAB 3: ADMIN LOGIN */}
            {activeTab === 'admin' && (
              <form onSubmit={handleAdminLoginSubmit} className="space-y-3.5 sm:space-y-4">
                {/* Admin Header Box */}
                <div className="bg-slate-950/90 border border-teal-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border border-teal-500/50 flex items-center justify-center text-teal-300 font-bold shrink-0">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs sm:text-sm font-black text-white truncate">Clinical Admin Portal</h3>
                        <span className="text-[9px] font-bold uppercase bg-teal-950 text-teal-300 px-1.5 py-0.5 rounded border border-teal-800 shrink-0">
                          Chief
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Chief Medical Officer & Hospital Admin</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-[10px] sm:text-[11px] text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span>Admin: <strong className="text-white">Dr. William Bradley, MD</strong></span>
                    <span className="text-teal-400 font-mono">admin@hospital.org</span>
                  </div>
                </div>

                {/* Admin Credential Input */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-300 mb-1">
                      Administrator Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 sm:top-2.5" />
                      <input
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin@hospital.org"
                        className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Admin Password or PIN Switcher */}
                  <div className="bg-slate-950/70 p-3 rounded-xl sm:rounded-2xl border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {adminAuthMethod === 'password' ? 'Admin Password' : 'Admin Master PIN'}
                      </span>
                      
                      <div className="inline-flex p-0.5 bg-slate-900 border border-slate-700/80 rounded-lg text-[10px] font-bold shrink-0">
                        <button
                          type="button"
                          onClick={() => setAdminAuthMethod('password')}
                          className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer min-h-[28px] ${
                            adminAuthMethod === 'password'
                              ? 'bg-teal-600 text-white shadow-2xs'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Lock className="w-3 h-3 shrink-0" />
                          <span>Password</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdminAuthMethod('pin')}
                          className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer min-h-[28px] ${
                            adminAuthMethod === 'pin'
                              ? 'bg-teal-600 text-white shadow-2xs'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <KeyRound className="w-3 h-3 shrink-0" />
                          <span>Master PIN</span>
                        </button>
                      </div>
                    </div>

                    {adminAuthMethod === 'password' ? (
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 sm:top-2.5" />
                        <input
                          type={showAdminPassword ? 'text' : 'password'}
                          required
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="Enter admin password (admin123)"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer"
                        >
                          {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-teal-400 absolute left-3.5 top-3 sm:top-2.5" />
                        <input
                          type="password"
                          maxLength={4}
                          required
                          value={adminPin}
                          onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ''))}
                          placeholder="Master PIN: 9999"
                          className="w-full bg-slate-900 border border-teal-600/50 rounded-xl py-2.5 pl-10 pr-10 text-sm sm:text-base tracking-widest text-center text-teal-300 placeholder-slate-500 focus:outline-hidden focus:border-teal-400 font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-teal-700 to-slate-800 hover:from-teal-600 hover:to-slate-700 border border-teal-500/40 text-white font-bold min-h-[44px] py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-lg shadow-teal-950/40 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-teal-300 shrink-0" />
                  <span>{isSubmitting ? 'Authenticating Admin...' : 'Sign In as Clinical Admin'}</span>
                  <ArrowRight className="w-4 h-4 ml-auto shrink-0" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Footer Info - Compact, snug at the bottom */}
      <footer className="py-2.5 px-4 text-center text-[10px] sm:text-xs text-slate-500 relative z-10 w-full mt-2 sm:mt-4">
        <p>AI Ward Round Clinical Platform • Role-Based Clinical Access</p>
      </footer>
    </div>
  );
};
