import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  ArrowRight,
  Globe,
  Lock,
  Copy,
  Check,
  Zap,
  Info,
  Layers,
  Flame,
  KeyRound
} from 'lucide-react';
import { SocialAccount } from '../../types';

interface FacebookLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountLinked: (account: SocialAccount) => void;
  initialType?: 'page' | 'group';
}

const PAGE_CATEGORIES = [
  'Creator / Influencer',
  'Brand & Product',
  'Media & Publishing',
  'E-commerce & Retail',
  'Community Organization',
  'Agency & Marketing',
  'Software & Technology',
  'Local Business'
];

export const FacebookLinkModal: React.FC<FacebookLinkModalProps> = ({
  isOpen,
  onClose,
  onAccountLinked,
  initialType = 'page'
}) => {
  const [activeTab, setActiveTab] = useState<'page' | 'group'>(initialType);

  // Facebook Page State
  const [pageName, setPageName] = useState('');
  const [pageHandleOrUrl, setPageHandleOrUrl] = useState('');
  const [pageId, setPageId] = useState('');
  const [pageCategory, setPageCategory] = useState(PAGE_CATEGORIES[0]);
  const [pageFollowers, setPageFollowers] = useState<number>(4500);
  const [enablePageGraphToken, setEnablePageGraphToken] = useState(false);
  const [pageAccessToken, setPageAccessToken] = useState('');

  // Facebook Group State
  const [groupName, setGroupName] = useState('');
  const [groupHandleOrUrl, setGroupHandleOrUrl] = useState('');
  const [groupId, setGroupId] = useState('');
  const [groupPrivacy, setGroupPrivacy] = useState<'public' | 'private'>('public');
  const [groupMembers, setGroupMembers] = useState<number>(8200);
  const [isAdminConfirmed, setIsAdminConfirmed] = useState(true);

  // Status & Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [testedUrl, setTestedUrl] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialType);
    setErrorMessage(null);
  }, [initialType, isOpen]);

  if (!isOpen) return null;

  // Extract clean Page handle/slug
  const cleanPageSlug = pageHandleOrUrl
    .replace(/^https?:\/\/(www\.)?facebook\.com\//i, '')
    .replace(/^@/, '')
    .replace(/[/?#].*$/, '')
    .trim();

  // Extract clean Group handle/slug
  const cleanGroupSlug = groupHandleOrUrl
    .replace(/^https?:\/\/(www\.)?facebook\.com\/groups\//i, '')
    .replace(/^https?:\/\/(www\.)?facebook\.com\//i, '')
    .replace(/^groups\//i, '')
    .replace(/^@/, '')
    .replace(/[/?#].*$/, '')
    .trim();

  // Canonical URLs
  const canonicalPageUrl = cleanPageSlug ? `https://www.facebook.com/${cleanPageSlug}` : '';
  const canonicalGroupUrl = cleanGroupSlug ? `https://www.facebook.com/groups/${cleanGroupSlug}` : '';

  const liveUrl = activeTab === 'page' ? canonicalPageUrl : canonicalGroupUrl;

  const handleTestLink = (url: string) => {
    if (!url) {
      setErrorMessage(activeTab === 'page' ? 'Please enter a valid Facebook Page handle or URL.' : 'Please enter a valid Facebook Group slug or URL.');
      return;
    }
    setErrorMessage(null);
    setTestedUrl(url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    if (!liveUrl) return;
    navigator.clipboard?.writeText(liveUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (activeTab === 'page') {
      if (!pageName.trim()) {
        setErrorMessage('Please enter the Facebook Page Name.');
        return;
      }
      if (!cleanPageSlug) {
        setErrorMessage('Please enter the Facebook Page handle or URL (e.g. facebook.com/yourpage).');
        return;
      }

      setIsSubmitting(true);
      try {
        const finalId = pageId.trim() || `page_${cleanPageSlug}_${Date.now()}`;
        const newAccount: SocialAccount = {
          id: `acc-fb-page-${Date.now()}`,
          platform: 'facebook',
          name: pageName.trim(),
          handle: `@${cleanPageSlug}`,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(pageName.trim())}&background=1877F2&color=fff&bold=true`,
          followersCount: Number(pageFollowers) || 0,
          isConnected: true,
          lastSyncedAt: 'Just now',
          oauthScopes: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts', 'public_profile'],
          appUrl: canonicalPageUrl,
          deepLink: `fb://page/${cleanPageSlug}`,
          authType: enablePageGraphToken ? 'api_key' : 'oauth2',
          verified: true,
          savedLocally: true,
          savedToCloud: true,
          lastSavedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          notes: `Category: ${pageCategory}${pageId ? ` • Page ID: ${pageId}` : ''}`,
          accountType: 'page',
          facebookType: 'page',
          facebookId: finalId
        };

        onAccountLinked(newAccount);
        onClose();
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to link Facebook Page.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Group linking
      if (!groupName.trim()) {
        setErrorMessage('Please enter the Facebook Group Name.');
        return;
      }
      if (!cleanGroupSlug) {
        setErrorMessage('Please enter the Facebook Group slug or URL (e.g. facebook.com/groups/community).');
        return;
      }
      if (!isAdminConfirmed) {
        setErrorMessage('Please confirm that you have Admin or Moderator publishing rights in this group.');
        return;
      }

      setIsSubmitting(true);
      try {
        const finalId = groupId.trim() || `group_${cleanGroupSlug}_${Date.now()}`;
        const newAccount: SocialAccount = {
          id: `acc-fb-group-${Date.now()}`,
          platform: 'facebook',
          name: groupName.trim(),
          handle: `groups/${cleanGroupSlug}`,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(groupName.trim())}&background=0E52BD&color=fff&bold=true`,
          followersCount: Number(groupMembers) || 0,
          isConnected: true,
          lastSyncedAt: 'Just now',
          oauthScopes: ['publish_to_groups', 'groups_access_member_info', 'public_profile'],
          appUrl: canonicalGroupUrl,
          deepLink: `fb://group/${cleanGroupSlug}`,
          authType: 'oauth2',
          verified: true,
          savedLocally: true,
          savedToCloud: true,
          lastSavedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          notes: `Privacy: ${groupPrivacy === 'public' ? 'Public Community' : 'Private Group'}${groupId ? ` • Group ID: ${groupId}` : ''}`,
          accountType: 'group',
          facebookType: 'group',
          facebookId: finalId
        };

        onAccountLinked(newAccount);
        onClose();
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to link Facebook Group.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-5 sm:px-6 py-5 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-white/20 rounded-lg inline-flex">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-100">
              Meta Facebook Destination
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Link Facebook Page or Group
          </h2>
          <p className="text-xs text-blue-100/90 mt-1 leading-relaxed">
            Connect public creator/business Pages or active community Groups to schedule posts, manage discussions, and track engagement.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1 shrink-0">
          <button
            type="button"
            onClick={() => { setActiveTab('page'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'page'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Facebook Page (Brand / Creator)</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('group'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'group'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Facebook Group (Community)</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'page' ? (
            /* FACEBOOK PAGE FORM */
            <div className="space-y-4">
              {/* Page Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Facebook Page Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. PulseMedia Global or Musty Tech"
                    value={pageName}
                    onChange={(e) => setPageName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Page Username or URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Page Username or URL <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] font-normal text-slate-500">e.g. @username or facebook.com/...</span>
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="facebook.com/PulseMediaHQ or @PulseMediaHQ"
                    value={pageHandleOrUrl}
                    onChange={(e) => setPageHandleOrUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Grid: Category & Followers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Page Category
                  </label>
                  <select
                    value={pageCategory}
                    onChange={(e) => setPageCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
                  >
                    {PAGE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Followers / Page Likes
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 15400"
                    value={pageFollowers}
                    onChange={(e) => setPageFollowers(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              {/* Page ID Optional */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Numeric Page ID</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional (Found in Page About tab)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10482910482019"
                  value={pageId}
                  onChange={(e) => setPageId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              {/* Advanced Graph API Token toggle */}
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-bold text-blue-950">Meta Page Access Token</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnablePageGraphToken(!enablePageGraphToken)}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                  >
                    {enablePageGraphToken ? 'Hide Token Field' : '+ Add Permanent Token'}
                  </button>
                </div>
                {enablePageGraphToken && (
                  <div className="space-y-1 pt-1 animate-in fade-in">
                    <input
                      type="password"
                      placeholder="EAAG... (Page Access Token with pages_manage_posts)"
                      value={pageAccessToken}
                      onChange={(e) => setPageAccessToken(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <span className="text-[10px] text-blue-600 block">
                      Enables automated headless publishing via Meta Graph API v20.0
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* FACEBOOK GROUP FORM */
            <div className="space-y-4">
              {/* Group Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Facebook Group Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Digital Marketing Insiders Africa"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Group URL or Slug */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Group URL or Slug <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] font-normal text-slate-500">facebook.com/groups/...</span>
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="facebook.com/groups/digitalmarketinginsiders or 92847192"
                    value={groupHandleOrUrl}
                    onChange={(e) => setGroupHandleOrUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Privacy Setting & Member Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Group Privacy Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGroupPrivacy('public')}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        groupPrivacy === 'public'
                          ? 'bg-blue-50/80 border-blue-500 text-blue-950 ring-1 ring-blue-500'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-600 mb-0.5" />
                      <span className="block text-xs font-bold">Public</span>
                      <span className="block text-[10px] text-slate-500">Anyone sees</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGroupPrivacy('private')}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        groupPrivacy === 'private'
                          ? 'bg-blue-50/80 border-blue-500 text-blue-950 ring-1 ring-blue-500'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5 text-indigo-600 mb-0.5" />
                      <span className="block text-xs font-bold">Private</span>
                      <span className="block text-[10px] text-slate-500">Members only</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Group Member Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 8200"
                    value={groupMembers}
                    onChange={(e) => setGroupMembers(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              {/* Numeric Group ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Numeric Group ID</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional (Found in group URL or settings)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2948201948201"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              {/* Admin Confirmation Checkbox */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAdminConfirmed}
                    onChange={(e) => setIsAdminConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800 block">
                      Admin or Moderator Publishing Confirmation
                    </span>
                    <span className="text-[11px] text-slate-500">
                      I have permission to publish discussions and media to this Facebook Group on behalf of the community.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Live Preview Card */}
          {liveUrl && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Real Destination Link Preview</span>
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                  {activeTab === 'page' ? 'Facebook Page' : 'Facebook Group'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 font-mono text-xs text-slate-800 break-all">
                <span>{liveUrl}</span>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    title="Copy Link"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-slate-500">
                  Verify destination before saving to your publishing queue:
                </p>
                <button
                  type="button"
                  onClick={() => handleTestLink(liveUrl)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <span>Test Link</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {isSubmitting 
                  ? 'Linking...' 
                  : activeTab === 'page' ? 'Link Facebook Page' : 'Link Facebook Group'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
