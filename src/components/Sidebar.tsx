import React from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Zap, 
  Users, 
  TrendingUp, 
  Camera, 
  FileCheck2, 
  CheckSquare, 
  Settings,
  ShieldCheck,
  Stethoscope,
  X,
  Lock,
  LogOut,
  LogIn,
  User,
  KeyRound
} from 'lucide-react';
import { UserAccount } from '../types';

export type NavTab = 
  | 'dashboard'
  | 'preround'
  | 'roundmode'
  | 'patients'
  | 'trends'
  | 'capture'
  | 'dailyround'
  | 'tasks'
  | 'settings';

interface SidebarProps {
  activeTab?: NavTab;
  activeView?: string;
  onTabChange?: (tab: NavTab) => void;
  onViewChange?: (view: string) => void;
  onOpenRoundMode?: () => void;
  pendingTasksCount?: number;
  criticalCount?: number;
  patientsCount?: number;
  mobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
  currentUser?: UserAccount | null;
  onLockSession?: () => void;
  onLogout?: () => void;
  onOpenSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  activeView,
  onTabChange,
  onViewChange,
  onOpenRoundMode,
  pendingTasksCount = 0,
  criticalCount = 0,
  mobileMenuOpen = false,
  onCloseMobileMenu,
  currentUser,
  onLockSession,
  onLogout,
  onOpenSettings,
}) => {
  const currentTab = activeTab || activeView || 'dashboard';

  const handleSelectTab = (id: NavTab) => {
    if (id === 'roundmode' && typeof onOpenRoundMode === 'function') {
      onOpenRoundMode();
    }

    if (typeof onTabChange === 'function') {
      onTabChange(id);
    }

    if (typeof onViewChange === 'function') {
      let mappedView: string = id;
      if (id === 'preround') mappedView = 'brief';
      if (id === 'patients') mappedView = 'profile';
      if (id === 'dailyround') mappedView = 'dashboard';
      onViewChange(mappedView);
    }

    // Close mobile drawer on item selection
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  const isTabActive = (id: NavTab) => {
    const tabStr = currentTab as string;
    const idStr = id as string;
    if (tabStr === idStr) return true;
    if ((tabStr === 'brief' || tabStr === 'preround') && (idStr === 'preround' || idStr === 'brief')) return true;
    if ((tabStr === 'profile' || tabStr === 'patients') && (idStr === 'patients' || idStr === 'profile')) return true;
    return false;
  };

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number | string; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'preround', label: 'Pre-Round Brief', icon: ClipboardList, badge: criticalCount > 0 ? `${criticalCount} Crit` : undefined, badgeColor: 'bg-red-600 text-white' },
    { id: 'roundmode', label: 'Round Mode', icon: Zap, badge: '⚡ Bedside', badgeColor: 'bg-amber-600 text-white' },
    { id: 'patients', label: 'Patients List', icon: Users },
    { id: 'trends', label: 'Investigation Trends', icon: TrendingUp },
    { id: 'capture', label: 'Capture / OCR Review', icon: Camera },
    { id: 'dailyround', label: 'Daily Round Note', icon: FileCheck2 },
    { id: 'tasks', label: 'Today\'s Tasks', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined, badgeColor: 'bg-teal-600 text-white' },
    { id: 'settings', label: 'Settings & AI', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sticky Sidebar (Large screen) */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col justify-between shrink-0 h-full text-slate-300 shadow-xs z-30 select-none">
        <div className="p-3 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Ward Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isTabActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${item.badgeColor || 'bg-slate-800 text-slate-200'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Account & Login Info at Desktop Sidebar Bottom */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-2.5">
          {currentUser ? (
            <div className="bg-slate-800/90 rounded-xl p-2.5 border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentUser.avatarColor || 'from-teal-600 to-emerald-600'} text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0 relative`}>
                  {currentUser.name.charAt(0)}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate leading-tight">
                    {currentUser.name.split(',')[0]}
                  </div>
                  <div className="text-[10px] text-teal-400 font-medium truncate">
                    {currentUser.roleTitle || 'Clinical Physician'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-700/60">
                <button
                  onClick={onLockSession}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-amber-300 rounded-lg text-[11px] font-medium border border-slate-700/50 transition-colors"
                  title="Lock clinical session with PIN"
                >
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Lock</span>
                </button>

                <button
                  onClick={() => {
                    if (onOpenSettings) onOpenSettings();
                    else handleSelectTab('settings');
                  }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white rounded-lg text-[11px] font-medium border border-slate-700/50 transition-colors"
                  title="AI & Ward Settings"
                >
                  <Settings className="w-3 h-3 text-teal-400" />
                  <span>Config</span>
                </button>

                <button
                  onClick={onLogout}
                  className="flex items-center justify-center p-1.5 bg-slate-900/80 hover:bg-red-950/60 text-slate-400 hover:text-red-400 rounded-lg text-[11px] font-medium border border-slate-700/50 transition-colors"
                  title="Log out / Switch doctor"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs shadow-md transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Doctor Login</span>
            </button>
          )}

          {/* Safety Principle */}
          <div className="px-1 text-[10px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-teal-500/80" />
              <span>Verified EMR</span>
            </span>
            <span className="text-[9px] font-mono text-slate-500">v3.2 Secure</span>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay & Sidebar (Click toggle to open and hide) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity duration-200"
            onClick={onCloseMobileMenu}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-80 max-w-[88vw] bg-slate-900 border-r border-slate-800 h-full flex flex-col justify-between text-slate-300 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs font-bold">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white tracking-tight leading-none">
                    AI Ward Round
                  </div>
                  <div className="text-[10px] text-teal-400 font-semibold mt-0.5">
                    Clinical Navigation
                  </div>
                </div>
              </div>
              <button
                onClick={onCloseMobileMenu}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                title="Close Navigation Menu"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <div className="p-3 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Ward Navigation
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isTabActive(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-xs font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.badgeColor || 'bg-slate-800 text-slate-200'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* CLINICAL LOGIN SYSTEM AT BOTTOM OF MOBILE SIDEBAR */}
            <div className="p-3.5 border-t border-slate-800 bg-slate-950/90 space-y-3">
              {currentUser ? (
                <div className="bg-slate-800/90 rounded-2xl p-3 border border-slate-700/80 shadow-md space-y-2.5">
                  {/* Doctor Profile Header */}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentUser.avatarColor || 'from-teal-600 to-emerald-600'} text-white font-black text-sm flex items-center justify-center shadow-md shrink-0 relative`}>
                      {currentUser.name.charAt(0)}
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-extrabold text-white truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-teal-400 font-semibold truncate">
                        {currentUser.roleTitle}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {currentUser.department} • <span className="font-mono text-slate-300">{currentUser.licenseNumber || 'Verified ID'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        if (onCloseMobileMenu) onCloseMobileMenu();
                        if (onLockSession) onLockSession();
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-slate-900 hover:bg-slate-950 text-amber-300 font-bold rounded-xl text-xs border border-amber-500/30 transition-colors shadow-2xs cursor-pointer min-h-[38px]"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Lock Screen</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onCloseMobileMenu) onCloseMobileMenu();
                        if (onOpenSettings) onOpenSettings();
                        else handleSelectTab('settings');
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-slate-900 hover:bg-slate-950 text-slate-200 hover:text-white font-bold rounded-xl text-xs border border-slate-700/60 transition-colors shadow-2xs cursor-pointer min-h-[38px]"
                    >
                      <Settings className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>Settings</span>
                    </button>
                  </div>

                  {/* Logout / Switch Doctor Button */}
                  <button
                    onClick={() => {
                      if (onCloseMobileMenu) onCloseMobileMenu();
                      if (onLogout) onLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-100 font-bold rounded-xl text-xs border border-red-800/40 transition-colors shadow-2xs cursor-pointer min-h-[38px]"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>Sign Out / Switch Doctor</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (onCloseMobileMenu) onCloseMobileMenu();
                    if (onLogout) onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs shadow-md transition-all min-h-[40px] cursor-pointer"
                >
                  <LogIn className="w-4 h-4 shrink-0" />
                  <span>Doctor Login & Authentication</span>
                </button>
              )}

              {/* Security Mandate */}
              <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span className="font-semibold text-slate-300">HIPAA Protected</span>
                </span>
                <span className="text-slate-500 font-mono">Secure Session</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation (Persistent Quick Bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-40 px-2 py-1 flex justify-around items-center text-slate-400 shadow-lg">
        <button
          onClick={() => handleSelectTab('dashboard')}
          className={`flex flex-col items-center p-1.5 text-[10px] font-medium ${
            isTabActive('dashboard') ? 'text-teal-400 font-bold' : 'hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => handleSelectTab('preround')}
          className={`flex flex-col items-center p-1.5 text-[10px] font-medium ${
            isTabActive('preround') ? 'text-teal-400 font-bold' : 'hover:text-slate-200'
          }`}
        >
          <ClipboardList className="w-5 h-5 mb-0.5" />
          <span>Pre-Round</span>
        </button>

        <button
          onClick={() => handleSelectTab('roundmode')}
          className="flex flex-col items-center p-1.5 text-[10px] font-bold text-amber-400"
        >
          <div className="p-1.5 bg-amber-500 text-slate-950 rounded-full shadow-lg -mt-4 border-2 border-slate-900">
            <Zap className="w-5 h-5 fill-slate-950" />
          </div>
          <span>ROUND MODE</span>
        </button>

        <button
          onClick={() => handleSelectTab('patients')}
          className={`flex flex-col items-center p-1.5 text-[10px] font-medium ${
            isTabActive('patients') ? 'text-teal-400 font-bold' : 'hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Patients</span>
        </button>

        <button
          onClick={() => handleSelectTab('capture')}
          className={`flex flex-col items-center p-1.5 text-[10px] font-medium ${
            isTabActive('capture') ? 'text-teal-400 font-bold' : 'hover:text-slate-200'
          }`}
        >
          <Camera className="w-5 h-5 mb-0.5" />
          <span>Capture</span>
        </button>
      </nav>
    </>
  );
};
