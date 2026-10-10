import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Share2, 
  PlusSquare, 
  Check, 
  Copy, 
  QrCode, 
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
  Package,
  Terminal,
  FileCode,
  FolderGit2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { generateLocalQRCodeDataUrl } from '../../utils/qrCode';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'phone' | 'apk' | 'ios' | 'android';
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ 
  isOpen, 
  onClose,
  defaultTab = 'apk'
}) => {
  const { isInstallable, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'phone' | 'apk' | 'ios' | 'android'>(defaultTab);
  const [copied, setCopied] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);
  const [directInstallNotice, setDirectInstallNotice] = useState<'idle' | 'installed' | 'iframe' | 'manual'>('idle');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://pulsesocial.app';

  useEffect(() => {
    if (isOpen) {
      generateLocalQRCodeDataUrl(currentUrl, 220).then(setQrCodeDataUrl);
      if (defaultTab) {
        setActiveTab(defaultTab);
      }
      setDirectInstallNotice('idle');
    }
  }, [isOpen, currentUrl, defaultTab]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySnippet = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleDirectInstall = async () => {
    setInstalling(true);
    setDirectInstallNotice('idle');

    const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

    if (isInstallable) {
      try {
        const success = await install();
        setInstalling(false);
        if (success) {
          setDirectInstallNotice('installed');
          setTimeout(() => onClose(), 2500);
          return;
        }
      } catch (err) {
        console.error('PWA install error:', err);
      }
    }

    setInstalling(false);
    if (isInIframe) {
      setDirectInstallNotice('iframe');
    } else if (isIOS) {
      setActiveTab('ios');
    } else {
      setDirectInstallNotice('manual');
    }
  };

  const pwabuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(currentUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 p-2 border border-white/20 flex items-center justify-center shadow-inner shrink-0">
              <Package className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-white">Android APK & Mobile App</h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 uppercase tracking-wider">
                  Capacitor Ready
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">
                Package as an Android APK, compile with GitHub Actions, or install as PWA
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 p-1.5 gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('apk')}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
              activeTab === 'apk'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Build APK</span>
          </button>

          <button
            onClick={() => setActiveTab('phone')}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
              activeTab === 'phone'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Scan QR</span>
          </button>
          
          <button
            onClick={() => setActiveTab('android')}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
              activeTab === 'android'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Android PWA</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
              activeTab === 'ios'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">iOS Safari</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* TAB: Build APK */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              {/* Primary APK Download & Manual Sideload Banner */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 rounded-2xl text-white border border-emerald-500/40 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0 shadow-inner">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        Download PulseSocial.apk
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      </h4>
                      <p className="text-xs text-emerald-200/80">
                        Package: <span className="font-mono text-emerald-300">com.pulsesocial.app</span> &bull; Version 1.0.0
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 uppercase">
                    0.47 MB &bull; Signed
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Download the standalone Android APK directly into your device's Downloads folder so you can manually install (sideload) it without Google Play Store or any developer tools.
                </p>

                {/* Primary Download Button */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <a
                    href="/api/download/pulsesocial.apk"
                    download="PulseSocial.apk"
                    className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Download className="w-4 h-4 text-slate-950" />
                    <span>Download PulseSocial.apk (0.47 MB)</span>
                  </a>

                  <a
                    href="/pulsesocial-android.zip"
                    download="PulseSocial-Android-Package.zip"
                    className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors flex items-center justify-center gap-2 border border-white/15 cursor-pointer active:scale-98"
                  >
                    <Package className="w-4 h-4 text-emerald-300" />
                    <span>Download Source Project (.zip)</span>
                  </a>
                </div>

                {/* 4-Step Sideload Manual Install Guide */}
                <div className="bg-black/30 rounded-xl p-3.5 border border-emerald-500/20 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>How to manually install on your Android device (4 quick steps):</span>
                  </div>
                  <ol className="text-xs text-slate-300 space-y-1.5 list-decimal pl-4">
                    <li>
                      <strong>Download:</strong> Tap the green <span className="text-emerald-300 font-semibold">Download PulseSocial.apk</span> button above.
                    </li>
                    <li>
                      <strong>Open File:</strong> Pull down your notification bar or open your <strong>Files</strong> / <strong>Downloads</strong> app, then tap <span className="font-mono text-emerald-200">PulseSocial.apk</span>.
                    </li>
                    <li>
                      <strong>Allow Installation:</strong> If Android says <em>"For your security, your phone is not allowed to install unknown apps from this source"</em>, tap <strong>Settings</strong> and toggle <strong>"Allow from this source"</strong> to ON.
                    </li>
                    <li>
                      <strong>Install:</strong> Tap <strong>Install</strong>, then tap <strong>Open</strong> to start using PulseSocial directly on your home screen!
                    </li>
                  </ol>
                </div>

                {/* Browser 1-Click Alternate Option */}
                <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-emerald-500/20 text-[11px] text-emerald-200/80">
                  <span>Prefer 1-click browser installation without downloading APK?</span>
                  <button
                    onClick={handleDirectInstall}
                    disabled={installing}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-semibold border border-emerald-400/30 cursor-pointer transition-colors"
                  >
                    {installing ? 'Checking...' : 'Try Browser 1-Click Install'}
                  </button>
                </div>

                {/* Direct Notice Feedback */}
                {directInstallNotice === 'iframe' && (
                  <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-lg text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-amber-100">Running inside Preview iFrame</p>
                        <p className="text-[11px] text-amber-200/90 leading-relaxed">
                          Browser automated 1-click popups are blocked by iframes. Use the <strong>"Download PulseSocial.apk"</strong> button above for direct manual install, or open in a full window:
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href={currentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md text-xs font-bold transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in Full Browser Tab</span>
                      </a>
                    </div>
                  </div>
                )}

                {directInstallNotice === 'manual' && (
                  <div className="p-3 bg-indigo-500/20 border border-indigo-400/40 rounded-lg text-xs space-y-1.5 animate-in fade-in">
                    <p className="font-bold text-indigo-100 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-indigo-300" />
                      Manual 1-Click Install for Android:
                    </p>
                    <p className="text-[11px] text-indigo-200/90 leading-relaxed">
                      Tap your browser's top-right menu <strong>(⋮)</strong> &rarr; tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong> to install PulseSocial directly to your device launcher.
                    </p>
                  </div>
                )}

                {directInstallNotice === 'installed' && (
                  <div className="p-3 bg-emerald-500/30 border border-emerald-400/40 rounded-lg text-xs flex items-center gap-2 animate-in fade-in text-emerald-100">
                    <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                    <span className="font-bold">PulseSocial is installing to your device!</span>
                  </div>
                )}
              </div>

              {/* Scan to Install on Phone Mini Card */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Installing onto your Phone?</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Scan with your camera to open and install in 3 seconds.
                  </p>
                </div>
                {qrCodeDataUrl && (
                  <button 
                    onClick={() => setActiveTab('phone')}
                    className="shrink-0 group p-1 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 transition-colors cursor-pointer"
                    title="Click to expand QR Code"
                  >
                    <img 
                      src={qrCodeDataUrl} 
                      alt="Scan to install" 
                      className="w-12 h-12 rounded object-contain group-hover:scale-105 transition-transform" 
                    />
                  </button>
                )}
              </div>

              {/* Method 1: GitHub Actions (Recommended & Free) */}
              <div className="border border-indigo-200 bg-indigo-50/40 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <h4 className="text-xs font-bold text-indigo-950">
                      Method 1: 1-Click Automated Cloud Build (GitHub Actions)
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                    Zero Setup Required
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  A GitHub Actions workflow is pre-configured in <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 text-indigo-900 font-mono">.github/workflows/build-apk.yml</code>. Whenever you push this code to a GitHub repo:
                </p>
                <ol className="text-[11px] text-slate-700 space-y-1 list-decimal pl-4">
                  <li>Push your code to your GitHub repository.</li>
                  <li>Go to your repo's <strong>Actions</strong> tab &rarr; select <strong>"Build Android APK"</strong>.</li>
                  <li>Click <strong>Run workflow</strong>, and download the finished <strong className="text-indigo-900">PulseSocial-Debug-APK</strong> artifact!</li>
                </ol>
              </div>

              {/* Method 2: PWABuilder (Instant Cloud APK) */}
              <div className="border border-slate-200 bg-slate-50/80 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-slate-700 shrink-0" />
                    <h4 className="text-xs font-bold text-slate-900">
                      Method 2: PWABuilder (No Code / Instant Web APK)
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                    60 Seconds
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Microsoft's official open-source tool turns your live application URL into a signed Android APK or Google Play Store bundle instantly in the cloud.
                </p>
                <a
                  href={pwabuilderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Package APK on PWABuilder.com</span>
                </a>
              </div>

              {/* Method 3: Local Android Studio Build */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-700 shrink-0" />
                  <h4 className="text-xs font-bold text-slate-900">
                    Method 3: Build Locally with Android Studio / Gradle
                  </h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Download or clone your project files to your computer, then execute:
                </p>
                
                <div className="space-y-1.5">
                  <div className="relative group bg-slate-900 text-slate-100 p-2.5 rounded-lg text-[11px] font-mono flex items-center justify-between">
                    <span className="select-all">npm run build:android</span>
                    <button
                      onClick={() => handleCopySnippet('npm run build:android', 'build')}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy command"
                    >
                      {copiedSnippet === 'build' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="relative group bg-slate-900 text-slate-100 p-2.5 rounded-lg text-[11px] font-mono flex items-center justify-between">
                    <span className="select-all">npx cap open android</span>
                    <button
                      onClick={() => handleCopySnippet('npx cap open android', 'open')}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy command"
                    >
                      {copiedSnippet === 'open' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="relative group bg-slate-900 text-slate-100 p-2.5 rounded-lg text-[11px] font-mono flex items-center justify-between">
                    <span className="select-all">cd android && ./gradlew assembleDebug</span>
                    <button
                      onClick={() => handleCopySnippet('cd android && ./gradlew assembleDebug', 'gradle')}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy command"
                    >
                      {copiedSnippet === 'gradle' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500">
                  The generated APK file will be located at <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono">android/app/build/outputs/apk/debug/app-debug.apk</code>.
                </p>
              </div>
            </div>
          )}

          {/* TAB: Scan with phone */}
          {activeTab === 'phone' && (
            <div className="space-y-4 text-center">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 text-left flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Opening from your computer?</span> Point your phone's camera at the QR code below to immediately open PulseSocial on your device.
                </div>
              </div>

              {/* QR Code container */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="p-3 bg-white border-2 border-dashed border-indigo-200 rounded-2xl shadow-sm inline-block">
                  {qrCodeDataUrl ? (
                    <img 
                      src={qrCodeDataUrl} 
                      alt="Scan QR Code to open on phone" 
                      className="w-44 h-44 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">
                      Generating QR...
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 mt-2 font-medium">
                  Compatible with iOS Camera & Android Google Lens
                </span>
              </div>

              {/* Link copy */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
                <input 
                  type="text" 
                  readOnly 
                  value={currentUrl} 
                  className="bg-transparent text-xs text-slate-600 px-2 py-1 flex-1 truncate font-mono outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              {isInstallable && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={handleDirectInstall}
                    disabled={installing}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install on This Device ({installing ? 'Installing...' : 'Direct Install'})</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: iOS Instructions */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                <span className="font-semibold text-slate-900">Apple iOS Safari Installation:</span> Apple requires installing through the Safari Share menu. Follow these 3 easy steps:
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <p className="font-bold text-slate-900">Open in Safari</p>
                    <p className="text-slate-600">
                      Open PulseSocial in Apple Safari on your iPhone or iPad.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Tap the Share Button</span>
                      <Share2 className="w-3.5 h-3.5 text-indigo-600 inline" />
                    </p>
                    <p className="text-slate-600">
                      Tap the <strong>Share</strong> icon (the square with an arrow pointing upward) in Safari's bottom toolbar.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Select "Add to Home Screen"</span>
                      <PlusSquare className="w-3.5 h-3.5 text-indigo-600 inline" />
                    </p>
                    <p className="text-slate-600">
                      Scroll down the options list, tap <strong>"Add to Home Screen"</strong>, then tap <strong>"Add"</strong> in the top right.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/80 text-[11px] text-indigo-900 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>The PulseSocial icon will now appear on your home screen and open full screen!</span>
              </div>
            </div>
          )}

          {/* TAB: Android PWA */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              {isInstallable ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">Your Browser Supports 1-Click Install</h4>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Tap below to add PulseSocial directly to your Android launcher.
                    </p>
                  </div>
                  <button
                    onClick={handleDirectInstall}
                    disabled={installing}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{installing ? 'Adding to device...' : 'Install App Now'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">Chrome or Samsung Internet:</span>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="text-xs text-slate-700 space-y-1">
                      <p className="font-bold text-slate-900">Open Browser Menu (⋮)</p>
                      <p className="text-slate-600">
                        Tap the three dots menu button in the top right corner of Chrome.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="text-xs text-slate-700 space-y-1">
                      <p className="font-bold text-slate-900">Tap "Install app" or "Add to Home Screen"</p>
                      <p className="text-slate-600">
                        Confirm the prompt to install the standalone application.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  Benefits of Installing:
                </span>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Full-screen native experience without browser search bars</li>
                  <li>Fast instant launching from your home screen</li>
                  <li>Offline caching & automatic updates</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            PulseSocial Mobile & APK Suite
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

