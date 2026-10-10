export type SocialPlatform = 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'tiktok' | 'whatsapp';

export type WhatsAppMessageStatus = 'sent' | 'delivered' | 'read' | 'pending';

export interface WhatsAppMessage {
  id: string;
  sender: 'user' | 'contact';
  text: string;
  timestamp: string; // ISO string or display string e.g. "10:42 AM"
  status: WhatsAppMessageStatus;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'document';
  audioDurationSeconds?: number;
  quotedMessageId?: string;
  quotedMessageText?: string;
  isStatusReply?: boolean;
}

export interface WhatsAppChat {
  id: string;
  contactName: string;
  phoneNumber: string; // e.g. "+1 (555) 234-5678"
  avatarUrl: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount: number;
  isPinned?: boolean;
  isMuted?: boolean;
  isOnline?: boolean;
  category?: 'customer' | 'lead' | 'partner' | 'personal';
  messages: WhatsAppMessage[];
}

export interface WhatsAppStatusItem {
  id: string;
  type: 'text' | 'image';
  content?: string; // Text caption or body
  mediaUrl?: string;
  bgColor?: string; // Tailwind background color e.g. "bg-emerald-600"
  fontStyle?: 'sans' | 'serif' | 'mono' | 'handwriting';
  createdAt: string; // ISO string
  expiresAt: string; // ISO string (24 hours after creation)
  viewsCount: number;
  viewers?: Array<{
    name: string;
    avatarUrl: string;
    time: string;
  }>;
  isScheduled?: boolean;
  scheduledFor?: string;
}

export interface WhatsAppContactStatus {
  id: string;
  contactName: string;
  phoneNumber: string;
  avatarUrl: string;
  lastUpdated: string;
  isViewed: boolean;
  items: WhatsAppStatusItem[];
}

export type PostStatus = 'scheduled' | 'published' | 'draft' | 'queued' | 'failed';

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  name: string;
  handle: string;
  avatarUrl: string;
  followersCount: number;
  isConnected: boolean;
  lastSyncedAt: string;
  oauthScopes?: string[];
  appUrl?: string;
  deepLink?: string;
  tokenExpiresAt?: string;
  authType?: 'oauth2' | 'app_connect' | 'api_key';
  verified?: boolean;
  savedLocally?: boolean;
  savedToCloud?: boolean;
  lastSavedAt?: string;
  notes?: string;
  accountType?: 'page' | 'group' | 'profile' | 'channel';
  facebookType?: 'page' | 'group';
  facebookId?: string;
}

export interface PostPerformance {
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  engagementRate: number; // e.g. 4.2 (%)
  saves?: number;
}

export type PostContentType = 'text' | 'photos' | 'video';

export interface PostMediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  name?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:5';
  duration?: number; // duration in seconds for video
}

export interface ChannelDeliveryReceipt {
  channelId: string;
  platform: SocialPlatform;
  channelName: string;
  handle: string;
  reachedAt: string; // ISO timestamp
  status: 'reached' | 'broadcasting' | 'scheduled' | 'failed';
  reachNote?: string;
}

export interface SocialPost {
  id: string;
  postType?: PostContentType;
  content: string;
  platforms: SocialPlatform[];
  targetAccountIds: string[];
  scheduledFor: string; // ISO string
  publishedAt?: string;
  reachedAt?: string; // ISO timestamp when post reached connected channels
  reachedChannels?: string[]; // IDs or handles of channels reached
  deliveryReceipts?: ChannelDeliveryReceipt[];
  status: PostStatus;
  mediaUrls?: string[];
  mediaItems?: PostMediaItem[];
  videoUrl?: string;
  videoThumbnail?: string;
  videoDuration?: number; // in seconds
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:5';
  textBackground?: string; // for styled text posts e.g. 'gradient-purple', 'sunset', etc.
  firstComment?: string;
  tags?: string[];
  performance?: PostPerformance;
  createdAt: string;
  campaign?: string;
  author: string;
}

export interface QueueSlot {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  time: string; // "09:00", "13:30", etc.
  platforms: SocialPlatform[];
  isEnabled: boolean;
}

export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface InboxItem {
  id: string;
  platform: SocialPlatform;
  accountHandle: string;
  senderName: string;
  senderHandle: string;
  senderAvatar: string;
  type: 'comment' | 'mention' | 'dm';
  content: string;
  postExcerpt?: string;
  timestamp: string;
  isResolved: boolean;
  isStarred: boolean;
  sentiment: SentimentType | 'question' | 'urgent';
  sentimentScore?: number; // 0.0 - 1.0 confidence score
  sentimentReason?: string; // Concise explanation of the sentiment analysis
  sentimentAnalyzedAt?: string;
  replies: Array<{
    id: string;
    sender: string;
    content: string;
    timestamp: string;
  }>;
}

export interface AnalyticsSummary {
  totalImpressions: number;
  impressionsDelta: number; // percentage change e.g. +14.8
  totalEngagement: number;
  engagementRate: number;
  engagementRateDelta: number;
  totalClicks: number;
  clicksDelta: number;
  netFollowers: number;
  followersDelta: number;
  totalShares: number;
  sharesDelta: number;
}

export interface TimeSeriesPoint {
  date: string;
  label: string;
  impressions: number;
  engagements: number;
  clicks: number;
}

export interface PlatformStat {
  platform: SocialPlatform;
  name: string;
  followers: number;
  followerGrowth: number;
  postsCount: number;
  avgEngagementRate: number;
  totalImpressions: number;
}

export interface HeatmapCell {
  day: number; // 0-6
  hour: number; // 0-23
  score: number; // 0-100 engagement index
}
