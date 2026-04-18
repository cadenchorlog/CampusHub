import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FoodSticker, { kindFromText, emojiForItem } from '../ui/FoodSticker';

export default function FavoritesSection({ favoritesHook, menuBuckets }) {
  const { favorites, removeFavorite } = favoritesHook;
  const favoritesAvailableToday = favoritesHook.getFavoritesAvailableToday(menuBuckets);
  const availableIds = new Set(favoritesAvailableToday.map(i => i.favoriteId));

  if (!favorites || favorites.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="p-0"
      >
        <div style={{ textAlign: 'center', padding: '20px 16px 10px' }}>
          <div className="animate-wobble" style={{ display: 'inline-block' }}>
            <div
              style={{
                width: 140, height: 140, borderRadius: '50%',
                background: 'radial-gradient(circle,var(--pink) 40%,#FFD9E3 70%,transparent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto',
                border: '3px solid var(--ink)', boxShadow: '0 8px 0 var(--ink)',
              }}
            >
              <svg width="64" height="64" viewBox="0 0 24 24" fill="#E44D1F" stroke="#E44D1F" strokeWidth="2" strokeLinejoin="round">
                <path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4 4.5 8-2.5 4.5-9.5 9-9.5 9z" />
              </svg>
            </div>
          </div>
          <div
            className="fraunces"
            style={{ fontSize: 32, fontWeight: 800, marginTop: 20, letterSpacing: '-.02em' }}
          >
            No loves yet!
          </div>
          <p
            style={{
              fontSize: 14, color: 'var(--ink-soft)', marginTop: 10,
              lineHeight: 1.5, maxWidth: 300, margin: '10px auto 0',
            }}
          >
            Tap the <span style={{ color: 'var(--sunset-deep)', fontWeight: 800 }}>♥</span> on any menu item to save it.
            We'll howl at you when your faves hit the menu.
          </p>
          <div
            className="yc-card"
            style={{
              marginTop: 28, background: '#FFF1DB',
              display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left',
            }}
          >
            <div style={{ fontSize: 28 }}>💡</div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.4 }}>
              <b style={{ color: 'var(--ink)' }}>Pro tip:</b> When a love lands on today's menu, you'll get a push so you never miss it.
            </div>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="p-0"
    >
      {/* Available-today banner */}
      {favoritesAvailableToday.length > 0 && (
        <motion.div
          layout
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="yc-card"
          style={{
            background: '#D4F4D8', borderColor: 'var(--cactus-deep)',
            boxShadow: '0 5px 0 var(--cactus-deep)',
            marginBottom: 14, display: 'flex', gap: 12, alignItems: 'center',
          }}
        >
          <div className="animate-float" style={{ fontSize: 36 }}>🎉</div>
          <div style={{ flex: 1 }}>
            <div
              className="fraunces"
              style={{ fontSize: 18, fontWeight: 800, color: 'var(--cactus-deep)', lineHeight: 1.1 }}
            >
              Your loves are on today!
            </div>
            <div style={{ fontSize: 12, color: 'var(--cactus-deep)', opacity: 0.85, marginTop: 2 }}>
              {favoritesAvailableToday.length} of your favorites are being served
            </div>
          </div>
        </motion.div>
      )}

      {/* List */}
      <AnimatePresence>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {favorites.map((favorite, i) => {
            const isToday = availableIds.has(favorite.id);
            const kind = kindFromText(favorite.category);
            const itemEmoji = emojiForItem(favorite.label, favorite.tags);
            return (
              <motion.div
                key={favorite.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="yc-card"
                style={{ background: 'var(--paper)', display: 'flex', gap: 12, alignItems: 'flex-start' }}
              >
                <FoodSticker kind={kind} size={48} rotate={-6}>{itemEmoji}</FoodSticker>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 11, color: 'var(--sunset-deep)', fontWeight: 800,
                      textTransform: 'uppercase', letterSpacing: '.08em',
                    }}
                  >
                    Simplot · {favorite.category}
                  </div>
                  <div
                    style={{
                      display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
                      marginTop: 2,
                    }}
                  >
                    <div
                      className="fraunces"
                      style={{ fontWeight: 800, fontSize: 18, lineHeight: 1.2, color: 'var(--ink)' }}
                    >
                      {favorite.label}
                    </div>
                    {isToday && (
                      <motion.span
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        className="yc-sticker veg"
                        style={{ fontSize: 10 }}
                      >
                        on today
                      </motion.span>
                    )}
                  </div>
                  {favorite.description && (
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.4 }}>
                      {favorite.description}
                    </div>
                  )}
                  {favorite.tags && favorite.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
                      {favorite.tags.map((t, idx) => {
                        const s = String(t || '');
                        const short = s.toLowerCase().includes('made without gluten-containing ingredients') ? 'GF' : s;
                        return (
                          <span key={idx} className={'yc-sticker ' + short.toLowerCase()}>
                            {short}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                <button
                  className="yc-heart-btn favved"
                  onClick={() => removeFavorite(favorite.id)}
                  title="Remove"
                  aria-label="Remove from favorites"
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#FF6A3D" stroke="#FF6A3D" strokeWidth="2" strokeLinejoin="round">
                    <path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4 4.5 8-2.5 4.5-9.5 9-9.5 9z" />
                  </svg>
                </button>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>
    </motion.section>
  );
}
