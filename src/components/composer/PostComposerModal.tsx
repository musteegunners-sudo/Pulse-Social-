import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Calendar, 
  Clock, 
  Image as ImageIcon, 
  Send, 
  Save, 
  Check, 
  Hash, 
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Wand2,
  RefreshCw,
  RotateCcw,
  Copy,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  Bot,
  Zap,
  Plus,
  Tag,
  Briefcase,
  Target,
  ExternalLink
} from 'lucide-react';
import { SocialAccount, SocialPlatform, SocialPost } from '../../types';
import { PlatformIcon, getPlatformName } from '../common/PlatformIcon';
import { MEDIA_PRESETS } from '../../data/initialData';
import { 
  geminiService, 
  RefinementType 
} from '../../services/geminiService';
import { publishToOriginalApp, openOriginalApp, PLATFORM_CONFIGS } from '../../utils/socialAppBridge';
import { AiComposerAssistant } from './AiComposerAssistant';
import { matchHashtagsFromContent, searchHashtags, HashtagMatch } from '../../utils/hashtagMatcher';

interface PostComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePost: (post: SocialPost) => void;
  accounts: SocialAccount[];
  initialPost?: SocialPost | null;
  initialDate?: string;
}

const PLATFORM_LIMITS: Record<SocialPlatform, number> = {
  twitter: 280,
  linkedin: 3000,
  instagram: 2200,
  facebook: 63206,
  tiktok: 2200,
  whatsapp: 700,
};

export const PostComposerModal: React.FC<PostComposerModalProps> = ({
  isOpen,
  onClose,
  onSavePost,
  accounts,
  initialPost,
  initialDate,
}) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['twitter', 'linkedin']);
  const [content, setContent] = useState('');
  const [firstComment, setFirstComment] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [selectedMediaPreset, setSelectedMediaPreset] = useState<string>('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [campaign, setCampaign] = useState('Product Launch Q3');
  const [scheduleMode, setScheduleMode] = useState<'schedule' | 'now' | 'queue' | 'draft'>('schedule');
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  // Preview tab platform
  const [previewPlatform, setPreviewPlatform] = useState<SocialPlatform>('twitter');

  // History buffer for undo
  const [previousContent, setPreviousContent] = useState<string | null>(null);

  // Schedule date/time
  const [scheduleDate, setScheduleDate] = useState(() => {
    if (initialDate) return initialDate.slice(0, 10);
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [scheduleTime, setScheduleTime] = useState('14:30');

  // AI Assistant drawer & state
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [quickRefineLoading, setQuickRefineLoading] = useState<string | null>(null);
  const [isGeneratingTagsQuick, setIsGeneratingTagsQuick] = useState(false);

  // Keyword-matching hashtag suggestions & autocomplete state
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const tagInputContainerRef = useRef<HTMLDivElement>(null);

  // Compute keyword-matched hashtags directly from post content in real time
  const keywordMatchedTags = useMemo(() => {
    return matchHashtagsFromContent(content, tags, 8);
  }, [content, tags]);

  // Compute autocomplete options based on tag input
  const tagAutocompleteList = useMemo(() => {
    if (!tagInput.trim()) return [];
    return searchHashtags(tagInput, tags, 6);
  }, [tagInput, tags]);

  // Dismiss autocomplete dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tagInputContainerRef.current &&
        !tagInputContainerRef.current.contains(e.target as Node)
      ) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize from initialPost or initialDate
  useEffect(() => {
    if (initialPost) {
      setContent(initialPost.content);
      setSelectedPlatforms(initialPost.platforms || ['twitter']);
      setMediaUrls(initialPost.mediaUrls || []);
      setFirstComment(initialPost.firstComment || '');
      setTags(initialPost.tags || []);
      setCampaign(initialPost.campaign || 'Product Launch Q3');
      if (initialPost.scheduledFor) {
        const d = new Date(initialPost.scheduledFor);
        setScheduleDate(d.toISOString().slice(0, 10));
        setScheduleTime(d.toTimeString().slice(0, 5));
      }
      setPreviewPlatform(initialPost.platforms[0] || 'twitter');
    } else {
      setContent('');
      setSelectedPlatforms(['twitter', 'linkedin']);
      setMediaUrls([]);
      setFirstComment('');
      setTags(['#Growth', '#Strategy']);
      if (initialDate) {
        setScheduleDate(initialDate.slice(0, 10));
        setScheduleTime('11:00');
      }
    }
  }, [initialPost, initialDate, isOpen]);

  // Keep preview platform in sync with selected platforms
  useEffect(() => {
    if (!selectedPlatforms.includes(previewPlatform) && selectedPlatforms.length > 0) {
      setPreviewPlatform(selectedPlatforms[0]);
    }
  }, [selectedPlatforms, previewPlatform]);

  if (!isOpen) return null;

  const togglePlatform = (p: SocialPlatform) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter(item => item !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim().startsWith('#') ? tagInput.trim() : `#${tagInput.trim()}`;
    if (!tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setTagInput('');
  };

  const removeTag = (t: string) => {
    setTags(tags.filter(tag => tag !== t));
  };

  const handleAddPresetMedia = (url: string) => {
    if (mediaUrls.includes(url)) {
      setMediaUrls(mediaUrls.filter(u => u !== url));
    } else {
      setMediaUrls([url]);
    }
  };

  const handleCustomImageUrlAdd = () => {
    if (!customImageUrl.trim()) return;
    setMediaUrls([customImageUrl.trim()]);
    setCustomImageUrl('');
  };

  const handleApplyAiContent = (newContent: string) => {
    setPreviousContent(content);
    setContent(newContent);
  };

  const handleAppendAiContent = (additional: string) => {
    setPreviousContent(content);
    setContent((prev) => (prev ? `${prev}${additional}` : additional.trim()));
  };

  const handleAddAiTags = (newTags: string[]) => {
    const combined = Array.from(new Set([...tags, ...newTags]));
    setTags(combined);
  };

  const handleAddSuggestedTag = (tag: string) => {
    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
    if (!tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
  };

  const handleAddAllKeywordTags = () => {
    const newTags = keywordMatchedTags.map(m => m.tag);
    const combined = Array.from(new Set([...tags, ...newTags]));
    setTags(combined);
  };

  const handleUndo = () => {
    if (previousContent !== null) {
      setContent(previousContent);
      setPreviousContent(null);
    }
  };

  // Quick 1-click tone refinement directly from the bar under the textarea
  const handleQuickRefine = async (type: RefinementType) => {
    if (!content.trim() || quickRefineLoading) return;
    setQuickRefineLoading(type);
    try {
      setPreviousContent(content);
      const result = await geminiService.refinePost({
        content: content.trim(),
        refinementType: type,
        platform: previewPlatform,
      });
      setContent(result.refinedContent);
      if (result.suggestedHashtags && result.suggestedHashtags.length > 0) {
        handleAddAiTags(result.suggestedHashtags);
      }
    } catch (err) {
      console.error('Quick refine failed:', err);
    } finally {
      setQuickRefineLoading(null);
    }
  };

  // Generate hashtags on demand for current post
  const handleQuickSuggestTags = async () => {
    if (!content.trim() || isGeneratingTagsQuick) return;
    setIsGeneratingTagsQuick(true);
    try {
      const suggested = await geminiService.generateHashtags(content, previewPlatform);
      if (suggested && suggested.length > 0) {
        handleAddAiTags(suggested);
      }
    } catch (err) {
      console.error('Quick tag suggestion failed:', err);
    } finally {
      setIsGeneratingTagsQuick(false);
    }
  };

  const handleSave = (status: 'scheduled' | 'published' | 'draft' | 'queued' | 'now') => {
    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`);

    const newPost: SocialPost = {
      id: initialPost ? initialPost.id : `post-${Date.now()}`,
      content: content.trim(),
      platforms: selectedPlatforms,
      targetAccountIds: accounts.filter(a => selectedPlatforms.includes(a.platform)).map(a => a.id),
      scheduledFor: status === 'now' ? new Date().toISOString() : scheduledDateTime.toISOString(),
      publishedAt: status === 'now' ? new Date().toISOString() : undefined,
      status: status === 'now' ? 'published' : status,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      firstComment: firstComment.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      createdAt: initialPost?.createdAt || new Date().toISOString(),
      campaign,
      author: 'Current User',
    };

    onSavePost(newPost);
    onClose();
  };

  // Preview account
  const previewAccount = accounts.find(a => a.platform === previewPlatform) || {
    name: 'PulseMedia HQ',
    handle: '@pulsemedia_hq',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    platform: previewPlatform,
  };

  // Character limit calculations
  const currentLimit = PLATFORM_LIMITS[previewPlatform] || 280;
  const remainingChars = currentLimit - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white sm:rounded-2xl shadow-2xl border-0 sm:border border-slate-200 w-full sm:max-w-5xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[92vh]">
        
        {/* Modal Topbar */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {initialPost ? 'Edit Post' : 'Compose Cross-Platform Post'}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium truncate">
              {selectedPlatforms.length} {selectedPlatforms.length === 1 ? 'network' : 'networks'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
            aria-label="Close composer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="lg:hidden flex items-center border-b border-slate-200 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab('edit')}
            className={`min-h-[44px] flex-1 text-xs font-bold py-2.5 text-center transition-colors cursor-pointer border-b-2 ${
              mobileTab === 'edit'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Compose Content
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`min-h-[44px] flex-1 text-xs font-bold py-2.5 text-center transition-colors cursor-pointer border-b-2 ${
              mobileTab === 'preview'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Preview ({selectedPlatforms.length})
          </button>
        </div>

        {/* Modal Body - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          
          {/* Left Column: Form & Settings (7 cols) */}
          <div className={`lg:col-span-7 p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
            
            {/* Target Platforms Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Publishing Channels
              </label>
              <div className="flex flex-wrap gap-2">
                {(['twitter', 'linkedin', 'instagram', 'facebook', 'tiktok'] as SocialPlatform[]).map((plat) => {
                  const isSelected = selectedPlatforms.includes(plat);
                  return (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => togglePlatform(plat)}
                      className={`min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-semibold'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <PlatformIcon platform={plat} size={15} />
                      <span>{getPlatformName(plat)}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Textarea with AI Tool button */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Post Content
                  </label>
                  {previousContent && (
                    <button
                      type="button"
                      onClick={handleUndo}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-2 py-0.5 rounded transition-colors cursor-pointer"
                      title="Undo last AI modification"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Undo AI change</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAiDrawer(!showAiDrawer)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                      showAiDrawer
                        ? 'bg-indigo-700 text-white ring-2 ring-indigo-300'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Assistant (Gemini)</span>
                  </button>
                  <span className="text-xs text-slate-300">|</span>
                  <span className={`text-xs font-mono tabular-nums ${isOverLimit ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                    {remainingChars} chars ({getPlatformName(previewPlatform)})
                  </span>
                </div>
              </div>

              {/* Advanced Gemini AI Assistant Drawer */}
              <AiComposerAssistant
                isOpen={showAiDrawer}
                onClose={() => setShowAiDrawer(false)}
                currentContent={content}
                onApplyContent={handleApplyAiContent}
                onAppendContent={handleAppendAiContent}
                onAddTags={handleAddAiTags}
                onSetFirstComment={(cmt) => setFirstComment(cmt)}
                previewPlatform={previewPlatform}
                selectedPlatforms={selectedPlatforms}
                previousContent={previousContent}
                onUndo={handleUndo}
              />

              {/* Post Main Textarea */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What would you like to share? Mention @handles, links, or click 'AI Assistant' above to draft with Gemini..."
                rows={5}
                className={`w-full p-3 text-xs text-slate-800 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  isOverLimit
                    ? 'border-red-300 focus:ring-red-400'
                    : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />

              {/* Quick 1-Click AI Tone Refinements Bar */}
              <div className="flex items-center justify-between gap-1 overflow-x-auto py-1 px-1 bg-slate-50/80 border border-slate-200/80 rounded-lg">
                <div className="flex items-center gap-1 shrink-0 px-1 text-[11px] font-semibold text-slate-500">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span className="hidden sm:inline">Refine:</span>
                </div>

                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {[
                    { type: 'professional' as RefinementType, label: 'Professional', icon: '👔' },
                    { type: 'punchy' as RefinementType, label: 'Punchy', icon: '⚡' },
                    { type: 'casual' as RefinementType, label: 'Casual', icon: '☕' },
                    { type: 'viral' as RefinementType, label: 'Viral Hook', icon: '🔥' },
                    { type: 'shorten' as RefinementType, label: 'Shorten (280)', icon: '✂️' },
                    { type: 'add_cta' as RefinementType, label: 'Add CTA', icon: '🎯' },
                    { type: 'fix_grammar' as RefinementType, label: 'Fix Polish', icon: '✨' },
                  ].map((preset) => {
                    const isLoading = quickRefineLoading === preset.type;
                    return (
                      <button
                        key={preset.type}
                        type="button"
                        onClick={() => handleQuickRefine(preset.type)}
                        disabled={!content.trim() || !!quickRefineLoading}
                        className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-md border whitespace-nowrap transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                          isLoading
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border-slate-200'
                        }`}
                        title={`Refine post to ${preset.label} tone`}
                      >
                        {isLoading ? (
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                        ) : (
                          <span>{preset.icon}</span>
                        )}
                        <span>{preset.label}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setShowAiDrawer(true)}
                  className="shrink-0 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 px-2 py-1 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                >
                  More AI...
                </button>
              </div>
            </div>

            {/* Media Attachments */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  Attached Media Asset
                </label>
                {mediaUrls.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setMediaUrls([])}
                    className="text-xs text-red-600 hover:underline cursor-pointer"
                  >
                    Remove media
                  </button>
                )}
              </div>

              {/* Preset high quality generated images */}
              <div className="grid grid-cols-4 gap-2 mb-2">
                {MEDIA_PRESETS.map((preset) => {
                  const isSelected = mediaUrls.includes(preset.url);
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleAddPresetMedia(preset.url)}
                      className={`relative aspect-video rounded-md overflow-hidden border-2 cursor-pointer transition-all ${
                        isSelected ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-slate-900/30 flex items-end p-1">
                        <span className="text-[10px] text-white font-medium truncate drop-shadow-xs">
                          {preset.title}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Custom Image URL input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="Or paste an image URL..."
                  className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleCustomImageUrlAdd}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer"
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* Hashtags & Tags with Keyword Matching Utility */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Hashtags & Categorization
                  </label>
                  {keywordMatchedTags.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Zap className="w-2.5 h-2.5 text-emerald-600" />
                      <span>{keywordMatchedTags.length} keyword {keywordMatchedTags.length === 1 ? 'match' : 'matches'}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {keywordMatchedTags.length > 1 && (
                    <button
                      type="button"
                      onClick={handleAddAllKeywordTags}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                    >
                      + Add all matches ({keywordMatchedTags.length})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleQuickSuggestTags}
                    disabled={!content.trim() || isGeneratingTagsQuick}
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Sparkles className={`w-3 h-3 ${isGeneratingTagsQuick ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingTagsQuick ? 'Generating...' : '+ AI Suggest Tags'}</span>
                  </button>
                </div>
              </div>

              {/* Keyword-matched suggestions chip tray */}
              {keywordMatchedTags.length > 0 && (
                <div className="mb-2.5 p-2.5 bg-gradient-to-r from-emerald-50/70 via-indigo-50/40 to-slate-50 border border-emerald-200/80 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-600" />
                      <span>Suggested from your draft text</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Click any tag to add</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {keywordMatchedTags.map((match) => (
                      <button
                        key={match.tag}
                        type="button"
                        onClick={() => handleAddSuggestedTag(match.tag)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-emerald-600 text-slate-700 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-md text-xs font-medium transition-all shadow-2xs cursor-pointer group"
                        title={`Matched keyword "${match.matchedKeyword}" (${match.category})`}
                      >
                        <Plus className="w-3 h-3 text-emerald-600 group-hover:text-white" />
                        <span>{match.tag}</span>
                        <span className="text-[9px] px-1 py-0.2 bg-emerald-100/70 group-hover:bg-emerald-700 text-emerald-800 group-hover:text-white rounded ml-0.5 font-normal">
                          {match.matchedKeyword}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Tags Display */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs border border-slate-200"
                  >
                    <span className="font-medium">{t}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="hover:text-red-500 cursor-pointer text-slate-400 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {tags.length === 0 && (
                  <span className="text-xs text-slate-400 italic">No tags selected yet. Type below or select from suggested matches above.</span>
                )}
              </div>

              {/* Tag Input with Autocomplete */}
              <div ref={tagInputContainerRef} className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      setShowAutocomplete(true);
                    }}
                    onFocus={() => {
                      if (tagInput.trim()) setShowAutocomplete(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                        setShowAutocomplete(false);
                      } else if (e.key === 'Escape') {
                        setShowAutocomplete(false);
                      }
                    }}
                    placeholder="Add tag or type keyword to search (e.g. AI, SaaS, Marketing)..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />

                  {/* Autocomplete Dropdown */}
                  {showAutocomplete && tagAutocompleteList.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1 max-h-48 overflow-y-auto">
                      <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                        <span>Keyword Matches</span>
                        <span className="text-[9px] text-slate-400 font-normal">Press Enter or click to add</span>
                      </div>
                      {tagAutocompleteList.map((item) => (
                        <button
                          key={item.tag}
                          type="button"
                          onClick={() => {
                            handleAddSuggestedTag(item.tag);
                            setTagInput('');
                            setShowAutocomplete(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-indigo-50 flex items-center justify-between text-slate-700 hover:text-indigo-700 cursor-pointer"
                        >
                          <span className="font-semibold">{item.tag}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleAddTag();
                    setShowAutocomplete(false);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Campaign Assignment for Aggregation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Marketing Campaign</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">For analytics & aggregation</span>
              </label>
              <div className="space-y-1.5">
                <div className="relative">
                  <input
                    type="text"
                    value={campaign}
                    onChange={(e) => setCampaign(e.target.value)}
                    placeholder="e.g. Product Launch Q3, Thought Leadership..."
                    className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5 text-xs">
                  <span className="text-[10px] text-slate-400 shrink-0">Presets:</span>
                  {[
                    'Product Launch Q3', 
                    'Thought Leadership', 
                    'Annual Report', 
                    'Employer Branding', 
                    'Content Marketing', 
                    'Community Engagement'
                  ].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCampaign(c)}
                      className={`px-2 py-0.5 text-[10px] rounded border whitespace-nowrap transition-colors cursor-pointer ${
                        campaign === c
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* First Comment (Instagram hashtags / LinkedIn Link) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                <span>First Comment (Optional)</span>
                <span className="text-[11px] text-slate-400 font-normal">Auto-posts with content</span>
              </label>
              <input
                type="text"
                value={firstComment}
                onChange={(e) => setFirstComment(e.target.value)}
                placeholder="e.g. Link in bio! Or additional niche hashtags..."
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            {/* Schedule Date & Best Times */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  Scheduling Options
                </span>
                <span className="text-[11px] text-slate-500">
                  Timezone: America/Los_Angeles (PT)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-1">Target Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-1">Target Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Recommended posting times */}
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">
                  AI Recommended High-Engagement Windows:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Today 3:30 PM', time: '15:30', dateOffset: 0 },
                    { label: 'Tomorrow 9:15 AM', time: '09:15', dateOffset: 1 },
                    { label: 'Thursday 2:00 PM', time: '14:00', dateOffset: 2 },
                  ].map((rec, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + rec.dateOffset);
                        setScheduleDate(d.toISOString().slice(0, 10));
                        setScheduleTime(rec.time);
                      }}
                      className="px-2 py-0.5 text-[11px] bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 rounded transition-colors cursor-pointer"
                    >
                      {rec.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Live Feed Simulation Preview (5 cols) */}
          <div className={`lg:col-span-5 p-4 sm:p-6 bg-slate-50/50 flex-col overflow-y-auto ${mobileTab === 'edit' ? 'hidden lg:flex' : 'flex'}`}>
            
            {/* Preview Platform Tabs & Original App Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span>Live Feed Preview</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                  {PLATFORM_CONFIGS[previewPlatform]?.displayName}
                </span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openOriginalApp(previewPlatform, previewAccount.handle)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer shadow-2xs"
                  title={`Open profile in ${PLATFORM_CONFIGS[previewPlatform]?.displayName}`}
                >
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                  <span>Open App</span>
                </button>

                <div className="flex items-center gap-1 bg-white p-0.5 border border-slate-200 rounded-md">
                  {selectedPlatforms.map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setPreviewPlatform(plat)}
                      className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                        previewPlatform === plat
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title={getPlatformName(plat)}
                    >
                      <PlatformIcon platform={plat} size={14} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulated Social Card Container */}
            <div className="flex-1 flex flex-col justify-start">
              
              {/* TWITTER / X PREVIEW */}
              {previewPlatform === 'twitter' && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3 font-sans">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={previewAccount.avatarUrl}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-900">{previewAccount.name}</span>
                          <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
                        </div>
                        <span className="text-[11px] text-slate-500">{previewAccount.handle} · just now</span>
                      </div>
                    </div>
                    <span className="text-slate-400 text-xs">•••</span>
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {content || 'Your post caption will appear here in high-fidelity Twitter format...'}
                  </p>

                  {tags.length > 0 && (
                    <div className="text-xs text-blue-600 flex flex-wrap gap-1 font-normal">
                      {tags.map(t => <span key={t}>{t}</span>)}
                    </div>
                  )}

                  {mediaUrls.length > 0 && (
                    <div className="rounded-lg overflow-hidden border border-slate-100 max-h-56">
                      <img
                        src={mediaUrls[0]}
                        alt="Media"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Twitter interactions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs px-1">
                    <span>💬 24</span>
                    <span>🔁 12</span>
                    <span>❤️ 148</span>
                    <span>📊 2.4k</span>
                    <span>🔖</span>
                  </div>
                </div>
              )}

              {/* LINKEDIN PREVIEW */}
              {previewPlatform === 'linkedin' && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3 font-sans">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={previewAccount.avatarUrl}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block leading-tight">{previewAccount.name}</span>
                        <span className="text-[10px] text-slate-500 block leading-tight">Official Brand Page · 84,600 followers</span>
                        <span className="text-[10px] text-slate-400">Scheduled · 🌐</span>
                      </div>
                    </div>
                    <span className="text-slate-400 text-xs">•••</span>
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {content || 'Your post will appear formatted here with LinkedIn layout and typography...'}
                  </p>

                  {tags.length > 0 && (
                    <div className="text-xs text-[#0A66C2] flex flex-wrap gap-1 font-medium">
                      {tags.map(t => <span key={t}>{t}</span>)}
                    </div>
                  )}

                  {mediaUrls.length > 0 && (
                    <div className="rounded overflow-hidden border border-slate-100 max-h-56">
                      <img
                        src={mediaUrls[0]}
                        alt="Media"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {firstComment && (
                    <div className="p-2 bg-slate-50 rounded text-[11px] text-slate-600 border border-slate-100">
                      <span className="font-semibold text-slate-700">First Comment: </span>
                      {firstComment}
                    </div>
                  )}

                  {/* LinkedIn actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-around text-slate-500 text-xs font-medium">
                    <span>👍 Like</span>
                    <span>💬 Comment</span>
                    <span>🔄 Repost</span>
                    <span>🚀 Send</span>
                  </div>
                </div>
              )}

              {/* INSTAGRAM PREVIEW */}
              {previewPlatform === 'instagram' && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs font-sans max-w-sm mx-auto w-full">
                  <div className="p-2.5 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                        <img
                          src={previewAccount.avatarUrl}
                          alt="Avatar"
                          className="w-full h-full rounded-full object-cover border-2 border-white"
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-900">{previewAccount.handle.replace('@', '')}</span>
                    </div>
                    <span className="text-slate-400 text-xs">•••</span>
                  </div>

                  {/* Instagram Image */}
                  <div className="aspect-square bg-slate-100 relative">
                    {mediaUrls.length > 0 ? (
                      <img
                        src={mediaUrls[0]}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                        <ImageIcon className="w-8 h-8 mb-2 stroke-1" />
                        <span className="text-xs">Instagram posts require an attached image or video</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-slate-800 text-sm">
                      <div className="flex items-center gap-3">
                        <span>❤️</span>
                        <span>💬</span>
                        <span>✈️</span>
                      </div>
                      <span>🔖</span>
                    </div>

                    <div className="text-xs text-slate-900 font-bold">1,420 likes</div>

                    <p className="text-xs text-slate-800 leading-snug line-clamp-3">
                      <span className="font-bold mr-1">{previewAccount.handle.replace('@', '')}</span>
                      {content || 'Add a compelling caption for your Instagram followers...'}
                    </p>

                    {tags.length > 0 && (
                      <div className="text-[11px] text-[#00376B] flex flex-wrap gap-1">
                        {tags.map(t => <span key={t}>{t}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* FACEBOOK PREVIEW */}
              {previewPlatform === 'facebook' && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3 font-sans">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={previewAccount.avatarUrl}
                      alt="Avatar"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">{previewAccount.name}</span>
                      <span className="text-[10px] text-slate-400">Scheduled · 🌍 Public</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {content || 'Facebook post preview text...'}
                  </p>

                  {mediaUrls.length > 0 && (
                    <div className="rounded overflow-hidden border border-slate-100 max-h-56">
                      <img
                        src={mediaUrls[0]}
                        alt="Media"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-around text-slate-600 text-xs font-medium">
                    <span>👍 Like</span>
                    <span>💬 Comment</span>
                    <span>↗️ Share</span>
                  </div>
                </div>
              )}

              {/* TIKTOK PREVIEW */}
              {previewPlatform === 'tiktok' && (
                <div className="bg-slate-900 rounded-xl p-4 shadow-2xs space-y-3 text-white font-sans max-w-sm mx-auto w-full">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>TikTok Video / Short</span>
                    <span>Preview</span>
                  </div>
                  <div className="aspect-[9/16] bg-slate-800 rounded-lg relative overflow-hidden flex flex-col justify-end p-3 max-h-80">
                    {mediaUrls.length > 0 && (
                      <img
                        src={mediaUrls[0]}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="relative z-10 space-y-1">
                      <span className="text-xs font-bold text-white block">{previewAccount.handle}</span>
                      <p className="text-xs text-slate-100 line-clamp-2">
                        {content || 'TikTok hook and description...'}
                      </p>
                      <div className="flex flex-wrap gap-1 text-[10px] text-white/90">
                        {tags.map(t => <span key={t}>{t}</span>)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Modal Action Bar */}
        <div className="p-3 sm:px-6 sm:py-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave('draft')}
              className="min-h-[44px] sm:min-h-0 flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>Save Draft</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave('queued')}
              className="min-h-[44px] sm:min-h-0 flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Queue Post</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                publishToOriginalApp(previewPlatform, content);
                handleSave('published');
              }}
              disabled={!content.trim()}
              className="min-h-[44px] sm:min-h-0 flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title={`Launch compose directly in official ${PLATFORM_CONFIGS[previewPlatform]?.displayName || 'app'} and record publish`}
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
              <span>Launch & Post in {PLATFORM_CONFIGS[previewPlatform]?.shortName || 'App'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave('published')}
              className="min-h-[44px] sm:min-h-0 flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-slate-500" />
              <span>Publish Now</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave('scheduled')}
              disabled={isOverLimit || !content.trim()}
              className="min-h-[44px] sm:min-h-0 flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Post</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
