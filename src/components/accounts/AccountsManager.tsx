import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  ShieldCheck, 
  X, 
  Upload, 
  Download, 
  Search, 
  Users, 
  Activity, 
  SlidersHorizontal, 
  CheckCircle2, 
  AlertCircle, 
  LogIn, 
  LogOut, 
  UserCheck, 
  Sparkles as SparklesIcon,
  ExternalLink,
  Send,
  Zap,
  Check,
  Globe
} from 'lucide-react';
import { SocialAccount, SocialPlatform } from '../../types';
import { PlatformIcon, getPlatformName } from '../common/PlatformIcon';
import { CsvAccountsImportModal } from './CsvAccountsImportModal';
import { ConnectSocialAccountModal } from './ConnectSocialAccountModal';
import { exportAccountsToCsv } from '../../utils/csvAccountParser';
import { useAuth } from '../../contexts/AuthContext';
import { openOriginalApp, publishToOriginalApp, PLATFORM_CONFIGS } from '../../utils/socialAppBridge';

interface AccountsManagerProps {
  accounts: SocialAccount[];
  onToggleConnection: (id: string) => void;
  onAddAccount: (account: SocialAccount) => void;
  onDeleteAccount?: (id: string) => void;
  onClearAccounts?: () => void;
  onBulkImport?: (
    accounts: SocialAccount[],
    mode: 'merge' | 'replace' | 'skip_duplicates',
    summary: { added: number; updated: number }
  ) => void;
}

export const AccountsManager: React.FC<AccountsManagerProps> = ({
  accounts,
  onToggleConnection,
  onAddAccount,
  onDeleteAccount,
  onClearAccounts,
  onBulkImport,
}) => {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedPlatformToConnect, setSelectedPlatformToConnect] = useState<SocialPlatform>('twitter');
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | SocialPlatform>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [testedAppId, setTestedAppId] = useState<string | null>(null);

  const { user, profile, openAuthModal, logout } = useAuth();

  const hasDemoAccounts = useMemo(() => {
    return accounts.some(a => 
      a.handle.toLowerCase().includes('pulsemedia') || 
      a.handle.toLowerCase().includes('pulseteam') || 
      a.id.startsWith('acc-x-1') || 
      a.id.startsWith('acc-li-1') ||
      a.id.startsWith('acc-ig-1') ||
      a.id.startsWith('acc-fb-1') ||
      a.id.startsWith('acc-tt-1')
    );
  }, [accounts]);

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      if (platformFilter !== 'all' && acc.platform !== platformFilter) return false;
      if (statusFilter === 'active' && !acc.isConnected) return false;
      if (statusFilter === 'paused' && acc.isConnected) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesHandle = acc.handle.toLowerCase().includes(q);
        const matchesName = acc.name.toLowerCase().includes(q);
        if (!matchesHandle && !matchesName) return false;
      }
      return true;
    });
  }, [accounts, platformFilter, statusFilter, searchQuery]);

  // Aggregate stats
  const totalFollowers = useMemo(() => {
    return accounts.reduce((acc, curr) => acc + curr.followersCount, 0);
  }, [accounts]);

  const activeCount = useMemo(() => {
    return accounts.filter(a => a.isConnected).length;
  }, [accounts]);

  const handleTestIntent = (acc: SocialAccount) => {
    publishToOriginalApp(acc.platform, `Sharing test update from PulseSocial to ${PLATFORM_CONFIGS[acc.platform]?.displayName || 'channel'}! 🚀`);
    setTestedAppId(acc.id);
    setTimeout(() => setTestedAppId(null), 3000);
  };

  // Export current accounts to CSV
  const handleExportCsv = () => {
    const csvData = exportAccountsToCsv(accounts);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pulsesocial_accounts_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      
      {/* Cloud Account & Authentication Status */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-400"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : <UserCheck className="w-6 h-6" />}
              </div>
            )}
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${user ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {user ? (profile?.displayName || user.displayName || 'Creator Account') : 'Guest Session (Local Mode)'}
              </h3>
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${user ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                {user ? 'Cloud Synced' : 'Guest'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {user ? (user.email || 'Authenticated User') : 'Sign in or register to sync your publishing queue and connected accounts to the cloud.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {user ? (
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-300" />
              <span>Log Out</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
                <span>Create Account</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Connected Channels & Accounts
            </h2>
            <span className="text-xs font-mono font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
              {accounts.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage multi-network authorizations, bulk CSV metadata uploads, and live sync status
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Clear Demo Handles if present */}
          {hasDemoAccounts && (
            <button
              onClick={() => {
                if (onClearAccounts) onClearAccounts();
              }}
              className="min-h-[44px] sm:min-h-0 flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Remove sample demo accounts and start with your real accounts"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Clear Demo Handles</span>
            </button>
          )}

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            disabled={accounts.length === 0}
            className="min-h-[44px] sm:min-h-0 flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Export all configured accounts to CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {/* Bulk Import CSV */}
          <button
            onClick={() => setShowImportModal(true)}
            className="min-h-[44px] sm:min-h-0 flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>Import CSV</span>
          </button>

          {/* Connect Single Profile */}
          <button
            onClick={() => setShowConnectModal(true)}
            className="min-h-[44px] sm:min-h-0 w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Real Account</span>
          </button>
        </div>
      </div>

      {/* Demo Accounts Banner */}
      {hasDemoAccounts && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1 px-2 bg-amber-200/80 rounded-lg text-amber-900 font-bold text-[10px] tracking-wide">
              DEMO HANDLES ACTIVE
            </span>
            <span className="text-amber-800">
              Sample demo channels (@pulsemedia) are loaded. Clear them to connect and test your own genuine social accounts.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onClearAccounts) onClearAccounts();
            }}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-2xs transition-colors"
          >
            Remove All Demo Handles
          </button>
        </div>
      )}

      {/* 1-Click Quick Connect Platform Chips */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3.5 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-2xs">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-950">Quick-Connect Channels:</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                1-Click Ready
              </span>
            </div>
            <p className="text-[11px] text-indigo-700 mt-0.5">
              Instant workable setup wired directly to native apps & official publishers
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {(['twitter', 'linkedin', 'instagram', 'tiktok', 'facebook'] as SocialPlatform[]).map((plat) => (
            <button
              key={plat}
              type="button"
              onClick={() => {
                setSelectedPlatformToConnect(plat);
                setShowConnectModal(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200/80 shadow-2xs transition-all cursor-pointer"
            >
              <PlatformIcon platform={plat} size={14} />
              <span>+ {getPlatformName(plat)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Aggregate Metrics Header Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Profiles</span>
            <span className="text-xl font-bold font-mono text-slate-900">{accounts.length}</span>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Active Connections</span>
            <span className="text-xl font-bold font-mono text-emerald-600">{activeCount} / {accounts.length}</span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Combined Audience</span>
            <span className="text-xl font-bold font-mono text-slate-900">{totalFollowers.toLocaleString()}</span>
          </div>
          <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts or handles..."
            className="w-full pl-8 pr-8 py-2 sm:py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Network & Status Pills - Horizontal Scrollable on Mobile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 overflow-hidden">
          {/* Network Pills */}
          <div className="flex items-center gap-1 text-xs overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setPlatformFilter('all')}
              className={`min-h-[36px] sm:min-h-0 px-3 py-1.5 sm:py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                platformFilter === 'all'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 bg-slate-50'
              }`}
            >
              All Networks
            </button>
            {(['twitter', 'linkedin', 'instagram', 'facebook', 'tiktok'] as SocialPlatform[]).map((p) => {
              const count = accounts.filter(a => a.platform === p).length;
              if (count === 0 && platformFilter !== p) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`min-h-[36px] sm:min-h-0 flex items-center gap-1.5 px-3 py-1.5 sm:py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                    platformFilter === p
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 bg-slate-50'
                  }`}
                >
                  <PlatformIcon platform={p} size={12} />
                  <span>{getPlatformName(p)}</span>
                  <span className="text-[10px] opacity-80">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium shrink-0 justify-center">
            <button
              onClick={() => setStatusFilter('all')}
              className={`min-h-[32px] sm:min-h-0 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`min-h-[32px] sm:min-h-0 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                statusFilter === 'active' ? 'bg-white text-emerald-700 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('paused')}
              className={`min-h-[32px] sm:min-h-0 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                statusFilter === 'paused' ? 'bg-white text-slate-700 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              Paused
            </button>
          </div>
        </div>
      </div>

      {/* Connected Accounts Cards Grid */}
      {accounts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-2xs space-y-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xs border border-indigo-100">
            <Globe className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Connect Your Real Social Accounts
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              All demo accounts have been cleared. Link your real Twitter/X, LinkedIn, Instagram, TikTok, or Facebook profile to test live app publishing and scheduling.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {(['twitter', 'linkedin', 'instagram', 'tiktok', 'facebook'] as SocialPlatform[]).map(plat => (
              <button
                key={plat}
                type="button"
                onClick={() => {
                  setSelectedPlatformToConnect(plat);
                  setShowConnectModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <PlatformIcon platform={plat} size={15} />
                <span>+ Connect {getPlatformName(plat)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-2xs">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No channels match filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search query, or import accounts from your CSV spreadsheets.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              onClick={() => { setSearchQuery(''); setPlatformFilter('all'); setStatusFilter('all'); }}
              className="min-h-[44px] sm:min-h-0 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer w-full sm:w-auto"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="min-h-[44px] sm:min-h-0 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer w-full sm:w-auto"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Bulk Import CSV</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredAccounts.map((acc) => {
            const platConfig = PLATFORM_CONFIGS[acc.platform];
            return (
              <div
                key={acc.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={acc.avatarUrl}
                          alt={acc.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-2xs"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-2xs border border-slate-100">
                          <PlatformIcon platform={acc.platform} size={14} />
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 block leading-tight truncate">
                            {acc.name}
                          </span>
                          <span className="text-[9px] font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100 uppercase tracking-wider">
                            API Wired
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 block leading-tight font-normal truncate mt-0.5">
                          {acc.handle}
                        </span>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ml-2 ${
                      acc.isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${acc.isConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      <span>{acc.isConnected ? 'Active' : 'Paused'}</span>
                    </span>
                  </div>

                  {/* Metrics & Scope row */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl text-xs mb-3 border border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Audience / Followers</span>
                      <span className="font-mono tabular-nums font-bold text-slate-800">
                        {acc.followersCount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">OAuth Status</span>
                      <span className="text-slate-700 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{acc.oauthScopes ? `${acc.oauthScopes.length} Scopes` : 'Authorized'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Original App Deep Link Bar */}
                  <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => openOriginalApp(acc.platform, acc.handle)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                      title={`Open ${acc.handle} directly in ${platConfig?.displayName || 'original app'}`}
                    >
                      <PlatformIcon platform={acc.platform} size={13} />
                      <span className="truncate">Open in {platConfig?.shortName || 'App'}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTestIntent(acc)}
                      className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        testedAppId === acc.id
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                      }`}
                      title={`Launch direct compose intent in ${platConfig?.displayName || 'app'}`}
                    >
                      {testedAppId === acc.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Sent!</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span>Intent</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Actions & Delete Confirmation */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {confirmDeleteId === acc.id ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] text-red-600 font-medium">Remove account?</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="min-h-[36px] px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 rounded-md cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (onDeleteAccount) onDeleteAccount(acc.id);
                            setConfirmDeleteId(null);
                          }}
                          className="min-h-[36px] px-2.5 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md cursor-pointer"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => onToggleConnection(acc.id)}
                        className={`min-h-[36px] text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
                          acc.isConnected
                            ? 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
                            : 'text-white bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        {acc.isConnected ? 'Disconnect' : 'Re-authenticate'}
                      </button>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <div className="hidden xs:flex items-center gap-1 text-emerald-600 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>OAuth 2.0 PKCE</span>
                        </div>
                        {onDeleteAccount && (
                          <button
                            onClick={() => setConfirmDeleteId(acc.id)}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="Remove social profile"
                            aria-label={`Delete ${acc.handle}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CSV Bulk Import Modal */}
      <CsvAccountsImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        existingAccounts={accounts}
        onImport={(importedAccounts, mode, summary) => {
          if (onBulkImport) {
            onBulkImport(importedAccounts, mode, summary);
          } else {
            importedAccounts.forEach(acc => onAddAccount(acc));
          }
        }}
      />

      {/* Official Channel Connection & OAuth Modal */}
      <ConnectSocialAccountModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        initialPlatform={selectedPlatformToConnect}
        onAccountConnected={(newAcc) => onAddAccount(newAcc)}
      />

    </div>
  );
};
