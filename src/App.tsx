import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SocialPost, SocialAccount, QueueSlot, InboxItem } from './types';
import { storageService } from './services/storageService';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { ContentCalendar } from './components/calendar/ContentCalendar';
import { QueueManager } from './components/queue/QueueManager';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { SocialInbox } from './components/inbox/SocialInbox';
import { AccountsManager } from './components/accounts/AccountsManager';
import { WhatsAppManager } from './components/whatsapp/WhatsAppManager';
import { PostComposerModal } from './components/composer/PostComposerModal';
import { PostDetailsModal } from './components/common/PostDetailsModal';
import { MobileTabBar } from './components/layout/MobileTabBar';
import { KeyboardShortcutsModal } from './components/common/KeyboardShortcutsModal';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { AuthModal } from './components/auth/AuthModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [queueSlots, setQueueSlots] = useState<QueueSlot[]>([]);
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);

  // Modals state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerEditingPost, setComposerEditingPost] = useState<SocialPost | null>(null);
  const [composerInitialDate, setComposerInitialDate] = useState<string | undefined>(undefined);
  const [inspectingPost, setInspectingPost] = useState<SocialPost | null>(null);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Search state & input ref
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load initial data from localStorage
  useEffect(() => {
    setPosts(storageService.getPosts());
    setAccounts(storageService.getAccounts());
    setQueueSlots(storageService.getQueueSlots());
    setInboxItems(storageService.getInbox());
  }, []);

  // Handlers
  const handleOpenComposer = (initialDate?: string, post?: SocialPost) => {
    setComposerEditingPost(post || null);
    setComposerInitialDate(initialDate);
    setIsComposerOpen(true);
  };

  const handleSavePost = (newPost: SocialPost) => {
    const updated = storageService.savePost(newPost);
    setPosts(updated);
    showToast(newPost.status === 'published' ? 'Post published immediately to connected channels!' : 'Post scheduled successfully!');
  };

  const handleDeletePost = (id: string) => {
    const updated = storageService.deletePost(id);
    setPosts(updated);
    showToast('Post removed from schedule.');
  };

  const handlePublishNow = (post: SocialPost) => {
    const publishedPost: SocialPost = {
      ...post,
      status: 'published',
      publishedAt: new Date().toISOString(),
      performance: {
        impressions: Math.floor(800 + Math.random() * 2500),
        reach: Math.floor(650 + Math.random() * 2000),
        likes: Math.floor(40 + Math.random() * 180),
        comments: Math.floor(5 + Math.random() * 30),
        shares: Math.floor(8 + Math.random() * 45),
        clicks: Math.floor(60 + Math.random() * 210),
        engagementRate: Number((4.5 + Math.random() * 3).toFixed(2)),
      }
    };
    const updated = storageService.savePost(publishedPost);
    setPosts(updated);
    showToast('Published post successfully across target networks!');
  };

  const handleRepurposePost = (post: SocialPost) => {
    const cloned: SocialPost = {
      ...post,
      id: `post-${Date.now()}`,
      status: 'scheduled',
      content: post.content,
      scheduledFor: new Date(Date.now() + 86400000 * 2).toISOString(),
      performance: undefined,
    };
    setComposerEditingPost(cloned);
    setComposerInitialDate(undefined);
    setIsComposerOpen(true);
  };

  const handleToggleAccount = (id: string) => {
    const updated = storageService.toggleAccountConnection(id);
    setAccounts(updated);
  };

  const handleAddAccount = (acc: SocialAccount) => {
    const updated = storageService.addAccount(acc);
    setAccounts(updated);
    showToast(`Connected ${acc.handle} to PulseSocial.`);
  };

  const handleDeleteAccount = (id: string) => {
    const target = accounts.find(a => a.id === id);
    const updated = storageService.deleteAccount(id);
    setAccounts(updated);
    showToast(`Removed ${target?.handle || 'account'} from PulseSocial.`);
  };

  const handleClearAccounts = () => {
    const updated = storageService.clearAllAccounts();
    setAccounts(updated);
    showToast('Demo channels cleared. Ready to connect your real social accounts!');
  };

  const handleBulkImportAccounts = (
    importedAccounts: SocialAccount[],
    mode: 'merge' | 'replace' | 'skip_duplicates',
    summary: { added: number; updated: number }
  ) => {
    const result = storageService.bulkImportAccounts(importedAccounts, mode);
    setAccounts(result.accounts);
    if (mode === 'replace') {
      showToast(`Replaced directory with ${result.addedCount} accounts from CSV.`);
    } else {
      showToast(
        `Imported ${result.addedCount} new account${result.addedCount === 1 ? '' : 's'}${
          result.updatedCount > 0 ? `, updated ${result.updatedCount}` : ''
        }.`
      );
    }
  };

  const handleSaveQueueSlots = (slots: QueueSlot[]) => {
    storageService.saveQueueSlots(slots);
    setQueueSlots(slots);
    showToast('Queue schedule updated.');
  };

  const handleReplyInbox = (itemId: string, replyText: string) => {
    const currentInbox = storageService.getInbox();
    const updated = currentInbox.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          isResolved: true,
          replies: [
            ...item.replies,
            {
              id: `rep-${Date.now()}`,
              sender: 'PulseMedia HQ',
              content: replyText,
              timestamp: 'Just now',
            }
          ]
        };
      }
      return item;
    });
    storageService.saveInbox(updated);
    setInboxItems(updated);
    showToast('Reply dispatched to community thread.');
  };

  const handleToggleResolveInbox = (itemId: string) => {
    const currentInbox = storageService.getInbox();
    const updated = currentInbox.map(item => {
      if (item.id === itemId) {
        return { ...item, isResolved: !item.isResolved };
      }
      return item;
    });
    storageService.saveInbox(updated);
    setInboxItems(updated);
  };

  const handleToggleStarInbox = (itemId: string) => {
    const currentInbox = storageService.getInbox();
    const updated = currentInbox.map(item => {
      if (item.id === itemId) {
        return { ...item, isStarred: !item.isStarred };
      }
      return item;
    });
    storageService.saveInbox(updated);
    setInboxItems(updated);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all posts, schedule queues, and sample performance data to default demo state?')) {
      storageService.resetDemoData();
      setPosts(storageService.getPosts());
      setAccounts(storageService.getAccounts());
      setQueueSlots(storageService.getQueueSlots());
      setInboxItems(storageService.getInbox());
      showToast('Demo dataset reset to initial state.');
    }
  };

  // Search filter across posts
  const visiblePosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(p => 
      p.content.toLowerCase().includes(q) ||
      p.campaign?.toLowerCase().includes(q) ||
      p.author?.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q))
    );
  }, [posts, searchQuery]);

  const handleFocusSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
    }
  };

  // Register Global Keyboard Shortcuts ('C' for composer, 'S' or '/' for search, 1-6 tabs, ? for guide, Esc)
  useKeyboardShortcuts({
    onOpenComposer: () => handleOpenComposer(),
    onFocusSearch: handleFocusSearch,
    onSelectTab: (tab) => setActiveTab(tab),
    onToggleShortcutsModal: () => setIsShortcutsModalOpen((prev) => !prev),
    onCloseModals: () => {
      setIsComposerOpen(false);
      setInspectingPost(null);
      setIsShortcutsModalOpen(false);
      setIsMobileSidebarOpen(false);
    },
    isAnyModalOpen: isComposerOpen || !!inspectingPost || isShortcutsModalOpen,
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Sidebar (Desktop fixed + Mobile slide-over drawer) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsMobileSidebarOpen(false);
        }}
        accounts={accounts}
        onOpenComposer={() => handleOpenComposer()}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          activeTab={activeTab}
          onOpenComposer={() => handleOpenComposer()}
          onResetData={handleResetData}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
          searchInputRef={searchInputRef}
        />

        {/* Dynamic Tab View Container */}
        <main className="flex-1 overflow-y-auto min-h-0 pb-20 md:pb-0">
          {activeTab === 'overview' && (
            <OverviewDashboard
              posts={visiblePosts}
              accounts={accounts}
              onOpenComposer={handleOpenComposer}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'calendar' && (
            <ContentCalendar
              posts={visiblePosts}
              onOpenComposer={handleOpenComposer}
              onDeletePost={handleDeletePost}
              onSelectPostDetails={setInspectingPost}
            />
          )}

          {activeTab === 'queue' && (
            <QueueManager
              queueSlots={queueSlots}
              onSaveQueueSlots={handleSaveQueueSlots}
              posts={visiblePosts}
              onOpenComposer={handleOpenComposer}
              onDeletePost={handleDeletePost}
              onPublishNow={handlePublishNow}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard
              posts={visiblePosts}
              accounts={accounts}
              onRepurposePost={handleRepurposePost}
            />
          )}

          {activeTab === 'inbox' && (
            <SocialInbox
              inboxItems={inboxItems}
              onReply={handleReplyInbox}
              onToggleResolve={handleToggleResolveInbox}
              onToggleStar={handleToggleStarInbox}
            />
          )}

          {activeTab === 'whatsapp' && (
            <WhatsAppManager
              onOpenComposer={handleOpenComposer}
            />
          )}

          {activeTab === 'accounts' && (
            <AccountsManager
              accounts={accounts}
              onToggleConnection={handleToggleAccount}
              onAddAccount={handleAddAccount}
              onDeleteAccount={handleDeleteAccount}
              onClearAccounts={handleClearAccounts}
              onBulkImport={handleBulkImportAccounts}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <MobileTabBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsMobileSidebarOpen(false);
        }}
        onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        inboxBadge={inboxItems.filter(i => !i.isResolved).length}
      />

      {/* Cross-Platform Post Composer Modal */}
      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSavePost={handleSavePost}
        accounts={accounts}
        initialPost={composerEditingPost}
        initialDate={composerInitialDate}
      />

      {/* Inspect / Post Details Analytics Modal */}
      <PostDetailsModal
        post={inspectingPost}
        onClose={() => setInspectingPost(null)}
        onEdit={(post) => {
          setInspectingPost(null);
          handleOpenComposer(undefined, post);
        }}
        onDelete={handleDeletePost}
        onRepurpose={(post) => {
          setInspectingPost(null);
          handleRepurposePost(post);
        }}
      />

      {/* Global Keyboard Shortcuts Modal Guide */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsShortcutsModalOpen(false);
        }}
        onOpenComposer={() => {
          setIsShortcutsModalOpen(false);
          handleOpenComposer();
        }}
      />

      {/* Offline Status Toast Indicator */}
      <OfflineIndicator />

      {/* Cloud Authentication Modal (Login / Register / Forgot Password) */}
      <AuthModal />

    </div>
  );
}
