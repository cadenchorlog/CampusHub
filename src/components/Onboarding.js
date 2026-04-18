import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// OneSignal deferred helper
function getOneSignal() {
  return new Promise((resolve) => {
    try {
      if (window.OneSignal) return resolve(window.OneSignal);
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(function (OneSignal) {
        resolve(OneSignal);
      });
    } catch (_) {
      resolve(undefined);
    }
  });
}

export default function Onboarding({
  username,
  password,
  setUsername,
  setPassword,
  status,
  error,
  onLogin,
  onComplete,
}) {
  const [step, setStep] = useState(0); // 0: welcome, 1: notifications, 2: sign-in
  const [permState, setPermState] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [notifChoice, setNotifChoice] = useState(null); // null | 'on' | 'off'
  const [enablingPush, setEnablingPush] = useState(false);

  useEffect(() => {
    try { sessionStorage.setItem('onesignal-notify-popup-dismissed', '1'); } catch (_) {}
  }, []);

  const isComputer = useMemo(() => {
    try {
      return (
        !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) &&
        window.innerWidth > 768
      );
    } catch (_) {
      return false;
    }
  }, []);

  async function requestPush() {
    try {
      const OneSignal = await getOneSignal();
      if (OneSignal && OneSignal.Notifications && OneSignal.Notifications.requestPermission) {
        await OneSignal.Notifications.requestPermission();
        try {
          const perm = (typeof Notification !== 'undefined' && Notification.permission) || 'default';
          if (perm === 'granted' && OneSignal.Notifications.subscribe) {
            try { await (navigator.serviceWorker && navigator.serviceWorker.ready); } catch (_) {}
            await OneSignal.Notifications.subscribe();
          }
        } catch (_) {}
      } else if (typeof Notification !== 'undefined' && Notification.requestPermission) {
        await Notification.requestPermission();
      }
    } catch (_) {
      // no-op
    } finally {
      try { setPermState((typeof Notification !== 'undefined' && Notification.permission) || 'default'); } catch (_) {}
    }
  }

  function goNext() { setStep(s => Math.min(s + 1, 2)); }
  function goBack() { setStep(s => Math.max(s - 1, 0)); }

  async function handlePrimary() {
    if (step === 0) { goNext(); return; }
    if (step === 1) {
      if (notifChoice === 'on' && permState !== 'granted' && permState !== 'denied') {
        setEnablingPush(true);
        try { await requestPush(); } finally { setEnablingPush(false); }
      }
      goNext();
      return;
    }
    // step === 2 — sign in
    if (!username.trim() || !password.trim()) return;
    onLogin?.(username, password);
  }

  const loggingIn = status === 'logging_in';
  const canSignIn = username.trim().length > 0 && password.trim().length > 0;

  const primaryLabel = (() => {
    if (step === 0) return "Let's go →";
    if (step === 1) {
      if (enablingPush) return 'Asking…';
      if (notifChoice === 'on') return 'Notifications on ✓';
      if (notifChoice === 'off') return 'Maybe later →';
      return 'Skip for now →';
    }
    if (step === 2) {
      if (loggingIn) return 'Signing in…';
      return 'Sign in →';
    }
    return '→';
  })();

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', flexDirection: 'column',
        background: '#F5EAD3',
        color: 'var(--ink)',
        paddingTop: 'max(env(safe-area-inset-top), 12px)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 16px)',
      }}
    >
      <div
        style={{
          flex: 1, width: '100%', maxWidth: 420, margin: '0 auto',
          padding: '0 20px 12px',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Top bar — back / paw-print progress / skip */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '4px 4px 20px',
          }}
        >
          {step > 0 ? (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={goBack}
              aria-label="Back"
              style={{
                border: 0, background: 'var(--paper)',
                width: 40, height: 40, borderRadius: 12,
                cursor: 'pointer',
                boxShadow: '0 2px 0 var(--ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 6l-6 6 6 6" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          ) : (
            <div style={{ width: 40 }} />
          )}

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{
                  fontSize: i === step ? 22 : 16,
                  opacity: i <= step ? 1 : 0.28,
                  rotate: i === step ? -6 : 0,
                  scale: i === step ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 24 }}
              >
                🐾
              </motion.div>
            ))}
          </div>

          <button
            onClick={onComplete}
            style={{
              border: 0, background: 'transparent', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)',
            }}
          >
            Skip
          </button>
        </div>

        {/* Step content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <StepWelcome />
              </motion.div>
            )}
            {step === 1 && (
              <motion.div
                key="notif"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <StepNotif
                  notif={notifChoice}
                  setNotif={setNotifChoice}
                  permState={permState}
                />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="signin"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <StepSignIn
                  u={username}
                  setU={setUsername}
                  p={password}
                  setP={setPassword}
                  error={error}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        <div style={{ paddingTop: 16 }}>
          <motion.button
            whileTap={{ y: 3 }}
            onClick={handlePrimary}
            disabled={step === 2 ? (loggingIn || !canSignIn) : false}
            style={{
              width: '100%',
              border: 0, cursor: (step === 2 && !canSignIn) ? 'not-allowed' : 'pointer',
              borderRadius: 18, padding: '16px 20px',
              fontFamily: 'inherit', fontSize: 17, fontWeight: 800,
              color: '#fff', background: 'var(--sunset)',
              boxShadow: '0 5px 0 var(--sunset-deep)',
              opacity: (step === 2 && (!canSignIn || loggingIn)) ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={primaryLabel}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                {primaryLabel}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {step === 2 && !isComputer && (
            <div
              style={{
                textAlign: 'center', marginTop: 12,
                fontSize: 12, color: 'var(--ink-soft)',
              }}
            >
              New here?{' '}
              <span style={{ color: 'var(--sunset-deep)', fontWeight: 800 }}>
                Visit yotecard.cadenchorlog.com on your computer to sign up.
              </span>
            </div>
          )}
          {step === 2 && isComputer && (
            <div
              style={{
                textAlign: 'center', marginTop: 12,
                fontSize: 12, color: 'var(--ink-soft)',
              }}
            >
              New here?{' '}
              <a
                href="https://cofi.campuscardcenter.com/ch/register/register.html"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--sunset-deep)', fontWeight: 800, textDecoration: 'none' }}
              >
                Create an account
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepWelcome() {
  const features = [
    { emoji: '💰', title: 'See your balance', sub: 'Coyote Cash + Flex at a glance', bg: '#FFE8C4' },
    { emoji: '🍔', title: "Today's menu",     sub: 'Simplot, McCain, and The Den',  bg: '#FFD9E3' },
    { emoji: '♥️', title: 'Favorite your faves', sub: "We'll ping when they're served", bg: '#D4F4D8' },
  ];
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', paddingTop: 20,
      }}
    >
      <div
        className="fraunces"
        style={{
          fontSize: 'clamp(52px, 16vw, 72px)',
          fontWeight: 800, letterSpacing: '-.03em', lineHeight: 0.95,
          marginTop: 40,
        }}
      >
        <span>Yote</span>
        <span style={{ color: 'var(--sunset)' }}>Card</span>
      </div>
      <div
        style={{
          fontSize: 14, color: 'var(--ink-soft)',
          marginTop: 10, fontWeight: 600,
        }}
      >
        The tastier way to track your meal plan
      </div>

      <div
        style={{
          marginTop: 32, display: 'flex', flexDirection: 'column',
          gap: 12, width: '100%',
        }}
      >
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="yc-card-soft"
            style={{
              background: f.bg,
              display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left',
            }}
          >
            <div
              style={{
                width: 44, height: 44, borderRadius: 14,
                background: 'var(--paper)',
                border: '2px solid var(--ink)',
                boxShadow: '2px 2px 0 var(--ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, transform: 'rotate(-6deg)', flexShrink: 0,
              }}
            >
              {f.emoji}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--ink)' }}>{f.title}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>{f.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StepNotif({ notif, setNotif, permState }) {
  return (
    <div style={{ paddingTop: 20 }}>
      <div
        className="fraunces"
        style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1 }}
      >
        Stay in<br />the loop.
      </div>
      <div
        style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 10, lineHeight: 1.5 }}
      >
        Get a ping when your favorites hit the menu, your balance runs low, or a new meal's on.
      </div>

      {/* Mock notif preview */}
      <div style={{ marginTop: 24, position: 'relative', padding: 10 }}>
        <motion.div
          initial={{ rotate: 3, y: 8, opacity: 0 }}
          animate={{ rotate: -1.5, y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          style={{
            background: 'rgba(255,248,234,.95)',
            borderRadius: 18, padding: '12px 14px',
            display: 'flex', gap: 10, alignItems: 'center',
            border: '2px solid var(--ink)',
            boxShadow: '0 5px 0 var(--ink)',
          }}
        >
          <div
            style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--sunset)',
              border: '2px solid var(--ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: '#fff', fontWeight: 800,
              fontFamily: 'Fraunces,serif',
            }}
          >
            Y
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700 }}>
              YoteCard · now
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, marginTop: 1 }}>
              Prime rib's on at Simplot 🍖
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
              Dinner just started. Go get it.
            </div>
          </div>
        </motion.div>
      </div>

      <div
        style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setNotif('on')}
          style={{
            border: notif === 'on' ? '2.5px solid var(--ink)' : '2px solid rgba(43,24,16,.15)',
            background: notif === 'on' ? 'var(--sunset)' : 'var(--paper)',
            color: notif === 'on' ? '#fff' : 'var(--ink)',
            borderRadius: 16, padding: '14px 16px',
            cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
            boxShadow: notif === 'on' ? '0 4px 0 var(--sunset-deep)' : '0 3px 0 rgba(43,24,16,.08)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <div style={{ fontSize: 22 }}>🔔</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Turn on notifications</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
              Only the stuff that matters — promise.
            </div>
          </div>
          {notif === 'on' && <div style={{ fontSize: 18 }}>✓</div>}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setNotif('off')}
          style={{
            border: notif === 'off' ? '2.5px solid var(--ink)' : '2px solid rgba(43,24,16,.15)',
            background: notif === 'off' ? '#F3E3C6' : 'var(--paper)',
            color: 'var(--ink)',
            borderRadius: 16, padding: '14px 16px',
            cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
            boxShadow: notif === 'off' ? '0 4px 0 rgba(43,24,16,.2)' : '0 3px 0 rgba(43,24,16,.08)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <div style={{ fontSize: 22 }}>🤫</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Not right now</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
              You can change this anytime in Settings.
            </div>
          </div>
        </motion.button>

        {permState === 'denied' && (
          <p style={{ fontSize: 12, color: '#8B5A00', fontWeight: 700, marginTop: 4 }}>
            Notifications are blocked in your browser — enable them in Settings to get pings.
          </p>
        )}
      </div>
    </div>
  );
}

function StepSignIn({ u, setU, p, setP, error }) {
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
    <div style={{ paddingTop: 20 }}>
      <div
        className="fraunces"
        style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1 }}
      >
        One last<br />thing.
      </div>
      <div
        style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 10, lineHeight: 1.5 }}
      >
        Sign in with your Campus Card account to see your balance and recent munches.
      </div>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label
            style={{
              fontSize: 13, fontWeight: 800, color: 'var(--ink)',
              marginBottom: 6, display: 'block',
            }}
          >
            Username
          </label>
          <input
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            value={u}
            onChange={(e) => setU(e.target.value)}
            placeholder="your Campus Card handle"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            style={{
              fontSize: 13, fontWeight: 800, color: 'var(--ink)',
              marginBottom: 6, display: 'block',
            }}
          >
            Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={p}
            onChange={(e) => setP(e.target.value)}
            placeholder="••••••••"
            style={inputStyle}
          />
        </div>
      </div>

      <div
        className="yc-card-soft"
        style={{
          marginTop: 16,
          background: '#F3E3C6',
          display: 'flex', gap: 10, alignItems: 'center',
          padding: '10px 12px',
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
            border: '2px solid #FCA5A5', borderRadius: 14,
            fontSize: 13, marginTop: 14,
          }}
          aria-live="polite"
        >
          {String(error)}
        </motion.p>
      )}
    </div>
  );
}
