"use client";
import { StorageManager } from "@/shared/storage";
import { useEffect, useState } from "react";

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const saved = StorageManager.getFavorites() || [];
    setFavorites(saved);
  }, []);

  const toggleFavorite = (gameId) => {
    let updated;
    if (favorites.includes(gameId)) {
      updated = favorites.filter((id) => id !== gameId);
    } else {
      updated = [...favorites, gameId];
    }
    StorageManager.setFavorites(updated);
    setFavorites(updated);
  };

  return { favorites, toggleFavorite };
}
