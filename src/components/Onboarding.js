import React, { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Small helper to get OneSignal via the deferred init API
function getOneSignal() {
  return new Promise((resolve) => {
    try {
      if (window.OneSignal) return resolve(window.OneSignal);
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(function(OneSignal) {
        resolve(OneSignal);
      });
    } catch (_) {
      resolve(undefined);
    }
  });
}

function isStandalonePWA() {
  try {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  } catch (_) {
    return false;
  }
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
  onSkipAll,
  mode = 'overlay', // 'overlay' | 'page'
}) {
  const [step, setStep] = useState(0); // 0: welcome, 1: push, 2: sign-in
  const [permState, setPermState] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'default');
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const [signupCountdown, setSignupCountdown] = useState(5);
  const standalone = useMemo(() => isStandalonePWA(), []);
  const isComputer = useMemo(() => {
    try {
      return !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && 
             window.innerWidth > 768;
    } catch (_) {
      return false;
    }
  }, []);

  useEffect(() => {
    // Suppress the legacy HTML popup while onboarding is active
    try { sessionStorage.setItem('onesignal-notify-popup-dismissed', '1'); } catch (_) {}
  }, []);

  async function requestPush() {
    try {
      const OneSignal = await getOneSignal();
      if (OneSignal && OneSignal.Notifications && OneSignal.Notifications.requestPermission) {
        await OneSignal.Notifications.requestPermission();
        try {
          // If user granted, subscribe immediately
          const perm = (typeof Notification !== 'undefined' && Notification.permission) ? Notification.permission : 'default';
          if (perm === 'granted' && OneSignal.Notifications && OneSignal.Notifications.subscribe) {
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

  const [enablingPush, setEnablingPush] = useState(false);

  // Handle sign-up button click
  function handleSignUp() {
    setShowSignupPopup(true);
    setSignupCountdown(5);
  }

  // Countdown effect for sign-up popup
  useEffect(() => {
    if (!showSignupPopup) return;
    
    if (signupCountdown <= 0) {
      window.open('https://cofi.campuscardcenter.com/ch/register/register.html', '_blank');
      setShowSignupPopup(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setSignupCountdown(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [showSignupPopup, signupCountdown]);

  async function handlePrimary() {
    if (step === 0) {
      next();
      return;
    }
    if (step === 1) {
      if (permState === 'denied') {
        next();
        return;
      }
      setEnablingPush(true);
      try {
        await requestPush();
      } finally {
        setEnablingPush(false);
      }
      try {
        const permNow = (typeof Notification !== 'undefined' && Notification.permission) ? Notification.permission : 'default';
        if (permNow === 'granted') {
          next();
        }
      } catch (_) {}
      return;
    }
    // step === 2
    onLogin?.(username, password);
  }

  function next() {
    setStep((s) => Math.min(s + 1, 2));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function complete() {
    onComplete?.();
  }

  const ContainerTag = 'div';
  const containerClass = mode === 'overlay'
    ? 'fixed inset-0 z-[1000] bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 flex flex-col'
    : 'fixed inset-0 z-[1000] text-gray-900 dark:text-gray-100 flex flex-col bg-[#f2f2f7] dark:bg-black';
  const containerStyle = mode === 'overlay'
    ? undefined
    : {
        paddingTop: 'max(env(safe-area-inset-top), 12px)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
        overflow: 'hidden',
        height: '100dvh'
      };

  return (
    <ContainerTag className={containerClass} style={containerStyle}>
      {/* Top bar removed per request (no Skip) */}

        {/* Large title header */}
        <div className="w-full max-w-xl mx-auto pr-4 sm:pr-6 pl-6 sm:pl-10" style={{paddingTop: 4}}>
          <h1 className="text-[42px] md:text-[48px] leading-tight font-extrabold text-black dark:text-white">YoteCard</h1>
          <p className="text-[15px] text-black/70 dark:text-white/80 mt-1">A service from CampusHub</p>
        </div>

        {/* Content area (non-scrollable) with swipe-to-next — no extra left padding on cards */}
        <div className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 pt-4 pb-2 overflow-hidden">
          <motion.div
            className="relative h-full"
            onPanStart={(e) => {
              // Ignore pans starting from inputs/buttons
              const el = e.target;
              if (el && el.closest && el.closest('input, textarea, select, button')) return;
            }}
            onPanEnd={(e, info) => {
              try {
                const el = e.target;
                if (el && el.closest && el.closest('input, textarea, select, button')) return;
              } catch (_) {}
              if (info?.offset?.x != null) {
                const dx = info.offset.x;
                const vx = info.velocity.x || 0;
                const swipeLeft = dx < -60 || vx < -400;
                if (swipeLeft) {
                  if (step < 2) next(); else complete();
                }
              }
            }}
          >
            <AnimatePresence mode="popLayout">
              {step === 0 && (
                <motion.div key="step0" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} transition={{duration:0.2}} className="space-y-4">
                <div className="rounded-3xl bg-white p-5 shadow-[0_0.5px_0_0_rgba(0,0,0,0.2)] dark:bg-[rgba(28,28,30,0.9)]">
                  <h2 className="font-semibold text-[17px] text-black/85 dark:text-white mb-1">Stay in the loop</h2>
                  <p className="text-[15px] text-black/60 dark:text-white/70">Turn on push notifications for balance updates, transactions, and menu changes.</p>
                </div>
                <div className="rounded-3xl bg-white p-5 shadow-[0_0.5px_0_0_rgba(0,0,0,0.2)] dark:bg-[rgba(28,28,30,0.9)]">
                  <h2 className="font-semibold text-[17px] text-black/85 dark:text-white mb-1">Sign in to your account</h2>
                  <p className="text-[15px] text-black/60 dark:text-white/70">Connect your campus card account to see your balances and recent activity.</p>
                </div>
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="step1" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} transition={{duration:0.2}} className="space-y-4">
                <div className="rounded-3xl bg-white p-5 shadow-[0_0.5px_0_0_rgba(0,0,0,0.2)] dark:bg-[rgba(28,28,30,0.9)]">
                  <div>
                    <h2 className="font-semibold text-[17px] text-black/85 dark:text-white">Enable notifications</h2>
                    <p className="text-[15px] text-black/60 dark:text-white/70 mt-1">We’ll only send relevant updates. You can change this anytime in Settings.</p>
                  </div>
                  {permState === 'denied' && (
                    <p className="text-[13px] text-amber-700 dark:text-amber-400 mt-3">You can enable notifications from Settings later.</p>
                  )}
                </div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} transition={{duration:0.2}} className="space-y-4">
                <div className="rounded-3xl bg-white p-5 shadow-[0_0.5px_0_0_rgba(0,0,0,0.2)] dark:bg-[rgba(28,28,30,0.9)]">
                  <h2 className="font-semibold text-[17px] text-black/85 dark:text-white mb-3">Sign in</h2>
                  {/* Inputs only; Sign In handled by primary pill below */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[13px] font-medium text-black/60 dark:text-white/70">Username</label>
                      <input value={username} onChange={(e)=>setUsername(e.target.value)} autoComplete="username" className="mt-1 w-full px-3 h-[44px] rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-[rgba(44,44,46,0.8)]" placeholder="Your username" required />
                    </div>
                    <div>
                      <label className="text-[13px] font-medium text-black/60 dark:text-white/70">Password</label>
                      <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} autoComplete="current-password" className="mt-1 w-full px-3 h-[44px] rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-[rgba(44,44,46,0.8)]" placeholder="••••••••" required />
                    </div>
                    {error && <p className="text-[13px] text-red-600 dark:text-red-400">{String(error)}</p>}
                    {isComputer && (
                      <button type="button" onClick={handleSignUp} className="h-[44px] w-full inline-flex items-center justify-center rounded-2xl text-white bg-[#34c759] font-semibold border border-transparent active:bg-[#30b54d]">
                        Sign up for new account
                      </button>
                    )}
                    <button type="button" onClick={complete} className="h-[44px] w-full inline-flex items-center justify-center rounded-2xl text-[#007aff] bg-transparent font-semibold border border-transparent active:bg-black/5 dark:active:bg-white/10">Skip for now</button>
                  </div>
                </div>
                {!isComputer && (
                  <div className="rounded-3xl bg-white p-5 shadow-[0_0.5px_0_0_rgba(0,0,0,0.2)] dark:bg-[rgba(28,28,30,0.9)]">
                    <h2 className="font-semibold text-[17px] text-black/85 dark:text-white mb-1">Don't have an account?</h2>
                    <p className="text-[15px] text-black/60 dark:text-white/70">Visit <span className="font-medium text-[#007aff]">yotecard.cadenchorlog.com</span> on your computer to complete sign up.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="relative" style={{height: '84px'}}>
        {/* Page indicator pill (left), aligned to Next spacing symmetry */}
        <div className="absolute left-8 sm:left-6" style={{bottom: '24px'}}>
          <div className="h-[36px] px-3 rounded-full border border-black/10 dark:border-white/10 bg-white/90 dark:bg-white/10 backdrop-blur flex items-center gap-2 shadow-sm select-none">
            <div className={`w-2 h-2 rounded-full ${step===0 ? 'bg-gray-900 dark:bg-gray-100' : 'bg-gray-400 dark:bg-gray-700'}`} />
            <div className={`w-2 h-2 rounded-full ${step===1 ? 'bg-gray-900 dark:bg-gray-100' : 'bg-gray-400 dark:bg-gray-700'}`} />
            <div className={`w-2 h-2 rounded-full ${step===2 ? 'bg-gray-900 dark:bg-gray-100' : 'bg-gray-400 dark:bg-gray-700'}`} />
          </div>
        </div>

        {/* Primary pill (right) with symmetric bottom/right spacing; label animates */}
        <div className="absolute right-8 sm:right-6" style={{bottom: '16px'}}>
          <button
            onClick={handlePrimary}
            disabled={(step === 2 && status === 'logging_in') || (step === 1 && enablingPush)}
            className="min-w-[148px] h-[52px] px-6 rounded-full text-[17px] font-semibold text-white bg-[#007aff] shadow-[0_10px_24px_rgba(0,122,255,0.35)] active:shadow-[0_6px_16px_rgba(0,122,255,0.35)] active:translate-y-[1px] disabled:opacity-60"
          >
            <AnimatePresence mode="wait" initial={false}>
              {step === 0 && (
                <motion.span key="next0" initial={{opacity:0, y:4}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-4}} transition={{duration:0.18}}>Next</motion.span>
              )}
              {step === 1 && (
                enablingPush ? (
                  <motion.span key="enabling" initial={{opacity:0, y:4}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-4}} transition={{duration:0.18}}>Enabling…</motion.span>
                ) : permState === 'denied' ? (
                  <motion.span key="skip" initial={{opacity:0, y:4}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-4}} transition={{duration:0.18}}>Skip</motion.span>
                ) : (
                  <motion.span key="enable" initial={{opacity:0, y:4}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-4}} transition={{duration:0.18}}>Enable</motion.span>
                )
              )}
              {step === 2 && (
                status === 'logging_in' ? (
                  <motion.span key="signing" initial={{opacity:0, y:4}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-4}} transition={{duration:0.18}}>Signing in…</motion.span>
                ) : (
                  <motion.span key="signin" initial={{opacity:0, y:4}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-4}} transition={{duration:0.18}}>Sign In</motion.span>
                )
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Sign-up popup modal */}
      <AnimatePresence>
        {showSignupPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Ready to sign up?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Have your <span className="font-semibold text-blue-600 dark:text-blue-400">Student ID card</span> ready!
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Redirecting to registration in:</p>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {signupCountdown}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      window.open('https://cofi.campuscardcenter.com/ch/register/register.html', '_blank');
                      setShowSignupPopup(false);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition-colors"
                  >
                    Go to Registration
                  </button>
                  <button
                    onClick={() => setShowSignupPopup(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ContainerTag>
  );
}
