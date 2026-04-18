import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FoodSticker, { kindFromText } from '../ui/FoodSticker';
import { burstFromEvent } from '../ui/confetti';

export default function SimplotCategory({ name, items, defaultOpen = false, favoritesHook }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const kind = kindFromText(name);

  return (
    <motion.div
      layout
      className="yc-card-soft"
      style={{ padding: 0, background: open ? 'var(--paper)' : '#F3E3C6', overflow: 'hidden' }}
    >
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          width: '100%', border: 0, background: 'transparent', cursor: 'pointer',
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
          textAlign: 'left', fontFamily: 'inherit',
        }}
      >
        <FoodSticker kind={kind} size={40} rotate={-6} />
        <div style={{ flex: 1 }}>
          <div
            className="fraunces"
            style={{ fontSize: 19, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1 }}
          >
            {name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600 }}>
            {items.length} item{items.length === 1 ? '' : 's'}
          </div>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9 L12 15 L18 9" />
          </svg>
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.length === 0 ? (
                <p
                  style={{
                    padding: '4px 6px 10px',
                    fontSize: 13, color: 'var(--ink-soft)', fontStyle: 'italic',
                  }}
                >
                  Menu coming soon — check back closer to mealtime 🐾
                </p>
              ) : (() => {
                const normalized = items.map((it, idx) => {
                  const label = typeof it === 'string' ? it : (it?.label || '');
                  const description = typeof it === 'object' ? (it?.description || '') : '';
                  const tags = typeof it === 'object' && Array.isArray(it?.tags) ? it.tags : [];
                  return { label, description, tags, _i: idx };
                });
                const withDesc = normalized.filter(x => String(x.description || '').trim());
                const withoutDesc = normalized.filter(x => !String(x.description || '').trim());
                return withDesc.concat(withoutDesc).map((it, idx) => {
                  const itemData = {
                    id: `${name}-${it.label}-${it._i}`,
                    label: it.label,
                    description: it.description,
                    tags: it.tags,
                    category: name,
                  };
                  const faved = favoritesHook?.isFavorited?.(itemData) || false;
                  return (
                    <MenuItemRow
                      key={name + it.label + it._i}
                      item={it}
                      faved={faved}
                      onFav={(e) => {
                        e.stopPropagation();
                        if (!faved) burstFromEvent(e);
                        favoritesHook?.toggleFavorite(itemData);
                      }}
                    />
                  );
                });
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MenuItemRow({ item, faved, onFav }) {
  // Guess emoji from name
  const txt = String(item.label || '').toLowerCase();
  let emoji = '🍽️';
  if (txt.includes('pizza')) emoji = '🍕';
  else if (txt.includes('burger')) emoji = '🍔';
  else if (txt.includes('taco')) emoji = '🌮';
  else if (txt.includes('salad')) emoji = '🥗';
  else if (txt.includes('rice') || txt.includes('quinoa') || txt.includes('farro')) emoji = '🌾';
  else if (txt.includes('chicken')) emoji = '🍗';
  else if (txt.includes('beef') || txt.includes('rib') || txt.includes('steak')) emoji = '🍖';
  else if (txt.includes('tofu') || txt.includes('butter')) emoji = '🧈';
  else if (txt.includes('soup') || txt.includes('chowder')) emoji = '🍲';
  else if (txt.includes('fries') || txt.includes('fry')) emoji = '🍟';
  else if (txt.includes('cheese')) emoji = '🧀';
  else if (txt.includes('cookie') || txt.includes('cake') || txt.includes('dessert')) emoji = '🍰';
  else if (txt.includes('egg')) emoji = '🍳';
  else if (txt.includes('vege') || txt.includes('veggie') || txt.includes('carrot') || txt.includes('root')) emoji = '🥕';
  else if (txt.includes('fish') || txt.includes('salmon')) emoji = '🐟';
  else if (txt.includes('pancake') || txt.includes('waffle')) emoji = '🥞';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#FFF8EA', borderRadius: 16, padding: '12px 14px',
        display: 'flex', gap: 12, alignItems: 'flex-start',
        border: '1.5px solid rgba(43,24,16,0.08)',
      }}
    >
      <div style={{ fontSize: 30, lineHeight: 1, transform: 'rotate(-6deg)', flexShrink: 0 }}>
        {emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 800, fontSize: 14.5, color: 'var(--ink)', lineHeight: 1.25,
          }}
        >
          {item.label}
        </div>
        {item.description && (
          <div
            style={{
              fontSize: 12, color: 'var(--ink-soft)', marginTop: 3, lineHeight: 1.35,
            }}
          >
            {item.description}
          </div>
        )}
        {item.tags && item.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
            {item.tags.map((t) => {
              const s = String(t || '');
              const short = s.toLowerCase().includes('made without gluten-containing ingredients') ? 'GF' : s;
              const cls = short.toLowerCase();
              return (
                <span key={short + s} className={'yc-sticker ' + cls}>
                  {short}
                </span>
              );
            })}
          </div>
        )}
      </div>
      <button
        className={'yc-heart-btn' + (faved ? ' favved' : '')}
        onClick={onFav}
        title={faved ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={faved}
      >
        <svg
          width="26" height="26" viewBox="0 0 24 24"
          fill={faved ? '#FF6A3D' : 'none'}
          stroke={faved ? '#FF6A3D' : '#C9B39B'}
          strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4 4.5 8-2.5 4.5-9.5 9-9.5 9z" />
        </svg>
      </button>
    </motion.div>
  );
}
