import React from 'react';
import { motion } from 'framer-motion';

export default function InlineSignIn({ 
  username, 
  password, 
  setUsername, 
  setPassword, 
  status, 
  error, 
  handleLogin, 
  onShowMobileNotice 
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 dark:bg-gray-900/60 dark:border-gray-700">
      <h2 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">
        Sign in to view your account
      </h2>
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
