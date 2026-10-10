import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Share2, 
  ExternalLink, 
  Check, 
  Copy, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Info,
  CheckSquare,
  Square
} from 'lucide-react';
import { SocialAccount, SocialPlatform, SocialPost } from '../../types';
import { PlatformIcon, getPlatformName } from './PlatformIcon';
import { 
  getAccountDispatchInfo, 
  shareViaMobileShareSheet 
} from '../../utils/socialAppBridge';

interface RealChannelDispatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: SocialPost | null;
  accounts: SocialAccount[];
}

export const RealChannelDispatcherModal: React.FC<RealChannelDispatcherModalProps> = ({
  isOpen,
  onClose,
  post,
  accounts,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [dispatchedAccountIds, setDispatchedAccountIds] = useState<string[]>([]);
  const [dispatchFeedback, setDispatchFeedback] = useState<string | null>(null);

  if (!isOpen || !post) return null;

  // Find all user's connected accounts matching this post's platforms (or all connected if none specified)
  const targetAccounts = accounts.filter(
    a => a.isConnected && (post.platforms.length === 0 || post.platforms.includes(a.platform))
  );

  const canMobileShare = typeof navigator !== 'undefined' && !!(navigator as any).share;

  const getFullPostText = () => {
    let full = post.content;
    if (post.tags && post.tags.length > 0) {
      full += '\n\n' + post.tags.join(' ');
    }
    return full;
  };

  const handleCopyPost = async () => {
    const fullText = getFullPostText();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullText);
      }
    } catch (e) {
      console.warn('Clipboard write error', e);
    }
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleMobileBroadcast = async () => {
    const fullText = getFullPostText();
    const shared = await shareViaMobileShareSheet('New Social Post', fullText);
    if (shared) {
      setDispatchFeedback('Mobile share sheet opened! Choose your target app to publish.');
      setTimeout(() => setDispatchFeedback(null), 5000);
    }
  };

  const handleChannelClick = async (account: SocialAccount) => {
    const fullText = getFullPostText();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullText);
      }
    } catch (e) {
      console.warn('Clipboard write error', e);
    }

    setDispatchedAccountIds(prev => Array.from(new Set([...prev, account.id])));
    setDispatchFeedback(`Post text copied to clipboard! Opening ${account.name}...`);
    setTimeout(() => setDispatchFeedback(null), 4000);
  };

  const toggleCheckAccount = (accountId: string) => {
    setDispatchedAccountIds(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const isAllDispatched = targetAccounts.length > 0 && targetAccounts.every(a => dispatchedAccountIds.includes(a.id));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Redirect to Mother App to Post</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {dispatchedAccountIds.length} / {targetAccounts.length} Completed
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Click any channel below to immediately redirect to the mother app with your post pre-filled.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">

          {/* Toast / Dispatch Notification */}
          {dispatchFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{dispatchFeedback}</span>
            </div>
          )}

          {/* Staged Post Preview Box */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Post Text Ready to Publish
              </span>
              <button
                type="button"
                onClick={handleCopyPost}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copied to Clipboard!' : 'Copy Post Text'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-800 whitespace-pre-line line-clamp-3 bg-white p-2.5 rounded-lg border border-slate-200 select-all font-sans">
              {post.content}
            </p>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 text-[11px] text-indigo-600 font-mono">
                {post.tags.map((t, idx) => (
                  <span key={idx}>{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* 1-Tap Mobile Broadcast via Android Share Sheet */}
          {canMobileShare && (
            <div className="p-3.5 bg-gradient-to-r from-indigo-50 via-purple-50 to-slate-50 rounded-xl border border-indigo-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    📢 1-Tap Share via Phone Menu (Android / iOS)
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Pops up your phone's native share menu to send directly to WhatsApp, Facebook, X, or Instagram.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleMobileBroadcast}
                className="w-full min-h-[42px] py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Share2 className="w-4 h-4" />
                <span>Open Phone Share Sheet (WhatsApp, Facebook, X, etc.)</span>
              </button>
            </div>
          )}

          {/* Connected Channels List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800">
                Direct Channel Dispatch ({targetAccounts.length} Connected Channels)
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                Tap each button below to publish into that app
              </span>
            </div>

            <div className="space-y-2">
              {targetAccounts.map((account) => {
                const info = getAccountDispatchInfo(account, getFullPostText());
                const isDispatched = dispatchedAccountIds.includes(account.id);
                const isFbGroup = account.platform === 'facebook' && (account.facebookType === 'group' || account.handle.startsWith('groups/'));

                return (
                  <div
                    key={account.id}
                    className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                      isDispatched 
                        ? 'bg-emerald-50/60 border-emerald-300' 
                        : 'bg-white border-slate-200/90 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleCheckAccount(account.id)}
                        className="text-slate-400 hover:text-emerald-600 cursor-pointer shrink-0"
                        title={isDispatched ? 'Mark not posted' : 'Mark as posted'}
                      >
                        {isDispatched ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300" />
                        )}
                      </button>

                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                        <PlatformIcon platform={account.platform} size={18} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {account.name}
                          </span>
                          {account.platform === 'facebook' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              {isFbGroup ? 'Group' : 'Page'}
                            </span>
                          )}
                          {isDispatched && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                              <span>Dispatched ✓</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono truncate block">
                          {account.handle}
                        </span>
                      </div>
                    </div>

                    {/* Direct Native Link Button - Cannot be blocked by mobile popup blockers! */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <a
                        href={info.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleChannelClick(account)}
                        className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
                          isDispatched
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-98'
                        }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Redirect to {getPlatformName(account.platform)} Mother App ↗</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation Box */}
          <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-200/90 text-[11px] text-indigo-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-indigo-950">
              <Info className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
              <span>Click to Redirect to Mother App:</span>
            </div>
            <p className="leading-relaxed text-indigo-900">
              Clicking any button above automatically copies your full post text and immediately redirects you to the official mother app (WhatsApp chat, Facebook Group, Facebook Page, X compose, etc.) so you can review and tap Send or Post!
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopyPost}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedText ? 'Copied!' : 'Copy Post Text'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className={`min-h-[36px] px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              isAllDispatched
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-800 hover:bg-slate-900 text-white'
            }`}
          >
            {isAllDispatched ? 'All Dispatched ✓ Done' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
