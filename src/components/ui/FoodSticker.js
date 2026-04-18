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

// Pick an emoji for a food item that respects dietary tags.
// Never return a meat/seafood emoji for a vegan/vegetarian item.
// Order matters: specific phrases before generic keywords.
export function emojiForItem(label, tags = []) {
  const t = String(label || '').toLowerCase();
  const tagStr = (tags || []).map(x => String(x).toLowerCase()).join(' | ');
  const isVegan = /\bvegan\b/.test(tagStr);
  const isVegetarian = isVegan || /\bvegetarian\b/.test(tagStr);

  // ── Specific composite dishes (must come before generic keywords) ──
  if (t.includes('hot dog') || t.includes('corn dog')) return isVegetarian ? '🥕' : '🌭';
  if (t.includes('mac') && t.includes('cheese'))       return '🧀';
  if (t.includes('stir fry') || t.includes('stir-fry') || t.includes('paella')) return '🥘';
  if (t.includes('sushi') || t.includes('maki') || t.includes('sashimi') || t.includes('nigiri'))
    return isVegetarian ? '🍙' : '🍣';
  if (t.includes('egg roll') || t.includes('spring roll')) return '🥟';
  if (t.includes('ramen') || t.includes('udon') || t.includes('pho'))       return '🍜';
  if (t.includes('dumpling') || t.includes('gyoza') || t.includes('pierogi') || t.includes('potsticker') || t.includes('wonton')) return '🥟';
  if (t.includes('curry'))                                                  return '🍛';
  if (t.includes('falafel'))                                                return '🧆';
  if (t.includes('gyro') || t.includes('shawarma') || t.includes('kebab') || t.includes('kabob')) return '🥙';
  if (t.includes('nacho'))                                                  return '🧀';
  if (t.includes('enchilada') || t.includes('burrito') || t.includes('chimichanga')) return '🌯';
  if (t.includes('quesadilla'))                                             return '🫓';
  if (t.includes('taco'))                                                   return '🌮';
  if (t.includes('pizza') || t.includes('calzone'))                         return '🍕';
  if (t.includes('lasagna'))                                                return '🍝';
  if (t.includes('omelet') || t.includes('omelette'))                       return isVegan ? '🥬' : '🍳';
  if (t.includes('pancake') || t.includes('waffle') || t.includes('crepe') || t.includes('crêpe')) return '🥞';
  if (t.includes('french toast'))                                           return '🍞';
  if (t.includes('sandwich') || t.includes('panini') || t.includes('sub ') || t.endsWith('sub') ||
      t.includes('hoagie') || t.includes('blt') || t.includes('grinder') || t.includes('melt')) return '🥪';

  // ── Bakery & breakfast ──
  if (t.includes('bagel'))                     return '🥯';
  if (t.includes('croissant') || t.includes('cinnamon roll')) return '🥐';
  if (t.includes('pretzel'))                   return '🥨';
  if (t.includes('donut') || t.includes('doughnut')) return '🍩';
  if (t.includes('muffin') || t.includes('cupcake')) return '🧁';
  if (t.includes('bread') || t.includes('toast') || t.includes('baguette') || t.includes('loaf') || t.includes('brioche') || t.includes('roll') || t.includes('biscuit')) return '🍞';
  if (t.includes('pita') || t.includes('flatbread') || t.includes('lavash') || t.includes('naan') || t.includes('tortilla')) return '🫓';

  // ── Desserts & sweets ──
  if (t.includes('pie') && !t.includes('pita'))                             return '🥧';
  if (t.includes('cake') || t.includes('cheesecake') || t.includes('torte')) return '🍰';
  if (t.includes('cookie') || t.includes('brownie'))                        return '🍪';
  if (t.includes('ice cream') || t.includes('gelato') || t.includes('sundae') || t.includes('sorbet')) return '🍨';
  if (t.includes('pudding') || t.includes('custard') || t.includes('flan') || t.includes('mousse')) return '🍮';
  if (t.includes('popcorn'))                                                return '🍿';
  if (t.includes('candy') || t.includes('lollipop'))                        return '🍬';
  if (t.includes('chocolate'))                                              return '🍫';
  if (t.includes('dessert') || t.includes('pastry'))                        return '🍰';

  // ── Drinks ──
  if (t.includes('smoothie'))                                               return '🥤';
  if (t.includes('juice') || t.includes('lemonade'))                        return '🧃';
  if (t.includes('milkshake') || t.includes('shake'))                       return '🥤';
  if (t.includes('tea') && !t.includes('steak'))                            return '🍵';
  if (t.includes('coffee') || t.includes('latte') || t.includes('mocha') ||
      t.includes('breve') || t.includes('cappuccino') || t.includes('espresso') ||
      t.includes('americano') || t.includes('chai') || t.includes('macchiato')) return '☕';
  if (t.includes('soda') || t.includes('cola') || t.includes('pepsi') || t.includes('sprite') || t.includes('fanta')) return '🥤';
  if (t.includes('drink') || t.includes('beverage'))                        return '🥤';
  if (t.includes('milk') && !t.includes('milkshake'))                       return '🥛';
  if (t.includes('water'))                                                  return '💧';
  if (t.includes('wine'))                                                   return '🍷';
  if (t.includes('beer'))                                                   return '🍺';

  // ── Fruits & produce ──
  if (t.includes('strawberry') || t.includes('raspberry') || t.includes('berry') || t.includes('cranberry')) return '🍓';
  if (t.includes('blueberry'))                 return '🫐';
  if (t.includes('watermelon'))                return '🍉';
  if (t.includes('pineapple'))                 return '🍍';
  if (t.includes('grape'))                     return '🍇';
  if (t.includes('banana'))                    return '🍌';
  if (t.includes('apple'))                     return '🍎';
  if (t.includes('orange') && !t.includes('juice')) return '🍊';
  if (t.includes('peach') || t.includes('apricot'))                 return '🍑';
  if (t.includes('pear'))                      return '🍐';
  if (t.includes('melon'))                     return '🍈';
  if (t.includes('lemon') || t.includes('lime'))                    return '🍋';
  if (t.includes('avocado') || t.includes('guac'))                  return '🥑';
  if (t.includes('mushroom'))                  return '🍄';
  if (t.includes('corn') && !t.includes('corned'))                  return '🌽';
  if (t.includes('jalape') || t.includes('bell pepper') || t.includes(' pepper')) return '🫑';
  if (t.includes('spicy') || t.includes('chipotle') || (t.startsWith('chili') && !t.includes('cheese'))) return '🌶️';
  if (t.includes('tomato') || t.includes('marinara'))               return '🍅';
  if (t.includes('broccoli'))                  return '🥦';
  if (t.includes('onion'))                     return '🧅';
  if (t.includes('garlic'))                    return '🧄';
  if (t.includes('sausage'))                   return isVegetarian ? '🥕' : '🌭';

  // ── Seafood (meat-guarded) ──
  if (!isVegetarian) {
    if (t.includes('shrimp') || t.includes('prawn'))                return '🍤';
    if (t.includes('lobster'))                                      return '🦞';
    if (t.includes('crab'))                                         return '🦀';
    if (t.includes('squid') || t.includes('calamari') || t.includes('octopus')) return '🦑';
    if (t.includes('oyster') || t.includes('clam') || t.includes('mussel'))     return '🦪';
    if (t.includes('fish') || t.includes('salmon') || t.includes('tuna') ||
        t.includes('cod') || t.includes('trout') || t.includes('tilapia') ||
        t.includes('halibut') || t.includes('seafood') || t.includes('mahi'))   return '🐟';
  }

  // ── Meat (guarded) ──
  if (!isVegetarian) {
    if (t.includes('bacon'))                                                    return '🥓';
    if (t.includes('burger') || t.includes('patty'))                            return '🍔';
    if (t.includes('turkey'))                                                   return '🦃';
    if (t.includes('duck'))                                                     return '🦆';
    if (t.includes('chicken') || t.includes('wing') || t.includes('poultry') ||
        t.includes('tender') || t.includes('nugget') || t.includes('fritter') ||
        t.includes('drumstick') || t.includes('schnitzel') || t.includes('katsu')) return '🍗';
    if (t.includes('rib') || t.includes('brisket') || t.includes('roast'))      return '🍖';
    if (t.includes('beef') || t.includes('steak') || t.includes('prime') ||
        t.includes('sirloin') || t.includes('western') || t.includes('corned'))  return '🥩';
    if (t.includes('pork') || t.includes('ham') || t.includes('carnita') || t.includes('chorizo')) return '🥩';
    if (t.includes('lamb') || t.includes('mutton'))                             return '🍖';
    if (t.includes('meatball'))                                                 return '🍖';
  } else {
    // Plant-based alternatives for meaty labels
    if (t.includes('beyond') || t.includes('impossible') || t.includes('plant-based') || t.includes('plant based')) return '🥬';
    if (t.includes('burger'))                                                   return '🥬';
    if (t.includes('bacon'))                                                    return '🥬';
    if (t.includes('chicken') || t.includes('nugget') || t.includes('tender'))  return '🌱';
  }

  // ── Plant-based & generics ──
  if (t.includes('tofu') || t.includes('tempeh') || t.includes('seitan'))       return '🧈';
  if (t.includes('salad') || t.includes('greens') || t.includes('slaw'))        return '🥗';
  if (t.includes('rice') || t.includes('quinoa') || t.includes('farro') ||
      t.includes('pilaf') || t.includes('risotto') || t.includes('couscous') || t.includes('bulgur')) return '🌾';
  if (t.includes('pasta') || t.includes('alfredo') || t.includes('noodle') ||
      t.includes('spaghetti') || t.includes('penne') || t.includes('fettuccine') ||
      t.includes('ravioli') || t.includes('linguine') || t.includes('rigatoni') ||
      t.includes('macaroni') || t.includes('tortellini')) return isVegan ? '🍜' : '🍝';
  if (t.includes('soup') || t.includes('chowder') || t.includes('broth') || t.includes('stew') || t.includes('bisque'))
    return isVegetarian ? '🥣' : '🍲';
  if (t.includes('oatmeal') || t.includes('porridge') || t.includes('granola') ||
      t.includes('yogurt') || t.includes('parfait') || t.includes('cereal') || t.includes('grits')) return '🥣';
  if (t.includes('hummus') || t.includes('baba ganoush'))                       return '🫛';
  if (t.includes('fries') || t.includes('frites') || (t.includes('fry') && !t.includes('stir'))) return '🍟';
  if (t.includes('cheese') || t.includes('mozz') || t.includes('curd') || t.includes('brie') ||
      t.includes('cheddar') || t.includes('parm'))                              return '🧀';
  if (t.includes('carrot') || t.includes('root') || t.includes('veggie') || t.includes('vege'))  return '🥕';
  if (t.includes('wrap'))                                                       return '🌯';
  if (t.includes('syrup') || t.includes('honey') || t.includes('molasses'))     return '🍯';
  if (t.includes('egg'))                                                        return isVegan ? '🥬' : '🍳';

  // ── Fallbacks ──
  if (isVegan)      return '🌱';
  if (isVegetarian) return '🥗';
  return '🍽️';
}

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
