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
};
