import React from 'react';
import { motion } from 'framer-motion';
import { formatDescription, accountLabel } from '../utils/helpers';
import InlineSignIn from '../auth/InlineSignIn';

export default function TransactionsSection({
  hasSavedCreds,
  transactions,
  status,
  username,
  password,
  setUsername,
  setPassword,
  error,
  handleLogin,
  onShowMobileNotice
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="p-0"
    >
      {!hasSavedCreds && (
        <InlineSignIn
          username={username}
          password={password}
          setUsername={setUsername}
          setPassword={setPassword}
          status={status}
          error={error}
          handleLogin={handleLogin}
          onShowMobileNotice={onShowMobileNotice}
        />
      )}
      
      {hasSavedCreds && status === "done" && transactions.length > 0 ? (
        <div className="grid gap-2.5">
          {transactions.map((t, i) => {
            const k = `txn-${t.date || ''}-${t.time || ''}-${t.description || t["description"] || t["memo"] || ''}-${t.amount || ''}`;
            return (
              <React.Fragment key={k}>
                <motion.div
                  key={`${k}-card`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                  className="border border-gray-200 bg-white rounded-xl p-3 hover:bg-gray-50 transition-colors duration-150 dark:border-gray-700 dark:bg-gray-900/60 dark:hover:bg-gray-900/70"
                  style={{ willChange: 'transform' }}
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <div className="text-gray-800 dark:text-gray-100 font-bold text-base">
                      {formatDescription(t.description || t["description"] || t["memo"] || "")}
                    </div>
                    <span className={`font-semibold text-base ${
                      (t.amount || t["amount"] || "").startsWith('-') 
                        ? 'text-rose-600' 
                        : 'text-emerald-600'
                    }`}>
                      {t.amount || t["amount"] || t["credit"] || t["debit"] || ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {t.date || t["date"] || ""}
                    </span>
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
  );
}
