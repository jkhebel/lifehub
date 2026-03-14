import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import {
  isAuthEnabled,
  getSession,
  onAuthStateChange,
  signInWithPassword as supabaseSignIn,
  signUp as supabaseSignUp,
  signOut as supabaseSignOut,
} from './supabase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthEnabled: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const enabled = isAuthEnabled();

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getSession()
      .then(({ data: { session } }) => {
        if (!cancelled) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
      });
    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      if (!cancelled) setUser(session?.user ?? null);
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [enabled]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabaseSignIn(email, password);
      return { error: error ? new Error(error.message) : null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabaseSignUp(email, password);
      return { error: error ? new Error(error.message) : null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabaseSignOut();
    } catch {
      // Ignore sign-out errors (e.g. network); user state may still clear locally
    }
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    isAuthEnabled: enabled,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      loading: false,
      isAuthEnabled: false,
      signIn: async () => ({ error: new Error('Auth not available') }),
      signUp: async () => ({ error: new Error('Auth not available') }),
      signOut: async () => {},
    };
  }
  return ctx;
}
