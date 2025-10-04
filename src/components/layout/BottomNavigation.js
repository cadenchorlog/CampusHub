import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoHome } from 'react-icons/io5';
import { GrTransaction } from 'react-icons/gr';
import { MdLunchDining } from 'react-icons/md';
import { IoHeart } from 'react-icons/io5';

export default function BottomNavigation({ activeTab, setActiveTab }) {
  return (
    <AnimatePresence>
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
              <IoHome className={`w-5 h-5 relative z-10 ${activeTab === "balances" ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`} />
              {activeTab === "balances" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full bg-white dark:bg-gray-600"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>

           

            {/* Menu tab */}
            <button
              onClick={() => setActiveTab("menu")}
              className="relative w-16 h-12 flex items-center justify-center rounded-full"
              aria-pressed={activeTab === "menu"}
              aria-label="Menu"
            >
              <MdLunchDining className={`w-5 h-5 relative z-10 ${activeTab === "menu" ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`} />
              {activeTab === "menu" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full bg-white dark:bg-gray-600"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>

            {/* Favorites tab */}
            <button
              onClick={() => setActiveTab("favorites")}
              className="relative w-16 h-12 flex items-center justify-center rounded-full"
              aria-pressed={activeTab === "favorites"}
              aria-label="Favorites"
            >
              <IoHeart className={`w-5 h-5 relative z-10 ${activeTab === "favorites" ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`} />
              {activeTab === "favorites" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full bg-white dark:bg-gray-600"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
             {/* Transactions tab */}
             <button
              onClick={() => setActiveTab("transactions")}
              className="relative w-16 h-12 flex items-center justify-center rounded-full"
              aria-pressed={activeTab === "transactions"}
              aria-label="Transactions"
            >
              <GrTransaction className={`w-5 h-5 relative z-10 ${activeTab === "transactions" ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`} />
              {activeTab === "transactions" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full bg-white dark:bg-gray-600"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          </div>
        </div>
      </motion.nav>
    </AnimatePresence>
  );
}
