"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { apiEndPoints } from "@/routes";

export function useGameStats(slug) {
  return useQuery({
    queryKey: ["game-stats", slug],
    queryFn: async () => {
      const { data } = await axios.get(`${apiEndPoints.gameStats}/${slug}`, {
        withCredentials: true,
      });
      return data;
    },
    refetchInterval: 60000, // Refetch every 30 seconds for fresh stats
    staleTime: 0, // Always consider stale (fetch fresh data)
  });
}

export function useGameDetails(slug, fallbackData) {
  return useQuery({
    queryKey: ["game-details", slug],
    queryFn: async () => {
      const { data } = await axios.get(`${apiEndPoints.byIdGame}?id=${slug}`, {
        withCredentials: true,
      });
      return data;
    },
    initialData: fallbackData,
    staleTime: Infinity, // Never consider stale (static data)
    gcTime: Infinity, // Keep in cache forever
  });
}
