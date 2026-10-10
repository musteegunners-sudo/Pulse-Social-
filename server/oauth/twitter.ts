import { TwitterApi } from 'twitter-api-v2';
import { prisma } from '../db';

const getBaseUrl = () => {
  return process.env.APP_URL || process.env.API_BASE_URL || 'http://localhost:3000';
};

// In-memory PKCE state cache for OAuth 2.0 PKCE flow
const oauthStateCache = new Map<string, { codeVerifier: string; userId: string; createdAt: number }>();

// Purge expired states (>15 mins old)
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of oauthStateCache.entries()) {
    if (now - val.createdAt > 15 * 60 * 1000) {
      oauthStateCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

export const getTwitterAuthUrl = (userId: string) => {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET must be configured in environment variables.');
  }

  const twitterClient = new TwitterApi({ clientId, clientSecret });
  const redirectUri = `${getBaseUrl()}/api/oauth/twitter/callback`;

  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
    redirectUri,
    { scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'] }
  );

  oauthStateCache.set(state, { codeVerifier, userId, createdAt: Date.now() });
  return { url, state, codeVerifier };
};

export const handleTwitterCallback = async (code: string, state: string) => {
  const cached = oauthStateCache.get(state);
  if (!cached) {
    throw new Error('Invalid or expired OAuth state parameter.');
  }
  oauthStateCache.delete(state);

  const clientId = process.env.TWITTER_CLIENT_ID!;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET!;
  const twitterClient = new TwitterApi({ clientId, clientSecret });
  const redirectUri = `${getBaseUrl()}/api/oauth/twitter/callback`;

  const { client: loggedClient, accessToken, refreshToken } = await twitterClient.loginWithOAuth2({
    code,
    codeVerifier: cached.codeVerifier,
    redirectUri,
  });

  const { data: twitterUser } = await loggedClient.v2.me({
    'user.fields': ['profile_image_url', 'public_metrics'],
  });

  // Upsert into Prisma SocialAccount
  const existing = await prisma.socialAccount.findFirst({
    where: {
      userId: cached.userId,
      platform: 'twitter',
      handle: `@${twitterUser.username}`,
    },
  });

  if (existing) {
    const updated = await prisma.socialAccount.update({
      where: { id: existing.id },
      data: {
        accessToken,
        refreshToken: refreshToken || existing.refreshToken,
        isConnected: true,
        avatarUrl: twitterUser.profile_image_url || existing.avatarUrl,
        followersCount: twitterUser.public_metrics?.followers_count || existing.followersCount,
      },
    });
    return { account: updated, handle: twitterUser.username };
  }

  const account = await prisma.socialAccount.create({
    data: {
      userId: cached.userId,
      platform: 'twitter',
      handle: `@${twitterUser.username}`,
      accessToken,
      refreshToken: refreshToken || '',
      isConnected: true,
      avatarUrl: twitterUser.profile_image_url || null,
      followersCount: twitterUser.public_metrics?.followers_count || 0,
    },
  });

  return { account, handle: twitterUser.username };
};
