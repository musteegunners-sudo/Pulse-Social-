import React, { useState } from 'react';
import { 
  Search, 
  Rss, 
  TrendingUp, 
  Newspaper, 
  ExternalLink, 
  CheckCircle, 
  Send, 
  Share2, 
  Sparkles, 
  Filter,
  Check,
  Bookmark
} from 'lucide-react';

interface ArticleItem {
  id: string;
  title: string;
  source: string;
  time: string;
  imageUrl: string;
  category: string;
  summary: string;
  url: string;
}

const SAMPLE_ARTICLES: ArticleItem[] = [
  {
    id: 'art-1',
    title: 'Central Bank of Nigeria advances new fintech regulatory guidelines to boost digital commerce',
    source: 'TechCabal Nigeria',
    time: '2 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80',
    category: 'Finance & Tech',
    summary: 'New digital payment rails and micro-merchant protections launched across Lagos and Abuja financial corridors.',
    url: 'https://techcabal.com',
  },
  {
    id: 'art-2',
    title: 'How Northern Nigerian digital creators are scaling Halal lifestyle and bridal brands across TikTok & WhatsApp',
    source: 'Arewa Tech News',
    time: '4 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    category: 'Culture & Creator',
    summary: 'Social media automation and community building have enabled verified bridal and matrimonial networks to reach millions.',
    url: 'https://arewatech.ng',
  },
  {
    id: 'art-3',
    title: 'Meta and WhatsApp introduce rich channel features for verified community administrators',
    source: 'Social Media Today',
    time: '6 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80',
    category: 'Social Trends',
    summary: 'Group broadcast enhancements and automated deep links make customer engagement seamless on mobile devices.',
    url: 'https://socialmediatoday.com',
  },
  {
    id: 'art-4',
    title: 'Global economic indicators stabilize as tech earnings surpass quarterly estimates',
    source: 'Global Markets Digest',
    time: '8 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80',
    category: 'Business',
    summary: 'Key market averages reflect renewed consumer confidence and increased SaaS software investments.',
    url: 'https://reuters.com',
  },
];

interface PublerExploreViewProps {
  onOpenComposer: (date?: string, post?: any) => void;
}

export const PublerExploreView: React.FC<PublerExploreViewProps> = ({ onOpenComposer }) => {
  const [activeSubTab, setActiveSubTab] = useState<'news' | 'rss' | 'trending'>('news');
  const [selectedFilter, setSelectedFilter] = useState<'latest' | 'advanced'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedArticles, setSavedArticles] = useState<string[]>([]);

  const toggleSaveArticle = (id: string) => {
    setSavedArticles(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleShareArticle = (art: ArticleItem) => {
    onOpenComposer(undefined, {
      id: `post-news-${Date.now()}`,
      content: `📰 ${art.title}\n\n${art.summary}\n\nRead more: ${art.url}\n\n#Nigeria #News #Trending`,
      mediaUrls: [art.imageUrl],
      platforms: ['twitter', 'facebook', 'whatsapp', 'linkedin'],
      targetAccountIds: [],
      scheduledFor: new Date().toISOString(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      author: 'Current User',
    });
  };

  const filtered = SAMPLE_ARTICLES.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4 pb-24 animate-in fade-in duration-200">
      
      {/* 1. Subtabs Bar (Screenshot 3 Top) */}
      <div className="flex border-b border-slate-200 bg-white">
        {[
          { id: 'news', label: 'News' },
          { id: 'rss', label: 'RSS Feeds' },
          { id: 'trending', label: 'Trending posts' },
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
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

      {/* 2. Filter Pills Row (Screenshot 3 Filter Row) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedFilter('latest')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === 'latest'
                ? 'bg-cyan-500 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Latest
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('advanced')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === 'advanced'
                ? 'bg-cyan-500 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Advanced search
          </button>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Nigeria · General
        </span>
      </div>

      {/* 3. Search Articles Input (Screenshot 3 Search) */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search articles"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 shadow-xs"
        />
      </div>

      {/* 4. Unlock Latest Headlines Feature Box (Screenshot 3 Overlay Card) */}
      <div className="bg-gradient-to-b from-white to-cyan-50/50 rounded-2xl p-5 border border-cyan-100 shadow-xs space-y-4">
        <div className="text-center space-y-1">
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            Unlock latest headlines
          </h3>
          <p className="text-xs text-slate-500">
            Real-time news curated for immediate social media curation & publishing
          </p>
        </div>

        <div className="space-y-2.5 max-w-sm mx-auto text-xs text-slate-800">
          {[
            'Keep up with industry news',
            'Filter by location, source and topic',
            'Search for specific keywords',
            'Save queries for future use',
            'Share across your socials',
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-cyan-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className="font-medium text-slate-700">{item}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onOpenComposer()}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          <span>Curate & Share Live Post</span>
        </button>
      </div>

      {/* 5. Live Articles Feed */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Trending Industry Articles
        </h3>

        <div className="space-y-3">
          {filtered.map((art) => (
            <div
              key={art.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden hover:border-cyan-300 transition-all flex flex-col sm:flex-row"
            >
              <div className="sm:w-44 h-36 sm:h-auto shrink-0 relative bg-slate-100">
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 bg-slate-900/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                  {art.category}
                </span>
              </div>

              <div className="p-4 flex flex-col justify-between flex-1 space-y-2">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-600">{art.source}</span>
                    <span>{art.time}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {art.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {art.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => toggleSaveArticle(art.id)}
                    className="text-slate-400 hover:text-cyan-600 p-1"
                    title="Bookmark"
                  >
                    <Bookmark 
                      className={`w-4 h-4 ${
                        savedArticles.includes(art.id) 
                          ? 'text-cyan-500 fill-cyan-500' 
                          : 'text-slate-400'
                      }`} 
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareArticle(art)}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1 transition-all active:scale-98"
                  >
                    <Send className="w-3 h-3" />
                    <span>Share to Socials</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
