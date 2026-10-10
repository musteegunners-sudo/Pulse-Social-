import React, { useState } from 'react';
import { Loader2, ArrowRight, Check, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { SocialProviderId, useAuth } from '../../contexts/AuthContext';

export interface SocialProviderConfig {
  id: SocialProviderId;
  name: string;
  badge?: string;
  popular?: boolean;
  brandColor: string;
  bgHover: string;
  borderClass: string;
  textColor: string;
  category: 'major' | 'creator' | 'messaging' | 'enterprise';
  defaultHandle: string;
  handlePrefix: string;
  icon: (className?: string) => React.ReactNode;
}

export const SOCIAL_PROVIDERS: SocialProviderConfig[] = [
  {
    id: 'google',
    name: 'Google',
    badge: '1-Tap Fast',
    popular: true,
    brandColor: '#4285F4',
    bgHover: 'hover:bg-slate-50',
    borderClass: 'border-slate-200',
    textColor: 'text-slate-800',
    category: 'major',
    defaultHandle: 'google.creator',
    handlePrefix: '@',
    icon: (className = 'w-4 h-4') => (
      <svg className={className} viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
      </svg>
    ),
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    badge: 'Popular',
    popular: true,
    brandColor: '#000000',
    bgHover: 'hover:bg-slate-50',
    borderClass: 'border-slate-200',
    textColor: 'text-slate-900',
    category: 'major',
    defaultHandle: 'pulsesocial_x',
    handlePrefix: '@',
    icon: (className = 'w-4 h-4') => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    badge: 'B2B',
    popular: true,
    brandColor: '#0A66C2',
    bgHover: 'hover:bg-blue-50/50',
    borderClass: 'border-blue-200/70',
    textColor: 'text-[#0A66C2]',
    category: 'major',
    defaultHandle: 'pulse-growth-lead',
    handlePrefix: 'in/',
    icon: (className = 'w-4 h-4') => (
      <svg className={className} viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    name: 'Facebook',
    badge: 'Pages & Meta',
    popular: true,
    brandColor: '#1877F2',
    bgHover: 'hover:bg-blue-50/50',
    borderClass: 'border-blue-200/70',
    textColor: 'text-[#1877F2]',
    category: 'major',
    defaultHandle: 'pulse_official_page',
    handlePrefix: '@',
    icon: (className = 'w-4 h-4') => (
      <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: 'instagram',
    name: 'Instagram',
    badge: 'Creator',
    popular: false,
    brandColor: '#E1306C',
    bgHover: 'hover:bg-pink-50/50',
    borderClass: 'border-pink-200/70',
    textColor: 'text-[#E1306C]',
    category: 'creator',
    defaultHandle: 'pulse.creatives',
    handlePrefix: '@',
    icon: (className = 'w-4 h-4') => (
      <svg className={className} viewBox="0 0 24 24">
        <defs>
          <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f09433" />
            <stop offset="25%" stopColor="#e6683c" />
            <stop offset="50%" stopColor="#dc2743" />
            <stop offset="75%" stopColor="#cc2366" />
            <stop offset="100%" stopColor="#bc1888" />
          </linearGradient>
        </defs>
        <path fill="url(#igGrad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    badge: 'Viral',
    popular: false,
    brandColor: '#000000',
    bgHover: 'hover:bg-slate-50',
    borderClass: 'border-slate-200',
    textColor: 'text-slate-900',
    category: 'creator',
    defaultHandle: 'pulse.shorts',
    handlePrefix: '@',
    icon: (className = 'w-4 h-4') => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    badge: 'Direct Phone',
    popular: false,
    brandColor: '#25D366',
    bgHover: 'hover:bg-emerald-50/50',
    borderClass: 'border-emerald-200/70',
    textColor: 'text-emerald-700',
    category: 'messaging',
    defaultHandle: '+234 812 345 6789',
    handlePrefix: '',
    icon: (className = 'w-4 h-4') => (
      <svg className={className} viewBox="0 0 24 24" fill="#25D366">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347m-4.664-2.852c-.298-.149-1.764-.87-2.037-.97-.272-.099-.47-.149-.669.149-.198.299-.768.97-.942 1.168-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
      </svg>
    ),
  },
  {
    id: 'github',
    name: 'GitHub',
    badge: 'Developer',
    popular: false,
    brandColor: '#24292F',
    bgHover: 'hover:bg-slate-50',
    borderClass: 'border-slate-200',
    textColor: 'text-slate-900',
    category: 'creator',
    defaultHandle: 'pulsesocial-dev',
    handlePrefix: '@',
    icon: (className = 'w-4 h-4') => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    id: 'apple',
    name: 'Apple',
    badge: 'Apple ID',
    popular: false,
    brandColor: '#000000',
    bgHover: 'hover:bg-slate-50',
    borderClass: 'border-slate-200',
    textColor: 'text-slate-900',
    category: 'enterprise',
    defaultHandle: 'pulse_apple_user',
    handlePrefix: '@',
    icon: (className = 'w-4 h-4') => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.61 1.34-.55.63-1.03 1.68-.9 2.72 1.01.08 2.04-.52 2.59-1.21z" />
      </svg>
    ),
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    badge: 'Work / School',
    popular: false,
    brandColor: '#00A4EF',
    bgHover: 'hover:bg-slate-50',
    borderClass: 'border-slate-200',
    textColor: 'text-slate-900',
    category: 'enterprise',
    defaultHandle: 'pulse_enterprise',
    handlePrefix: '@',
    icon: (className = 'w-4 h-4') => (
      <svg className={className} viewBox="0 0 24 24">
        <path fill="#F25022" d="M1 1h10v10H1z" />
        <path fill="#7FBA00" d="M13 1h10v10H13z" />
        <path fill="#00A4EF" d="M1 13h10v10H1z" />
        <path fill="#FFB900" d="M13 13h10v10H13z" />
      </svg>
    ),
  },
];

interface SocialAuthProvidersProps {
  mode: 'login' | 'register';
  onConnectingStateChange?: (isConnecting: boolean) => void;
  onError?: (error: string | null) => void;
}

export const SocialAuthProviders: React.FC<SocialAuthProvidersProps> = ({
  mode,
  onConnectingStateChange,
  onError,
}) => {
  const { loginWithSocial, lastSocialProvider } = useAuth();
  const [connectingId, setConnectingId] = useState<SocialProviderId | null>(null);
  const [showAllProviders, setShowAllProviders] = useState(false);
  
  // Custom Handle / Phone Quick Sheet
  const [activePromptProvider, setActivePromptProvider] = useState<SocialProviderConfig | null>(null);
  const [customHandle, setCustomHandle] = useState('');
  const [customName, setCustomName] = useState('');

  const handleProviderClick = async (provider: SocialProviderConfig, fastImmediate = false) => {
    // If not fast immediate, let user review handle for WhatsApp, Instagram, or TikTok, or if requested
    if (!fastImmediate && (provider.id === 'whatsapp' || provider.id === 'instagram' || provider.id === 'tiktok')) {
      setActivePromptProvider(provider);
      setCustomHandle(provider.defaultHandle);
      setCustomName(provider.name.split(' ')[0] + ' Creator');
      return;
    }

    await executeLogin(provider.id);
  };

  const executeLogin = async (
    providerId: SocialProviderId, 
    customData?: { handle?: string; displayName?: string }
  ) => {
    try {
      setConnectingId(providerId);
      onConnectingStateChange?.(true);
      onError?.(null);

      await loginWithSocial(providerId, {
        handle: customData?.handle,
        displayName: customData?.displayName,
      });

      setActivePromptProvider(null);
    } catch (err: any) {
      console.warn('Social Auth event:', err);
      if (err?.message?.includes('popup-closed-by-user') || err?.message?.includes('cancelled')) {
        onError?.('Sign-in popup was cancelled.');
      } else {
        // Any other error is logged quietly without showing technical error banner
        onError?.(null);
      }
    } finally {
      setConnectingId(null);
      onConnectingStateChange?.(false);
    }
  };

  const popularProviders = SOCIAL_PROVIDERS.filter(p => p.popular);
  const otherProviders = SOCIAL_PROVIDERS.filter(p => !p.popular);

  return (
    <div className="space-y-3.5">
      {/* Top 4 Popular Social Logins */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {popularProviders.map((provider) => {
          const isConnecting = connectingId === provider.id;
          const isLastUsed = lastSocialProvider === provider.id;

          return (
            <button
              key={provider.id}
              type="button"
              onClick={() => handleProviderClick(provider, true)}
              disabled={connectingId !== null}
              className={`min-h-[44px] flex items-center justify-between px-3.5 py-2.5 bg-white ${provider.bgHover} border ${provider.borderClass} rounded-xl text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50 relative group active:scale-98`}
              title={`${mode === 'register' ? 'Sign up' : 'Continue'} with ${provider.name}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="shrink-0">
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  ) : (
                    provider.icon('w-4 h-4')
                  )}
                </div>
                <span className={`truncate ${provider.textColor}`}>
                  {mode === 'register' ? `Sign up with ${provider.name}` : `Continue with ${provider.name}`}
                </span>
              </div>

              {isLastUsed && (
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-1.5 py-0.5 rounded shrink-0">
                  Last used
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Toggle between 4 popular vs all 10 social accounts */}
      <div className="flex items-center justify-between pt-0.5">
        <button
          type="button"
          onClick={() => setShowAllProviders(!showAllProviders)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer py-1"
        >
          <span>
            {showAllProviders ? 'Show top 4 options' : 'View all 10 social account options (Instagram, TikTok, WhatsApp, etc.)'}
          </span>
          {showAllProviders ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
          10 channels ready
        </span>
      </div>

      {/* Expanded Grid for remaining 6 social accounts */}
      {showAllProviders && (
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2 animate-in fade-in duration-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            More Social Sign-In Providers
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {otherProviders.map((provider) => {
              const isConnecting = connectingId === provider.id;
              const isLastUsed = lastSocialProvider === provider.id;

              return (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => handleProviderClick(provider)}
                  disabled={connectingId !== null}
                  className={`min-h-[42px] flex items-center justify-between px-3 py-2 bg-white ${provider.bgHover} border ${provider.borderClass} rounded-xl text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-98`}
                  title={`${mode === 'register' ? 'Register' : 'Log in'} with ${provider.name}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="shrink-0">
                      {isConnecting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      ) : (
                        provider.icon('w-4 h-4')
                      )}
                    </div>
                    <span className={`truncate ${provider.textColor}`}>
                      {mode === 'register' ? `Register with ${provider.name}` : `Sign in with ${provider.name}`}
                    </span>
                  </div>

                  {provider.badge && (
                    <span className="text-[10px] text-slate-400 font-normal shrink-0">
                      {provider.badge}
                    </span>
                  )}
                  {isLastUsed && (
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1 py-0.5 rounded shrink-0">
                      Last
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Inline Handle / Details Confirmation Card */}
      {activePromptProvider && (
        <div className="p-3.5 bg-gradient-to-br from-indigo-50/90 to-purple-50/90 border border-indigo-200 rounded-xl space-y-3 animate-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-white rounded-lg shadow-2xs border border-slate-200">
                {activePromptProvider.icon('w-4 h-4')}
              </div>
              <div>
                <h4 className="text-xs font-bold text-indigo-950">
                  {mode === 'register' ? 'Register via' : 'Continue with'} {activePromptProvider.name}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Confirm your social handle to link your profile
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActivePromptProvider(null)}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                {activePromptProvider.id === 'whatsapp' ? 'Phone Number with Country Code' : 'Username / Channel Handle'}
              </label>
              <input
                type="text"
                value={customHandle}
                onChange={(e) => setCustomHandle(e.target.value)}
                placeholder={activePromptProvider.defaultHandle}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                Display Name (Optional)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => executeLogin(activePromptProvider.id, {
              handle: customHandle.trim() || activePromptProvider.defaultHandle,
              displayName: customName.trim() || undefined,
            })}
            disabled={connectingId !== null}
            className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {connectingId ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Authenticating with {activePromptProvider.name}...</span>
              </>
            ) : (
              <>
                <span>Complete {mode === 'register' ? 'Registration' : 'Login'} with {activePromptProvider.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
