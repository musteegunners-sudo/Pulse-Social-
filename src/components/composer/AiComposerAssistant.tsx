import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Wand2, 
  RotateCcw, 
  Copy, 
  Check, 
  ArrowRight, 
  Bot, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Hash,
  RefreshCw,
  Send,
  Zap,
  Briefcase,
  Smile,
  Flame,
  FileText,
  Lightbulb
} from 'lucide-react';
import { SocialPlatform } from '../../types';
import { 
  geminiService, 
  ToneType, 
  RefinementType, 
  PostVariation, 
  GeneratePostResult, 
  RefinePostResult 
} from '../../services/geminiService';
import { getPlatformName } from '../common/PlatformIcon';
import { matchHashtagsFromContent } from '../../utils/hashtagMatcher';

interface AiComposerAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentContent: string;
  onApplyContent: (newContent: string) => void;
  onAppendContent: (additionalContent: string) => void;
  onAddTags: (tags: string[]) => void;
  onSetFirstComment: (comment: string) => void;
  previewPlatform: SocialPlatform;
  selectedPlatforms: SocialPlatform[];
  previousContent: string | null;
  onUndo: () => void;
}

const TONE_OPTIONS: Array<{ id: ToneType; label: string; icon: React.ReactNode; desc: string }> = [
  { id: 'professional', label: 'Professional', icon: <Briefcase className="w-3 h-3" />, desc: 'Authoritative, clear, executive' },
  { id: 'punchy', label: 'Punchy', icon: <Zap className="w-3 h-3" />, desc: 'Concise, high-impact, scannable' },
  { id: 'casual', label: 'Casual', icon: <Smile className="w-3 h-3" />, desc: 'Friendly, authentic, warm' },
  { id: 'storytelling', label: 'Storytelling', icon: <FileText className="w-3 h-3" />, desc: 'Narrative hook, lesson, outcome' },
  { id: 'viral', label: 'Viral Hook', icon: <Flame className="w-3 h-3" />, desc: 'Contrarian hot takes, curiosity' },
  { id: 'thought_leadership', label: 'Thought Leader', icon: <Lightbulb className="w-3 h-3" />, desc: 'Strategic trends, vision' },
  { id: 'promotional', label: 'Promotional', icon: <Send className="w-3 h-3" />, desc: 'Launch, announcement, value offer' },
];

const REFINEMENT_PRESETS: Array<{ id: RefinementType; label: string; icon: string; desc: string }> = [
  { id: 'professional', label: 'Executive & Professional', icon: '👔', desc: 'Elevates authority and business tone' },
  { id: 'punchy', label: 'Punchy & Crisp', icon: '⚡', desc: 'Cuts wordiness and tightens hooks' },
  { id: 'casual', label: 'Casual & Conversational', icon: '☕', desc: 'Authentic creator voice and relatable' },
  { id: 'viral', label: 'Scroll-Stopping Hook', icon: '🔥', desc: 'Creates an irresistible opening sentence' },
  { id: 'shorten', label: 'Condense for Limit', icon: '✂️', desc: 'Fits within strict character limits' },
  { id: 'expand', label: 'Expand with Bullets', icon: '📋', desc: 'Adds structured takeaways and depth' },
  { id: 'fix_grammar', label: 'Fix Grammar & Polish', icon: '✨', desc: 'Fixes syntax while keeping your voice' },
  { id: 'add_cta', label: 'Add High-Converting CTA', icon: '🎯', desc: 'Strong closing prompt or debate question' },
  { id: 'convert_thread', label: 'Convert to Thread', icon: '🧵', desc: 'Formats as a multi-step sequence' },
];

const TOPIC_INSPIRATIONS = [
  '5 lessons learned scaling our pipeline',
  'Announcing our new feature release',
  'Unpopular opinion about industry metrics',
  'Customer breakthrough case study',
  'Behind the scenes of our weekly sprint',
  'Quick productivity framework for founders',
];

export const AiComposerAssistant: React.FC<AiComposerAssistantProps> = ({
  isOpen,
  onClose,
  currentContent,
  onApplyContent,
  onAppendContent,
  onAddTags,
  onSetFirstComment,
  previewPlatform,
  selectedPlatforms,
  previousContent,
  onUndo,
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'refine' | 'hashtags'>('generate');

  // Generation state
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<ToneType>('professional');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeCta, setIncludeCta] = useState(true);
  const [customInstructions, setCustomInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<GeneratePostResult | null>(null);
  const [activeVariationIndex, setActiveVariationIndex] = useState(0);

  // Refine state
  const [isRefining, setIsRefining] = useState(false);
  const [refinementResult, setRefinementResult] = useState<RefinePostResult | null>(null);
  const [activeRefineType, setActiveRefineType] = useState<RefinementType>('punchy');
  const [refineCustomGoal, setRefineCustomGoal] = useState('');

  // Hashtags generator state
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

  // Feedback indicator
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setGenerationResult(null);

    try {
      const result = await geminiService.generatePost({
        topic: topic.trim(),
        tone,
        platform: previewPlatform,
        selectedPlatforms,
        includeHashtags,
        includeCallToAction: includeCta,
        additionalInstructions: customInstructions.trim() || undefined,
      });

      setGenerationResult(result);
      setActiveVariationIndex(0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async (type: RefinementType) => {
    if (!currentContent.trim()) return;
    setIsRefining(true);
    setActiveRefineType(type);
    setRefinementResult(null);

    try {
      const result = await geminiService.refinePost({
        content: currentContent.trim(),
        refinementType: type,
        platform: previewPlatform,
        customGoal: refineCustomGoal.trim() || undefined,
      });

      setRefinementResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerateHashtags = async () => {
    if (!currentContent.trim()) return;
    setIsGeneratingTags(true);
    try {
      const tags = await geminiService.generateHashtags(currentContent, previewPlatform);
      setSuggestedTags(tags);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingTags(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-indigo-50/90 to-white border border-indigo-200/80 rounded-xl p-4 shadow-sm space-y-4 mb-3 animate-in fade-in zoom-in-95 duration-150">
      
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">Gemini AI Assistant</span>
              <span className="px-1.5 py-0.2 text-[10px] font-mono font-semibold bg-indigo-100 text-indigo-700 rounded border border-indigo-200">
                gemini-3.8-flash
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Targeting: <span className="font-semibold text-slate-700">{getPlatformName(previewPlatform)}</span>
              {selectedPlatforms.length > 1 && ` + ${selectedPlatforms.length - 1} channels`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {previousContent && (
            <button
              type="button"
              onClick={onUndo}
              className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              title="Revert to text prior to last AI action"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Undo AI</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            aria-label="Close AI Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg bg-slate-100/80 p-0.5 border border-slate-200 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('generate')}
          className={`flex-1 py-1.5 px-3 rounded-md font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'generate'
              ? 'bg-white text-indigo-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Draft Post</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('refine')}
          className={`flex-1 py-1.5 px-3 rounded-md font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'refine'
              ? 'bg-white text-indigo-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Refine & Polish Tone</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('hashtags');
            if (suggestedTags.length === 0 && currentContent.trim()) {
              handleGenerateHashtags();
            }
          }}
          className={`flex-1 py-1.5 px-3 rounded-md font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'hashtags'
              ? 'bg-white text-indigo-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          <span>Smart Tags</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: DRAFT FROM SCRATCH */}
      {/* =================================================================== */}
      {activeTab === 'generate' && (
        <div className="space-y-3.5">
          {/* Topic & Inspiration chips */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Topic, Concept, or Key Announcement
            </label>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder="e.g. 5 lessons from scaling from 1k to 10k users, launching our new dashboard..."
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Inspiration quick pills */}
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              <span className="text-[10px] text-slate-400 font-medium">Ideas:</span>
              {TOPIC_INSPIRATIONS.slice(0, 4).map((insp, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTopic(insp)}
                  className="text-[10px] text-slate-600 hover:text-indigo-700 bg-white hover:bg-indigo-50 border border-slate-200 px-2 py-0.5 rounded-full transition-colors cursor-pointer truncate max-w-[200px]"
                >
                  {insp}
                </button>
              ))}
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tone & Voice
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {TONE_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                    tone === t.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className={tone === t.id ? 'text-white' : 'text-slate-500'}>
                    {t.icon}
                  </span>
                  <span className="text-xs truncate">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Extra options */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-indigo-100/60">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHashtags}
                  onChange={(e) => setIncludeHashtags(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span>Include hashtags</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCta}
                  onChange={(e) => setIncludeCta(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span>Include Call-to-Action</span>
              </label>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="min-h-[36px] px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Drafting with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Variations</span>
                </>
              )}
            </button>
          </div>

          {/* Generation Results View */}
          {generationResult && (
            <div className="mt-3 pt-3 border-t border-indigo-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Select a Draft Angle</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  {generationResult.variations?.length || 1} distinct variations generated
                </span>
              </div>

              {/* Variations selector pills */}
              {generationResult.variations && generationResult.variations.length > 0 && (
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {generationResult.variations.map((v, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveVariationIndex(i)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                        activeVariationIndex === i
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Variation {i + 1}: {v.tone || 'Standard'}
                    </button>
                  ))}
                </div>
              )}

              {/* Active Variation Card */}
              {(() => {
                const currentVar = generationResult.variations?.[activeVariationIndex] || {
                  hook: 'Generated Post',
                  caption: generationResult.caption,
                  tone,
                };

                return (
                  <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-100 pb-1.5">
                      <span className="font-semibold text-slate-700">Hook: &ldquo;{currentVar.hook}&rdquo;</span>
                      <span className="font-mono">{currentVar.caption.length} chars</span>
                    </div>

                    <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                      {currentVar.caption}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleCopy(currentVar.caption, `var-${activeVariationIndex}`)}
                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === `var-${activeVariationIndex}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-medium">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onAppendContent(`\n\n${currentVar.caption}`);
                          }}
                          className="px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
                        >
                          Append
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onApplyContent(currentVar.caption);
                            if (generationResult.hashtags && generationResult.hashtags.length > 0) {
                              onAddTags(generationResult.hashtags);
                            }
                            if (generationResult.firstComment) {
                              onSetFirstComment(generationResult.firstComment);
                            }
                          }}
                          className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Use in Post</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Hashtags and First Comment suggestion cards */}
              {(generationResult.hashtags?.length > 0 || generationResult.firstComment) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {generationResult.hashtags && generationResult.hashtags.length > 0 && (
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Hashtags</span>
                        <p className="text-indigo-600 font-mono text-[11px] truncate">
                          {generationResult.hashtags.join(' ')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onAddTags(generationResult.hashtags)}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 shrink-0 cursor-pointer bg-indigo-50 px-2 py-1 rounded"
                      >
                        + Add all
                      </button>
                    </div>
                  )}

                  {generationResult.firstComment && (
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">First Comment</span>
                        <p className="text-slate-700 text-[11px] truncate">
                          {generationResult.firstComment}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSetFirstComment(generationResult.firstComment || '')}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 shrink-0 cursor-pointer bg-indigo-50 px-2 py-1 rounded"
                      >
                        Use comment
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: REFINE TONE & POLISH */}
      {/* =================================================================== */}
      {activeTab === 'refine' && (
        <div className="space-y-3.5">
          {!currentContent.trim() ? (
            <div className="text-center py-6 px-4 bg-white/70 border border-dashed border-slate-300 rounded-xl space-y-2">
              <SlidersHorizontal className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No content in the editor to refine yet</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Type or paste your post draft into the text area below, then select an objective to polish tone, fix structure, or maximize engagement.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select a Tone Refinement Objective
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {REFINEMENT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleRefine(preset.id)}
                      disabled={isRefining}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        activeRefineType === preset.id && refinementResult
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">{preset.icon}</span>
                        <span className="text-xs font-bold text-slate-800">{preset.label}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{preset.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Goal Optional Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={refineCustomGoal}
                  onChange={(e) => setRefineCustomGoal(e.target.value)}
                  placeholder="Or custom direction (e.g. 'add 2 emojis', 'make sound like a tech CEO')..."
                  className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => handleRefine(activeRefineType)}
                  disabled={isRefining}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  {isRefining ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Refine</span>
                </button>
              </div>

              {/* Refinement Results View */}
              {refinementResult && (
                <div className="mt-3 pt-3 border-t border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Refinement Comparison</span>
                    </span>
                    <span className="text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-medium">
                      {refinementResult.explanation}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Original */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Original Draft</span>
                      <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
                        {currentContent}
                      </p>
                    </div>

                    {/* Refined */}
                    <div className="p-3 bg-white border border-indigo-200 rounded-lg space-y-1.5 ring-1 ring-indigo-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-700 uppercase">Gemini Refinement</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {refinementResult.refinedContent.length} chars
                        </span>
                      </div>
                      <p className="text-xs text-slate-900 font-medium whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
                        {refinementResult.refinedContent}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setRefinementResult(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-md transition-colors cursor-pointer"
                    >
                      Discard
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onApplyContent(refinementResult.refinedContent);
                        if (refinementResult.suggestedHashtags?.length) {
                          onAddTags(refinementResult.suggestedHashtags);
                        }
                        setRefinementResult(null);
                      }}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept & Replace Post</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: SMART HASHTAGS & TAGS */}
      {/* =================================================================== */}
      {activeTab === 'hashtags' && (
        <div className="space-y-3">
          {/* Instant Keyword Matching Utility Tray */}
          {(() => {
            const instantMatches = matchHashtagsFromContent(currentContent, [], 8);
            if (instantMatches.length === 0) return null;
            return (
              <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border border-emerald-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Keyword Matches Detected in Draft ({instantMatches.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onAddTags(instantMatches.map((m) => m.tag))}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                  >
                    + Add all matches
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {instantMatches.map((m) => (
                    <button
                      key={m.tag}
                      type="button"
                      onClick={() => onAddTags([m.tag])}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-emerald-600 text-slate-800 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-md text-xs font-medium transition-all shadow-2xs cursor-pointer group"
                      title={`Matched keyword "${m.matchedKeyword}" (${m.category})`}
                    >
                      <span>{m.tag}</span>
                      <span className="text-[9px] px-1 py-0.2 bg-emerald-100 group-hover:bg-emerald-700 text-emerald-800 group-hover:text-white rounded ml-0.5">
                        {m.matchedKeyword}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Platform-Tailored Hashtags for {getPlatformName(previewPlatform)}
            </span>
            <button
              type="button"
              onClick={handleGenerateHashtags}
              disabled={isGeneratingTags || !currentContent.trim()}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingTags ? 'animate-spin' : ''}`} />
              <span>Rescan with AI</span>
            </button>
          </div>

          {isGeneratingTags ? (
            <div className="py-6 text-center text-xs text-slate-500">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-600" />
              <span>Gemini is extracting high-performing tags for your draft...</span>
            </div>
          ) : suggestedTags.length > 0 ? (
            <div className="space-y-2.5">
              <div className="flex flex-wrap gap-1.5 p-3 bg-white border border-slate-200 rounded-lg">
                {suggestedTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-md text-xs font-medium"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => onAddTags([tag])}
                      className="text-indigo-600 hover:text-indigo-900 font-bold ml-1 cursor-pointer"
                      title="Add this tag"
                    >
                      +
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  {suggestedTags.length} recommended tags generated
                </span>
                <button
                  type="button"
                  onClick={() => onAddTags(suggestedTags)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Add All Tags</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-500 bg-white border border-dashed border-slate-200 rounded-lg">
              <span>Write some content in the text editor to generate matching hashtags.</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
