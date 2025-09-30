import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Onboarding from '../components/Onboarding';

// Duplicate minimal constants to avoid refactoring App internals
const LOGIN_ENDPOINT = "https://api.cadenchorlog.com/api/login-fetch";
const STORAGE_KEY = "coyotePortalCreds";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  React.useEffect(() => {
    try {
      if (localStorage.getItem('onboardingCompleteV1') === '1') {
        navigate('/', { replace: true });
      }
    } catch (_) {}
  }, [navigate]);

  async function handleLogin(u, p) {
    setStatus('logging_in');
    setError('');
    try {
      const res = await fetch(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
      });
      const ct = res.headers.get('content-type') || '';
      let text = '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        text = (data.html ?? data.body ?? '');
      } else {
        text = await res.text();
      }
      if (!text) throw new Error('Empty response from login service');
      // Persist credentials so the main app can auto sign-in and fetch content
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ username: u, password: p })); } catch (_) {}
      // Mark onboarding complete and go home
      try { localStorage.setItem('onboardingCompleteV1', '1'); } catch (_) {}
      navigate('/', { replace: true });
    } catch (e) {
      setError('Sign-in failed. Check your username and password.');
    } finally {
      setStatus('idle');
    }
  }

  function finish() {
    try { localStorage.setItem('onboardingCompleteV1', '1'); } catch (_) {}
    navigate('/', { replace: true });
  }

  return (
    <Onboarding
      mode="page"
      username={username}
      password={password}
      setUsername={setUsername}
      setPassword={setPassword}
      status={status}
      error={error}
      onLogin={handleLogin}
      onComplete={finish}
      onSkipAll={finish}
    />
  );
}
