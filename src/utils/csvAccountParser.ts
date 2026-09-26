import { SocialAccount, SocialPlatform } from '../types';

export interface ParsedAccountRow {
  rowIndex: number;
  isValid: boolean;
  errors: string[];
  account?: SocialAccount;
  matchedExisting?: SocialAccount;
  rawValues: Record<string, string>;
}

export interface CsvParseResult {
  rows: ParsedAccountRow[];
  totalRows: number;
  validCount: number;
  errorCount: number;
  duplicateCount: number;
  detectedHeaders: string[];
}

// Clean and normalize platform names
export const normalizePlatform = (raw: string): SocialPlatform | null => {
  const p = raw.trim().toLowerCase();
  if (['twitter', 'x', 'x.com', 'x/twitter', 'tweet'].includes(p)) return 'twitter';
  if (['linkedin', 'li', 'in'].includes(p)) return 'linkedin';
  if (['instagram', 'ig', 'insta', 'instagram.com'].includes(p)) return 'instagram';
  if (['facebook', 'fb', 'meta', 'facebook.com'].includes(p)) return 'facebook';
  if (['tiktok', 'tt', 'tik tok', 'tiktok.com'].includes(p)) return 'tiktok';
  return null;
};

// Parse follower string like "45000", "45,000", "45.2k", "1.2M"
export const parseFollowers = (raw: string | number | undefined): number => {
  if (typeof raw === 'number') return Math.max(0, Math.floor(raw));
  if (!raw) return 0;

  const str = String(raw).trim().toLowerCase().replace(/,/g, '');
  if (str.endsWith('m')) {
    const num = parseFloat(str.replace('m', ''));
    return isNaN(num) ? 0 : Math.floor(num * 1000000);
  }
  if (str.endsWith('k')) {
    const num = parseFloat(str.replace('k', ''));
    return isNaN(num) ? 0 : Math.floor(num * 1000);
  }
  const parsed = parseInt(str, 10);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
};

// Parse status boolean / string
export const parseConnectionStatus = (raw: string | boolean | undefined): boolean => {
  if (typeof raw === 'boolean') return raw;
  if (!raw) return true; // default connected
  const str = String(raw).trim().toLowerCase();
  if (['false', '0', 'no', 'paused', 'inactive', 'disconnected', 'disabled'].includes(str)) {
    return false;
  }
  return true;
};

// RFC 4180 CSV Row Splitter that handles quoted fields containing commas and quotes
export const parseCsvLine = (text: string): string[] => {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cur += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
};

// Curated avatar generator fallback based on platform & index
export const getFallbackAvatar = (platform: SocialPlatform, seedIndex: number): string => {
  const avatars: Record<SocialPlatform, string[]> = {
    twitter: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    ],
    linkedin: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    ],
    instagram: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    ],
    facebook: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    ],
    tiktok: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    ],
    whatsapp: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    ],
  };

  const list = avatars[platform] || avatars.twitter;
  return list[seedIndex % list.length];
};

/**
 * Parse full CSV file content against existing accounts
 */
export const parseAccountsCsv = (
  csvContent: string,
  existingAccounts: SocialAccount[] = []
): CsvParseResult => {
  // Strip BOM if present
  let cleanContent = csvContent.replace(/^\uFEFF/, '').trim();
  if (!cleanContent) {
    return {
      rows: [],
      totalRows: 0,
      validCount: 0,
      errorCount: 0,
      duplicateCount: 0,
      detectedHeaders: [],
    };
  }

  // Split into lines (handling both CRLF and LF)
  const lines = cleanContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) {
    return {
      rows: [],
      totalRows: 0,
      validCount: 0,
      errorCount: 0,
      duplicateCount: 0,
      detectedHeaders: [],
    };
  }

  // Header line
  const headerLine = lines[0];
  const headers = parseCsvLine(headerLine).map(h => h.trim().toLowerCase());

  // Find column indexes
  const colIndex = {
    platform: headers.findIndex(h => ['platform', 'network', 'channel', 'social_network'].includes(h)),
    handle: headers.findIndex(h => ['handle', 'username', 'screen_name', 'account_handle', 'profile'].includes(h)),
    name: headers.findIndex(h => ['name', 'brand_name', 'brand', 'display_name', 'profile_name'].includes(h)),
    followers: headers.findIndex(h => ['followers', 'followerscount', 'followers_count', 'audience', 'subscribers'].includes(h)),
    status: headers.findIndex(h => ['status', 'isconnected', 'is_connected', 'connected', 'state', 'active'].includes(h)),
    avatar: headers.findIndex(h => ['avatar', 'avatarurl', 'avatar_url', 'image', 'picture', 'photo'].includes(h)),
    lastSyncedAt: headers.findIndex(h => ['lastsyncedat', 'last_synced_at', 'last_sync', 'sync_time'].includes(h)),
  };

  // If standard headers not found, fallback to positional if exactly 3-7 columns
  if (colIndex.platform === -1 && colIndex.handle === -1) {
    colIndex.platform = 0;
    colIndex.handle = 1;
    colIndex.name = 2;
    colIndex.followers = 3;
    colIndex.status = 4;
    colIndex.avatar = 5;
  }

  const parsedRows: ParsedAccountRow[] = [];
  let validCount = 0;
  let errorCount = 0;
  let duplicateCount = 0;

  // Track handles within this CSV batch to flag intra-batch duplicates
  const batchSeenKeys = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine.trim()) continue;

    const values = parseCsvLine(rawLine);
    const rowErrors: string[] = [];

    // Extract values
    const rawPlatform = colIndex.platform !== -1 ? (values[colIndex.platform] || '') : '';
    const rawHandle = colIndex.handle !== -1 ? (values[colIndex.handle] || '') : '';
    const rawName = colIndex.name !== -1 ? (values[colIndex.name] || '') : '';
    const rawFollowers = colIndex.followers !== -1 ? (values[colIndex.followers] || '') : '';
    const rawStatus = colIndex.status !== -1 ? (values[colIndex.status] || '') : '';
    const rawAvatar = colIndex.avatar !== -1 ? (values[colIndex.avatar] || '') : '';
    const rawSynced = colIndex.lastSyncedAt !== -1 ? (values[colIndex.lastSyncedAt] || '') : '';

    const rawValues: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rawValues[h] = values[idx] || '';
    });

    // Validate platform
    const platform = normalizePlatform(rawPlatform);
    if (!platform) {
      rowErrors.push(
        rawPlatform
          ? `Unknown network "${rawPlatform}". Supported: twitter, linkedin, instagram, facebook, tiktok`
          : 'Missing platform/network column'
      );
    }

    // Validate handle
    let cleanHandle = rawHandle.trim();
    if (!cleanHandle) {
      rowErrors.push('Missing profile handle/username');
    } else {
      // Ensure '@' prefix for twitter, instagram, tiktok
      if (['twitter', 'instagram', 'tiktok'].includes(platform || '') && !cleanHandle.startsWith('@')) {
        cleanHandle = `@${cleanHandle}`;
      }
    }

    // Name fallback
    const displayName = rawName.trim() || cleanHandle.replace('@', '') || (platform ? `${platform}_account` : 'Social Profile');

    // Followers & status
    const followersCount = parseFollowers(rawFollowers);
    const isConnected = parseConnectionStatus(rawStatus);

    // Avatar
    let avatarUrl = rawAvatar.trim();
    if (!avatarUrl || !avatarUrl.startsWith('http')) {
      avatarUrl = platform ? getFallbackAvatar(platform, i) : getFallbackAvatar('twitter', i);
    }

    // Check existing accounts
    const matchKey = `${platform || 'unknown'}:${cleanHandle.toLowerCase()}`;
    const matchedExisting = existingAccounts.find(
      a => a.platform === platform && a.handle.toLowerCase() === cleanHandle.toLowerCase()
    );

    if (matchedExisting) {
      duplicateCount++;
    }

    if (batchSeenKeys.has(matchKey)) {
      rowErrors.push(`Duplicate row in CSV for ${cleanHandle} on ${platform}`);
    } else {
      batchSeenKeys.add(matchKey);
    }

    const isValid = rowErrors.length === 0;
    if (isValid) {
      validCount++;
    } else {
      errorCount++;
    }

    let account: SocialAccount | undefined = undefined;
    if (isValid && platform) {
      account = {
        id: matchedExisting ? matchedExisting.id : `acc-imported-${Date.now()}-${i}`,
        platform,
        name: displayName,
        handle: cleanHandle,
        avatarUrl,
        followersCount,
        isConnected,
        lastSyncedAt: rawSynced.trim() || 'Just now',
      };
    }

    parsedRows.push({
      rowIndex: i,
      isValid,
      errors: rowErrors,
      account,
      matchedExisting,
      rawValues,
    });
  }

  return {
    rows: parsedRows,
    totalRows: parsedRows.length,
    validCount,
    errorCount,
    duplicateCount,
    detectedHeaders: headers,
  };
};

/**
 * Generate a rich, formatted sample CSV template string
 */
export const generateSampleCsvTemplate = (): string => {
  return [
    'platform,handle,name,followers,status,avatar_url,last_synced_at',
    'twitter,@acme_ventures,Acme Ventures,52400,active,https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150,10 mins ago',
    'linkedin,acme-enterprise,Acme Enterprise,94200,active,https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150,5 mins ago',
    'instagram,@acme.lifestyle,Acme Lifestyle & Studio,128500,active,https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150,15 mins ago',
    'facebook,AcmeGlobalNews,Acme Global News,76000,active,https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150,1 hour ago',
    'tiktok,@acme_labs,Acme Labs & Tech,310000,paused,https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150,2 hours ago',
  ].join('\n');
};

/**
 * Export current accounts array to standard CSV
 */
export const exportAccountsToCsv = (accounts: SocialAccount[]): string => {
  const headers = ['platform', 'handle', 'name', 'followers', 'status', 'avatar_url', 'last_synced_at'];
  const rows = accounts.map(acc => {
    const escapeCsv = (val: string | number | boolean) => {
      const s = String(val ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    return [
      escapeCsv(acc.platform),
      escapeCsv(acc.handle),
      escapeCsv(acc.name),
      escapeCsv(acc.followersCount),
      escapeCsv(acc.isConnected ? 'active' : 'paused'),
      escapeCsv(acc.avatarUrl),
      escapeCsv(acc.lastSyncedAt || 'Just now'),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};
