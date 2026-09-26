import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Layers, 
  BarChart3, 
  Share2,
  MessageSquareText,
  MessageSquare,
  Menu
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface MobileTabBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenMobileMenu: () => void;
  inboxBadge?: number;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenMobileMenu,
  inboxBadge = 3,
}) => {
  const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="w-5 h-5 text-emerald-600" />, badge: 2 },
    { id: 'queue', label: 'Queue', icon: <Layers className="w-5 h-5" /> },
    { id: 'accounts', label: 'Channels', icon: <Share2 className="w-5 h-5" /> },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation" 
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden pb-safe shadow-lg"
    >
      <div className="grid grid-cols-6 items-center h-16 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`min-h-[48px] min-w-[44px] flex flex-col items-center justify-center relative rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? 'text-indigo-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-indigo-600 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center font-mono">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-full px-0.5">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-4 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          );
        })}

        {/* 6th Slot: More / Mobile Menu Trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="min-h-[48px] min-w-[44px] flex flex-col items-center justify-center relative rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          title="More options & channels"
        >
          <div className="relative">
            <Menu className="w-5 h-5" />
            {inboxBadge > 0 && activeTab !== 'inbox' && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-indigo-600" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 truncate">
            More
          </span>
        </button>
      </div>
    </nav>
  );
};
