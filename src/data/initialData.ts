import { SocialAccount, SocialPost, QueueSlot, InboxItem, HeatmapCell, WhatsAppChat, WhatsAppStatusItem, WhatsAppContactStatus } from '../types';

export const INITIAL_ACCOUNTS: SocialAccount[] = [
  {
    id: 'acc-wa-1',
    platform: 'whatsapp',
    name: 'PulseMedia WhatsApp Care',
    handle: '+1 (555) 438-9201',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    followersCount: 15400,
    isConnected: true,
    lastSyncedAt: 'Just now',
    oauthScopes: ['whatsapp_business_messaging', 'whatsapp_business_management'],
    appUrl: 'https://wa.me/15554389201',
    deepLink: 'whatsapp://send?phone=15554389201',
    authType: 'oauth2',
    verified: true,
  },
  {
    id: 'acc-x-1',
    platform: 'twitter',
    name: 'PulseMedia HQ',
    handle: '@pulsemedia_hq',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    followersCount: 48200,
    isConnected: true,
    lastSyncedAt: '10 mins ago',
    oauthScopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    appUrl: 'https://x.com/pulsemedia_hq',
    deepLink: 'twitter://user?screen_name=pulsemedia_hq',
    authType: 'oauth2',
    verified: true,
  },
  {
    id: 'acc-li-1',
    platform: 'linkedin',
    name: 'PulseMedia Global',
    handle: 'pulsemedia-global',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    followersCount: 84600,
    isConnected: true,
    lastSyncedAt: '5 mins ago',
    oauthScopes: ['openid', 'profile', 'email', 'w_member_social'],
    appUrl: 'https://www.linkedin.com/company/pulsemedia-global',
    deepLink: 'linkedin://profile/pulsemedia-global',
    authType: 'oauth2',
    verified: true,
  },
  {
    id: 'acc-ig-1',
    platform: 'instagram',
    name: 'pulsemedia.creators',
    handle: '@pulsemedia.creators',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    followersCount: 112400,
    isConnected: true,
    lastSyncedAt: '12 mins ago',
    oauthScopes: ['instagram_basic', 'instagram_content_publish', 'pages_show_list'],
    appUrl: 'https://www.instagram.com/pulsemedia.creators',
    deepLink: 'instagram://user?username=pulsemedia.creators',
    authType: 'oauth2',
    verified: true,
  },
  {
    id: 'acc-fb-1',
    platform: 'facebook',
    name: 'PulseMedia Official',
    handle: 'PulseMediaOfficialPage',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    followersCount: 63100,
    isConnected: true,
    lastSyncedAt: '1 hour ago',
    oauthScopes: ['pages_manage_posts', 'pages_read_engagement', 'public_profile'],
    appUrl: 'https://www.facebook.com/PulseMediaOfficialPage',
    deepLink: 'fb://page/PulseMediaOfficialPage',
    authType: 'oauth2',
    verified: true,
  },
  {
    id: 'acc-tt-1',
    platform: 'tiktok',
    name: 'pulsemedia_tok',
    handle: '@pulsemedia_tok',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    followersCount: 228900,
    isConnected: true,
    lastSyncedAt: '30 mins ago',
    oauthScopes: ['user.info.basic', 'video.upload', 'video.publish'],
    appUrl: 'https://www.tiktok.com/@pulsemedia_tok',
    deepLink: 'tiktok://user?screen_name=pulsemedia_tok',
    authType: 'oauth2',
    verified: true,
  }
];

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
];

// Helper to compute dates relative to current date (e.g. Sept 2026)
const getRelativeDateStr = (dayOffset: number, hour: number, minute: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const INITIAL_POSTS: SocialPost[] = [
  // Scheduled Posts (Upcoming)
  {
    id: 'post-sched-1',
    content: 'We spent 6 months rebuilding our analytics engine from scratch. Here are the 3 major lessons on real-time data streaming and latency reduction 🧵👇',
    platforms: ['twitter', 'linkedin'],
    targetAccountIds: ['acc-x-1', 'acc-li-1'],
    scheduledFor: getRelativeDateStr(0, 15, 30), // Today 3:30 PM
    status: 'scheduled',
    mediaUrls: ['/src/assets/images/post_tech_product_1790167910952.jpg'],
    firstComment: 'Full engineering deep dive linked on our engineering blog: pulse.dev/blog/analytics-v2',
    tags: ['#Engineering', '#SystemDesign', '#DataPipelines'],
    createdAt: getRelativeDateStr(-1, 10, 0),
    campaign: 'Product Launch Q3',
    author: 'Sarah Lin',
  },
  {
    id: 'post-sched-2',
    content: 'Behind every effortless product experience is a team that refuses to settle for "good enough". Grateful for this crew delivering week after week ✨',
    platforms: ['instagram', 'linkedin', 'facebook'],
    targetAccountIds: ['acc-ig-1', 'acc-li-1', 'acc-fb-1'],
    scheduledFor: getRelativeDateStr(1, 11, 0), // Tomorrow 11:00 AM
    status: 'scheduled',
    mediaUrls: ['/src/assets/images/post_team_collab_1790167923341.jpg'],
    firstComment: '#CompanyCulture #TeamWork #BuildInPublic #Startups',
    tags: ['#StartupCulture', '#Hiring'],
    createdAt: getRelativeDateStr(-2, 14, 0),
    campaign: 'Employer Branding',
    author: 'Alex Rivera',
  },
  {
    id: 'post-sched-3',
    content: 'Mobile-first is no longer a design preference—it is how 78% of your customers make purchasing decisions. How does your mobile funnel convert?',
    platforms: ['twitter', 'linkedin'],
    targetAccountIds: ['acc-x-1', 'acc-li-1'],
    scheduledFor: getRelativeDateStr(2, 9, 15), // In 2 days 9:15 AM
    status: 'scheduled',
    mediaUrls: ['/src/assets/images/post_mobile_app_1790167933558.jpg'],
    tags: ['#MobileUX', '#ConversionRate', '#ECommerce'],
    createdAt: getRelativeDateStr(-1, 16, 0),
    campaign: 'Thought Leadership',
    author: 'Elena Rostova',
  },
  {
    id: 'post-sched-4',
    content: '5 metrics every social media marketer should audit before planning their Q4 content calendar. Bookmark this for your Monday team standup 📊',
    platforms: ['linkedin', 'facebook'],
    targetAccountIds: ['acc-li-1', 'acc-fb-1'],
    scheduledFor: getRelativeDateStr(3, 14, 0),
    status: 'scheduled',
    mediaUrls: ['/src/assets/images/post_minimalist_growth_1790167944457.jpg'],
    tags: ['#SocialMediaStrategy', '#MarketingAnalytics', '#ROI'],
    createdAt: getRelativeDateStr(-3, 11, 20),
    campaign: 'Content Marketing',
    author: 'Sarah Lin',
  },
  {
    id: 'post-draft-1',
    content: 'Sneak peek: Our upcoming multi-channel publishing API is entering private beta next Tuesday. Reply if you want early sandboxed access.',
    platforms: ['twitter'],
    targetAccountIds: ['acc-x-1'],
    scheduledFor: getRelativeDateStr(4, 16, 45),
    status: 'draft',
    tags: ['#API', '#Developers'],
    createdAt: getRelativeDateStr(-1, 8, 30),
    campaign: 'Product Launch Q3',
    author: 'Marcus Vance',
  },
  {
    id: 'post-queue-1',
    content: 'Consistency is not about posting 5 times a day. It is about never giving your audience a reason to doubt your standard of quality.',
    platforms: ['twitter', 'linkedin'],
    targetAccountIds: ['acc-x-1', 'acc-li-1'],
    scheduledFor: getRelativeDateStr(5, 10, 0),
    status: 'queued',
    tags: ['#Branding', '#Leadership'],
    createdAt: getRelativeDateStr(-2, 12, 0),
    author: 'Elena Rostova',
  },

  // Historical Published Posts with Analytics Performance
  {
    id: 'post-pub-1',
    content: 'Announcing our 2026 Industry Benchmark: B2B brands posting 3-4 times per week saw 42% higher retention than daily blasters. Read the full research report.',
    platforms: ['linkedin', 'twitter'],
    targetAccountIds: ['acc-li-1', 'acc-x-1'],
    scheduledFor: getRelativeDateStr(-2, 13, 0),
    publishedAt: getRelativeDateStr(-2, 13, 0),
    status: 'published',
    mediaUrls: ['/src/assets/images/post_minimalist_growth_1790167944457.jpg'],
    performance: {
      impressions: 48920,
      reach: 39400,
      likes: 1840,
      comments: 264,
      shares: 412,
      clicks: 2180,
      engagementRate: 5.1,
      saves: 680,
    },
    tags: ['#Research', '#B2BMarketing', '#SocialStrategy'],
    createdAt: getRelativeDateStr(-4, 9, 0),
    campaign: 'Annual Report',
    author: 'Elena Rostova',
  },
  {
    id: 'post-pub-2',
    content: 'The new mobile experience is officially live! Seamless swipe controls, offline scheduling sync, and instant notification filters.',
    platforms: ['twitter', 'instagram', 'facebook'],
    targetAccountIds: ['acc-x-1', 'acc-ig-1', 'acc-fb-1'],
    scheduledFor: getRelativeDateStr(-4, 10, 30),
    publishedAt: getRelativeDateStr(-4, 10, 30),
    status: 'published',
    mediaUrls: ['/src/assets/images/post_mobile_app_1790167933558.jpg'],
    performance: {
      impressions: 74200,
      reach: 58900,
      likes: 3410,
      comments: 419,
      shares: 890,
      clicks: 3950,
      engagementRate: 6.4,
      saves: 1120,
    },
    tags: ['#ProductUpdate', '#MobileFirst'],
    createdAt: getRelativeDateStr(-6, 11, 0),
    campaign: 'Product Launch Q3',
    author: 'Sarah Lin',
  },
  {
    id: 'post-pub-3',
    content: 'How we decreased customer onboarding time from 14 minutes to 90 seconds by auditing friction points in our sign-up flow.',
    platforms: ['linkedin'],
    targetAccountIds: ['acc-li-1'],
    scheduledFor: getRelativeDateStr(-7, 14, 15),
    publishedAt: getRelativeDateStr(-7, 14, 15),
    status: 'published',
    mediaUrls: ['/src/assets/images/post_tech_product_1790167910952.jpg'],
    performance: {
      impressions: 36400,
      reach: 29800,
      likes: 1290,
      comments: 182,
      shares: 310,
      clicks: 1420,
      engagementRate: 4.9,
      saves: 520,
    },
    tags: ['#ProductDesign', '#GrowthHacking', '#UX'],
    createdAt: getRelativeDateStr(-9, 15, 0),
    campaign: 'Thought Leadership',
    author: 'Alex Rivera',
  },
  {
    id: 'post-pub-4',
    content: 'Friday team spotlight! Meet the core engineers behind our distributed queuing worker fleet. Celebrating 99.99% uptime this quarter ☕🚀',
    platforms: ['instagram', 'facebook'],
    targetAccountIds: ['acc-ig-1', 'acc-fb-1'],
    scheduledFor: getRelativeDateStr(-10, 16, 0),
    publishedAt: getRelativeDateStr(-10, 16, 0),
    status: 'published',
    mediaUrls: ['/src/assets/images/post_team_collab_1790167923341.jpg'],
    performance: {
      impressions: 29100,
      reach: 24300,
      likes: 1850,
      comments: 144,
      shares: 92,
      clicks: 410,
      engagementRate: 7.2,
      saves: 210,
    },
    tags: ['#TeamSpotlight', '#LifeAtPulse'],
    createdAt: getRelativeDateStr(-12, 10, 0),
    campaign: 'Employer Branding',
    author: 'Sarah Lin',
  },
  {
    id: 'post-pub-5',
    content: 'Quick poll for growth leads: What is your primary channel focus for Q4 2026? A) LinkedIn organic B) Short-form video C) Paid Search D) Email newsletter',
    platforms: ['twitter'],
    targetAccountIds: ['acc-x-1'],
    scheduledFor: getRelativeDateStr(-12, 11, 0),
    publishedAt: getRelativeDateStr(-12, 11, 0),
    status: 'published',
    performance: {
      impressions: 21500,
      reach: 17800,
      likes: 640,
      comments: 388,
      shares: 110,
      clicks: 820,
      engagementRate: 5.3,
      saves: 95,
    },
    tags: ['#Poll', '#GrowthMarketing'],
    createdAt: getRelativeDateStr(-13, 9, 30),
    campaign: 'Community Engagement',
    author: 'Marcus Vance',
  },
  {
    id: 'post-pub-6',
    content: 'Stop measuring social media success purely by vanity follower counts. Focus on resonance rate, inbound inquiries, and qualified website referral velocity.',
    platforms: ['linkedin', 'twitter'],
    targetAccountIds: ['acc-li-1', 'acc-x-1'],
    scheduledFor: getRelativeDateStr(-15, 13, 45),
    publishedAt: getRelativeDateStr(-15, 13, 45),
    status: 'published',
    performance: {
      impressions: 54100,
      reach: 42900,
      likes: 2420,
      comments: 312,
      shares: 520,
      clicks: 2930,
      engagementRate: 5.9,
      saves: 840,
    },
    tags: ['#MarketingInsights', '#Strategy'],
    createdAt: getRelativeDateStr(-16, 12, 0),
    campaign: 'Thought Leadership',
    author: 'Elena Rostova',
  }
];

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
    sentiment: 'question',
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
    sentiment: 'question',
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
    content: 'Hey folks, experiencing a quick token re-authorization prompt when connecting our third LinkedIn subsidiary. Who can we reach out to?',
    timestamp: '5 hours ago',
    isResolved: true,
    isStarred: false,
    sentiment: 'urgent',
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
