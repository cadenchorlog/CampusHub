import React from 'react';
import { motion } from 'framer-motion';

export default function Header({ 
  headerTitle, 
  headerSubtitle, 
  activeTab, 
  menuVendor, 
  setMenuVendor 
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6 flex items-center justify-between gap-3"
    >
      <div className="pl-2">
        <h1 className="text-left text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 leading-tight">
          {headerTitle}
        </h1>
        {headerSubtitle && (
          <div className="text-left text-sm text-gray-500 dark:text-gray-400 -mt-1 ml-1">
            {headerSubtitle}
          </div>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2">
        {/* Vendor picker shown on Menu tab */}
        {activeTab === 'menu' && (
          <div className="inline-flex p-1 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900/60">
            <button
              onClick={() => setMenuVendor('simplot')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                menuVendor === 'simplot' 
                  ? 'bg-gray-900 text-white ring-1 ring-gray-800 dark:bg-gray-700 dark:text-white dark:ring-gray-600' 
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800'
              }`}
              aria-pressed={menuVendor === 'simplot'}
            >
              Simplot
            </button>
            <button
              onClick={() => setMenuVendor('mccain')}
              className={`ml-1 px-3 py-1.5 rounded-lg text-sm font-medium ${
                menuVendor === 'mccain' 
                  ? 'bg-gray-900 text-white ring-1 ring-gray-800 dark:bg-gray-700 dark:text-white dark:ring-gray-600' 
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800'
              }`}
              aria-pressed={menuVendor === 'mccain'}
            >
              McCain
            </button>
          </div>
        )}
      </div>
    </motion.header>
  );
}
