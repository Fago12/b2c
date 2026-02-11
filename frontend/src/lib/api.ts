import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchApi(path: string, options: RequestInit = {}) {
  const url = `${API_URL}${path}`;
  
  // Get session token
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

  // Debug: Log the URL being fetched
  console.log(`[API] Fetching: ${url}`);

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
         alert(`API Error (${response.status}): ${errorMessage}`);
       }
       throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    console.error(`[API FATAL] ${url}`, error);
    if (typeof window !== 'undefined') {
        alert(`API Fatal Error: ${error.message}`);
    }
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

