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
import FoodSticker, { kindFromText } from '../ui/FoodSticker';

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
        <div className="yc-card" style={{ background: 'var(--ink)', color: '#fff', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="animate-float" style={{ fontSize: 42 }}>🌙</div>
            <div style={{ flex: 1 }}>
              <div className="fraunces" style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.1 }}>
                The kitchen's asleep
              </div>
              <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
                {isAfter10 ? "It's late — try again tomorrow." : "The Den is open until 10 PM for grab-and-go."}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <button
              type="button"
              onClick={() => setViewAfterHours(true)}
              className="yc-btn"
              style={{ padding: '10px 14px', fontSize: 13 }}
            >
              Peek the menu anyway
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
            <div className="animate-wobble" style={{ display: 'inline-block', fontSize: 64, marginBottom: 12 }}>🫠</div>
            <p style={{ color: 'var(--ink-soft)', fontWeight: 700 }}>{menuError || "Could not load menu"}</p>
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

              return mealGroups
                .filter(({ idx }) => showByIdx(idx))
                .map(({ groups, label, idx }) => {
                  const labelText = label || `Meal ${idx+1}`;
                  const s = String(labelText).toLowerCase();
                  let emoji = '🥪';
                  if (s.includes('breakfast') || s.includes('brunch')) {
                    emoji = '🍳';
                  } else if (s.includes('lunch')) {
                    emoji = '🥪';
                  } else if (s.includes('dinner')) {
                    emoji = '🍗';
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

                  // Determine current and next meal index to control default expansion
                  const minutes2 = (() => { 
                    const d = new Date(nowTick); 
                    return d.getHours() * 60 + d.getMinutes(); 
                  })();
                  let currentIdx = 0, nextIdx = 0;
                  if (labels.length === 2) {
                    // Brunch, Dinner
                    if (minutes2 <= BRUNCH_END) { currentIdx = 0; nextIdx = 1; } else { currentIdx = 1; nextIdx = 1; }
                  } else {
                    // Breakfast, Lunch, Dinner
                    if (minutes2 <= BREAKFAST_END) { currentIdx = 0; nextIdx = 1; }
                    else if (minutes2 <= LUNCH_END) { currentIdx = 1; nextIdx = 2; }
                    else { currentIdx = 2; nextIdx = 2; }
                  }

                  const isCurOrNextMeal = (idx === currentIdx || idx === nextIdx);
                  const shouldDefaultOpen = (catName) => {
                    if (!isCurOrNextMeal) return false;
                    const s2 = String(catName || '').toLowerCase();
                    return s2.includes('comfort') || s2.includes('global') || s2.includes('grill special');
                  };

                  // Sort categories by priority
                  const entries = Object.entries(groups).sort((a, b) => {
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

                  const isServingNow = idx === currentIdx && (
                    (labels.length === 2 && minutes2 <= BRUNCH_END) ||
                    (labels.length === 3 && (
                      (idx === 0 && minutes2 <= BREAKFAST_END) ||
                      (idx === 1 && minutes2 > BREAKFAST_END && minutes2 <= LUNCH_END) ||
                      (idx === 2 && minutes2 > LUNCH_END)
                    ))
                  );
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className="space-y-3"
                    >
                      {/* Meal period header — playful card */}
                      <div
                        className="yc-card"
                        style={{
                          background: isServingNow ? 'var(--sunset)' : 'var(--paper)',
                          color: isServingNow ? '#fff' : 'var(--ink)',
                          borderColor: 'var(--ink)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <FoodSticker kind={kindFromText(labelText)} size={56} rotate={-6}>{emoji}</FoodSticker>
                          <div style={{ flex: 1 }}>
                            {isServingNow && (
                              <div
                                style={{
                                  fontSize: 11, fontWeight: 800, letterSpacing: '.12em',
                                  textTransform: 'uppercase', opacity: 0.95,
                                }}
                              >
                                Serving now
                              </div>
                            )}
                            <div
                              className="fraunces"
                              style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}
                            >
                              {labelText}
                            </div>
                            {countdownText && (
                              <div style={{
                                fontSize: 13, fontWeight: 700, marginTop: 4,
                                opacity: isServingNow ? 0.95 : 0.8,
                                color: isServingNow ? '#fff' : 'var(--ink-soft)',
                              }}>
                                ⏰ {countdownText}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Categories for this meal */}
                      {entries.length === 0 ? (
                        <p style={{ color: 'var(--ink-soft)', fontSize: 13, fontStyle: 'italic', padding: '0 4px' }}>
                          No items listed.
                        </p>
                      ) : (
                        entries.map(([catName, items]) => (
                          <SimplotCategory
                            key={`${catName}-${idx}`}
                            name={catName}
                            items={items}
                            defaultOpen={shouldDefaultOpen(catName)}
                            favoritesHook={favoritesHook}
                          />
                        ))
                      )}
                    </motion.div>
                  );
                });
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
          <div className="animate-wobble" style={{ display: 'inline-block', fontSize: 64, marginBottom: 12 }}>🫠</div>
          <p style={{ color: 'var(--ink-soft)', fontWeight: 700 }}>{menuError || "Could not load menu"}</p>
        </div>
      )}
      {menuStatus === "loading" && (
        <div className="text-center py-8">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <span
              className="animate-float"
              style={{ fontSize: 32, display: 'inline-block' }}
            >
              🍳
            </span>
            <span style={{ color: 'var(--ink-soft)', fontWeight: 700 }}>Warming up the grill…</span>
          </div>
        </div>
      )}
      {menuStatus === "done" && (
        <MccainMenu menu={menuData} />
      )}
    </motion.section>
  );
}
