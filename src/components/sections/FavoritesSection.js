import React from 'react';
import { motion } from 'framer-motion';
import { IoHeart, IoTrashOutline } from 'react-icons/io5';

export default function FavoritesSection({ favoritesHook, menuBuckets }) {
  const { favorites, removeFavorite } = favoritesHook;

  // Get favorites available today
  const favoritesAvailableToday = favoritesHook.getFavoritesAvailableToday(menuBuckets);

  if (favorites.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="p-0"
      >
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 border border-red-200 flex items-center justify-center dark:bg-red-900/20 dark:border-red-800">
            <IoHeart className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            No Favorites Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Start favoriting your favorite dishes from the menu! Tap the heart icon on any menu item to add it to your favorites.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-500">
            💡 Pro tip: When your favorites are available today, you'll get a notification on the home screen!
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="p-0"
    >
      {/* Available Today Banner */}
      {favoritesAvailableToday.length > 0 && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-800">
              <IoHeart className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-green-800 dark:text-green-200">
                🎉 Your favorites are available today!
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                {favoritesAvailableToday.length} of your favorites are on today's menu
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Favorites List */}
      <div className="space-y-3">
        {favorites.map((favorite) => {
          const isAvailableToday = favoritesAvailableToday.some(
            item => item.favoriteId === favorite.id
          );
          
          return (
            <motion.div
              key={favorite.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/60"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                      {favorite.label}
                    </h3>
                    {isAvailableToday && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Available Today
                      </span>
                    )}
                  </div>
                  {favorite.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {favorite.description}
                    </p>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {favorite.category}
                  </div>
                  {favorite.tags && favorite.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {favorite.tags.map((tag, idx) => {
                        const s = String(tag || '');
                        const short = s.toLowerCase().includes('made without gluten-containing ingredients') ? 'GF' : s;
                        return (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded-md border border-gray-200 bg-white text-[11px] text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          >
                            {short}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeFavorite(favorite.id)}
                  className="flex-shrink-0 p-2 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors dark:hover:bg-red-900/20"
                  title="Remove from favorites"
                >
                  <IoTrashOutline className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

    </motion.section>
  );
}
