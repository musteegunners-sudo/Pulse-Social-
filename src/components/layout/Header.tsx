import React, { useState } from 'react';
import { Plus, Download, RefreshCw, Search, Menu, X, TrendingUp, Keyboard } from 'lucide-react';
import { NavTab } from './Sidebar';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { UserMenu } from '../auth/UserMenu';

interface HeaderProps {
  activeTab: NavTab;
  onOpenComposer: () => void;
  onExportCsv?: () => void;
  onResetData: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenMobileMenu?: () => void;
  onOpenShortcuts?: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  overview: { title: 'Dashboard', subtitle: 'Cross-platform performance & upcoming publishing schedule' },
  calendar: { title: 'Content Calendar', subtitle: 'Visual multi-channel scheduling & editorial pipeline' },
  queue: { title: 'Publishing Queue', subtitle: 'Automated time slots and scheduled release buffer' },
  analytics: { title: 'Performance Analytics', subtitle: 'Cross-network audience reach, CTR, engagement & ROI' },
  inbox: { title: 'Social Inbox', subtitle: 'Unified incoming comments, direct messages & mentions' },
  whatsapp: { title: 'WhatsApp Messenger', subtitle: 'Direct messages, contact chats, 24h status stories & click-to-chat' },
  accounts: { title: 'Connected Channels', subtitle: 'OAuth credentials, channel status & follower health' },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenComposer,
  onExportCsv,
  onResetData,
  searchQuery,
  onSearchChange,
  onOpenMobileMenu,
  onOpenShortcuts,
  searchInputRef,
}) => {
  const meta = TAB_TITLES[activeTab] || { title: 'Dashboard', subtitle: '' };
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 relative z-20">
      
      {/* Mobile Search Overlay if opened */}
      {isMobileSearchOpen ? (
        <div className="flex md:hidden items-center gap-2 w-full animate-in fade-in duration-150">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search posts, tags, authors..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setIsMobileSearchOpen(false)}
            className="min-h-[44px] px-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          {/* Zone 1: Breadcrumb, Brand icon & Context */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Hamburger for mobile */}
            {onOpenMobileMenu && (
              <button
                onClick={onOpenMobileMenu}
                className="md:hidden min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Mobile Brand Mark */}
            <div className="md:hidden flex items-center gap-1.5 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-2xs">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
                <span className="hidden sm:inline">PulseMedia</span>
                <span className="hidden sm:inline" aria-hidden="true">/</span>
                <span className="text-slate-900 font-semibold truncate">{meta.title}</span>
              </div>
              <p className="text-xs text-slate-500 hidden lg:block truncate max-w-md">
                {meta.subtitle}
              </p>
            </div>
          </div>

          {/* Zone 2: Desktop Search Input */}
          <div className="hidden md:flex items-center relative max-w-xs w-64 mx-4">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search posts, tags..."
              className="w-full pl-8 pr-12 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800 placeholder:text-slate-400 transition-colors"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 text-slate-400 hover:text-slate-600"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <div className="absolute right-2 flex items-center gap-0.5 pointer-events-none">
                <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded">
                  /
                </kbd>
              </div>
            )}
          </div>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              title="Search posts (S)"
              className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Keyboard Shortcuts Dialog Button */}
            {onOpenShortcuts && (
              <button
                onClick={onOpenShortcuts}
                title="Keyboard Shortcuts (?)"
                className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 p-2 sm:p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg sm:rounded-md transition-colors cursor-pointer flex items-center justify-center group"
                aria-label="Keyboard shortcuts"
              >
                <Keyboard className="w-4 h-4 sm:w-3.5 sm:h-3.5 group-hover:text-indigo-600 transition-colors" />
              </button>
            )}

            {/* Reset Data Button */}
            <button
              onClick={onResetData}
              title="Reset to initial sample data"
              className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 p-2 sm:p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg sm:rounded-md transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Reset demo data"
            >
              <RefreshCw className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            </button>

            {onExportCsv && (
              <button
                onClick={onExportCsv}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors cursor-pointer shadow-2xs whitespace-nowrap min-h-[36px]"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            )}

            {/* PWA Mobile App Install Button */}
            <PWAInstallButton variant="nav" />

            {/* New Post Button */}
            <button
              onClick={onOpenComposer}
              title="Compose Post (C)"
              className="min-h-[44px] sm:min-h-0 flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg sm:rounded-md transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">New Post</span>
              <span className="xs:hidden">Post</span>
              <kbd className="hidden lg:inline-flex items-center justify-center ml-1 px-1 py-0.2 text-[10px] font-mono font-bold text-indigo-200 bg-indigo-700/80 rounded">
                C
              </kbd>
            </button>

            {/* User Account / Sign In / Register / Log Out */}
            <div className="pl-1 border-l border-slate-200">
              <UserMenu variant="header" />
            </div>
          </div>
        </>
      )}
    </header>
  );
};
