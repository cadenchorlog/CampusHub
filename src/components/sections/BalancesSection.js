import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { accountLabel, isWeekendJS, formatDelta } from '../utils/helpers';
import {
  BREAKFAST_START, BREAKFAST_END,
  LUNCH_START, LUNCH_END,
  BRUNCH_START, BRUNCH_END,
  DINNER_START, DINNER_END,
} from '../utils/constants';
import InlineSignIn from '../auth/InlineSignIn';
import FoodSticker from '../ui/FoodSticker';

function parseAmount(str) {
  if (typeof str === 'number') return str;
  const n = parseFloat(String(str || '').replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(n) ? n : 0;
}

// Return the NEXT upcoming meal (not the currently serving one) at Simplot
function upcomingMeal(date) {
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

  // Locate current period if any
  let currentIdx = -1;
  for (let i = 0; i < windows.length; i++) {
    if (minutes >= windows[i].start && minutes <= windows[i].end) { currentIdx = i; break; }
  }
  // After-current candidates first, else the next upcoming
  const afterCurrent = currentIdx >= 0 ? windows.slice(currentIdx + 1) : [];
  const upcoming = afterCurrent.length
    ? afterCurrent
    : windows.filter(w => w.start > minutes);
  if (upcoming.length) {
    const next = upcoming[0];
    return { meal: next, startsIn: next.start - minutes, tomorrow: false };
  }
  // No more today — tomorrow's first meal
  const tomorrow = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowWeekend = isWeekendJS(tomorrow);
  const firstTomorrow = tomorrowWeekend
    ? { name: 'Brunch', kind: 'brunch', emoji: '🥞', start: BRUNCH_START, end: BRUNCH_END }
    : { name: 'Breakfast', kind: 'breakfast', emoji: '🥞', start: BREAKFAST_START, end: BREAKFAST_END };
  const minutesInDay = 24 * 60;
  return {
    meal: firstTomorrow,
    startsIn: (minutesInDay - minutes) + firstTomorrow.start,
    tomorrow: true,
  };
}

// Pick a single "chef's pick" item from menuBuckets
function pickChefPick(menuBuckets, getEntryMeta) {
  if (!Array.isArray(menuBuckets) || menuBuckets.length === 0) return null;
  // Priority: Comfort > Global > Grill Special
  const priorityOf = (station) => {
    const s = String(station || '').toLowerCase();
    if (s.includes('comfort')) return 0;
    if (s.includes('global')) return 1;
    if (s.includes('grill special')) return 2;
    return 3;
  };
  let best = null;
  for (const meal of menuBuckets) {
    for (const entry of (meal || [])) {
      const { label, station, description, tags } = getEntryMeta(entry);
      const lbl = String(label || '').trim();
      const desc = String(description || '').trim();
      if (!lbl || !desc) continue;
      const rank = priorityOf(station);
      if (rank >= 3) continue;
      if (!best || rank < best._rank) {
        best = { label: lbl, description: desc, tags: tags || [], _rank: rank };
        if (rank === 0) break;
      }
    }
    if (best && best._rank === 0) break;
  }
  return best;
}

function emojiForLabel(text) {
  const t = String(text || '').toLowerCase();
  if (t.includes('pizza')) return '🍕';
  if (t.includes('burger')) return '🍔';
  if (t.includes('taco')) return '🌮';
  if (t.includes('salad')) return '🥗';
  if (t.includes('chicken')) return '🍗';
  if (t.includes('rib') || t.includes('beef') || t.includes('steak')) return '🍖';
  if (t.includes('tofu') || t.includes('butter')) return '🧈';
  if (t.includes('soup') || t.includes('chowder')) return '🍲';
  if (t.includes('fries') || t.includes('fry')) return '🍟';
  if (t.includes('cheese')) return '🧀';
  if (t.includes('rice') || t.includes('quinoa') || t.includes('farro')) return '🌾';
  if (t.includes('carrot') || t.includes('root') || t.includes('veggie')) return '🥕';
  if (t.includes('fish') || t.includes('salmon')) return '🐟';
  if (t.includes('pancake') || t.includes('waffle')) return '🥞';
  if (t.includes('egg')) return '🍳';
  return '🍽️';
}

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
  menuStatus,
  menuBuckets,
  getEntryMeta,
  favoritesHook,
}) {
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const coyoteCash = balances.find(b => accountLabel(b.account) === 'Coyote Cash');
  const flex = balances.find(b => accountLabel(b.account) === 'Flex');

  const next = useMemo(() => upcomingMeal(new Date(tick)), [tick]);
  const chefPick = useMemo(() => pickChefPick(menuBuckets, getEntryMeta), [menuBuckets, getEntryMeta]);
  const favoritesAvailableToday = favoritesHook?.getFavoritesAvailableToday?.(menuBuckets) || [];
  const lovesSavedCount = (favoritesHook?.favorites || []).length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
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
            className="mb-3"
            role="status"
            aria-live="polite"
          >
            <div
              className="yc-card-soft"
              style={{ background: 'var(--paper)', fontSize: 14, color: 'var(--ink)' }}
            >
              {shareNotice}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* 1. Coyote Cash hero */}
      {hasSavedCreds && balances.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          style={{ marginBottom: 16 }}
        >
          <div
            className="yc-card"
            style={{
              background: 'linear-gradient(135deg,#FFB877 0%,#FF6A3D 100%)',
              borderColor: 'var(--ink)',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              padding: 22,
            }}
          >
            <div
              style={{
                position: 'absolute', top: -30, right: -20,
                fontSize: 140, opacity: 0.22, lineHeight: 1, pointerEvents: 'none',
              }}
              aria-hidden="true"
            >
              🌵
            </div>
            <div
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                gap: 12, position: 'relative',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11, fontWeight: 800, letterSpacing: '.12em',
                    textTransform: 'uppercase', opacity: 0.95,
                  }}
                >
                  Coyote Cash
                </div>
                <div
                  className="fraunces-num"
                  style={{
                    fontSize: 'clamp(40px, 12vw, 56px)',
                    lineHeight: 1,
                    letterSpacing: '-.035em', marginTop: 4,
                  }}
                >
                  {coyoteCash ? `$${parseAmount(coyoteCash.balance).toFixed(2)}` : '—'}
                </div>
              </div>
              {flex && (
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: 11, fontWeight: 800, opacity: 0.95,
                      textTransform: 'uppercase', letterSpacing: '.12em',
                    }}
                  >
                    Flex
                  </div>
                  <div className="fraunces-num" style={{ fontSize: 26, marginTop: 4 }}>
                    ${parseAmount(flex.balance).toFixed(2)}
                  </div>
                </div>
              )}
            </div>
            <svg
              width="100%" height="30" viewBox="0 0 300 30"
              preserveAspectRatio="none"
              style={{ marginTop: 14, display: 'block', position: 'relative' }}
              aria-hidden="true"
            >
              <path
                d="M0 25 Q30 10 60 20 T120 18 T180 22 T240 16 T300 20 L300 30 L0 30 Z"
                fill="rgba(43,24,16,0.18)"
              />
            </svg>
          </div>
        </motion.div>
      )}

      {/* 2. Quick actions */}
      {hasSavedCreds && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', gap: 10, marginBottom: 16 }}
        >
          <QuickAction
            emoji="🍽️"
            title="What's cookin'?"
            sub="Today's menu"
            bg="#FFF1DB"
            targetTab="menu"
          />
          <QuickAction
            emoji="❤️"
            title="Your loves"
            sub={
              favoritesAvailableToday.length > 0
                ? `${favoritesAvailableToday.length} on today`
                : `${lovesSavedCount} saved`
            }
            bg="#FFE4EC"
            targetTab="favorites"
            highlight={favoritesAvailableToday.length > 0}
          />
        </motion.div>
      )}

      {/* 3. Up next at Simplot */}
      {hasSavedCreds && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 16 }}
        >
          <div
            className="uppercase"
            style={{
              fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700,
              letterSpacing: '.08em', padding: '0 4px 8px',
            }}
          >
            Up next at Simplot
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('yc-goto', { detail: { tab: 'menu' } }))}
            className="yc-card-soft"
            style={{
              width: '100%',
              background: '#F3E3C6',
              display: 'flex', gap: 14, alignItems: 'center',
              cursor: 'pointer', border: 0, textAlign: 'left', fontFamily: 'inherit',
            }}
          >
            <FoodSticker kind={next.meal.kind} size={56} rotate={-6}>
              {next.meal.emoji}
            </FoodSticker>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="fraunces"
                style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1 }}
              >
                {next.meal.name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600, marginTop: 2 }}>
                {next.tomorrow ? 'Tomorrow · ' : ''}Starts in {formatDelta(next.startsIn)}
              </div>
            </div>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6 L15 12 L9 18" />
            </svg>
          </button>
        </motion.div>
      )}

      {/* 4. Chef's pick tonight */}
      {hasSavedCreds && chefPick && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 16 }}
        >
          <div
            className="uppercase"
            style={{
              fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700,
              letterSpacing: '.08em', padding: '0 4px 8px',
            }}
          >
            Chef's pick tonight
          </div>
          <div
            className="yc-card"
            style={{ background: 'var(--paper)' }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 38, lineHeight: 1, flexShrink: 0 }}>
                {emojiForLabel(chefPick.label)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="fraunces"
                  style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.15, color: 'var(--ink)' }}
                >
                  {chefPick.label}
                </div>
                {chefPick.description && (
                  <div
                    style={{
                      fontSize: 13, color: 'var(--ink-soft)',
                      marginTop: 4, lineHeight: 1.4,
                    }}
                  >
                    {chefPick.description}
                  </div>
                )}
                {chefPick.tags && chefPick.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                    {chefPick.tags.map((t) => {
                      const s = String(t || '');
                      const short = s.toLowerCase().includes('made without gluten-containing ingredients') ? 'GF' : s;
                      return (
                        <span key={short + s} className={'yc-sticker ' + short.toLowerCase()}>
                          {short}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {hasSavedCreds && menuStatus === 'loading' && !chefPick && (
        <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--ink-soft)' }}>
          Loading specials…
        </div>
      )}

      {/* Empty-state when logged in but no recognized balance */}
      {hasSavedCreds && status === 'done' && balances.length === 0 && (
        <div className="text-center py-8">
          <div
            className="yc-card-soft"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              background: '#FFE8C4', padding: '14px 18px',
            }}
          >
            <div style={{ fontSize: 28 }}>🤔</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, color: 'var(--ink)' }}>No balance yet</div>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                We couldn't find a Coyote Cash line — try refreshing.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Footer */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          textAlign: 'center',
          padding: '12px 20px 8px',
          fontSize: 12,
          color: 'var(--ink-soft)',
        }}
      >
        Made with <span style={{ color: 'var(--sunset-deep)' }}>♥</span> by Caden
      </motion.div>
      {hasSavedCreds && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
          <button
            onClick={signOut}
            style={{
              padding: '8px 14px', borderRadius: 12, fontWeight: 700, fontSize: 12,
              background: 'var(--paper)', color: 'var(--ink)', border: '2px solid var(--ink)',
              boxShadow: '0 3px 0 rgba(43,24,16,0.2)',
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </motion.section>
  );
}

function QuickAction({ emoji, title, sub, bg, targetTab, highlight }) {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('yc-goto', { detail: { tab: targetTab } }));
  };
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -2 }}
      onClick={handleClick}
      className="yc-card-soft"
      style={{
        flex: 1, background: bg, border: 0, cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
        padding: 14, textAlign: 'left',
        boxShadow: highlight
          ? '0 3px 0 var(--cactus-deep), inset 0 0 0 1.5px var(--cactus-deep)'
          : undefined,
      }}
    >
      <div style={{ fontSize: 24 }}>{emoji}</div>
      <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--ink)' }}>{title}</div>
      <div style={{
        fontSize: 11,
        color: highlight ? 'var(--cactus-deep)' : 'var(--ink-soft)',
        fontWeight: 700,
      }}>
        {sub}
      </div>
    </motion.button>
  );
}
