import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Layers, 
  BarChart3, 
  MessageSquareText, 
  Share2, 
  PlusCircle,
  TrendingUp,
  X,
  Sparkles,
  Keyboard,
  Wrench,
  Home,
  LayoutGrid,
  Compass,
  Image as ImageIcon
} from 'lucide-react';
import { SocialAccount } from '../../types';
import { PlatformIcon } from '../common/PlatformIcon';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { ApkInstallButton } from './ApkInstallButton';
import { UserMenu } from '../auth/UserMenu';

export type NavTab = 
  | 'home'
  | 'ideas'
  | 'explore'
  | 'calendar'
  | 'media'
  | 'analytics'
  | 'overview'
  | 'queue'
  | 'inbox'
  | 'whatsapp'
  | 'accounts'
  | 'tools';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  accounts: SocialAccount[];
  onOpenComposer: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenShortcuts?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  accounts,
  onOpenComposer,
  isMobileOpen = false,
  onCloseMobile,
  onOpenShortcuts,
}) => {
  const connectedCount = accounts.filter(a => a.isConnected).length;

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode; shortcut: string; badge?: number }> = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4 shrink-0 text-cyan-600" />, shortcut: '1' },
    { id: 'ideas', label: 'Ideas Board', icon: <LayoutGrid className="w-4 h-4 shrink-0 text-amber-500" />, shortcut: '2' },
    { id: 'explore', label: 'Explore & News', icon: <Compass className="w-4 h-4 shrink-0 text-cyan-500" />, shortcut: '3' },
    { id: 'calendar', label: 'Calendar', icon: <CalendarDays className="w-4 h-4 shrink-0 text-blue-500" />, shortcut: '4' },
    { id: 'media', label: 'Media Library', icon: <ImageIcon className="w-4 h-4 shrink-0 text-purple-500" />, shortcut: '5' },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4 shrink-0 text-emerald-500" />, shortcut: '6' },
    { id: 'accounts', label: 'Connected Channels', icon: <Share2 className="w-4 h-4 shrink-0" />, shortcut: '7' },
    { id: 'tools', label: 'Social Media Tools', icon: <Wrench className="w-4 h-4 shrink-0" />, shortcut: '8' },
    { id: 'whatsapp', label: 'WhatsApp Messenger', icon: <PlatformIcon platform="whatsapp" size={16} className="w-4 h-4 shrink-0 text-emerald-600" />, shortcut: '9', badge: 2 },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const handleComposerClick = () => {
    onOpenComposer();
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 tracking-tight text-base block leading-none">
              PulseSocial
            </span>
            <span className="text-[11px] text-slate-500 font-medium tracking-normal mt-0.5 block">
              Multi-Network Suite
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="p-3 shrink-0">
        <button
          onClick={handleComposerClick}
          className="w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Create & Schedule</span>
          </div>
          <kbd className="hidden md:inline-flex items-center justify-center font-mono text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 font-semibold">
            C
          </kbd>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="px-2 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Workspace
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer group ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={isActive ? 'text-indigo-600' : 'text-slate-500'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {item.badge !== undefined && (
                  <span className="text-[10px] font-mono tabular-nums text-indigo-600 bg-indigo-100/70 px-1.5 py-0.5 rounded font-medium">
                    {item.badge}
                  </span>
                )}
                <kbd className="hidden md:inline-flex items-center justify-center text-[10px] font-mono text-slate-400 group-hover:text-slate-600 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                  {item.shortcut}
                </kbd>
              </div>
            </button>
          );
        })}

        {/* Connected Channels List */}
        <div className="pt-4 pb-1 px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Connected Channels</span>
          <span className="text-[10px] font-mono tabular-nums text-slate-500">{connectedCount} Active</span>
        </div>
        <div className="space-y-1">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              onClick={() => handleNavClick('accounts')}
              className="min-h-[40px] flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0 text-slate-500">
                  <PlatformIcon platform={acc.platform} size={14} />
                </span>
                <span className="truncate text-slate-700 font-normal">{acc.handle}</span>
              </div>
              <span className={`w-2 h-2 rounded-full shrink-0 ${acc.isConnected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            </div>
          ))}
        </div>
      </nav>

      {/* Footer / Navigation Bottom - User Account & APK Install */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0 space-y-2">
        {/* User Account / Sign In Widget */}
        <UserMenu variant="sidebar" />

        {/* Dedicated Android APK Install Button at Navigation Bottom */}
        <ApkInstallButton variant="sidebar" />

        {/* Mobile PWA Install Banner */}
        <PWAInstallButton variant="sidebar" />

        {onOpenShortcuts && (
          <button
            onClick={() => {
              onOpenShortcuts();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-indigo-600 py-1.5 px-2 rounded-lg hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            title="View keyboard shortcuts"
          >
            <div className="flex items-center gap-2">
              <Keyboard className="w-3.5 h-3.5 text-slate-400" />
              <span>Keyboard Shortcuts</span>
            </div>
            <kbd className="font-mono text-[10px] bg-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded border border-slate-300/70 font-bold">
              ?
            </kbd>
          </button>
        )}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span className="font-mono text-[11px]">v2.4.0 Stable</span>
          <span className="text-slate-400 font-medium">Synced · Live</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col h-screen shrink-0 select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-over with Backdrop Blur) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop overlay */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
          />

          {/* Drawer container */}
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

