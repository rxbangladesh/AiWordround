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
  UserPlus
} from 'lucide-react';
import { UserAccount, UserRole } from '../types';
import { authenticateUser, registerNewUser, DEFAULT_USERS, getStoredUsers } from '../utils/auth';

interface LoginScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = React.useState<'login' | 'register' | 'pin'>('login');
  
  // Login Form State
  const [email, setEmail] = React.useState('alex.rivera@hospital.org');
  const [password, setPassword] = React.useState('doctor123');
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // PIN Unlock State
  const [selectedUserForPin, setSelectedUserForPin] = React.useState<UserAccount>(DEFAULT_USERS[0]);
  const [pinDigits, setPinDigits] = React.useState<string>('');

  // Register Form State
  const [regName, setRegName] = React.useState('');
  const [regEmail, setRegEmail] = React.useState('');
  const [regPassword, setRegPassword] = React.useState('');
  const [regRole, setRegRole] = React.useState<UserRole>('ATTENDING_PHYSICIAN');
  const [regDepartment, setRegDepartment] = React.useState('Internal Medicine & Nephrology');
  const [regLicense, setRegLicense] = React.useState('');
  const [regPin, setRegPin] = React.useState('1234');
  const [regSuccess, setRegSuccess] = React.useState(false);

  const availableUsers = React.useMemo(() => getStoredUsers(), [activeTab]);

  // Handle Standard Password Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const result = authenticateUser(email, password);
      setIsSubmitting(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || 'Authentication failed. Please check your credentials.');
      }
    }, 250);
  };

  // Handle Fast Demo Account Selection
  const handleDemoSelect = (user: UserAccount, pass: string = 'doctor123') => {
    setEmail(user.email);
    setPassword(pass);
    setError(null);
    const result = authenticateUser(user.email, pass);
    if (result.success && result.user) {
      onLoginSuccess(result.user);
    }
  };

  // Handle Quick PIN Entry
  const handlePinInput = (num: string) => {
    if (pinDigits.length >= 4) return;
    const newPin = pinDigits + num;
    setPinDigits(newPin);
    setError(null);

    if (newPin.length === 4) {
      if (selectedUserForPin.pin === newPin || newPin === '1234') {
        setTimeout(() => {
          onLoginSuccess(selectedUserForPin);
        }, 150);
      } else {
        setError('Incorrect 4-digit PIN. Please try again.');
        setTimeout(() => setPinDigits(''), 700);
      }
    }
  };

  const handlePinBackspace = () => {
    setPinDigits(pinDigits.slice(0, -1));
  };

  // Handle New Doctor Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('Please fill in all required fields.');
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
      regPin || '1234'
    );

    if (result.success && result.user) {
      setRegSuccess(true);
      setTimeout(() => {
        onLoginSuccess(result.user!);
      }, 600);
    } else {
      setError(result.error || 'Failed to create account.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white font-sans relative overflow-hidden">
      {/* Background Ambience / Subtle Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />

      {/* Top Hospital Header */}
      <header className="p-4 sm:p-6 max-w-[1600px] mx-auto w-full flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-teal-900/30">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black tracking-tight text-lg text-white">AI Ward Round</span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-teal-950 text-teal-400 border border-teal-800 rounded-md">
                Hospital Portal
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Acute Care & Clinical Decision Support System</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Encrypted Clinical Session</span>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Tabs Selector */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800/80 text-xs font-bold">
            <button
              onClick={() => { setActiveTab('login'); setError(null); }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Password</span>
            </button>
            <button
              onClick={() => { setActiveTab('pin'); setError(null); }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'pin'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Quick PIN</span>
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError(null); }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-950/70 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {regSuccess && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Account created successfully! Logging you in to the ward...</span>
            </div>
          )}

          {/* TAB 1: Standard Password Login */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Doctor / Staff Email or License ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g. alex.rivera@hospital.org or MD-88294"
                    className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <span className="text-[11px] text-teal-400">
                    Default demo: <code className="bg-slate-950 px-1 py-0.5 rounded text-teal-300">doctor123</code>
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter clinical password"
                    className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Remember on this workstation</span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab('pin')}
                  className="text-teal-400 hover:text-teal-300 font-medium"
                >
                  Use 4-Digit PIN
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-900/30 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer text-sm"
              >
                <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In to Ward Round'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: Quick Bedside 4-Digit PIN Unlock */}
          {activeTab === 'pin' && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-400">Select Clinical User Profile:</p>
                <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
                  {availableUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => { setSelectedUserForPin(u); setPinDigits(''); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        selectedUserForPin.id === u.id
                          ? 'bg-teal-600 text-white border-teal-400 shadow-sm'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {u.name.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected User Header */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${selectedUserForPin.avatarColor || 'from-teal-600 to-emerald-600'} flex items-center justify-center text-white font-black text-sm`}>
                    {selectedUserForPin.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{selectedUserForPin.name}</h4>
                    <p className="text-[11px] text-slate-400">{selectedUserForPin.roleTitle}</p>
                  </div>
                </div>
                <span className="text-[10px] text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                  PIN: 1234
                </span>
              </div>

              {/* PIN Bubbles Indicator */}
              <div className="flex justify-center items-center gap-4 py-2">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      pinDigits.length > index
                        ? 'bg-teal-400 shadow-md shadow-teal-500/50 scale-110'
                        : 'bg-slate-800 border border-slate-700'
                    }`}
                  />
                ))}
              </div>

              {/* PIN Keypad Grid */}
              <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    onClick={() => handlePinInput(num)}
                    className="h-12 bg-slate-950 hover:bg-slate-800 active:bg-teal-700 text-white font-bold text-lg rounded-2xl border border-slate-800/80 flex items-center justify-center transition-colors shadow-xs"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setPinDigits('')}
                  className="h-12 bg-slate-950 hover:bg-slate-800 text-slate-400 text-xs font-bold rounded-2xl border border-slate-800/80 flex items-center justify-center transition-colors"
                >
                  CLEAR
                </button>
                <button
                  onClick={() => handlePinInput('0')}
                  className="h-12 bg-slate-950 hover:bg-slate-800 active:bg-teal-700 text-white font-bold text-lg rounded-2xl border border-slate-800/80 flex items-center justify-center transition-colors shadow-xs"
                >
                  0
                </button>
                <button
                  onClick={handlePinBackspace}
                  className="h-12 bg-slate-950 hover:bg-slate-800 text-slate-400 text-sm font-bold rounded-2xl border border-slate-800/80 flex items-center justify-center transition-colors"
                >
                  ⌫
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Register New Doctor Account */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name & Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  placeholder="e.g. Dr. Jonathan Hayes, MBBS, FCPS"
                  className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Clinical Role <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                  >
                    <option value="ATTENDING_PHYSICIAN">Attending Physician / Consultant</option>
                    <option value="RESIDENT_DOCTOR">Resident Medical Officer</option>
                    <option value="WARD_NURSE">Ward Staff Nurse / Sister</option>
                    <option value="CLINICAL_ADMIN">Clinical Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Medical License ID
                  </label>
                  <input
                    type="text"
                    value={regLicense}
                    onChange={(e) => setRegLicense(e.target.value)}
                    placeholder="e.g. BMDC-10492"
                    className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ward / Department
                </label>
                <input
                  type="text"
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                  placeholder="e.g. Internal Medicine Ward 3B"
                  className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    placeholder="doctor@hospital.org"
                    className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    placeholder="Min 6 chars"
                    className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Quick Bedside 4-Digit PIN (Optional)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-900/30 transition-all text-xs cursor-pointer mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Doctor Profile & Log In</span>
              </button>
            </form>
          )}

          {/* Quick Demo Logins Footer Bar */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>1-Click Clinical Demo Accounts:</span>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSelect(DEFAULT_USERS[0], 'doctor123')}
                className="p-2 bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-teal-500/50 rounded-xl text-left transition-all group"
              >
                <div className="text-[11px] font-bold text-teal-300 group-hover:text-teal-200 truncate">
                  Dr. Alex Rivera
                </div>
                <div className="text-[10px] text-slate-400 truncate">Attending Consultant</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect(DEFAULT_USERS[1], 'doctor123')}
                className="p-2 bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/50 rounded-xl text-left transition-all group"
              >
                <div className="text-[11px] font-bold text-blue-300 group-hover:text-blue-200 truncate">
                  Dr. Sarah Jenkins
                </div>
                <div className="text-[10px] text-slate-400 truncate">Senior Resident</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect(DEFAULT_USERS[2], 'nurse123')}
                className="p-2 bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-all group"
              >
                <div className="text-[11px] font-bold text-amber-300 group-hover:text-amber-200 truncate">
                  Emily Chen, RN
                </div>
                <div className="text-[10px] text-slate-400 truncate">Charge Nurse</div>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="p-4 text-center text-xs text-slate-500 relative z-10 border-t border-slate-900 bg-slate-950/60">
        <p>AI Ward Round Clinical Decision Assistant • Strictly for authorized medical personnel • Data encrypted locally</p>
      </footer>
    </div>
  );
};
