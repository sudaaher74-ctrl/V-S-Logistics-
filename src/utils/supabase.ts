import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseCredentials(): { url: string; key: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = localStorage.getItem('vs_supabase_url') || '';
  const storedKey = localStorage.getItem('vs_supabase_key') || '';

  const url = (storedUrl || envUrl).trim();
  const key = (storedKey || envKey).trim();

  return { url, key };
}

export function saveSupabaseCredentials(url: string, key: string): void {
  localStorage.setItem('vs_supabase_url', url.trim());
  localStorage.setItem('vs_supabase_key', key.trim());
  // Re-initialize client
  initSupabase();
}

let activeClient: SupabaseClient | null = null;

export function initSupabase(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (url && key && url.startsWith('https://')) {
    try {
      activeClient = createClient(url, key);
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      activeClient = null;
    }
  } else {
    activeClient = null;
  }
  return activeClient;
}

// Initial client
initSupabase();

export function getSupabaseClient(): SupabaseClient | null {
  if (!activeClient) {
    return initSupabase();
  }
  return activeClient;
}

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && url.startsWith('https://'));
};

// Proxy export for backward compatibility
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      return undefined;
    }
    const val = (client as any)[prop];
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  }
});
