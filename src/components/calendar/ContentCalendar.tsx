import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  CheckCircle2, 
  FileEdit,
  Trash2,
  ExternalLink,
  Eye
} from 'lucide-react';
import { SocialPlatform, SocialPost, PostStatus, SocialAccount } from '../../types';
import { PlatformIcon, getPlatformName } from '../common/PlatformIcon';

interface ContentCalendarProps {
  posts: SocialPost[];
  accounts?: SocialAccount[];
  onOpenComposer: (initialDate?: string, post?: SocialPost) => void;
  onDeletePost: (id: string) => void;
  onSelectPostDetails: (post: SocialPost) => void;
}

export const ContentCalendar: React.FC<ContentCalendarProps> = ({
  posts,
  accounts = [],
  onOpenComposer,
  onDeletePost,
  onSelectPostDetails,
}) => {
  // Current calendar month view state (October 2026 as in Screenshot 4)
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 9, 1));
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [filterPlatform, setFilterPlatform] = useState<SocialPlatform | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<PostStatus | 'all'>('all');
  const [calendarSearch, setCalendarSearch] = useState('');

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month calculation (Monday start: 0 = Mon, ..., 6 = Sun)
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Filter posts
  const filteredPosts = posts.filter(p => {
    if (filterPlatform !== 'all' && !p.platforms.includes(filterPlatform)) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (calendarSearch.trim()) {
      if (!p.content.toLowerCase().includes(calendarSearch.toLowerCase())) return false;
    }
    return true;
  });

  // Group posts by day key: "YYYY-MM-DD"
  const postsByDate: Record<string, SocialPost[]> = {};
  filteredPosts.forEach(p => {
    const dStr = p.scheduledFor ? p.scheduledFor.slice(0, 10) : '';
    if (dStr) {
      if (!postsByDate[dStr]) postsByDate[dStr] = [];
      postsByDate[dStr].push(p);
    }
  });

  // Calendar cells array (42 cells: 6 rows of 7 days)
  const calendarCells = [];
  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, dayNum);
    const dateStr = prevMonthDate.toISOString().slice(0, 10);
    calendarCells.push({
      dateStr,
      dayNum,
      isCurrentMonth: false,
      date: prevMonthDate,
    });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const thisDate = new Date(year, month, i);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarCells.push({
      dateStr,
      dayNum: i,
      isCurrentMonth: true,
      date: thisDate,
    });
  }
  // Next month leading days
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthDate = new Date(year, month + 1, i);
    const dateStr = nextMonthDate.toISOString().slice(0, 10);
    calendarCells.push({
      dateStr,
      dayNum: i,
      isCurrentMonth: false,
      date: nextMonthDate,
    });
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="p-3 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 animate-in fade-in duration-200">
      
      {/* 1. Accounts Switcher Dock (Screenshot 4 Top) */}
      {accounts.length > 0 && (
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              onClick={() => setFilterPlatform(filterPlatform === acc.platform ? 'all' : acc.platform)}
              className={`flex flex-col items-center shrink-0 cursor-pointer transition-all ${
                filterPlatform === acc.platform ? 'scale-105' : 'opacity-80 hover:opacity-100'
              }`}
            >
              <div className="relative">
                <img
                  src={acc.avatarUrl}
                  alt={acc.name}
                  className={`w-11 h-11 rounded-full object-cover border-2 shadow-xs ${
                    filterPlatform === acc.platform ? 'border-cyan-500 ring-2 ring-cyan-200' : 'border-white'
                  }`}
                />
                <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs border border-slate-100">
                  <PlatformIcon platform={acc.platform} size={12} />
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[56px] mt-1 text-center">
                {acc.name.length > 6 ? `${acc.name.slice(0, 5)}...` : acc.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 2. Month Navigation & Controls (Screenshot 4 Header) */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={goToToday}
          className="text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
        >
          <CalendarIcon className="w-5 h-5 text-slate-400" />
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            {monthNames[month]} {year}
          </h2>

          <button
            type="button"
            onClick={nextMonth}
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setViewMode(viewMode === 'month' ? 'list' : 'month')}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          title="Toggle view"
        >
          <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
            <span className="bg-slate-400 rounded-xs" />
            <span className="bg-slate-400 rounded-xs" />
            <span className="bg-slate-400 rounded-xs" />
            <span className="bg-slate-400 rounded-xs" />
          </div>
        </button>
      </div>

      {/* 3. Filters & Search Bar (Screenshot 4 Subheader) */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="text-xs sm:text-sm font-bold text-slate-900 bg-transparent border-0 focus:outline-none cursor-pointer pr-4"
          >
            <option value="all">All Posts</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>

        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search here"
            value={calendarSearch}
            onChange={(e) => setCalendarSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
        </div>
      </div>

      {/* 4. Month Grid (Screenshot 4 Calendar Grid) */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Day of Week Headers (Cyan Text in Screenshot 4!) */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-white text-center py-2 text-xs font-bold text-cyan-500">
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
            <div>Su</div>
          </div>

          {/* 42 Calendar Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {calendarCells.map((cell, idx) => {
              const dayPosts = postsByDate[cell.dateStr] || [];
              const isToday = cell.dateStr === todayStr;

              return (
                <div
                  key={idx}
                  onClick={() => onOpenComposer(cell.dateStr)}
                  className={`min-h-[64px] sm:min-h-[85px] p-1.5 flex flex-col justify-between group transition-colors relative cursor-pointer ${
                    cell.isCurrentMonth ? 'bg-white hover:bg-cyan-50/30' : 'bg-slate-50/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        cell.isCurrentMonth ? 'text-slate-800' : 'text-slate-300'
                      }`}
                    >
                      {cell.dayNum}
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block ml-1 mb-0.5" />
                      )}
                    </span>
                  </div>

                  {/* Post Indicators in Cell */}
                  <div className="space-y-1 my-1">
                    {dayPosts.slice(0, 2).map((p) => (
                      <div
                        key={p.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPostDetails(p);
                        }}
                        className="p-1 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 text-[9px] font-bold truncate flex items-center gap-1"
                        title={p.content}
                      >
                        <PlatformIcon platform={p.platforms[0] || 'twitter'} size={10} />
                        <span className="truncate">{p.content.slice(0, 15)}</span>
                      </div>
                    ))}
                    {dayPosts.length > 2 && (
                      <span className="text-[9px] font-bold text-slate-400">
                        +{dayPosts.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Bottom Notice Card (Screenshot 4 Floating Notice) */}
      <div className="p-3.5 bg-cyan-50/80 border border-cyan-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-cyan-950">
        <div className="flex items-start gap-2.5">
          <span className="text-cyan-600 font-bold text-base mt-0.5">ⓘ</span>
          <div className="space-y-0.5">
            <h4 className="font-bold text-slate-900">Upgrade plan for eternal post history</h4>
            <p className="text-[11px] text-slate-600 leading-snug">
              In the free version of Publer, published posts are stored for only 24 hours.
            </p>
            <button
              type="button"
              onClick={() => onOpenComposer()}
              className="text-[11px] font-bold text-cyan-600 hover:text-cyan-700 pt-0.5 block"
            >
              Upgrade Plan &gt;
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {}}
          className="text-slate-400 hover:text-slate-600 p-1"
        >
          ✕
        </button>
      </div>

    </div>
  );
};
