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
  ExternalLink,
  Video,
  Image as ImageIcon,
  Type,
  Play,
  Film,
  CheckCircle2,
  Check,
  Zap,
  Send
} from 'lucide-react';
import { SocialPost } from '../../types';
import { PlatformIcon, getPlatformName } from './PlatformIcon';
import { openOriginalApp, publishToOriginalApp, PLATFORM_CONFIGS } from '../../utils/socialAppBridge';
import { TEXT_CARD_THEMES } from '../composer/PostMediaControls';

interface PostDetailsModalProps {
  post: SocialPost | null;
  onClose: () => void;
  onEdit: (post: SocialPost) => void;
  onDelete: (id: string) => void;
  onRepurpose: (post: SocialPost) => void;
  onOpenDispatcher?: (post: SocialPost) => void;
}

export const PostDetailsModal: React.FC<PostDetailsModalProps> = ({
  post,
  onClose,
  onEdit,
  onDelete,
  onRepurpose,
  onOpenDispatcher,
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
          {/* Platform & Date metadata & Format Badge */}
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

              {/* Format Badge */}
              <div className="ml-1">
                {post.postType === 'video' || post.videoUrl ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-xs font-semibold">
                    <Video className="w-3 h-3 text-purple-600" />
                    <span>Video Post</span>
                    {post.videoDuration && (
                      <span className="text-[10px] font-mono opacity-75">· 0:{post.videoDuration < 10 ? `0${post.videoDuration}` : post.videoDuration}</span>
                    )}
                  </span>
                ) : post.mediaUrls && post.mediaUrls.length > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-xs font-semibold">
                    <ImageIcon className="w-3 h-3 text-indigo-600" />
                    <span>{post.mediaUrls.length > 1 ? `${post.mediaUrls.length} Photos` : 'Photo Post'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-xs font-semibold">
                    <Type className="w-3 h-3 text-slate-500" />
                    <span>Text Post</span>
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs font-mono tabular-nums text-slate-500">
              {dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* Connected Channels Reach Status Banner */}
          {post.status === 'published' && (
            <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-xl border border-emerald-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                  </span>
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>Reached Connected Channels ({post.platforms.length}/{post.platforms.length})</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-800 bg-white/90 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                  {post.reachedAt ? `Reached at ${new Date(post.reachedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Live Broadcast Confirmed'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {post.platforms.map((platform) => (
                  <div key={platform} className="flex items-center justify-between p-2 rounded-lg bg-white border border-emerald-200/80 text-xs shadow-2xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <PlatformIcon platform={platform} size={14} />
                      <span className="font-semibold text-slate-900 truncate">{getPlatformName(platform)}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Reached ✓</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Direct Mother App Redirect Hub */}
          <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <span className="text-xs text-indigo-950 font-bold flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-indigo-600" />
                <span>Redirect to Mother Apps to Post</span>
              </span>
              <p className="text-[11px] text-indigo-700 mt-0.5">
                Click to redirect directly into your connected WhatsApp, Facebook Group, Page, or X mother apps.
              </p>
            </div>
            
            {onOpenDispatcher && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDispatcher(post);
                }}
                className="min-h-[34px] px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all shrink-0 active:scale-98"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Redirect to Mother Apps ↗</span>
              </button>
            )}
          </div>

          {/* Post Content & Media */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            {/* If Text post with card background theme */}
            {post.textBackground && post.textBackground !== 'clean' ? (
              (() => {
                const activeTheme = TEXT_CARD_THEMES.find(t => t.id === post.textBackground) || TEXT_CARD_THEMES[1];
                return (
                  <div className={`p-4 rounded-xl border ${activeTheme.borderClass} ${activeTheme.bgClass} text-center shadow-xs my-2`}>
                    <p className={`text-sm sm:text-base font-semibold leading-relaxed ${activeTheme.textClass}`}>
                      {post.content}
                    </p>
                  </div>
                );
              })()
            ) : (
              <p className="text-xs sm:text-sm text-slate-900 leading-relaxed whitespace-pre-wrap font-normal">
                {post.content}
              </p>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 text-xs text-indigo-600 font-medium">
                {post.tags.map(t => <span key={t}>{t}</span>)}
              </div>
            )}

            {/* VIDEO PLAYER */}
            {(post.postType === 'video' || post.videoUrl) && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold flex items-center gap-1 text-purple-700">
                    <Video className="w-3.5 h-3.5" />
                    <span>Attached Video</span>
                  </span>
                  {post.videoDuration && (
                    <span className="font-mono text-[11px] bg-slate-200/80 px-2 py-0.5 rounded text-slate-700">
                      Duration: 0:{post.videoDuration < 10 ? `0${post.videoDuration}` : post.videoDuration}
                    </span>
                  )}
                </div>
                <div className={`rounded-xl overflow-hidden bg-black border border-slate-300 shadow-xs relative ${post.aspectRatio === '9:16' ? 'aspect-[9/16] max-h-80 mx-auto' : 'aspect-video max-h-72 w-full'} flex items-center justify-center`}>
                  {post.videoUrl ? (
                    <video
                      src={post.videoUrl}
                      controls
                      poster={post.videoThumbnail}
                      playsInline
                      className="w-full h-full object-contain"
                    >
                      Your browser does not support HTML5 video.
                    </video>
                  ) : post.videoThumbnail ? (
                    <div className="relative w-full h-full">
                      <img src={post.videoThumbnail} alt="Video Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/90 text-indigo-600 flex items-center justify-center shadow-md">
                          <Play className="w-5 h-5 fill-indigo-600 ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400">
                      <Film className="w-8 h-8 mx-auto mb-1 text-indigo-400" />
                      <p className="text-xs">No video URL linked</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PHOTOS GALLERY (Single or Multi-Photo) */}
            {post.postType !== 'video' && post.mediaUrls && post.mediaUrls.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold flex items-center gap-1 text-indigo-700">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Attached {post.mediaUrls.length === 1 ? 'Photo' : `${post.mediaUrls.length} Photos`}</span>
                  </span>
                </div>
                {post.mediaUrls.length === 1 ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 max-h-80 bg-slate-100">
                    <img
                      src={post.mediaUrls[0]}
                      alt="Post Attachment"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : post.mediaUrls.length === 2 ? (
                  <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden border border-slate-200 aspect-video max-h-72">
                    <img src={post.mediaUrls[0]} alt="Photo 1" className="w-full h-full object-cover" />
                    <img src={post.mediaUrls[1]} alt="Photo 2" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 rounded-xl overflow-hidden border border-slate-200 max-h-72">
                    {post.mediaUrls.map((url, i) => (
                      <div key={i} className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                        <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
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
