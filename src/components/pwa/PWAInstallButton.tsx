import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle2, QrCode } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { InstallAppModal } from './InstallAppModal';

interface PWAInstallButtonProps {
  variant?: 'nav' | 'banner' | 'sidebar' | 'pill';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'nav',
  className = '' 
}) => {
  const { isInstallable, isInstalled, isIOS, isMobile, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already installed and running standalone, do not show button
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    // If browser supports direct install prompt and not iOS
    if (isInstallable && !isIOS) {
      const outcome = await install();
      if (!outcome) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {variant === 'nav' && (
        <button
          onClick={handleClick}
          type="button"
          title="Download Android APK or install PulseSocial on your mobile device"
          className={`flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Mobile App & APK</span>
          <span className="sm:hidden">App / APK</span>
        </button>
      )}

      {variant === 'sidebar' && (
        <button
          onClick={handleClick}
          type="button"
          className={`w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-100 text-left transition-all cursor-pointer group ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">
                Mobile App & APK
              </p>
              <p className="text-[10px] text-slate-500">
                Android APK · PWA · iOS
              </p>
            </div>
          </div>
          <Download className="w-3.5 h-3.5 text-indigo-600 group-hover:translate-y-0.5 transition-transform" />
        </button>
      )}

      {variant === 'pill' && (
        <button
          onClick={handleClick}
          type="button"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 rounded-full text-xs font-medium shadow-2xs transition-all cursor-pointer ${className}`}
        >
          <Smartphone className="w-3 h-3" />
          <span>Install App</span>
        </button>
      )}

      {/* Install App Modal */}
      <InstallAppModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
};
