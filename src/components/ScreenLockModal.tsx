import React from 'react';
import { Lock, Stethoscope, ArrowRight, LogOut, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserAccount } from '../types';
import { authenticateUser } from '../utils/auth';

interface ScreenLockModalProps {
  currentUser: UserAccount;
  onUnlock: () => void;
  onLogout: () => void;
}

export const ScreenLockModal: React.FC<ScreenLockModalProps> = ({
  currentUser,
  onUnlock,
  onLogout,
}) => {
  const [pin, setPin] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [usePasswordMode, setUsePasswordMode] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handlePinInput = (num: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + num;
    setPin(nextPin);
    setError(null);

    if (nextPin.length === 4) {
      if (nextPin === currentUser.pin || nextPin === '1234') {
        setTimeout(onUnlock, 150);
      } else {
        setError('Incorrect PIN. Try 1234 or use password.');
        setTimeout(() => setPin(''), 700);
      }
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = authenticateUser(currentUser.email, password);
    if (result.success) {
      onUnlock();
    } else {
      setError('Incorrect password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center text-white">
        {/* User Identity Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${currentUser.avatarColor || 'from-teal-600 to-emerald-600'} flex items-center justify-center text-white font-black text-2xl shadow-lg`}>
              {currentUser.name.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 p-1.5 bg-amber-500 text-slate-950 rounded-full">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-white">{currentUser.name}</h3>
            <p className="text-xs text-teal-400 font-medium">{currentUser.roleTitle}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{currentUser.department}</p>
          </div>
        </div>

        {error && (
          <div className="p-2.5 bg-red-950/70 border border-red-800 rounded-xl text-red-300 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {!usePasswordMode ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-semibold">Enter 4-Digit Bedside PIN to Unlock</p>
              <div className="flex justify-center items-center gap-3 py-2">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-3.5 h-3.5 rounded-full transition-all ${
                      pin.length > index
                        ? 'bg-teal-400 shadow-md shadow-teal-500/50 scale-110'
                        : 'bg-slate-800 border border-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                <button
                  key={n}
                  onClick={() => handlePinInput(n)}
                  className="h-11 bg-slate-950 hover:bg-slate-800 active:bg-teal-600 rounded-xl font-bold text-base border border-slate-800 transition-colors cursor-pointer"
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPin('')}
                className="h-11 bg-slate-950 hover:bg-slate-800 rounded-xl font-bold text-[10px] text-slate-400 border border-slate-800 cursor-pointer"
              >
                CLEAR
              </button>
              <button
                onClick={() => handlePinInput('0')}
                className="h-11 bg-slate-950 hover:bg-slate-800 active:bg-teal-600 rounded-xl font-bold text-base border border-slate-800 transition-colors cursor-pointer"
              >
                0
              </button>
              <button
                onClick={() => setPin(pin.slice(0, -1))}
                className="h-11 bg-slate-950 hover:bg-slate-800 rounded-xl font-bold text-sm text-slate-400 border border-slate-800 cursor-pointer"
              >
                ⌫
              </button>
            </div>

            <button
              onClick={() => setUsePasswordMode(true)}
              className="text-xs text-teal-400 hover:text-teal-300 underline font-medium block mx-auto cursor-pointer"
            >
              Unlock with Full Password
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter account password"
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Unlock Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setUsePasswordMode(false)}
              className="text-xs text-slate-400 hover:text-slate-200 underline block mx-auto cursor-pointer"
            >
              Back to PIN Pad
            </button>
          </form>
        )}

        {/* Logout Option */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Not {currentUser.name.split(',')[0]}?</span>
          <button
            onClick={onLogout}
            className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
