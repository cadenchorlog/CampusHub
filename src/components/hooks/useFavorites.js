import { useState, useEffect, useCallback } from 'react';

const FAVORITES_STORAGE_KEY = 'campusHub_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error('Error saving favorites:', error);
      }
    }
  }, [favorites, isLoading]);

  // Add item to favorites
  const addFavorite = useCallback((item) => {
    const favoriteItem = {
      id: item.id || `${item.label}-${item.description || ''}-${Date.now()}`,
      label: item.label,
      description: item.description,
      tags: item.tags || [],
      category: item.category || 'Unknown',
      addedAt: new Date().toISOString(),
      isCustom: item.isCustom || false,
      customNotes: item.customNotes || ''
    };

    setFavorites(prev => {
      // Check if already exists
      const exists = prev.some(fav => fav.id === favoriteItem.id);
      if (exists) return prev;
      
      return [...prev, favoriteItem];
    });
  }, []);

  // Remove item from favorites
  const removeFavorite = useCallback((itemId) => {
    setFavorites(prev => prev.filter(fav => fav.id !== itemId));
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback((item) => {
    const isFavorited = favorites.some(fav => 
      fav.label === item.label && 
      fav.description === item.description
    );
    
    if (isFavorited) {
      const favoriteToRemove = favorites.find(fav => 
        fav.label === item.label && 
        fav.description === item.description
      );
      if (favoriteToRemove) {
        removeFavorite(favoriteToRemove.id);
      }
    } else {
      addFavorite(item);
    }
  }, [favorites, addFavorite, removeFavorite]);

  // Check if item is favorited
  const isFavorited = useCallback((item) => {
    // Handle both Simplot (item.label) and McCain (item.name) formats
    const itemLabel = item.label || item.name || '';
    return favorites.some(fav => 
      fav.label.toLowerCase() === itemLabel.toLowerCase()
    );
  }, [favorites]);

  // Get favorites available today
  const getFavoritesAvailableToday = useCallback((todayMenu) => {
    if (!todayMenu || !Array.isArray(todayMenu)) return [];
    
    const availableFavorites = [];
    
    // Handle Simplot menu format (array of meals)
    todayMenu.forEach(meal => {
      if (Array.isArray(meal)) {
        meal.forEach(item => {
          const isAvailable = favorites.some(fav => 
            fav.label.toLowerCase() === item.label.toLowerCase()
          );
          
          if (isAvailable) {
            const favorite = favorites.find(fav => 
              fav.label.toLowerCase() === item.label.toLowerCase()
            );
            
            availableFavorites.push({
              ...item,
              favoriteId: favorite.id,
              isFavorite: true
            });
          }
        });
      }
    });
    
    return availableFavorites;
  }, [favorites]);

  // Clear all favorites
  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  // Export favorites for sharing
  const exportFavorites = useCallback(() => {
    return JSON.stringify(favorites, null, 2);
  }, [favorites]);

  // Import favorites from shared data
  const importFavorites = useCallback((favoritesData) => {
    try {
      const imported = JSON.parse(favoritesData);
      if (Array.isArray(imported)) {
        setFavorites(prev => [...prev, ...imported]);
        return true;
      }
    } catch (error) {
      console.error('Error importing favorites:', error);
    }
    return false;
  }, []);

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorited,
    getFavoritesAvailableToday,
    clearFavorites,
    exportFavorites,
    importFavorites
  };
}
