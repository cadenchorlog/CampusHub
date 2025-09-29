import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { MdLunchDining } from "react-icons/md";
import { GrTransaction } from "react-icons/gr";
import { IoHome } from "react-icons/io5";
import { Analytics } from "@vercel/analytics/react"
 



/**
 * Coyote Cash Portal — Direct Request Build with CORS Proxy
 *
 * What changed:
 * 1) Replaced iframe-based approach with direct POST requests to the login endpoint
 * 2) Added all required browser headers to mimic a real browser request
 * 3) Uses CORS proxy to avoid browser CORS policy restrictions
 * 4) Simplified the code by removing iframe message handling
 * 5) Added built-in parser test cases so we can verify selectors locally
 * 6) More console logs at each step, no placeholders
 * 7) Enhanced error handling and user feedback
 * 8) Better visual styling and animations
 *
 * Notes:
 * - This version makes direct requests to the campus card center through a CORS proxy
 * - Only balance and recent transactions are shown.
 */

const LOGIN_ENDPOINT = "https://api.cadenchorlog.com/api/login-fetch";
const STORAGE_KEY = "coyotePortalCreds";
const LAST_DATA_KEY = "coyotePortalLastData"; // { balances: [], transactions: [], updatedAt: number }
 

// Static McCain menu content provided by user
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

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [balances, setBalances] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [rawHtml, setRawHtml] = useState("");
  const [testResults, setTestResults] = useState([]);
  const pasteRef = useRef(null);
  const iframeRef = useRef(null);
  const [showIframe, setShowIframe] = useState(true);
  const blobUrlRef = useRef(null);
  const [hasSavedCreds, setHasSavedCreds] = useState(false);
  // New: simple in-app pagination via tabs
  const [activeTab, setActiveTab] = useState("balances");
  // New: dining menu state
  const [menuStatus, setMenuStatus] = useState("idle"); // idle | loading | done | error
  const [menuError, setMenuError] = useState("");
  const [menuData, setMenuData] = useState([]); // Array of meals -> Array of [item, category]
  // After-hours override for Menu tab
  const [viewAfterHours, setViewAfterHours] = useState(false);
  // Menu vendor switcher: 'simplot' (current) or 'mccain'
  const [menuVendor, setMenuVendor] = useState('simplot');
  // Pull-to-refresh removed
  // iOS install prompt
  const [showIOSInstallPrompt, setShowIOSInstallPrompt] = useState(false);
  // Android install prompt
  const [showAndroidInstallPrompt, setShowAndroidInstallPrompt] = useState(false);
  const androidInstallEventRef = useRef(null);
  // Ticking time for live countdowns
  const [nowTick, setNowTick] = useState(() => Date.now());

  // Giveaway user count
  const [userCount, setUserCount] = useState(null);
  const [userCountStatus, setUserCountStatus] = useState('idle'); // idle | loading | done | error
  const userCountPct = useMemo(() => {
    try {
      const count = typeof userCount === 'number' ? userCount : 0;
      const pct = Math.round((count / 300) * 100);
      return Math.min(100, Math.max(0, pct));
    } catch { return 0; }
  }, [userCount]);
  // Share notice toast state + timer
  const [shareNotice, setShareNotice] = useState(null);
  const shareNoticeTimerRef = useRef(null);
  

  // Helpers to follow server-side separation logic if needed
  const BREAKFAST_STATIONS = ["Breakfast Bar", "Breakfast", "Global Breakfast"];
  const REPEATING_STATIONS = ["Comfort", "Global", "Deli", "Soup", "Pizza", "Grill", "Grill Special"];

  function isWeekendJS(date = new Date()) {
    // Match Python weekday() mapping: Mon=0..Sun=6. Weekend: Fri(4), Sat(5), Sun(6)
    const js = date.getDay(); // Sun=0..Sat=6
    const pyWeekday = (js + 6) % 7; // Mon=0..Sun=6
    return pyWeekday >= 4; // Fri-Sun
  }

  // Accept either legacy array shape or new nested object shape
  function normalizeMenuPayload(payload) {
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
        const out = [];
        for (const key of ORDER) {
          if (!Object.prototype.hasOwnProperty.call(payload, key)) continue;
          const meal = payload[key];
          const tabs = meal && typeof meal === 'object' ? meal.tabs : null;
          if (!tabs || typeof tabs !== 'object') continue;
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
                // Carry as rich objects so downstream can render descriptions and badges
                out.push({ label, station, description, tags });
              }
            }
          }
        }
        return [out];
      }
    } catch (e) {
      console.warn('[menu] normalizeMenuPayload failed:', e);
    }
    return [];
  }

  function getEntryMeta(entry) {
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
        tags: Array.isArray(entry.tags) ? entry.tags : Array.isArray(entry.cor_icons) ? entry.cor_icons : []
      };
    }
    return { label: '', station: '', description: '', tags: [] };
  }

  function rebucketMenu(raw) {
    try {
      if (!Array.isArray(raw)) return [];
      // Flatten into a single ordered stream of {label, station, description, tags}
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
      console.warn("[menu] rebucketMenu failed; using raw data", e);
      return raw;
    }
  }

  const menuBuckets = useMemo(() => {
    if (!Array.isArray(menuData) || menuData.length === 0) return [];
    return rebucketMenu(menuData);
  }, [menuData]);
  // Mobile notice state
  const [showMobileNotice, setShowMobileNotice] = useState(false);

  // Fetch giveaway user count once on mount
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        setUserCountStatus('loading');
        const res = await fetch('https://api.cadenchorlog.com/api/login-user-count', {
          method: 'GET',
          headers: { Accept: 'application/json, text/plain;q=0.9, */*;q=0.8' },
          cache: 'no-store',
        });
        let count = null;
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        if (ct.includes('application/json')) {
          const data = await res.json().catch(() => null);
          if (typeof data === 'number') count = data;
          else if (data && typeof data === 'object') {
            if (typeof data.count === 'number') count = data.count;
            else {
              const firstVal = Object.values(data)[0];
              const parsed = parseInt(String(firstVal), 10);
              if (Number.isFinite(parsed)) count = parsed;
            }
          }
        }
        if (count == null) {
          const txt = await res.text().catch(() => '');
          const m = txt.match(/\d+/);
          if (m) count = parseInt(m[0], 10);
        }
        if (!aborted) {
          if (Number.isFinite(count)) {
            setUserCount(Math.max(0, count));
            setUserCountStatus('done');
          } else {
            setUserCountStatus('error');
          }
        }
      } catch (e) {
        if (!aborted) setUserCountStatus('error');
      }
    })();
    return () => { aborted = true; };
  }, []);

  // Share link for giveaway: prefer Web Share, else clipboard with custom toast
  async function handleGiveawayShare() {
    const url = 'https://yotecard.cadenchorlog.com';
    const title = '$50 Giveaway';
    const text = 'Join the YoteCard Portal and help us reach 300 users!';
    const shareData = { title, text, url };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch (e) {
      console.log('[share] Web Share failed, using clipboard fallback:', e);
    }

    // Clipboard fallback + toast
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        if (shareNoticeTimerRef.current) clearTimeout(shareNoticeTimerRef.current);
        setShareNotice('Link copied. Share it wherever you like.');
        shareNoticeTimerRef.current = setTimeout(() => setShareNotice(null), 4000);
        return;
      }
    } catch {}

    // Legacy copy
    try {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (shareNoticeTimerRef.current) clearTimeout(shareNoticeTimerRef.current);
      setShareNotice('Link copied. Share it wherever you like.');
      shareNoticeTimerRef.current = setTimeout(() => setShareNotice(null), 4000);
      return;
    } catch {}

    // Last resort: open URL so share can be done via browser UI
    window.open(url, '_blank');
  }

  useEffect(() => {
    (async () => {
      try {
        console.log("[boot] Skipping external preload. Waiting for user login to fetch HTML via API relay");
        setRawHtml("");
        // Show a tiny placeholder in the preview so the iframe initializes cleanly
        const placeholder = "<!doctype html><html><body style=\"font-family:Arial,Helvetica,sans-serif\"><p>Sign in to fetch account HTML.</p></body></html>";
        loadHtmlInIframe(placeholder);
        console.log("[boot] Placeholder loaded into iframe");
      } catch (e) {
        console.warn("[boot] Preload noop error:", e);
        setError(String(e?.message || e));
      }
    })();
  }, []);

  // Cleanup share toast timer on unmount
  useEffect(() => {
    return () => {
      if (shareNoticeTimerRef.current) clearTimeout(shareNoticeTimerRef.current);
    };
  }, []);

  // Load last known balances/transactions immediately on boot so UI has data
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_DATA_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (Array.isArray(saved?.balances)) setBalances(saved.balances);
      if (Array.isArray(saved?.transactions)) setTransactions(saved.transactions);
      if (saved?.updatedAt) console.log("[cache] Loaded last data at", new Date(saved.updatedAt).toISOString());
    } catch (e) {
      console.warn("[cache] Failed to load last data:", e);
    }
  }, []);

  // Android beforeinstallprompt handling (show custom install prompt)
  useEffect(() => {
    const onBeforeInstall = (e) => {
      // Android Chrome fires this when PWA criteria are met
      e.preventDefault();
      androidInstallEventRef.current = e;
      try {
        const ua = (navigator.userAgent || '').toLowerCase();
        const isAndroid = /android/.test(ua);
        const inStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
        const last = parseInt(localStorage.getItem('androidInstallLastPrompt') || '0', 10) || 0;
        const DAY = 24 * 60 * 60 * 1000;
        if (isAndroid && !inStandalone && (Date.now() - last >= DAY)) {
          setShowAndroidInstallPrompt(true);
        }
      } catch {}
    };
    const onInstalled = () => {
      setShowAndroidInstallPrompt(false);
      androidInstallEventRef.current = null;
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  function handleAndroidInstall() {
    const evt = androidInstallEventRef.current;
    if (!evt) return;
    try {
      evt.prompt();
      evt.userChoice?.then?.((choice) => {
        // Hide prompt regardless; browser will show its native prompt result
        setShowAndroidInstallPrompt(false);
        localStorage.setItem('androidInstallLastPrompt', String(Date.now()));
      });
    } catch {
      // Hide prompt and set cooldown even if prompt fails
      setShowAndroidInstallPrompt(false);
      localStorage.setItem('androidInstallLastPrompt', String(Date.now()));
    }
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const u = saved?.username;
        const p = saved?.password;
        if (u && p) {
          console.log("[auth] Found saved credentials. Auto sign-in will run now");
          setUsername(u);
          setPassword(p);
          setHasSavedCreds(true);
          performLogin(u, p, true);
        }
      }
    } catch (e) {
      console.warn("[auth] Failed to read saved credentials:", e);
    }
  }, []);
  function accountLabel(accountRaw) {
    const s = (accountRaw || "").toLowerCase();
    let out = "";
    if (s.includes("weekly")) out = "Meals";
    else if (s.includes("coyote cash")) out = "Coyote Cash";
    else if (s.includes("flex")) out = "Flex";
    console.log("[ui] accountLabel:", accountRaw, "=>", out || "(none)");
    return out;
  }

  function formatDescription(descRaw) {
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


  // No longer need to intercept iframe messages since we're doing direct requests

  // Removed proxy-related fetchWithProxy, classifyHttpError, classifyNetworkError, safeReadText

  function toDoc(html) {
    const parser = new DOMParser();
    return parser.parseFromString(html || "", "text/html");
  }

  // Load HTML into the iframe for display purposes only (disabled for production view)
  function loadHtmlInIframe(html) {
    console.log("[display] iframe preview disabled");
    return null;
  }

  function isLoggedInDoc(doc) {
    const text = (doc?.documentElement?.textContent || "").toLowerCase();
    const looksLoggedIn =
      /account home/i.test(text) ||
      /my accounts/i.test(text) ||
      /recent yote card transaction history/i.test(text);
    const hasNameCell = !!doc?.querySelector("td strong, td b");
    const hasLoginForm = !!doc?.querySelector('form[action*="/ch/login.html"] input[name="username"]');
    console.log("[detect] looksLoggedIn:", looksLoggedIn, "hasLoginForm:", hasLoginForm);
    // Logged in if we see the account home markers and no login form
    return looksLoggedIn && !hasLoginForm && hasNameCell;
  }



  function extractBalances(doc) {
    console.log("[parse] Extracting balances from College of Idaho style page");
    const getText = el => (el?.textContent || "").trim();
    const money = /-?\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?/;
    const balances = [];
    // Look for the My Accounts table
    const accountTables = Array.from(doc.querySelectorAll("table")).filter(t =>
      /my accounts/i.test(getText(t))
    );
    for (const table of accountTables) {
      const rows = Array.from(table.querySelectorAll("tr"));
      for (const tr of rows) {
        const cells = Array.from(tr.querySelectorAll("td"));
        if (cells.length >= 4) {
          // Update: Use cells[1] for account name instead of cells[0]
          const accountCell = cells[1];
          const balCell = cells[cells.length - 1];
          const div = balCell.querySelector("div[align=right]");
          if (div) {
            const txt = getText(div);
            const m = txt.match(money);
            if (m) {
              let val = m[0].replace(/\s+/g, "");
              const account = getText(accountCell);
              // If not weekly, ensure dollar sign
              if (!/weekly/i.test(account) && !val.startsWith("$")) val = "$" + val;
              // If weekly, leave val as-is (no dollar sign forced)
              // --- FLEX ZERO SKIP LOGIC START ---
              if (/flex/i.test(account) && /^(\$)?0+(\.00)?$/.test(val)) {
                console.log("[parse] Skipping zero Flex account");
                continue;
              }
              // --- FLEX ZERO SKIP LOGIC END ---
              console.log("[parse] Balance found:", { account, balance: val });
              balances.push({ account, balance: val });
            }
          }
        }
      }
    }
    if (balances.length > 0) {
      return balances;
    }
    // fallback to old logic: try to find a single money value
    console.warn("[parse] Falling back to generic balance detection");
    const bodyText = getText(doc.body);
    const m = bodyText.match(money);
    if (m) {
      let val = m[0];
      // For fallback, always ensure dollar sign since account is unknown
      if (!val.startsWith("$")) val = "$" + val;
      balances.push({ account: "Unknown", balance: val });
      return balances;
    }
    return [];
  }

  function extractTransactions(doc, maxRows = 15) {
    console.log("[parse] Extracting transactions from tables");
    const tables = Array.from(doc.querySelectorAll("table"));
    const results = [];

    const normalize = (s) => (s || "").replace(/\u00A0|\xa0/g, " ").replace(/\s+/g, " ").trim();
    const isDetailsRow = (tr) => tr.classList.contains("DetailsRowClass") || /^Details_/i.test(tr.id || "");
    const looksTxnHeader = (tr) => {
      const cells = Array.from(tr.querySelectorAll("td,th")).map((c) => normalize(c.textContent).toLowerCase());
      return cells.some((c) => c.includes("date")) && cells.some((c) => c.includes("amount"));
    };
    const getAmount = (td) => {
      if (!td) return "";
      const el = td.querySelector('div[align="right"], div[align=right]') || td;
      const txt = normalize(el.textContent);
      // Keep only digits, comma, dot, sign for parsing and then extract a number-like token
      const cleaned = txt.replace(/[^0-9,\.\-\+]/g, "");
      const m = cleaned.match(/[-+]?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|[-+]?\d+(?:\.\d{1,2})?/);
      return m ? m[0] : txt;
    };

    // First pass: handle Yote Card style tables where headers are <td><strong>..</strong></td> and rows have id="EntryRow"
    for (const table of tables) {
      const tableText = normalize(table.textContent).toLowerCase();
      const headerRow = Array.from(table.querySelectorAll("tr")).find(looksTxnHeader);
      const isYoteStyle = tableText.includes("recent yote card transaction history") || !!headerRow;
      if (!isYoteStyle) continue;

      console.log("[parse] Found Yote-style transactions table candidate");

      const entryRows = Array.from(table.querySelectorAll("tr")).filter((tr) => {
        const id = tr.getAttribute("id") || "";
        const cellsCount = tr.querySelectorAll("td,th").length;
        const hasStrongHeaderCells = Array.from(tr.querySelectorAll("td")).every((td) => !!td.querySelector("strong"));
        return (
          !isDetailsRow(tr) &&
          (/EntryRow/i.test(id) || (cellsCount >= 6 && !hasStrongHeaderCells && !tr.querySelector("th")))
        );
      });

      for (const tr of entryRows) {
        const tds = Array.from(tr.querySelectorAll("td"));
        if (tds.length < 5) continue;

        const date = normalize(tds[0]?.textContent);
        const time = normalize(tds[1]?.textContent);
        const description = normalize(tds[2]?.textContent);
        const account = normalize(tds[3]?.textContent);
        const type = normalize(tds[4]?.textContent);
        const amountRaw = getAmount(tds[5] || tds[tds.length - 1]);

        const lower = (description + " " + type).toLowerCase();
        const isCredit = /(credit|reload|deposit|refund)/i.test(lower);
        const isDebit = /(debit|auth|purchase|meal|unit)/i.test(lower);

        let amount = amountRaw;
        if (amount && !/^[\-\+]/.test(amount)) {
          if (isDebit && !isCredit) amount = "-" + amount; // make likely debits negative for UI coloring
        }

        results.push({ date, time, description, account, type, amount });
        if (results.length >= maxRows) break;
      }

      if (results.length) {
        console.log("[parse] Parsed", results.length, "rows from Yote-style table");
        return results;
      }
    }

    // Fallback: generic logic that also supports <th> header tables
    console.log("[parse] Falling back to generic table scan");
    for (const table of tables) {
      const headersEls = Array.from(table.querySelectorAll("th"));
      const headers = headersEls.map((th) => normalize(th.textContent).toLowerCase());
      let looksLikeTxn = false;

      if (headers.length) {
        looksLikeTxn = headers.some((h) => /date/.test(h)) && headers.some((h) => /(amount|debit|credit|balance)/.test(h));
      } else {
        // Some pages use <td><strong> as header row
        const hdr = Array.from(table.querySelectorAll("tr")).find((tr) => {
          const tds = Array.from(tr.querySelectorAll("td"));
          return tds.length > 0 && tds.every((td) => !!td.querySelector("strong"));
        });
        if (hdr) {
          const hdrCells = Array.from(hdr.querySelectorAll("td")).map((td) => normalize(td.textContent).toLowerCase());
          looksLikeTxn = hdrCells.some((h) => /date/.test(h)) && hdrCells.some((h) => /(amount|debit|credit|balance)/.test(h));
          if (looksLikeTxn) {
            headers.splice(0, headers.length, ...hdrCells);
          }
        }
      }

      if (!looksLikeTxn) continue;
      console.log("[parse] Candidate txn table headers:", headers);

      const rows = [];
      const bodyRows = Array.from(table.querySelectorAll("tr")).filter((tr) => tr.querySelectorAll("td").length > 0 && !isDetailsRow(tr));
      for (const tr of bodyRows) {
        const cells = Array.from(tr.querySelectorAll("td"));
        const values = cells.map((td) => normalize(td.textContent));
        if (values.length === 0) continue;

        let row = {};
        if (headers.length && headers.length === values.length) {
          headers.forEach((h, i) => {
            row[h] = values[i] || "";
          });
          // overwrite amount with numeric-extracted value when we know its column
          const idx = headers.indexOf("amount");
          if (idx >= 0) row.amount = getAmount(cells[idx]);
        } else {
          row = {
            date: values[0] || "",
            description: values[1] || "",
            amount: getAmount(cells[cells.length - 1]),
          };
        }

        rows.push(row);
        if (rows.length >= maxRows) break;
      }

      if (rows.length) {
        console.log("[parse] Parsed txn rows:", rows);
        return rows;
      }
    }

    console.log("[parse] No transactions table matched after fallback");
    return [];
  }

  async function performLogin(userArg, passArg, isAuto = false) {
    setError("");
    // Do NOT clear balances/transactions here so cached values remain visible while refreshing
    setStatus("logging_in");
    try {
      console.log("[flow] Login via", LOGIN_ENDPOINT, isAuto ? "(auto)" : "(manual)");

      const resLogin = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userArg, password: passArg })
      });

      console.log("[login] HTTP status:", resLogin.status, resLogin.statusText);

      let htmlAfterLogin = "";
      const ct = resLogin.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = await resLogin.json();
        console.log("[login] JSON keys:", Object.keys(data || {}));
        htmlAfterLogin = (data.html ?? data.body ?? "");
      } else {
        htmlAfterLogin = await resLogin.text();
        console.log("[login] Received non-JSON; treating response as HTML string. Length:", htmlAfterLogin.length);
      }

      if (!htmlAfterLogin || htmlAfterLogin.trim().length === 0) {
        throw new Error("Empty HTML received from login endpoint");
      }

      setRawHtml(htmlAfterLogin);
      loadHtmlInIframe(htmlAfterLogin);

      const postDoc = toDoc(htmlAfterLogin);
      const loggedIn = isLoggedInDoc(postDoc);
      console.log("[detect] Logged in:", loggedIn);

      if (loggedIn) {
        const foundBalances = extractBalances(postDoc);
        const txns = extractTransactions(postDoc, 15);
        setBalances(foundBalances);
        setTransactions(txns);
        setStatus("done");
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ username: userArg, password: passArg }));
          setHasSavedCreds(true);
          console.log("[auth] Saved credentials to localStorage under", STORAGE_KEY);
          // Persist last known data for offline/refresh continuity
          localStorage.setItem(LAST_DATA_KEY, JSON.stringify({
            balances: foundBalances,
            transactions: txns,
            updatedAt: Date.now()
          }));
          console.log("[cache] Updated", LAST_DATA_KEY, "with", foundBalances.length, "balances and", txns.length, "transactions");
        } catch (e) {
          console.warn("[auth] Could not persist credentials:", e);
        }
      } else {
        setStatus("idle");
        setError("Check your username and password and try again.");
      }
    } catch (err) {
      console.error("[error] Login via API failed:", err);
      setError(String(err?.message || err || "Login failed"));
      setStatus("idle");
    }
  }

  // Fetch daily dining menu when Menu tab becomes active (Simplot only) or when Home needs specials
  useEffect(() => {
    const needSimplot = (activeTab === 'menu' && menuVendor === 'simplot') || (activeTab === 'balances');
    if (!needSimplot) return;
    if (menuStatus === "loading") return;
    if (menuStatus === "done") return;
    (async () => {
      try {
        setMenuStatus("loading");
        setMenuError("");
        const res = await fetch("https://api.cadenchorlog.com/api/menu", { method: "GET" });
        if (!res.ok) throw new Error(`Menu request failed: ${res.status}`);
        const data = await res.json();
        const normalized = normalizeMenuPayload(data);
        if (!Array.isArray(normalized)) throw new Error("Unexpected menu format");
        setMenuData(normalized);
        setMenuStatus("done");
      } catch (e) {
        console.error("[menu] Failed to load menu:", e);
        setMenuError(String(e?.message || e || "Failed to load menu"));
        setMenuStatus("error");
      }
    })();
  }, [activeTab, menuStatus, menuVendor]);

  async function handleLogin(e) {
    e.preventDefault();
    await performLogin(username, password, false);
  }

  function signOut() {
    console.log("[auth] Sign out requested. Clearing saved credentials and UI state");
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { console.warn("[auth] Failed to remove saved credentials:", e); }
    try { localStorage.removeItem(LAST_DATA_KEY); } catch (e) { console.warn("[cache] Failed to remove last data:", e); }
    setHasSavedCreds(false);
    setUsername("");
    setPassword("");
    setStatus("idle");
    setBalances([]);
    setTransactions([]);
    setRawHtml("");
    try {
      const placeholder = "<!doctype html><html><body style=\"font-family:Arial,Helvetica,sans-serif\"><p>Sign in to fetch account HTML.</p></body></html>";
      loadHtmlInIframe(placeholder);
    } catch { }
  }

  // ----- Built-in parser tests -----
  const tests = useMemo(() => ([
    {
      name: "Balance label next to value",
      html: `<div><span>Current Balance</span><strong>$123.45</strong></div>`,
      expect: { bal: "$123.45" }
    },
    {
      name: "Balance with class",
      html: `<div class="available-balance">Balance: USD 1,234.56</div>`,
      expect: { bal: "USD 1,234.56" }
    },
    {
      name: "Transactions table standard",
      html: `<table><thead><tr><th>Date</th><th>Description</th><th>Amount</th></tr></thead><tbody><tr><td>2025-08-01</td><td>Dining Hall</td><td>-$12.34</td></tr><tr><td>2025-08-02</td><td>Reload</td><td>$50.00</td></tr></tbody></table>`,
      expect: { rows: 2 }
    },
    {
      name: "Transactions table mismatch cols",
      html: `<table><tr><th>Date</th><th>Memo</th><th>Debit</th></tr><tr><td>2025-08-03</td><td>Snack Bar</td><td>$3.21</td></tr></table>`,
      expect: { rows: 1 }
    }
  ]), []);

  function runParserTests() {
    const results = [];
    for (const t of tests) {
      const doc = loadHtmlInIframe(t.html) || toDoc(t.html);
      const bals = extractBalances(doc);
      const bal = bals.length > 0 ? bals[0].balance : null;
      const tx = extractTransactions(doc, 50);
      const passBal = t.expect.bal ? bal === t.expect.bal : true;
      const passRows = t.expect.rows != null ? tx.length === t.expect.rows : true;
      results.push({ name: t.name, pass: passBal && passRows, bal, rows: tx.length });
    }
    console.log("[tests] Results", results);
    setTestResults(results);
  }

  function parseFromPaste() {
    setError("");
    const html = pasteRef.current?.value || "";
    console.log("[debug] Parsing pasted HTML length:", html.length);
    const doc = loadHtmlInIframe(html) || toDoc(html);
    const bals = extractBalances(doc);
    const tx = extractTransactions(doc, 50);
    setBalances(bals);
    setTransactions(tx);
    setRawHtml(html);
    setStatus("done");
  }

  // triggerRefresh removed with pull-to-refresh

  // Dynamic header title based on active tab once signed in
  const headerTitle = useMemo(() => {
    if (activeTab === 'balances') {
      try {
        const d = new Date(nowTick);
        return d.toLocaleDateString(undefined, { weekday: 'long' });
      } catch { return 'Today'; }
    }
    if (activeTab === 'transactions') return 'Transactions';
    return 'Menu';
  }, [activeTab, nowTick]);

  const headerSubtitle = useMemo(() => {
    if (activeTab !== 'balances') return '';
    try {
      const d = new Date(nowTick);
      const month = d.toLocaleDateString(undefined, { month: 'long' });
      const day = d.getDate();
      const suff = (n) => {
        const j = n % 10, k = n % 100;
        if (j === 1 && k !== 11) return 'st';
        if (j === 2 && k !== 12) return 'nd';
        if (j === 3 && k !== 13) return 'rd';
        return 'th';
      };
      return `${month} ${day}${suff(day)}`;
    } catch { return ''; }
  }, [activeTab, nowTick]);

  // Require install on iOS Safari: block with full-screen prompt until added to Home Screen
  useEffect(() => {
    const check = () => {
      try {
        const ua = (navigator.userAgent || "").toLowerCase();
        const isIOS = /iphone|ipod|ipad/.test(ua);
        const inStandalone =
          (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
          (window.navigator && window.navigator.standalone === true);
        setShowIOSInstallPrompt(isIOS && !inStandalone);
      } catch {
        setShowIOSInstallPrompt(false);
      }
    };
    check();
    // Recheck on visibility changes or orientation (user may switch contexts)
    document.addEventListener('visibilitychange', check);
    window.addEventListener('pageshow', check);
    window.addEventListener('orientationchange', check);
    return () => {
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('pageshow', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  // Pull-to-refresh gesture removed

  // Live time tick for countdowns
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 30000); // update every 30s
    return () => clearInterval(id);
  }, []);


  return (
    <MotionConfig transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
      <Analytics/>
      <div className="min-h-screen relative overflow-x-hidden text-gray-800 bg-white dark:bg-[#0b0b0f] dark:text-gray-100">

      <div className="max-w-3xl mx-auto p-6 pb-28 relative z-10">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 flex items-center justify-between gap-3"
        >
          <div className="pl-2">
            <h1 className="text-left text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 leading-tight">{headerTitle}</h1>
            {headerSubtitle && (
              <div className="text-left text-sm text-gray-500 dark:text-gray-400 -mt-1 ml-1">{headerSubtitle}</div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* Vendor picker shown on Menu tab */}
            {activeTab === 'menu' && (
              <div className="inline-flex p-1 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
                <button
                  onClick={() => setMenuVendor('simplot')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${menuVendor === 'simplot' ? 'bg-gray-900 text-white ring-1 ring-gray-800 dark:bg-gray-700 dark:text-white dark:ring-gray-600' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800'}`}
                  aria-pressed={menuVendor === 'simplot'}
                >
                  Simplot
                </button>
                <button
                  onClick={() => setMenuVendor('mccain')}
                  className={`ml-1 px-3 py-1.5 rounded-lg text-sm font-medium ${menuVendor === 'mccain' ? 'bg-gray-900 text-white ring-1 ring-gray-800 dark:bg-gray-700 dark:text-white dark:ring-gray-600' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800'}`}
                  aria-pressed={menuVendor === 'mccain'}
                >
                  McCain
                </button>
              </div>
            )}
          </div>

        </motion.header>

        <div className={`grid grid-cols-1 gap-6 items-start`}>

          {/* Only render balances and transactions when hasSavedCreds is true */}
          {activeTab === "balances" && (
            <>
              {/* Home: Balances + Daily Specials */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="p-0"
              >
                {/* Exclusive giveaway prompt + sign-in will render below when logged out */}
                {/* Animated alert above the card */}
                <AnimatePresence mode="popLayout">
                  {shareNotice && (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                      className="mt-4 mb-3"
                      role="status"
                      aria-live="polite"
                    >
                      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-100">
                        {shareNotice}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* $50 Giveaway Card (only when logged in) */}
                {hasSavedCreds ? (
                  <motion.div layout transition={{ type: 'spring', stiffness: 500, damping: 38 }}>
                    <div className="mb-6">
                      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
                        <div className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-200">$50 Giveaway</div>
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          After YoteCard hits 300 users I will give away $50 to a random person. Share it so you can win! If you win I will contact you by text.
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                              <span>{typeof userCount === 'number' ? userCount : (userCountStatus === 'error' ? '—' : '…')} / 300 users</span>
                              <span>{userCountPct}%</span>
                            </div>
                            <div className="mt-1 h-2 w-full rounded-full bg-gray-200 overflow-hidden dark:bg-gray-700">
                              <div
                                className="h-full rounded-full bg-[#0A84FF] transition-all"
                                style={{ width: userCountPct + '%' }}
                                aria-hidden="true"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleGiveawayShare}
                            className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                            aria-label="Share giveaway"
                          >
                            <svg
                              aria-hidden="true"
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 3v8" />
                              <path d="M9 6l3-3 3 3" />
                              <path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
                            </svg>
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="mb-4">
                    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
                      <div className="text-base font-semibold text-gray-800 dark:text-gray-100">Log in to enter the $50 giveaway</div>
                      <div className="w-8 h-8 rounded-full border bg-indigo-50 border-indigo-200 dark:border-indigo-700 dark:bg-indigo-900/20 flex items-center justify-center">
                        <span role="img" aria-label="gift" className="text-base">🎁</span>
                      </div>
                    </div>
                  </div>
                )}
                {!hasSavedCreds && (
                  <InlineSignIn
                    username={username}
                    password={password}
                    setUsername={setUsername}
                    setPassword={setPassword}
                    status={status}
                    error={error}
                    handleLogin={handleLogin}
                    onShowMobileNotice={() => setShowMobileNotice(true)}
                  />
                )}
                {/* Removed duplicate loader to avoid overlapping with pull-to-refresh indicator */}
                {(hasSavedCreds && balances.length > 0) ? (
                  <div className="relative">
                    {/* Removed inline refreshing indicator */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {balances.map((b, i) => (
                      <motion.div
                        key={`${accountLabel(b.account) || b.account || 'balance'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-900/60"
                        style={{ willChange: 'transform' }}
                      >
                        <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                          {b.balance}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 tracking-wide">
                          {accountLabel(b.account) === "Meals"
                            ? "Meals left this week"
                            : (accountLabel(b.account) || b.account)}
                        </p>
                      </motion.div>
                    ))}
                    </div>
                  </div>
                ) : hasSavedCreds && status === "done" ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <p className="text-gray-700">Could not find a balance label</p>
                  </div>
                ) : null}

                {/* end balances intro section content continues below */}
                {/* Simplot Specials (from Simplot menu) */}
                <div className="mt-8">
                  {/* Divider with centered label */}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
                    <span className="text-sm font-semibold tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      Simplot Specials
                    </span>
                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  {menuStatus === 'loading' && (
                    <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading specials…</div>
                  )}
                  {menuStatus === 'done' && Array.isArray(menuBuckets) && menuBuckets.length > 0 && (
                    <div className="mt-3 space-y-4">
                      {(() => {
                        const labels = menuBuckets.length === 2 ? ['Brunch','Dinner'] : ['Breakfast','Lunch','Dinner'];
                        // Build Grill Special all-day set (keep first seen meta per unique label)
                        const grillMap = new Map(); // normLabel -> { label, description, tags }
                        for (const meal of menuBuckets) {
                          for (const entry of (meal || [])) {
                            const { label, station, description, tags } = getEntryMeta(entry);
                            if (String(station || '').toLowerCase().includes('grill special')) {
                              const norm = String(label || '').trim().toLowerCase();
                              // Home specials: include only items that have descriptions
                              if (norm && !grillMap.has(norm) && String(description || '').trim()) {
                                grillMap.set(norm, { label, description, tags });
                              }
                            }
                          }
                        }

                        const mealCards = menuBuckets.map((meal, idx) => {
                          const groups = (meal || []).reduce((acc, entry) => {
                            const { label, station, description, tags } = getEntryMeta(entry);
                            const key = String(station || 'Other');
                            const lbl = String(label || '').trim();
                            if (!lbl) return acc;
                            const bucket = (acc[key] = acc[key] || []);
                            // keep insertion order, avoid dups by label
                            const exists = bucket.some(x => (x?.label || '').toLowerCase() === lbl.toLowerCase());
                            if (!exists) bucket.push({ label: lbl, description, tags });
                            return acc;
                          }, {});
                          const byKey = Object.fromEntries(Object.entries(groups).map(([k,v])=>[k.toLowerCase(), v]));
                          const comfortKey = Object.keys(byKey).find(k => k.includes('comfort'));
                          const globalKey = Object.keys(byKey).find(k => k.includes('global'));
                          // Home specials: only include category picks that have descriptions
                          const comfortFirst = comfortKey ? (byKey[comfortKey] || []).find(it => String(it?.description || '').trim()) || null : null;
                          const globalFirst = globalKey ? (byKey[globalKey] || []).find(it => String(it?.description || '').trim()) || null : null;
                          // Skip Breakfast; show Lunch/Dinner (and Brunch/Dinner on weekends)
                          const label = labels[idx] || `Meal ${idx+1}`;
                          const isBreakfast = /breakfast/i.test(label);
                          if (isBreakfast) return null;
                          const picks = [comfortFirst, globalFirst].filter(Boolean);
                          if (picks.length === 0) return null;
                          return (
                            <div key={`meal-${idx}`} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
                              <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">{label}</div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {picks.map((it, i) => (
                                  <div key={`pick-${idx}-${i}`} className="rounded-lg border border-gray-200 p-3 text-sm text-gray-800 dark:text-gray-100 dark:border-gray-700 dark:bg-gray-900/50">
                                    <div className="font-semibold">{it.label}</div>
                                    {(it.description || (it.tags && it.tags.length > 0)) && (
                                      <div className="mt-1">
                                        {it.description && (
                                          <div className="text-xs text-gray-600 dark:text-gray-400">{it.description}</div>
                                        )}
                                        <div className="mt-1 flex flex-wrap gap-1">
                                          {(it.tags || []).map((t) => {
                                            const s = String(t || '');
                                            const short = s.toLowerCase().includes('made without gluten-containing ingredients') ? 'GF' : s;
                                            return (
                                              <span key={short + s} className="inline-flex items-center px-2 py-0.5 rounded-md border border-gray-200 bg-white text-[11px] text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">{short}</span>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }).filter(Boolean);

                        const grillAll = Array.from(grillMap.values());

                        return (
                          <>
                            {mealCards}
                            {grillAll.length > 0 && (
                              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
                                <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Grill Special — All Day</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {grillAll.map((it, i) => (
                                    <div key={`grill-${i}`} className="rounded-lg border border-gray-200 p-3 text-sm text-gray-800 dark:text-gray-100 dark:border-gray-700 dark:bg-gray-900/50">
                                      <div className="font-semibold">{it.label}</div>
                                      {(it.description || (it.tags && it.tags.length > 0)) && (
                                        <div className="mt-1">
                                          {it.description && (
                                            <div className="text-xs text-gray-600 dark:text-gray-400">{it.description}</div>
                                          )}
                                          <div className="mt-1 flex flex-wrap gap-1">
                                            {(it.tags || []).map((t) => {
                                              const s = String(t || '');
                                              const short = s.toLowerCase().includes('made without gluten-containing ingredients') ? 'GF' : s;
                                              return (
                                                <span key={short + s} className="inline-flex items-center px-2 py-0.5 rounded-md border border-gray-200 bg-white text-[11px] text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">{short}</span>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Footer for Balances: small text and sign out above tab bar */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-6 mb-2 flex flex-col items-center gap-2"
                >
                  <p className="text-xs text-gray-600 dark:text-gray-400">Made with ❤️ by Caden Chorlog</p>
                  {hasSavedCreds && (
                    <button
                      onClick={signOut}
                      className="px-3 py-1.5 rounded-lg font-medium border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs dark:border-gray-600 dark:bg-gray-900/60 dark:hover:bg-gray-800 dark:text-gray-200"
                    >
                      Sign out
                    </button>
                  )}
                </motion.div>

              </motion.section>

            </>
          )}

          {activeTab === "transactions" && (
            <>
              {/* Enhanced Transactions card */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="p-0"
              >
                {/* Title removed; handled by top header */}
                {/* Removed duplicate loader to avoid overlapping with pull-to-refresh indicator */}
                {!hasSavedCreds && (
                  <InlineSignIn
                    username={username}
                    password={password}
                    setUsername={setUsername}
                    setPassword={setPassword}
                    status={status}
                    error={error}
                    handleLogin={handleLogin}
                    onShowMobileNotice={() => setShowMobileNotice(true)}
                  />
                )}
                {hasSavedCreds && status === "done" && transactions.length > 0 ? (
                  <div className="grid gap-3">
                    {transactions.map((t, i) => {
                      const k = `txn-${t.date || ''}-${t.time || ''}-${t.description || t["description"] || t["memo"] || ''}-${t.amount || ''}`;
                      return (
                        <React.Fragment key={k}>
                          <motion.div
                            key={`${k}-card`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                            className="border border-gray-200 bg-white rounded-xl p-4 hover:bg-gray-50 transition-colors duration-150 dark:border-gray-700 dark:bg-gray-900/60 dark:hover:bg-gray-900/70"
                            style={{ willChange: 'transform' }}
                          >
                            <div className="text-gray-800 dark:text-gray-100 font-bold text-lg">{formatDescription(t.description || t["description"] || t["memo"] || "")}</div>
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <span className="text-gray-700 dark:text-gray-300 font-medium">{t.date || t["date"] || ""}</span>
                              <span className={`font-semibold text-lg ${(t.amount || t["amount"] || "").startsWith('-') ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {t.amount || t["amount"] || t["credit"] || t["debit"] || ""}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-gray-500 dark:text-gray-400 text-sm"></div>
                              {accountLabel(t.account || t["account"] || "") && (
                                <span className="ml-3 inline-block px-2 py-0.5 rounded-full text-xs font-medium border border-gray-300 bg-gray-100 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
                                  {accountLabel(t.account || t["account"] || "")}
                                </span>
                              )}
                            </div>
                          </motion.div>
                          
                        </React.Fragment>
                      );
                    })}
                  </div>
                ) : hasSavedCreds && status === "done" ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-700">No transactions table matched standard patterns</p>
                  </div>
                ) : null}
              </motion.section>
            </>
          )}

          {activeTab === "menu" && (
            <>
              {/* Daily Menu card */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="p-0"
              >
                {/* Vendor switcher: Simplot vs McCain */}
                {/* Vendor switcher moved to header */}

                {/* After-hours notice (hide menus after 8:00 PM) */}
                {(() => {
                  const minutesNow = (() => { const d = new Date(nowTick); return d.getHours() * 60 + d.getMinutes(); })();
                  const closeTime = 20 * 60; // 8:00 PM
                  const denClose = 22 * 60;  // 10:00 PM
                  if (minutesNow >= closeTime && !viewAfterHours) {
                    const isAfter10 = minutesNow >= denClose;
                    return (
                      <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/60">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">On-campus dining is closed for the evening</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {isAfter10 ? "It’s late — try again tomorrow." : "The Den is open until 10 PM for grab-and-go."}
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40 flex items-center justify-center">
                            <span role="img" aria-label="moon" className="text-base">🌙</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => setViewAfterHours(true)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 dark:border-gray-600 dark:bg-gray-900/60 dark:hover:bg-gray-800 dark:text-gray-200"
                          >
                            View Menu
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Simplot (existing) */}
                {menuVendor === 'simplot' && (() => {
                  const minutesNow = (() => { const d = new Date(nowTick); return d.getHours() * 60 + d.getMinutes(); })();
                  if (minutesNow >= 20 * 60 && !viewAfterHours) return null;
                  return (
                  <>
                    {menuStatus === "error" && (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center">
                          <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <p className="text-gray-700">{menuError || "Could not load menu"}</p>
                      </div>
                    )}

                    {menuStatus === "done" && Array.isArray(menuBuckets) && menuBuckets.length > 0 && (
                      <div className="space-y-6">
                        {(() => {
                          const labels = menuBuckets.length === 2
                            ? ["Brunch", "Dinner"]
                            : ["Breakfast", "Lunch", "Dinner"].slice(0, menuBuckets.length);

                          // Hide past meal menus based on device local time
                      const minutes = (() => { const d = new Date(nowTick); return d.getHours() * 60 + d.getMinutes(); })();
                      const breakfastEnd = 10 * 60 + 15; // 10:15 AM
                      const lunchEnd = 13 * 60 + 30;     // 1:30 PM
                      const brunchEnd = 13 * 60 + 30;    // 1:30 PM
                      // Approximate start times (adjust if needed)
                      const breakfastStart = 7 * 60 + 30; // 7:30 AM
                      const lunchStart = 10 * 60 + 45;    // 10:45 AM
                      const brunchStart = 8 * 60 + 30;    // 8:30 AM
                      const dinnerStart = 17 * 60 + 30;   // 5:30 PM
                      const dinnerEnd = 20 * 60;          // 8:00 PM
                          const showByIdx = (i) => {
                            if (labels.length === 2) {
                              // Brunch, Dinner
                              return i === 0 ? minutes <= brunchEnd : true;
                            } else {
                              // Breakfast, Lunch, Dinner
                              if (i === 0) return minutes <= breakfastEnd;
                              if (i === 1) return minutes <= lunchEnd;
                              return true; // dinner always shown
                            }
                          };

                          // Build groups for each meal first
                          const mealGroups = menuBuckets.map((meal, idx) => {
                              // Group by category and dedupe item names per category (case-insensitive)
                              const seenByCat = {};
                              const groups = (meal || []).reduce((acc, entry) => {
                                const { label, station, description, tags } = getEntryMeta(entry);
                                const key = station || "Other";
                                const lbl = (label || "").trim();
                                if (!lbl) return acc;
                                const norm = lbl.toLowerCase();
                                const bucket = (acc[key] = acc[key] || []);
                                const seen = (seenByCat[key] = seenByCat[key] || new Set());
                                if (!seen.has(norm)) {
                                  bucket.push({ label: lbl, description, tags });
                                  seen.add(norm);
                                }
                                return acc;
                              }, {});
                              return { idx, label: labels[idx] || `Meal ${idx+1}`, groups };
                          });

                          // Cross-meal adjustments
                          try {
                            const toKey = (k) => String(k || '').toLowerCase();
                            const dinner = mealGroups.find(m => toKey(m.label).includes('dinner'));
                            const lunch = mealGroups.find(m => toKey(m.label).includes('lunch'));
                            const brunch = mealGroups.find(m => toKey(m.label).includes('brunch'));

                            // Copy Grill Special from Lunch to Dinner if Dinner missing
                            if (dinner && lunch) {
                              const dinnerHasGS = Object.keys(dinner.groups).some(k => toKey(k).includes('grill special'));
                              const lunchGSKey = Object.keys(lunch.groups).find(k => toKey(k).includes('grill special'));
                              if (!dinnerHasGS && lunchGSKey) {
                                dinner.groups[lunchGSKey] = (dinner.groups[lunchGSKey] || []).concat(lunch.groups[lunchGSKey] || []);
                              }
                            }

                            // Move Comfort from Brunch to Dinner if Dinner missing Comfort
                            if (dinner && brunch) {
                              const dinnerHasComfort = Object.keys(dinner.groups).some(k => toKey(k).includes('comfort'));
                              const brunchComfortKey = Object.keys(brunch.groups).find(k => toKey(k).includes('comfort'));
                              if (!dinnerHasComfort && brunchComfortKey) {
                                dinner.groups[brunchComfortKey] = (dinner.groups[brunchComfortKey] || []).concat(brunch.groups[brunchComfortKey] || []);
                                delete brunch.groups[brunchComfortKey];
                              }
                            }
                          } catch {}

                          return mealGroups
                            .filter(({ idx }) => showByIdx(idx))
                            .map(({ groups, label, idx }) => {
                              const entries = Object.entries(groups).sort((a, b) => {
                                const pri = (k) => {
                                  const s = String(k || '').toLowerCase();
                                  if (s.includes('comfort')) return 0;
                                  if (s.includes('global')) return 1;
                                  if (s.includes('grill special')) return 2;
                                  return 3;
                                };
                                const pa = pri(a[0]);
                                const pb = pri(b[0]);
                                if (pa !== pb) return pa - pb;
                                return String(a[0]).localeCompare(String(b[0]));
                              });
                              return (
                                <div key={idx} className="space-y-3">
                                  {(() => {
                                    const labelText = label || `Meal ${idx+1}`;
                                    const s = String(labelText).toLowerCase();
                                    let emoji = '🥪';
                                    let iconBg = 'bg-gray-50 border-gray-200';
                                    if (s.includes('breakfast') || s.includes('brunch')) {
                                      emoji = '🍳';
                                      iconBg = 'bg-amber-50 border-amber-200';
                                    } else if (s.includes('lunch')) {
                                      emoji = '🥪';
                                      iconBg = 'bg-emerald-50 border-emerald-200';
                                    } else if (s.includes('dinner')) {
                                      emoji = '🍗';
                                      iconBg = 'bg-indigo-50 border-indigo-200';
                                    }
                                    // Compute countdown text: Starts in __ or Ends in __
                                    const fmtDelta = (d) => {
                                      const abs = Math.max(0, Math.floor(d));
                                      const h = Math.floor(abs / 60);
                                      const m = abs % 60;
                                      if (h > 0 && m > 0) return `${h}h ${m}m`;
                                      if (h > 0) return `${h}h`;
                                      return `${m}m`;
                                    };
                                    let startMin = null, endMin = null;
                                    if (s.includes('breakfast')) { startMin = breakfastStart; endMin = breakfastEnd; }
                                    else if (s.includes('brunch')) { startMin = brunchStart; endMin = brunchEnd; }
                                    else if (s.includes('lunch')) { startMin = lunchStart; endMin = lunchEnd; }
                                    else if (s.includes('dinner')) { startMin = dinnerStart; endMin = dinnerEnd; }
                                    let subline = '';
                                    let endingSoon = false;
                                    if (startMin != null && endMin != null) {
                                      if (minutes < startMin) subline = `Starts in ${fmtDelta(startMin - minutes)}`;
                                      else if (minutes < endMin) {
                                        const remaining = endMin - minutes;
                                        subline = `Ends in ${fmtDelta(remaining)}`;
                                        endingSoon = remaining <= 30; // within 30 minutes
                                      }
                                      else subline = '';
                                    }
                                    const cardTone = endingSoon ? 'border-rose-200 bg-rose-50' : 'border-gray-200 bg-white';
                                    const cardToneDark = endingSoon ? 'dark:border-rose-700 dark:bg-rose-900/30' : 'dark:border-gray-700 dark:bg-gray-900/60';
                                    const iconTone = endingSoon ? 'bg-white border-rose-200' : iconBg; // iconBg already has bg+border classes
                                    const iconToneDark = endingSoon ? 'dark:border-rose-700 dark:bg-rose-900/20' : '';
                                    const iconEmoji = endingSoon ? '⏰' : emoji;
                                    return (
                                      <div className={`flex items-center justify-between rounded-xl border ${cardTone} ${cardToneDark} px-4 py-2 shadow-sm`}>
                                        <div>
                                          <div className="text-base font-semibold text-gray-800 dark:text-gray-100">{labelText}</div>
                                          {subline ? (<div className={`text-xs ${endingSoon ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>{subline}</div>) : null}
                                        </div>
                                        <div className={`w-8 h-8 rounded-full border ${iconTone} ${iconToneDark} flex items-center justify-center`}>
                                          <span role="img" aria-label={`${s} icon`} className="text-base">{iconEmoji}</span>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                  {(() => {
                                    // Determine current and next meal index to control default expansion
                                    const minutes2 = (() => { const d = new Date(nowTick); return d.getHours() * 60 + d.getMinutes(); })();
                                    const breakfastEnd2 = 10 * 60 + 15; // 10:15 AM
                                    const lunchEnd2 = 13 * 60 + 30;     // 1:30 PM
                                    const brunchEnd2 = 13 * 60 + 30;    // 1:30 PM
                                    let currentIdx = 0, nextIdx = 0;
                                    if (labels.length === 2) {
                                      // Brunch, Dinner
                                      if (minutes2 <= brunchEnd2) { currentIdx = 0; nextIdx = 1; } else { currentIdx = 1; nextIdx = 1; }
                                    } else {
                                      // Breakfast, Lunch, Dinner
                                      if (minutes2 <= breakfastEnd2) { currentIdx = 0; nextIdx = 1; }
                                      else if (minutes2 <= lunchEnd2) { currentIdx = 1; nextIdx = 2; }
                                      else { currentIdx = 2; nextIdx = 2; }
                                    }

                                    const isCurOrNextMeal = (idx === currentIdx || idx === nextIdx);
                                    const shouldDefaultOpen = (catName) => {
                                      if (!isCurOrNextMeal) return false;
                                      const s2 = String(catName || '').toLowerCase();
                                      return s2.includes('comfort') || s2.includes('global') || s2.includes('grill special');
                                    };

                                    return entries.length === 0 ? (
                                      <p className="text-gray-600">No items listed.</p>
                                    ) : (
                                      entries.map(([cat, items]) => (
                                        <SimplotCategory key={`${cat}-${shouldDefaultOpen(cat) ? 'open' : 'closed'}`} name={cat} items={items} defaultOpen={shouldDefaultOpen(cat)} />
                                      ))
                                    );
                                  })()}
                                </div>
                              );
                          });
                        })()}
                      </div>
                    )}
                  </>
                  );
                })()}

                {/* McCain (interactive) */}
                {menuVendor === 'mccain' && (() => {
                  const minutesNow = (() => { const d = new Date(nowTick); return d.getHours() * 60 + d.getMinutes(); })();
                  if (minutesNow >= 20 * 60 && !viewAfterHours) return null;
                  return (
                  <>
                    {(() => {
                      // Show a closing-soon card within 30 minutes before 8:00 PM
                      const minutesNow = (() => { const d = new Date(nowTick); return d.getHours() * 60 + d.getMinutes(); })();
                      const windowStart = 19 * 60 + 30; // 7:30 PM
                      const closeTime = 20 * 60;        // 8:00 PM
                      if (minutesNow >= windowStart && minutesNow < closeTime) {
                        const remaining = closeTime - minutesNow;
                        const fmt = (m) => {
                          const h = Math.floor(m / 60);
                          const mm = m % 60;
                          if (h > 0 && mm > 0) return `${h}h ${mm}m`;
                          if (h > 0) return `${h}h`;
                          return `${mm}m`;
                        };
                        return (
                          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-semibold text-rose-700">McCain Grill closes soon</div>
                                <div className="text-xs text-rose-600">Closes in {fmt(remaining)} • The Den is open until 10 PM</div>
                              </div>
                              <div className="w-8 h-8 rounded-full border border-rose-200 bg-white flex items-center justify-center">
                                <span role="img" aria-label="alarm" className="text-base">⏰</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <MccainMenu menu={MCCAIN_MENU} />
                  </>
                  );
                })()}
              </motion.section>
            </>
          )}
          {/* END Developer Debug section (removed) */}
        </div>

        


      </div>

      {/* Floating pill tab bar (Apple-style) */}
      <AnimatePresence>
        {
          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-0 bottom-6 z-50 pointer-events-none"
            aria-label="Primary"
          >
            <div className="w-full flex justify-center">
              <div className="pointer-events-auto relative flex items-center gap-1 p-1 rounded-full border border-gray-300 bg-gray-200 dark:border-white/10 dark:bg-gray-900/70 backdrop-blur-xl shadow-2xl">
              {/* Home tab */}
              <button
                onClick={() => setActiveTab("balances")}
                className="relative w-16 h-12 flex items-center justify-center rounded-full"
                aria-pressed={activeTab === "balances"}
                aria-label="Home"
              >
                {activeTab === "balances" && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute inset-0 rounded-full bg-white dark:bg-gray-800 shadow-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <IoHome className={`w-6 h-6 relative ${activeTab === "balances" ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300"}`} aria-hidden="true" />
              </button>

              {/* Transactions tab */}
              <button
                onClick={() => setActiveTab("transactions")}
                className="relative w-16 h-12 flex items-center justify-center rounded-full"
                aria-pressed={activeTab === "transactions"}
                aria-label="Transactions"
              >
                {activeTab === "transactions" && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute inset-0 rounded-full bg-white dark:bg-gray-800 shadow-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <GrTransaction className={`w-6 h-6 relative ${activeTab === "transactions" ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300"}`} aria-hidden="true" />
              </button>

              {/* Menu tab */}
              <button
                onClick={() => setActiveTab("menu")}
                className="relative w-16 h-12 flex items-center justify-center rounded-full"
                aria-pressed={activeTab === "menu"}
                aria-label="Menu"
              >
                {activeTab === "menu" && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute inset-0 rounded-full bg-white dark:bg-gray-800 shadow-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <MdLunchDining className={`w-6 h-6 relative ${activeTab === "menu" ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300"}`} aria-hidden="true" />
              </button>
              </div>
            </div>
          </motion.nav>
        }
      </AnimatePresence>

      {/* Mobile registration notice modal */}
      <AnimatePresence>
        {showMobileNotice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50  flex items-center justify-center px-4"
          >
            <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-sm w-full text-center shadow-lg dark:bg-gray-900/70 dark:border-gray-700">
              <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-100">Whoops!</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                You cannot sign up for an account on the app. Visit yotecard.cadenchorlog.com on a laptop to sign up.
              </p>
              <button
                onClick={() => setShowMobileNotice(false)}
                className="mt-2 px-4 py-2 rounded-xl font-semibold border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors dark:border-gray-600 dark:bg-gray-900/60 dark:hover:bg-gray-800 dark:text-gray-200"
              >
                Got it
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Android install prompt (custom) */}
      <AnimatePresence>
        {showAndroidInstallPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-black/20 flex items-end sm:items-center justify-center"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="mx-4 mb-[max(1rem,env(safe-area-inset-bottom))] sm:mx-0 sm:mb-0 max-w-md w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900/70"
            >
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Install YoteCard</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Install YoteCard for a faster, app-like experience.</p>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => { setShowAndroidInstallPrompt(false); localStorage.setItem('androidInstallLastPrompt', String(Date.now())); }}
                  className="px-3 py-1.5 rounded-lg font-medium border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs dark:border-gray-600 dark:bg-gray-900/60 dark:hover:bg-gray-800 dark:text-gray-200"
                >
                  Not now
                </button>
                <button
                  onClick={handleAndroidInstall}
                  className="px-3 py-1.5 rounded-lg font-semibold bg-[#0A84FF] hover:bg-[#0077ED] text-white text-xs"
                >
                  Install
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Add to Home Screen full-screen prompt */}
      <AnimatePresence>
        {showIOSInstallPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white dark:bg-[#0b0b0f] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="max-w-md mx-auto p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Install YoteCard App</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                YoteCard requires Home Screen install on iPhone. Follow the steps below.
              </p>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3 dark:border-gray-700 dark:bg-gray-900/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">1</div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
                    Tap the Share button in Safari
                    <svg
                      aria-hidden="true"
                      className="w-4 h-4 text-gray-700 dark:text-gray-300"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3v8" />
                      <path d="M9 6l3-3 3 3" />
                      <path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
                    </svg>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">2</div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">Scroll and choose <span className="font-medium">Add to Home Screen</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">3</div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">Tap <span className="font-medium">Add</span> in the top-right</p>
                </div>
              </div>
              <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                After installing, open the app from your Home Screen.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Iframe is now only used for HTML preview display. */}

      {/* Enhanced keyframes for animations */}
      <style>{`
        @keyframes shimmer { 
          0% { background-position: 0 0; } 
          100% { background-position: 200% 0; } 
        }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
      </div>
    </MotionConfig>
  );
}

function Loader({ label = "Loading..." }) {
  return (
    <div className="inline-flex items-center gap-3">
      <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-[#0A84FF] animate-spin" />
      <span className="text-gray-700 font-medium select-none">{label}</span>
    </div>
  );
}

// Ad component removed per request

function InlineSignIn({ username, password, setUsername, setPassword, status, error, handleLogin, onShowMobileNotice }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 dark:bg-gray-900/60 dark:border-gray-700">
      <h2 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">Sign in to view your account</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
            <span className="block mb-2">Username</span>
            <input
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Your YoteCard Username"
              required
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 outline-none focus:ring-2 focus:ring-[#0A84FF] focus:border-[#0A84FF] transition-all text-gray-900 dark:bg-gray-900/60 dark:border-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 dark:focus:ring-[#0A84FF] dark:focus:border-[#0A84FF]"
            />
          </label>
        </div>
        <div>
          <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
            <span className="block mb-2">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 outline-none focus:ring-2 focus:ring-[#0A84FF] focus:border-[#0A84FF] transition-all text-gray-900 dark:bg-gray-900/60 dark:border-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 dark:focus:ring-[#0A84FF] dark:focus:border-[#0A84FF]"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={status === "logging_in" || status === "loading_more"}
          aria-busy={status === "logging_in" || status === "loading_more"}
          className="relative w-full inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white bg-[#0A84FF] hover:bg-[#0077ED] disabled:opacity-70 transition-colors duration-200"
        >
          {status === "logging_in" ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            "Sign in"
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.innerWidth < 768) {
              onShowMobileNotice?.();
            } else {
              window.open('https://cofi.campuscardcenter.com/ch/register/register.html', '_blank');
            }
          }}
          className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold border border-gray-300 bg-white hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-900/60 dark:hover:bg-gray-800 dark:text-gray-100"
        >
          Sign up
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          This platform retrieves information from Campus Card Center, the company that provides The College of Idaho with the ID card system.
        </p>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-rose-700 dark:text-rose-300 font-medium text-center p-3 bg-rose-50 border border-rose-200 rounded-xl dark:bg-rose-900/20 dark:border-rose-700"
            aria-live="polite"
          >
            {error}
          </motion.p>
        )}
      </form>
    </div>
  );
}
function MccainMenu({ menu }) {
  const categories = Array.isArray(menu?.categories) ? menu.categories : [];

  const [expanded, setExpanded] = useState(() => new Set(categories.map(c => c.name))); // default expand all
  const [sizeChoice, setSizeChoice] = useState({}); // map item name -> size key

  const toggleCat = (name) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(name)) next.delete(name); else next.add(name);
    return next;
  });

  return (
    <div className="space-y-5">
      {/* Controls removed per request */}

      {/* Content */}
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

function SimplotCategory({ name, items, defaultOpen = false }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-700 dark:bg-gray-900/60">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left dark:bg-gray-800/60 dark:hover:bg-gray-800"
        aria-expanded={open}
      >
        <div>
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">{name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{items.length} item{items.length === 1 ? '' : 's'}</div>
        </div>
        <svg className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      {open && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">No items.</p>
          ) : (
            (() => {
              // Normalize and stably sort: items with descriptions first
              const normalized = items.map((it, idx) => {
                const label = typeof it === 'string' ? it : (it?.label || '');
                const description = typeof it === 'object' ? (it?.description || '') : '';
                const tags = typeof it === 'object' && Array.isArray(it?.tags) ? it.tags : [];
                return { label, description, tags, _i: idx };
              });
              const withDesc = normalized.filter(x => String(x.description || '').trim());
              const withoutDesc = normalized.filter(x => !String(x.description || '').trim());
              const itemsSorted = withDesc.concat(withoutDesc);
              return itemsSorted.map((it, idx) => (
                <React.Fragment key={name + it.label + it._i}>
                  <div className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-900/50 dark:hover:bg-gray-900/60">
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{it.label}</div>
                    {it.description && (
                      <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">{it.description}</div>
                    )}
                    {it.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {it.tags.map((t) => {
                          const s = String(t || '');
                          const short = s.toLowerCase().includes('made without gluten-containing ingredients') ? 'GF' : s;
                          return (
                            <span key={short + s} className="inline-flex items-center px-2 py-0.5 rounded-md border border-gray-200 bg-white text-[11px] text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">{short}</span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                </React.Fragment>
              ));
            })()
          )}
        </div>
      )}
    </div>
  );
}
