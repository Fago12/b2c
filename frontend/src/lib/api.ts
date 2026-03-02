import { authClient } from "@/lib/auth-client";
import { adminAuthClient } from "@/lib/admin-auth-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchApi(path: string, options: RequestInit = {}) {
  const url = `${apiUrl}${path}`;
  
  // Get session token for storefront
  const { data } = await authClient.getSession();
  const token = data?.session?.token;

  const headers: Record<string, string> = {
    ...options.headers as Record<string, string>,
  };

  if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
  }

  if (token) {
      headers['Authorization'] = `Bearer ${token}`;
  }

  // Region Header Injection
  let regionCode = 'US';
  if (typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      if (cookieStore) {
        regionCode = cookieStore.get('region_code')?.value || 'US';
      }
    } catch (e) {
      // Not in a request context or building
    }
  } else {
    try {
      const { getRegionCodeClient } = await import('@/lib/region');
      regionCode = getRegionCodeClient();
    } catch (e) {}
  }
  headers['x-region-code'] = regionCode;

  // Debug: Log the URL being fetched
  console.log(`[API] Fetching (Storefront): ${url} [Region: ${regionCode}]`);

  return performFetch(url, options, headers);
}

/**
 * Specialized fetch for admin actions that uses the admin-auth session.
 */
export async function fetchAdminApi(path: string, options: RequestInit = {}) {
  const url = `${apiUrl}${path}`;
  
  // Get session token for admin
  const { data } = await adminAuthClient.getSession();
  const token = data?.session?.token;

  const headers: Record<string, string> = {
    ...options.headers as Record<string, string>,
    'x-admin-request': 'true', // Help the backend guard identify the intent
  };

  if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
  }

  if (token) {
      headers['Authorization'] = `Bearer ${token}`;
  }

  console.log(`[API] Fetching (Admin): ${url}`);

  return performFetch(url, options, headers);
}

async function performFetch(url: string, options: RequestInit, headers: Record<string, string>) {
  try {
    const response = await fetch(url, { ...options, headers, credentials: 'include' });
    
    if (!response.ok) {
       let errorMessage = `Request failed with status ${response.status}`;
       try {
         const errorBody = await response.json();
         errorMessage = errorBody.message || errorMessage;
       } catch (e) {}
       
       console.error(`[API ERROR] ${url}`, errorMessage);
       if (typeof window !== 'undefined') {
         // Avoid annoying alerts on every 401/403 if it's a routine check
         if (response.status !== 401 && response.status !== 403) {
            alert(`API Error (${response.status}): ${errorMessage}`);
         }
       }
       throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    console.error(`[API FATAL] ${url}`, error);
    throw error;
  }
}

export const authApi = {
  login: (data: any) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (email: string) => fetchApi('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token: string, password: string) => fetchApi('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
  logout: () => fetchApi('/auth/logout', { method: 'POST' }),
  refresh: () => fetchApi('/auth/refresh', { method: 'POST' }),
};

export const commerceApi = {
  getRegions: () => fetchApi('/regions'),
};

