import { useState, useEffect, useCallback } from 'react';
import { normalizeMenuPayload, rebucketMenu } from '../utils/menuUtils';
import { MCCAIN_MENU } from '../utils/mccainMenuData';

export function useMenu() {
  const [menuStatus, setMenuStatus] = useState("idle");
  const [menuError, setMenuError] = useState("");
  const [menuData, setMenuData] = useState([]);
  const [menuBuckets, setMenuBuckets] = useState([]);
  const [menuVendor, setMenuVendor] = useState('simplot');
  const [viewAfterHours, setViewAfterHours] = useState(false);

  // Load menu data
  const loadMenu = useCallback(async () => {
    if (menuVendor === 'mccain') {
      setMenuStatus('done');
      setMenuData(MCCAIN_MENU);
      return;
    }

    setMenuStatus('loading');
    setMenuError('');
    
    try {
      const response = await fetch('https://api.cadenchorlog.com/api/menu');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      const normalized = normalizeMenuPayload(data);
      const buckets = rebucketMenu(normalized);
      
      setMenuData(normalized);
      setMenuBuckets(buckets);
      setMenuStatus('done');
    } catch (e) {
      console.error('[menu] fetch failed:', e);
      setMenuError(e.message || 'Failed to load menu');
      setMenuStatus('error');
    }
  }, [menuVendor]);

  // Load menu when vendor changes
  useEffect(() => {
    loadMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuVendor]); // Only run when vendor changes, not when loadMenu changes

  return {
    menuStatus,
    menuError,
    menuData,
    menuBuckets,
    menuVendor,
    setMenuVendor,
    viewAfterHours,
    setViewAfterHours,
    loadMenu
  };
}
