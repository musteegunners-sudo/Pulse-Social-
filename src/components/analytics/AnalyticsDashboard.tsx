import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  MousePointerClick, 
  Share2, 
  Download, 
  Sparkles, 
  Calendar, 
  ArrowUpRight,
  RefreshCw,
  Award,
  BarChart2,
  PieChart,
  Briefcase,
  Target,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { SocialPost, SocialPlatform, SocialAccount } from '../../types';
import { PlatformIcon, getPlatformName } from '../common/PlatformIcon';
import { generateHeatmapData } from '../../data/initialData';
import { CampaignAnalyticsView } from './CampaignAnalyticsView';

interface AnalyticsDashboardProps {
  posts: SocialPost[];
  accounts: SocialAccount[];
  onRepurposePost: (post: SocialPost) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  posts,
  accounts,
  onRepurposePost,
}) => {
  const [viewTab, setViewTab] = useState<'overview' | 'campaigns'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d' | '90d'>('30d');
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | 'all'>('all');
  const [dashboardCampaignFilter, setDashboardCampaignFilter] = useState<string>('all');
  const [activeMetric, setActiveMetric] = useState<'impressions' | 'engagements' | 'clicks'>('impressions');
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; impressions: number; engagements: number; clicks: number; x: number; y: number } | null>(null);

  // Extract distinct campaigns from posts
  const distinctCampaigns = useMemo(() => {
    const set = new Set<string>();
    posts.forEach(p => {
      if (p.campaign && p.campaign.trim()) set.add(p.campaign.trim());
    });
    return Array.from(set).sort();
  }, [posts]);

  // Filter published posts with performance data (also factoring campaign filter)
  const publishedPosts = useMemo(() => {
    return posts.filter(p => {
      if (p.status !== 'published' && !p.performance) return false;
      if (selectedPlatform !== 'all' && !p.platforms.includes(selectedPlatform)) return false;
      if (dashboardCampaignFilter !== 'all') {
        const postCamp = p.campaign && p.campaign.trim() ? p.campaign.trim() : 'Unassigned';
        if (postCamp !== dashboardCampaignFilter) return false;
      }
      return true;
    });
  }, [posts, selectedPlatform, dashboardCampaignFilter]);

  // Aggregate KPI Calculations
  const stats = useMemo(() => {
    let totalImpressions = 0;
    let totalReach = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalClicks = 0;

    publishedPosts.forEach(p => {
      if (p.performance) {
        totalImpressions += p.performance.impressions || 0;
        totalReach += p.performance.reach || 0;
        totalLikes += p.performance.likes || 0;
        totalComments += p.performance.comments || 0;
        totalShares += p.performance.shares || 0;
        totalClicks += p.performance.clicks || 0;
      }
    });

    const totalEngagements = totalLikes + totalComments + totalShares;
    const avgEngagementRate = totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 5.8;

    // Platform follower count
    const totalFollowers = accounts.reduce((acc, a) => {
      if (selectedPlatform === 'all' || a.platform === selectedPlatform) {
        return acc + a.followersCount;
      }
      return acc;
    }, 0);

    return {
      impressions: totalImpressions || 264220,
      reach: totalReach || 209200,
      engagements: totalEngagements || 14820,
      avgEngagementRate: Number(avgEngagementRate.toFixed(2)),
      clicks: totalClicks || 11710,
      shares: totalShares || 2344,
      followers: totalFollowers,
      clickThroughRate: Number((((totalClicks || 11710) / (totalImpressions || 264220)) * 100).toFixed(2)),
    };
  }, [publishedPosts, accounts, selectedPlatform]);

  // Time-series trend points (dynamic according to time range)
  const timeSeriesData = useMemo(() => {
    const pointsCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : timeRange === '30d' ? 15 : 12;
    const points = [];
    const baseDate = new Date();

    for (let i = pointsCount - 1; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i * (timeRange === '90d' ? 7 : timeRange === '30d' ? 2 : 1));
      
      const dayLabel = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      // Organic variance
      const seed = (i * 17) % 31;
      const impressions = Math.floor(12000 + Math.sin(i / 1.8) * 4500 + seed * 300);
      const engagements = Math.floor(impressions * (0.045 + (seed % 10) * 0.002));
      const clicks = Math.floor(engagements * 0.55);

      points.push({
        label: dayLabel,
        impressions,
        engagements,
        clicks,
      });
    }
    return points;
  }, [timeRange]);

  // Heatmap best times
  const heatmapData = useMemo(() => generateHeatmapData(), []);

  // Top Performing Posts ranking
  const topPosts = useMemo(() => {
    return [...publishedPosts]
      .sort((a, b) => (b.performance?.engagementRate || 0) - (a.performance?.engagementRate || 0))
      .slice(0, 5);
  }, [publishedPosts]);

  // Platform comparisons matrix
  const platformComparisons = useMemo(() => {
    const platforms: SocialPlatform[] = ['twitter', 'linkedin', 'instagram', 'facebook', 'tiktok'];
    return platforms.map(plat => {
      const account = accounts.find(a => a.platform === plat);
      const platPosts = posts.filter(p => p.platforms.includes(plat));
      const pubPlatPosts = platPosts.filter(p => p.status === 'published' && p.performance);
      
      const totalImp = pubPlatPosts.reduce((sum, p) => sum + (p.performance?.impressions || 0), 0);
      const totalEng = pubPlatPosts.reduce((sum, p) => sum + ((p.performance?.likes || 0) + (p.performance?.comments || 0) + (p.performance?.shares || 0)), 0);
      const avgRate = totalImp > 0 ? (totalEng / totalImp) * 100 : 4.5;

      return {
        platform: plat,
        accountHandle: account?.handle || `@${plat}_brand`,
        followers: account?.followersCount || 45000,
        growth: '+12.4%',
        postsCount: platPosts.length,
        impressions: totalImp || 78000,
        engagementRate: Number(avgRate.toFixed(2)),
        topFormat: plat === 'instagram' ? 'Reels & Carousels' : plat === 'linkedin' ? 'Document & Insights' : plat === 'tiktok' ? 'Short Video' : 'Threads & Charts',
      };
    });
  }, [accounts, posts]);

  // Top 3 campaigns by reach for overview snapshot
  const topCampaignsPreview = useMemo(() => {
    const map = new Map<string, { reach: number; engagement: number; postsCount: number }>();
    posts.forEach(p => {
      if (p.campaign && p.campaign.trim()) {
        const c = p.campaign.trim();
        const existing = map.get(c) || { reach: 0, engagement: 0, postsCount: 0 };
        existing.postsCount += 1;
        if (p.performance) {
          existing.reach += p.performance.reach || 0;
          existing.engagement += (p.performance.likes || 0) + (p.performance.comments || 0) + (p.performance.shares || 0) + (p.performance.saves || 0);
        }
        map.set(c, existing);
      }
    });

    return Array.from(map.entries())
      .map(([name, val]) => ({ name, ...val }))
      .sort((a, b) => b.reach - a.reach)
      .slice(0, 3);
  }, [posts]);

  // SVG Chart Dimensions & Math
  const chartWidth = 720;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 25;

  const currentValues = timeSeriesData.map(p => p[activeMetric]);
  const maxValue = Math.max(...currentValues) * 1.15 || 1;
  const minValue = 0;

  const getSvgX = (index: number) => {
    return paddingX + (index / (timeSeriesData.length - 1)) * (chartWidth - paddingX * 2);
  };

  const getSvgY = (val: number) => {
    return chartHeight - paddingY - ((val - minValue) / (maxValue - minValue)) * (chartHeight - paddingY * 2);
  };

  const polylinePoints = timeSeriesData
    .map((p, idx) => `${getSvgX(idx)},${getSvgY(p[activeMetric])}`)
    .join(' ');

  const areaPoints = `${getSvgX(0)},${chartHeight - paddingY} ${polylinePoints} ${getSvgX(timeSeriesData.length - 1)},${chartHeight - paddingY}`;

  // Export CSV Report Handler
  const handleExportCsv = () => {
    const headers = ['Post ID', 'Platform', 'Status', 'Date', 'Impressions', 'Engagements', 'Clicks', 'Engagement Rate %', 'Content'];
    const rows = publishedPosts.map(p => [
      p.id,
      p.platforms.join('; '),
      p.status,
      p.scheduledFor,
      p.performance?.impressions || 0,
      (p.performance?.likes || 0) + (p.performance?.comments || 0) + (p.performance?.shares || 0),
      p.performance?.clicks || 0,
      p.performance?.engagementRate || 0,
      `"${p.content.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pulsesocial_analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      
      {/* Top View Mode Switcher: Overview vs Campaign Aggregation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setViewTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              viewTab === 'overview'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-indigo-600" />
            <span>Network & Audience Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setViewTab('campaigns')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              viewTab === 'campaigns'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>Campaign Aggregation & ROI</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
              {distinctCampaigns.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-2 text-xs text-slate-500">
          {viewTab === 'overview' ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Target className="w-3 h-3 text-indigo-600" />
                <span>Campaign Filter:</span>
              </span>
              <select
                value={dashboardCampaignFilter}
                onChange={(e) => setDashboardCampaignFilter(e.target.value)}
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Campaigns ({distinctCampaigns.length})</option>
                {distinctCampaigns.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="Unassigned">Unassigned</option>
              </select>
              {dashboardCampaignFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setDashboardCampaignFilter('all')}
                  className="text-[11px] text-indigo-600 font-medium hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-indigo-700 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Multi-channel Campaign Aggregation Active</span>
            </div>
          )}
        </div>
      </div>

      {viewTab === 'campaigns' ? (
        <CampaignAnalyticsView
          posts={posts}
          accounts={accounts}
          onRepurposePost={onRepurposePost}
          initialSelectedCampaign={dashboardCampaignFilter !== 'all' ? dashboardCampaignFilter : 'all'}
        />
      ) : (
        <>
          {/* Top Filter Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Performance Analytics & Audience Insights
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span>Auditing {publishedPosts.length} published posts</span>
                  {dashboardCampaignFilter !== 'all' && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-indigo-600 font-semibold">Campaign: {dashboardCampaignFilter}</span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span>Updated Real-time</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Channel selector */}
              <div className="flex items-center gap-1 bg-slate-50 p-1 border border-slate-200 rounded-lg text-xs overflow-x-auto">
                <button
                  onClick={() => setSelectedPlatform('all')}
                  className={`min-h-[32px] px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer shrink-0 ${
                    selectedPlatform === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                {(['twitter', 'linkedin', 'instagram', 'facebook', 'tiktok'] as SocialPlatform[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedPlatform(p)}
                    className={`min-h-[32px] min-w-[32px] flex items-center justify-center p-1 rounded-md transition-colors cursor-pointer shrink-0 ${
                      selectedPlatform === p ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title={getPlatformName(p)}
                  >
                    <PlatformIcon platform={p} size={14} />
                  </button>
                ))}
              </div>

              {/* Time range selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
                {(['7d', '14d', '30d', '90d'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`min-h-[32px] px-2.5 py-1 rounded-md transition-colors uppercase cursor-pointer ${
                      timeRange === range ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>

              {/* Export CSV button */}
              <button
                onClick={handleExportCsv}
                className="min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden xs:inline">Export</span> CSV
              </button>
            </div>
          </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Impressions */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium truncate">Total Impressions</span>
            <Eye className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              {stats.impressions.toLocaleString()}
            </span>
            <div className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4%</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium truncate">
            Reach: <span className="font-mono tabular-nums text-slate-700">{stats.reach.toLocaleString()}</span> accounts
          </div>
        </div>

        {/* Metric 2: Engagement Rate */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium truncate">Avg Engagement</span>
            <TrendingUp className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              {stats.avgEngagementRate}%
            </span>
            <div className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+1.2%</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium truncate">
            <span className="font-mono tabular-nums text-slate-700">{stats.engagements.toLocaleString()}</span> interactions
          </div>
        </div>

        {/* Metric 3: Total Clicks */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium truncate">Referral Clicks</span>
            <MousePointerClick className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              {stats.clicks.toLocaleString()}
            </span>
            <div className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+9.6%</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium truncate">
            CTR: <span className="font-mono tabular-nums text-slate-700">{stats.clickThroughRate}%</span> traffic
          </div>
        </div>

        {/* Metric 4: Total Followers */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium truncate">Total Audience</span>
            <Users className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
              {stats.followers.toLocaleString()}
            </span>
            <div className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+4.2%</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium truncate">
            Across <span className="font-mono tabular-nums text-slate-700">{accounts.length}</span> connected channels
          </div>
        </div>

      </div>

      {/* Campaign Reach & Engagement Snapshot Card */}
      {topCampaignsPreview.length > 0 && dashboardCampaignFilter === 'all' && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-xs space-y-3 border border-indigo-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>Campaign Reach & Engagement Leaders</span>
                  <span className="text-[10px] uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded font-mono">
                    Aggregated
                  </span>
                </h3>
                <p className="text-xs text-indigo-200/80">
                  Total cross-network audience reach and engagement grouped by marketing initiative
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setViewTab('campaigns')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <span>Explore All {distinctCampaigns.length} Campaigns</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-indigo-200" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {topCampaignsPreview.map((camp, idx) => (
              <div 
                key={camp.name}
                onClick={() => {
                  setDashboardCampaignFilter(camp.name);
                  setViewTab('campaigns');
                }}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 cursor-pointer transition-all space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-indigo-300 truncate">
                    #{idx + 1} {camp.name}
                  </span>
                  <span className="text-[10px] text-indigo-300 font-mono">
                    {camp.postsCount} posts
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 border-t border-white/10">
                  <div>
                    <span className="text-indigo-300/80 text-[10px] block">Total Reach</span>
                    <span className="font-bold text-white text-xs">{camp.reach.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-indigo-300/80 text-[10px] block">Total Eng.</span>
                    <span className="font-bold text-emerald-400 text-xs">{camp.engagement.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Time-Series Performance Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Cross-Platform Growth & Engagement Trajectory
            </h3>
            <p className="text-xs text-slate-500">
              Interactive timeline view across selected channels ({timeRange.toUpperCase()})
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveMetric('impressions')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeMetric === 'impressions' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Impressions
            </button>
            <button
              onClick={() => setActiveMetric('engagements')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeMetric === 'engagements' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Engagements
            </button>
            <button
              onClick={() => setActiveMetric('clicks')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeMetric === 'clicks' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Clicks
            </button>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-56 overflow-visible"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const yVal = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
              const labelNum = Math.round(minValue + ratio * (maxValue - minValue));
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={yVal}
                    x2={chartWidth - paddingX}
                    y2={yVal}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 6}
                    y={yVal + 3}
                    textAnchor="end"
                    className="text-[10px] font-mono fill-slate-400 tabular-nums"
                  >
                    {labelNum > 1000 ? `${(labelNum / 1000).toFixed(1)}k` : labelNum}
                  </text>
                </g>
              );
            })}

            {/* Shaded Area */}
            <polygon points={areaPoints} fill="url(#areaGradient)" />

            {/* Trend Line */}
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Point Circles & Hover interaction */}
            {timeSeriesData.map((p, idx) => {
              const x = getSvgX(idx);
              const y = getSvgY(p[activeMetric]);
              const isHovered = hoveredPoint?.label === p.label;

              return (
                <g key={idx}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 5.5 : 3.5}
                    fill={isHovered ? '#312e81' : '#ffffff'}
                    stroke="#4f46e5"
                    strokeWidth={isHovered ? 3 : 2}
                    className="transition-all cursor-pointer"
                    onMouseEnter={() => setHoveredPoint({ ...p, x, y })}
                  />
                  {/* Date labels at bottom */}
                  {idx % Math.ceil(timeSeriesData.length / 7) === 0 && (
                    <text
                      x={x}
                      y={chartHeight - 6}
                      textAnchor="middle"
                      className="text-[10px] font-mono fill-slate-400 tabular-nums"
                    >
                      {p.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Interactive Hover Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute z-20 pointer-events-none bg-slate-900 text-white rounded-lg p-2.5 shadow-lg text-xs space-y-1 transform -translate-x-1/2 -translate-y-full"
              style={{
                left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                top: `${(hoveredPoint.y / chartHeight) * 100 - 6}%`,
              }}
            >
              <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1">
                {hoveredPoint.label}
              </div>
              <div className="grid grid-cols-2 gap-x-3 text-[11px] pt-0.5">
                <span className="text-slate-400">Impressions:</span>
                <span className="font-mono font-bold text-white tabular-nums text-right">
                  {hoveredPoint.impressions.toLocaleString()}
                </span>
                <span className="text-slate-400">Engagements:</span>
                <span className="font-mono font-bold text-indigo-300 tabular-nums text-right">
                  {hoveredPoint.engagements.toLocaleString()}
                </span>
                <span className="text-slate-400">Clicks:</span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums text-right">
                  {hoveredPoint.clicks.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Platform Breakdown & Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Network Performance Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Audience size, post output, and average resonance rate by network
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            5 Connected Channels
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Network / Handle</th>
                <th className="py-2.5 px-4 text-right">Followers</th>
                <th className="py-2.5 px-4 text-right">30D Growth</th>
                <th className="py-2.5 px-4 text-right">Posts Published</th>
                <th className="py-2.5 px-4 text-right">Impressions</th>
                <th className="py-2.5 px-4 text-right">Avg Engagement Rate</th>
                <th className="py-2.5 px-4">Highest Converting Format</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {platformComparisons.map((item) => (
                <tr key={item.platform} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <PlatformIcon platform={item.platform} size={16} />
                      <div>
                        <span className="font-semibold text-slate-900 block leading-tight">
                          {getPlatformName(item.platform)}
                        </span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          {item.accountHandle}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-800">
                    {item.followers.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-600 font-medium">
                    {item.growth}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                    {item.postsCount}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800 font-medium">
                    {item.impressions.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {item.engagementRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-normal">
                    {item.topFormat}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Layout: Top Performing Posts + Best Times Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Performing Posts (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-900">
                Top Performing Posts (Ranked by Engagement)
              </h3>
            </div>
            <span className="text-xs text-slate-500">Benchmark Leaders</span>
          </div>

          <div className="divide-y divide-slate-100">
            {topPosts.map((post, index) => (
              <div key={post.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>

                  {post.mediaUrls && post.mediaUrls[0] && (
                    <div className="w-14 h-14 rounded overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img
                        src={post.mediaUrls[0]}
                        alt="Media"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        {post.platforms.map(p => (
                          <PlatformIcon key={p} platform={p} size={12} />
                        ))}
                      </div>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums text-[11px]">
                        {new Date(post.scheduledFor).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 leading-snug line-clamp-2">
                      {post.content}
                    </p>

                    {post.performance && (
                      <div className="flex items-center gap-3 text-[11px] font-mono tabular-nums text-slate-600 pt-0.5">
                        <span>👁️ {(post.performance.impressions / 1000).toFixed(1)}k</span>
                        <span>❤️ {post.performance.likes}</span>
                        <span>💬 {post.performance.comments}</span>
                        <span>↗️ {post.performance.clicks} clicks</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-2">
                  <div className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-xs font-semibold">
                    {post.performance?.engagementRate || 5.2}% ER
                  </div>
                  <div>
                    <button
                      onClick={() => onRepurposePost(post)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Repurpose</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audience Heatmap: Best Time to Post (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Best Time to Post Heatmap
            </h3>
            <p className="text-xs text-slate-500">
              Audience engagement intensity by day of week and hour (PT)
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[320px] space-y-1">
              {/* Hour headers */}
              <div className="flex items-center text-[10px] font-mono text-slate-400 pl-8 pr-1 justify-between">
                <span>12 AM</span>
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
                <span>11 PM</span>
              </div>

              {daysOfWeek.map((dayName, dayIndex) => {
                const dayCells = heatmapData.filter(c => c.day === dayIndex);
                return (
                  <div key={dayIndex} className="flex items-center gap-1.5">
                    <span className="w-7 text-[11px] font-medium text-slate-600 shrink-0">
                      {dayName}
                    </span>
                    <div className="grid grid-cols-24 gap-0.5 flex-1">
                      {dayCells.map((cell) => {
                        // Score 0-100 color mapping
                        let bgClass = 'bg-slate-100';
                        if (cell.score > 85) bgClass = 'bg-indigo-600 text-white';
                        else if (cell.score > 65) bgClass = 'bg-indigo-400';
                        else if (cell.score > 45) bgClass = 'bg-indigo-300';
                        else if (cell.score > 25) bgClass = 'bg-indigo-100';

                        return (
                          <div
                            key={cell.hour}
                            title={`${dayName} at ${cell.hour}:00 — ${cell.score}% engagement score`}
                            className={`h-4.5 rounded-2xs ${bgClass} cursor-pointer hover:ring-1 hover:ring-slate-900 transition-all`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Peak window: <strong className="text-slate-800">Tue-Thu 9:00 AM - 11:30 AM</strong></span>
            <div className="flex items-center gap-1 text-[10px]">
              <span>Low</span>
              <span className="w-2.5 h-2.5 bg-slate-100 rounded-2xs inline-block" />
              <span className="w-2.5 h-2.5 bg-indigo-300 rounded-2xs inline-block" />
              <span className="w-2.5 h-2.5 bg-indigo-600 rounded-2xs inline-block" />
              <span>High</span>
            </div>
          </div>
        </div>

      </div>
        </>
      )}

    </div>
  );
};
