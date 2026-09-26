import React, { useState } from 'react';
import { 
  X, 
  Send, 
  ExternalLink, 
  QrCode, 
  Copy, 
  Check, 
  MessageSquare, 
  Phone, 
  Sparkles,
  Download
} from 'lucide-react';
import { generateLocalQRCodeDataUrl } from '../../utils/qrCode';
import { WhatsAppChat } from '../../types';

interface DirectMessageLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchInAppChat: (phoneNumber: string, contactName?: string, initialMessage?: string) => void;
}

const COUNTRY_CODES = [
  { code: '+1', country: 'United States / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
];

const QUICK_TEMPLATES = [
  "Hi! Thanks for contacting PulseSocial. How can we help you today?",
  "Hello! Following up regarding your inquiry about our social media suite.",
  "Hi there! Your order and campaign slots are confirmed. Let us know if you need anything!",
  "Hey! Excited to connect with you on WhatsApp. Here is our direct channel link."
];

export const DirectMessageLauncherModal: React.FC<DirectMessageLauncherModalProps> = ({
  isOpen,
  onClose,
  onLaunchInAppChat,
}) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState('+1');
  const [phoneNumberInput, setPhoneNumberInput] = useState('');
  const [contactNameInput, setContactNameInput] = useState('');
  const [messageText, setMessageText] = useState('Hello! Connecting with you from PulseSocial.');
  
  // QR Code state
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // Compute clean international phone
  const cleanNumberDigits = phoneNumberInput.replace(/[^\d]/g, '');
  const fullPhoneNumber = phoneNumberInput.startsWith('+') 
    ? phoneNumberInput.replace(/[^\d+]/g, '')
    : `${selectedCountryCode}${cleanNumberDigits}`;

  const cleanPhoneForWaMe = fullPhoneNumber.replace(/[^\d]/g, '');
  const waMeUrl = cleanPhoneForWaMe 
    ? `https://wa.me/${cleanPhoneForWaMe}?text=${encodeURIComponent(messageText.trim())}`
    : '';

  const handleOpenWhatsAppWeb = () => {
    if (!cleanPhoneForWaMe) return;
    window.open(waMeUrl, '_blank', 'noopener,noreferrer');
  };

  const handleLaunchInApp = () => {
    if (!cleanPhoneForWaMe) return;
    onLaunchInAppChat(fullPhoneNumber, contactNameInput.trim() || undefined, messageText.trim());
    onClose();
  };

  const handleGenerateQR = async () => {
    if (!waMeUrl) return;
    try {
      const dataUrl = await generateLocalQRCodeDataUrl(waMeUrl, 280);
      setQrCodeDataUrl(dataUrl);
      setShowQrCode(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = () => {
    if (!waMeUrl) return;
    navigator.clipboard.writeText(waMeUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
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
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">Direct WhatsApp Message</h3>
              <p className="text-[11px] text-emerald-100 mt-0.5">Send message to any number without saving to contacts</p>
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
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Phone Number Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Recipient Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedCountryCode}
                onChange={(e) => setSelectedCountryCode(e.target.value)}
                className="w-32 px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 shrink-0 font-medium"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>

              <input
                type="tel"
                value={phoneNumberInput}
                onChange={(e) => setPhoneNumberInput(e.target.value)}
                placeholder="e.g. 555 019 2831"
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports international numbers with country prefix. No need to add to phone address book.
            </p>
          </div>

          {/* Contact Label (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Contact Name or Business Note <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={contactNameInput}
              onChange={(e) => setContactNameInput(e.target.value)}
              placeholder="e.g. Acme Corp Lead, Michael Scott..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
            />
          </div>

          {/* Prefilled Message */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Direct Message Content
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {messageText.length} chars
              </span>
            </div>
            <textarea
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your WhatsApp message..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 resize-none"
            />
          </div>

          {/* Quick Response Templates */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              Quick Templates:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessageText(tmpl)}
                  className="text-[10px] text-slate-600 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 px-2.5 py-1 rounded-md transition-colors text-left truncate max-w-full border border-slate-200/60 cursor-pointer"
                >
                  {tmpl.substring(0, 42)}...
                </button>
              ))}
            </div>
          </div>

          {/* Direct Link Preview Box */}
          {cleanPhoneForWaMe && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Instant Direct Link Generated
                </span>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
              <p className="text-[11px] font-mono text-emerald-800 break-all bg-white/70 p-2 rounded border border-emerald-100">
                {waMeUrl}
              </p>
            </div>
          )}

          {/* QR Code Section (if triggered) */}
          {showQrCode && qrCodeDataUrl && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center space-y-2 animate-in fade-in duration-200">
              <span className="text-xs font-semibold text-slate-800">
                Scan with Phone Camera to Open WhatsApp Chat
              </span>
              <img 
                src={qrCodeDataUrl} 
                alt="WhatsApp Direct Chat QR Code" 
                className="w-48 h-48 rounded-lg shadow-sm border border-slate-200 bg-white p-2"
              />
              <p className="text-[11px] text-slate-500 max-w-xs">
                Anyone who scans this QR code will instantly open WhatsApp on their mobile device with this prefilled message!
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleGenerateQR}
              disabled={!cleanPhoneForWaMe}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-500" />
              <span>QR Code</span>
            </button>

            <button
              onClick={handleOpenWhatsAppWeb}
              disabled={!cleanPhoneForWaMe}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              <span>Open wa.me</span>
            </button>
          </div>

          <button
            onClick={handleLaunchInApp}
            disabled={!cleanPhoneForWaMe}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Chat In-App Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
