import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Sparkles, 
  Phone, 
  Search, 
  Plus, 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  MicOff,
  Check, 
  CheckCheck, 
  Pin, 
  MoreVertical, 
  ExternalLink, 
  Play, 
  Pause, 
  Volume2, 
  Clock, 
  Eye, 
  Users, 
  Filter, 
  Image as ImageIcon, 
  Share2, 
  Trash2,
  Calendar,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { 
  WhatsAppChat, 
  WhatsAppMessage, 
  WhatsAppStatusItem, 
  WhatsAppContactStatus,
  SocialAccount
} from '../../types';
import { storageService } from '../../services/storageService';
import { DirectMessageLauncherModal } from './DirectMessageLauncherModal';
import { CreateStatusModal } from './CreateStatusModal';
import { WhatsAppStatusViewerModal } from './WhatsAppStatusViewerModal';
import { WhatsAppStatusViewsModal } from './WhatsAppStatusViewsModal';
import { WhatsAppBroadcastModal } from './WhatsAppBroadcastModal';
import { WhatsAppLinkModal } from './WhatsAppLinkModal';
import { MEDIA_PRESETS } from '../../data/initialData';
import { auth } from '../../lib/firebase';

interface WhatsAppManagerProps {
  onOpenComposer?: (initialDate?: string) => void;
}

const CANNED_REPLIES = [
  "Thank you for reaching out! How can we assist you today?",
  "Yes! All features on PulseSocial are fully available.",
  "Here is our campaign guide and rate card 📄",
  "Great, scheduling this for our team right now! 🚀",
  "Could you share a quick confirmation when you have a moment?"
];

const EMOJI_LIST = ['👍', '❤️', '🔥', '🚀', '😊', '🙏', '🎉', '👏', '✨', '💯', '👌', '⭐'];

export const WhatsAppManager: React.FC<WhatsAppManagerProps> = ({ onOpenComposer }) => {
  // Tabs: 'chats' (Direct Messages) vs 'status' (Status Updates)
  const [activeSubTab, setActiveSubTab] = useState<'chats' | 'status'>('chats');

  // Chats state
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [chatCategoryFilter, setChatCategoryFilter] = useState<'all' | 'customer' | 'lead' | 'partner'>('all');
  
  // Message input state
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Statuses state
  const [myStatuses, setMyStatuses] = useState<WhatsAppStatusItem[]>([]);
  const [contactStatuses, setContactStatuses] = useState<WhatsAppContactStatus[]>([]);

  // Modals state
  const [isDirectLauncherOpen, setIsDirectLauncherOpen] = useState(false);
  const [isCreateStatusOpen, setIsCreateStatusOpen] = useState(false);
  const [isStatusViewerOpen, setIsStatusViewerOpen] = useState(false);
  const [statusViewerContactIndex, setStatusViewerContactIndex] = useState(0);
  const [inspectingMyStatus, setInspectingMyStatus] = useState<WhatsAppStatusItem | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<SocialAccount[]>(() => storageService.getAccounts());
  const linkedWhatsApp = accounts.find(a => a.platform === 'whatsapp' && a.isConnected);

  const handleAccountLinked = (account: SocialAccount) => {
    const updated = storageService.saveAccount(account, auth.currentUser?.uid);
    setAccounts(updated);
    showToast(`Real WhatsApp account (${account.handle}) linked successfully!`);
  };

  // Audio playback simulation state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Toast notice
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load initial data
  useEffect(() => {
    const loadedChats = storageService.getWhatsAppChats();
    setChats(loadedChats);
    if (loadedChats.length > 0 && !selectedChatId) {
      setSelectedChatId(loadedChats[0].id);
    }
    setMyStatuses(storageService.getWhatsAppMyStatuses());
    setContactStatuses(storageService.getWhatsAppContactStatuses());
  }, []);

  // Scroll to bottom of chat on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, selectedChatId]);

  // Audio recording simulation timer
  useEffect(() => {
    let timer: any;
    if (isRecordingAudio) {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecordingAudio]);

  const activeChat = chats.find(c => c.id === selectedChatId) || chats[0];

  // Filtered chats list
  const filteredChats = chats.filter(c => {
    if (chatCategoryFilter !== 'all' && c.category !== chatCategoryFilter) return false;
    if (chatSearchQuery.trim()) {
      const q = chatSearchQuery.toLowerCase();
      return (
        c.contactName.toLowerCase().includes(q) ||
        c.phoneNumber.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handlers for Direct Messages
  const handleSendMessage = (customText?: string, mediaProps?: { mediaUrl?: string; mediaType?: 'image' | 'audio' | 'document'; audioDurationSeconds?: number }) => {
    const textToSend = customText !== undefined ? customText : messageInput.trim();
    if (!textToSend && !mediaProps?.mediaUrl && !mediaProps?.mediaType) return;
    if (!activeChat) return;

    const { updatedChats } = storageService.sendMessage(activeChat.id, {
      text: textToSend,
      mediaUrl: mediaProps?.mediaUrl,
      mediaType: mediaProps?.mediaType,
      audioDurationSeconds: mediaProps?.audioDurationSeconds
    });

    setChats(updatedChats);
    setMessageInput('');
    setShowEmojiPicker(false);
  };

  const handleFinishVoiceNote = () => {
    if (recordingSeconds > 0 && activeChat) {
      handleSendMessage('', {
        mediaType: 'audio',
        audioDurationSeconds: recordingSeconds,
      });
      showToast('Voice note dispatched!');
    }
    setIsRecordingAudio(false);
  };

  const handleSendPresetImage = () => {
    const preset = MEDIA_PRESETS[Math.floor(Math.random() * MEDIA_PRESETS.length)];
    handleSendMessage('Shared promotional graphic from PulseSocial gallery', {
      mediaUrl: preset.url,
      mediaType: 'image'
    });
    showToast('Photo attachment sent.');
  };

  // Launch In-App Chat from Direct Phone Number
  const handleLaunchInAppChat = (phoneNumber: string, contactName?: string, initialMessage?: string) => {
    const { chat, updatedChats } = storageService.createOrGetChatByPhone(phoneNumber, contactName);
    setChats(updatedChats);
    setSelectedChatId(chat.id);
    setActiveSubTab('chats');

    if (initialMessage && initialMessage.trim()) {
      setTimeout(() => {
        const { updatedChats: withMsg } = storageService.sendMessage(chat.id, {
          text: initialMessage.trim()
        });
        setChats(withMsg);
      }, 100);
    }

    showToast(`Direct message thread opened with ${phoneNumber}`);
  };

  // Handlers for WhatsApp Status
  const handleSaveStatus = (itemData: Omit<WhatsAppStatusItem, 'id' | 'createdAt' | 'expiresAt' | 'viewsCount'>) => {
    const updated = storageService.addMyStatus(itemData);
    setMyStatuses(updated);
    showToast(itemData.isScheduled ? 'WhatsApp Status scheduled successfully!' : 'Published new WhatsApp Status update!');
  };

  const handleDeleteMyStatus = (id: string) => {
    const updated = storageService.deleteMyStatus(id);
    setMyStatuses(updated);
    showToast('WhatsApp Status removed.');
  };

  const handleOpenStatusViewer = (contactIndex: number) => {
    setStatusViewerContactIndex(contactIndex);
    setIsStatusViewerOpen(true);
  };

  const handleReplyToContactStatus = (contactId: string, statusItem: WhatsAppStatusItem, text: string) => {
    const { updatedChats, contactName } = storageService.replyToStatus(contactId, statusItem, text);
    setChats(updatedChats);
    showToast(`Replied directly to ${contactName}'s status!`);
  };

  const handleStatusMarkViewed = (contactId: string) => {
    const updated = storageService.markContactStatusViewed(contactId);
    setContactStatuses(updated);
  };

  // Broadcast Handler
  const handleSendBroadcast = (targetChatIds: string[], templateText: string) => {
    let current = storageService.getWhatsAppChats();
    targetChatIds.forEach(id => {
      const target = current.find(c => c.id === id);
      const personalized = templateText.replace(/\{name\}/gi, target?.contactName || 'there');
      const res = storageService.sendMessage(id, { text: personalized });
      current = res.updatedChats;
    });
    setChats(current);
    showToast(`Broadcast sent to ${targetChatIds.length} contacts!`);
  };

  const unreadMessagesCount = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const unviewedStatusesCount = contactStatuses.filter(c => !c.isViewed).length;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-100 overflow-hidden">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in duration-150">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top WhatsApp Control Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">WhatsApp Messenger</h2>
              {linkedWhatsApp ? (
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Real Linked: {linkedWhatsApp.handle}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLinkModalOpen(true)}
                    className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(true)}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 flex items-center gap-1 border border-amber-300 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-amber-700" />
                  <span>Link Real WhatsApp</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Direct message any phone number, chat in-app, share 24h statuses & broadcast
            </p>
          </div>
        </div>

        {/* Sub-Tabs: Direct Messages vs Status Updates */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveSubTab('chats')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeSubTab === 'chats'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Direct Messages</span>
              {unreadMessagesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-emerald-600 text-white font-bold">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('status')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeSubTab === 'status'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Status Updates</span>
              {unviewedStatusesCount > 0 && (
                <span className="ml-1 w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>

          {/* Quick Action Buttons */}
          <button
            onClick={() => setIsDirectLauncherOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="Send direct message to any phone number without saving"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Message Any Number</span>
          </button>

          <button
            onClick={() => setIsCreateStatusOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Status</span>
          </button>

          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="Broadcast announcement to multiple contacts"
          >
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Broadcast</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {activeSubTab === 'chats' ? (
          /* ========================================================
             DIRECT MESSAGES INTERFACE (WhatsApp Web Style)
             ======================================================== */
          <div className="flex-1 flex w-full h-full overflow-hidden">
            {/* Left Chats Sidebar */}
            <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0 ${activeChat && selectedChatId ? 'hidden md:flex' : 'flex'}`}>
              {/* Search & Filter Bar */}
              <div className="p-3 border-b border-slate-100 space-y-2 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={chatSearchQuery}
                    onChange={(e) => setChatSearchQuery(e.target.value)}
                    placeholder="Search chats, contacts, numbers..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                  {(['all', 'customer', 'lead', 'partner'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setChatCategoryFilter(cat)}
                      className={`px-2.5 py-0.5 rounded-full capitalize whitespace-nowrap cursor-pointer transition-colors ${
                        chatCategoryFilter === cat
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'all' ? 'All Chats' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {filteredChats.map((chat) => {
                  const isSelected = activeChat?.id === chat.id;
                  return (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChatId(chat.id)}
                      className={`flex items-center gap-3 p-3 cursor-pointer transition-colors relative ${
                        isSelected 
                          ? 'bg-emerald-50/60 border-l-4 border-emerald-600' 
                          : 'hover:bg-slate-50 border-l-4 border-transparent'
                      }`}
                    >
                      {/* Avatar with online dot */}
                      <div className="relative shrink-0">
                        <img 
                          src={chat.avatarUrl} 
                          alt={chat.contactName} 
                          className="w-11 h-11 rounded-full object-cover ring-1 ring-slate-200" 
                        />
                        {chat.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                        )}
                      </div>

                      {/* Info & Last Message */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-xs font-semibold text-slate-900 truncate">
                            {chat.contactName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {chat.lastMessageTimestamp}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-1">
                          <p className="text-[11px] text-slate-500 truncate">
                            {chat.lastMessage}
                          </p>
                          <div className="flex items-center gap-1 shrink-0">
                            {chat.isPinned && (
                              <Pin className="w-3 h-3 text-slate-400" />
                            )}
                            {chat.unreadCount > 0 && (
                              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                                {chat.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredChats.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No conversations found matching search.
                  </div>
                )}
              </div>
            </div>

            {/* Right Chat Conversation View */}
            {activeChat ? (
              <div className={`flex-1 flex flex-col bg-[#efeae2] relative min-w-0 h-full ${!selectedChatId ? 'hidden md:flex' : 'flex'}`}>
                {/* Chat Top Bar */}
                <div className="h-14 px-3 sm:px-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs z-10">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {/* Mobile Back Button to Chat List */}
                    <button
                      onClick={() => setSelectedChatId('')}
                      className="md:hidden min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <img 
                      src={activeChat.avatarUrl} 
                      alt={activeChat.contactName} 
                      className="w-9 h-9 rounded-full object-cover shrink-0" 
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {activeChat.contactName}
                        </span>
                        {activeChat.category && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium capitalize">
                            {activeChat.category}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block truncate">
                        {activeChat.phoneNumber} · {activeChat.isOnline ? 'Online' : 'Last seen today'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 text-slate-500">
                    <button
                      onClick={() => {
                        const cleanPhone = activeChat.phoneNumber.replace(/[^\d]/g, '');
                        window.open(`https://wa.me/${cleanPhone}`, '_blank');
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer border border-emerald-200"
                      title="Open in WhatsApp Web"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Open wa.me</span>
                    </button>
                  </div>
                </div>

                {/* Message History Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {/* Date Badge */}
                  <div className="flex justify-center my-2">
                    <span className="px-3 py-1 bg-white/80 backdrop-blur-xs rounded-lg text-[10px] font-semibold text-slate-600 shadow-2xs">
                      Today · End-to-end encrypted direct message
                    </span>
                  </div>

                  {activeChat.messages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md sm:max-w-lg rounded-2xl p-3 shadow-xs relative text-xs leading-relaxed ${
                            isUser
                              ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none'
                              : 'bg-white text-slate-900 rounded-tl-none'
                          }`}
                        >
                          {/* Quoted Message / Status Reply Banner */}
                          {msg.quotedMessageText && (
                            <div className="p-2 mb-2 bg-black/5 border-l-4 border-emerald-600 rounded text-[11px] text-slate-600">
                              <span className="font-semibold text-emerald-800 block text-[10px]">
                                {msg.isStatusReply ? 'Replied to Status' : 'Quoted Message'}
                              </span>
                              <p className="line-clamp-2">{msg.quotedMessageText}</p>
                            </div>
                          )}

                          {/* Media Image Message */}
                          {msg.mediaUrl && (
                            <div className="mb-2 rounded-lg overflow-hidden max-h-60 border border-black/10">
                              <img src={msg.mediaUrl} alt="Attachment" className="w-full h-full object-cover" />
                            </div>
                          )}

                          {/* Voice Note Audio Player Simulation */}
                          {msg.mediaType === 'audio' && (
                            <div className="flex items-center gap-3 p-2 bg-emerald-700/10 rounded-xl mb-1 min-w-[200px]">
                              <button
                                onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                                className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors shadow-2xs shrink-0"
                              >
                                {playingAudioId === msg.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                              </button>
                              <div className="flex-1">
                                <div className="h-1.5 bg-slate-300 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full bg-emerald-600 rounded-full ${playingAudioId === msg.id ? 'animate-pulse w-2/3' : 'w-1/3'}`} 
                                  />
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                                  0:{msg.audioDurationSeconds || 15} · Voice Message
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Message Text */}
                          {msg.text && (
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          )}

                          {/* Timestamp and Delivery Ticks */}
                          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400 font-mono">
                            <span>{msg.timestamp}</span>
                            {isUser && (
                              <span>
                                {msg.status === 'read' ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                                ) : msg.status === 'delivered' ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-slate-400" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Canned Quick Replies Chips */}
                <div className="px-4 py-2 bg-white/90 backdrop-blur-xs border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                    Quick Reply:
                  </span>
                  {CANNED_REPLIES.map((canned, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(canned)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-md text-slate-700 truncate max-w-xs transition-colors cursor-pointer border border-slate-200/60 whitespace-nowrap"
                    >
                      {canned}
                    </button>
                  ))}
                </div>

                {/* Emoji Tray Overlay (if open) */}
                {showEmojiPicker && (
                  <div className="p-2 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0 animate-in fade-in duration-100">
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setMessageInput((prev) => prev + emoji);
                        }}
                        className="text-lg p-1 hover:bg-slate-100 rounded-lg cursor-pointer transition-transform hover:scale-125"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Bottom Input Composer */}
                <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Emojis"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSendPresetImage}
                    className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Attach promotional image"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  {/* Simulated Voice Recorder */}
                  {isRecordingAudio ? (
                    <div className="flex-1 flex items-center justify-between px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs animate-pulse">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                        <span className="font-semibold">Recording Voice Note... 0:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsRecordingAudio(false)}
                          className="px-2 py-0.5 text-[11px] text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleFinishVoiceNote}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          Send Voice Note
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Type a message or press enter to send..."
                        className="flex-1 px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                      />

                      <button
                        type="button"
                        onClick={() => setIsRecordingAudio(true)}
                        className="p-2 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Record simulated voice note"
                      >
                        <Mic className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendMessage()}
                        disabled={!messageInput.trim()}
                        className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer shadow-xs shrink-0"
                        title="Send message"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">No chat selected</p>
                <p className="text-xs max-w-sm mt-1">Select a conversation or start a new direct message to any phone number above.</p>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================
             STATUS UPDATES INTERFACE (WhatsApp Stories Hub)
             ======================================================== */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-5xl mx-auto w-full">
            {/* Top Status Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                  WhatsApp Status Hub
                </span>
                <h3 className="text-base font-bold leading-tight">24-Hour Ephemeral Stories & Media Updates</h3>
                <p className="text-xs text-emerald-100 max-w-xl">
                  Share behind-the-scenes content, flash announcements, and poll your contacts. All updates expire automatically in 24 hours.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCreateStatusOpen(true)}
                  className="px-4 py-2 bg-white text-emerald-800 rounded-xl text-xs font-semibold hover:bg-emerald-50 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Status</span>
                </button>
              </div>
            </div>

            {/* My Status Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                My Status
              </h4>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-emerald-500 p-0.5 bg-white">
                      <img 
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" 
                        alt="My Status" 
                        className="w-full h-full rounded-full object-cover" 
                      />
                    </div>
                    <button 
                      onClick={() => setIsCreateStatusOpen(true)}
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      My Status
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {myStatuses.length > 0 
                        ? `${myStatuses.length} active updates · Expires within 24h` 
                        : 'Tap to add your first status update'}
                    </span>
                  </div>
                </div>

                {myStatuses.length > 0 && (
                  <div className="flex items-center gap-2">
                    {myStatuses.map(status => (
                      <button
                        key={status.id}
                        onClick={() => setInspectingMyStatus(status)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
                        title="View status viewers & analytics"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-mono text-emerald-700 font-semibold">{status.viewsCount}</span>
                        <span className="text-slate-500">views</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contacts' Status Updates */}
            <div className="space-y-4">
              {/* Recent (Unviewed) Updates */}
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Recent Updates</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {contactStatuses.filter(c => !c.isViewed).length} new stories
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {contactStatuses.map((contact, idx) => {
                    const latestItem = contact.items[contact.items.length - 1];
                    return (
                      <div
                        key={contact.id}
                        onClick={() => handleOpenStatusViewer(idx)}
                        className={`p-3.5 rounded-xl border bg-white shadow-2xs hover:shadow-sm transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                          !contact.isViewed 
                            ? 'border-emerald-200/90 ring-1 ring-emerald-500/20' 
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar with status ring (Emerald = Unviewed, Slate = Viewed) */}
                          <div className={`p-0.5 rounded-full ring-2 shrink-0 ${
                            !contact.isViewed ? 'ring-emerald-500' : 'ring-slate-300'
                          }`}>
                            <img 
                              src={contact.avatarUrl} 
                              alt={contact.contactName} 
                              className="w-11 h-11 rounded-full object-cover" 
                            />
                          </div>

                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-emerald-700 transition-colors">
                              {contact.contactName}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {contact.lastUpdated} · {contact.items.length} {contact.items.length === 1 ? 'update' : 'updates'}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md shrink-0">
                          View Story
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Performance & Direct Message Analytics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 block">Total Status Reach</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold font-mono text-slate-900">142</span>
                    <span className="text-[10px] text-emerald-600 font-semibold font-mono">+24% this week</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Unique viewers who opened your 24h stories</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 block">Story-to-DM Inquiries</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold font-mono text-emerald-600">18 DMs</span>
                    <span className="text-[10px] text-slate-500 font-mono">12.6% reply rate</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Direct replies converted into 1-on-1 conversations</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 block">WhatsApp Click-to-Chat</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold font-mono text-slate-900">94 Clicks</span>
                    <span className="text-[10px] text-emerald-600 font-semibold font-mono">Active</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Visitors who initiated wa.me direct links & QR codes</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Direct Message to Any Number Launcher Modal */}
      <DirectMessageLauncherModal
        isOpen={isDirectLauncherOpen}
        onClose={() => setIsDirectLauncherOpen(false)}
        onLaunchInAppChat={handleLaunchInAppChat}
      />

      {/* Create New Status Modal */}
      <CreateStatusModal
        isOpen={isCreateStatusOpen}
        onClose={() => setIsCreateStatusOpen(false)}
        onSaveStatus={handleSaveStatus}
      />

      {/* Fullscreen Interactive Status Story Viewer Modal */}
      <WhatsAppStatusViewerModal
        isOpen={isStatusViewerOpen}
        onClose={() => setIsStatusViewerOpen(false)}
        contactStatuses={contactStatuses}
        initialContactIndex={statusViewerContactIndex}
        onReplyToStatus={handleReplyToContactStatus}
        onStatusViewed={handleStatusMarkViewed}
      />

      {/* Inspect My Status Viewers Modal */}
      <WhatsAppStatusViewsModal
        isOpen={!!inspectingMyStatus}
        onClose={() => setInspectingMyStatus(null)}
        status={inspectingMyStatus}
        onDeleteStatus={handleDeleteMyStatus}
      />

      {/* Broadcast Modal */}
      <WhatsAppBroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        chats={chats}
        onSendBroadcast={handleSendBroadcast}
      />

      {/* Real WhatsApp Account Link Up Modal */}
      <WhatsAppLinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onAccountLinked={handleAccountLinked}
        existingAccount={linkedWhatsApp}
      />
    </div>
  );
};
