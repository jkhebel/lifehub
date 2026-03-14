import { createClient, type SupabaseClient, type User, type Session } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let client: SupabaseClient | null = null;
if (url && anonKey) {
  client = createClient(url, anonKey);
}

export const isAuthEnabled = (): boolean => !!client;

export function getSupabase(): SupabaseClient | null {
  return client;
}

export async function getSession(): Promise<{ data: { session: Session | null } }> {
  if (!client) return { data: { session: null } };
  return client.auth.getSession();
}

export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
): { data: { subscription: { unsubscribe: () => void } } } {
  if (!client) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return client.auth.onAuthStateChange(callback);
}

export async function signInWithPassword(email: string, password: string) {
  if (!client) throw new Error('Auth not configured');
  return client.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string) {
  if (!client) throw new Error('Auth not configured');
  return client.auth.signUp({ email, password });
}

export async function signOut() {
  if (!client) return;
  await client.auth.signOut();
}

export type { User, Session };
