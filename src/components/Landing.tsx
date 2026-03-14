import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

type Mode = 'signin' | 'signup';

export function Landing() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    const fn = mode === 'signin' ? signIn : signUp;
    const { error: err } = await fn(email, password);
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (mode === 'signup') {
      setMessage('Check your email to confirm your account, then sign in.');
      setMode('signin');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-sky-50 via-amber-50 to-pink-50 text-slate-900">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-extrabold tracking-tight font-pixel text-center bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500 bg-clip-text text-transparent mb-1">
          Life Dashboard
        </h1>
        <p className="text-center text-slate-600 text-sm mb-8">
          Track your life domains. Your data, synced to your account.
        </p>

        <div
          className="bg-white/90 backdrop-blur-sm border-2 border-indigo-200 rounded-xl shadow-[4px_4px_0_rgba(99,102,241,0.2)] p-6"
          style={{ boxShadow: '4px 4px 0 rgba(99,102,241,0.2), 0 1px 3px rgba(0,0,0,0.08)' }}
        >
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 mb-6" role="tablist" aria-label="Sign in or sign up">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signin'}
              onClick={() => {
                setMode('signin');
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              onClick={() => {
                setMode('signup');
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="landing-email" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                id="landing-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="landing-password" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                id="landing-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 outline-none transition-colors"
              />
              {mode === 'signup' && (
                <p className="mt-1 text-xs text-slate-500">At least 6 characters</p>
              )}
            </div>
            {error && (
              <p className="text-sm text-rose-600 font-medium" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm text-emerald-700 font-medium" role="status">
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-[2px_2px_0_rgba(99,102,241,0.4)] active:shadow-[1px_1px_0_rgba(99,102,241,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? (mode === 'signin' ? 'Signing in…' : 'Creating account…') : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-slate-500 text-xs">
          Your dashboard is stored in your account and synced across devices.
        </p>
      </div>
    </div>
  );
}
