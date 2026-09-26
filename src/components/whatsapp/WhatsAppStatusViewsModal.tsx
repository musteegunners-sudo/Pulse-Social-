import React from 'react';
import { X, Eye, Clock, Trash2, Share2, Check } from 'lucide-react';
import { WhatsAppStatusItem } from '../../types';

interface WhatsAppStatusViewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: WhatsAppStatusItem | null;
  onDeleteStatus: (id: string) => void;
}

export const WhatsAppStatusViewsModal: React.FC<WhatsAppStatusViewsModalProps> = ({
  isOpen,
  onClose,
  status,
  onDeleteStatus,
}) => {
  if (!isOpen || !status) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200" 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 z-10 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm">Status Views & Analytics</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Preview Card */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-2xs relative">
            {status.type === 'text' ? (
              <div className={`w-full h-full flex items-center justify-center p-1.5 text-center text-white text-[9px] ${
                status.bgColor || 'bg-emerald-600'
              }`}>
                <span className="line-clamp-3">{status.content}</span>
              </div>
            ) : (
              <img src={status.mediaUrl} alt="Status thumbnail" className="w-full h-full object-cover" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-800 line-clamp-1">
              {status.content || 'Photo update'}
            </span>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span>{status.viewsCount} views</span>
              <span>·</span>
              <span className="text-emerald-600 font-medium">Expires in 24h</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Delete this WhatsApp status for all contacts?')) {
                onDeleteStatus(status.id);
                onClose();
              }
            }}
            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Status"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Viewers List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
            <span>Viewed By</span>
            <span className="text-emerald-600 font-mono">{status.viewsCount} Contacts</span>
          </div>

          {status.viewers && status.viewers.length > 0 ? (
            status.viewers.map((viewer, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img 
                    src={viewer.avatarUrl} 
                    alt={viewer.name} 
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0" 
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-slate-900 block truncate">
                      {viewer.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Seen via WhatsApp Web
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono shrink-0">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{viewer.time}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No contacts have viewed this status yet.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
