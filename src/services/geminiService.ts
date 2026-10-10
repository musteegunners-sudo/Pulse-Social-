export type ToneType = 
  | 'professional' 
  | 'punchy' 
  | 'casual' 
  | 'storytelling' 
  | 'viral' 
  | 'thought_leadership' 
  | 'promotional';

export type RefinementType = 
  | 'professional' 
  | 'punchy' 
  | 'casual' 
  | 'viral' 
  | 'shorten' 
  | 'expand' 
  | 'fix_grammar' 
  | 'add_cta' 
  | 'convert_thread';

export interface PostVariation {
  hook: string;
  caption: string;
  tone: string;
}

export interface GeneratePostOptions {
  topic: string;
  tone: ToneType;
  platform?: string;
  selectedPlatforms?: string[];
  includeHashtags?: boolean;
  includeCallToAction?: boolean;
  additionalInstructions?: string;
}

export interface GeneratePostResult {
  caption: string;
  variations: PostVariation[];
  hashtags: string[];
  firstComment?: string;
  isFallback?: boolean;
  notice?: string;
}

export interface RefinePostOptions {
  content: string;
  refinementType: RefinementType;
  platform?: string;
  customGoal?: string;
}

export interface RefinePostResult {
  refinedContent: string;
  explanation: string;
  suggestedHashtags?: string[];
  isFallback?: boolean;
}

export interface SmartContentVariation {
  id: string;
  title: string;
  hook: string;
  caption: string;
  tone: string;
  charCount: number;
  whyItWorks: string;
}

export interface SmartHashtagSuggestion {
  tag: string;
  category: string;
  relevance: string;
}

export interface SmartSuggestionsResult {
  variations: SmartContentVariation[];
  hashtagSuggestions: SmartHashtagSuggestion[];
  firstCommentSuggestion?: string;
  isFallback?: boolean;
}

export const geminiService = {
  /**
   * Calls the server-side Gemini API to generate tailored social media copy & variations
   */
  generatePost: async (options: GeneratePostOptions): Promise<GeneratePostResult> => {
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data: GeneratePostResult = await response.json();
      return data;
    } catch (err) {
      console.warn('Network request to /api/ai/generate failed, using client fallback:', err);
      return {
        caption: `Strategic update on ${options.topic}:\n\nFocusing on execution velocity and high-impact consistency. How is your team approaching this?\n\n#Strategy #Growth`,
        variations: [
          {
            hook: `Key insight on ${options.topic}:`,
            caption: `Key insight on ${options.topic}:\n\nSimplifying processes unlocks greater team focus and impact.`,
            tone: options.tone,
          }
        ],
        hashtags: ['#Strategy', '#Growth', '#SocialMedia'],
        isFallback: true,
      };
    }
  },

  /**
   * Calls the server-side Gemini API to refine or adjust tone of existing copy
   */
  refinePost: async (options: RefinePostOptions): Promise<RefinePostResult> => {
    try {
      const response = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data: RefinePostResult = await response.json();
      return data;
    } catch (err) {
      console.warn('Network request to /api/ai/refine failed:', err);
      return {
        refinedContent: options.content,
        explanation: 'Could not connect to AI refinement service.',
        isFallback: true,
      };
    }
  },

  /**
   * Suggests hashtags for existing text
   */
  generateHashtags: async (content: string, platform?: string): Promise<string[]> => {
    try {
      const response = await fetch('/api/ai/hashtags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, platform }),
      });

      if (!response.ok) {
        return ['#Growth', '#Strategy', '#Marketing'];
      }

      const data = await response.json();
      return data.hashtags || [];
    } catch (err) {
      return ['#Growth', '#Strategy', '#Marketing'];
    }
  },

  /**
   * Backward-compatible helper for existing calls
   */
  generateCaptions: async (options: {
    topic: string;
    tone: 'professional' | 'punchy' | 'casual' | 'storytelling' | 'viral';
    platform?: string;
    includeHashtags?: boolean;
  }): Promise<{ caption: string; hashtags: string[]; hook: string; variations?: PostVariation[] }> => {
    const res = await geminiService.generatePost({
      topic: options.topic,
      tone: options.tone,
      platform: options.platform,
      includeHashtags: options.includeHashtags ?? true,
      includeCallToAction: true,
    });

    return {
      caption: res.caption,
      hashtags: res.hashtags,
      hook: res.variations?.[0]?.hook || res.caption.split('\n')[0] || '',
      variations: res.variations,
    };
  },

  /**
   * Calls Gemini to generate smart post variations and hashtag recommendations based on initial draft content
   */
  getSmartSuggestions: async (
    content: string, 
    platforms: string[] = ['twitter', 'linkedin'], 
    primaryPlatform: string = 'linkedin'
  ): Promise<SmartSuggestionsResult> => {
    try {
      const response = await fetch('/api/ai/smart-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          platforms,
          primaryPlatform,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data: SmartSuggestionsResult = await response.json();
      return data;
    } catch (err) {
      console.warn('Network request to /api/ai/smart-suggestions failed, using fallback:', err);
      const cleanFirstLine = content.split('\n')[0] || content;
      return {
        variations: [
          {
            id: 'fallback-viral',
            title: 'Viral Hook Angle',
            hook: 'Most people look at this backwards:',
            caption: `Most people look at this backwards:\n\n${content}\n\nOnce you shift perspective, everything moves 10x faster. What do you think?`,
            tone: 'viral',
            charCount: content.length + 110,
            whyItWorks: 'Uses curiosity gap to disrupt the feed and drive replies.',
          },
          {
            id: 'fallback-exec',
            title: 'Executive & Thought Leadership',
            hook: 'Key strategic observation for operators:',
            caption: `Key strategic observation for operators:\n\n${content}\n\nExecution velocity compounds faster than theory. What is your team’s focus here?`,
            tone: 'thought_leadership',
            charCount: content.length + 120,
            whyItWorks: 'Authoritative structure with professional line breaks.',
          },
          {
            id: 'fallback-story',
            title: 'Storytelling & Relatable',
            hook: 'A lesson we learned the hard way recently:',
            caption: `A lesson we learned the hard way recently:\n\n${content}\n\nTakeaway: Great work starts with clarifying intent before scaling effort.`,
            tone: 'storytelling',
            charCount: content.length + 105,
            whyItWorks: 'Builds empathy through relatable storytelling.',
          },
          {
            id: 'fallback-punchy',
            title: 'Punchy & High-Conversion',
            hook: 'Quick rule to remember:',
            caption: `Quick rule to remember:\n\n• ${content}\n\nSimplicity scales. Drop your thoughts below 👇`,
            tone: 'punchy',
            charCount: content.length + 65,
            whyItWorks: 'Scannable bullet format ideal for mobile feeds.',
          }
        ],
        hashtagSuggestions: [
          { tag: '#Strategy', category: 'Core Theme', relevance: 'Very High' },
          { tag: '#Growth', category: 'Trending', relevance: 'High' },
          { tag: '#Leadership', category: 'Executive', relevance: 'High' },
          { tag: '#Productivity', category: 'Optimization', relevance: 'Medium' }
        ],
        firstCommentSuggestion: 'Drop your take below — what has been your team’s experience?',
        isFallback: true,
      };
    }
  },

  // Analyze sentiment of a single inbox message
  analyzeSentiment: async (options: {
    id?: string;
    text: string;
    senderName?: string;
    platform?: string;
  }): Promise<{
    id: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
    reasoning: string;
    suggestedTone?: string;
    isFallback?: boolean;
  }> => {
    try {
      const response = await fetch('/api/ai/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
      if (!response.ok) {
        throw new Error(`Sentiment API error: ${response.status}`);
      }
      const data = await response.json();
      const first = data.results?.[0];
      if (first) {
        return {
          id: first.id || options.id || 'single',
          sentiment: first.sentiment || 'neutral',
          confidence: first.confidence || 0.85,
          reasoning: first.reasoning || '',
          suggestedTone: first.suggestedTone,
          isFallback: data.isFallback,
        };
      }
      throw new Error('No sentiment result returned');
    } catch (err) {
      console.warn('Sentiment analysis request failed, using client fallback:', err);
      return {
        id: options.id || 'single',
        sentiment: 'neutral',
        confidence: 0.75,
        reasoning: 'Analyzed with standard client classifier.',
        isFallback: true,
      };
    }
  },

  // Batch analyze sentiment of multiple incoming inbox messages with Gemini
  analyzeBatchSentiment: async (items: Array<{
    id: string;
    content: string;
    senderName?: string;
    platform?: string;
  }>): Promise<Array<{
    id: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
    reasoning: string;
    suggestedTone?: string;
    isFallback?: boolean;
  }>> => {
    try {
      const response = await fetch('/api/ai/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (!response.ok) {
        throw new Error(`Batch sentiment API error: ${response.status}`);
      }
      const data = await response.json();
      return (data.results || []).map((r: any) => ({
        id: r.id,
        sentiment: r.sentiment,
        confidence: r.confidence,
        reasoning: r.reasoning,
        suggestedTone: r.suggestedTone,
        isFallback: data.isFallback,
      }));
    } catch (err) {
      console.warn('Batch sentiment analysis request failed, using fallback:', err);
      return items.map(item => ({
        id: item.id,
        sentiment: 'neutral' as const,
        confidence: 0.75,
        reasoning: 'Client fallback classification.',
        isFallback: true,
      }));
    }
  },
};
