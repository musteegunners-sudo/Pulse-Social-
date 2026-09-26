import React from 'react';
import { 
  X, 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2, 
  MousePointerClick, 
  Bookmark, 
  Calendar, 
  FileEdit, 
  Trash2, 
  ArrowUpRight,
  ExternalLink 
} from 'lucide-react';
import { SocialPost } from '../../types';
import { PlatformIcon, getPlatformName } from './PlatformIcon';
import { openOriginalApp, publishToOriginalApp, PLATFORM_CONFIGS } from '../../utils/socialAppBridge';

interface PostDetailsModalProps {
  post: SocialPost | null;
  onClose: () => void;
  onEdit: (post: SocialPost) => void;
  onDelete: (id: string) => void;
  onRepurpose: (post: SocialPost) => void;
}

export const PostDetailsModal: React.FC<PostDetailsModalProps> = ({
  post,
  onClose,
  onEdit,
  onDelete,
  onRepurpose,
}) => {
  if (!post) return null;

  const dateObj = new Date(post.scheduledFor);
  const perf = post.performance;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-900">Post Inspection & Analytics</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 capitalize">{post.status}</span>
          </div>
          <button 
            onClick={onClose} 
            className="min-h-[44px] min-w-[44px] -mr-2 text-slate-400 hover:text-slate-700 flex items-center justify-center rounded-lg cursor-pointer"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
          {/* Platform & Date metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500">Channels:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {post.platforms.map(p => (
                  <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                    <PlatformIcon platform={p} size={12} />
                    <span>{getPlatformName(p)}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="text-xs font-mono tabular-nums text-slate-500">
              {dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* Direct Original App Intent Launchers */}
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-indigo-900 font-semibold flex items-center gap-1.5">
              <span>Original App Wire:</span>
              <span className="text-[11px] font-normal text-indigo-700">Open or draft directly in native apps</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {post.platforms.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => publishToOriginalApp(p, post.content)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-indigo-200/80 shadow-2xs transition-colors cursor-pointer"
                  title={`Launch intent in ${PLATFORM_CONFIGS[p]?.displayName || p}`}
                >
                  <PlatformIcon platform={p} size={13} />
                  <span>Launch {PLATFORM_CONFIGS[p]?.shortName || p}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Post Content */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <p className="text-xs text-slate-900 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 text-xs text-indigo-600">
                {post.tags.map(t => <span key={t}>{t}</span>)}
              </div>
            )}

            {post.mediaUrls && post.mediaUrls[0] && (
              <div className="rounded-lg overflow-hidden border border-slate-200 max-h-64">
                <img
                  src={post.mediaUrls[0]}
                  alt="Post Attachment"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {post.firstComment && (
              <div className="p-2.5 bg-white rounded border border-slate-200 text-xs text-slate-600">
                <strong className="text-slate-800">First Comment:</strong> {post.firstComment}
              </div>
            )}
          </div>

          {/* Performance Breakdown if published */}
          {perf ? (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Audience Performance Metrics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Impressions</span>
                  </div>
                  <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                    {perf.impressions.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <Heart className="w-3.5 h-3.5" />
                    <span>Likes</span>
                  </div>
                  <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                    {perf.likes.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Comments</span>
                  </div>
                  <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                    {perf.comments.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <MousePointerClick className="w-3.5 h-3.5" />
                    <span>Link Clicks</span>
                  </div>
                  <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                    {perf.clicks.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                <span className="text-emerald-950 font-medium">Engagement Rate:</span>
                <span className="font-bold font-mono tabular-nums text-emerald-800 text-sm">
                  {perf.engagementRate}% ER
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
              Performance metrics will populate automatically after post publication.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:px-6 sm:py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <button
            onClick={() => {
              onDelete(post.id);
              onClose();
            }}
            className="min-h-[44px] sm:min-h-0 flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Post</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onRepurpose(post);
                onClose();
              }}
              className="min-h-[44px] sm:min-h-0 flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg cursor-pointer shadow-2xs"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600" />
              <span>Repurpose</span>
            </button>
            <button
              onClick={() => {
                onEdit(post);
                onClose();
              }}
              className="min-h-[44px] sm:min-h-0 flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer shadow-xs"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Edit Post</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
