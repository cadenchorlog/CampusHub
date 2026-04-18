import React from 'react';

const KINDS = {
  breakfast: { bg: "#FFD966", emoji: "🥞" },
  brunch:    { bg: "#FFB347", emoji: "🍳" },
  lunch:     { bg: "#FF8C69", emoji: "🌮" },
  dinner:    { bg: "#A78BFA", emoji: "🍗" },
  grill:     { bg: "#EF4444", emoji: "🔥" },
  pizza:     { bg: "#FBBF24", emoji: "🍕" },
  salad:     { bg: "#86EFAC", emoji: "🥗" },
  dessert:   { bg: "#FBCFE8", emoji: "🍰" },
  app:       { bg: "#FDBA74", emoji: "🥨" },
  drink:     { bg: "#93C5FD", emoji: "🥤" },
  comfort:   { bg: "#FCA5A5", emoji: "🍖" },
  global:    { bg: "#A7F3D0", emoji: "🌶️" },
  bakery:    { bg: "#FBCFE8", emoji: "🥐" },
  meal:      { bg: "#FDE68A", emoji: "🍽️" },
};

export function kindFromText(text) {
  const s = String(text || '').toLowerCase();
  if (s.includes('brunch')) return 'brunch';
  if (s.includes('breakfast')) return 'breakfast';
  if (s.includes('lunch')) return 'lunch';
  if (s.includes('dinner')) return 'dinner';
  if (s.includes('grill')) return 'grill';
  if (s.includes('pizza')) return 'pizza';
  if (s.includes('salad') || s.includes('bowl')) return 'salad';
  if (s.includes('dessert')) return 'dessert';
  if (s.includes('drink') || s.includes('beverage')) return 'drink';
  if (s.includes('app') || s.includes('side')) return 'app';
  if (s.includes('comfort')) return 'comfort';
  if (s.includes('global')) return 'global';
  if (s.includes('bakery')) return 'bakery';
  return 'meal';
}

export default function FoodSticker({ kind = 'meal', size = 48, rotate = -6, children }) {
  const { bg, emoji } = KINDS[kind] || KINDS.meal;
  return (
    <div
      style={{
        width: size, height: size, borderRadius: Math.round(size * 0.33),
        background: bg, border: '2px solid var(--ink)',
        boxShadow: '3px 3px 0 var(--ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.round(size * 0.55), transform: `rotate(${rotate}deg)`,
        flexShrink: 0,
      }}
    >
      {children || emoji}
    </div>
  );
}
