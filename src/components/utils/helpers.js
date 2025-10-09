// Utility helper functions

/**
 * Check if current day is weekend (Friday, Saturday, Sunday)
 */
export function isWeekendJS(date = new Date()) {
  // Match Python weekday() mapping: Mon=0..Sun=6. Weekend: Fri(4), Sat(5), Sun(6)
  const js = date.getDay(); // Sun=0..Sat=6
  const pyWeekday = (js + 6) % 7; // Mon=0..Sun=6
  return pyWeekday >= 4; // Fri-Sun
}

/**
 * Format description text for display
 */
export function formatDescription(descRaw) {
  const input = (descRaw || "").trim();
  let out = input;
  // Map campus center code names to friendlier labels
  if (/^ADDVALUE$/i.test(input)) {
    out = "Reload";
  } else
  if (/adj/i.test(input)) {
    out = "Adjustment";
  } else {
    out = input.replace(/\s*AUTH\b/i, "").trim();
  }
  console.log("[ui] formatDescription:", input, "=>", out);
  return out;
}

/**
 * Get account label for display
 */
export function accountLabel(accountRaw) {
  const s = (accountRaw || "").toLowerCase();
  let out = "";
  if (s.includes("weekly")) out = "Meals";
  else if (s.includes("coyote cash")) out = "Coyote Cash";
  else if (s.includes("flex")) out = "Flex";
  console.log("[ui] accountLabel:", accountRaw, "=>", out || "(none)");
  return out;
}

/**
 * Normalize text content
 */
export function normalize(text) {
  if (!text) return "";
  return String(text).trim().replace(/\s+/g, " ");
}

/**
 * Format time delta for countdown display
 */
export function formatDelta(delta) {
  const abs = Math.max(0, Math.floor(delta));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

/**
 * Get entry metadata from various data formats
 */
export function getEntryMeta(entry) {
  // Supports shapes: [label, station], [label, station, desc, tags], {label, station, description, tags}
  if (Array.isArray(entry)) {
    const label = entry[0] || '';
    const station = entry[1] || '';
    const description = entry.length >= 3 ? (entry[2] || '') : '';
    const tags = entry.length >= 4 && Array.isArray(entry[3]) ? entry[3] : [];
    return { label, station, description, tags };
  }
  if (entry && typeof entry === 'object') {
    return {
      label: entry.label || entry.name || '',
      station: entry.station || entry.category || '',
      description: entry.description || '',
      tags: Array.isArray(entry.tags) ? entry.tags : Array.isArray(entry.cor_icons) ? entry.cor_icons : [],
      tagAlts: Array.isArray(entry.tagAlts) ? entry.tagAlts : Array.isArray(entry.cor_icon_alts) ? entry.cor_icon_alts : [],
      notes: Array.isArray(entry.notes) ? entry.notes : [],
      id: entry.id || '',
      mealPeriod: entry.mealPeriod || ''
    };
  }
  return { label: '', station: '', description: '', tags: [] };
}
