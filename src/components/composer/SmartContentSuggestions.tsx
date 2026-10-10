import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Check, 
  Copy, 
  Hash, 
  ArrowRight, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  Zap, 
  Flame, 
  Briefcase, 
  FileText, 
  CheckCircle2,
  ExternalLink,
  SlidersHorizontal,
  Bot
} from 'lucide-react';
import { SocialPlatform } from '../../types';
import { 
  geminiService, 
  SmartContentVariation, 
  SmartHashtagSuggestion, 
  SmartSuggestionsResult 
} from '../../services/geminiService';
import { getPlatformName } from '../common/PlatformIcon';

interface SmartContentSuggestionsProps {
  content: string;
  selectedPlatforms: SocialPlatform[];
  previewPlatform: SocialPlatform;
  onApplyVariation: (newContent: string) => void;
  onAppendVariation: (additionalContent: string) => void;
  onAddHashtags: (tags: string[]) => void;
  currentTags: string[];
}

export const SmartContentSuggestions: React.FC<SmartContentSuggestionsProps> = ({
  content,
  selectedPlatforms,
  previewPlatform,
  onApplyVariation,
  onAppendVariation,
  onAddHashtags,
  currentTags,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SmartSuggestionsResult | null>(null);
  const [activeTab, setActiveTab] = useState<'variations' | 'hashtags'>('variations');
  const [selectedToneFilter, setSelectedToneFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [addedAllTagsFeedback, setAddedAllTagsFeedback] = useState(false);
  const [lastGeneratedContent, setLastGeneratedContent] = useState<string>('');

  // Determine if the input has enough content to generate suggestions
  const hasSubstantialContent = content.trim().length >= 8;
  const isContentChangedSinceLastGen = content.trim() !== lastGeneratedContent;

  const handleGenerate = async () => {
    if (!content.trim()) return;
    setIsLoading(true);
    setIsOpen(true);
    setAppliedId(null);
    setAddedAllTagsFeedback(false);

    try {
      const result = await geminiService.getSmartSuggestions(
        content.trim(),
        selectedPlatforms,
        previewPlatform
      );
      setSuggestions(result);
      setLastGeneratedContent(content.trim());
    } catch (err) {
      console.error('Failed to get smart suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApply = (id: string, text: string) => {
    onApplyVariation(text);
    setAppliedId(id);
    setTimeout(() => setAppliedId(null), 3000);
  };

  const handleAddSingleTag = (tag: string) => {
    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
    if (!currentTags.includes(cleanTag)) {
      onAddHashtags([...currentTags, cleanTag]);
    }
  };

  const handleAddAllTags = () => {
    if (!suggestions?.hashtagSuggestions) return;
    const newTags = suggestions.hashtagSuggestions.map(h => h.tag.startsWith('#') ? h.tag : `#${h.tag}`);
    const merged = Array.from(new Set([...currentTags, ...newTags]));
    onAddHashtags(merged);
    setAddedAllTagsFeedback(true);
    setTimeout(() => setAddedAllTagsFeedback(false), 2500);
  };

  // Filter variations by tone
  const filteredVariations = suggestions?.variations.filter(v => {
    if (selectedToneFilter === 'all') return true;
    return v.tone.toLowerCase().includes(selectedToneFilter.toLowerCase());
  }) || [];

  const getToneBadgeStyle = (tone: string) => {
    switch (tone.toLowerCase()) {
      case 'viral':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'thought_leadership':
      case 'professional':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'storytelling':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'punchy':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-slate-50 rounded-xl border border-indigo-200/80 shadow-2xs overflow-hidden transition-all">
      
      {/* Header & Quick Launch Bar */}
      <div className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">
                Smart Content Suggestions
              </span>
              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-full border border-indigo-200">
                Gemini
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Draft post variations & tailored hashtags based on your initial text.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!hasSubstantialContent || isLoading}
            className={`min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs ${
              hasSubstantialContent
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-98'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>
              {isLoading 
                ? 'Drafting with Gemini...' 
                : suggestions 
                  ? (isContentChangedSinceLastGen ? 'Update Suggestions' : 'Regenerate Variations') 
                  : 'Draft Variations & Tags'}
            </span>
          </button>

          {suggestions && (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="min-h-[36px] p-2 hover:bg-white/80 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title={isOpen ? 'Collapse suggestions' : 'Expand suggestions'}
            >
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* When empty content and not opened */}
      {!suggestions && !isLoading && (
        <div className="px-3.5 pb-3 pt-0 text-[11px] text-slate-500 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            {hasSubstantialContent 
              ? 'Click "Draft Variations & Tags" to have Gemini create 4 distinct post angles and trending hashtags from your draft.'
              : 'Type an initial draft or idea in the text area above to unlock Gemini variations and hashtag suggestions.'}
          </span>
        </div>
      )}

      {/* Loading Skeleton Banner */}
      {isLoading && (
        <div className="p-4 bg-white/80 border-t border-indigo-100 space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
            <span>Gemini is analyzing your draft & tailoring cross-platform variations...</span>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-indigo-100/60 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-indigo-100/40 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-indigo-100/50 rounded animate-pulse w-2/3" />
          </div>
        </div>
      )}

      {/* Expanded Suggestions Panel */}
      {isOpen && suggestions && !isLoading && (
        <div className="border-t border-indigo-100 bg-white/90 divide-y divide-slate-100">
          
          {/* Subheader with Tabs & Tone Filter */}
          <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/70">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('variations')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'variations'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Post Variations ({suggestions.variations.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('hashtags')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'hashtags'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hashtags ({suggestions.hashtagSuggestions.length})
              </button>
            </div>

            {/* Tone Filter (when in variations tab) */}
            {activeTab === 'variations' && (
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-[11px] font-semibold">
                {['all', 'viral', 'thought_leadership', 'storytelling', 'punchy'].map((toneKey) => (
                  <button
                    key={toneKey}
                    type="button"
                    onClick={() => setSelectedToneFilter(toneKey)}
                    className={`px-2 py-0.5 rounded-lg border transition-colors cursor-pointer capitalize ${
                      selectedToneFilter === toneKey
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {toneKey === 'thought_leadership' ? 'Thought Leader' : toneKey}
                  </button>
                ))}
              </div>
            )}

            {/* Bulk Add All (when in hashtags tab) */}
            {activeTab === 'hashtags' && (
              <button
                type="button"
                onClick={handleAddAllTags}
                className="self-end sm:self-auto text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{addedAllTagsFeedback ? 'All Added ✓' : `+ Add All (${suggestions.hashtagSuggestions.length})`}</span>
              </button>
            )}
          </div>

          {/* TAB 1: Post Variations */}
          {activeTab === 'variations' && (
            <div className="p-3 sm:p-4 space-y-3 max-h-[380px] overflow-y-auto">
              {filteredVariations.map((v) => {
                const isApplied = appliedId === v.id;
                const isCopied = copiedId === v.id;

                return (
                  <div
                    key={v.id}
                    className="p-3 sm:p-3.5 bg-white rounded-xl border border-slate-200/90 hover:border-indigo-300 shadow-2xs space-y-2 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">
                          {v.title}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border capitalize ${getToneBadgeStyle(v.tone)}`}>
                          {v.tone.replace('_', ' ')}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {v.charCount} chars
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                      {v.caption}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px]">
                      <div className="text-slate-500 italic flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>{v.whyItWorks}</span>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopy(v.id, v.caption)}
                          className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onAppendVariation(`\n\n${v.caption}`)}
                          className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer text-[11px] font-medium"
                          title="Append to existing content"
                        >
                          Append
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApply(v.id, v.caption)}
                          className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isApplied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs active:scale-98'
                          }`}
                        >
                          {isApplied ? <Check className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                          <span>{isApplied ? 'Applied to Post ✓' : 'Use This Variation'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: Hashtags Suggestions */}
          {activeTab === 'hashtags' && (
            <div className="p-3 sm:p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {suggestions.hashtagSuggestions.map((h, idx) => {
                  const tagWithHash = h.tag.startsWith('#') ? h.tag : `#${h.tag}`;
                  const isAlreadyAdded = currentTags.includes(tagWithHash);

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddSingleTag(h.tag)}
                      className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isAlreadyAdded
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-white hover:bg-indigo-50 text-slate-800 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <Hash className={`w-3.5 h-3.5 ${isAlreadyAdded ? 'text-emerald-600' : 'text-indigo-500'}`} />
                      <span>{tagWithHash.replace(/^#/, '')}</span>
                      
                      <span className="text-[9px] text-slate-400 font-mono ml-0.5">
                        {h.category}
                      </span>

                      {isAlreadyAdded ? (
                        <Check className="w-3 h-3 text-emerald-600 ml-0.5" />
                      ) : (
                        <Plus className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 ml-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {suggestions.firstCommentSuggestion && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Suggested Algorithmic First Comment
                  </span>
                  <p className="text-slate-700 italic">
                    "{suggestions.firstCommentSuggestion}"
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
