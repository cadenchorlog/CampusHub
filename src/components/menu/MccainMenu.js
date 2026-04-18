import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FoodSticker, { kindFromText, emojiForItem } from '../ui/FoodSticker';

const MCCAIN_MENU = {
  categories: [
    {
      name: "Appetizers & Sides",
      kind: "app",
      items: [
        { name: "Toasted Pita and Roasted Red Pepper Hummus with Vegetable Sticks", tags: ["Vegetarian"], price: "$6.18", calories: 280 },
        { name: "Mozzarella Sticks", price: "$5.75", calories: 670 },
        { name: "Cheese Quesadilla", tags: ["Vegetarian"], price: "$5.75", calories: 820 },
        { name: "Wisconsin Battered Cheese Curds", tags: ["Vegetarian"], price: "$6.18", calories: 680 },
        { name: "Garden Salad", tags: ["Vegan"], price: "$3.50", calories: 120 },
        { name: "Caesar Salad", tags: ["Vegetarian"], price: "$3.50", calories: 130 },
        { name: "Steamed Quinoa", tags: ["Vegan", "Made without Gluten-Containing Ingredients"], price: "$1.50", calories: 210 },
        { name: "Steamed Farro", tags: ["Vegan"], price: "$1.50", calories: 220 },
        { name: "Steamed Jasmine Rice", tags: ["Vegan", "Made without Gluten-Containing Ingredients"], price: "$1.50", calories: 190 },
      ],
    },
    {
      name: "Hot Sandwiches",
      kind: "grill",
      items: [
        { name: "Grilled Chicken Sandwich", price: "$7.73", calories: 340 },
        { name: "Vegan Bacon Bliss on Ciabatta", tags: ["Vegan", "Locally Crafted"], price: "$7.75", calories: 380 },
        { name: "BBQ Western Beef Burger on Brioche Bun", tags: ["Farm to Fork", "Locally Crafted"], price: "$7.73", calories: 740 },
        { name: "BBQ Western Grilled Chicken on Brioche", tags: ["Locally Crafted"], price: "$7.73", calories: 620 },
        { name: "BBQ Western Beyond Burger on Brioche", tags: ["Vegetarian", "Locally Crafted"], price: "$7.73", calories: 690 },
        { name: "Grilled Santa Fe Chicken on Brioche Bun", tags: ["Locally Crafted"], price: "$7.73", calories: 540 },
        { name: "Grilled Santa Fe Beef on Brioche Bun", tags: ["Farm to Fork", "Locally Crafted"], price: "$7.73", calories: 680 },
        { name: "Tuna Melt on Sourdough", tags: ["Seafood Watch"], price: "$7.73", calories: 510 },
        { name: "Classic Cheese Burger on Brioche Bun", tags: ["Humane"], price: "$7.73", calories: 560 },
        { name: "Five Cheese Melt", tags: ["Vegetarian"], price: "$7.75", calories: 590 },
        { name: "Chicken Caesar Wrap", price: "$7.50–$8.00", calories: 670 },
        { name: "Beyond Burger on Ciabatta", tags: ["Vegan"], price: "$9.27", calories: 380 },
      ],
    },
    {
      name: "Entrees",
      kind: "dinner",
      items: [
        { name: "Grilled Chicken Breast", tags: ["Made without Gluten-Containing Ingredients"], price: "$1.75", calories: 190 },
        { name: "Coyote Classic Bowl", tags: ["Made without Gluten-Containing Ingredients"], price: "$9.27", calories: 330 },
        { name: "Chicken Alfredo Pasta", price: "$9.75", calories: 680 },
        { name: "Pack Leader Bowl", price: "$9.27", calories: 550 },
        { name: "Howling Orange Bowl", tags: ["Made without Gluten-Containing Ingredients"], price: "$9.50", calories: 330 },
        { name: "Chicken Wings", price: "$9.35", calories: 580 },
        { name: "Alfredo Pasta", tags: ["Vegetarian"], price: "$9.35", calories: 450 },
        { name: "Chicken Fritters", tags: ["Humane"], price: "$8.24", calories: 600 },
      ],
    },
    {
      name: "Beverages",
      kind: "drink",
      items: [
        { name: "Drip Coffee", tags: ["Vegan", "Made without Gluten-Containing Ingredients"], sizes: {"12 fl oz": "$3.00", "16 fl oz": "$3.50", "20 fl oz": "$4.00"}, calories: 0 },
        { name: "Americano", tags: ["Vegan", "Made without Gluten-Containing Ingredients"], sizes: {"12 fl oz": "$3.50", "16 fl oz": "$4.00", "20 fl oz": "$4.50"}, calories: 10 },
        { name: "Breve", tags: ["Vegetarian", "Made without Gluten-Containing Ingredients"], sizes: {"12 fl oz": "$4.00", "16 fl oz": "$4.75", "20 fl oz": "$5.25"}, calories: 50 },
        { name: "Chai Charger", tags: ["Vegetarian", "Made without Gluten-Containing Ingredients"], sizes: {"12 fl oz": "$4.00", "16 fl oz": "$4.75", "20 fl oz": "$5.25"}, calories: 160 },
        { name: "Chai Latte", tags: ["Vegetarian", "Made without Gluten-Containing Ingredients"], sizes: {"12 fl oz": "$4.00", "16 fl oz": "$4.75", "20 fl oz": "$5.25"}, calories: 140 },
        { name: "Latte", tags: ["Vegetarian", "Made without Gluten-Containing Ingredients"], sizes: {"12 fl oz": "$4.00", "16 fl oz": "$4.75", "20 fl oz": "$5.25"}, calories: 80 },
        { name: "Mocha", tags: ["Vegetarian", "Made without Gluten-Containing Ingredients"], sizes: {"12 fl oz": "$4.00", "16 fl oz": "$4.75", "20 fl oz": "$5.25"}, calories: 140 },
        { name: "White Chocolate Mocha", tags: ["Vegetarian", "Made without Gluten-Containing Ingredients"], sizes: {"12 fl oz": "$4.00", "16 fl oz": "$4.75", "20 fl oz": "$5.25"}, calories: 150 },
        { name: "Single Shot Espresso", tags: ["Vegan", "Made without Gluten-Containing Ingredients"], price: "$2.75", calories: 5 },
        { name: "Double Shot Espresso", tags: ["Vegan", "Made without Gluten-Containing Ingredients"], price: "$3.75", calories: 10 },
        { name: "Triple Shot Espresso", tags: ["Vegan", "Made without Gluten-Containing Ingredients"], price: "$4.75", calories: 10 },
        { name: "Cappuccino", tags: ["Vegetarian", "Made without Gluten-Containing Ingredients"], sizes: {"12 fl oz": "$3.50", "16 fl oz": "$4.00", "20 fl oz": "$4.75"}, calories: 80 },
        { name: "Italian Soda", tags: ["Vegan", "Made without Gluten-Containing Ingredients"], price: "$3.75", calories: 200 },
        { name: "Hot Chocolate", tags: ["Vegetarian", "Made without Gluten-Containing Ingredients"], sizes: {"12 fl oz": "$3.50", "16 fl oz": "$4.25", "20 fl oz": "$5.00"}, calories: 260 },
        { name: "Extra Shot", tags: ["Vegan", "Made without Gluten-Containing Ingredients"], price: "$1.00", calories: 0 },
        { name: "Add More Syrup", tags: ["Vegetarian", "Made without Gluten-Containing Ingredients"], price: "$0.75" },
      ],
    },
  ],
};

export default function MccainMenu() {
  const categories = MCCAIN_MENU.categories;
  const [expanded, setExpanded] = useState(() => new Set(categories.map(c => c.name)));
  const [sizeChoice, setSizeChoice] = useState({});

  const toggleCat = (name) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(name)) next.delete(name); else next.add(name);
    return next;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="yc-card"
        style={{
          background: 'var(--sunset)', color: '#fff',
          borderColor: 'var(--ink)',
          display: 'flex', gap: 14, alignItems: 'center',
        }}
      >
        <FoodSticker kind="lunch" size={56} rotate={-6}>🌮</FoodSticker>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '.12em', opacity: 0.95,
            }}
          >
            Open now
          </div>
          <div className="fraunces" style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>
            McCain Cafe
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.9, marginTop: 4 }}>
            🐺 Pay with Coyote Cash or Flex
          </div>
        </div>
      </motion.div>

      {/* Categories */}
      {categories.map((cat, idx) => {
        const items = cat.items || [];
        const open = expanded.has(cat.name);
        const kind = cat.kind || kindFromText(cat.name);
        return (
          <motion.div
            layout
            key={cat.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="yc-card-soft"
            style={{ padding: 0, background: open ? 'var(--paper)' : '#F3E3C6', overflow: 'hidden' }}
          >
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleCat(cat.name)}
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
                  {cat.name}
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
                      <p style={{ padding: '4px 6px 10px', fontSize: 13, color: 'var(--ink-soft)', fontStyle: 'italic' }}>
                        No items listed.
                      </p>
                    ) : (
                      items.map((it, i) => {
                        const hasSizes = it && typeof it.sizes === 'object' && it.sizes !== null;
                        const sizes = hasSizes ? Object.keys(it.sizes) : [];
                        const choice = hasSizes ? (sizeChoice[it.name] || sizes[0]) : null;
                        const price = hasSizes ? (it.sizes[choice] || '') : (it.price || '');
                        const emoji = emojiForItem(it.name, it.tags);
                        return (
                          <motion.div
                            layout
                            key={it.name + i}
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
                              <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--ink)', lineHeight: 1.25 }}>
                                {it.name}
                              </div>
                              {it.tags && it.tags.length > 0 && (
                                <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
                                  {it.tags.map((t) => {
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
                              {hasSizes && sizes.length > 0 && (
                                <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
                                  {sizes.map((s) => {
                                    const on = choice === s;
                                    return (
                                      <motion.button
                                        key={s}
                                        whileTap={{ scale: 0.94 }}
                                        onClick={() => setSizeChoice(prev => ({ ...prev, [it.name]: s }))}
                                        aria-pressed={on}
                                        style={{
                                          padding: '5px 10px', borderRadius: 10,
                                          fontSize: 11, fontWeight: 800, fontFamily: 'inherit',
                                          cursor: 'pointer',
                                          background: on ? 'var(--ink)' : 'var(--paper)',
                                          color: on ? 'var(--cream)' : 'var(--ink)',
                                          border: '1.5px solid var(--ink)',
                                          boxShadow: on ? '1px 2px 0 #000' : '1px 2px 0 var(--ink)',
                                          transition: 'background .2s, color .2s',
                                        }}
                                      >
                                        {s}
                                      </motion.button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                              {price && (
                                <div
                                  className="fraunces-num"
                                  style={{ fontSize: 17, color: 'var(--sunset-deep)' }}
                                >
                                  {price}
                                </div>
                              )}
                              {typeof it.calories === 'number' && (
                                <div style={{ fontSize: 10, color: 'var(--ink-soft)', fontWeight: 600 }}>
                                  {it.calories} cal
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
