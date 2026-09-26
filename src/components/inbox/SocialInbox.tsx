import React, { useState } from 'react';
import { 
  MessageSquareText, 
  Star, 
  CheckCircle2, 
  Send, 
  CornerDownRight, 
  Filter, 
  Search,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { InboxItem, SocialPlatform } from '../../types';
import { PlatformIcon, getPlatformName } from '../common/PlatformIcon';

interface SocialInboxProps {
  inboxItems: InboxItem[];
  onReply: (itemId: string, replyText: string) => void;
  onToggleResolve: (itemId: string) => void;
  onToggleStar: (itemId: string) => void;
}

export const SocialInbox: React.FC<SocialInboxProps> = ({
  inboxItems,
  onReply,
  onToggleResolve,
  onToggleStar,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(inboxItems[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<SocialPlatform | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unresolved' | 'starred'>('unresolved');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  const filteredItems = inboxItems.filter(item => {
    if (filterPlatform !== 'all' && item.platform !== filterPlatform) return false;
    if (filterStatus === 'unresolved' && item.isResolved) return false;
    if (filterStatus === 'starred' && !item.isStarred) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.content.toLowerCase().includes(q) ||
        item.senderName.toLowerCase().includes(q) ||
        item.senderHandle.toLowerCase().includes(q)
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

  const cannedReplies = [
    "Thank you for sharing your feedback! We've forwarded this to our product team.",
    "Appreciate the question! We'll have a detailed breakdown published soon.",
    "Glad you're enjoying the new update! More features dropping soon 🚀",
  ];

  return (
    <div className="p-3 sm:p-6 h-[calc(100vh-4rem)] flex flex-col space-y-3 sm:space-y-4 max-w-7xl mx-auto">
      
      {/* Top filter header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquareText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-900">Unified Community Inbox</h2>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {inboxItems.filter(i => !i.isResolved).length} pending
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium shrink-0">
            <button
              onClick={() => setFilterStatus('unresolved')}
              className={`min-h-[32px] px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterStatus === 'unresolved' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              Open ({inboxItems.filter(i => !i.isResolved).length})
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

      {/* Main Inbox 2-column workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 flex-1 min-h-0 overflow-hidden">
        
        {/* Left: Message list (5 cols) - hidden on mobile if viewing detail */}
        <div className={`lg:col-span-5 bg-white rounded-xl border border-slate-200 flex-col overflow-hidden shadow-2xs ${
          mobileView === 'detail' ? 'hidden lg:flex' : 'flex'
        }`}>
          <div className="p-3 border-b border-slate-100 bg-slate-50/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter messages, senders..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No conversations match criteria
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
                      <div className="relative shrink-0">
                        <img
                          src={item.senderAvatar}
                          alt={item.senderName}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-2xs">
                          <PlatformIcon platform={item.platform} size={10} />
                        </span>
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-900 truncate">
                            {item.senderName}
                          </span>
                          <span className="text-[10px] font-mono tabular-nums text-slate-400">
                            {item.timestamp}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {item.content}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                      <button
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

        {/* Right: Conversation Thread & Inline Reply (7 cols) - hidden on mobile if viewing list */}
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
                  <p className="text-xs text-slate-800 leading-relaxed">
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
                    <p className="text-xs text-slate-800 leading-relaxed">
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
