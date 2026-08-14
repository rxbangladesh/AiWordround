import React from 'react';
import { 
  Stethoscope, 
  Search, 
  Plus, 
  Zap, 
  Camera, 
  FileText, 
  Bell, 
  AlertTriangle,
  User,
  ShieldAlert,
  Lock,
  LogOut,
  Settings,
  ChevronDown,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { Patient, UserAccount } from '../types';

interface NavbarProps {
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  patients?: Patient[];
  onSelectPatient?: (patient: Patient) => void;
  onOpenRoundMode?: () => void;
  onOpenCapture?: () => void;
  onOpenNewPatient?: () => void;
  selectedWard?: string;
  onWardChange?: (ward: string) => void;
  currentUser?: UserAccount | null;
  onLockSession?: () => void;
  onLogout?: () => void;
  onOpenSettings?: () => void;
  mobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchTerm = '',
  onSearchChange,
  patients = [],
  onSelectPatient,
  onOpenRoundMode,
  onOpenCapture,
  onOpenNewPatient,
  selectedWard = 'ALL',
  onWardChange,
  currentUser,
  onLockSession,
  onLogout,
  onOpenSettings,
  mobileMenuOpen = false,
  onToggleMobileMenu,
}) => {
  const [showSearchResults, setShowSearchResults] = React.useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPatients = React.useMemo(() => {
    if (!searchTerm || typeof searchTerm !== 'string' || !searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return patients.filter(
      p =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.patientId && p.patientId.toLowerCase().includes(term)) ||
        (p.bed && p.bed.toLowerCase().includes(term)) ||
        (p.primaryDiagnosis && p.primaryDiagnosis.toLowerCase().includes(term))
    );
  }, [searchTerm, patients]);

  const criticalCount = patients.filter(p => p.priority === 'CRITICAL').length;
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-40 shadow-xs shrink-0 w-full">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand, Ward Selector & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Sidebar Hamburger Toggle */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 min-h-[36px] sm:min-h-[40px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
            title={mobileMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
            aria-label="Toggle Ward Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
          </button>

          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs font-bold text-base sm:text-xl shrink-0">
            <Stethoscope className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-xs sm:text-lg text-slate-900 tracking-tight leading-none truncate max-w-[130px] sm:max-w-none">
                AI Ward Round
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-teal-50 text-teal-700 border border-teal-200 rounded-md">
                Doctor Mode
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 mt-0.5">
              <span className="hidden xs:inline">{todayStr}</span>
              <span className="hidden xs:inline">•</span>
              <select
                value={selectedWard}
                onChange={(e) => onWardChange?.(e.target.value)}
                className="bg-slate-100 text-slate-700 border border-slate-200 rounded px-1 py-0.5 text-[11px] sm:text-xs font-medium focus:outline-none focus:border-teal-600 max-w-[120px] sm:max-w-none truncate"
              >
                <option value="ALL">All Wards / Units</option>
                <option value="Ward 3B - Nephrology/Internal Med">Ward 3B (Nephro/IM)</option>
                <option value="Ward 2A - Gastroenterology">Ward 2A (Gastro)</option>
                <option value="Ward 1B - Respiratory Med">Ward 1B (Respiratory)</option>
                <option value="Ward 1A - Surgical Ward">Ward 1A (Surgical)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fast Patient Search Bar (Desktop) */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                onSearchChange?.(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Quick search by name, Bed 04, PT ID, or diagnosis..."
              className="w-full bg-slate-100 text-slate-900 placeholder-slate-400 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-all"
            />
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && filteredPatients.length > 0 && (
            <div 
              className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 divide-y divide-slate-100 max-h-80 overflow-y-auto"
              onMouseLeave={() => setShowSearchResults(false)}
            >
              {filteredPatients.map((p) => (
                <button
                  key={p.patientId}
                  onClick={() => {
                    onSelectPatient?.(p);
                    setShowSearchResults(false);
                    onSearchChange?.('');
                  }}
                  className="w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                      <span className="text-xs text-slate-500 font-mono">({p.bed})</span>
                      {p.status === 'DISCHARGED' ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-800 text-slate-200 border border-slate-700 uppercase">
                          Discharged
                        </span>
                      ) : (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          p.priority === 'CRITICAL' ? 'bg-red-50 text-red-700 border border-red-200' :
                          p.priority === 'ACTION' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          p.priority === 'REVIEW' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {p.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{p.primaryDiagnosis}</p>
                  </div>
                  <span className="text-xs text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                    Open Profile →
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 min-h-[36px] sm:min-h-[40px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
            title="Search Patients"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Round Mode Button (Icon only on mobile, with text on sm+) */}
          <button
            onClick={onOpenRoundMode}
            className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-2.5 sm:px-3 py-2 min-h-[36px] sm:min-h-[40px] rounded-xl font-bold text-xs shadow-xs active:scale-95 transition-all shrink-0"
            title="Fast Bedside Round Mode"
          >
            <Zap className="w-4 h-4 fill-amber-200 text-amber-100 animate-pulse shrink-0" />
            <span className="hidden sm:inline">ROUND</span>
          </button>

          {/* Capture Report Button (Hidden on mobile, visible on sm+ screens) */}
          <button
            onClick={onOpenCapture}
            className="hidden sm:flex items-center gap-1 sm:gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-2.5 sm:px-3 py-2 min-h-[36px] sm:min-h-[40px] rounded-xl font-bold text-xs shadow-xs transition-all shrink-0"
            title="Photo / Upload Investigation Document"
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Capture</span>
          </button>

          {/* Add Patient Button */}
          <button
            onClick={onOpenNewPatient}
            className="flex items-center gap-1 sm:gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-2.5 sm:px-3 py-2 min-h-[36px] sm:min-h-[40px] rounded-xl font-bold text-xs transition-colors shrink-0"
            title="Admit / Add New Patient"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Admit</span>
          </button>

          {/* User Profile & Lock Dropdown (Desktop/Tablet top navbar; in mobile it is located at left sidebar bottom) */}
          {currentUser && (
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors text-left group cursor-pointer"
                title="Current Doctor Profile & Session"
              >
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br ${currentUser.avatarColor || 'from-teal-600 to-emerald-600'} text-white font-bold text-xs flex items-center justify-center shadow-2xs`}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden xl:block max-w-[120px]">
                  <div className="text-xs font-bold text-slate-900 truncate leading-tight">
                    {currentUser.name.split(',')[0]}
                  </div>
                  <div className="text-[10px] text-teal-700 font-semibold truncate leading-none">
                    {currentUser.role === 'ATTENDING_PHYSICIAN' ? 'Consultant' : currentUser.role === 'RESIDENT_DOCTOR' ? 'Resident' : 'Nurse'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-2 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${currentUser.avatarColor || 'from-teal-600 to-emerald-600'} text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0`}>
                        {currentUser.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 truncate">{currentUser.name}</div>
                        <div className="text-[11px] text-teal-700 font-medium truncate">{currentUser.roleTitle}</div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100 mt-1 truncate">
                      {currentUser.department} • {currentUser.licenseNumber || 'Verified ID'}
                    </div>
                  </div>

                  <div className="pt-1.5 space-y-1 text-xs">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLockSession?.();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition-colors font-medium text-left"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Lock Bedside Screen (PIN)</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenSettings?.();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors font-medium text-left"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>Password & Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout?.();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-bold text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      <span>Sign Out / Switch Doctor</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Row Bar (Expands on Mobile) */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-slate-200 bg-slate-50 p-2.5 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                onSearchChange?.(e.target.value);
                setShowSearchResults(true);
              }}
              autoFocus
              placeholder="Search by patient name, bed, or diagnosis..."
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange?.('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Mobile Search Results list */}
          {filteredPatients.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100">
              {filteredPatients.map((p) => (
                <button
                  key={p.patientId}
                  onClick={() => {
                    onSelectPatient?.(p);
                    setMobileSearchOpen(false);
                    onSearchChange?.('');
                  }}
                  className="w-full text-left p-2.5 hover:bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs">{p.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">({p.bed})</span>
                      {p.status === 'DISCHARGED' && (
                        <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-slate-800 text-slate-200 uppercase">
                          Discharged
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1">{p.primaryDiagnosis}</p>
                  </div>
                  <span className="text-[11px] text-teal-600 font-bold">Select →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
