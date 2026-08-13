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
  ShieldAlert
} from 'lucide-react';
import { Patient } from '../types';

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
}) => {
  const [showSearchResults, setShowSearchResults] = React.useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);

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
    <header className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Ward Selector */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs font-bold text-lg sm:text-xl shrink-0">
            <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm sm:text-lg text-slate-900 tracking-tight leading-none truncate max-w-[150px] sm:max-w-none">
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
                className="bg-slate-100 text-slate-700 border border-slate-200 rounded px-1 py-0.5 text-[11px] sm:text-xs font-medium focus:outline-none focus:border-teal-600 max-w-[130px] sm:max-w-none truncate"
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
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        p.priority === 'CRITICAL' ? 'bg-red-50 text-red-700 border border-red-200' :
                        p.priority === 'ACTION' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        p.priority === 'REVIEW' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {p.priority}
                      </span>
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
            className="md:hidden flex items-center justify-center w-9 h-9 min-h-[40px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            title="Search Patients"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Round Mode Button */}
          <button
            onClick={onOpenRoundMode}
            className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-2.5 sm:px-3 py-2 min-h-[40px] rounded-xl font-bold text-xs shadow-xs active:scale-95 transition-all"
            title="Fast Bedside Round Mode"
          >
            <Zap className="w-4 h-4 fill-amber-200 text-amber-100 animate-pulse" />
            <span className="inline">ROUND</span>
          </button>

          {/* Capture Report Button */}
          <button
            onClick={onOpenCapture}
            className="flex items-center gap-1 sm:gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-2.5 sm:px-3 py-2 min-h-[40px] rounded-xl font-bold text-xs shadow-xs transition-all"
            title="Photo / Upload Investigation Document"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Capture</span>
          </button>

          {/* Add Patient Button */}
          <button
            onClick={onOpenNewPatient}
            className="hidden sm:flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-2.5 py-2 min-h-[40px] rounded-xl font-bold text-xs transition-colors"
            title="Admit / Add New Patient"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden lg:inline">Admit</span>
          </button>

          {/* Critical Patients Badge Indicator */}
          {criticalCount > 0 && (
            <div className="flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-bounce" />
              <span>{criticalCount}</span>
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
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs">{p.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">({p.bed})</span>
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
