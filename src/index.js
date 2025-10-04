import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import OnboardingPage from './pages/OnboardingPage';

function isStandalone() {
  try { return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true; } catch (_) { return false; }
}

function RequireOnboarding({ children }) {
  const need = (() => {
    try { 
      // Show onboarding for PWA apps OR desktop users who haven't completed onboarding
      return (isStandalone() || (!isStandalone() && window.innerWidth > 768)) && 
             localStorage.getItem('onboardingCompleteV1') !== '1'; 
    } catch (_) { 
      return false; 
    }
  })();
  if (need) return <Navigate to="/onboarding" replace />;
  return children;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/*" element={<RequireOnboarding><App /></RequireOnboarding>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Register a simple service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
    navigator.serviceWorker
      .register(swUrl)
      .then((reg) => {
        console.log('[PWA] Service worker registered', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA] Service worker registration failed', err);
      });
  });
}
