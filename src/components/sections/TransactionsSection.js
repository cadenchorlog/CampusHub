import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatDescription, accountLabel } from '../utils/helpers';
import InlineSignIn from '../auth/InlineSignIn';

function parseAmt(raw) {
  if (raw == null) return 0;
  const s = String(raw).replace(/[^0-9.\-+]/g, '');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function emojiForDescription(desc) {
  const s = String(desc || '').toLowerCase();
  if (s.includes('reload') || s.includes('addvalue') || s.includes('deposit')) return '💰';
  if (s.includes('adj')) return '🧾';
  if (s.includes('den')) return '🍿';
  if (s.includes('simplot')) return '🍽️';
  if (s.includes('mccain')) return '🥪';
  if (s.includes('coffee') || s.includes('jewetts')) return '☕';
  if (s.includes('pizza')) return '🍕';
  return '🍴';
}

export default function TransactionsSection({
  hasSavedCreds,
  transactions,
  status,
  username,
  password,
  setUsername,
  setPassword,
  error,
  handleLogin,
  onShowMobileNotice,
}) {
  const summary = useMemo(() => {
    let spent = 0, count = 0;
    let oldestDate = null;
    for (const t of (transactions || [])) {
      const raw = t.amount || t.debit || t.credit || '';
      const n = parseAmt(raw);
      if (n < 0 || String(raw).trim().startsWith('-')) {
        spent += Math.abs(n);
        count += 1;
      }
      const d = t.date || t.Date || '';
      if (d) {
        const parsed = new Date(d);
        if (!isNaN(parsed.getTime())) {
          if (!oldestDate || parsed < oldestDate) oldestDate = parsed;
        }
      }
    }
    let sinceLabel = '';
    if (oldestDate) {
      sinceLabel = oldestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return { spent, count, sinceLabel };
  }, [transactions]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="p-0"
    >
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

      {hasSavedCreds && status === 'done' && transactions.length > 0 && (
        <>
          {/* Dark summary card with sparkline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="yc-card"
            style={{
              background: 'var(--ink)', color: '#fff',
              marginBottom: 14,
              display: 'flex', gap: 14, alignItems: 'center',
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 11, fontWeight: 800, opacity: 0.7,
                  textTransform: 'uppercase', letterSpacing: '.12em',
                }}
              >
                Spent recently
              </div>
              <div
                className="fraunces-num"
                style={{ fontSize: 38, marginTop: 4, lineHeight: 1 }}
              >
                ${summary.spent.toFixed(2)}
              </div>
              <div style={{ fontSize: 12, marginTop: 6, opacity: 0.7 }}>
                {summary.sinceLabel ? `since ${summary.sinceLabel}` : 'this period'}
              </div>
            </div>
            <svg width="92" height="52" viewBox="0 0 90 50">
              <polyline
                points="0,35 15,25 30,40 45,15 60,30 75,10 90,20"
                fill="none" stroke="var(--sunset)" strokeWidth="3"
                strokeLinecap="round" strokeLinejoin="round"
              />
              <circle cx="90" cy="20" r="4" fill="var(--sunset)" />
            </svg>
          </motion.div>

          {/* Row list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {transactions.map((t, i) => {
              const rawAmt = t.amount || t.debit || t.credit || '';
              const amt = parseAmt(rawAmt);
              const isNeg = amt < 0 || String(rawAmt).trim().startsWith('-');
              const desc = formatDescription(t.description || t.memo || '');
              const emoji = emojiForDescription(desc);
              const acc = accountLabel(t.account || '');
              const key = `txn-${t.date || ''}-${t.time || ''}-${desc}-${rawAmt}-${i}`;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
                  className="yc-card-soft"
                  style={{
                    background: 'var(--paper)',
                    display: 'flex', gap: 12, alignItems: 'center',
                    padding: '12px 14px',
                  }}
                >
                  <div
                    style={{
                      width: 46, height: 46, borderRadius: 14,
                      background: isNeg ? '#F3E3C6' : '#D4F4D8',
                      border: '2px solid var(--ink)',
                      boxShadow: '2px 2px 0 var(--ink)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, transform: 'rotate(-5deg)', flexShrink: 0,
                    }}
                  >
                    {emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.2, color: 'var(--ink)' }}
                    >
                      {desc || '—'}
                    </div>
                    <div
                      style={{
                        fontSize: 12, color: 'var(--ink-soft)', marginTop: 3,
                        display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap',
                      }}
                    >
                      <span>{t.date || ''}</span>
                      {acc && (
                        <>
                          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ink-soft)' }} />
                          <span
                            className="yc-sticker"
                            style={{ padding: '1px 7px', fontSize: 10, boxShadow: '1px 1px 0 var(--ink)' }}
                          >
                            {acc}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div
                    className="fraunces-num"
                    style={{
                      fontSize: 20,
                      color: isNeg ? 'var(--sunset-deep)' : 'var(--cactus-deep)',
                    }}
                  >
                    {isNeg ? '-' : '+'}${Math.abs(amt).toFixed(2)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {hasSavedCreds && status === 'done' && transactions.length === 0 && (
        <div className="text-center py-10">
          <div className="animate-wobble" style={{ display: 'inline-block', fontSize: 48 }}>📒</div>
          <p style={{ color: 'var(--ink-soft)', marginTop: 8, fontWeight: 700 }}>
            No munches yet — go chomp something.
          </p>
        </div>
      )}
    </motion.section>
  );
}
