import React from 'react';
import { motion } from 'framer-motion';

const items = [
  { id: 'balances',     label: 'Home' },
  { id: 'menu',         label: 'Menu' },
  { id: 'favorites',    label: 'Loves' },
  { id: 'transactions', label: 'Tx' },
];

function Icon({ id, active, color }) {
  const common = {
    width: 26, height: 26, viewBox: '0 0 24 24',
    fill: active ? color : 'none', stroke: color,
    strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  switch (id) {
    case 'balances':
      return (
        <svg {...common}>
          <path d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1V11z" />
        </svg>
      );
    case 'menu':
      return (
        <svg {...common} fill="none">
          <path d="M3 2 v7 c0 1.1 .9 2 2 2 h4 a2 2 0 0 0 2-2 V2" />
          <path d="M7 2 v20" />
          <path d="M21 15 V2 a5 5 0 0 0 -5 5 v6 c0 1.1 .9 2 2 2 h3 Z M21 15 v7" />
        </svg>
      );
    case 'favorites':
      return (
        <svg {...common}>
          <path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4 4.5 8-2.5 4.5-9.5 9-9.5 9z" />
        </svg>
      );
    case 'transactions':
      return (
        <svg {...common} fill="none">
          <path d="M4 8 H18 L15 5 M20 16 H6 L9 19" />
        </svg>
      );
    default:
      return null;
  }
}

export default function BottomNavigation({ activeTab, setActiveTab }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 z-50 pointer-events-none"
      style={{ bottom: 'max(16px, env(safe-area-inset-bottom))' }}
      aria-label="Primary"
    >
      <div className="w-full flex justify-center px-4">
        <div
          className="pointer-events-auto"
          style={{
            height: 70,
            width: 'min(100%, 340px)',
            borderRadius: 28,
            background: 'var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-around',
            boxShadow: '0 8px 0 rgba(0,0,0,0.15), 0 20px 30px rgba(43,24,16,0.25)',
            padding: '0 12px',
          }}
        >
          {items.map(it => {
            const active = activeTab === it.id;
            return (
              <motion.button
                key={it.id}
                onClick={() => setActiveTab(it.id)}
                aria-pressed={active}
                aria-label={it.label}
                whileTap={{ scale: 0.9 }}
                animate={{
                  y: active ? -10 : 0,
                  rotate: active ? -4 : 0,
                  backgroundColor: active ? 'var(--sunset)' : 'rgba(255,255,255,0)',
                }}
                transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                style={{
                  position: 'relative',
                  border: 0, cursor: 'pointer',
                  width: 56, height: 56, borderRadius: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                  boxShadow: active ? '0 8px 0 var(--sunset-deep), 0 12px 20px rgba(255,106,61,.4)' : 'none',
                }}
              >
                <Icon id={it.id} active={active} color={active ? '#fff' : 'rgba(255,255,255,0.55)'} />
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
