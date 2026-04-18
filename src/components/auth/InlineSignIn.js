import React from 'react';
import { motion } from 'framer-motion';

export default function InlineSignIn({
  username,
  password,
  setUsername,
  setPassword,
  status,
  error,
  handleLogin,
  onShowMobileNotice,
}) {
  const loading = status === 'logging_in' || status === 'loading_more';
  const inputStyle = {
    width: '100%',
    background: 'var(--paper)',
    border: '2px solid var(--ink)',
    borderRadius: 16,
    padding: '14px 16px',
    fontSize: 16,
    fontFamily: 'inherit',
    color: 'var(--ink)',
    boxShadow: 'inset 0 3px 0 rgba(43,24,16,.06)',
    outline: 'none',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="yc-card"
      style={{ background: 'var(--paper)', marginBottom: 14 }}
    >
      <div
        className="fraunces"
        style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1 }}
      >
        One last thing.
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 8, lineHeight: 1.5 }}>
        Sign in with your Campus Card account to see your balance and recent munches.
      </p>

      <form onSubmit={handleLogin} style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label
            style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)', marginBottom: 6, display: 'block' }}
          >
            Username
          </label>
          <input
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="your Campus Card handle"
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label
            style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)', marginBottom: 6, display: 'block' }}
          >
            Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="yc-btn"
          style={{ width: '100%', marginTop: 4, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: '2px solid #fff', borderTopColor: 'transparent',
                  display: 'inline-block', animation: 'spin 0.8s linear infinite',
                }}
              />
              Signing in…
            </span>
          ) : 'Howl, let me in →'}
        </button>

        <button
          type="button"
          onClick={() => {
            if (window.innerWidth < 768) onShowMobileNotice?.();
            else window.open('https://cofi.campuscardcenter.com/ch/register/register.html', '_blank');
          }}
          style={{
            width: '100%',
            padding: '12px 16px', borderRadius: 16,
            background: 'var(--paper)', color: 'var(--ink)',
            border: '2px solid var(--ink)', boxShadow: '0 3px 0 rgba(43,24,16,0.2)',
            fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Sign up
        </button>

        <div
          className="yc-card-soft"
          style={{
            background: '#F3E3C6',
            display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px',
          }}
        >
          <div style={{ fontSize: 18 }}>🔒</div>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)', lineHeight: 1.4 }}>
            We talk to the Campus Card Center that runs your C of I card. We never see your password.
          </div>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              color: '#9B1C1C', fontWeight: 700, textAlign: 'center',
              padding: 12, background: '#FEE2E2',
              border: '2px solid #FCA5A5', borderRadius: 14, fontSize: 13,
            }}
            aria-live="polite"
          >
            {error}
          </motion.p>
        )}
      </form>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
}
