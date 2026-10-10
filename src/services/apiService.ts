import type { SocialAccount, SocialPost } from '../types';

const getToken = () => localStorage.getItem('auth_token');

const request = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

export const apiService = {
  getPosts: async (): Promise<SocialPost[]> => request('/api/posts'),

  savePost: async (post: Partial<SocialPost>): Promise<SocialPost> => {
    const isUpdate = !!post.id;
    const url = isUpdate ? `/api/posts/${post.id}` : '/api/posts';
    const method = isUpdate ? 'PUT' : 'POST';
    return request<SocialPost>(url, {
      method,
      body: JSON.stringify(post),
    });
  },

  deletePost: async (id: string): Promise<{ success: boolean; id: string }> =>
    request(`/api/posts/${id}`, { method: 'DELETE' }),

  getAccounts: async (): Promise<SocialAccount[]> => request('/api/accounts'),

  saveAccount: async (account: Partial<SocialAccount>): Promise<SocialAccount> => {
    const isUpdate = !!account.id;
    const url = isUpdate ? `/api/accounts/${account.id}` : '/api/accounts';
    const method = isUpdate ? 'PUT' : 'POST';
    return request<SocialAccount>(url, {
      method,
      body: JSON.stringify(account),
    });
  },

  deleteAccount: async (id: string): Promise<{ success: boolean; id: string }> =>
    request(`/api/accounts/${id}`, { method: 'DELETE' }),
};

export default apiService;
