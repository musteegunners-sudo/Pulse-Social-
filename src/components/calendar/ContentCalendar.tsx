import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  Filter, 
  CheckCircle2, 
  FileEdit,
  Trash2,
  ExternalLink,
  Eye
} from 'lucide-react';
import { SocialPlatform, SocialPost, PostStatus } from '../../types';
import { PlatformIcon, getPlatformName } from '../common/PlatformIcon';

interface ContentCalendarProps {
  posts: SocialPost[];
  onOpenComposer: (initialDate?: string, post?: SocialPost) => void;
  onDeletePost: (id: string) => void;
  onSelectPostDetails: (post: SocialPost) => void;
}

export const ContentCalendar: React.FC<ContentCalendarProps> = ({
  posts,
  onOpenComposer,
  onDeletePost,
  onSelectPostDetails,
}) => {
  // Current calendar month view state
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [filterPlatform, setFilterPlatform] = useState<SocialPlatform | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<PostStatus | 'all'>('all');

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

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
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
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Calendar Controls & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200">
        
        {/* Month Navigation & Title */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={prevMonth}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded cursor-pointer transition-colors"
              title="Previous Month"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="min-h-[36px] px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-white rounded cursor-pointer transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded cursor-pointer transition-colors"
              title="Next Month"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
            {monthNames[month]} {year}
          </h2>
        </div>

        {/* View Switcher & Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          
          {/* Platform Filter */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 border border-slate-200 rounded-lg text-xs overflow-x-auto">
            <button
              onClick={() => setFilterPlatform('all')}
              className={`min-h-[32px] px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
                filterPlatform === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            {(['twitter', 'linkedin', 'instagram', 'facebook'] as SocialPlatform[]).map(p => (
              <button
                key={p}
                onClick={() => setFilterPlatform(p)}
                className={`min-h-[32px] min-w-[32px] flex items-center justify-center p-1 rounded-md transition-colors cursor-pointer shrink-0 ${
                  filterPlatform === p ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title={getPlatformName(p)}
              >
                <PlatformIcon platform={p} size={14} />
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="min-h-[36px] text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled Only</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="queued">In Queue</option>
          </select>

          {/* View Mode */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`min-h-[32px] px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'month' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`min-h-[32px] px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              Timeline
            </button>
          </div>
        </div>

      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs overflow-x-auto">
          <div className="min-w-[680px]">
            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center py-2.5 text-xs font-semibold text-slate-600">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

          {/* 42 Calendar Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[640px]">
            {calendarCells.map((cell, idx) => {
              const dayPosts = postsByDate[cell.dateStr] || [];
              const isToday = cell.dateStr === todayStr;

              return (
                <div
                  key={idx}
                  onClick={() => onOpenComposer(cell.dateStr)}
                  className={`min-h-[120px] p-2 flex flex-col justify-between group transition-colors relative cursor-pointer ${
                    cell.isCurrentMonth ? 'bg-white hover:bg-slate-50/70' : 'bg-slate-50/40 text-slate-400'
                  }`}
                >
                  {/* Cell Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-mono tabular-nums leading-none ${
                        isToday
                          ? 'w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center'
                          : cell.isCurrentMonth
                          ? 'text-slate-700 font-semibold'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {/* Quick Add Button on Hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenComposer(cell.dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 p-0.5 rounded transition-opacity cursor-pointer"
                      title="Schedule post on this day"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Scheduled Posts in Cell */}
                  <div className="space-y-1.5 flex-1 overflow-y-auto max-h-24 pr-0.5">
                    {dayPosts.map((post) => {
                      const timeStr = post.scheduledFor ? new Date(post.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                      const isPublished = post.status === 'published';
                      const isDraft = post.status === 'draft';

                      return (
                        <div
                          key={post.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPostDetails(post);
                          }}
                          className={`p-1.5 rounded text-[11px] border transition-all hover:shadow-2xs group/item ${
                            isPublished
                              ? 'bg-slate-50 border-slate-200 text-slate-700'
                              : isDraft
                              ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                              : 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <div className="flex items-center gap-1 text-slate-500">
                              {post.platforms.map(p => (
                                <PlatformIcon key={p} platform={p} size={11} />
                              ))}
                              <span className="font-mono tabular-nums text-[10px] text-slate-500 ml-0.5">
                                {timeStr}
                              </span>
                            </div>

                            <div className="opacity-0 group-hover/item:opacity-100 flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenComposer(undefined, post);
                                }}
                                className="text-slate-400 hover:text-slate-700"
                                title="Edit"
                              >
                                <FileEdit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeletePost(post.id);
                                }}
                                className="text-slate-400 hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <p className="line-clamp-1 font-normal text-slate-800 leading-tight">
                            {post.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Empty state hint on hover if 0 posts */}
                  {dayPosts.length === 0 && (
                    <div className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 text-center py-1">
                      + Add post
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* TIMELINE LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
          <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Scheduled & Published Posts ({filteredPosts.length})</span>
            <span>Date & Timing</span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-medium">No posts match the selected filters</p>
              <button
                onClick={() => onOpenComposer()}
                className="mt-3 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 cursor-pointer"
              >
                Create New Post
              </button>
            </div>
          ) : (
            filteredPosts
              .sort((a, b) => new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime())
              .map((post) => {
                const dateObj = new Date(post.scheduledFor);
                const isUpcoming = dateObj.getTime() > Date.now();

                return (
                  <div
                    key={post.id}
                    onClick={() => onSelectPostDetails(post)}
                    className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Media thumbnail if present */}
                      {post.mediaUrls && post.mediaUrls.length > 0 ? (
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          <img
                            src={post.mediaUrls[0]}
                            alt="Thumb"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-md bg-slate-100 shrink-0 border border-slate-200 flex items-center justify-center text-slate-400">
                          <CalendarIcon className="w-6 h-6 stroke-1" />
                        </div>
                      )}

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            {post.platforms.map(p => (
                              <PlatformIcon key={p} platform={p} size={13} />
                            ))}
                          </div>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize font-medium text-slate-700">{post.status}</span>
                          {post.campaign && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-slate-500">{post.campaign}</span>
                            </>
                          )}
                        </div>

                        <p className="text-xs text-slate-800 leading-relaxed line-clamp-2">
                          {post.content}
                        </p>

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 text-[11px] text-indigo-600">
                            {post.tags.map(t => <span key={t}>{t}</span>)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right column: Timing & Actions */}
                    <div className="text-right shrink-0 space-y-1.5">
                      <div className="text-xs font-mono tabular-nums text-slate-700 font-semibold">
                        {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-[11px] font-mono tabular-nums text-slate-500">
                        {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>

                      <div className="flex items-center justify-end gap-1 pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenComposer(undefined, post);
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"
                          title="Edit"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePost(post.id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

    </div>
  );
};
