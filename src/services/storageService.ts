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
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

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
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify([]));
        return [];
      }
      const parsed: SocialPost[] = JSON.parse(data);
      // Clean out all legacy demo posts
      const sanitized = parsed.filter(p => {
        if (!p) return false;
        const isDemo = p.id.startsWith('post-sched-') || 
          p.id.startsWith('post-pub-') || 
          p.campaign === 'Product Launch Q3' ||
          p.author === 'Alex Rivera' ||
          p.author === 'Sarah Lin' ||
          p.author === 'Elena Rostova' ||
          p.author === 'Marcus Vance';
        return !isDemo;
      });
      if (sanitized.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(sanitized));
      }
      return sanitized.map(p => ({
        ...p,
        postType: p.postType || (p.videoUrl ? 'video' : (p.mediaUrls && p.mediaUrls.length > 0 ? 'photos' : 'text'))
      }));
    } catch (e) {
      console.error('Error reading posts from storage:', e);
      return [];
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
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify([]));
        return [];
      }
      const parsed: SocialAccount[] = JSON.parse(data);
      // Purge any fake demo accounts
      const sanitized = parsed.filter(a => {
        if (!a) return false;
        const isDemo = a.id === 'acc-x-1' || 
          a.id === 'acc-li-1' || 
          a.id === 'acc-ig-1' || 
          a.id === 'acc-fb-1' || 
          a.id === 'acc-tt-1' || 
          a.id === 'acc-wa-1' ||
          a.handle === '@pulsemedia_hq' || 
          a.handle === 'pulsemedia-global' || 
          a.handle === '@pulsemedia.creators' || 
          a.handle === 'PulseMediaOfficialPage' || 
          a.handle === '@pulsemedia_tok' ||
          a.name === 'PulseMedia HQ' ||
          a.name === 'PulseMedia Global' ||
          a.name === 'pulsemedia.creators' ||
          a.name === 'PulseMedia Official' ||
          a.name === 'pulsemedia_tok' ||
          a.name === 'PulseMedia WhatsApp Care';
        return !isDemo;
      });
      if (sanitized.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(sanitized));
      }

      // Ensure existing accounts have their original app wiring attributes and saved flags
      const enriched = sanitized.map(acc => {
        const clean = acc.handle.replace(/^@/, '');
        const defaultScopes: Record<string, string[]> = {
          twitter: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
          linkedin: ['openid', 'profile', 'email', 'w_member_social'],
          instagram: ['instagram_basic', 'instagram_content_publish', 'pages_show_list'],
          facebook: ['pages_manage_posts', 'pages_read_engagement', 'public_profile'],
          tiktok: ['user.info.basic', 'video.upload', 'video.publish'],
          whatsapp: ['messages.read', 'messages.send', 'status.publish']
        };
        const defaultAppUrls: Record<string, string> = {
          twitter: `https://x.com/${clean}`,
          linkedin: `https://www.linkedin.com/in/${clean}`,
          instagram: `https://www.instagram.com/${clean}`,
          facebook: `https://www.facebook.com/${clean}`,
          tiktok: `https://www.tiktok.com/@${clean}`,
          whatsapp: `https://wa.me/${clean.replace(/[^\d]/g, '')}`
        };
        const defaultDeepLinks: Record<string, string> = {
          twitter: `twitter://user?screen_name=${clean}`,
          linkedin: `linkedin://profile/${clean}`,
          instagram: `instagram://user?username=${clean}`,
          facebook: `fb://page/${clean}`,
          tiktok: `tiktok://user?screen_name=${clean}`,
          whatsapp: `whatsapp://send?phone=${clean.replace(/[^\d+]/g, '')}`
        };

        return {
          ...acc,
          savedLocally: true,
          lastSavedAt: acc.lastSavedAt || acc.lastSyncedAt || 'Saved on app',
          appUrl: acc.appUrl || defaultAppUrls[acc.platform] || `https://${acc.platform}.com`,
          deepLink: acc.deepLink || defaultDeepLinks[acc.platform],
          oauthScopes: acc.oauthScopes || defaultScopes[acc.platform] || ['read', 'write'],
          authType: acc.authType || 'oauth2',
          verified: acc.verified ?? true,
        };
      });
      return enriched;
    } catch (e) {
      console.error('Error loading accounts from storage:', e);
      return [];
    }
  },

  syncAccountsWithFirestore: async (userId: string): Promise<SocialAccount[]> => {
    if (!userId) return storageService.getAccounts();
    const path = `users/${userId}/channels`;
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'channels'));
      const localAccounts = storageService.getAccounts();

      if (!snap.empty) {
        const cloudAccounts: SocialAccount[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          cloudAccounts.push({
            id: data.id || docSnap.id,
            platform: data.platform || 'twitter',
            name: data.name || 'Account',
            handle: data.handle || '@channel',
            avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            followersCount: data.followersCount || 1000,
            isConnected: data.isConnected ?? true,
            lastSyncedAt: data.lastSyncedAt || 'Just now',
            oauthScopes: data.oauthScopes || ['read', 'write'],
            appUrl: data.appUrl,
            deepLink: data.deepLink,
            savedLocally: true,
            savedToCloud: true,
            lastSavedAt: 'Synced from cloud',
            authType: 'oauth2',
            verified: true,
          });
        });

        // Merge cloud accounts with any local custom accounts not yet in cloud
        const merged = [...cloudAccounts];
        localAccounts.forEach(local => {
          if (!merged.some(m => m.id === local.id || (m.platform === local.platform && m.handle.toLowerCase() === local.handle.toLowerCase()))) {
            merged.push({ ...local, savedLocally: true });
          }
        });

        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(merged));
        return merged;
      } else {
        // Cloud has no channels yet; if user has local real accounts, back them up to Firestore
        const nonDemo = localAccounts.filter(a => !a.id.startsWith('acc-') || a.verified);
        if (nonDemo.length > 0) {
          nonDemo.forEach(async (acc) => {
            const accDoc = doc(db, 'users', userId, 'channels', acc.id);
            await setDoc(accDoc, {
              id: acc.id,
              platform: acc.platform,
              name: acc.name,
              handle: acc.handle,
              avatarUrl: acc.avatarUrl,
              followersCount: acc.followersCount,
              isConnected: acc.isConnected,
              lastSyncedAt: acc.lastSyncedAt || new Date().toISOString(),
              oauthScopes: acc.oauthScopes || ['read', 'write'],
              appUrl: acc.appUrl || '',
              deepLink: acc.deepLink || ''
            }, { merge: true }).catch((err) => {
              handleFirestoreError(err, OperationType.WRITE, `users/${userId}/channels/${acc.id}`);
            });
          });
        }
        return localAccounts;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return storageService.getAccounts();
    }
  },

  toggleAccountConnection: (accountId: string, userId?: string): SocialAccount[] => {
    const accounts = storageService.getAccounts();
    const effectiveUid = userId || auth.currentUser?.uid;
    const nowDisplay = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated = accounts.map(acc => {
      if (acc.id === accountId) {
        const nextState = !acc.isConnected;
        const modified: SocialAccount = { 
          ...acc, 
          isConnected: nextState,
          lastSyncedAt: 'Just now',
          savedLocally: true,
          lastSavedAt: `Saved at ${nowDisplay}`
        };

        if (effectiveUid) {
          const docRef = doc(db, 'users', effectiveUid, 'channels', acc.id);
          setDoc(docRef, {
            id: modified.id,
            platform: modified.platform,
            name: modified.name,
            handle: modified.handle,
            avatarUrl: modified.avatarUrl,
            followersCount: modified.followersCount,
            isConnected: modified.isConnected,
            lastSyncedAt: new Date().toISOString(),
            oauthScopes: modified.oauthScopes || ['read', 'write'],
            appUrl: modified.appUrl || '',
            deepLink: modified.deepLink || ''
          }, { merge: true }).catch(err => {
            handleFirestoreError(err, OperationType.UPDATE, `users/${effectiveUid}/channels/${acc.id}`);
          });
        }

        return modified;
      }
      return acc;
    });

    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
    return updated;
  },

  addAccount: (account: SocialAccount, userId?: string): SocialAccount[] => {
    const accounts = storageService.getAccounts();
    const effectiveUid = userId || auth.currentUser?.uid;
    const nowDisplay = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const cleanAccount: SocialAccount = {
      ...account,
      isConnected: true,
      savedLocally: true,
      savedToCloud: !!effectiveUid,
      lastSavedAt: `Saved at ${nowDisplay}`,
      lastSyncedAt: 'Just now'
    };

    // Filter out if duplicate handle on same platform
    const filtered = accounts.filter(
      a => !(a.platform === cleanAccount.platform && a.handle.toLowerCase() === cleanAccount.handle.toLowerCase())
    );
    const updated = [cleanAccount, ...filtered];
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));

    if (effectiveUid) {
      const docRef = doc(db, 'users', effectiveUid, 'channels', cleanAccount.id);
      setDoc(docRef, {
        id: cleanAccount.id,
        platform: cleanAccount.platform,
        name: cleanAccount.name,
        handle: cleanAccount.handle,
        avatarUrl: cleanAccount.avatarUrl,
        followersCount: cleanAccount.followersCount,
        isConnected: true,
        lastSyncedAt: new Date().toISOString(),
        oauthScopes: cleanAccount.oauthScopes || ['read', 'write'],
        appUrl: cleanAccount.appUrl || '',
        deepLink: cleanAccount.deepLink || ''
      }, { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.CREATE, `users/${effectiveUid}/channels/${cleanAccount.id}`);
      });
    }

    return updated;
  },

  saveAccount: (account: SocialAccount, userId?: string): SocialAccount[] => {
    const accounts = storageService.getAccounts();
    const effectiveUid = userId || auth.currentUser?.uid;
    const nowDisplay = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedAccount: SocialAccount = {
      ...account,
      savedLocally: true,
      savedToCloud: !!effectiveUid,
      lastSavedAt: `Saved at ${nowDisplay}`
    };

    const index = accounts.findIndex(a => a.id === account.id);
    let updated: SocialAccount[];
    if (index >= 0) {
      updated = [...accounts];
      updated[index] = updatedAccount;
    } else {
      updated = [updatedAccount, ...accounts];
    }

    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));

    if (effectiveUid) {
      const docRef = doc(db, 'users', effectiveUid, 'channels', updatedAccount.id);
      setDoc(docRef, {
        id: updatedAccount.id,
        platform: updatedAccount.platform,
        name: updatedAccount.name,
        handle: updatedAccount.handle,
        avatarUrl: updatedAccount.avatarUrl,
        followersCount: updatedAccount.followersCount,
        isConnected: updatedAccount.isConnected,
        lastSyncedAt: new Date().toISOString(),
        oauthScopes: updatedAccount.oauthScopes || ['read', 'write'],
        appUrl: updatedAccount.appUrl || '',
        deepLink: updatedAccount.deepLink || ''
      }, { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `users/${effectiveUid}/channels/${updatedAccount.id}`);
      });
    }

    return updated;
  },

  deleteAccount: (accountId: string, userId?: string): SocialAccount[] => {
    const accounts = storageService.getAccounts();
    const effectiveUid = userId || auth.currentUser?.uid;
    const updated = accounts.filter(acc => acc.id !== accountId);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));

    if (effectiveUid) {
      const docRef = doc(db, 'users', effectiveUid, 'channels', accountId);
      deleteDoc(docRef).catch(err => {
        handleFirestoreError(err, OperationType.DELETE, `users/${effectiveUid}/channels/${accountId}`);
      });
    }

    return updated;
  },

  clearAllAccounts: (userId?: string): SocialAccount[] => {
    const existing = storageService.getAccounts();
    const effectiveUid = userId || auth.currentUser?.uid;
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify([]));

    if (effectiveUid && existing.length > 0) {
      existing.forEach(acc => {
        const docRef = doc(db, 'users', effectiveUid, 'channels', acc.id);
        deleteDoc(docRef).catch(err => {
          handleFirestoreError(err, OperationType.DELETE, `users/${effectiveUid}/channels/${acc.id}`);
        });
      });
    }

    return [];
  },

  saveAccounts: (accounts: SocialAccount[], userId?: string): SocialAccount[] => {
    const effectiveUid = userId || auth.currentUser?.uid;
    const nowDisplay = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const enriched = accounts.map(a => ({
      ...a,
      savedLocally: true,
      savedToCloud: !!effectiveUid,
      lastSavedAt: `Saved at ${nowDisplay}`
    }));

    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(enriched));

    if (effectiveUid && enriched.length > 0) {
      enriched.forEach(acc => {
        const docRef = doc(db, 'users', effectiveUid, 'channels', acc.id);
        setDoc(docRef, {
          id: acc.id,
          platform: acc.platform,
          name: acc.name,
          handle: acc.handle,
          avatarUrl: acc.avatarUrl,
          followersCount: acc.followersCount,
          isConnected: acc.isConnected,
          lastSyncedAt: new Date().toISOString(),
          oauthScopes: acc.oauthScopes || ['read', 'write'],
          appUrl: acc.appUrl || '',
          deepLink: acc.deepLink || ''
        }, { merge: true }).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `users/${effectiveUid}/channels/${acc.id}`);
        });
      });
    }

    return enriched;
  },

  bulkImportAccounts: (
    newAccounts: SocialAccount[],
    mode: 'merge' | 'replace' | 'skip_duplicates' = 'merge',
    userId?: string
  ): { accounts: SocialAccount[]; addedCount: number; updatedCount: number } => {
    const existing = storageService.getAccounts();
    const effectiveUid = userId || auth.currentUser?.uid;
    const nowDisplay = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let updatedAccounts: SocialAccount[] = [];
    let addedCount = 0;
    let updatedCount = 0;

    const prepareAccount = (acc: SocialAccount) => ({
      ...acc,
      savedLocally: true,
      savedToCloud: !!effectiveUid,
      lastSavedAt: `Saved at ${nowDisplay}`
    });

    if (mode === 'replace') {
      updatedAccounts = newAccounts.map(prepareAccount);
      addedCount = newAccounts.length;
    } else {
      updatedAccounts = [...existing];

      newAccounts.forEach(incoming => {
        const matchIndex = updatedAccounts.findIndex(
          curr => curr.platform === incoming.platform && curr.handle.toLowerCase() === incoming.handle.toLowerCase()
        );

        if (matchIndex >= 0) {
          if (mode === 'merge') {
            updatedAccounts[matchIndex] = prepareAccount({
              ...incoming,
              id: updatedAccounts[matchIndex].id,
            });
            updatedCount++;
          }
        } else {
          updatedAccounts.push(prepareAccount(incoming));
          addedCount++;
        }
      });
    }

    storageService.saveAccounts(updatedAccounts, effectiveUid);
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
      const parsed: InboxItem[] = JSON.parse(data);
      // Ensure every item has a normalized positive/neutral/negative sentiment tag
      const normalized = parsed.map(item => {
        let sent: 'positive' | 'neutral' | 'negative' = 'neutral';
        if (item.sentiment === 'positive') sent = 'positive';
        else if (item.sentiment === 'negative' || (item.sentiment as string) === 'urgent') sent = 'negative';
        else sent = 'neutral';
        return {
          ...item,
          sentiment: sent,
        };
      });
      return normalized;
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
