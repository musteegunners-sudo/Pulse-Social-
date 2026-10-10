import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Image as ImageIcon, 
  Info, 
  Trash2, 
  Send, 
  Sparkles, 
  Check, 
  Upload, 
  ExternalLink,
  Heart
} from 'lucide-react';
import { MEDIA_PRESETS } from '../../data/initialData';

interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video';
  isFavorite?: boolean;
}

const DEFAULT_MEDIA: MediaItem[] = [
  {
    id: 'm-1',
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
    name: 'Team Brainstorming Session',
    type: 'image',
    isFavorite: true,
  },
  {
    id: 'm-2',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    name: 'Community Creator Spotlight',
    type: 'image',
    isFavorite: false,
  },
  {
    id: 'm-3',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    name: 'Editorial Gradient Card',
    type: 'image',
    isFavorite: true,
  },
  {
    id: 'm-4',
    url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80',
    name: 'Digital Banking & Mobile Wallet',
    type: 'image',
    isFavorite: false,
  },
];

interface PublerMediaLibraryViewProps {
  onOpenComposer: (date?: string, post?: any) => void;
}

export const PublerMediaLibraryView: React.FC<PublerMediaLibraryViewProps> = ({ onOpenComposer }) => {
  const [activeTab, setActiveTab] = useState<'my' | 'favorites' | 'canva'>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaList, setMediaList] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('publer_media_items_v1');
      return saved ? JSON.parse(saved) : DEFAULT_MEDIA;
    } catch {
      return DEFAULT_MEDIA;
    }
  });

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaName, setNewMediaName] = useState('');

  const saveMedia = (updated: MediaItem[]) => {
    setMediaList(updated);
    localStorage.setItem('publer_media_items_v1', JSON.stringify(updated));
  };

  const toggleFavorite = (id: string) => {
    const updated = mediaList.map(m => m.id === id ? { ...m, isFavorite: !m.isFavorite } : m);
    saveMedia(updated);
  };

  const handleDeleteMedia = (id: string) => {
    saveMedia(mediaList.filter(m => m.id !== id));
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaUrl.trim()) return;

    const newItem: MediaItem = {
      id: `media-${Date.now()}`,
      url: newMediaUrl.trim(),
      name: newMediaName.trim() || 'Uploaded Media',
      type: 'image',
      isFavorite: false,
    };

    saveMedia([newItem, ...mediaList]);
    setNewMediaUrl('');
    setNewMediaName('');
    setShowUploadModal(false);
  };

  const handleUseInPost = (item: MediaItem) => {
    onOpenComposer(undefined, {
      id: `post-media-${Date.now()}`,
      content: `Sharing from our official Publer Media Library ✨`,
      mediaUrls: [item.url],
      platforms: ['instagram', 'facebook', 'twitter', 'whatsapp'],
      targetAccountIds: [],
      scheduledFor: new Date().toISOString(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      author: 'Current User',
    });
  };

  const filteredMedia = mediaList.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'favorites') return matchSearch && m.isFavorite;
    return matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24 animate-in fade-in duration-200">
      
      {/* 1. Subtabs Header (Screenshot 5 Top) */}
      <div className="flex border-b border-slate-200 bg-white">
        {[
          { id: 'my', label: 'My media' },
          { id: 'favorites', label: 'Favorites' },
          { id: 'canva', label: 'Canva / Stock' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center transition-all cursor-pointer relative ${
                isActive ? 'text-slate-900 font-extrabold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Subheader: Search + Add New Button (Screenshot 5 Controls) */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search media"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 shadow-xs"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-cyan-600 border border-cyan-400 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add new</span>
        </button>
      </div>

      {/* 3. Media Grid / Empty State (Screenshot 5 Body) */}
      {filteredMedia.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-14 h-14 rounded-full border-2 border-slate-300 text-slate-400 flex items-center justify-center mx-auto text-2xl font-serif">
            ⓘ
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-400">
            There are no media to display
          </h3>
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-xs"
          >
            Upload first image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pt-2">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-cyan-400 transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Favorite Heart Button */}
                <button
                  type="button"
                  onClick={() => toggleFavorite(item.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/60 text-white hover:text-rose-400 transition-colors backdrop-blur-xs"
                >
                  <Heart 
                    className={`w-3.5 h-3.5 ${item.isFavorite ? 'text-rose-500 fill-rose-500' : 'text-white'}`} 
                  />
                </button>
              </div>

              <div className="p-2.5 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 truncate" title={item.name}>
                  {item.name}
                </h4>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleDeleteMedia(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUseInPost(item)}
                    className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Send className="w-2.5 h-2.5" />
                    <span>Use in Post</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Notice Box at Bottom (Screenshot 5 Bottom Alert) */}
      <div className="p-4 bg-cyan-50/70 border border-cyan-200 rounded-2xl flex items-start gap-3 text-xs text-cyan-950">
        <Info className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold">Free plan: Unused media is stored for 7 days</h4>
          <p className="text-[11px] text-cyan-800 leading-relaxed">
            Photos and videos not attached to a post are removed after 7 days. Upgrade to keep your library forever.
          </p>
          <button
            type="button"
            onClick={() => onOpenComposer()}
            className="text-[11px] font-bold text-cyan-700 hover:text-cyan-900 inline-block"
          >
            Upgrade Plan &gt;
          </button>
        </div>
      </div>

      {/* Upload Media Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 w-full max-w-sm space-y-4 animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900">Add Image to Media Library</h3>
            <form onSubmit={handleAddMedia} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Media Title</label>
                <input
                  type="text"
                  placeholder="e.g. Wedding Hall Banner"
                  value={newMediaName}
                  onChange={(e) => setNewMediaName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
