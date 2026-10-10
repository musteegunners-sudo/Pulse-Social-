import React, { useState } from 'react';
import { Package, Download, Check, QrCode } from 'lucide-react';
import { InstallAppModal } from '../pwa/InstallAppModal';

interface ApkInstallButtonProps {
  variant?: 'sidebar' | 'mobile-tab' | 'compact';
  className?: string;
}

export const ApkInstallButton: React.FC<ApkInstallButtonProps> = ({
  variant = 'sidebar',
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);

    // 1. Direct browser download of PulseSocial.apk
    const link = document.createElement('a');
    link.href = '/api/download/pulsesocial.apk';
    link.download = 'PulseSocial.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 2. Open the 3-step manual install instructions modal
    setIsModalOpen(true);

    setTimeout(() => {
      setIsDownloading(false);
    }, 2500);
  };

  return (
    <>
      {variant === 'sidebar' && (
        <div className={`rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 p-2.5 transition-all hover:border-emerald-500/50 hover:from-emerald-500/15 ${className}`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Package className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 leading-tight block truncate">
                  Android APK
                </span>
                <span className="text-[10px] text-emerald-700 font-medium leading-tight block truncate">
                  Signed APK · 0.55 MB
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase shrink-0">
              .APK
            </span>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={handleDownload}
              type="button"
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95"
              title="Download PulseSocial.apk directly to manually install on Android"
            >
              {isDownloading ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Download APK</span>
                </>
              )}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              type="button"
              className="px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              title="View manual install instructions and phone QR code"
              aria-label="View manual install instructions and phone QR code"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
        </div>
      )}

      {variant === 'mobile-tab' && (
        <button
          onClick={handleDownload}
          type="button"
          className={`min-h-[48px] min-w-[44px] flex flex-col items-center justify-center relative rounded-lg text-emerald-600 hover:text-emerald-700 active:scale-95 cursor-pointer ${className}`}
          title="Download PulseSocial.apk directly to manually install on your device"
        >
          <div className="relative">
            <Package className="w-5 h-5 text-emerald-600" />
            <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[8px] font-bold px-1 rounded-full font-mono">
              APK
            </span>
          </div>
          <span className="text-[10px] tracking-tight mt-1 truncate font-semibold text-emerald-700">
            {isDownloading ? 'Saved!' : 'Get APK'}
          </span>
        </button>
      )}

      {variant === 'compact' && (
        <button
          onClick={handleDownload}
          type="button"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95 ${className}`}
          title="Download PulseSocial.apk directly"
        >
          <Package className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isDownloading ? 'Downloading...' : 'Download APK'}</span>
        </button>
      )}

      <InstallAppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultTab="apk"
      />
    </>
  );
};
