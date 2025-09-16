"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { apiEndPoints } from "@/routes";

export function useLike(slug) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gameId, action }) => {
      const { data } = await axios.post(
        `${apiEndPoints.toggleLike}`,
        {
          gameId,
          action,
        },
        {
          withCredentials: true,
        }
      );
      return data;
    },
    onMutate: async ({ action }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["game-stats", slug] });

      // Snapshot previous value
      const previousStats = queryClient.getQueryData(["game-stats", slug]);

      // Optimistically update
      queryClient.setQueryData(["game-stats", slug], (old) => ({
        ...old,
        data: {
          ...old.data,
          likes:
            action === "like"
              ? (old.data.likes || 0) + 1
              : Math.max((old.data.likes || 0) - 1, 0),
        },
      }));

      return { previousStats };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousStats) {
        queryClient.setQueryData(["game-stats", slug], context.previousStats);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["game-stats", slug] });
    },
  });
}
