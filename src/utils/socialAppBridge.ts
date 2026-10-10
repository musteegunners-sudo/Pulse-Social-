import { SocialPlatform } from '../types';

export interface PlatformConfig {
  id: SocialPlatform;
  displayName: string;
  shortName: string;
  brandColor: string;
  accentBg: string;
  appScheme: string;
  webBaseUrl: string;
  authUrl: string;
  scopes: string[];
  docUrl: string;
  intentUrlGenerator: (text: string, mediaUrl?: string) => string;
  deepLinkGenerator: (handle: string) => string;
  webProfileGenerator: (handle: string) => string;
}

export const PLATFORM_CONFIGS: Record<SocialPlatform, PlatformConfig> = {
  twitter: {
    id: 'twitter',
    displayName: 'X (formerly Twitter)',
    shortName: 'X',
    brandColor: '#0f1419',
    accentBg: 'bg-black text-white',
    appScheme: 'twitter://',
    webBaseUrl: 'https://x.com',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    docUrl: 'https://developer.x.com/en/docs/authentication/oauth-2-0',
    intentUrlGenerator: (text: string) => {
      return `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
    },
    deepLinkGenerator: (handle: string) => {
      const clean = handle.replace(/^@/, '');
      return `twitter://user?screen_name=${clean}`;
    },
    webProfileGenerator: (handle: string) => {
      const clean = handle.replace(/^@/, '');
      return `https://x.com/${clean}`;
    },
  },
  linkedin: {
    id: 'linkedin',
    displayName: 'LinkedIn',
    shortName: 'LinkedIn',
    brandColor: '#0a66c2',
    accentBg: 'bg-[#0a66c2] text-white',
    appScheme: 'linkedin://',
    webBaseUrl: 'https://www.linkedin.com',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    scopes: ['openid', 'profile', 'email', 'w_member_social'],
    docUrl: 'https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow',
    intentUrlGenerator: (text: string) => {
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://pulsesocial.app')}&summary=${encodeURIComponent(text)}`;
    },
    deepLinkGenerator: (handle: string) => {
      const clean = handle.replace(/^@/, '');
      return `linkedin://profile/${clean}`;
    },
    webProfileGenerator: (handle: string) => {
      const clean = handle.replace(/^@/, '');
      return `https://www.linkedin.com/in/${clean}`;
    },
  },
  instagram: {
    id: 'instagram',
    displayName: 'Instagram',
    shortName: 'Instagram',
    brandColor: '#e1306c',
    accentBg: 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white',
    appScheme: 'instagram://',
    webBaseUrl: 'https://www.instagram.com',
    authUrl: 'https://api.instagram.com/oauth/authorize',
    scopes: ['instagram_basic', 'instagram_content_publish', 'pages_show_list'],
    docUrl: 'https://developers.facebook.com/docs/instagram-api/getting-started',
    intentUrlGenerator: (_text: string) => {
      return 'https://www.instagram.com/';
    },
    deepLinkGenerator: (handle: string) => {
      const clean = handle.replace(/^@/, '');
      return `instagram://user?username=${clean}`;
    },
    webProfileGenerator: (handle: string) => {
      const clean = handle.replace(/^@/, '');
      return `https://www.instagram.com/${clean}`;
    },
  },
  facebook: {
    id: 'facebook',
    displayName: 'Facebook Page & Groups',
    shortName: 'Facebook',
    brandColor: '#1877f2',
    accentBg: 'bg-[#1877f2] text-white',
    appScheme: 'fb://',
    webBaseUrl: 'https://www.facebook.com',
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    scopes: ['pages_manage_posts', 'pages_read_engagement', 'public_profile'],
    docUrl: 'https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow',
    intentUrlGenerator: (text: string) => {
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://pulsesocial.app')}&quote=${encodeURIComponent(text)}`;
    },
    deepLinkGenerator: (handle: string) => {
      const clean = handle.replace(/^@/, '');
      if (clean.startsWith('groups/')) {
        return `fb://group/${clean.replace(/^groups\//, '')}`;
      }
      return `fb://page/${clean}`;
    },
    webProfileGenerator: (handle: string) => {
      const clean = handle.replace(/^@/, '');
      if (clean.startsWith('groups/')) {
        return `https://www.facebook.com/${clean}`;
      }
      return `https://www.facebook.com/${clean}`;
    },
  },
  tiktok: {
    id: 'tiktok',
    displayName: 'TikTok for Business & Creators',
    shortName: 'TikTok',
    brandColor: '#000000',
    accentBg: 'bg-black text-white',
    appScheme: 'snssdk1233://',
    webBaseUrl: 'https://www.tiktok.com',
    authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
    scopes: ['user.info.basic', 'video.upload', 'video.publish'],
    docUrl: 'https://developers.tiktok.com/doc/login-kit-web',
    intentUrlGenerator: (_text: string) => {
      return 'https://www.tiktok.com/upload';
    },
    deepLinkGenerator: (handle: string) => {
      const clean = handle.replace(/^@/, '');
      return `tiktok://user?screen_name=${clean}`;
    },
    webProfileGenerator: (handle: string) => {
      const clean = handle.replace(/^@/, '');
      return `https://www.tiktok.com/@${clean}`;
    },
  },
  whatsapp: {
    id: 'whatsapp',
    displayName: 'WhatsApp Messenger & Business',
    shortName: 'WhatsApp',
    brandColor: '#25D366',
    accentBg: 'bg-[#25D366] text-white',
    appScheme: 'whatsapp://',
    webBaseUrl: 'https://web.whatsapp.com',
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    scopes: ['whatsapp_business_messaging', 'whatsapp_business_management'],
    docUrl: 'https://developers.facebook.com/docs/whatsapp',
    intentUrlGenerator: (text: string) => {
      return `https://wa.me/?text=${encodeURIComponent(text)}`;
    },
    deepLinkGenerator: (handle: string) => {
      const clean = handle.replace(/[^\d+]/g, '');
      return `whatsapp://send?phone=${clean}`;
    },
    webProfileGenerator: (handle: string) => {
      const clean = handle.replace(/[^\d]/g, '');
      return `https://wa.me/${clean}`;
    },
  },
};

/**
 * Open the user's profile directly in the original mobile app or fallback to official web page
 */
export function openOriginalApp(platform: SocialPlatform, handle: string) {
  const config = PLATFORM_CONFIGS[platform];
  if (!config) return;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const webUrl = config.webProfileGenerator(handle);
  const deepLink = config.deepLinkGenerator(handle);

  if (isMobile) {
    // Attempt deep link scheme, with graceful fallback to web
    const start = Date.now();
    window.location.href = deepLink;
    setTimeout(() => {
      // If user is still here after 1200ms, the native app didn't capture it; open web
      if (Date.now() - start < 2000) {
        window.open(webUrl, '_blank', 'noopener,noreferrer');
      }
    }, 1200);
  } else {
    // Desktop: open the authentic web profile directly
    window.open(webUrl, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Launch direct compose intent in original app
 */
export function publishToOriginalApp(platform: SocialPlatform, content: string, mediaUrl?: string) {
  const config = PLATFORM_CONFIGS[platform];
  if (!config) return;
  const intentUrl = config.intentUrlGenerator(content, mediaUrl);
  window.open(intentUrl, '_blank', 'noopener,noreferrer');
}

export interface DispatchTargetInfo {
  url: string;
  deepLink?: string;
  actionLabel: string;
  instructions: string;
  isDirectPreload: boolean;
}

/**
 * Derive exact real dispatch endpoint and intent parameters based on the user's specific connected account
 */
export function getAccountDispatchInfo(
  account: { platform: SocialPlatform; handle: string; facebookType?: string; name: string },
  content: string
): DispatchTargetInfo {
  const encoded = encodeURIComponent(content);
  const cleanHandle = account.handle.replace(/^@/, '');

  if (account.platform === 'whatsapp') {
    let phone = cleanHandle.replace(/[^\d]/g, '');
    if (phone.startsWith('0') && (phone.length === 11 || phone.length === 10)) {
      phone = '234' + phone.slice(1);
    }
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    return {
      url,
      deepLink: phone ? `whatsapp://send?phone=${phone}&text=${encoded}` : `whatsapp://send?text=${encoded}`,
      actionLabel: `Send via WhatsApp (${account.handle})`,
      instructions: 'Opens WhatsApp chat with post text & hashtags pre-filled. Tap Send to publish!',
      isDirectPreload: true,
    };
  }

  if (account.platform === 'twitter') {
    return {
      url: `https://x.com/intent/post?text=${encoded}`,
      deepLink: `twitter://post?message=${encoded}`,
      actionLabel: `Tweet on X (@${cleanHandle})`,
      instructions: 'Opens X/Twitter composer with post copy and hashtags already loaded. Tap Post!',
      isDirectPreload: true,
    };
  }

  if (account.platform === 'facebook') {
    const isGroup = account.facebookType === 'group' || cleanHandle.startsWith('groups/');
    if (isGroup) {
      const groupId = cleanHandle.replace(/^groups\//, '');
      return {
        url: `https://www.facebook.com/groups/${groupId}`,
        deepLink: `fb://group/${groupId}`,
        actionLabel: `Post in Facebook Group (${account.name})`,
        instructions: 'Post content copied to clipboard! Opens your Facebook Group so you can paste and post.',
        isDirectPreload: false,
      };
    } else {
      return {
        url: `https://www.facebook.com/${cleanHandle}`,
        deepLink: `fb://page/${cleanHandle}`,
        actionLabel: `Post to Facebook Page (@${cleanHandle})`,
        instructions: 'Post content copied to clipboard! Opens your Facebook Page so you can paste and post.',
        isDirectPreload: false,
      };
    }
  }

  if (account.platform === 'instagram') {
    return {
      url: `https://www.instagram.com/`,
      deepLink: `instagram://camera`,
      actionLabel: `Post to Instagram (@${cleanHandle})`,
      instructions: 'Caption copied to clipboard! Opens Instagram ready for creating your post or reel.',
      isDirectPreload: false,
    };
  }

  if (account.platform === 'tiktok') {
    return {
      url: `https://www.tiktok.com/upload`,
      deepLink: `snssdk1233://`,
      actionLabel: `Post to TikTok (@${cleanHandle})`,
      instructions: 'Caption copied to clipboard! Opens TikTok Upload studio ready to publish.',
      isDirectPreload: false,
    };
  }

  if (account.platform === 'linkedin') {
    return {
      url: `https://www.linkedin.com/feed/?shareActive=true&text=${encoded}`,
      deepLink: `linkedin://shareActive?text=${encoded}`,
      actionLabel: `Share on LinkedIn`,
      instructions: 'Opens LinkedIn feed share box with your post text pre-filled.',
      isDirectPreload: true,
    };
  }

  return {
    url: 'https://pulsesocial.app',
    actionLabel: 'Share',
    instructions: 'Copy content and publish to channel.',
    isDirectPreload: false,
  };
}

/**
 * Execute 1-click dispatch to a real channel account
 */
export async function executeChannelDispatch(
  account: { platform: SocialPlatform; handle: string; facebookType?: string; name: string },
  content: string
): Promise<{ success: boolean; message: string }> {
  // Always copy text to clipboard for zero friction
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(content);
    }
  } catch (e) {
    console.warn('Clipboard write skipped', e);
  }

  const dispatchInfo = getAccountDispatchInfo(account, content);
  window.open(dispatchInfo.url, '_blank', 'noopener,noreferrer');

  return {
    success: true,
    message: dispatchInfo.instructions,
  };
}

/**
 * Direct redirect to the mother app (official native app or website)
 */
export function redirectToMotherApp(
  account: { platform: SocialPlatform; handle: string; facebookType?: string; name: string },
  content?: string
): { url: string; actionLabel: string } {
  if (content && typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      navigator.clipboard.writeText(content);
    } catch (e) {
      console.warn('Clipboard write skipped', e);
    }
  }

  const info = getAccountDispatchInfo(account, content || '');
  window.open(info.url, '_blank', 'noopener,noreferrer');

  return {
    url: info.url,
    actionLabel: info.actionLabel
  };
}

/**
 * Broadcast post via native mobile share sheet (Android / iOS)
 */
export async function shareViaMobileShareSheet(
  title: string,
  text: string,
  url?: string
): Promise<boolean> {
  if (typeof navigator !== 'undefined' && (navigator as any).share) {
    try {
      await (navigator as any).share({
        title,
        text,
        url: url || undefined,
      });
      return true;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Navigator share error:', err);
      }
      return false;
    }
  }
  return false;
}

/**
 * Build real OAuth 2.0 authorization URL
 */
export function buildOAuthUrl(
  platform: SocialPlatform,
  clientId?: string,
  redirectUri?: string
): string {
  const config = PLATFORM_CONFIGS[platform];
  const redirect = redirectUri || (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'https://pulsesocial.app/auth/callback');
  const actualClientId = clientId || `pulsesocial-${platform}-client-prod`;
  const state = `state_${platform}_${Date.now()}`;

  const params = new URLSearchParams({
    client_id: actualClientId,
    redirect_uri: redirect,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state: state,
  });

  return `${config.authUrl}?${params.toString()}`;
}
