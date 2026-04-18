import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";

// Components
import Header from './components/layout/Header';
import BottomNavigation from './components/layout/BottomNavigation';
import BalancesSection from './components/sections/BalancesSection';
import TransactionsSection from './components/sections/TransactionsSection';
import MenuSection from './components/sections/MenuSection';
import FavoritesSection from './components/sections/FavoritesSection';

// Hooks
import { useAuth } from './components/hooks/useAuth';
import { useMenu } from './components/hooks/useMenu';
import { useFavorites } from './components/hooks/useFavorites';

// Utils
import { STORAGE_KEY, LAST_DATA_KEY } from './components/utils/constants';
import { getEntryMeta } from './components/utils/helpers';

/**
 * Coyote Cash Portal — Refactored Component Structure
 * 
 * This version has been refactored into a clean component structure:
 * - Layout components (Header, BottomNavigation)
 * - Section components (BalancesSection, TransactionsSection, MenuSection)
 * - UI components (Loader, etc.)
 * - Custom hooks for state management
 * - Utility functions and constants
 */

export default function App() {
  // Authentication state
  const {
    username,
    setUsername,
    password,
    setPassword,
    status,
    error,
    hasSavedCreds,
    setHasSavedCreds,
    performLogin,
    signOut
  } = useAuth();

  // Menu state
  const {
    menuStatus,
    menuError,
    menuData,
    menuBuckets,
    menuVendor,
    setMenuVendor,
    viewAfterHours,
    setViewAfterHours,
    loadMenu
  } = useMenu();

  // Favorites state
  const favoritesHook = useFavorites();

  // Use only Simplot menu data for favorites matching
  const combinedMenuData = useMemo(() => {
    // Only use Simplot menu data (menuBuckets) for favorites
    return menuBuckets || [];
  }, [menuBuckets]);

  // App state
  const [balances, setBalances] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("balances");
  const [showMobileNotice, setShowMobileNotice] = useState(false);
  const [showIOSInstallPrompt, setShowIOSInstallPrompt] = useState(false);
  const [showAndroidInstallPrompt, setShowAndroidInstallPrompt] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [userCount, setUserCount] = useState(null);
  const [userCountStatus, setUserCountStatus] = useState('idle');
  const [shareNotice, setShareNotice] = useState(null);

  // Refs
  const androidInstallEventRef = useRef(null);
  const shareNoticeTimerRef = useRef(null);
  const autoLoginRunRef = useRef(false);

  // Computed values
  const userCountPct = useMemo(() => {
    try {
      const count = typeof userCount === 'number' ? userCount : 0;
      const pct = Math.round((count / 300) * 100);
      return Math.min(100, Math.max(0, pct));
    } catch { return 0; }
  }, [userCount]);

  // Header content - dynamic based on active tab
  const getHeaderContent = () => {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const monthName = now.toLocaleDateString('en-US', { month: 'long' });
    const dayNumber = now.getDate();
    
    // Add ordinal suffix to day number
    const getOrdinalSuffix = (num) => {
      const j = num % 10;
      const k = num % 100;
      if (j === 1 && k !== 11) return 'st';
      if (j === 2 && k !== 12) return 'nd';
      if (j === 3 && k !== 13) return 'rd';
      return 'th';
    };
    
    const dateTitle = dayName;
    const dateSubtitle = `${monthName} ${dayNumber}${getOrdinalSuffix(dayNumber)}`;
    
    switch (activeTab) {
      case "balances":
        return { title: dateTitle, subtitle: dateSubtitle };
      case "transactions":
        return { title: "Activity", subtitle: "" };
      case "menu":
        return { title: "Menu", subtitle: "" };
      case "favorites":
        return { title: "Loves", subtitle: "" };
      default:
        return { title: dateTitle, subtitle: dateSubtitle };
    }
  };

  const { title: headerTitle, subtitle: headerSubtitle } = getHeaderContent();

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    
    const result = await performLogin(username.trim(), password.trim(), false);
    if (result) {
      setBalances(result.balances);
      setTransactions(result.transactions);
    }
  };

  // Share handler
  const handleGiveawayShare = async () => {
    const url = 'https://yotecard.cadenchorlog.com';
    const title = '$50 Giveaway';
    const text = 'Join the YoteCard Portal and help us reach 300 users!';
    const shareData = { title, text, url };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setShareNotice('Link copied to clipboard!');
        if (shareNoticeTimerRef.current) clearTimeout(shareNoticeTimerRef.current);
        shareNoticeTimerRef.current = setTimeout(() => setShareNotice(null), 3000);
      }
      } catch (e) {
      console.error('Share failed:', e);
    }
  };

  // Android install handler
  const handleAndroidInstall = () => {
    const evt = androidInstallEventRef.current;
    if (!evt) return;
    try {
      evt.prompt();
      } catch (e) {
      console.error('Android install failed:', e);
    }
  };

  // Auto-login on app start if credentials are saved (only once)
  useEffect(() => {
    if (autoLoginRunRef.current) return;
    
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const u = saved?.username;
        const p = saved?.password;
        if (u && p) {
          console.log("[auth] Found saved credentials. Auto sign-in will run now");
          autoLoginRunRef.current = true;
          setUsername(u);
          setPassword(p);
          setHasSavedCreds(true);
          performLogin(u, p, true).then(result => {
            if (result) {
              setBalances(result.balances);
              setTransactions(result.transactions);
            }
          });
        }
      }
    } catch (e) {
      console.warn("[auth] Failed to read saved credentials:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // Load last known balances/transactions immediately on boot so UI has data
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_DATA_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      const age = Date.now() - (saved.updatedAt || 0);
      // Consider data stale after 5 minutes
      if (age > 5 * 60 * 1000) return;
      if (saved.balances) setBalances(saved.balances);
      if (saved.transactions) setTransactions(saved.transactions);
        } catch (e) {
      console.warn('Failed to load last data:', e);
    }
  }, []);

  // Load user count
  useEffect(() => {
    const loadUserCount = async () => {
      setUserCountStatus('loading');
      try {
        const response = await fetch('https://api.cadenchorlog.com/api/login-user-count');
        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          
          let count = 0;
          if (contentType.includes('application/json')) {
            // Try JSON first
            try {
              const data = await response.json();
              count = data.count || data || 0;
            } catch (jsonError) {
              // Fallback to text parsing
              const text = await response.text();
              const parsed = parseInt(text.trim(), 10);
              count = isNaN(parsed) ? 0 : parsed;
            }
          } else {
            // Plain text response
            const text = await response.text();
            const parsed = parseInt(text.trim(), 10);
            count = isNaN(parsed) ? 0 : parsed;
          }
          
          setUserCount(count);
          setUserCountStatus('done');
        } else {
          throw new Error('Failed to load user count');
        }
      } catch (e) {
        console.error('User count failed:', e);
        setUserCountStatus('error');
      }
    };
    loadUserCount();
  }, []);

  // Load menu data on app start (only once)
  useEffect(() => {
    loadMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // Install prompt handlers
  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      androidInstallEventRef.current = e;
          setShowAndroidInstallPrompt(true);
    };

    const onInstalled = () => {
        setShowIOSInstallPrompt(false);
      setShowAndroidInstallPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // Time ticker
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  // Cleanup share notice timer
  useEffect(() => {
    return () => {
      if (shareNoticeTimerRef.current) clearTimeout(shareNoticeTimerRef.current);
    };
  }, []);

  // Quick-action cross-tab navigation from BalancesSection
  useEffect(() => {
    const handler = (e) => {
      const t = e?.detail?.tab;
      if (t) setActiveTab(t);
    };
    window.addEventListener('yc-goto', handler);
    return () => window.removeEventListener('yc-goto', handler);
  }, []);

  return (
    <MotionConfig transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
      <Analytics/>
      <div
        className="min-h-screen relative overflow-x-hidden"
        style={{ color: 'var(--ink)' }}
      >
      <div className="max-w-3xl mx-auto p-6 pb-32 relative z-10">
          <Header
            headerTitle={headerTitle}
            headerSubtitle={headerSubtitle}
            activeTab={activeTab}
            menuVendor={menuVendor}
            setMenuVendor={setMenuVendor}
          />

          <div className="grid grid-cols-1 gap-6 items-start">
          {activeTab === "balances" && (
              <BalancesSection
                hasSavedCreds={hasSavedCreds}
                balances={balances}
                status={status}
                    username={username}
                    password={password}
                    setUsername={setUsername}
                    setPassword={setPassword}
                    error={error}
                    handleLogin={handleLogin}
                    onShowMobileNotice={() => setShowMobileNotice(true)}
                signOut={signOut}
                shareNotice={shareNotice}
                userCount={userCount}
                userCountStatus={userCountStatus}
                userCountPct={userCountPct}
                handleGiveawayShare={handleGiveawayShare}
                menuStatus={menuStatus}
                menuBuckets={combinedMenuData}
                getEntryMeta={getEntryMeta}
                favoritesHook={favoritesHook}
              />
          )}

          {activeTab === "transactions" && (
              <TransactionsSection
                hasSavedCreds={hasSavedCreds}
                transactions={transactions}
                status={status}
                    username={username}
                    password={password}
                    setUsername={setUsername}
                    setPassword={setPassword}
                    error={error}
                    handleLogin={handleLogin}
                    onShowMobileNotice={() => setShowMobileNotice(true)}
                  />
          )}

          {activeTab === "menu" && (
              <MenuSection
                menuVendor={menuVendor}
                menuStatus={menuStatus}
                menuError={menuError}
                menuData={menuData}
                menuBuckets={menuBuckets}
                nowTick={nowTick}
                viewAfterHours={viewAfterHours}
                setViewAfterHours={setViewAfterHours}
                getEntryMeta={getEntryMeta}
                favoritesHook={favoritesHook}
              />
            )}

          {activeTab === "favorites" && (
              <FavoritesSection
                favoritesHook={favoritesHook}
                menuBuckets={combinedMenuData}
              />
            )}
                                        </div>
                                        </div>

        <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Mobile notice modal */}
      <AnimatePresence>
          {showMobileNotice && (
                  <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[50] bg-black/20 flex items-end sm:items-center justify-center"
              role="dialog"
              aria-modal="true"
            >
                  <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="mx-4 mb-[max(1rem,env(safe-area-inset-bottom))] sm:mx-0 sm:mb-0 max-w-md w-full yc-card"
                style={{ background: 'var(--paper)' }}
              >
                <h3 className="fraunces" style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: 0 }}>Sign up on desktop</h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: 13, margin: '8px 0 14px', lineHeight: 1.45 }}>
                You cannot sign up for an account on the app. Visit yotecard.cadenchorlog.com on a laptop to sign up.
              </p>
              <button
                onClick={() => setShowMobileNotice(false)}
                className="yc-btn yc-btn-ink"
                style={{ padding: '10px 14px', fontSize: 13 }}
              >
                Got it
              </button>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Android install prompt */}
      <AnimatePresence>
        {showAndroidInstallPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-black/20 flex items-end sm:items-center justify-center"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="mx-4 mb-[max(1rem,env(safe-area-inset-bottom))] sm:mx-0 sm:mb-0 max-w-md w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900/70"
            >
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Install YoteCard</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Install YoteCard for a faster, app-like experience.</p>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                    onClick={() => { 
                      setShowAndroidInstallPrompt(false); 
                      localStorage.setItem('androidInstallLastPrompt', String(Date.now())); 
                    }}
                  className="px-3 py-1.5 rounded-lg font-medium border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs dark:border-gray-600 dark:bg-gray-900/60 dark:hover:bg-gray-800 dark:text-gray-200"
                >
                  Not now
                </button>
                <button
                  onClick={handleAndroidInstall}
                  className="px-3 py-1.5 rounded-lg font-semibold bg-[#0A84FF] hover:bg-[#0077ED] text-white text-xs"
                >
                  Install
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* iOS install prompt */}
      <AnimatePresence>
        {showIOSInstallPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white dark:bg-[#0b0b0f] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="max-w-md mx-auto p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Install YoteCard App</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                YoteCard requires Home Screen install on iPhone. Follow the steps below.
              </p>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3 dark:border-gray-700 dark:bg-gray-900/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">1</div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
                    Tap the Share button in Safari
                    <svg
                      aria-hidden="true"
                      className="w-4 h-4 text-gray-700 dark:text-gray-300"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3v8" />
                      <path d="M9 6l3-3 3 3" />
                      <path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
                    </svg>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">2</div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">Scroll and choose <span className="font-medium">Add to Home Screen</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">3</div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">Tap <span className="font-medium">Add</span> in the top-right</p>
                </div>
              </div>
              <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                After installing, open the app from your Home Screen.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced keyframes for animations */}
      <style>{`
        @keyframes shimmer { 
          0% { background-position: 0 0; } 
          100% { background-position: 200% 0; } 
        }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
      </div>
    </MotionConfig>
  );
}