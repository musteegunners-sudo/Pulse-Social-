/**
 * Utility for client-side keyword matching to suggest relevant social media hashtags
 * based on post draft content and user keywords.
 */

export interface HashtagMatch {
  tag: string;
  matchedKeyword: string;
  category?: string;
  score: number;
}

interface KeywordRule {
  keywords: string[];
  hashtags: string[];
  category: string;
}

// Comprehensive dictionary mapping semantic keywords and phrases to relevant hashtags
const KEYWORD_RULES: KeywordRule[] = [
  // Artificial Intelligence & Data
  {
    category: 'AI & Data',
    keywords: [
      'ai', 'artificial intelligence', 'gemini', 'chatgpt', 'llm', 'machine learning',
      'deep learning', 'neural network', 'automation', 'generative ai', 'prompt',
      'algorithm', 'data science', 'analytics', 'big data', 'nlp', 'computer vision'
    ],
    hashtags: ['#AI', '#ArtificialIntelligence', '#MachineLearning', '#DataScience', '#GenerativeAI', '#TechTrends']
  },

  // Software & Web Development
  {
    category: 'Engineering',
    keywords: [
      'code', 'coding', 'developer', 'software', 'programming', 'frontend', 'backend',
      'fullstack', 'react', 'typescript', 'javascript', 'python', 'github', 'git',
      'api', 'cloud', 'devops', 'kubernetes', 'docker', 'bug', 'deploy', 'architecture',
      'open source', 'webdev', 'mobile app', 'ios', 'android'
    ],
    hashtags: ['#SoftwareEngineering', '#Coding', '#WebDev', '#TypeScript', '#DeveloperCommunity', '#Tech']
  },

  // Startups & SaaS
  {
    category: 'Startups & SaaS',
    keywords: [
      'startup', 'saas', 'founder', 'co-founder', 'mvp', 'scale', 'scaling', 'venture',
      'vc', 'funding', 'seed round', 'series a', 'bootstrap', 'arr', 'mrr', 'churn',
      'retention', 'product market fit', 'pmf', 'build in public', 'investor', 'pitch'
    ],
    hashtags: ['#Startups', '#SaaS', '#BuildInPublic', '#Entrepreneurship', '#VentureCapital', '#Growth']
  },

  // Marketing & Growth
  {
    category: 'Marketing',
    keywords: [
      'marketing', 'seo', 'social media', 'growth', 'growth marketing', 'conversion',
      'funnel', 'traffic', 'inbound', 'copywriting', 'content strategy', 'brand',
      'branding', 'advertising', 'ads', 'campaign', 'audience', 'engagement', 'newsletter'
    ],
    hashtags: ['#Marketing', '#GrowthMarketing', '#ContentStrategy', '#SocialMediaMarketing', '#BrandStrategy']
  },

  // Product & Design
  {
    category: 'Design & UX',
    keywords: [
      'design', 'ui', 'ux', 'ui/ux', 'user experience', 'user interface', 'figma',
      'prototype', 'wireframe', 'design system', 'usability', 'product design',
      'visual design', 'interaction design', 'creativity'
    ],
    hashtags: ['#ProductDesign', '#UIDesign', '#UXDesign', '#DesignSystem', '#Figma', '#Creative']
  },

  // Leadership, Management & Career
  {
    category: 'Leadership & Work',
    keywords: [
      'leadership', 'management', 'leader', 'manager', 'executive', 'ceo', 'cto',
      'team', 'hiring', 'recruiting', 'culture', 'remote work', 'work from home',
      'career', 'productivity', 'strategy', 'mentorship', 'motivation', 'mindset',
      'future of work', 'collaboration'
    ],
    hashtags: ['#Leadership', '#Productivity', '#FutureOfWork', '#Management', '#CompanyCulture', '#CareerGrowth']
  },

  // Sales, Business & E-Commerce
  {
    category: 'Business & Sales',
    keywords: [
      'sales', 'b2b', 'b2c', 'revenue', 'deal', 'closing', 'pipeline', 'client',
      'ecommerce', 'e-commerce', 'shopify', 'retail', 'customer', 'customer success',
      'business', 'strategy', 'profit', 'roi'
    ],
    hashtags: ['#Business', '#Sales', '#Ecommerce', '#CustomerSuccess', '#B2B', '#Strategy']
  },

  // Finance & Crypto
  {
    category: 'Finance',
    keywords: [
      'finance', 'fintech', 'investing', 'investment', 'crypto', 'bitcoin', 'ethereum',
      'blockchain', 'banking', 'economy', 'wealth', 'stock market'
    ],
    hashtags: ['#FinTech', '#Finance', '#Investing', '#Economy', '#Web3']
  },

  // Education & Learning
  {
    category: 'Learning',
    keywords: [
      'learn', 'learning', 'education', 'tutorial', 'guide', 'lesson', 'insight',
      'tips', 'how to', 'framework', 'breakdown', 'course', 'workshop', 'webinar'
    ],
    hashtags: ['#Learning', '#TipsAndTricks', '#LifeLongLearning', '#Education', '#Insights']
  },

  // Community & Events
  {
    category: 'Community',
    keywords: [
      'event', 'conference', 'summit', 'hackathon', 'meetup', 'podcast', 'community',
      'networking', 'announcement', 'launch', 'release', 'update', 'milestone'
    ],
    hashtags: ['#Community', '#Launch', '#ProductUpdate', '#Milestone', '#Events']
  }
];

/**
 * Normalizes text: lowercases, replaces punctuation with spaces for accurate tokenization
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts any hashtags already written directly into the text (e.g. #BuildInPublic)
 */
export function extractEmbeddedHashtags(text: string): string[] {
  const matches = text.match(/#[a-zA-Z0-9_]+/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map(m => m.trim())));
}

/**
 * Matches relevant hashtags from post content based on keyword triggers.
 *
 * @param content The raw post content drafted by the user
 * @param existingTags Array of tags already selected or added
 * @param limit Maximum number of suggested hashtags to return (default 8)
 * @returns Array of HashtagMatch items sorted by relevance score
 */
export function matchHashtagsFromContent(
  content: string,
  existingTags: string[] = [],
  limit: number = 8
): HashtagMatch[] {
  if (!content || !content.trim()) {
    return [];
  }

  const normalized = ` ${normalizeText(content)} `;
  const existingSet = new Set(existingTags.map(t => t.toLowerCase().replace(/^#/, '')));

  // Map to store matched hashtags with their highest score and trigger keyword
  const matchesMap = new Map<string, { matchedKeyword: string; category: string; score: number }>();

  for (const rule of KEYWORD_RULES) {
    for (const kw of rule.keywords) {
      const cleanKw = kw.toLowerCase().trim();
      const isMultiWord = cleanKw.includes(' ');
      
      // Match with word boundary spaces around normalized text
      const regexPattern = isMultiWord
        ? new RegExp(`\\b${cleanKw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i')
        : new RegExp(`\\b${cleanKw}\\b`, 'i');

      if (regexPattern.test(normalized)) {
        // Multi-word exact matches (e.g. "machine learning", "remote work") are higher signal
        const matchWeight = isMultiWord ? 5 : 3;

        for (const tag of rule.hashtags) {
          const rawTag = tag.replace(/^#/, '').toLowerCase();
          
          // Skip if tag is already in existing tags
          if (existingSet.has(rawTag)) {
            continue;
          }

          const existing = matchesMap.get(tag);
          if (!existing) {
            matchesMap.set(tag, {
              matchedKeyword: kw,
              category: rule.category,
              score: matchWeight,
            });
          } else {
            // Accumulate score if multiple keywords trigger the same tag
            matchesMap.set(tag, {
              ...existing,
              score: existing.score + matchWeight,
            });
          }
        }
      }
    }
  }

  // Also check if user typed inline #hashtags in the text that are not yet in existingTags
  const embedded = extractEmbeddedHashtags(content);
  for (const emb of embedded) {
    const rawTag = emb.replace(/^#/, '').toLowerCase();
    if (!existingSet.has(rawTag) && !matchesMap.has(emb)) {
      matchesMap.set(emb, {
        matchedKeyword: emb,
        category: 'In Post',
        score: 10, // highest priority since user explicitly typed it
      });
    }
  }

  // Convert map to array and sort by score descending
  const results: HashtagMatch[] = Array.from(matchesMap.entries()).map(([tag, val]) => ({
    tag,
    matchedKeyword: val.matchedKeyword,
    category: val.category,
    score: val.score,
  }));

  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}

/**
 * Searches the hashtag dictionary for matching suggestions as the user types in the tag input field.
 *
 * @param query The partial text or tag query
 * @param existingTags Tags already in the list
 * @param limit Maximum results
 */
export function searchHashtags(
  query: string,
  existingTags: string[] = [],
  limit: number = 6
): HashtagMatch[] {
  const clean = query.toLowerCase().replace(/^#/, '').trim();
  if (!clean) return [];

  const existingSet = new Set(existingTags.map(t => t.toLowerCase().replace(/^#/, '')));
  const results: HashtagMatch[] = [];
  const seenTags = new Set<string>();

  for (const rule of KEYWORD_RULES) {
    for (const tag of rule.hashtags) {
      const rawTag = tag.replace(/^#/, '').toLowerCase();
      if (existingSet.has(rawTag) || seenTags.has(tag)) {
        continue;
      }

      // Check tag starts with or contains query
      if (rawTag.includes(clean)) {
        seenTags.add(tag);
        const score = rawTag.startsWith(clean) ? 10 : 5;
        results.push({
          tag,
          matchedKeyword: clean,
          category: rule.category,
          score,
        });
      }
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}
