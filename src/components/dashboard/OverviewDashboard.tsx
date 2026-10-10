import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  TrendingUp, 
  Layers, 
  Clock, 
  Sparkles, 
  ArrowRight,
  Eye,
  MousePointerClick,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Smartphone,
  Video,
  Image as ImageIcon,
  Type,
  Play,
  Film
} from 'lucide-react';
import { SocialPost, SocialAccount } from '../../types';
import { PlatformIcon, getPlatformName } from '../common/PlatformIcon';
import { ChannelPostMonitor } from './ChannelPostMonitor';

interface OverviewDashboardProps {
  posts: SocialPost[];
  accounts: SocialAccount[];
  onOpenComposer: (date?: string, post?: SocialPost) => void;
  onNavigateTab: (tab: any) => void;
  onPublishNow?: (post: SocialPost) => void;
  onOpenDispatcher?: (post: SocialPost) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  posts,
  accounts,
  onOpenComposer,
  onNavigateTab,
  onPublishNow,
  onOpenDispatcher,
}) => {
  const scheduledPosts = posts.filter(p => p.status === 'scheduled' || p.status === 'queued');
  const publishedPosts = posts.filter(p => p.status === 'published');

  // Next upcoming post
  const nextPost = [...scheduledPosts].sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())[0];

  // Quick stats
  const totalFollowers = accounts.reduce((acc, a) => acc + (a.isConnected ? a.followersCount : 0), 0);
  const totalImpressions = publishedPosts.reduce((acc, p) => acc + (p.performance?.impressions || 0), 0);
  const totalEngagements = publishedPosts.reduce((acc, p) => acc + ((p.performance?.likes || 0) + (p.performance?.comments || 0) + (p.performance?.shares || 0)), 0);

  return (
    <div className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-6 max-w-7xl mx-auto">
      
      {/* Welcome & Quick Composer CTA Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-400/20">
            <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
            <span>Multi-Platform Publishing Hub</span>
          </div>
          <h1 className="text-base sm:text-2xl font-bold tracking-tight text-white leading-tight">
            Schedule smarter. Expand further.
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Synchronize social distribution across {accounts.filter(a => a.isConnected).length} active networks, review scheduled queues, and measure audience performance in real time.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={() => onOpenComposer()}
            className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Create & Schedule</span>
          </button>

          <button
            onClick={() => onNavigateTab('calendar')}
            className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium backdrop-blur-xs transition-colors cursor-pointer active:scale-98"
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Open Calendar</span>
          </button>
        </div>
      </div>

      {/* 4 Quick Stat Cards - 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium truncate">In Queue</span>
            <Clock className="w-4 h-4 text-indigo-600 shrink-0 ml-1" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
            {scheduledPosts.length}
          </div>
          <div className="mt-2 text-[10px] sm:text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center sm:justify-between truncate">
            <span className="text-slate-400">Next:</span>
            <span className="font-medium text-indigo-600 truncate">
              {nextPost ? new Date(nextPost.scheduledFor).toLocaleDateString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : 'None'}
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium truncate">Reach (Total)</span>
            <Eye className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
            {totalImpressions.toLocaleString()}
          </div>
          <div className="mt-2 text-[10px] sm:text-[11px] text-slate-500 font-medium flex items-center gap-1 truncate">
            <span>{publishedPosts.length} published post{publishedPosts.length === 1 ? '' : 's'}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium truncate">Engagements</span>
            <MousePointerClick className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
            {totalEngagements.toLocaleString()}
          </div>
          <div className="mt-2 text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
            Resonance: <span className="text-indigo-600 font-semibold font-mono">
              {totalImpressions > 0 ? `${((totalEngagements / totalImpressions) * 100).toFixed(1)}% ER` : '0.0% ER'}
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium truncate">Channels</span>
            <Users className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
            {accounts.filter(a => a.isConnected).length} / {accounts.length}
          </div>
          <div className="mt-2 text-[10px] sm:text-[11px] text-slate-500 font-medium flex items-center justify-between truncate">
            <span>Audience:</span>
            <span className="font-mono tabular-nums font-semibold text-slate-800">
              {totalFollowers.toLocaleString()}
            </span>
          </div>
        </div>

      </div>

      {/* Real-Time Multi-Channel Post Monitor */}
      <ChannelPostMonitor
        posts={posts}
        accounts={accounts}
        onOpenComposer={onOpenComposer}
        onPublishNow={onPublishNow}
        onOpenDispatcher={onOpenDispatcher}
        onNavigateTab={onNavigateTab}
      />

      {/* Main Grid: Upcoming Release Feed + Performance Shortcut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        
        {/* Left: Upcoming Scheduled Posts (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col">
          <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
              <h2 className="text-xs sm:text-sm font-semibold text-slate-900">
                Upcoming Publications
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('queue')}
              className="min-h-[36px] px-2 text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Queue</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {scheduledPosts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-3">
                <p>No upcoming posts scheduled yet.</p>
                <button
                  onClick={() => onOpenComposer()}
                  className="min-h-[44px] px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Create Your First Scheduled Post
                </button>
              </div>
            ) : (
              scheduledPosts.slice(0, 4).map((post) => {
                const dateObj = new Date(post.scheduledFor);
                return (
                  <div key={post.id} className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Media thumbnail: Video, Photos, or Text */}
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
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                          <Type className="w-5 h-5 text-slate-400" />
                        </div>
                      )}

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 text-slate-500 text-xs">
                          {post.status === 'published' ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Reached ({post.platforms.length})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              <span>Queue</span>
                            </span>
                          )}

                          <div className="flex items-center gap-1">
                            {post.platforms.map(p => (
                              <PlatformIcon key={p} platform={p} size={12} />
                            ))}
                          </div>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums text-[10px] sm:text-[11px] text-slate-700 font-medium">
                            {post.status === 'published' && post.reachedAt 
                              ? `Reached ${new Date(post.reachedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                              : `${dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </span>

                          {/* Format Badge */}
                          {post.postType === 'video' || post.videoUrl ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[9px] font-bold">
                              <Video className="w-2.5 h-2.5 text-purple-600" />
                              <span>Video</span>
                            </span>
                          ) : post.mediaUrls && post.mediaUrls.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[9px] font-bold">
                              <ImageIcon className="w-2.5 h-2.5 text-indigo-600" />
                              <span>{post.mediaUrls.length > 1 ? `${post.mediaUrls.length} Photos` : 'Photo'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[9px] font-bold">
                              <Type className="w-2.5 h-2.5 text-slate-500" />
                              <span>Text</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-800 leading-snug line-clamp-2">
                          {post.content}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col justify-end shrink-0">
                      <button
                        onClick={() => onOpenComposer(undefined, post)}
                        className="min-h-[44px] sm:min-h-0 text-xs font-medium text-slate-700 hover:text-indigo-600 px-3 py-1.5 sm:py-1 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 cursor-pointer flex items-center justify-center"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Channel Status & Quick Shortcuts (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Channel Health Widget */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                Network Status & Health
              </h3>
              <button
                onClick={() => onNavigateTab('accounts')}
                className="min-h-[36px] px-2 text-xs font-medium text-indigo-600 hover:underline cursor-pointer flex items-center"
              >
                Channels ({accounts.length})
              </button>
            </div>

            <div className="space-y-2">
              {accounts.slice(0, 5).map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <PlatformIcon platform={acc.platform} size={15} />
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-800 block truncate">
                        {acc.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono tabular-nums block">
                        {acc.followersCount.toLocaleString()} followers
                      </span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium shrink-0 ${
                    acc.isConnected ? 'text-emerald-700' : 'text-slate-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${acc.isConnected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span>{acc.isConnected ? 'Ready' : 'Paused'}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Publishing Strategy Box */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Publishing Strategy</span>
            </div>
            {accounts.filter(a => a.isConnected).length === 0 ? (
              <>
                <p className="text-xs text-indigo-900 leading-relaxed">
                  No channels connected yet. Link your Facebook Page, Facebook Group, WhatsApp, or X/Twitter to begin scheduling and tracking posts directly.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateTab('accounts')}
                  className="min-h-[40px] text-xs font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer flex items-center gap-1"
                >
                  <span>Connect Channels Now →</span>
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-indigo-900 leading-relaxed">
                  Active distribution ready across <strong>{accounts.filter(a => a.isConnected).map(a => a.name).slice(0, 3).join(', ')}</strong>. Maintain regular touchpoints with your audience to maximize organic reach and retention.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenComposer()}
                  className="min-h-[40px] text-xs font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer flex items-center gap-1"
                >
                  <span>Draft New Post →</span>
                </button>
              </>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
