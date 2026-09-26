import { SocialAccount, SocialPost, QueueSlot, InboxItem, WhatsAppChat, WhatsAppMessage, WhatsAppStatusItem, WhatsAppContactStatus } from '../types';
import { 
  INITIAL_ACCOUNTS, 
  INITIAL_POSTS, 
  INITIAL_QUEUE_SLOTS, 
  INITIAL_INBOX, 
  INITIAL_WHATSAPP_CHATS, 
  INITIAL_MY_STATUSES, 
  INITIAL_CONTACT_STATUSES 
} from '../data/initialData';
import { db, auth } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const STORAGE_KEYS = {
  POSTS: 'pulsesocial_posts_v1',
  ACCOUNTS: 'pulsesocial_accounts_v1',
  QUEUE_SLOTS: 'pulsesocial_queue_slots_v1',
  INBOX: 'pulsesocial_inbox_v1',
  WHATSAPP_CHATS: 'pulsesocial_whatsapp_chats_v1',
  WHATSAPP_MY_STATUSES: 'pulsesocial_whatsapp_my_statuses_v1',
  WHATSAPP_CONTACT_STATUSES: 'pulsesocial_whatsapp_contact_statuses_v1',
};

export const storageService = {
  getPosts: (): SocialPost[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.POSTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
        return INITIAL_POSTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading posts from storage:', e);
      return INITIAL_POSTS;
    }
  },

  savePost: (post: SocialPost): SocialPost[] => {
    const posts = storageService.getPosts();
    const index = posts.findIndex(p => p.id === post.id);
    let updated: SocialPost[];
    if (index >= 0) {
      updated = [...posts];
      updated[index] = post;
    } else {
      updated = [post, ...posts];
    }
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
    return updated;
  },

  deletePost: (id: string): SocialPost[] => {
    const posts = storageService.getPosts();
    const updated = posts.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
    return updated;
  },

  getAccounts: (): SocialAccount[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
        return INITIAL_ACCOUNTS;
      }
      const parsed: SocialAccount[] = JSON.parse(data);
      // Ensure existing accounts have their original app wiring attributes
      const enriched = parsed.map(acc => {
        if (!acc.appUrl || !acc.oauthScopes) {
          const clean = acc.handle.replace(/^@/, '');
          const defaultScopes: Record<string, string[]> = {
            twitter: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
            linkedin: ['openid', 'profile', 'email', 'w_member_social'],
            instagram: ['instagram_basic', 'instagram_content_publish', 'pages_show_list'],
            facebook: ['pages_manage_posts', 'pages_read_engagement', 'public_profile'],
            tiktok: ['user.info.basic', 'video.upload', 'video.publish']
          };
          const defaultAppUrls: Record<string, string> = {
            twitter: `https://x.com/${clean}`,
            linkedin: `https://www.linkedin.com/in/${clean}`,
            instagram: `https://www.instagram.com/${clean}`,
            facebook: `https://www.facebook.com/${clean}`,
            tiktok: `https://www.tiktok.com/@${clean}`
          };
          const defaultDeepLinks: Record<string, string> = {
            twitter: `twitter://user?screen_name=${clean}`,
            linkedin: `linkedin://profile/${clean}`,
            instagram: `instagram://user?username=${clean}`,
            facebook: `fb://page/${clean}`,
            tiktok: `tiktok://user?screen_name=${clean}`
          };
          return {
            ...acc,
            appUrl: acc.appUrl || defaultAppUrls[acc.platform] || `https://${acc.platform}.com`,
            deepLink: acc.deepLink || defaultDeepLinks[acc.platform],
            oauthScopes: acc.oauthScopes || defaultScopes[acc.platform] || ['read', 'write'],
            authType: acc.authType || 'oauth2',
            verified: acc.verified ?? true,
          };
        }
        return acc;
      });
      return enriched;
    } catch (e) {
      return INITIAL_ACCOUNTS;
    }
  },

  toggleAccountConnection: (accountId: string): SocialAccount[] => {
    const accounts = storageService.getAccounts();
    const updated = accounts.map(acc => {
      if (acc.id === accountId) {
        return { ...acc, isConnected: !acc.isConnected };
      }
      return acc;
    });
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
    return updated;
  },

  addAccount: (account: SocialAccount): SocialAccount[] => {
    const accounts = storageService.getAccounts();
    const updated = [...accounts, account];
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
    return updated;
  },

  deleteAccount: (accountId: string): SocialAccount[] => {
    const accounts = storageService.getAccounts();
    const updated = accounts.filter(acc => acc.id !== accountId);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
    return updated;
  },

  clearAllAccounts: (): SocialAccount[] => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify([]));
    return [];
  },

  saveAccounts: (accounts: SocialAccount[]): SocialAccount[] => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    return accounts;
  },

  bulkImportAccounts: (
    newAccounts: SocialAccount[],
    mode: 'merge' | 'replace' | 'skip_duplicates' = 'merge'
  ): { accounts: SocialAccount[]; addedCount: number; updatedCount: number } => {
    const existing = storageService.getAccounts();
    let updatedAccounts: SocialAccount[] = [];
    let addedCount = 0;
    let updatedCount = 0;

    if (mode === 'replace') {
      updatedAccounts = [...newAccounts];
      addedCount = newAccounts.length;
    } else {
      updatedAccounts = [...existing];

      newAccounts.forEach(incoming => {
        const matchIndex = updatedAccounts.findIndex(
          curr => curr.platform === incoming.platform && curr.handle.toLowerCase() === incoming.handle.toLowerCase()
        );

        if (matchIndex >= 0) {
          if (mode === 'merge') {
            // Update existing account details while preserving its existing id
            updatedAccounts[matchIndex] = {
              ...incoming,
              id: updatedAccounts[matchIndex].id,
            };
            updatedCount++;
          }
          // If 'skip_duplicates', do nothing
        } else {
          updatedAccounts.push(incoming);
          addedCount++;
        }
      });
    }

    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updatedAccounts));
    return { accounts: updatedAccounts, addedCount, updatedCount };
  },

  getQueueSlots: (): QueueSlot[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUEUE_SLOTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.QUEUE_SLOTS, JSON.stringify(INITIAL_QUEUE_SLOTS));
        return INITIAL_QUEUE_SLOTS;
      }
      return JSON.parse(data);
    } catch (e) {
      return INITIAL_QUEUE_SLOTS;
    }
  },

  saveQueueSlots: (slots: QueueSlot[]): void => {
    localStorage.setItem(STORAGE_KEYS.QUEUE_SLOTS, JSON.stringify(slots));
  },

  getInbox: (): InboxItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INBOX);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.INBOX, JSON.stringify(INITIAL_INBOX));
        return INITIAL_INBOX;
      }
      return JSON.parse(data);
    } catch (e) {
      return INITIAL_INBOX;
    }
  },

  saveInbox: (inbox: InboxItem[]): void => {
    localStorage.setItem(STORAGE_KEYS.INBOX, JSON.stringify(inbox));
  },

  // WhatsApp Chats & Messages
  getWhatsAppChats: (): WhatsAppChat[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WHATSAPP_CHATS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.WHATSAPP_CHATS, JSON.stringify(INITIAL_WHATSAPP_CHATS));
        return INITIAL_WHATSAPP_CHATS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error loading WhatsApp chats:', e);
      return INITIAL_WHATSAPP_CHATS;
    }
  },

  saveWhatsAppChats: (chats: WhatsAppChat[]): void => {
    localStorage.setItem(STORAGE_KEYS.WHATSAPP_CHATS, JSON.stringify(chats));
    // Optional sync to Firestore if user is authenticated
    if (auth.currentUser) {
      try {
        chats.slice(0, 5).forEach(async (chat) => {
          const chatRef = doc(db, 'users', auth.currentUser!.uid, 'whatsapp_chats', chat.id);
          await setDoc(chatRef, {
            id: chat.id,
            contactName: chat.contactName,
            phoneNumber: chat.phoneNumber,
            avatarUrl: chat.avatarUrl,
            lastMessage: chat.lastMessage,
            lastMessageTimestamp: chat.lastMessageTimestamp,
            unreadCount: chat.unreadCount,
            isPinned: chat.isPinned || false,
            isOnline: chat.isOnline || false,
            category: chat.category || 'customer'
          }, { merge: true }).catch(() => {});
        });
      } catch (err) {
        console.warn('Firestore WhatsApp sync silent notice:', err);
      }
    }
  },

  sendMessage: (
    chatId: string, 
    msgData: {
      text: string;
      mediaUrl?: string;
      mediaType?: 'image' | 'audio' | 'document';
      audioDurationSeconds?: number;
      quotedMessageId?: string;
      quotedMessageText?: string;
      isStatusReply?: boolean;
    }
  ): { updatedChats: WhatsAppChat[]; newMessage: WhatsAppMessage } => {
    const chats = storageService.getWhatsAppChats();
    const chatIndex = chats.findIndex(c => c.id === chatId);
    const newMsg: WhatsAppMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender: 'user',
      text: msgData.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
      mediaUrl: msgData.mediaUrl,
      mediaType: msgData.mediaType,
      audioDurationSeconds: msgData.audioDurationSeconds,
      quotedMessageId: msgData.quotedMessageId,
      quotedMessageText: msgData.quotedMessageText,
      isStatusReply: msgData.isStatusReply
    };

    let updatedChats: WhatsAppChat[];
    if (chatIndex >= 0) {
      const targetChat = chats[chatIndex];
      const updatedChat: WhatsAppChat = {
        ...targetChat,
        lastMessage: msgData.mediaType === 'audio' ? '🎵 Voice note' : (msgData.text || 'Media attachment'),
        lastMessageTimestamp: 'Just now',
        messages: [...targetChat.messages, newMsg]
      };
      updatedChats = [...chats];
      updatedChats[chatIndex] = updatedChat;
      // Re-sort: pinned chats first, then most recent message
      updatedChats.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });
    } else {
      updatedChats = chats;
    }

    storageService.saveWhatsAppChats(updatedChats);
    return { updatedChats, newMessage: newMsg };
  },

  createOrGetChatByPhone: (
    phoneNumber: string, 
    contactName?: string
  ): { chat: WhatsAppChat; isNew: boolean; updatedChats: WhatsAppChat[] } => {
    const chats = storageService.getWhatsAppChats();
    const cleanTarget = phoneNumber.replace(/[^\d+]/g, '');
    const existingIndex = chats.findIndex(c => c.phoneNumber.replace(/[^\d+]/g, '') === cleanTarget);

    if (existingIndex >= 0) {
      return { chat: chats[existingIndex], isNew: false, updatedChats: chats };
    }

    const cleanDisplay = contactName?.trim() || `WhatsApp ${phoneNumber}`;
    const newChat: WhatsAppChat = {
      id: `chat-wa-${Date.now()}`,
      contactName: cleanDisplay,
      phoneNumber: phoneNumber.trim(),
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanDisplay)}&background=25d366&color=fff`,
      lastMessage: 'Conversation created',
      lastMessageTimestamp: 'Just now',
      unreadCount: 0,
      isPinned: false,
      isOnline: true,
      category: 'customer',
      messages: [
        {
          id: `msg-sys-${Date.now()}`,
          sender: 'user',
          text: `Chat started with ${phoneNumber}. Direct message link active.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read'
        }
      ]
    };

    const updatedChats = [newChat, ...chats];
    storageService.saveWhatsAppChats(updatedChats);
    return { chat: newChat, isNew: true, updatedChats };
  },

  // WhatsApp Status Management
  getWhatsAppMyStatuses: (): WhatsAppStatusItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WHATSAPP_MY_STATUSES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.WHATSAPP_MY_STATUSES, JSON.stringify(INITIAL_MY_STATUSES));
        return INITIAL_MY_STATUSES;
      }
      return JSON.parse(data);
    } catch (e) {
      return INITIAL_MY_STATUSES;
    }
  },

  saveWhatsAppMyStatuses: (statuses: WhatsAppStatusItem[]): void => {
    localStorage.setItem(STORAGE_KEYS.WHATSAPP_MY_STATUSES, JSON.stringify(statuses));
    if (auth.currentUser) {
      statuses.forEach(async (st) => {
        try {
          const stRef = doc(db, 'users', auth.currentUser!.uid, 'whatsapp_statuses', st.id);
          await setDoc(stRef, {
            id: st.id,
            type: st.type,
            content: st.content || '',
            mediaUrl: st.mediaUrl || '',
            bgColor: st.bgColor || '',
            fontStyle: st.fontStyle || 'sans',
            createdAt: st.createdAt,
            expiresAt: st.expiresAt,
            viewsCount: st.viewsCount || 0
          }, { merge: true }).catch(() => {});
        } catch (err) {}
      });
    }
  },

  addMyStatus: (
    itemData: Omit<WhatsAppStatusItem, 'id' | 'createdAt' | 'expiresAt' | 'viewsCount'>
  ): WhatsAppStatusItem[] => {
    const current = storageService.getWhatsAppMyStatuses();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const newItem: WhatsAppStatusItem = {
      ...itemData,
      id: `status-my-${Date.now()}`,
      createdAt: now.toISOString(),
      expiresAt,
      viewsCount: 0,
      viewers: []
    };
    const updated = [newItem, ...current];
    storageService.saveWhatsAppMyStatuses(updated);
    return updated;
  },

  deleteMyStatus: (statusId: string): WhatsAppStatusItem[] => {
    const current = storageService.getWhatsAppMyStatuses();
    const updated = current.filter(s => s.id !== statusId);
    storageService.saveWhatsAppMyStatuses(updated);
    return updated;
  },

  getWhatsAppContactStatuses: (): WhatsAppContactStatus[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WHATSAPP_CONTACT_STATUSES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.WHATSAPP_CONTACT_STATUSES, JSON.stringify(INITIAL_CONTACT_STATUSES));
        return INITIAL_CONTACT_STATUSES;
      }
      return JSON.parse(data);
    } catch (e) {
      return INITIAL_CONTACT_STATUSES;
    }
  },

  markContactStatusViewed: (contactId: string): WhatsAppContactStatus[] => {
    const list = storageService.getWhatsAppContactStatuses();
    const updated = list.map(c => {
      if (c.id === contactId) {
        return { ...c, isViewed: true };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.WHATSAPP_CONTACT_STATUSES, JSON.stringify(updated));
    return updated;
  },

  replyToStatus: (
    contactId: string, 
    statusItem: WhatsAppStatusItem, 
    replyText: string
  ): { updatedChats: WhatsAppChat[]; contactName: string } => {
    const contactStatuses = storageService.getWhatsAppContactStatuses();
    const contact = contactStatuses.find(c => c.id === contactId);
    const chats = storageService.getWhatsAppChats();

    const targetPhone = contact?.phoneNumber || '+1 555 0192';
    const targetName = contact?.contactName || 'WhatsApp Contact';
    const cleanPhone = targetPhone.replace(/[^\d+]/g, '');

    let chat = chats.find(c => c.phoneNumber.replace(/[^\d+]/g, '') === cleanPhone);
    let updatedChats: WhatsAppChat[];

    const quoteExcerpt = statusItem.content 
      ? (statusItem.content.length > 50 ? `${statusItem.content.substring(0, 50)}...` : statusItem.content)
      : 'Photo Status';

    const newReplyMsg: WhatsAppMessage = {
      id: `msg-reply-${Date.now()}`,
      sender: 'user',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
      isStatusReply: true,
      quotedMessageText: `Status: "${quoteExcerpt}"`
    };

    if (chat) {
      const updatedChat: WhatsAppChat = {
        ...chat,
        lastMessage: `Replied to status: ${replyText}`,
        lastMessageTimestamp: 'Just now',
        messages: [...chat.messages, newReplyMsg]
      };
      updatedChats = chats.map(c => c.id === chat!.id ? updatedChat : c);
    } else {
      const newChat: WhatsAppChat = {
        id: `chat-wa-${Date.now()}`,
        contactName: targetName,
        phoneNumber: targetPhone,
        avatarUrl: contact?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetName)}&background=25d366&color=fff`,
        lastMessage: `Replied to status: ${replyText}`,
        lastMessageTimestamp: 'Just now',
        unreadCount: 0,
        isPinned: false,
        isOnline: true,
        category: 'customer',
        messages: [newReplyMsg]
      };
      updatedChats = [newChat, ...chats];
    }

    storageService.saveWhatsAppChats(updatedChats);
    return { updatedChats, contactName: targetName };
  },

  resetDemoData: (): void => {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
    localStorage.setItem(STORAGE_KEYS.QUEUE_SLOTS, JSON.stringify(INITIAL_QUEUE_SLOTS));
    localStorage.setItem(STORAGE_KEYS.INBOX, JSON.stringify(INITIAL_INBOX));
    localStorage.setItem(STORAGE_KEYS.WHATSAPP_CHATS, JSON.stringify(INITIAL_WHATSAPP_CHATS));
    localStorage.setItem(STORAGE_KEYS.WHATSAPP_MY_STATUSES, JSON.stringify(INITIAL_MY_STATUSES));
    localStorage.setItem(STORAGE_KEYS.WHATSAPP_CONTACT_STATUSES, JSON.stringify(INITIAL_CONTACT_STATUSES));
  }
};
