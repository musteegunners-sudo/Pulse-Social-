import React, { useState, useMemo } from 'react';
import { 
  MessageSquareText, 
  Star, 
  CheckCircle2, 
  Send, 
  CornerDownRight, 
  Search,
  Sparkles,
  ArrowLeft,
  Smile,
  Minus,
  Frown,
  Loader2,
  RefreshCw,
  Bot,
  BrainCircuit,
  Info
} from 'lucide-react';
import { InboxItem, SocialPlatform, SentimentType } from '../../types';
import { PlatformIcon, getPlatformName } from '../common/PlatformIcon';
import { geminiService } from '../../services/geminiService';

interface SocialInboxProps {
  inboxItems: InboxItem[];
  onReply: (itemId: string, replyText: string) => void;
  onToggleResolve: (itemId: string) => void;
  onToggleStar: (itemId: string) => void;
  onUpdateInboxItems?: (updated: InboxItem[]) => void;
}

/**
 * Visual Sentiment Tag Component
 * Renders positive (emerald), neutral (slate/blue), or negative (rose) badge
 */
export const SentimentTag: React.FC<{
  sentiment?: string;
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
  showConfidence?: boolean;
}> = ({ sentiment, confidence, size = 'sm', showConfidence = false }) => {
  const norm = (sentiment || '').toLowerCase();

  if (norm === 'positive') {
    return (
      <span 
        className={`inline-flex items-center gap-1 font-semibold rounded-full border transition-all ${
          size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'
        } bg-emerald-50 text-emerald-700 border-emerald-200/90 shadow-2xs`}
        title={`Sentiment: Positive${confidence ? ` (${Math.round(confidence * 100)}% confidence)` : ''}`}
      >
        <Smile className={size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
        <span>Positive</span>
        {showConfidence && confidence && (
          <span className="font-mono opacity-80 font-normal ml-0.5">
            {Math.round(confidence * 100)}%
          </span>
        )}
      </span>
    );
  }

  if (norm === 'negative' || norm === 'urgent') {
    return (
      <span 
        className={`inline-flex items-center gap-1 font-semibold rounded-full border transition-all ${
          size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'
        } bg-rose-50 text-rose-700 border-rose-200/90 shadow-2xs`}
        title={`Sentiment: Negative${confidence ? ` (${Math.round(confidence * 100)}% confidence)` : ''}`}
      >
        <Frown className={size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
        <span>Negative</span>
        {showConfidence && confidence && (
          <span className="font-mono opacity-80 font-normal ml-0.5">
            {Math.round(confidence * 100)}%
          </span>
        )}
      </span>
    );
  }

  // Neutral (default, also normalizes 'question')
  return (
    <span 
      className={`inline-flex items-center gap-1 font-semibold rounded-full border transition-all ${
        size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'
      } bg-slate-100 text-slate-700 border-slate-200/90 shadow-2xs`}
      title={`Sentiment: Neutral${confidence ? ` (${Math.round(confidence * 100)}% confidence)` : ''}`}
    >
      <Minus className={size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
      <span>Neutral</span>
      {showConfidence && confidence && (
        <span className="font-mono opacity-80 font-normal ml-0.5">
          {Math.round(confidence * 100)}%
        </span>
      )}
    </span>
  );
};

export const SocialInbox: React.FC<SocialInboxProps> = ({
  inboxItems,
  onReply,
  onToggleResolve,
  onToggleStar,
  onUpdateInboxItems,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(inboxItems[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<SocialPlatform | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unresolved' | 'starred'>('unresolved');
  const [filterSentiment, setFilterSentiment] = useState<'all' | SentimentType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  // AI Sentiment analysis state
  const [isAnalyzingBatch, setIsAnalyzingBatch] = useState(false);
  const [isAnalyzingSingle, setIsAnalyzingSingle] = useState(false);
  const [isGeneratingAiReply, setIsGeneratingAiReply] = useState(false);
  const [toastBanner, setToastBanner] = useState<string | null>(null);

  const showBanner = (msg: string) => {
    setToastBanner(msg);
    setTimeout(() => setToastBanner(null), 4000);
  };

  // Compute sentiment breakdown counts
  const sentimentStats = useMemo(() => {
    let positive = 0;
    let neutral = 0;
    let negative = 0;

    inboxItems.forEach(item => {
      const s = item.sentiment;
      if (s === 'positive') positive++;
      else if (s === 'negative' || (s as string) === 'urgent') negative++;
      else neutral++;
    });

    return { positive, neutral, negative, total: inboxItems.length };
  }, [inboxItems]);

  // Filter messages
  const filteredItems = inboxItems.filter(item => {
    if (filterPlatform !== 'all' && item.platform !== filterPlatform) return false;
    if (filterStatus === 'unresolved' && item.isResolved) return false;
    if (filterStatus === 'starred' && !item.isStarred) return false;
    
    if (filterSentiment !== 'all') {
      const normSentiment = item.sentiment === 'urgent' ? 'negative' : (item.sentiment === 'question' ? 'neutral' : item.sentiment);
      if (normSentiment !== filterSentiment) return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.content.toLowerCase().includes(q) ||
        item.senderName.toLowerCase().includes(q) ||
        item.senderHandle.toLowerCase().includes(q) ||
        (item.sentimentReason && item.sentimentReason.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const selectedItem = inboxItems.find(item => item.id === selectedItemId) || filteredItems[0];

  const handleSelectItem = (id: string) => {
    setSelectedItemId(id);
    setMobileView('detail');
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedItem) return;
    onReply(selectedItem.id, replyText.trim());
    setReplyText('');
  };

  // Run Gemini Sentiment Analysis on all messages in the inbox
  const handleAnalyzeAllWithGemini = async () => {
    if (inboxItems.length === 0 || isAnalyzingBatch) return;
    setIsAnalyzingBatch(true);

    try {
      const payload = inboxItems.map(item => ({
        id: item.id,
        content: item.content,
        senderName: item.senderName,
        platform: item.platform,
      }));

      const results = await geminiService.analyzeBatchSentiment(payload);
      const map = new Map(results.map(r => [r.id, r]));

      const updated = inboxItems.map(item => {
        const res = map.get(item.id);
        if (res) {
          return {
            ...item,
            sentiment: res.sentiment,
            sentimentScore: res.confidence,
            sentimentReason: res.reasoning,
            sentimentAnalyzedAt: 'Just now',
          };
        }
        return item;
      });

      onUpdateInboxItems?.(updated);
      showBanner(`✨ Gemini analyzed sentiment for ${results.length} messages!`);
    } catch (e) {
      console.error('Batch sentiment analysis error:', e);
      showBanner('Failed to analyze sentiments. Please try again.');
    } finally {
      setIsAnalyzingBatch(false);
    }
  };

  // Run Gemini Sentiment Analysis on the currently selected single message
  const handleAnalyzeSingleItem = async (item: InboxItem) => {
    if (isAnalyzingSingle) return;
    setIsAnalyzingSingle(true);

    try {
      const res = await geminiService.analyzeSentiment({
        id: item.id,
        text: item.content,
        senderName: item.senderName,
        platform: item.platform,
      });

      const updated = inboxItems.map(i => {
        if (i.id === item.id) {
          return {
            ...i,
            sentiment: res.sentiment,
            sentimentScore: res.confidence,
            sentimentReason: res.reasoning,
            sentimentAnalyzedAt: 'Just now',
          };
        }
        return i;
      });

      onUpdateInboxItems?.(updated);
      showBanner(`✨ Analyzed ${item.senderName}'s message: ${res.sentiment.toUpperCase()}`);
    } catch (e) {
      console.error('Single sentiment analysis error:', e);
      showBanner('Error analyzing message sentiment.');
    } finally {
      setIsAnalyzingSingle(false);
    }
  };

  // Generate AI Reply tailored to message sentiment
  const handleGenerateAiReply = async (item: InboxItem) => {
    if (isGeneratingAiReply) return;
    setIsGeneratingAiReply(true);

    try {
      const sentimentGoal = item.sentiment === 'negative'
        ? 'apologetic, solution-oriented, empathetic, and reassuring'
        : item.sentiment === 'positive'
        ? 'warm, grateful, enthusiastic, and celebrating customer success'
        : 'clear, informative, professional, and friendly';

      const prompt = `Write a concise 1-to-2 sentence social media customer reply to this customer message:
"${item.content}"
Customer Name: ${item.senderName}
Platform: ${item.platform}
Detected Sentiment: ${item.sentiment}
Tone goal: ${sentimentGoal}. Do not include quotation marks or placeholders.`;

      const res = await geminiService.generatePost({
        topic: prompt,
        tone: item.sentiment === 'negative' ? 'professional' : 'casual',
      });

      if (res.caption) {
        setReplyText(res.caption.replace(/^["']|["']$/g, '').trim());
        showBanner('Drafted smart response matching message sentiment!');
      }
    } catch (e) {
      console.error('Error generating AI reply:', e);
    } finally {
      setIsGeneratingAiReply(false);
    }
  };

  const cannedReplies = [
    "Thank you for sharing your feedback! We've forwarded this to our product team.",
    "Appreciate the question! We'll have a detailed breakdown published soon.",
    "Glad you're enjoying the new update! More features dropping soon 🚀",
  ];

  return (
    <div className="p-3 sm:p-6 h-[calc(100vh-4rem)] flex flex-col space-y-3 sm:space-y-4 max-w-7xl mx-auto">
      
      {/* Toast Feedback Banner */}
      {toastBanner && (
        <div className="bg-indigo-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg border border-indigo-700 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-medium">{toastBanner}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setToastBanner(null)} 
            className="text-indigo-300 hover:text-white text-xs ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Filter & Gemini Sentiment Actions Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs shrink-0">
        
        {/* Left: Title & Live Sentiment Breakdown Pills */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-indigo-600 shrink-0" />
            <h2 className="text-sm font-bold text-slate-900">Unified Community Inbox</h2>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {inboxItems.filter(i => !i.isResolved).length} pending
            </span>
          </div>

          {/* Quick Sentiment Summary Pills */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[11px] font-semibold text-slate-500">Sentiments:</span>
            <button
              type="button"
              onClick={() => setFilterSentiment('all')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer border ${
                filterSentiment === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              All ({sentimentStats.total})
            </button>
            <button
              type="button"
              onClick={() => setFilterSentiment('positive')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer border flex items-center gap-1 ${
                filterSentiment === 'positive'
                  ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Smile className="w-3 h-3" />
              <span>Positive ({sentimentStats.positive})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterSentiment('neutral')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer border flex items-center gap-1 ${
                filterSentiment === 'neutral'
                  ? 'bg-slate-700 text-white border-slate-700 font-bold'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Minus className="w-3 h-3" />
              <span>Neutral ({sentimentStats.neutral})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterSentiment('negative')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer border flex items-center gap-1 ${
                filterSentiment === 'negative'
                  ? 'bg-rose-600 text-white border-rose-600 font-bold'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <Frown className="w-3 h-3" />
              <span>Negative ({sentimentStats.negative})</span>
            </button>
          </div>
        </div>

        {/* Right: Gemini Sentiment Batch Analyzer & Secondary Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Analyze with Gemini AI Button */}
          <button
            type="button"
            onClick={handleAnalyzeAllWithGemini}
            disabled={isAnalyzingBatch || inboxItems.length === 0}
            className="min-h-[36px] px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98"
            title="Analyze incoming messages sentiment using Gemini API"
          >
            {isAnalyzingBatch ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            )}
            <span>{isAnalyzingBatch ? 'Analyzing Sentiments...' : 'Analyze Sentiments (Gemini API)'}</span>
          </button>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterStatus('unresolved')}
              className={`min-h-[32px] px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterStatus === 'unresolved' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setFilterStatus('starred')}
              className={`min-h-[32px] px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterStatus === 'starred' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              Starred
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`min-h-[32px] px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterStatus === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              All
            </button>
          </div>

          {/* Platform filter */}
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value as any)}
            className="min-h-[32px] text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none shrink-0"
          >
            <option value="all">All Channels</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="twitter">X / Twitter</option>
            <option value="linkedin">LinkedIn</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
          </select>
        </div>
      </div>

      {/* Main Inbox 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 flex-1 min-h-0 overflow-hidden">
        
        {/* Left Column: Message List with Visible Sentiment Tags (5 cols) */}
        <div className={`lg:col-span-5 bg-white rounded-xl border border-slate-200 flex-col overflow-hidden shadow-2xs ${
          mobileView === 'detail' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Search Bar */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/60 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages, senders, or AI rationale..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">No conversations match criteria</p>
                <p className="text-slate-400">Try adjusting your sentiment filter or search query</p>
              </div>
            ) : (
              filteredItems.map(item => {
                const isSelected = item.id === (selectedItem?.id || '');
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item.id)}
                    className={`p-3.5 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      {/* Avatar with Platform Badge */}
                      <div className="relative shrink-0 mt-0.5">
                        <img
                          src={item.senderAvatar}
                          alt={item.senderName}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-2xs">
                          <PlatformIcon platform={item.platform} size={11} />
                        </span>
                      </div>

                      {/* Message Info with Sentiment Tag */}
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {item.senderName}
                            </span>
                            {/* Sentiment Tag Display */}
                            <SentimentTag 
                              sentiment={item.sentiment} 
                              confidence={item.sentimentScore} 
                            />
                          </div>
                          <span className="text-[10px] font-mono tabular-nums text-slate-400 shrink-0">
                            {item.timestamp}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {item.content}
                        </p>

                        {/* AI Rationale Snippet if available */}
                        {item.sentimentReason && (
                          <div className="text-[10px] text-slate-400 line-clamp-1 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                            <span className="truncate">{item.sentimentReason}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Star & Actions */}
                    <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStar(item.id);
                        }}
                        className={`min-h-[32px] min-w-[32px] flex items-center justify-center rounded cursor-pointer ${
                          item.isStarred ? 'text-amber-500 fill-amber-500' : 'text-slate-300 hover:text-slate-500'
                        }`}
                        aria-label="Star conversation"
                      >
                        <Star className={`w-4 h-4 ${item.isStarred ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Conversation Thread & Dedicated Sentiment Insights (7 cols) */}
        <div className={`lg:col-span-7 bg-white rounded-xl border border-slate-200 flex-col overflow-hidden shadow-2xs ${
          mobileView === 'list' ? 'hidden lg:flex' : 'flex'
        }`}>
          {selectedItem ? (
            <>
              {/* Thread Header */}
              <div className="px-4 sm:px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setMobileView('list')}
                    className="lg:hidden min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-lg cursor-pointer"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <img
                    src={selectedItem.senderAvatar}
                    alt={selectedItem.senderName}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-xs font-bold text-slate-900 truncate">{selectedItem.senderName}</span>
                      <span className="text-[11px] text-slate-500 truncate hidden xs:inline">{selectedItem.senderHandle}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 truncate">
                      <PlatformIcon platform={selectedItem.platform} size={11} />
                      <span>{getPlatformName(selectedItem.platform)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">To {selectedItem.accountHandle}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onToggleResolve(selectedItem.id)}
                    className={`min-h-[36px] flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      selectedItem.isResolved
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">{selectedItem.isResolved ? 'Resolved' : 'Resolve'}</span>
                  </button>
                </div>
              </div>

              {/* Thread Content */}
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
                
                {/* 🌟 GEMINI AI SENTIMENT INSIGHTS CARD 🌟 */}
                <div className="p-3.5 sm:p-4 bg-gradient-to-br from-indigo-50/90 via-slate-50 to-purple-50/70 border border-indigo-200/80 rounded-2xl shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-indigo-600 text-white rounded-lg shadow-2xs">
                        <BrainCircuit className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-indigo-950 block leading-tight">
                          Gemini AI Sentiment Analysis
                        </span>
                        <span className="text-[10px] text-indigo-600/80 block leading-tight">
                          Analyzed with Google Gemini 3.8 Flash
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <SentimentTag 
                        sentiment={selectedItem.sentiment} 
                        confidence={selectedItem.sentimentScore} 
                        size="lg" 
                        showConfidence={true} 
                      />

                      <button
                        type="button"
                        onClick={() => handleAnalyzeSingleItem(selectedItem)}
                        disabled={isAnalyzingSingle}
                        className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100/60 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        title="Re-analyze this message with Gemini API"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingSingle ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* AI Explanation / Reasoning */}
                  <div className="p-2.5 bg-white/90 rounded-xl border border-indigo-100 text-xs text-slate-700 leading-relaxed space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                      <Info className="w-3 h-3 text-indigo-500" />
                      <span>AI Rationale:</span>
                    </div>
                    <p className="text-xs text-slate-800 font-normal">
                      {selectedItem.sentimentReason || (
                        selectedItem.sentiment === 'positive'
                          ? 'Customer shares encouraging praise, gratitude, or satisfaction with your product/services.'
                          : selectedItem.sentiment === 'negative'
                          ? 'Customer reports a service issue, blocker, or dissatisfaction requiring timely support.'
                          : 'General inquiry or feature question without strong emotional bias.'
                      )}
                    </p>
                  </div>

                  {/* Quick Action: Generate Tailored AI Reply Button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      Suggested response tone: <strong className="text-slate-800 font-semibold">{
                        selectedItem.sentiment === 'negative' ? 'Apologetic & Empathetic'
                        : selectedItem.sentiment === 'positive' ? 'Grateful & Friendly'
                        : 'Informative & Courteous'
                      }</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleGenerateAiReply(selectedItem)}
                      disabled={isGeneratingAiReply}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98"
                    >
                      {isGeneratingAiReply ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Bot className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                      <span>Draft AI Reply</span>
                    </button>
                  </div>
                </div>

                {/* Original Post Context if present */}
                {selectedItem.postExcerpt && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                      Replying to Post
                    </span>
                    <p className="text-slate-600 italic">
                      "{selectedItem.postExcerpt}"
                    </p>
                  </div>
                )}

                {/* Customer Message Card */}
                <div className="p-3.5 sm:p-4 bg-slate-100/70 rounded-xl space-y-2 max-w-xl">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-800">{selectedItem.senderName}</span>
                    <span className="font-mono tabular-nums">{selectedItem.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {selectedItem.content}
                  </p>
                </div>

                {/* Replies Thread */}
                {selectedItem.replies && selectedItem.replies.map(rep => (
                  <div key={rep.id} className="ml-auto p-3.5 sm:p-4 bg-indigo-50/80 border border-indigo-100 rounded-xl space-y-1.5 max-w-xl">
                    <div className="flex items-center justify-between text-[11px] text-indigo-900">
                      <span className="font-bold flex items-center gap-1">
                        <CornerDownRight className="w-3 h-3 text-indigo-600" />
                        {rep.sender}
                      </span>
                      <span className="font-mono tabular-nums text-slate-500">{rep.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {rep.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-white space-y-2.5 shrink-0">
                {/* Canned Templates */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium shrink-0">Quick:</span>
                  {cannedReplies.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReplyText(tpl)}
                      className="min-h-[28px] text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md truncate max-w-xs transition-colors cursor-pointer shrink-0"
                    >
                      {tpl}
                    </button>
                  ))}
                </div>

                <div className="flex items-end gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply as ${selectedItem.accountHandle}...`}
                    rows={2}
                    className="flex-1 p-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white resize-none"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="min-h-[44px] px-3.5 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Reply</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              Select a conversation to review and reply
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
