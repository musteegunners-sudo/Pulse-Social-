import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Image as ImageIcon, 
  Type, 
  Clock, 
  Eye, 
  Check, 
  Calendar,
  Layers,
  Palette
} from 'lucide-react';
import { WhatsAppStatusItem } from '../../types';
import { MEDIA_PRESETS } from '../../data/initialData';

interface CreateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveStatus: (status: Omit<WhatsAppStatusItem, 'id' | 'createdAt' | 'expiresAt' | 'viewsCount'>) => void;
}

const BG_COLOR_OPTIONS = [
  { name: 'WhatsApp Emerald', class: 'bg-emerald-600', hex: '#059669' },
  { name: 'Royal Indigo', class: 'bg-indigo-600', hex: '#4f46e5' },
  { name: 'Berry Rose', class: 'bg-rose-600', hex: '#e11d48' },
  { name: 'Deep Purple', class: 'bg-purple-700', hex: '#7e22ce' },
  { name: 'Sunset Amber', class: 'bg-amber-600', hex: '#d97706' },
  { name: 'Ocean Teal', class: 'bg-teal-600', hex: '#0d9488' },
  { name: 'Midnight Slate', class: 'bg-slate-900', hex: '#0f172a' },
  { name: 'Coral Orange', class: 'bg-orange-600', hex: '#ea580c' },
];

const FONT_OPTIONS: Array<{ id: 'sans' | 'serif' | 'mono' | 'handwriting'; label: string; class: string }> = [
  { id: 'sans', label: 'Modern Sans', class: 'font-sans' },
  { id: 'serif', label: 'Classic Serif', class: 'font-serif' },
  { id: 'mono', label: 'Code Mono', class: 'font-mono' },
  { id: 'handwriting', label: 'Expressive', class: 'italic font-serif' },
];

export const CreateStatusModal: React.FC<CreateStatusModalProps> = ({
  isOpen,
  onClose,
  onSaveStatus,
}) => {
  const [statusType, setStatusType] = useState<'text' | 'image'>('text');
  
  // Text status state
  const [textContent, setTextContent] = useState('');
  const [selectedBgColor, setSelectedBgColor] = useState('bg-emerald-600');
  const [selectedFont, setSelectedFont] = useState<'sans' | 'serif' | 'mono' | 'handwriting'>('sans');

  // Media status state
  const [mediaUrl, setMediaUrl] = useState(MEDIA_PRESETS[0]?.url || '');
  const [caption, setCaption] = useState('');

  // Schedule status
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState(
    new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString().slice(0, 16)
  );

  // Status Privacy
  const [privacyMode, setPrivacyMode] = useState<'contacts' | 'except' | 'only'>('contacts');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (statusType === 'text' && !textContent.trim()) return;
    if (statusType === 'image' && !mediaUrl) return;

    onSaveStatus({
      type: statusType,
      content: statusType === 'text' ? textContent.trim() : caption.trim(),
      mediaUrl: statusType === 'image' ? mediaUrl : undefined,
      bgColor: statusType === 'text' ? selectedBgColor : undefined,
      fontStyle: statusType === 'text' ? selectedFont : undefined,
      isScheduled,
      scheduledFor: isScheduled ? new Date(scheduleDateTime).toISOString() : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200" 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 z-10 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">Post WhatsApp Status</h3>
              <p className="text-[11px] text-emerald-100 mt-0.5">24-hour disappearing story shared with your contacts</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Format Segmented Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => setStatusType('text')}
              className={`flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusType === 'text'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Text Status</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusType('image')}
              className={`flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusType === 'image'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Photo / Media</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column: Form Controls */}
            <div className="space-y-4">
              {statusType === 'text' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Status Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Type a status update for your contacts..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 resize-none"
                    />
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                      <span>Supports emojis and bold formatting (*word*)</span>
                      <span>{textContent.length}/700</span>
                    </div>
                  </div>

                  {/* Background Color Swatches */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Background Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {BG_COLOR_OPTIONS.map((c) => (
                        <button
                          key={c.class}
                          type="button"
                          onClick={() => setSelectedBgColor(c.class)}
                          title={c.name}
                          className={`w-7 h-7 rounded-full ${c.class} flex items-center justify-center shadow-xs transition-transform cursor-pointer ${
                            selectedBgColor === c.class ? 'ring-2 ring-offset-2 ring-emerald-600 scale-110' : 'hover:scale-105'
                          }`}
                        >
                          {selectedBgColor === c.class && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Family Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Font Typography
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {FONT_OPTIONS.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setSelectedFont(f.id)}
                          className={`px-3 py-1.5 text-xs rounded-lg border text-left cursor-pointer transition-colors ${
                            selectedFont === f.id
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          } ${f.class}`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Select Image / Preset Media
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {MEDIA_PRESETS.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => setMediaUrl(m.url)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                            mediaUrl === m.url ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-slate-200 opacity-75 hover:opacity-100'
                          }`}
                        >
                          <img src={m.url} alt={m.title} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="Or paste external image URL..."
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Add a Caption (Optional)
                    </label>
                    <input
                      type="text"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Caption displayed over media..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                    />
                  </div>
                </>
              )}

              {/* Status Expiration & Privacy */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>24-Hour Disappearing Lifespan</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Like official WhatsApp Statuses, this update will remain visible to contacts for exactly 24 hours from publication.
                </p>

                {/* Scheduling Option */}
                <div className="pt-2 border-t border-slate-200/80">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isScheduled}
                      onChange={(e) => setIsScheduled(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                    />
                    <span>Schedule status release for later</span>
                  </label>

                  {isScheduled && (
                    <div className="mt-2 pl-5">
                      <input
                        type="datetime-local"
                        value={scheduleDateTime}
                        onChange={(e) => setScheduleDateTime(e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Live Phone Mockup Preview */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-semibold text-slate-400 mb-2">Live Status Preview</span>
              <div className="w-56 h-96 rounded-3xl bg-slate-950 p-2 shadow-2xl border-4 border-slate-800 relative flex flex-col overflow-hidden">
                {/* Simulated Screen */}
                <div className={`w-full h-full rounded-2xl relative flex flex-col justify-between overflow-hidden ${
                  statusType === 'text' ? selectedBgColor : 'bg-black'
                }`}>
                  {/* Top story progress bar */}
                  <div className="p-2 z-10 flex items-center gap-1">
                    <div className="h-1 flex-1 bg-white/40 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-2/3" />
                    </div>
                  </div>

                  {/* Top user badge */}
                  <div className="px-3 py-1 z-10 flex items-center gap-2 text-white">
                    <div className="w-6 h-6 rounded-full bg-white/30 backdrop-blur-xs flex items-center justify-center text-[10px] font-bold">
                      You
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold block leading-tight">My Status</span>
                      <span className="text-[9px] text-white/70 block leading-none">Just now</span>
                    </div>
                  </div>

                  {/* Center Content */}
                  <div className="flex-1 flex items-center justify-center p-4 text-center z-10">
                    {statusType === 'text' ? (
                      <p className={`text-white text-sm font-medium leading-relaxed break-words max-h-48 overflow-hidden ${
                        FONT_OPTIONS.find(f => f.id === selectedFont)?.class || ''
                      }`}>
                        {textContent || 'Type your status message to preview it here...'}
                      </p>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img 
                          src={mediaUrl} 
                          alt="Status preview" 
                          className="w-full h-full object-cover" 
                        />
                        {caption && (
                          <div className="absolute bottom-12 inset-x-0 bg-black/60 backdrop-blur-xs px-3 py-2 text-center text-white text-xs">
                            {caption}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom reply mockup */}
                  <div className="p-2 z-10 bg-gradient-to-t from-black/50 to-transparent">
                    <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-xs text-white/70 text-[10px] text-center">
                      Reply to status...
                    </div>
                  </div>
                </div>
              </div>
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
            onClick={handleSubmit}
            disabled={statusType === 'text' ? !textContent.trim() : !mediaUrl}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isScheduled ? 'Schedule Status' : 'Share to My Status'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
