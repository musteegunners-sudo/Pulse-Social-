import React, { useState } from 'react';
import { 
  CheckCircle, 
  ChevronRight, 
  Send, 
  Plus, 
  Sparkles, 
  Calendar, 
  Users, 
  ExternalLink,
  MessageCircle,
  Share2,
  Info
} from 'lucide-react';
import { SocialAccount, SocialPost } from '../../types';
import { PlatformIcon, getPlatformName } from '../common/PlatformIcon';
import { redirectToMotherApp } from '../../utils/socialAppBridge';

interface PublerHomeViewProps {
  accounts: SocialAccount[];
  posts: SocialPost[];
  onOpenComposer: (date?: string, post?: SocialPost) => void;
  onNavigateTab: (tab: any) => void;
  onOpenDispatcher?: (post: SocialPost) => void;
}

export const PublerHomeView: React.FC<PublerHomeViewProps> = ({
  accounts,
  posts,
  onOpenComposer,
  onNavigateTab,
  onOpenDispatcher,
}) => {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteSent(true);
    setTimeout(() => {
      setShowInviteModal(false);
      setInviteSent(false);
      setInviteEmail('');
    }, 1800);
  };

  const recentPosts = posts.slice(0, 3);

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5 pb-24 animate-in fade-in duration-200">
      
      {/* 1. Invite Team Members Banner (Screenshot 1 Top) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-xs sm:max-w-sm">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
            Invite your team members and start collaborating
          </h3>
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="text-xs sm:text-sm font-semibold text-cyan-500 hover:text-cyan-600 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Invite team member</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Envelope Hand Illustration */}
        <div className="shrink-0 relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-cyan-50 rounded-full flex items-center justify-center">
            <span className="text-3xl sm:text-4xl">✉️</span>
          </div>
        </div>
      </div>

      {/* 2. Things to do Section (Screenshot 1 Center) */}
      <div className="space-y-3">
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
          Things to do
        </h2>

        {/* Card 1: Post something today (Green Accent) */}
        <div 
          onClick={() => onOpenComposer()}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Green Accent Pill */}
            <div className="w-1.5 h-10 bg-emerald-600 rounded-full shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Post something today
              </h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                Engage with your audience today. Create a post now!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleTask('task-1');
            }}
            className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer shrink-0"
            title="Mark as completed"
          >
            <CheckCircle 
              className={`w-6 h-6 transition-colors ${
                completedTasks.includes('task-1') 
                  ? 'text-emerald-600 fill-emerald-100' 
                  : 'text-slate-300'
              }`} 
            />
          </button>
        </div>

        {/* Card 2: Plan your next big post (Burgundy Accent) */}
        <div 
          onClick={() => onNavigateTab('calendar')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 hover:border-pink-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Burgundy Accent Pill */}
            <div className="w-1.5 h-10 bg-rose-900 rounded-full shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-rose-900 transition-colors">
                Plan your next big post
              </h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                Keep your feed active with a post scheduled for tomorrow!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleTask('task-2');
            }}
            className="p-1 text-slate-400 hover:text-rose-900 cursor-pointer shrink-0"
            title="Mark as completed"
          >
            <CheckCircle 
              className={`w-6 h-6 transition-colors ${
                completedTasks.includes('task-2') 
                  ? 'text-rose-900 fill-rose-100' 
                  : 'text-slate-300'
              }`} 
            />
          </button>
        </div>

        {/* Card 3: Join our ambassador program (Gold Accent) */}
        <div 
          onClick={() => onNavigateTab('tools')}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Amber Accent Pill */}
            <div className="w-1.5 h-10 bg-amber-400 rounded-full shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                Join our ambassador program
              </h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                Tell your friends about Publer and get rewarded!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleTask('task-3');
            }}
            className="p-1 text-slate-400 hover:text-amber-600 cursor-pointer shrink-0"
            title="Mark as completed"
          >
            <CheckCircle 
              className={`w-6 h-6 transition-colors ${
                completedTasks.includes('task-3') 
                  ? 'text-amber-500 fill-amber-100' 
                  : 'text-slate-300'
              }`} 
            />
          </button>
        </div>
      </div>

      {/* 3. Updates You May Have Missed Banner (Screenshot 1 Bottom) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Updates you may have missed!
          </h3>
          <button
            type="button"
            onClick={() => onNavigateTab('explore')}
            className="text-xs sm:text-sm font-semibold text-cyan-500 hover:text-cyan-600 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Check them out</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 font-bold text-lg">
          🔔
        </div>
      </div>

      {/* 4. Connected Accounts & Mother App Bridge Section */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Active Publishing Channels</h3>
            <p className="text-xs text-slate-500">Tap to launch mother app or post directly</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('accounts')}
            className="text-xs font-semibold text-cyan-600 hover:text-cyan-700"
          >
            Manage Channels →
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {accounts.map((acc) => (
            <div 
              key={acc.id}
              onClick={() => redirectToMotherApp(acc)}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 hover:border-cyan-400 hover:bg-cyan-50/40 transition-all cursor-pointer flex items-center justify-between gap-2"
              title={`Click to redirect directly to ${acc.name} mother app`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={acc.avatarUrl}
                    alt={acc.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-xs">
                    <PlatformIcon platform={acc.platform} size={10} />
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 truncate block">{acc.name}</span>
                  <span className="text-[10px] text-slate-500 truncate block">{acc.handle}</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Team Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 w-full max-w-sm space-y-4 animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900">Invite Team Member</h3>
            <p className="text-xs text-slate-500">
              Enter their email to send a Publer collaboration workspace invitation.
            </p>
            {inviteSent ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Invitation sent successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Send Invite
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
