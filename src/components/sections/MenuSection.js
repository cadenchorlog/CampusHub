import React from 'react';
import { motion } from 'framer-motion';
import { formatDelta } from '../utils/helpers';
import { 
  BREAKFAST_END, 
  LUNCH_END, 
  BRUNCH_END, 
  BREAKFAST_START, 
  LUNCH_START, 
  BRUNCH_START, 
  DINNER_START, 
  DINNER_END, 
  DEN_CLOSE, 
  CLOSE_TIME 
} from '../utils/constants';
import MccainMenu from '../menu/MccainMenu';
import SimplotCategory from '../menu/SimplotCategory';

export default function MenuSection({
  menuVendor,
  menuStatus,
  menuError,
  menuData,
  menuBuckets,
  nowTick,
  viewAfterHours,
  setViewAfterHours,
  getEntryMeta,
  favoritesHook
}) {
  // After-hours notice (hide menus after 8:00 PM)
  const minutesNow = (() => { 
    const d = new Date(nowTick); 
    return d.getHours() * 60 + d.getMinutes(); 
  })();
  
  const isAfter10 = minutesNow >= DEN_CLOSE;
  const shouldShowAfterHoursNotice = minutesNow >= CLOSE_TIME && !viewAfterHours;

  if (shouldShowAfterHoursNotice) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="p-0"
      >
        <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                On-campus dining is closed for the evening
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {isAfter10 ? "It's late — try again tomorrow." : "The Den is open until 10 PM for grab-and-go."}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40 flex items-center justify-center">
              <span role="img" aria-label="moon" className="text-base">🌙</span>
            </div>
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setViewAfterHours(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 dark:border-gray-600 dark:bg-gray-900/60 dark:hover:bg-gray-800 dark:text-gray-200"
            >
              View Menu
            </button>
          </div>
        </div>
      </motion.section>
    );
  }

  if (menuVendor === 'simplot') {
    if (minutesNow >= CLOSE_TIME && !viewAfterHours) return null;

    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="p-0"
      >
        {menuStatus === "error" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center">
              <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-gray-700">{menuError || "Could not load menu"}</p>
          </div>
        )}

        {menuStatus === "done" && Array.isArray(menuBuckets) && menuBuckets.length > 0 && (
          <div className="space-y-6">
            {(() => {
              const labels = menuBuckets.length === 2
                ? ["Brunch", "Dinner"]
                : ["Breakfast", "Lunch", "Dinner"].slice(0, menuBuckets.length);

              // Hide past meal menus based on device local time
              const minutes = (() => { 
                const d = new Date(nowTick); 
                return d.getHours() * 60 + d.getMinutes(); 
              })();
              
              const showByIdx = (i) => {
                if (labels.length === 2) {
                  // Brunch, Dinner
                  return i === 0 ? minutes <= BRUNCH_END : true;
                } else {
                  // Breakfast, Lunch, Dinner
                  if (i === 0) return minutes <= BREAKFAST_END;
                  if (i === 1) return minutes <= LUNCH_END;
                  return true; // dinner always shown
                }
              };

              // Build groups for each meal first
              const mealGroups = menuBuckets.map((meal, idx) => {
                // Group by category and dedupe item names per category (case-insensitive)
                const seenByCat = {};
                const groups = (meal || []).reduce((acc, entry) => {
                  const { label, station, description, tags } = getEntryMeta(entry);
                  const key = station || "Other";
                  const lbl = (label || "").trim();
                  if (!lbl) return acc;
                  const norm = lbl.toLowerCase();
                  const bucket = (acc[key] = acc[key] || []);
                  const seen = (seenByCat[key] = seenByCat[key] || new Set());
                  if (!seen.has(norm)) {
                    bucket.push({ label: lbl, description, tags });
                    seen.add(norm);
                  }
                  return acc;
                }, {});
                return { idx, label: labels[idx] || `Meal ${idx+1}`, groups };
              });

              // Cross-meal adjustments
              try {
                const toKey = (k) => String(k || '').toLowerCase();
                const dinner = mealGroups.find(m => toKey(m.label).includes('dinner'));
                const lunch = mealGroups.find(m => toKey(m.label).includes('lunch'));
                const brunch = mealGroups.find(m => toKey(m.label).includes('brunch'));

                // Copy Grill Special from Lunch to Dinner if Dinner missing
                if (dinner && lunch) {
                  const dinnerHasGS = Object.keys(dinner.groups).some(k => toKey(k).includes('grill special'));
                  const lunchGSKey = Object.keys(lunch.groups).find(k => toKey(k).includes('grill special'));
                  if (!dinnerHasGS && lunchGSKey) {
                    dinner.groups[lunchGSKey] = (dinner.groups[lunchGSKey] || []).concat(lunch.groups[lunchGSKey] || []);
                  }
                }

                // Move Comfort from Brunch to Dinner if Dinner missing Comfort
                if (dinner && brunch) {
                  const dinnerHasComfort = Object.keys(dinner.groups).some(k => toKey(k).includes('comfort'));
                  const brunchComfortKey = Object.keys(brunch.groups).find(k => toKey(k).includes('comfort'));
                  if (!dinnerHasComfort && brunchComfortKey) {
                    dinner.groups[brunchComfortKey] = (dinner.groups[brunchComfortKey] || []).concat(brunch.groups[brunchComfortKey] || []);
                    delete brunch.groups[brunchComfortKey];
                  }
                }
              } catch {}

              // First, show meal period headers as separate cards
              const mealHeaders = mealGroups
                .filter(({ idx }) => showByIdx(idx))
                .map(({ label, idx }) => {
                  const labelText = label || `Meal ${idx+1}`;
                  const s = String(labelText).toLowerCase();
                  let emoji = '🥪';
                  let iconBg = 'bg-gray-50 border-gray-200';
                  if (s.includes('breakfast') || s.includes('brunch')) {
                    emoji = '🍳';
                    iconBg = 'bg-amber-50 border-amber-200';
                  } else if (s.includes('lunch')) {
                    emoji = '🥪';
                    iconBg = 'bg-emerald-50 border-emerald-200';
                  } else if (s.includes('dinner')) {
                    emoji = '🍗';
                    iconBg = 'bg-indigo-50 border-indigo-200';
                  }
                  
                  // Compute countdown text: Starts in __ or Ends in __
                  let startMin = null, endMin = null;
                  if (s.includes('breakfast')) { startMin = BREAKFAST_START; endMin = BREAKFAST_END; }
                  else if (s.includes('brunch')) { startMin = BRUNCH_START; endMin = BRUNCH_END; }
                  else if (s.includes('lunch')) { startMin = LUNCH_START; endMin = LUNCH_END; }
                  else if (s.includes('dinner')) { startMin = DINNER_START; endMin = DINNER_END; }
                  
                  let countdownText = '';
                  if (startMin !== null && endMin !== null) {
                    const minutes = (() => { 
                      const d = new Date(nowTick); 
                      return d.getHours() * 60 + d.getMinutes(); 
                    })();
                    if (minutes < startMin) {
                      countdownText = `Starts in ${formatDelta(startMin - minutes)}`;
                    } else if (minutes < endMin) {
                      countdownText = `Ends in ${formatDelta(endMin - minutes)}`;
                    }
                  }

                  return (
                    <div key={`meal-${idx}`} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${iconBg} dark:border-gray-600 dark:bg-gray-800`}>
                          <span className="text-lg">{emoji}</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">{labelText}</div>
                          {countdownText && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">{countdownText}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });

              // Then, collect all categories from all meals and display them as individual sections
              const allCategories = new Map();
              
              mealGroups
                .filter(({ idx }) => showByIdx(idx))
                .forEach(({ groups, label }) => {
                  Object.entries(groups).forEach(([catName, items]) => {
                    if (!allCategories.has(catName)) {
                      allCategories.set(catName, []);
                    }
                    // Add meal label to each item for context
                    const itemsWithMeal = items.map(item => ({
                      ...item,
                      mealLabel: label
                    }));
                    allCategories.get(catName).push(...itemsWithMeal);
                  });
                });

              // Sort categories by priority
              const sortedCategories = Array.from(allCategories.entries()).sort((a, b) => {
                const pri = (k) => {
                  const s = String(k || '').toLowerCase();
                  if (s.includes('comfort')) return 0;
                  if (s.includes('global')) return 1;
                  if (s.includes('grill special')) return 2;
                  return 3;
                };
                const pa = pri(a[0]);
                const pb = pri(b[0]);
                if (pa !== pb) return pa - pb;
                return String(a[0]).localeCompare(String(b[0]));
              });

              const shouldDefaultOpen = (catName) => {
                const s2 = String(catName || '').toLowerCase();
                return s2.includes('comfort') || s2.includes('global') || s2.includes('grill special');
              };

              return (
                <div className="space-y-4">
                  {/* Meal period headers */}
                  {mealHeaders}
                  
                  {/* Categories as individual sections */}
                  {sortedCategories.length === 0 ? (
                    <p className="text-gray-600">No items listed.</p>
                  ) : (
                    sortedCategories.map(([catName, items]) => (
                      <SimplotCategory 
                        key={catName} 
                        name={catName} 
                        items={items} 
                        defaultOpen={shouldDefaultOpen(catName)}
                        favoritesHook={favoritesHook}
                      />
                    ))
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </motion.section>
    );
  }

  // McCain menu
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="p-0"
    >
      {menuStatus === "error" && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-700">{menuError || "Could not load menu"}</p>
        </div>
      )}
      {menuStatus === "loading" && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-[#0A84FF] animate-spin" />
            <span className="text-gray-700 font-medium">Loading menu...</span>
          </div>
        </div>
      )}
      {menuStatus === "done" && (
        <MccainMenu menu={menuData} />
      )}
    </motion.section>
  );
}
