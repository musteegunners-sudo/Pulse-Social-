import React, { useState } from 'react';
import { X, Send, Users, Check, AlertCircle, Sparkles } from 'lucide-react';
import { WhatsAppChat } from '../../types';

interface WhatsAppBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  chats: WhatsAppChat[];
  onSendBroadcast: (targetChatIds: string[], message: string) => void;
}

export const WhatsAppBroadcastModal: React.FC<WhatsAppBroadcastModalProps> = ({
  isOpen,
  onClose,
  chats,
  onSendBroadcast,
}) => {
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>(chats.map(c => c.id));
  const [broadcastText, setBroadcastText] = useState(
    "Hi {name}! We just published our newest product update on PulseSocial. Check out our latest features here!"
  );

  if (!isOpen) return null;

  const handleToggleChat = (id: string) => {
    setSelectedChatIds(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedChatIds.length === chats.length) {
      setSelectedChatIds([]);
    } else {
      setSelectedChatIds(chats.map(c => c.id));
    }
  };

  const handleSend = () => {
    if (!broadcastText.trim() || selectedChatIds.length === 0) return;
    onSendBroadcast(selectedChatIds, broadcastText.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200" 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 z-10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">WhatsApp Direct Broadcast</h3>
              <p className="text-[11px] text-emerald-100 mt-0.5">Send a 1-to-many message directly to your contact list</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Target Recipients Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Recipients ({selectedChatIds.length} of {chats.length} selected)
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                {selectedChatIds.length === chats.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 divide-y divide-slate-100 bg-slate-50/50">
              {chats.map(chat => {
                const isSelected = selectedChatIds.includes(chat.id);
                return (
                  <label 
                    key={chat.id}
                    className="flex items-center justify-between p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={chat.avatarUrl} alt={chat.contactName} className="w-7 h-7 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-slate-800 block truncate">{chat.contactName}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{chat.phoneNumber}</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleChat(chat.id)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Broadcast Message Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Broadcast Message
              </label>
              <span className="text-[10px] text-slate-400">
                Tip: Use <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700">{"{name}"}</code> for personalization
              </span>
            </div>
            <textarea
              rows={4}
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 resize-none"
            />
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Individual Delivery:</strong> In accordance with WhatsApp policies, broadcasts are delivered as individual 1-on-1 private messages without contacts seeing each other.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={!broadcastText.trim() || selectedChatIds.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Broadcast ({selectedChatIds.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
