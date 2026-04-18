import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BREAKFAST_START, BREAKFAST_END,
  LUNCH_START, LUNCH_END,
  BRUNCH_START, BRUNCH_END,
  DINNER_START, DINNER_END,
} from '../utils/constants';
import { isWeekendJS, formatDelta } from '../utils/helpers';

function currentMealInfo(date = new Date()) {
  const minutes = date.getHours() * 60 + date.getMinutes();
  const weekend = isWeekendJS(date);
  const windows = weekend
    ? [
        { name: 'Brunch', kind: 'brunch', emoji: '🥞', start: BRUNCH_START, end: BRUNCH_END },
        { name: 'Dinner', kind: 'dinner', emoji: '🍗', start: DINNER_START, end: DINNER_END },
      ]
    : [
        { name: 'Breakfast', kind: 'breakfast', emoji: '🥞', start: BREAKFAST_START, end: BREAKFAST_END },
        { name: 'Lunch',     kind: 'lunch',     emoji: '🌮', start: LUNCH_START,     end: LUNCH_END },
        { name: 'Dinner',    kind: 'dinner',    emoji: '🍗', start: DINNER_START,    end: DINNER_END },
      ];

  // Currently serving?
  for (const w of windows) {
    if (minutes >= w.start && minutes <= w.end) {
      return { state: 'active', meal: w, remaining: w.end - minutes };
    }
  }
  // Upcoming
  const upcoming = windows.find(w => w.start > minutes);
  if (upcoming) return { state: 'upcoming', meal: upcoming, remaining: upcoming.start - minutes };
  return { state: 'closed', meal: windows[windows.length - 1], remaining: 0 };
}

function MealTimerPill({ tick }) {
  const info = useMemo(() => currentMealInfo(new Date(tick || Date.now())), [tick]);
  const { state, meal, remaining } = info;
  const active = state === 'active';
  const closed = state === 'closed';

  const badgeBg = closed ? 'var(--ink)' : active ? 'var(--cactus)' : 'var(--sunset)';
  const badgeText = closed ? 'closed' : active ? `${formatDelta(remaining)} left` : `in ${formatDelta(remaining)}`;
  const vendor = 'Simplot';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="yc-timer-pill"
      style={{
        marginTop: 14,
        width: '100%',
        display: 'flex', alignItems: 'stretch',
        background: 'var(--paper)',
        border: '2.5px solid var(--ink)',
        borderRadius: 999,
        boxShadow: '0 4px 0 var(--ink)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '8px 14px',
          background: badgeBg, color: '#fff',
          borderRight: '2.5px solid var(--ink)',
        }}
      >
        {!closed && (
          <span
            className="animate-pulse-ring"
            style={{
              width: 9, height: 9, borderRadius: '50%',
              background: '#fff', display: 'inline-block',
            }}
          />
        )}
        <span
          className="fraunces-num"
          style={{ fontSize: 16, whiteSpace: 'nowrap' }}
        >
          {badgeText}
        </span>
      </div>
      <div
        style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', minWidth: 0,
        }}
      >
        <span style={{ fontSize: 20, transform: 'rotate(-8deg)', display: 'inline-block' }}>
          {meal.emoji}
        </span>
        <div
          style={{
            minWidth: 0, lineHeight: 1.1, fontSize: 14, fontWeight: 800,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            color: 'var(--ink)',
          }}
        >
          {closed ? 'Dining closed' : `${vendor} · ${meal.name}`}
        </div>
      </div>
    </motion.div>
  );
}

export default function Header({
  headerTitle,
  headerSubtitle,
  activeTab,
  menuVendor,
  setMenuVendor,
}) {
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const now = new Date(tick);
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
  const month = now.toLocaleDateString('en-US', { month: 'long' });
  const day = now.getDate();

  const isBalancesTab = activeTab === 'balances';

  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="pl-1">
          {isBalancesTab ? (
            <>
              <div
                className="text-left text-xs font-semibold tracking-widest uppercase"
                style={{ color: 'var(--ink-soft)', letterSpacing: '.14em' }}
              >
                {weekday}
              </div>
              <h1
                className="fraunces text-left m-0"
                style={{
                  fontSize: 'clamp(44px, 11vw, 64px)',
                  fontWeight: 800,
                  lineHeight: 0.95,
                  letterSpacing: '-.025em',
                  color: 'var(--ink)',
                  marginTop: 4,
                  display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap',
                }}
              >
                <span>{month}</span>
                <span className="fraunces-num" style={{ color: 'var(--sunset)', fontSize: '0.95em' }}>{day}</span>
              </h1>
            </>
          ) : (
            <h1
              className="fraunces text-left m-0"
              style={{
                fontSize: 'clamp(40px, 10vw, 54px)',
                fontWeight: 800,
                lineHeight: 0.95,
                letterSpacing: '-.02em',
                color: 'var(--ink)',
              }}
            >
              {headerTitle}
            </h1>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2 pt-1">
          {activeTab === 'menu' && (
            <div
              style={{
                background: 'var(--ink)', padding: 4, borderRadius: 18,
                display: 'inline-flex', gap: 2, boxShadow: '0 4px 0 #000',
              }}
            >
              {[
                { id: 'simplot', label: 'Simplot' },
                { id: 'mccain',  label: 'McCain' },
              ].map(v => {
                const on = menuVendor === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setMenuVendor(v.id)}
                    aria-pressed={on}
                    style={{
                      border: 0, padding: '8px 14px', borderRadius: 14, cursor: 'pointer',
                      fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
                      background: on ? 'var(--sunset)' : 'transparent',
                      color: on ? '#fff' : 'rgba(255,255,255,.65)',
                      boxShadow: on ? '0 2px 0 var(--sunset-deep)' : 'none',
                      transition: 'background .2s, color .2s, box-shadow .2s',
                    }}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isBalancesTab && <MealTimerPill tick={tick} />}
    </motion.header>
  );
}
