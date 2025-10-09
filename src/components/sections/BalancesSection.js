import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { accountLabel } from '../utils/helpers';
import InlineSignIn from '../auth/InlineSignIn';

export default function BalancesSection({
  hasSavedCreds,
  balances,
  status,
  username,
  password,
  setUsername,
  setPassword,
  error,
  handleLogin,
  onShowMobileNotice,
  signOut,
  shareNotice,
  userCount,
  userCountStatus,
  userCountPct,
  handleGiveawayShare,
  menuStatus,
  menuBuckets,
  getEntryMeta,
  favoritesHook
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="p-0"
    >
      {/* Share notice */}
      <AnimatePresence mode="popLayout">
        {shareNotice && (
          <motion.div
            layout
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 500, damping: 38 }}
            className="mt-4 mb-3"
            role="status"
            aria-live="polite"
          >
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-100">
              {shareNotice}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Favorites available today notice */}
      {favoritesHook && (() => {
        const favoritesAvailableToday = favoritesHook.getFavoritesAvailableToday(menuBuckets);
        return favoritesAvailableToday.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 sm:mb-6"
          >
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 shadow-sm dark:border-green-800 dark:bg-green-900/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-800">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-green-800 dark:text-green-200">
                    🎉 Your favorites are available today!
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    {favoritesAvailableToday.length} of your favorite dishes are on today's menu
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null;
      })()}

      {/* $50 Giveaway Card (only when logged in) */}
      {hasSavedCreds ? (
        <motion.div layout transition={{ type: 'spring', stiffness: 500, damping: 38 }}>
          <div className="mb-3 sm:mb-6">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
              <div className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-200">$50 Giveaway</div>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                After YoteCard hits 300 users I will give away $50 to a random person. Share it so you can win! If you win I will contact you by text.
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{typeof userCount === 'number' ? userCount : (userCountStatus === 'error' ? '—' : '…')} / 300 users</span>
                    <span>{userCountPct}%</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-gray-200 overflow-hidden dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-[#0A84FF] transition-all"
                      style={{ width: userCountPct + '%' }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGiveawayShare}
                  className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                  aria-label="Share giveaway"
                >
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4"
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
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="mb-2 sm:mb-4">
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
            <div className="text-base font-semibold text-gray-800 dark:text-gray-100">Log in to enter the $50 giveaway</div>
            <div className="w-8 h-8 rounded-full border bg-indigo-50 border-indigo-200 dark:border-indigo-700 dark:bg-indigo-900/20 flex items-center justify-center">
              <span role="img" aria-label="gift" className="text-base">🎁</span>
            </div>
          </div>
        </div>
      )}

      {!hasSavedCreds && (
        <InlineSignIn
          username={username}
          password={password}
          setUsername={setUsername}
          setPassword={setPassword}
          status={status}
          error={error}
          handleLogin={handleLogin}
          onShowMobileNotice={onShowMobileNotice}
        />
      )}

      {/* Balances display */}
      {(hasSavedCreds && balances.length > 0) ? (
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
            {balances.map((b, i) => (
              <motion.div
                key={`${accountLabel(b.account) || b.account || 'balance'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-900/60"
                style={{ willChange: 'transform' }}
              >
                <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  {b.balance}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 tracking-wide">
                  {accountLabel(b.account) === "Meals"
                    ? "Meals left this week"
                    : (accountLabel(b.account) || b.account)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      ) : hasSavedCreds && status === "done" ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-700">Could not find a balance label</p>
        </div>
      ) : null}

      {/* Simplot Specials */}
      <div className="mt-4 sm:mt-8">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
          <span className="text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap">
            Simplot Specials
          </span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        {menuStatus === 'loading' && (
          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading specials…</div>
        )}
        {menuStatus === 'done' && Array.isArray(menuBuckets) && menuBuckets.length > 0 && (
          <div className="mt-3 space-y-2 sm:space-y-4">
            {(() => {
              const labels = menuBuckets.length === 2 ? ['Brunch','Dinner'] : ['Breakfast','Lunch','Dinner'];
              // Build Grill Special all-day set (keep first seen meta per unique label)
              const grillMap = new Map(); // normLabel -> { label, description, tags }
              for (const meal of menuBuckets) {
                for (const entry of (meal || [])) {
                  const { label, station, description, tags, notes } = getEntryMeta(entry);
                  
                  // Check if this is a Grill Special item using notes
                  let isGrillSpecial = false;
                  if (notes && notes.length > 0) {
                    const note = notes[0];
                    if (note && note.startsWith('@') && note.toLowerCase().includes('grill special')) {
                      isGrillSpecial = true;
                    }
                  }
                  
                  if (isGrillSpecial) {
                    const norm = String(label || '').trim().toLowerCase();
                    // Home specials: include only items that have descriptions
                    if (norm && !grillMap.has(norm) && String(description || '').trim()) {
                      grillMap.set(norm, { label, description, tags });
                    }
                  }
                }
              }

              const mealCards = menuBuckets.map((meal, idx) => {
                const groups = (meal || []).reduce((acc, entry) => {
                  const { label, station, description, tags, notes } = getEntryMeta(entry);
                  
                  // Extract category from notes (e.g., "@Soup" -> "Soup")
                  let categoryKey = "Other";
                  if (notes && notes.length > 0) {
                    const note = notes[0];
                    if (note && note.startsWith('@')) {
                      categoryKey = note.substring(1); // Remove the @ symbol
                    }
                  }
                  
                  const lbl = String(label || '').trim();
                  if (!lbl) return acc;
                  const bucket = (acc[categoryKey] = acc[categoryKey] || []);
                  // keep insertion order, avoid dups by label
                  const exists = bucket.some(x => (x?.label || '').toLowerCase() === lbl.toLowerCase());
                  if (!exists) bucket.push({ label: lbl, description, tags });
                  return acc;
                }, {});
                const byKey = Object.fromEntries(Object.entries(groups).map(([k,v])=>[k.toLowerCase(), v]));
                const comfortKey = Object.keys(byKey).find(k => k.includes('comfort'));
                const globalKey = Object.keys(byKey).find(k => k.includes('global'));
                // Home specials: only include category picks that have descriptions
                const comfortFirst = comfortKey ? (byKey[comfortKey] || []).find(it => String(it?.description || '').trim()) || null : null;
                const globalFirst = globalKey ? (byKey[globalKey] || []).find(it => String(it?.description || '').trim()) || null : null;
                // Skip Breakfast; show Lunch/Dinner (and Brunch/Dinner on weekends)
                const label = labels[idx] || `Meal ${idx+1}`;
                const isBreakfast = /breakfast/i.test(label);
                if (isBreakfast) return null;
                const picks = [comfortFirst, globalFirst].filter(Boolean);
                if (picks.length === 0) return null;
                return (
                  <div key={`meal-${idx}`} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">{label}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                      {picks.map((it, i) => (
                        <div key={`pick-${idx}-${i}`} className="rounded-lg border border-gray-200 p-3 text-sm text-gray-800 dark:text-gray-100 dark:border-gray-700 dark:bg-gray-900/50">
                          <div className="font-semibold">{it.label}</div>
                          {(it.description || (it.tags && it.tags.length > 0)) && (
                            <div className="mt-1">
                              {it.description && (
                                <div className="text-xs text-gray-600 dark:text-gray-400">{it.description}</div>
                              )}
                              <div className="mt-1 flex flex-wrap gap-1">
                                {(it.tags || []).map((t) => {
                                  const s = String(t || '');
                                  const short = s.toLowerCase().includes('made without gluten-containing ingredients') ? 'GF' : s;
                                  return (
                                    <span key={short + s} className="inline-flex items-center px-2 py-0.5 rounded-md border border-gray-200 bg-white text-[11px] text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">{short}</span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }).filter(Boolean);

              const grillAll = Array.from(grillMap.values());

              return (
                <>
                  {mealCards}
                  {grillAll.length > 0 && (
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Grill Special — All Day</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                        {grillAll.map((it, i) => (
                          <div key={`grill-${i}`} className="rounded-lg border border-gray-200 p-3 text-sm text-gray-800 dark:text-gray-100 dark:border-gray-700 dark:bg-gray-900/50">
                            <div className="font-semibold">{it.label}</div>
                            {(it.description || (it.tags && it.tags.length > 0)) && (
                              <div className="mt-1">
                                {it.description && (
                                  <div className="text-xs text-gray-600 dark:text-gray-400">{it.description}</div>
                                )}
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {(it.tags || []).map((t) => {
                                    const s = String(t || '');
                                    const short = s.toLowerCase().includes('made without gluten-containing ingredients') ? 'GF' : s;
                                    return (
                                      <span key={short + s} className="inline-flex items-center px-2 py-0.5 rounded-md border border-gray-200 bg-white text-[11px] text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">{short}</span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Footer for Balances: small text and sign out above tab bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-3 sm:mt-6 mb-1 sm:mb-2 flex flex-col items-center gap-1 sm:gap-2"
      >
        <p className="text-xs text-gray-600 dark:text-gray-400">Made with ❤️ by Caden Chorlog</p>
        {hasSavedCreds && (
          <button
            onClick={signOut}
            className="px-3 py-1.5 rounded-lg font-medium border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs dark:border-gray-600 dark:bg-gray-900/60 dark:hover:bg-gray-800 dark:text-gray-200"
          >
            Sign out
          </button>
        )}
      </motion.div>
    </motion.section>
  );
}
