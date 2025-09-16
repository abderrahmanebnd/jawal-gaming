"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { apiEndPoints } from "@/routes";

export function useGame(slug) {
  return useQuery({
    queryKey: ["game", slug],
    queryFn: async () => {
      const { data } = await axios.get(`${apiEndPoints.byIdGame}/${slug}`, {
        withCredentials: true,
      });
      return data;
    },
  });
}

export function useLike(gameId) {
  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`${apiEndPoints.toggleLike}/${gameId}`, {
        withCredentials: true,
      });
      return data;
    },
  });
}
