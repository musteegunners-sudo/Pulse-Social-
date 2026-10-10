import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Calendar, 
  Clock, 
  Image as ImageIcon, 
  Video,
  Type,
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
  ExternalLink,
  Play,
  Film,
  Layers,
  Palette,
  Repeat,
  FileText,
  ChevronDown
} from 'lucide-react';
import { SocialAccount, SocialPlatform, SocialPost, PostContentType } from '../../types';
import { PlatformIcon, getPlatformName } from '../common/PlatformIcon';
import { MEDIA_PRESETS } from '../../data/initialData';
import { 
  geminiService, 
  RefinementType 
} from '../../services/geminiService';
import { publishToOriginalApp, openOriginalApp, PLATFORM_CONFIGS } from '../../utils/socialAppBridge';
import { AiComposerAssistant } from './AiComposerAssistant';
import { matchHashtagsFromContent, searchHashtags, HashtagMatch } from '../../utils/hashtagMatcher';
import { PostMediaControls, TEXT_CARD_THEMES } from './PostMediaControls';
import { SmartContentSuggestions } from './SmartContentSuggestions';

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
  
  // Post Type: Video, Photos, Text
  const [postType, setPostType] = useState<PostContentType>('photos');
  
  // Photos Specific
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [photoAspectRatio, setPhotoAspectRatio] = useState<'1:1' | '4:5' | '16:9'>('16:9');
  
  // Video Specific
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoThumbnail, setVideoThumbnail] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<number>(15);
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  
  // Text Specific
  const [textBackground, setTextBackground] = useState<string>('clean');

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

  // Publer Social Media Tools state
  const [showHashtagMenu, setShowHashtagMenu] = useState(false);
  const [showSignatureMenu, setShowSignatureMenu] = useState(false);
  const [isRecycleEnabled, setIsRecycleEnabled] = useState(false);
  const [recycleDays, setRecycleDays] = useState(7);
  const [isFirstCommentOpen, setIsFirstCommentOpen] = useState(false);

  const savedHashtagGroups = useMemo(() => {
    try {
      const saved = localStorage.getItem('publer_tools_hashtag_groups_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: '1', name: 'Halal Marriage & Arewa', tags: ['#ArewaHalal', '#HalalMarriage', '#ArewaWeddings', '#Kano', '#Kaduna'] },
      { id: '2', name: 'Viral Reach & Trending', tags: ['#Trending', '#Viral', '#Community', '#Creator', '#Engagement'] },
      { id: '3', name: 'Brand & Business Growth', tags: ['#BrandBuilding', '#BusinessGrowth', '#Entrepreneur', '#Leadership'] }
    ];
  }, [isOpen]);

  const savedSignatures = useMemo(() => {
    try {
      const saved = localStorage.getItem('publer_tools_signatures_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: '1', name: 'WhatsApp Direct Contact', content: '\n\n📲 Direct WhatsApp: +0704947485' },
      { id: '2', name: 'Official Handles', content: '\n\n✨ Follow @ArewaHalalcf2f on X | Join our Facebook Group & Page!' }
    ];
  }, [isOpen]);

  const handleInsertHashtagGroup = (group: any) => {
    const newTags = group.tags || [];
    handleAddAiTags(newTags);
    setShowHashtagMenu(false);
  };

  const handleInsertSignature = (sig: any) => {
    setContent(prev => prev.trim() + sig.content);
    setShowSignatureMenu(false);
  };

  // Initialize from initialPost or initialDate
  useEffect(() => {
    if (initialPost) {
      setContent(initialPost.content);
      setSelectedPlatforms(initialPost.platforms || ['twitter']);
      const detectedType: PostContentType = initialPost.postType || (
        initialPost.videoUrl ? 'video' : (initialPost.mediaUrls && initialPost.mediaUrls.length > 0 ? 'photos' : 'text')
      );
      setPostType(detectedType);
      setMediaUrls(initialPost.mediaUrls || []);
      setVideoUrl(initialPost.videoUrl || '');
      setVideoThumbnail(initialPost.videoThumbnail || '');
      setVideoDuration(initialPost.videoDuration || 15);
      setVideoAspectRatio(initialPost.aspectRatio === '9:16' ? '9:16' : '16:9');
      setPhotoAspectRatio(initialPost.aspectRatio === '1:1' ? '1:1' : initialPost.aspectRatio === '4:5' ? '4:5' : '16:9');
      setTextBackground(initialPost.textBackground || 'clean');
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
      const activePlatforms = accounts.filter(a => a.isConnected).map(a => a.platform);
      setSelectedPlatforms(activePlatforms.length > 0 ? activePlatforms : ['facebook', 'whatsapp']);
      setPreviewPlatform(activePlatforms[0] || 'facebook');
      setPostType('photos');
      setMediaUrls([]);
      setVideoUrl('');
      setVideoThumbnail('');
      setVideoDuration(15);
      setVideoAspectRatio('16:9');
      setPhotoAspectRatio('16:9');
      setTextBackground('clean');
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

  const handleAddMediaUrl = (url: string) => {
    if (!mediaUrls.includes(url)) {
      setMediaUrls(prev => [...prev, url]);
    }
  };

  const handleRemoveMediaUrl = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearMediaUrls = () => {
    setMediaUrls([]);
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
    const isNow = status === 'now';
    const nowIso = new Date().toISOString();
    const targetAccounts = accounts.filter(a => selectedPlatforms.includes(a.platform) && a.isConnected);

    const receipts = isNow ? targetAccounts.map(a => ({
      channelId: a.id,
      platform: a.platform,
      channelName: a.name,
      handle: a.handle,
      reachedAt: nowIso,
      status: 'reached' as const,
      reachNote: `Direct broadcast verified • Reached ${a.name} (${a.handle})`,
    })) : undefined;

    const newPost: SocialPost = {
      id: initialPost ? initialPost.id : `post-${Date.now()}`,
      postType,
      content: content.trim(),
      platforms: selectedPlatforms,
      targetAccountIds: targetAccounts.map(a => a.id),
      scheduledFor: isNow ? nowIso : scheduledDateTime.toISOString(),
      publishedAt: isNow ? nowIso : undefined,
      reachedAt: isNow ? nowIso : undefined,
      reachedChannels: isNow ? targetAccounts.map(a => a.name) : undefined,
      deliveryReceipts: receipts,
      status: isNow ? 'published' : status,
      mediaUrls: postType === 'photos' ? (mediaUrls.length > 0 ? mediaUrls : undefined) : (postType === 'video' && videoThumbnail ? [videoThumbnail] : undefined),
      videoUrl: postType === 'video' && videoUrl.trim() ? videoUrl.trim() : undefined,
      videoThumbnail: postType === 'video' && videoThumbnail.trim() ? videoThumbnail.trim() : undefined,
      videoDuration: postType === 'video' ? videoDuration : undefined,
      aspectRatio: postType === 'video' ? videoAspectRatio : (postType === 'photos' ? photoAspectRatio : undefined),
      textBackground: postType === 'text' ? textBackground : undefined,
      firstComment: firstComment.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      createdAt: initialPost?.createdAt || nowIso,
      campaign,
      author: 'Current User',
    };

    onSavePost(newPost);
    onClose();
  };

  // Preview account
  const previewAccount = accounts.find(a => a.platform === previewPlatform && a.isConnected) || accounts[0] || {
    id: 'preview-account',
    name: getPlatformName(previewPlatform),
    handle: `@channel_${previewPlatform}`,
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(getPlatformName(previewPlatform))}&background=4f46e5&color=fff`,
    platform: previewPlatform,
    followersCount: 0,
    isConnected: true,
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Target Publishing Channels ({selectedPlatforms.length} selected)
                </label>
                {accounts.length > 0 ? (
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {accounts.filter(a => a.isConnected).length} Connected Channel{accounts.filter(a => a.isConnected).length === 1 ? '' : 's'}
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    No channels connected yet
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {accounts.length > 0 ? (
                  accounts.map((acc) => {
                    const isSelected = selectedPlatforms.includes(acc.platform);
                    const isFbGroup = acc.platform === 'facebook' && (acc.facebookType === 'group' || acc.handle.startsWith('groups/'));

                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => togglePlatform(acc.platform)}
                        className={`min-h-[42px] flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-semibold shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <PlatformIcon platform={acc.platform} size={15} />
                        <div className="text-left">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-bold block truncate max-w-[120px]">{acc.name}</span>
                            {acc.platform === 'facebook' && (
                              <span className="text-[8px] font-bold px-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                {isFbGroup ? 'Group' : 'Page'}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400 block font-mono truncate max-w-[120px]">{acc.handle}</span>
                        </div>
                        {isSelected ? <Check className="w-3.5 h-3.5 text-indigo-600 ml-1" /> : <Plus className="w-3.5 h-3.5 text-slate-400 ml-1" />}
                      </button>
                    );
                  })
                ) : (
                  (['whatsapp', 'facebook', 'twitter', 'linkedin', 'instagram', 'tiktok'] as SocialPlatform[]).map((plat) => {
                    const isSelected = selectedPlatforms.includes(plat);
                    return (
                      <button
                        key={plat}
                        type="button"
                        onClick={() => togglePlatform(plat)}
                        className={`min-h-[40px] flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
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
                  })
                )}
              </div>
            </div>

            {/* Publer Multi-Channel Customizer Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Customize for:
              </span>
              <button
                type="button"
                onClick={() => setPreviewPlatform('twitter')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  previewPlatform === 'twitter'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>🌐 Master (All)</span>
              </button>
              {selectedPlatforms.map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setPreviewPlatform(plat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    previewPlatform === plat
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <PlatformIcon platform={plat} size={13} />
                  <span>{getPlatformName(plat)}</span>
                </button>
              ))}
            </div>

            {/* Publer Social Media Tools Quick-Action Bar */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl relative">
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-950 px-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Publer Tools:</span>
              </div>

              {/* Hashtag Bundles Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setShowHashtagMenu(!showHashtagMenu); setShowSignatureMenu(false); }}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Hash className="w-3 h-3 text-emerald-600" />
                  <span>Hashtag Bundles</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {showHashtagMenu && (
                  <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-30 space-y-1 animate-in fade-in">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 py-1">
                      Insert Saved Bundle
                    </span>
                    {savedHashtagGroups.map((group: any) => (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => handleInsertHashtagGroup(group)}
                        className="w-full text-left p-2 hover:bg-emerald-50 rounded-lg text-xs font-semibold text-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <span className="truncate">{group.name}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full font-mono">
                          +{group.tags?.length || 0}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Signatures Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setShowSignatureMenu(!showSignatureMenu); setShowHashtagMenu(false); }}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <FileText className="w-3 h-3 text-emerald-600" />
                  <span>Insert Signature</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {showSignatureMenu && (
                  <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-30 space-y-1 animate-in fade-in">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 py-1">
                      Insert Brand Signature
                    </span>
                    {savedSignatures.map((sig: any) => (
                      <button
                        key={sig.id}
                        type="button"
                        onClick={() => handleInsertSignature(sig)}
                        className="w-full text-left p-2 hover:bg-emerald-50 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer truncate"
                      >
                        {sig.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* First Comment Toggle */}
              <button
                type="button"
                onClick={() => setIsFirstCommentOpen(!isFirstCommentOpen)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1 cursor-pointer shadow-2xs ${
                  isFirstCommentOpen
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}
              >
                <MessageSquare className="w-3 h-3" />
                <span>First Comment</span>
              </button>
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

              {/* Publer First Comment Box */}
              {isFirstCommentOpen && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Publer First Comment (Instagram, Facebook, LinkedIn)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsFirstCommentOpen(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={firstComment}
                    onChange={(e) => setFirstComment(e.target.value)}
                    placeholder="Auto-schedule first comment with extra hashtags or links..."
                    className="w-full text-xs p-2.5 bg-white border border-emerald-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}

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

              {/* AI-Powered Smart Content Suggestions (Gemini) */}
              <SmartContentSuggestions
                content={content}
                selectedPlatforms={selectedPlatforms}
                previewPlatform={previewPlatform}
                onApplyVariation={handleApplyAiContent}
                onAppendVariation={handleAppendAiContent}
                onAddHashtags={handleAddAiTags}
                currentTags={tags}
              />
            </div>

            {/* Post Media Controls: Video, Photos, Text */}
            <PostMediaControls
              postType={postType}
              onSelectPostType={setPostType}
              mediaUrls={mediaUrls}
              onAddMediaUrl={handleAddMediaUrl}
              onRemoveMediaUrl={handleRemoveMediaUrl}
              onClearMediaUrls={handleClearMediaUrls}
              photoAspectRatio={photoAspectRatio}
              onSetPhotoAspectRatio={setPhotoAspectRatio}
              videoUrl={videoUrl}
              onSetVideoUrl={setVideoUrl}
              videoThumbnail={videoThumbnail}
              onSetVideoThumbnail={setVideoThumbnail}
              videoDuration={videoDuration}
              onSetVideoDuration={setVideoDuration}
              videoAspectRatio={videoAspectRatio}
              onSetVideoAspectRatio={setVideoAspectRatio}
              textBackground={textBackground}
              onSetTextBackground={setTextBackground}
              selectedPlatforms={selectedPlatforms}
            />

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

            {/* Helper to render preview media: Video player, Photos gallery/single, or Text graphic card */}
            {(() => {
              const renderMediaPreview = (platform: SocialPlatform) => {
                if (postType === 'video') {
                  if (videoUrl) {
                    const isVertical = videoAspectRatio === '9:16' || platform === 'tiktok';
                    return (
                      <div className={`relative rounded-xl overflow-hidden bg-black shadow-xs ${isVertical ? 'aspect-[9/16] max-h-72 mx-auto' : 'aspect-video max-h-56'} w-full flex items-center justify-center`}>
                        <video
                          src={videoUrl}
                          controls
                          poster={videoThumbnail}
                          playsInline
                          className="w-full h-full object-contain"
                        >
                          Your browser does not support the video tag.
                        </video>
                        <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 pointer-events-none">
                          <Film className="w-3 h-3 text-indigo-400" />
                          <span>0:{videoDuration < 10 ? `0${videoDuration}` : videoDuration}</span>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="p-5 bg-slate-100/90 border border-slate-200 rounded-xl text-center space-y-1.5 text-slate-500">
                      <Film className="w-7 h-7 text-indigo-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">Video Post Mode Active</p>
                      <p className="text-[11px] text-slate-400">Pick a clip or upload MP4 in the left editor</p>
                    </div>
                  );
                }

                if (postType === 'photos') {
                  if (mediaUrls.length === 0) {
                    return (
                      <div className="p-5 bg-slate-100/90 border border-slate-200 rounded-xl text-center space-y-1 text-slate-400">
                        <ImageIcon className="w-7 h-7 mx-auto stroke-1 text-slate-400" />
                        <p className="text-xs font-semibold text-slate-600">No photos attached</p>
                        <p className="text-[11px]">Select photos or upload from device in the left editor</p>
                      </div>
                    );
                  }

                  const ratioClass = photoAspectRatio === '1:1' ? 'aspect-square' : photoAspectRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-video';

                  if (mediaUrls.length === 1) {
                    return (
                      <div className={`rounded-xl overflow-hidden border border-slate-200 bg-slate-100 ${ratioClass} max-h-60 sm:max-h-64 w-full`}>
                        <img src={mediaUrls[0]} alt="Media" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    );
                  }

                  if (mediaUrls.length === 2) {
                    return (
                      <div className="grid grid-cols-2 gap-1.5 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video max-h-60 w-full">
                        <img src={mediaUrls[0]} alt="Photo 1" className="w-full h-full object-cover" />
                        <img src={mediaUrls[1]} alt="Photo 2" className="w-full h-full object-cover" />
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 gap-1.5 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video max-h-64 relative w-full">
                      <img src={mediaUrls[0]} alt="Photo 1" className="w-full h-full object-cover" />
                      <div className="grid grid-rows-2 gap-1.5 h-full">
                        <img src={mediaUrls[1]} alt="Photo 2" className="w-full h-full object-cover" />
                        <div className="relative h-full">
                          <img src={mediaUrls[2]} alt="Photo 3" className="w-full h-full object-cover" />
                          {mediaUrls.length > 3 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm">
                              +{mediaUrls.length - 2}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                // Text Post
                if (textBackground && textBackground !== 'clean') {
                  const activeTheme = TEXT_CARD_THEMES.find(t => t.id === textBackground) || TEXT_CARD_THEMES[1];
                  return (
                    <div className={`p-4 rounded-xl border ${activeTheme.borderClass} ${activeTheme.bgClass} min-h-[120px] flex flex-col justify-center text-center shadow-xs`}>
                      <p className={`text-xs sm:text-sm font-semibold leading-relaxed ${activeTheme.textClass}`}>
                        {content || 'Your styled text card will appear here...'}
                      </p>
                      <span className="text-[10px] mt-2 opacity-60 font-mono tracking-wider uppercase">
                        {previewAccount.name}
                      </span>
                    </div>
                  );
                }

                return null;
              };

              return (
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

                      {renderMediaPreview('twitter')}

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

                      {renderMediaPreview('linkedin')}

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

                      {/* Instagram Media */}
                      <div className="bg-slate-100 relative">
                        {renderMediaPreview('instagram')}
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

                      {renderMediaPreview('facebook')}

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
                        <span className="flex items-center gap-1.5 font-bold text-white">
                          <Film className="w-3.5 h-3.5 text-pink-500" />
                          <span>TikTok {postType === 'video' ? 'Video Short' : 'Feed'}</span>
                        </span>
                        {postType === 'video' && videoUrl && (
                          <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-white">
                            {videoDuration}s
                          </span>
                        )}
                      </div>

                      <div className="aspect-[9/16] bg-slate-950 rounded-xl relative overflow-hidden flex flex-col justify-end p-3 max-h-96 border border-white/10">
                        {postType === 'video' && videoUrl ? (
                          <video
                            src={videoUrl}
                            controls
                            poster={videoThumbnail}
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : postType === 'photos' && mediaUrls.length > 0 ? (
                          <img
                            src={mediaUrls[0]}
                            alt="Preview"
                            className="absolute inset-0 w-full h-full object-cover opacity-90"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-slate-400">
                            Select a video or photo to preview TikTok short
                          </div>
                        )}
                        <div className="relative z-10 space-y-1.5 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-2.5 -mx-3 -mb-3 rounded-b-xl pointer-events-none">
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
              );
            })()}
          </div>

        </div>

        {/* Publer 4-Mode Action Bar */}
        <div className="p-3 sm:px-6 sm:py-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSave('draft')}
              className="min-h-[38px] px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>Draft</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave('queued')}
              className="min-h-[38px] px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="Add post to Publer auto-schedule queue slots"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>AutoSchedule</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRecycleEnabled(!isRecycleEnabled);
              }}
              className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
                isRecycleEnabled
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white hover:bg-purple-50 text-slate-700 border-slate-200'
              }`}
              title="Recycle post automatically every 7 days"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>{isRecycleEnabled ? 'Recycle Active (7d)' : 'Recycle'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                publishToOriginalApp(previewPlatform, content);
                handleSave('published');
              }}
              disabled={!content.trim()}
              className="min-h-[38px] flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              title={`Launch compose directly in official ${PLATFORM_CONFIGS[previewPlatform]?.displayName || 'mother app'} and record publish`}
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
              <span>Redirect to {PLATFORM_CONFIGS[previewPlatform]?.shortName || 'App'} ↗</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave('published')}
              className="min-h-[38px] flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-xs active:scale-98"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Redirect to Mother Apps to Post</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave('scheduled')}
              disabled={isOverLimit || !content.trim()}
              className="min-h-[38px] flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors cursor-pointer active:scale-98"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
