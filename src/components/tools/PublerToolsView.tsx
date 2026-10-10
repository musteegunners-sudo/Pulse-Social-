import React, { useState, useEffect } from 'react';
import { 
  Hash, 
  FileText, 
  Link as LinkIcon, 
  Repeat, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Save, 
  Sliders, 
  CheckCircle2, 
  Smartphone, 
  Globe, 
  Share2, 
  ArrowRight,
  Zap,
  Info,
  Layers,
  Wand2,
  Phone
} from 'lucide-react';
import { SocialAccount, SocialPost } from '../../types';
import { PlatformIcon, getPlatformName } from '../common/PlatformIcon';

export interface HashtagGroup {
  id: string;
  name: string;
  tags: string[];
  color: string;
}

export interface SocialSignature {
  id: string;
  name: string;
  content: string;
  isDefault?: boolean;
}

export interface LinkInBioConfig {
  title: string;
  bio: string;
  avatarUrl: string;
  whatsappNumber: string;
  buttons: Array<{
    id: string;
    label: string;
    url: string;
    icon?: string;
    isActive: boolean;
  }>;
}

interface PublerToolsViewProps {
  accounts: SocialAccount[];
  posts: SocialPost[];
  onOpenComposer: (date?: string, post?: SocialPost) => void;
}

const STORAGE_KEYS = {
  HASHTAG_GROUPS: 'publer_tools_hashtag_groups_v1',
  SIGNATURES: 'publer_tools_signatures_v1',
  LINK_IN_BIO: 'publer_tools_link_in_bio_v1',
  WATERMARK: 'publer_tools_watermark_v1',
};

const DEFAULT_HASHTAG_GROUPS: HashtagGroup[] = [
  {
    id: 'hg-1',
    name: 'Halal Marriage & Arewa',
    color: 'emerald',
    tags: ['#ArewaHalal', '#HalalMarriage', '#IslamicMarriage', '#ArewaWeddings', '#Kano', '#Kaduna', '#Abuja'],
  },
  {
    id: 'hg-2',
    name: 'Viral Reach & Trending',
    color: 'indigo',
    tags: ['#Trending', '#Viral', '#Community', '#Creator', '#Engagement', '#ExplorePage'],
  },
  {
    id: 'hg-3',
    name: 'Business & Brand Growth',
    color: 'amber',
    tags: ['#BusinessGrowth', '#Entrepreneur', '#Leadership', '#BrandBuilding', '#MarketingStrategy'],
  },
];

const DEFAULT_SIGNATURES: SocialSignature[] = [
  {
    id: 'sig-1',
    name: 'WhatsApp Direct Contact',
    content: '\n\n📲 Direct WhatsApp: +0704947485 | Tap to chat with us anytime!',
    isDefault: true,
  },
  {
    id: 'sig-2',
    name: 'Official Social Media Network',
    content: '\n\n✨ Follow @ArewaHalalcf2f on X | Join our Facebook Group & Page!',
    isDefault: false,
  },
  {
    id: 'sig-3',
    name: 'Community Disclaimer & Inquiries',
    content: '\n\n💬 For partnerships & community inquiries, send us a direct message or WhatsApp.',
    isDefault: false,
  },
];

export const PublerToolsView: React.FC<PublerToolsViewProps> = ({
  accounts,
  posts,
  onOpenComposer,
}) => {
  const [activeTool, setActiveTool] = useState<'hashtags' | 'signatures' | 'linkinbio' | 'recycling' | 'watermark'>('hashtags');

  // Hashtag Groups State
  const [hashtagGroups, setHashtagGroups] = useState<HashtagGroup[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HASHTAG_GROUPS);
      return saved ? JSON.parse(saved) : DEFAULT_HASHTAG_GROUPS;
    } catch {
      return DEFAULT_HASHTAG_GROUPS;
    }
  });
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupTags, setNewGroupTags] = useState('');

  // Signatures State
  const [signatures, setSignatures] = useState<SocialSignature[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SIGNATURES);
      return saved ? JSON.parse(saved) : DEFAULT_SIGNATURES;
    } catch {
      return DEFAULT_SIGNATURES;
    }
  });
  const [newSigName, setNewSigName] = useState('');
  const [newSigContent, setNewSigContent] = useState('');

  // Link in Bio State
  const linkedWhatsApp = accounts.find(a => a.platform === 'whatsapp' && a.isConnected);
  const [linkInBio, setLinkInBio] = useState<LinkInBioConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LINK_IN_BIO);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      title: 'Arewa Halal Media & Network',
      bio: 'Official Community Hub. Halal Marriage, Media & Engagement across Nigeria & Worldwide.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      whatsappNumber: '+0704947485',
      buttons: [
        { id: 'b-1', label: '💬 Chat on WhatsApp (+0704947485)', url: 'https://wa.me/234704947485', isActive: true },
        { id: 'b-2', label: '👥 Join Facebook Community Group', url: 'https://www.facebook.com/groups/244472852267500', isActive: true },
        { id: 'b-3', label: '📘 Follow Facebook Brand Page', url: 'https://www.facebook.com/Musteedanmari', isActive: true },
        { id: 'b-4', label: '𝕏 Follow us on X (@ArewaHalalcf2f)', url: 'https://x.com/ArewaHalalcf2f', isActive: true },
      ],
    };
  });

  // Watermark State
  const [watermarkText, setWatermarkText] = useState('@ArewaHalal');
  const [watermarkPosition, setWatermarkPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right'>('bottom-right');
  const [watermarkOpacity, setWatermarkOpacity] = useState(70);

  // Feedbacks
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Save changes to localStorage
  const handleSaveHashtagGroups = (updated: HashtagGroup[]) => {
    setHashtagGroups(updated);
    localStorage.setItem(STORAGE_KEYS.HASHTAG_GROUPS, JSON.stringify(updated));
  };

  const handleAddHashtagGroup = () => {
    if (!newGroupName.trim() || !newGroupTags.trim()) {
      showToast('Please enter a group title and at least one hashtag.');
      return;
    }
    const tagsArray = newGroupTags
      .split(/[\s,]+/)
      .map(t => (t.startsWith('#') ? t : `#${t}`))
      .filter(t => t.length > 1);

    const newGroup: HashtagGroup = {
      id: `hg-${Date.now()}`,
      name: newGroupName.trim(),
      tags: tagsArray,
      color: ['indigo', 'emerald', 'purple', 'amber', 'rose'][Math.floor(Math.random() * 5)],
    };

    const updated = [...hashtagGroups, newGroup];
    handleSaveHashtagGroups(updated);
    setNewGroupName('');
    setNewGroupTags('');
    showToast(`Hashtag bundle "${newGroup.name}" saved!`);
  };

  const handleDeleteHashtagGroup = (id: string) => {
    const updated = hashtagGroups.filter(g => g.id !== id);
    handleSaveHashtagGroups(updated);
    showToast('Hashtag group removed.');
  };

  // Signatures handlers
  const handleSaveSignatures = (updated: SocialSignature[]) => {
    setSignatures(updated);
    localStorage.setItem(STORAGE_KEYS.SIGNATURES, JSON.stringify(updated));
  };

  const handleAddSignature = () => {
    if (!newSigName.trim() || !newSigContent.trim()) {
      showToast('Please enter a signature name and content.');
      return;
    }
    const newSig: SocialSignature = {
      id: `sig-${Date.now()}`,
      name: newSigName.trim(),
      content: newSigContent.trim(),
      isDefault: signatures.length === 0,
    };
    const updated = [...signatures, newSig];
    handleSaveSignatures(updated);
    setNewSigName('');
    setNewSigContent('');
    showToast(`Signature "${newSig.name}" saved!`);
  };

  const handleDeleteSignature = (id: string) => {
    const updated = signatures.filter(s => s.id !== id);
    handleSaveSignatures(updated);
    showToast('Signature removed.');
  };

  // Link in bio handlers
  const handleSaveLinkInBio = () => {
    localStorage.setItem(STORAGE_KEYS.LINK_IN_BIO, JSON.stringify(linkInBio));
    showToast('Link in Bio configuration saved & live!');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Publer Social Media Tools Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30 rounded-3xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase">
                Publer Social Media Tools
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Workspace Automation Hub
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Power Tools for Multi-Channel Creators & Brands
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Supercharge your posting workflow with Publer-style hashtag bundles, auto-signatures, virtual Link in Bio pages, and recycling queues.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenComposer()}
            className="self-start md:self-auto min-h-[44px] px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Post</span>
          </button>
        </div>

        {/* Tools Subnav Tabs */}
        <div className="flex border-t border-slate-800/80 mt-6 pt-4 gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'hashtags', label: 'Hashtag Bundles', icon: <Hash className="w-3.5 h-3.5" /> },
            { id: 'signatures', label: 'Brand Signatures', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'linkinbio', label: 'Link in Bio Builder', icon: <LinkIcon className="w-3.5 h-3.5" /> },
            { id: 'recycling', label: 'Recycling & Queues', icon: <Repeat className="w-3.5 h-3.5" /> },
            { id: 'watermark', label: 'Watermark Studio', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          ].map((tab) => {
            const isActive = activeTool === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTool(tab.id as any)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. HASHTAG BUNDLES MANAGER */}
      {activeTool === 'hashtags' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Saved Bundles (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Saved Hashtag Bundles</h3>
                  <p className="text-xs text-slate-500">Insert up to 30 relevant hashtags into any post with 1 tap.</p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                  {hashtagGroups.length} Groups
                </span>
              </div>

              <div className="space-y-3">
                {hashtagGroups.map((group) => (
                  <div
                    key={group.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                          <Hash className="w-4 h-4" />
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{group.name}</h4>
                        <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {group.tags.length} tags
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(group.tags.join(' '), group.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === group.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === group.id ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteHashtagGroup(group.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete bundle"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {group.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-mono font-medium px-2 py-0.5 bg-slate-50 text-indigo-700 border border-indigo-100 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Create Bundle Box (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 h-fit">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Create New Hashtag Bundle</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Group relevant tags for your campaigns, topics, or audiences.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bundle Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Kano Weddings, Islamic Quotes"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hashtags (separated by spaces or commas)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="#ArewaHalal #HalalMarriage #IslamicWeddings #Kano"
                    value={newGroupTags}
                    onChange={(e) => setNewGroupTags(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddHashtagGroup}
                  className="w-full min-h-[40px] py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Hashtag Bundle</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. SIGNATURES & SHORTCODES */}
      {activeTool === 'signatures' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Brand Signatures & Footers</h3>
                <p className="text-xs text-slate-500">Append contact info, website links, or disclaimers automatically.</p>
              </div>
            </div>

            <div className="space-y-3">
              {signatures.map((sig) => (
                <div key={sig.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{sig.name}</h4>
                      {sig.isDefault && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(sig.content, sig.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === sig.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSignature(sig.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <pre className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-800 font-sans whitespace-pre-line border border-slate-100">
                    {sig.content}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 h-fit">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Add Custom Signature</span>
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Signature Label</label>
                <input
                  type="text"
                  placeholder="e.g. WhatsApp Inquiries, Official Page"
                  value={newSigName}
                  onChange={(e) => setNewSigName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Signature Content</label>
                <textarea
                  rows={4}
                  placeholder="— Follow @ArewaHalalcf2f | WhatsApp: +0704947485"
                  value={newSigContent}
                  onChange={(e) => setNewSigContent(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <button
                type="button"
                onClick={handleAddSignature}
                className="w-full min-h-[40px] py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Save Signature</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. LINK IN BIO BUILDER */}
      {activeTool === 'linkinbio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Settings (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Virtual Link in Bio Builder</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Publer-style micro-landing page for Instagram, TikTok, X, and WhatsApp Bio links.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Profile / Brand Title</label>
                <input
                  type="text"
                  value={linkInBio.title}
                  onChange={(e) => setLinkInBio({ ...linkInBio, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bio Description</label>
                <textarea
                  rows={2}
                  value={linkInBio.bio}
                  onChange={(e) => setLinkInBio({ ...linkInBio, bio: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Connected Quick Action Links</label>
                <div className="space-y-2">
                  {linkInBio.buttons.map((btn, idx) => (
                    <div key={btn.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <input
                          type="text"
                          value={btn.label}
                          onChange={(e) => {
                            const updated = [...linkInBio.buttons];
                            updated[idx].label = e.target.value;
                            setLinkInBio({ ...linkInBio, buttons: updated });
                          }}
                          className="text-xs font-semibold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200 w-full mb-1"
                        />
                        <input
                          type="text"
                          value={btn.url}
                          onChange={(e) => {
                            const updated = [...linkInBio.buttons];
                            updated[idx].url = e.target.value;
                            setLinkInBio({ ...linkInBio, buttons: updated });
                          }}
                          className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 w-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleSaveLinkInBio}
                  className="min-h-[40px] px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Link in Bio Page</span>
                </button>

                <button
                  type="button"
                  onClick={() => copyToClipboard(`https://pulsesocial.app/bio/${linkInBio.title.toLowerCase().replace(/\s+/g, '')}`, 'bio-url')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Live Bio URL</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Mobile Simulator (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <span className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Live Phone Preview</span>
            </span>

            <div className="w-full max-w-[280px] bg-slate-900 rounded-[38px] p-3 shadow-2xl border-4 border-slate-800">
              <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto mb-3" />
              
              <div className="bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 rounded-[30px] p-4 text-white text-center space-y-3 min-h-[460px] flex flex-col justify-between">
                <div className="space-y-2 pt-2">
                  <img
                    src={linkInBio.avatarUrl}
                    alt={linkInBio.title}
                    className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-emerald-400 shadow-md"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center justify-center gap-1">
                      <span>{linkInBio.title}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </h4>
                    <p className="text-[10px] text-slate-300 mt-1 leading-snug line-clamp-2 px-2">
                      {linkInBio.bio}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    {linkInBio.buttons.map((btn) => (
                      <a
                        key={btn.id}
                        href={btn.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] font-semibold transition-all active:scale-98 truncate"
                      >
                        {btn.label}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="pt-2 text-[9px] text-slate-500 font-mono">
                  Powered by Publer Social Media Tools
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 4. RECYCLING & AUTO-SCHEDULE QUEUE */}
      {activeTool === 'recycling' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Evergreen Content Recycling Engine</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically recycle your top-performing updates at optimal time slots without rewriting.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenComposer()}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              + Create Recycled Post
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Repeat className="w-4 h-4 text-emerald-600" />
                <span>Weekly Recurrence</span>
              </span>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Posts tagged with <strong>#WeeklyTip</strong> or <strong>#Reminder</strong> re-queue automatically every 7 days.
              </p>
            </div>

            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-600" />
                <span>Peak Time AutoSchedule</span>
              </span>
              <p className="text-xs text-indigo-800 leading-relaxed">
                Smart queue distributes queued updates between 09:00, 14:30, and 20:00 for highest follower impressions.
              </p>
            </div>

            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-purple-600" />
                <span>Mother App Bridge</span>
              </span>
              <p className="text-xs text-purple-800 leading-relaxed">
                When scheduled time arrives, 1-tap redirect delivers pre-filled content to WhatsApp, Facebook, or X.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. WATERMARK STUDIO */}
      {activeTool === 'watermark' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-slate-900">Brand Watermark & Logo Overlay</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Protect your media and reinforce your brand across all published images and video cards.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Watermark Text or Handle</label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Position</label>
                <select
                  value={watermarkPosition}
                  onChange={(e) => setWatermarkPosition(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Opacity: {watermarkOpacity}%</label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                  className="w-full mt-2 accent-emerald-600"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => showToast('Watermark preferences saved!')}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Save Watermark Settings
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
