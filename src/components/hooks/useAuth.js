import { useState, useEffect } from 'react';
import { STORAGE_KEY, LAST_DATA_KEY, LOGIN_ENDPOINT } from '../utils/constants';
import { toDoc, isLoggedInDoc, extractBalances, extractTransactions } from '../utils/htmlParsing';

export function useAuth() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [hasSavedCreds, setHasSavedCreds] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { username: savedUsername, password: savedPassword } = JSON.parse(saved);
        setUsername(savedUsername || "");
        setPassword(savedPassword || "");
        setHasSavedCreds(true);
      }
    } catch (e) {
      console.warn('Failed to load saved credentials:', e);
    }
  }, []);

  // Load last known data on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_DATA_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      const age = Date.now() - (saved.updatedAt || 0);
      // Consider data stale after 5 minutes
      if (age > 5 * 60 * 1000) return;
      // Data would be loaded by parent component
    } catch (e) {
      console.warn('Failed to load last data:', e);
    }
  }, []);

  const performLogin = async (userArg, passArg, isAuto = false) => {
    setError("");
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

      const postDoc = toDoc(htmlAfterLogin);
      const loggedIn = isLoggedInDoc(postDoc);
      console.log("[detect] Logged in:", loggedIn);

      if (loggedIn) {
        const foundBalances = extractBalances(postDoc);
        const txns = extractTransactions(postDoc, 15);
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
          return { balances: foundBalances, transactions: txns };
        } catch (e) {
          console.warn("[auth] Could not persist credentials:", e);
          return { balances: foundBalances, transactions: txns };
        }
      } else {
        setStatus("idle");
        setError("Check your username and password and try again.");
        return null;
      }
    } catch (err) {
      console.error("[error] Login via API failed:", err);
      setError(String(err?.message || err || "Login failed"));
      setStatus("idle");
      return null;
    }
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LAST_DATA_KEY);
    setUsername("");
    setPassword("");
    setHasSavedCreds(false);
    setStatus("idle");
    setError("");
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    status,
    setStatus,
    error,
    setError,
    hasSavedCreds,
    setHasSavedCreds,
    performLogin,
    signOut
  };
}
