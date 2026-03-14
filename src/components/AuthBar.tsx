import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

export function AuthBar() {
  const { user, loading, isAuthEnabled, signIn, signOut } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthEnabled) return null;
  if (loading) {
    return (
      <span className="text-slate-400 text-sm">Loading…</span>
    );
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await signIn(email, password);
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    setShowSignIn(false);
    setEmail('');
    setPassword('');
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-slate-600 text-sm truncate max-w-[120px]" title={user.email}>
          {user.email}
        </span>
        <button
          type="button"
          onClick={() => void signOut().catch(() => {})}
          className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded text-sm border border-slate-200"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowSignIn(!showSignIn)}
        className="px-2 py-1 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded text-sm border border-sky-200"
      >
        Sign in
      </button>
      {showSignIn && (
        <div
          className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg p-4 z-50"
          role="dialog"
          aria-label="Sign in"
        >
          <form onSubmit={handleSignIn} className="space-y-3">
            <div>
              <label htmlFor="auth-email" className="block text-xs font-medium text-slate-600 mb-1">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded"
              />
            </div>
            <div>
              <label htmlFor="auth-password" className="block text-xs font-medium text-slate-600 mb-1">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded"
              />
            </div>
            {error && (
              <p className="text-xs text-rose-600">{error}</p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-2 py-1.5 bg-sky-500 text-white text-sm rounded hover:bg-sky-600 disabled:opacity-50"
              >
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSignIn(false);
                  setError(null);
                }}
                className="px-2 py-1.5 text-slate-600 text-sm rounded border border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
