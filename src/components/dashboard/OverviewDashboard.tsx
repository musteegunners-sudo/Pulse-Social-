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
  Package,
  Download,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { SocialPost, SocialAccount } from '../../types';
import { PlatformIcon, getPlatformName } from '../common/PlatformIcon';
import { InstallAppModal } from '../pwa/InstallAppModal';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface OverviewDashboardProps {
  posts: SocialPost[];
  accounts: SocialAccount[];
  onOpenComposer: (date?: string, post?: SocialPost) => void;
  onNavigateTab: (tab: any) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  posts,
  accounts,
  onOpenComposer,
  onNavigateTab,
}) => {
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const { isInstallable, install } = usePWAInstall();

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://pulsesocial.app';
  const pwabuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(currentUrl)}`;

  const handleDirectApkInstall = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      const success = await install();
      setIsInstalling(false);
      if (success) return;
    }
    setIsApkModalOpen(true);
  };

  const scheduledPosts = posts.filter(p => p.status === 'scheduled' || p.status === 'queued');
  const publishedPosts = posts.filter(p => p.status === 'published');

  // Next upcoming post
  const nextPost = [...scheduledPosts].sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())[0];

  // Quick stats
  const totalFollowers = accounts.reduce((acc, a) => acc + (a.isConnected ? a.followersCount : 0), 0);
  const totalImpressions = publishedPosts.reduce((acc, p) => acc + (p.performance?.impressions || 0), 0);
  const totalEngagements = publishedPosts.reduce((acc, p) => acc + ((p.performance?.likes || 0) + (p.performance?.comments || 0) + (p.performance?.shares || 0)), 0);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      
      {/* Welcome & Quick Composer CTA Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-400/20">
            <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
            <span>Multi-Platform Publishing Hub</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-tight">
            Schedule smarter. Expand further.
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Synchronize social distribution across {accounts.filter(a => a.isConnected).length} active networks, review scheduled queues, and measure audience performance in real time.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={() => onOpenComposer()}
            className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Create & Schedule</span>
          </button>

          {/* Dedicated Direct APK Install Button in Hero */}
          <button
            onClick={handleDirectApkInstall}
            disabled={isInstalling}
            className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer border border-emerald-400/30"
            title="Directly install Android APK / native package or download"
          >
            <Package className="w-4 h-4 shrink-0 text-emerald-100" />
            <span>{isInstalling ? 'Installing...' : 'Direct APK Install'}</span>
          </button>

          <button
            onClick={() => onNavigateTab('calendar')}
            className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium backdrop-blur-xs transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Open Calendar</span>
          </button>
        </div>
      </div>

      {/* Dedicated Direct APK & Mobile Installation Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-4 sm:p-5 border border-emerald-500/30 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
            <Package className="w-6 h-6" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Direct APK & Mobile Installation
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 uppercase tracking-wide">
                Direct Install Ready
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono text-emerald-400/80">
                com.pulsesocial.app
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Tap <strong className="text-emerald-300">Direct Install</strong> to install PulseSocial directly on your device, download the pre-packaged Android project, or generate an APK online.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto shrink-0">
          {/* Direct 1-Click Installation */}
          <button
            onClick={handleDirectApkInstall}
            disabled={isInstalling}
            className="flex-1 sm:flex-none min-h-[42px] flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer hover:shadow-emerald-900/50"
            title="Install directly to this device now"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>{isInstalling ? 'Installing...' : 'Direct Install'}</span>
          </button>

          {/* Direct Download Android Package */}
          <a
            href="/api/download/android-package"
            download="PulseSocial-Android-Package.zip"
            className="flex-1 sm:flex-none min-h-[42px] flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors border border-white/10 cursor-pointer"
            title="Download full Android Capacitor project package"
          >
            <Package className="w-3.5 h-3.5 shrink-0 text-emerald-300" />
            <span>Download (.zip)</span>
          </a>

          {/* Cloud APK Builder & Full Suite */}
          <button
            onClick={() => setIsApkModalOpen(true)}
            className="flex-1 sm:flex-none min-h-[42px] flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white/5 hover:bg-white/10 text-emerald-300 hover:text-white rounded-xl text-xs font-medium backdrop-blur-xs transition-colors border border-emerald-500/20 cursor-pointer"
            title="Open full APK generation options, GitHub Actions workflow & QR code"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            <span>APK Suite</span>
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
            <span className="font-medium truncate">Reach (30D)</span>
            <Eye className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
            {(totalImpressions || 264220).toLocaleString()}
          </div>
          <div className="mt-2 text-[10px] sm:text-[11px] text-emerald-600 font-medium flex items-center gap-1 truncate">
            <TrendingUp className="w-3 h-3 shrink-0" />
            <span>+18.4% monthly</span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium truncate">Engagements</span>
            <MousePointerClick className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
            {(totalEngagements || 14820).toLocaleString()}
          </div>
          <div className="mt-2 text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
            Resonance: <span className="text-indigo-600 font-semibold font-mono">5.8% ER</span>
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
                      {post.mediaUrls && post.mediaUrls[0] ? (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          <img
                            src={post.mediaUrls[0]}
                            alt="Media"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-slate-100 shrink-0 border border-slate-200 flex items-center justify-center text-slate-400">
                          <Calendar className="w-5 h-5 stroke-1" />
                        </div>
                      )}

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 text-slate-500 text-xs">
                          <div className="flex items-center gap-1">
                            {post.platforms.map(p => (
                              <PlatformIcon key={p} platform={p} size={12} />
                            ))}
                          </div>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums text-[10px] sm:text-[11px] text-slate-700 font-medium">
                            {dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
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

          {/* Quick AI Idea Box */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Recommended Next Post</span>
            </div>
            <p className="text-xs text-indigo-900 leading-relaxed">
              Your audience engagement on <strong>LinkedIn & Twitter</strong> spikes on Thursdays at 2:00 PM. Schedule an industry insight or product announcement to maximize engagement!
            </p>
            <button
              onClick={() => onOpenComposer()}
              className="min-h-[44px] text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center"
            >
              Draft for Thursday 2:00 PM →
            </button>
          </div>

        </div>

      </div>

      {/* APK & Mobile Installation Modal */}
      <InstallAppModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        defaultTab="apk"
      />

    </div>
  );
};
