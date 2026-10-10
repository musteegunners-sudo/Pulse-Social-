import React, { useState } from 'react';
import { 
  Layers, 
  Clock, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  ArrowUp, 
  ArrowDown, 
  FileEdit,
  Send,
  Calendar,
  AlertCircle,
  Video,
  Image as ImageIcon,
  Type,
  Film
} from 'lucide-react';
import { QueueSlot, SocialPost, SocialPlatform } from '../../types';
import { PlatformIcon, getPlatformName } from '../common/PlatformIcon';

interface QueueManagerProps {
  queueSlots: QueueSlot[];
  onSaveQueueSlots: (slots: QueueSlot[]) => void;
  posts: SocialPost[];
  onOpenComposer: (initialDate?: string, post?: SocialPost) => void;
  onDeletePost: (id: string) => void;
  onPublishNow: (post: SocialPost) => void;
}

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export const QueueManager: React.FC<QueueManagerProps> = ({
  queueSlots,
  onSaveQueueSlots,
  posts,
  onOpenComposer,
  onDeletePost,
  onPublishNow,
}) => {
  const [isQueuePaused, setIsQueuePaused] = useState(false);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlotDay, setNewSlotDay] = useState(1);
  const [newSlotTime, setNewSlotTime] = useState('14:00');
  const [newSlotPlatforms, setNewSlotPlatforms] = useState<SocialPlatform[]>(['twitter', 'linkedin']);

  const [postTypeFilter, setPostTypeFilter] = useState<'all' | 'video' | 'photos' | 'text'>('all');

  // Queued posts (upcoming or queued status) with post type filtering
  const allQueuedPosts = posts.filter(p => p.status === 'queued' || p.status === 'scheduled');
  
  const videoCount = allQueuedPosts.filter(p => (p.postType === 'video' || p.videoUrl)).length;
  const photosCount = allQueuedPosts.filter(p => (p.postType === 'photos' || (!p.videoUrl && p.mediaUrls && p.mediaUrls.length > 0))).length;
  const textCount = allQueuedPosts.filter(p => (p.postType === 'text' || (!p.videoUrl && (!p.mediaUrls || p.mediaUrls.length === 0)))).length;

  const queuedPosts = allQueuedPosts.filter(p => {
    if (postTypeFilter === 'all') return true;
    const pType = p.postType || (p.videoUrl ? 'video' : (p.mediaUrls && p.mediaUrls.length > 0 ? 'photos' : 'text'));
    return pType === postTypeFilter;
  });

  const toggleSlot = (id: string) => {
    const updated = queueSlots.map(s => s.id === id ? { ...s, isEnabled: !s.isEnabled } : s);
    onSaveQueueSlots(updated);
  };

  const deleteSlot = (id: string) => {
    const updated = queueSlots.filter(s => s.id !== id);
    onSaveQueueSlots(updated);
  };

  const handleAddSlot = () => {
    const newSlot: QueueSlot = {
      id: `slot-${Date.now()}`,
      dayOfWeek: Number(newSlotDay),
      time: newSlotTime,
      platforms: newSlotPlatforms,
      isEnabled: true,
    };
    onSaveQueueSlots([...queueSlots, newSlot]);
    setShowAddSlot(false);
  };

  const toggleNewSlotPlatform = (p: SocialPlatform) => {
    if (newSlotPlatforms.includes(p)) {
      if (newSlotPlatforms.length > 1) {
        setNewSlotPlatforms(newSlotPlatforms.filter(item => item !== p));
      }
    } else {
      setNewSlotPlatforms([...newSlotPlatforms, p]);
    }
  };

  // Group slots by Day
  const slotsByDay = DAYS_OF_WEEK.map((dayName, dayIndex) => ({
    dayName,
    dayIndex,
    slots: queueSlots
      .filter(s => s.dayOfWeek === dayIndex)
      .sort((a, b) => a.time.localeCompare(b.time)),
  }));

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Publishing Buffer & Queue Scheduling
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated recurring posting timeslots and ready-to-release content pipeline
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsQueuePaused(!isQueuePaused)}
            className={`min-h-[44px] sm:min-h-0 flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              isQueuePaused
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isQueuePaused ? <Play className="w-3.5 h-3.5 fill-amber-700" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isQueuePaused ? 'Resume Queue' : 'Pause Queue'}</span>
          </button>

          <button
            onClick={() => setShowAddSlot(!showAddSlot)}
            className="min-h-[44px] sm:min-h-0 flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Posting Slot</span>
          </button>
        </div>
      </div>

      {/* Add Slot Drawer */}
      {showAddSlot && (
        <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-semibold text-indigo-950">Add New Recurring Posting Time Slot</span>
            <button onClick={() => setShowAddSlot(false)} className="text-slate-400 hover:text-slate-600 text-xs">
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Day of Week</label>
              <select
                value={newSlotDay}
                onChange={(e) => setNewSlotDay(Number(e.target.value))}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {DAYS_OF_WEEK.map((name, idx) => (
                  <option key={idx} value={idx}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Release Time (PT)</label>
              <input
                type="time"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
              </input>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Target Networks</label>
              <div className="flex items-center gap-1.5 pt-1">
                {(['twitter', 'linkedin', 'instagram', 'facebook'] as SocialPlatform[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggleNewSlotPlatform(p)}
                    className={`p-1.5 rounded text-xs transition-colors ${
                      newSlotPlatforms.includes(p)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <PlatformIcon platform={p} size={13} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleAddSlot}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors cursor-pointer"
            >
              Save Slot
            </button>
          </div>
        </div>
      )}

      {/* Two Column Layout: Queued Posts List + Weekly Posting Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Queued Posts Content List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Queued Content ({queuedPosts.length} ready)
              </h3>
            </div>
            <button
              onClick={() => onOpenComposer()}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              + Add to Queue
            </button>
          </div>

          {/* Post Type Filter Bar */}
          <div className="px-4 sm:px-5 py-2 bg-slate-50/70 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Format:
            </span>
            {[
              { id: 'all' as const, label: `All (${allQueuedPosts.length})` },
              { id: 'video' as const, label: `🎬 Video (${videoCount})` },
              { id: 'photos' as const, label: `🖼️ Photos (${photosCount})` },
              { id: 'text' as const, label: `📝 Text (${textCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPostTypeFilter(tab.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  postTypeFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {queuedPosts.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Layers className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-600 font-medium">Your queue is empty</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Add posts to automatically dispatch them during your highest-performing weekly time slots.
              </p>
              <button
                onClick={() => onOpenComposer()}
                className="mt-2 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 cursor-pointer"
              >
                Schedule First Queued Post
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {queuedPosts.map((post, idx) => {
                const dateObj = new Date(post.scheduledFor);
                return (
                  <div key={post.id} className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-mono font-semibold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>

                      {/* Thumbnail: Video, Photo, or Text icon */}
                      {post.postType === 'video' || post.videoUrl ? (
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                          {post.videoThumbnail || (post.mediaUrls && post.mediaUrls[0]) ? (
                            <img
                              src={post.videoThumbnail || post.mediaUrls![0]}
                              alt="Video Thumbnail"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900">
                              <Film className="w-5 h-5 text-indigo-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full bg-white/90 text-indigo-600 flex items-center justify-center shadow-xs">
                              <Play className="w-2.5 h-2.5 fill-indigo-600 ml-0.5" />
                            </div>
                          </div>
                          {post.videoDuration && (
                            <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[8px] font-mono px-1 rounded">
                              0:{post.videoDuration < 10 ? `0${post.videoDuration}` : post.videoDuration}
                            </span>
                          )}
                        </div>
                      ) : post.mediaUrls && post.mediaUrls[0] ? (
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          <img
                            src={post.mediaUrls[0]}
                            alt="Media"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {post.mediaUrls.length > 1 && (
                            <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-white text-[8px] font-bold px-1 rounded">
                              +{post.mediaUrls.length}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-slate-400">
                          <Type className="w-5 h-5 text-slate-400" />
                        </div>
                      )}

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                          <div className="flex items-center gap-1">
                            {post.platforms.map(p => (
                              <PlatformIcon key={p} platform={p} size={12} />
                            ))}
                          </div>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums text-[11px]">
                            {dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          {/* Format Badge */}
                          <span className="ml-auto sm:ml-0">
                            {post.postType === 'video' || post.videoUrl ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-bold">
                                <Video className="w-3 h-3 text-purple-600" />
                                <span>Video</span>
                              </span>
                            ) : post.mediaUrls && post.mediaUrls.length > 0 ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] font-bold">
                                <ImageIcon className="w-3 h-3 text-indigo-600" />
                                <span>{post.mediaUrls.length > 1 ? `${post.mediaUrls.length} Photos` : 'Photo'}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-bold">
                                <Type className="w-3 h-3 text-slate-500" />
                                <span>Text Post</span>
                              </span>
                            )}
                          </span>
                        </div>

                        <p className="text-xs text-slate-800 leading-snug line-clamp-2">
                          {post.content}
                        </p>

                        {post.tags && (
                          <div className="flex items-center gap-1 text-[11px] text-indigo-600">
                            {post.tags.map(t => <span key={t}>{t}</span>)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <button
                        onClick={() => onPublishNow(post)}
                        className="min-h-[36px] px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                        title="Publish immediately"
                      >
                        <Send className="w-3 h-3 text-slate-500" />
                        <span>Send Now</span>
                      </button>

                      <button
                        onClick={() => onOpenComposer(undefined, post)}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                        title="Edit"
                        aria-label="Edit post"
                      >
                        <FileEdit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeletePost(post.id)}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                        title="Delete"
                        aria-label="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Weekly Posting Schedule Slots (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Weekly Release Rhythm
              </h3>
              <p className="text-xs text-slate-500">
                Active recurring windows for automated publishing
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {queueSlots.filter(s => s.isEnabled).length} active slots
            </span>
          </div>

          <div className="space-y-3">
            {slotsByDay.map(({ dayName, slots }) => {
              if (slots.length === 0) return null;

              return (
                <div key={dayName} className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/50 space-y-2">
                  <span className="text-xs font-semibold text-slate-800 block">
                    {dayName}
                  </span>

                  <div className="space-y-1.5">
                    {slots.map(slot => (
                      <div
                        key={slot.id}
                        className={`flex items-center justify-between p-2 rounded text-xs border transition-colors ${
                          slot.isEnabled ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-100/60 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={slot.isEnabled}
                            onChange={() => toggleSlot(slot.id)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span className="font-mono tabular-nums font-semibold">
                            {slot.time}
                          </span>
                          <div className="flex items-center gap-1 text-slate-400">
                            {slot.platforms.map(p => (
                              <PlatformIcon key={p} platform={p} size={12} />
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => deleteSlot(slot.id)}
                          className="text-slate-400 hover:text-red-500 p-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};
