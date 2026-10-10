import React from 'react';
import { 
  Home, 
  LayoutGrid, 
  Compass, 
  CalendarDays, 
  Image as ImageIcon, 
  TrendingUp, 
  Plus
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface MobileTabBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenMobileMenu?: () => void;
  onOpenComposer?: () => void;
  inboxBadge?: number;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenComposer,
}) => {
  const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5 stroke-[1.8]" /> },
    { id: 'ideas', label: 'Ideas', icon: <LayoutGrid className="w-5 h-5 stroke-[1.8]" /> },
    { id: 'explore', label: 'Explore', icon: <Compass className="w-5 h-5 stroke-[1.8]" /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarDays className="w-5 h-5 stroke-[1.8]" /> },
    { id: 'media', label: 'Media', icon: <ImageIcon className="w-5 h-5 stroke-[1.8]" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-5 h-5 stroke-[1.8]" /> },
  ];

  return (
    <>
      {/* Publer Floating Action Button (FAB) floating on bottom right above bar */}
      {onOpenComposer && (
        <button
          type="button"
          onClick={onOpenComposer}
          className="fixed bottom-20 right-4 z-40 w-13 h-13 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-cyan-500 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-cyan-500/10"
          title="Create New Post"
          aria-label="Create New Post"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      )}

      {/* Publer 6-Icon Mobile Bottom Bar */}
      <nav 
        aria-label="Publer Navigation Bar" 
        className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200/90 shadow-lg pb-safe select-none"
      >
        <div className="grid grid-cols-6 items-center h-14 px-1 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id || (tab.id === 'home' && activeTab === 'overview');
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`min-h-[44px] flex flex-col items-center justify-center relative rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-cyan-500 font-bold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title={tab.label}
              >
                {tab.icon}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
