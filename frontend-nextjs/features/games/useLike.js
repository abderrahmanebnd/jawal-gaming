// useLike.js
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
        { gameId, action },
        { withCredentials: true }
      );
      return data;
    },

    onMutate: async ({ action }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["game-stats", slug] });

      // Snapshot previous value
      const previousStats = queryClient.getQueryData(["game-stats", slug]);

      // Optimistically update the cache with new like count
      queryClient.setQueryData(["game-stats", slug], (old) => {
        if (!old?.data?.data) return old;

        return {
          ...old,
          data: {
            ...old.data,
            data: {
              ...old.data.data,
              likes:
                action === "like"
                  ? (old.data.data.likes || 0) + 1
                  : Math.max((old.data.data.likes || 0) - 1, 0),
            },
          },
        };
      });

      return { previousStats };
    },


    onSuccess: (response) => {
      // Update cache with actual server response (no additional request)
      queryClient.setQueryData(["game-stats", slug], (old) => ({
        ...old,
        data: {
          ...old.data,
          data: {
            ...old.data.data,
            likes: response.likes, // Use server response
          },
        },
      }));
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousStats) {
        queryClient.setQueryData(["game-stats", slug], context.previousStats);
      }
    },

    // Remove onSettled - we don't want to refetch!
    // onSettled: () => {
    //   queryClient.invalidateQueries({ queryKey: ["game-stats", slug] });
    // },
  });
}
