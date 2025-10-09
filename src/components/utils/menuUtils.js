import { BREAKFAST_STATIONS, REPEATING_STATIONS } from './constants';
import { isWeekendJS, getEntryMeta } from './helpers';

/**
 * Normalize menu payload from various formats
 */
export function normalizeMenuPayload(payload) {
  try {
    // Legacy: already [ [ [label, station], ... ], ... ]
    if (Array.isArray(payload)) return payload;

    // New Simplot shape: {
    //   Breakfast: { time: string, tabs: { "Breakfast Specials": [ { station, items: [ { label, ... } ] }, ... ] } },
    //   Lunch: { ... },
    //   Dinner: { ... }
    // }
    if (payload && typeof payload === 'object') {
      const ORDER = ["Breakfast", "Brunch", "Lunch", "Dinner"]; // ensure stable order
      const mealBuckets = [];
      
      for (const mealKey of ORDER) {
        if (!Object.prototype.hasOwnProperty.call(payload, mealKey)) continue;
        const meal = payload[mealKey];
        const tabs = meal && typeof meal === 'object' ? meal.tabs : null;
        if (!tabs || typeof tabs !== 'object') continue;
        
        const mealItems = [];
        for (const tabName of Object.keys(tabs)) {
          const sections = tabs[tabName];
          if (!Array.isArray(sections)) continue;
          for (const section of sections) {
            const station = section?.station || '';
            const sectItems = Array.isArray(section?.items) ? section.items : [];
            for (const it of sectItems) {
              const label = it?.label || it?.name || '';
              if (!label) continue;
              const description = it?.description || '';
              const tags = Array.isArray(it?.cor_icons) ? it.cor_icons : Array.isArray(it?.tags) ? it.tags : [];
              const tagAlts = Array.isArray(it?.cor_icon_alts) ? it.cor_icon_alts : [];
              const notes = Array.isArray(it?.notes) ? it.notes : [];
              const id = it?.id || '';
              
              // Carry as rich objects so downstream can render descriptions and badges
              mealItems.push({ 
                label, 
                station, 
                description, 
                tags, 
                tagAlts,
                notes,
                id,
                mealPeriod: mealKey
              });
            }
          }
        }
        if (mealItems.length > 0) {
          mealBuckets.push(mealItems);
        }
      }
      return mealBuckets;
    }
  } catch (e) {
    console.warn('[menu] normalizeMenuPayload failed:', e);
  }
  return [];
}

/**
 * Reorganize menu data into meal buckets
 */
export function rebucketMenu(raw) {
  try {
    if (!Array.isArray(raw)) return [];
    
    // If the data is already in meal buckets format (new format), return as-is
    if (raw.length > 0 && Array.isArray(raw[0]) && raw[0].length > 0 && raw[0][0].mealPeriod) {
      return raw;
    }
    
    // Legacy format: flatten into a single ordered stream of {label, station, description, tags}
    const stream = [];
    for (const meal of raw) {
      if (!Array.isArray(meal)) continue;
      for (const entry of meal) {
        const meta = getEntryMeta(entry);
        if (!meta.label) continue;
        stream.push(meta);
      }
    }

    const weekend = isWeekendJS();
    const mealKeys = weekend ? ["brunch", "dinner"] : ["breakfast", "lunch", "dinner"];
    const buckets = Object.fromEntries(mealKeys.map(k => [k, []]));

    const isBreakfastStation = (s) => BREAKFAST_STATIONS.includes(s);
    const isRepeatingStation = (s) => REPEATING_STATIONS.includes(s);

    // Step 1: breakfast/brunch pull-out
    const remaining = [];
    const firstMealKey = weekend ? "brunch" : "breakfast";
    for (const it of stream) {
      if (isBreakfastStation(it.station)) {
        buckets[firstMealKey].push(it);
      } else {
        remaining.push(it);
      }
    }

    // Step 2: find split index for lunch/dinner or brunch/dinner
    const firstSegmentKey = weekend ? "brunch" : "lunch";
    const secondSegmentKey = "dinner";
    const seenRepeating = new Set();
    let splitIndex = null;
    let lastStation = null;
    for (let i = 0; i < remaining.length; i++) {
      const st = remaining[i].station;
      const isNewBlock = st !== lastStation;
      if (isNewBlock) {
        if (isRepeatingStation(st)) {
          if (seenRepeating.has(st)) {
            splitIndex = i; // second block encountered
            break;
          } else {
            seenRepeating.add(st);
          }
        }
        lastStation = st;
      }
    }

    const firstSegment = splitIndex == null ? remaining : remaining.slice(0, splitIndex);
    const secondSegment = splitIndex == null ? [] : remaining.slice(splitIndex);

    for (const it of firstSegment) buckets[firstSegmentKey].push(it);
    for (const it of secondSegment) buckets[secondSegmentKey].push(it);

    // Step 3: duplication Soup/Pizza/Grill into dinner on weekdays
    if (!weekend && firstSegmentKey === "lunch") {
      const DUP = new Set(["Soup", "Pizza", "Grill"]);
      for (const it of firstSegment) {
        if (DUP.has(it.station)) {
          buckets[secondSegmentKey].push(it);
        }
      }
    }

    // Return ordered array of arrays
    const order = weekend ? ["brunch", "dinner"] : ["breakfast", "lunch", "dinner"];
    return order.map(k => buckets[k] || []);
  } catch (e) {
    console.warn('[menu] rebucketMenu failed:', e);
    return [];
  }
}
