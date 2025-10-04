import React, { useState } from 'react';

const MCCAIN_MENU = {
  categories: [
    {
      name: "Appetizers & Sides",
      items: [
        {
          name: "Toasted Pita and Roasted Red Pepper Hummus with Vegetable Sticks",
          tags: ["Vegetarian"],
          price: "$6.18",
          calories: 280
        },
        {
          name: "Mozzarella Sticks",
          price: "$5.75",
          calories: 670
        },
        {
          name: "Cheese Quesadilla",
          tags: ["Vegetarian"],
          price: "$5.75",
          calories: 820
        },
        {
          name: "Wisconsin Battered Cheese Curds",
          tags: ["Vegetarian"],
          price: "$6.18",
          calories: 680
        },
        {
          name: "Garden Salad",
          tags: ["Vegan"],
          price: "$3.50",
          calories: 120
        },
        {
          name: "Caesar Salad",
          tags: ["Vegetarian"],
          price: "$3.50",
          calories: 130
        },
        {
          name: "Steamed Quinoa",
          tags: ["Vegan", "Made without Gluten-Containing Ingredients"],
          price: "$1.50",
          calories: 210
        },
        {
          name: "Steamed Farro",
          tags: ["Vegan"],
          price: "$1.50",
          calories: 220
        },
        {
          name: "Steamed Jasmine Rice",
          tags: ["Vegan", "Made without Gluten-Containing Ingredients"],
          price: "$1.50",
          calories: 190
        }
      ]
    },
    {
      name: "Hot Sandwiches",
      items: [
        {
          name: "Grilled Chicken Sandwich",
          price: "$7.73",
          calories: 340
        },
        {
          name: "Vegan Bacon Bliss on Ciabatta",
          tags: ["Vegan", "Locally Crafted"],
          price: "$7.75",
          calories: 380
        },
        {
          name: "BBQ Western Beef Burger on Brioche Bun",
          tags: ["Farm to Fork", "Locally Crafted"],
          price: "$7.73",
          calories: 740
        },
        {
          name: "BBQ Western Grilled Chicken on Brioche",
          tags: ["Locally Crafted"],
          price: "$7.73",
          calories: 620
        },
        {
          name: "BBQ Western Beyond Burger on Brioche",
          tags: ["Vegetarian", "Locally Crafted"],
          price: "$7.73",
          calories: 690
        },
        {
          name: "Grilled Santa Fe Chicken on Brioche Bun",
          tags: ["Locally Crafted"],
          price: "$7.73",
          calories: 540
        },
        {
          name: "Grilled Santa Fe Beef on Brioche Bun",
          tags: ["Farm to Fork", "Locally Crafted"],
          price: "$7.73",
          calories: 680
        },
        {
          name: "Tuna Melt on Sourdough",
          tags: ["Seafood Watch"],
          price: "$7.73",
          calories: 510
        },
        {
          name: "Classic Cheese Burger on Brioche Bun",
          tags: ["Humane"],
          price: "$7.73",
          calories: 560
        },
        {
          name: "Five Cheese Melt",
          tags: ["Vegetarian"],
          price: "$7.75",
          calories: 590
        },
        {
          name: "Chicken Caesar Wrap",
          price: "$7.50–$8.00",
          calories: 670
        },
        {
          name: "Beyond Burger on Ciabatta",
          tags: ["Vegan"],
          price: "$9.27",
          calories: 380
        }
      ]
    },
    {
      name: "Entrees",
      items: [
        {
          name: "Grilled Chicken Breast",
          tags: ["Made without Gluten-Containing Ingredients"],
          price: "$1.75",
          calories: 190
        },
        {
          name: "Coyote Classic Bowl",
          tags: ["Made without Gluten-Containing Ingredients"],
          price: "$9.27",
          calories: 330
        },
        {
          name: "Chicken Alfredo Pasta",
          price: "$9.75",
          calories: 680
        },
        {
          name: "Pack Leader Bowl",
          price: "$9.27",
          calories: 550
        },
        {
          name: "Howling Orange Bowl",
          tags: ["Made without Gluten-Containing Ingredients"],
          price: "$9.50",
          calories: 330
        },
        {
          name: "Chicken Wings",
          price: "$9.35",
          calories: 580
        },
        {
          name: "Alfredo Pasta",
          tags: ["Vegetarian"],
          price: "$9.35",
          calories: 450
        },
        {
          name: "Chicken Fritters",
          tags: ["Humane"],
          price: "$8.24",
          calories: 600
        }
      ]
    },
    {
      name: "Beverages",
      items: [
        {
          name: "Drip Coffee",
          tags: ["Vegan", "Made without Gluten-Containing Ingredients"],
          sizes: {"12 fl oz": "$3.00", "16 fl oz": "$3.50", "20 fl oz": "$4.00"},
          calories: 0
        },
        {
          name: "Americano",
          tags: ["Vegan", "Made without Gluten-Containing Ingredients"],
          sizes: {"12 fl oz": "$3.50", "16 fl oz": "$4.00", "20 fl oz": "$4.50"},
          calories: 10
        },
        {
          name: "Breve",
          tags: ["Vegetarian", "Made without Gluten-Containing Ingredients"],
          sizes: {"12 fl oz": "$4.00", "16 fl oz": "$4.75", "20 fl oz": "$5.25"},
          calories: 50
        },
        {
          name: "Chai Charger",
          tags: ["Vegetarian", "Made without Gluten-Containing Ingredients"],
          sizes: {"12 fl oz": "$4.00", "16 fl oz": "$4.75", "20 fl oz": "$5.25"},
          calories: 160
        },
        {
          name: "Chai Latte",
          tags: ["Vegetarian", "Made without Gluten-Containing Ingredients"],
          sizes: {"12 fl oz": "$4.00", "16 fl oz": "$4.75", "20 fl oz": "$5.25"},
          calories: 140
        },
        {
          name: "Latte",
          tags: ["Vegetarian", "Made without Gluten-Containing Ingredients"],
          sizes: {"12 fl oz": "$4.00", "16 fl oz": "$4.75", "20 fl oz": "$5.25"},
          calories: 80
        },
        {
          name: "Mocha",
          tags: ["Vegetarian", "Made without Gluten-Containing Ingredients"],
          sizes: {"12 fl oz": "$4.00", "16 fl oz": "$4.75", "20 fl oz": "$5.25"},
          calories: 140
        },
        {
          name: "White Chocolate Mocha",
          tags: ["Vegetarian", "Made without Gluten-Containing Ingredients"],
          sizes: {"12 fl oz": "$4.00", "16 fl oz": "$4.75", "20 fl oz": "$5.25"},
          calories: 150
        },
        {
          name: "Single Shot Espresso",
          tags: ["Vegan", "Made without Gluten-Containing Ingredients"],
          price: "$2.75",
          calories: 5
        },
        {
          name: "Double Shot Espresso",
          tags: ["Vegan", "Made without Gluten-Containing Ingredients"],
          price: "$3.75",
          calories: 10
        },
        {
          name: "Triple Shot Espresso",
          tags: ["Vegan", "Made without Gluten-Containing Ingredients"],
          price: "$4.75",
          calories: 10
        },
        {
          name: "Cappuccino",
          tags: ["Vegetarian", "Made without Gluten-Containing Ingredients"],
          sizes: {"12 fl oz": "$3.50", "16 fl oz": "$4.00", "20 fl oz": "$4.75"},
          calories: 80
        },
        {
          name: "Italian Soda",
          tags: ["Vegan", "Made without Gluten-Containing Ingredients"],
          price: "$3.75",
          calories: 200
        },
        {
          name: "Hot Chocolate",
          tags: ["Vegetarian", "Made without Gluten-Containing Ingredients"],
          sizes: {"12 fl oz": "$3.50", "16 fl oz": "$4.25", "20 fl oz": "$5.00"},
          calories: 260
        },
        {
          name: "Extra Shot",
          tags: ["Vegan", "Made without Gluten-Containing Ingredients"],
          price: "$1.00",
          calories: 0
        },
        {
          name: "Add More Syrup",
          tags: ["Vegetarian", "Made without Gluten-Containing Ingredients"],
          price: "$0.75"
        }
      ]
    }
  ]
};

export default function MccainMenu({ menu }) {
  // Use the static menu data instead of the passed menu prop
  const categories = MCCAIN_MENU.categories;
  const [expanded, setExpanded] = useState(() => new Set(categories.map(c => c.name))); // default expand all
  const [sizeChoice, setSizeChoice] = useState({}); // map item name -> size key

  const toggleCat = (name) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(name)) next.delete(name); else next.add(name);
    return next;
  });

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {categories.map((cat) => {
          const items = (cat.items || []);
          const open = expanded.has(cat.name);
          return (
            <div key={cat.name} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-700 dark:bg-gray-900/60">
              <button
                onClick={() => toggleCat(cat.name)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left dark:bg-gray-800/60 dark:hover:bg-gray-800"
                aria-expanded={open}
              >
                <div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">{cat.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{items.length} item{items.length === 1 ? '' : 's'}</div>
                </div>
                <svg className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {open && (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {items.length === 0 ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">No matching items.</p>
                  ) : (
                    items.map((it, idx) => {
                      const hasSizes = it && typeof it.sizes === 'object' && it.sizes !== null;
                      const sizes = hasSizes ? Object.keys(it.sizes) : [];
                      const choice = hasSizes ? (sizeChoice[it.name] || sizes[0]) : null;
                      const price = hasSizes ? (it.sizes[choice] || '') : (it.price || '');
                      return (
                        <React.Fragment key={it.name + idx}>
                          <div className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-900/50 dark:hover:bg-gray-900/60">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{it.name}</div>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {(it.tags || []).map((t) => {
                                    const s = String(t || '');
                                    const label = s.toLowerCase().includes('made without gluten-containing ingredients') ? 'GF' : s;
                                    return (
                                      <span key={label + s} className="inline-flex items-center px-2 py-0.5 rounded-md border border-gray-200 bg-white text-[11px] text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">{label}</span>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                {price && <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{price}</div>}
                                {typeof it.calories === 'number' && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{it.calories} cal</div>
                                )}
                              </div>
                            </div>
                            {hasSizes && sizes.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {sizes.map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => setSizeChoice(prev => ({ ...prev, [it.name]: s }))}
                                    className={`px-2 py-1 rounded-md text-xs font-medium border ${choice === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800'}`}
                                    aria-pressed={choice === s}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
