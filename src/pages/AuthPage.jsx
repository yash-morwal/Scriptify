import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import '../styles/auth.css';

export default function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = React.useState('signin');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [status, setStatus] = React.useState({ type: '', message: '' });
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      navigate('/app', { replace: true });
    }
  }, [user, navigate]);

  const isSignUp = mode === 'signup';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });

        if (error) throw error;

        setStatus({
          type: 'success',
          message: 'Check your inbox to confirm your account before signing in.',
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Something went wrong.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-shell">
        <div className="auth-loading">Loading auth session...</div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-orbit" aria-hidden="true"></div>
      <div className="auth-grid">
        <section className="auth-hero">
          <span className="auth-badge">Scriptify Studio</span>
          <h1 className="auth-title">
            Write scripts that sound human, fast, and unforgettable.
          </h1>
          <p className="auth-subtitle">
            Build your content workspace with curated ideas, reusable projects, and a personal script archive.
          </p>
          <div className="auth-features">
            <div className="auth-feature">
              <span className="auth-dot"></span>
              <div>
                <h3>Creative flow, not chaos</h3>
                <p>Keep ideas, preferences, and scripts together in one focused timeline.</p>
              </div>
            </div>
            <div className="auth-feature">
              <span className="auth-dot"></span>
              <div>
                <h3>Hybrid storage</h3>
                <p>Read your history instantly while the backend handles AI generation.</p>
              </div>
            </div>
            <div className="auth-feature">
              <span className="auth-dot"></span>
              <div>
                <h3>Multi-project ready</h3>
                <p>Spin up new niches or client workspaces without losing focus.</p>
              </div>
            </div>
          </div>
          <div className="auth-footnote">Powered by Supabase Auth and your own AI stack.</div>
        </section>

        <section className="auth-panel">
          <div className="auth-panel-header">
            <div>
              <h2>{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
              <p>{isSignUp ? 'Start building your script vault.' : 'Sign in to continue your work.'}</p>
            </div>
            <div className="auth-mode-toggle">
              <button
                type="button"
                className={isSignUp ? '' : 'active'}
                onClick={() => setMode('signin')}
              >
                Sign in
              </button>
              <button
                type="button"
                className={isSignUp ? 'active' : ''}
                onClick={() => setMode('signup')}
              >
                Sign up
              </button>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignUp && (
              <label>
                Full name
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your name"
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 6 characters"
                required
              />
            </label>

            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>

          {status.message && (
            <div className={`auth-status ${status.type}`}>{status.message}</div>
          )}

          <div className="auth-helper">
            {isSignUp ? 'Already have an account?' : 'New here?'}
            <button
              type="button"
              onClick={() => setMode(isSignUp ? 'signin' : 'signup')}
            >
              {isSignUp ? 'Sign in' : 'Create an account'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
