import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  Send, 
  Heart, 
  Smile, 
  Flame, 
  ThumbsUp,
  Clock
} from 'lucide-react';
import { WhatsAppContactStatus, WhatsAppStatusItem } from '../../types';

interface WhatsAppStatusViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactStatuses: WhatsAppContactStatus[];
  initialContactIndex?: number;
  onReplyToStatus: (contactId: string, statusItem: WhatsAppStatusItem, text: string) => void;
  onStatusViewed: (contactId: string) => void;
}

const STORY_DURATION_MS = 5000;

export const WhatsAppStatusViewerModal: React.FC<WhatsAppStatusViewerModalProps> = ({
  isOpen,
  onClose,
  contactStatuses,
  initialContactIndex = 0,
  onReplyToStatus,
  onStatusViewed,
}) => {
  const [currentContactIndex, setCurrentContactIndex] = useState(initialContactIndex);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  // Sync initial contact
  useEffect(() => {
    if (isOpen) {
      setCurrentContactIndex(Math.max(0, Math.min(initialContactIndex, contactStatuses.length - 1)));
      setCurrentItemIndex(0);
      setProgress(0);
      setIsPaused(false);
    }
  }, [isOpen, initialContactIndex, contactStatuses.length]);

  const currentContact = contactStatuses[currentContactIndex];
  const currentItem = currentContact?.items[currentItemIndex];

  // Mark status viewed
  useEffect(() => {
    if (currentContact && isOpen) {
      onStatusViewed(currentContact.id);
    }
  }, [currentContactIndex, isOpen]);

  // Timer loop for story progress
  useEffect(() => {
    if (!isOpen || isPaused || !currentItem) return;

    const intervalMs = 50;
    const increment = (intervalMs / STORY_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNextItem();
          return 0;
        }
        return prev + increment;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, currentContactIndex, currentItemIndex, currentContact?.items.length]);

  if (!isOpen || !currentContact || !currentItem) return null;

  const handleNextItem = () => {
    if (currentItemIndex < currentContact.items.length - 1) {
      setCurrentItemIndex((prev) => prev + 1);
      setProgress(0);
    } else if (currentContactIndex < contactStatuses.length - 1) {
      setCurrentContactIndex((prev) => prev + 1);
      setCurrentItemIndex(0);
      setProgress(0);
    } else {
      // Reached the end of all statuses
      onClose();
    }
  };

  const handlePrevItem = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex((prev) => prev - 1);
      setProgress(0);
    } else if (currentContactIndex > 0) {
      const prevContact = contactStatuses[currentContactIndex - 1];
      setCurrentContactIndex((prev) => prev - 1);
      setCurrentItemIndex(prevContact.items.length - 1);
      setProgress(0);
    }
  };

  const handleSendReply = (customText?: string) => {
    const textToSend = customText || replyText.trim();
    if (!textToSend || !currentItem) return;

    onReplyToStatus(currentContact.id, currentItem, textToSend);
    setReplyText('');
    setSentNotice('Reply sent to WhatsApp chat! 🚀');
    setTimeout(() => setSentNotice(null), 2500);
  };

  const handleQuickReaction = (emoji: string) => {
    handleSendReply(emoji);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center select-none overflow-hidden">
      {/* Keyboard Shortcuts handler */}
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 z-40 p-2 text-white/80 hover:text-white rounded-full bg-black/40 hover:bg-black/60 transition-colors cursor-pointer"
        title="Close (Esc)"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev Contact Arrow Button */}
      {currentContactIndex > 0 && (
        <button
          onClick={() => {
            setCurrentContactIndex((prev) => prev - 1);
            setCurrentItemIndex(0);
            setProgress(0);
          }}
          className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          title="Previous Contact Status"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next Contact Arrow Button */}
      {currentContactIndex < contactStatuses.length - 1 && (
        <button
          onClick={() => {
            setCurrentContactIndex((prev) => prev + 1);
            setCurrentItemIndex(0);
            setProgress(0);
          }}
          className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          title="Next Contact Status"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main Story Container (Simulated Mobile Screen Aspect Ratio) */}
      <div 
        className="relative w-full max-w-sm sm:max-w-md h-[90vh] sm:h-[84vh] max-h-[750px] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-between"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Top Progress Bars */}
        <div className="absolute top-0 inset-x-0 z-30 p-3 pt-3 flex items-center gap-1.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {currentContact.items.map((it, idx) => {
            let widthPercent = 0;
            if (idx < currentItemIndex) widthPercent = 100;
            else if (idx === currentItemIndex) widthPercent = progress;
            return (
              <div key={it.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-75"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Top Contact Header */}
        <div className="absolute top-5 inset-x-0 z-30 px-3 py-2 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <img 
              src={currentContact.avatarUrl} 
              alt={currentContact.contactName} 
              className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500"
            />
            <div>
              <span className="font-semibold text-xs leading-tight block">
                {currentContact.contactName}
              </span>
              <span className="text-[10px] text-white/70 block leading-none flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>{currentContact.lastUpdated}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused(!isPaused);
              }}
              className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Left & Right Tap Zones for Navigation */}
        <div 
          onClick={handlePrevItem}
          className="absolute inset-y-16 left-0 w-1/3 z-20 cursor-pointer"
          title="Previous Story"
        />
        <div 
          onClick={handleNextItem}
          className="absolute inset-y-16 right-0 w-2/3 z-20 cursor-pointer"
          title="Next Story"
        />

        {/* Center Story Content */}
        <div className="flex-1 w-full h-full relative flex items-center justify-center">
          {currentItem.type === 'text' ? (
            <div className={`w-full h-full flex items-center justify-center p-6 text-center ${
              currentItem.bgColor || 'bg-emerald-600'
            }`}>
              <p className={`text-white text-lg sm:text-xl font-medium leading-relaxed max-w-xs break-words ${
                currentItem.fontStyle === 'serif' ? 'font-serif' :
                currentItem.fontStyle === 'mono' ? 'font-mono' :
                currentItem.fontStyle === 'handwriting' ? 'italic font-serif' : 'font-sans'
              }`}>
                {currentItem.content}
              </p>
            </div>
          ) : (
            <div className="w-full h-full relative flex items-center justify-center bg-black">
              <img 
                src={currentItem.mediaUrl} 
                alt="WhatsApp Status" 
                className="w-full h-full object-contain"
              />
              {currentItem.content && (
                <div className="absolute bottom-20 inset-x-0 z-20 bg-black/70 backdrop-blur-xs p-3 text-center text-white text-xs leading-normal">
                  {currentItem.content}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sent Notice Toast */}
        {sentNotice && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg font-medium animate-in fade-in duration-150">
            {sentNotice}
          </div>
        )}

        {/* Bottom Direct Message Reply Bar */}
        <div className="z-30 p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent flex flex-col gap-2">
          {/* Quick Reaction Emojis */}
          <div className="flex items-center justify-center gap-3 py-1">
            {['❤️', '😂', '🔥', '👏', '😮', '🙏'].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickReaction(emoji);
                }}
                className="text-lg hover:scale-125 transition-transform cursor-pointer p-1 rounded-full hover:bg-white/10"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Reply Text Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
              placeholder={`Reply to ${currentContact.contactName}...`}
              className="flex-1 px-4 py-2 text-xs bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:bg-white/30"
            />

            <button
              onClick={() => handleSendReply()}
              disabled={!replyText.trim()}
              className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Send reply"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
