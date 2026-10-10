import { SocialAccount, SocialPost, QueueSlot, InboxItem, HeatmapCell, WhatsAppChat, WhatsAppStatusItem, WhatsAppContactStatus } from '../types';

export const INITIAL_ACCOUNTS: SocialAccount[] = [];

// Reference generated image paths directly
export const MEDIA_PRESETS = [
  {
    id: 'media-1',
    title: 'SaaS Dashboard Laptop',
    url: '/src/assets/images/post_tech_product_1790167910952.jpg',
    category: 'Product',
  },
  {
    id: 'media-2',
    title: 'Creative Team Studio',
    url: '/src/assets/images/post_team_collab_1790167923341.jpg',
    category: 'Culture',
  },
  {
    id: 'media-3',
    title: 'Mobile App Showcase',
    url: '/src/assets/images/post_mobile_app_1790167933558.jpg',
    category: 'Mobile',
  },
  {
    id: 'media-4',
    title: 'Growth Analytics 3D',
    url: '/src/assets/images/post_minimalist_growth_1790167944457.jpg',
    category: 'Metrics',
  },
  {
    id: 'media-5',
    title: 'Remote Workspace & Coffee',
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
    category: 'Workspace',
  },
  {
    id: 'media-6',
    title: 'Editorial Gradient Card',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    category: 'Abstract',
  }
];

export interface VideoPreset {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  duration: number; // seconds
  aspectRatio: '16:9' | '9:16' | '1:1';
  category: string;
}

export const VIDEO_PRESETS: VideoPreset[] = [
  {
    id: 'vid-1',
    title: 'Product Walkthrough Teaser',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    duration: 15,
    aspectRatio: '16:9',
    category: 'Product Promo',
  },
  {
    id: 'vid-2',
    title: 'Vertical Reel & Short (9:16)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1616469829941-c7200edec809?w=600&auto=format&fit=crop&q=80',
    duration: 15,
    aspectRatio: '9:16',
    category: 'Reels / Shorts',
  },
  {
    id: 'vid-3',
    title: 'Creative Studio Behind-The-Scenes',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
    duration: 60,
    aspectRatio: '16:9',
    category: 'Team & Culture',
  },
  {
    id: 'vid-4',
    title: 'Growth Masterclass & Strategy',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    duration: 45,
    aspectRatio: '16:9',
    category: 'Education',
  },
];

// Helper to compute dates relative to current date (e.g. Sept 2026)
const getRelativeDateStr = (dayOffset: number, hour: number, minute: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const INITIAL_POSTS: SocialPost[] = [];

export const INITIAL_QUEUE_SLOTS: QueueSlot[] = [
  { id: 'slot-1', dayOfWeek: 1, time: '09:00', platforms: ['twitter', 'linkedin'], isEnabled: true },
  { id: 'slot-2', dayOfWeek: 1, time: '14:30', platforms: ['instagram', 'facebook'], isEnabled: true },
  { id: 'slot-3', dayOfWeek: 2, time: '10:15', platforms: ['linkedin'], isEnabled: true },
  { id: 'slot-4', dayOfWeek: 2, time: '16:00', platforms: ['twitter'], isEnabled: true },
  { id: 'slot-5', dayOfWeek: 3, time: '09:30', platforms: ['twitter', 'linkedin', 'instagram'], isEnabled: true },
  { id: 'slot-6', dayOfWeek: 4, time: '11:00', platforms: ['linkedin', 'facebook'], isEnabled: true },
  { id: 'slot-7', dayOfWeek: 4, time: '15:30', platforms: ['twitter', 'tiktok'], isEnabled: true },
  { id: 'slot-8', dayOfWeek: 5, time: '10:00', platforms: ['twitter', 'linkedin', 'instagram'], isEnabled: true },
  { id: 'slot-9', dayOfWeek: 5, time: '14:00', platforms: ['facebook', 'tiktok'], isEnabled: false },
];

export const INITIAL_INBOX: InboxItem[] = [
  {
    id: 'inbox-wa-1',
    platform: 'whatsapp',
    accountHandle: '+1 (555) 438-9201',
    senderName: 'Sarah Jenkins',
    senderHandle: '+1 (415) 890-2134',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    type: 'dm',
    content: 'Could you share a quick 24h WhatsApp status update announcing our design system webinar?',
    timestamp: '15 mins ago',
    isResolved: false,
    isStarred: true,
    sentiment: 'positive',
    sentimentScore: 0.94,
    sentimentReason: 'User expresses enthusiasm for collaborative WhatsApp broadcast announcement.',
    sentimentAnalyzedAt: 'Just now',
    replies: [
      {
        id: 'rep-wa-1',
        sender: 'PulseMedia WhatsApp Care',
        content: 'Awesome. Posting the Figma webinar status right now!',
        timestamp: '10 mins ago',
      }
    ]
  },
  {
    id: 'inbox-1',
    platform: 'linkedin',
    accountHandle: 'pulsemedia-global',
    senderName: 'David Chen',
    senderHandle: '@davidchen_tech',
    senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    type: 'comment',
    content: 'This benchmark resonates with what we observed in our engineering team! Did you control for industry vertical in the retention sample?',
    postExcerpt: 'Announcing our 2026 Industry Benchmark: B2B brands posting 3-4 times per week...',
    timestamp: '25 mins ago',
    isResolved: false,
    isStarred: true,
    sentiment: 'positive',
    sentimentScore: 0.91,
    sentimentReason: 'Positive endorsement of industry benchmark findings with technical inquiry.',
    sentimentAnalyzedAt: 'Just now',
    replies: [
      {
        id: 'rep-1',
        sender: 'PulseMedia Global',
        content: 'Hi David! Yes, we segmented tech SaaS, professional services, and hardware manufacturing. Tech SaaS showed the sharpest difference (+51%).',
        timestamp: '10 mins ago',
      }
    ]
  },
  {
    id: 'inbox-2',
    platform: 'twitter',
    accountHandle: '@pulsemedia_hq',
    senderName: 'Maya Thorne',
    senderHandle: '@mayathorne',
    senderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    type: 'mention',
    content: 'Just tested the new calendar queue feature on @pulsemedia_hq — the time slot auto-allocation saved our team at least 3 hours this week 🔥',
    timestamp: '1 hour ago',
    isResolved: false,
    isStarred: false,
    sentiment: 'positive',
    sentimentScore: 0.98,
    sentimentReason: 'Strong enthusiasm and delight over 3-hour team time savings from calendar queue.',
    sentimentAnalyzedAt: 'Just now',
    replies: []
  },
  {
    id: 'inbox-3',
    platform: 'instagram',
    accountHandle: '@pulsemedia.creators',
    senderName: 'Jordan Taylor',
    senderHandle: '@jordant_design',
    senderAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    type: 'comment',
    content: 'Are you planning to support multi-image carousel scheduling for Instagram grid previews soon?',
    postExcerpt: 'Behind every effortless product experience is a team that refuses...',
    timestamp: '3 hours ago',
    isResolved: false,
    isStarred: false,
    sentiment: 'neutral',
    sentimentScore: 0.89,
    sentimentReason: 'Objective feature roadmap inquiry regarding multi-image Instagram carousels.',
    sentimentAnalyzedAt: 'Just now',
    replies: []
  },
  {
    id: 'inbox-4',
    platform: 'twitter',
    accountHandle: '@pulsemedia_hq',
    senderName: 'Liam O’Connor',
    senderHandle: '@liamoconnor',
    senderAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&auto=format&fit=crop&q=80',
    type: 'dm',
    content: 'Hey folks, experiencing an unexpected token re-authorization prompt and failure when connecting our third LinkedIn subsidiary. Who can we reach out to?',
    timestamp: '5 hours ago',
    isResolved: false,
    isStarred: false,
    sentiment: 'negative',
    sentimentScore: 0.92,
    sentimentReason: 'Reported authentication failure and blocker connecting subsidiary account.',
    sentimentAnalyzedAt: 'Just now',
    replies: [
      {
        id: 'rep-2',
        sender: 'PulseMedia HQ',
        content: 'Hi Liam, our team sent you a direct link to re-verify OAuth subsidiary permissions. Let us know if that clears the token state!',
        timestamp: '4 hours ago',
      }
    ]
  },
  {
    id: 'inbox-5',
    platform: 'facebook',
    accountHandle: 'PulseMediaOfficialPage',
    senderName: 'Carlos Ramirez',
    senderHandle: '@carlos_r_biz',
    senderAvatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=100&auto=format&fit=crop&q=80',
    type: 'comment',
    content: 'Terrific insights as always. Looking forward to the downloadable executive summary deck.',
    postExcerpt: '5 metrics every social media marketer should audit before planning their Q4...',
    timestamp: 'Yesterday',
    isResolved: true,
    isStarred: false,
    sentiment: 'positive',
    sentimentScore: 0.95,
    sentimentReason: 'Praise for publication quality and anticipation for research deck.',
    sentimentAnalyzedAt: 'Just now',
    replies: []
  },
  {
    id: 'inbox-6',
    platform: 'twitter',
    accountHandle: '@pulsemedia_hq',
    senderName: 'Elena Rostova',
    senderHandle: '@elena_rostova',
    senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    type: 'mention',
    content: 'Encountered a video encoding timeout failure twice this morning while scheduling our product release teaser. Really frustrated by this disruption!',
    timestamp: 'Yesterday',
    isResolved: false,
    isStarred: true,
    sentiment: 'negative',
    sentimentScore: 0.97,
    sentimentReason: 'Customer expresses strong frustration due to video encoding timeout failures.',
    sentimentAnalyzedAt: 'Just now',
    replies: []
  }
];

// Generates 7x24 heatmap of best times to post (0=Sunday to 6=Saturday, 0-23 hours)
export const generateHeatmapData = (): HeatmapCell[] => {
  const cells: HeatmapCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      // Realistic social engagement patterns: Peak Tuesday-Thursday 9am-11am and 1pm-4pm
      let score = 10 + Math.floor(Math.sin((hour - 5) / 3) * 20);
      if (hour >= 8 && hour <= 17) {
        score += 35;
      }
      if (day >= 1 && day <= 4) {
        // Weekdays higher
        score += 25;
        if ((hour >= 9 && hour <= 11) || (hour >= 13 && hour <= 15)) {
          score += 25; // Peak sweet spots
        }
      } else if (day === 5) {
        // Friday peaks morning
        if (hour >= 9 && hour <= 12) score += 28;
      } else {
        // Weekends peak afternoon/evening
        if (hour >= 11 && hour <= 18) score += 20;
      }
      score = Math.max(5, Math.min(98, score + ((day * 7 + hour * 13) % 15) - 7));
      cells.push({ day, hour, score });
    }
  }
  return cells;
};

export const INITIAL_WHATSAPP_CHATS: WhatsAppChat[] = [
  {
    id: 'chat-1',
    contactName: 'Sarah Jenkins',
    phoneNumber: '+1 (415) 890-2134',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Awesome. Posting the Figma webinar status right now!',
    lastMessageTimestamp: '10:21 AM',
    unreadCount: 0,
    isPinned: true,
    isOnline: true,
    category: 'customer',
    messages: [
      {
        id: 'msg-1',
        sender: 'contact',
        text: 'Hey team! I saw the new social campaign graphics on PulseSocial. They look incredible! 🔥',
        timestamp: '10:14 AM',
        status: 'read'
      },
      {
        id: 'msg-2',
        sender: 'user',
        text: 'Thanks Sarah! We scheduled them for Thursday 9 AM across X, LinkedIn and Instagram.',
        timestamp: '10:15 AM',
        status: 'read'
      },
      {
        id: 'msg-3',
        sender: 'contact',
        text: 'Could you also share a quick 24h WhatsApp status update announcing our design system webinar?',
        timestamp: '10:18 AM',
        status: 'read'
      },
      {
        id: 'msg-4',
        sender: 'user',
        text: 'Awesome. Posting the Figma webinar status right now!',
        timestamp: '10:21 AM',
        status: 'read'
      }
    ]
  },
  {
    id: 'chat-2',
    contactName: 'Alex Rivera (Tech Lead)',
    phoneNumber: '+44 7700 900341',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Let me know once you listen through the deployment note!',
    lastMessageTimestamp: '09:52 AM',
    unreadCount: 2,
    isPinned: true,
    isOnline: false,
    category: 'lead',
    messages: [
      {
        id: 'msg-201',
        sender: 'contact',
        text: 'Hi! Quick question regarding our API rate limits for the upcoming product launch.',
        timestamp: '09:45 AM',
        status: 'read'
      },
      {
        id: 'msg-202',
        sender: 'user',
        text: 'Hey Alex, all tier-1 channels have 10,000 req/min verified and ready.',
        timestamp: '09:48 AM',
        status: 'read'
      },
      {
        id: 'msg-203',
        sender: 'contact',
        text: 'Voice note briefing on the Cloud Run deployment checklist 👇',
        timestamp: '09:50 AM',
        status: 'read',
        mediaType: 'audio',
        audioDurationSeconds: 18
      },
      {
        id: 'msg-204',
        sender: 'contact',
        text: 'Let me know once you listen through the deployment note!',
        timestamp: '09:52 AM',
        status: 'delivered'
      }
    ]
  },
  {
    id: 'chat-3',
    contactName: 'Elena Rostova',
    phoneNumber: '+49 151 2345678',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Sounds great! Sending our media kit as well.',
    lastMessageTimestamp: 'Yesterday',
    unreadCount: 0,
    isPinned: false,
    isOnline: true,
    category: 'partner',
    messages: [
      {
        id: 'msg-301',
        sender: 'contact',
        text: 'Loved your WhatsApp status story about the new product launch! Can we cross-promote next Tuesday?',
        timestamp: 'Yesterday 3:15 PM',
        status: 'read'
      },
      {
        id: 'msg-302',
        sender: 'user',
        text: 'Hi Elena! Absolutely, let\'s coordinate the copy on Friday.',
        timestamp: 'Yesterday 3:20 PM',
        status: 'read'
      },
      {
        id: 'msg-303',
        sender: 'contact',
        text: 'Sounds great! Sending our media kit as well.',
        timestamp: 'Yesterday 3:22 PM',
        status: 'read'
      }
    ]
  },
  {
    id: 'chat-4',
    contactName: 'Marcus Chen',
    phoneNumber: '+1 (555) 789-0123',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Yes! Direct click-to-chat, templates, and 24h status broadcasts are now fully supported.',
    lastMessageTimestamp: 'Sep 23',
    unreadCount: 0,
    isPinned: false,
    isOnline: false,
    category: 'customer',
    messages: [
      {
        id: 'msg-401',
        sender: 'contact',
        text: 'New enterprise client asking if we support WhatsApp Business direct click-to-chat and status broadcast.',
        timestamp: 'Sep 23 11:10 AM',
        status: 'read'
      },
      {
        id: 'msg-402',
        sender: 'user',
        text: 'Yes! Direct click-to-chat, templates, and 24h status broadcasts are now fully supported.',
        timestamp: 'Sep 23 11:15 AM',
        status: 'read'
      }
    ]
  },
  {
    id: 'chat-5',
    contactName: 'David Kim',
    phoneNumber: '+82 10-1234-5678',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Sweet, see you in the chat room David!',
    lastMessageTimestamp: 'Sep 22',
    unreadCount: 0,
    isPinned: false,
    isOnline: false,
    category: 'lead',
    messages: [
      {
        id: 'msg-501',
        sender: 'contact',
        text: 'Replied to your WhatsApp status: "Count me in for the live AMA this Friday!"',
        timestamp: 'Sep 22 4:12 PM',
        status: 'read',
        isStatusReply: true
      },
      {
        id: 'msg-502',
        sender: 'user',
        text: 'Sweet, see you in the chat room David!',
        timestamp: 'Sep 22 4:15 PM',
        status: 'read'
      }
    ]
  }
];

export const INITIAL_MY_STATUSES: WhatsAppStatusItem[] = [
  {
    id: 'status-my-1',
    type: 'text',
    content: '🚀 Big news: PulseSocial v2.4 with native WhatsApp messenger features is live! Send direct messages & post 24h statuses seamlessly.',
    bgColor: 'bg-emerald-600',
    fontStyle: 'sans',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
    viewsCount: 42,
    viewers: [
      { name: 'Sarah Jenkins', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', time: '15m ago' },
      { name: 'Alex Rivera', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', time: '40m ago' },
      { name: 'Elena Rostova', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', time: '1h ago' },
      { name: 'Marcus Chen', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', time: '1h 20m ago' },
      { name: 'David Kim', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', time: '1h 45m ago' },
    ]
  },
  {
    id: 'status-my-2',
    type: 'image',
    mediaUrl: '/src/assets/images/post_tech_product_1790167910952.jpg',
    content: 'Behind the scenes in the command center 💻 Multi-channel analytics hitting record highs this week!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 19).toISOString(),
    viewsCount: 68,
    viewers: [
      { name: 'Sarah Jenkins', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', time: '2h ago' },
      { name: 'Marcus Chen', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', time: '3h ago' },
    ]
  }
];

export const INITIAL_CONTACT_STATUSES: WhatsAppContactStatus[] = [
  {
    id: 'c-status-1',
    contactName: 'Sarah Jenkins',
    phoneNumber: '+1 (415) 890-2134',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    lastUpdated: '25m ago',
    isViewed: false,
    items: [
      {
        id: 'item-sj-1',
        type: 'image',
        mediaUrl: '/src/assets/images/post_team_collab_1790167923341.jpg',
        content: 'Figma design system revamp finalized! Ready for production 🎨',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 23).toISOString(),
        viewsCount: 19
      },
      {
        id: 'item-sj-2',
        type: 'text',
        content: 'What feature are you most excited for in next sprint? Drop me a direct reply 👇',
        bgColor: 'bg-indigo-600',
        fontStyle: 'sans',
        createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 23.5).toISOString(),
        viewsCount: 14
      }
    ]
  },
  {
    id: 'c-status-2',
    contactName: 'Alex Rivera (Tech Lead)',
    phoneNumber: '+44 7700 900341',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    lastUpdated: '1h ago',
    isViewed: false,
    items: [
      {
        id: 'item-ar-1',
        type: 'text',
        content: 'Weekend deployment complete! Zero downtime migration achieved ⚡ Proud of our engineering squad.',
        bgColor: 'bg-purple-700',
        fontStyle: 'mono',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 23).toISOString(),
        viewsCount: 31
      }
    ]
  },
  {
    id: 'c-status-3',
    contactName: 'Elena Rostova',
    phoneNumber: '+49 151 2345678',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastUpdated: '3h ago',
    isViewed: true,
    items: [
      {
        id: 'item-er-1',
        type: 'image',
        mediaUrl: '/src/assets/images/post_minimalist_growth_1790167944457.jpg',
        content: 'Growth metrics conference in Berlin! Connecting with amazing operators 🇩🇪',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 21).toISOString(),
        viewsCount: 54
      },
      {
        id: 'item-er-2',
        type: 'text',
        content: 'Key takeaway today: Audience trust and consistency compound faster than vanity clicks.',
        bgColor: 'bg-rose-600',
        fontStyle: 'serif',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 21.5).toISOString(),
        viewsCount: 48
      }
    ]
  },
  {
    id: 'c-status-4',
    contactName: 'David Kim',
    phoneNumber: '+82 10-1234-5678',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    lastUpdated: '5h ago',
    isViewed: true,
    items: [
      {
        id: 'item-dk-1',
        type: 'text',
        content: 'Hosting a community AMA on Twitter Spaces + WhatsApp broadcast at 4 PM GMT 🎙️ Don\'t miss it!',
        bgColor: 'bg-amber-600',
        fontStyle: 'sans',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 19).toISOString(),
        viewsCount: 62
      }
    ]
  }
];
