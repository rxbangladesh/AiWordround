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
  ShieldCheck
} from 'lucide-react';

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
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  activeView,
  onTabChange,
  onViewChange,
  onOpenRoundMode,
  pendingTasksCount = 0,
  criticalCount = 0,
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
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col justify-between shrink-0 sticky top-16 h-[calc(100vh-4rem)] text-slate-300 shadow-xs">
        <div className="p-3 space-y-1 overflow-y-auto">
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

        {/* Safety Principle Banner at Bottom */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70">
          <div className="p-2.5 bg-slate-800/90 rounded-lg border border-slate-700/80 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-teal-400 mb-0.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Safety Mandate</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-snug">
              Extract accurately. Never guess. Always verify before saving.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50 px-2 py-1 flex justify-around items-center text-slate-400">
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
