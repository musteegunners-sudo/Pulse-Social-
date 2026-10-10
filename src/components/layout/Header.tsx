import React, { useState } from 'react';
import { 
  Bell, 
  SlidersHorizontal, 
  Search, 
  Menu, 
  X, 
  Plus, 
  RefreshCw, 
  Download, 
  Keyboard 
} from 'lucide-react';
import { NavTab } from './Sidebar';

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

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  home: { title: 'Home', subtitle: 'Things to do & active channels' },
  overview: { title: 'Home', subtitle: 'Things to do & active channels' },
  ideas: { title: 'Ideas', subtitle: 'Draft concepts & brainstorming board' },
  explore: { title: 'Explore', subtitle: 'News, industry headlines & RSS' },
  calendar: { title: 'Calendar', subtitle: 'Visual publishing calendar' },
  media: { title: 'Media Library', subtitle: 'Asset storage, Canva & Stock' },
  analytics: { title: 'Analytics', subtitle: 'Performance & post insights' },
  accounts: { title: 'Channels', subtitle: 'OAuth credentials & mother apps' },
  tools: { title: 'Publer Tools', subtitle: 'Hashtag bundles, signatures & Link in Bio' },
  whatsapp: { title: 'WhatsApp', subtitle: 'Direct chats & status stories' },
  queue: { title: 'Queue', subtitle: 'AutoSchedule queue slots' },
  inbox: { title: 'Inbox', subtitle: 'Comments & mentions' },
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
  const meta = TAB_TITLES[activeTab] || { title: 'Home', subtitle: '' };
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <header className="h-14 sm:h-16 px-4 sm:px-6 bg-white border-b border-slate-200/90 flex items-center justify-between shrink-0 relative z-20 select-none">
      
      {/* Publer Mobile & Desktop Header: Left "M" Avatar, Center Title, Right Bell + Menu */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
        
        {/* Left: Squircle "M" Avatar (Screenshot 1-6 Left) */}
        <div 
          onClick={onOpenMobileMenu}
          className="w-8.5 h-8.5 rounded-xl bg-[#1e1b4b] hover:bg-[#2e1065] text-white font-black flex items-center justify-center text-sm shadow-xs cursor-pointer select-none transition-transform active:scale-95 shrink-0"
          title="Account Menu"
        >
          M
        </div>

        {/* Center: Bold Title (Screenshot 1-6 Center) */}
        <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight text-center truncate px-2">
          {meta.title}
        </h1>

        {/* Right: Bell with Pink Dot & Menu Icon (Screenshot 1-6 Right) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            className="relative p-1.5 text-slate-700 hover:text-slate-900 rounded-lg cursor-pointer transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-800" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-pink-500 ring-2 ring-white" />
          </button>

          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="p-1.5 text-slate-700 hover:text-slate-900 rounded-lg cursor-pointer transition-colors"
              title="Filter & menu"
            >
              <SlidersHorizontal className="w-5 h-5 text-slate-800" />
            </button>
          )}
        </div>

      </div>

    </header>
  );
};
