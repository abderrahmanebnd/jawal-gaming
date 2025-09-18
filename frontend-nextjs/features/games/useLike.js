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
      await queryClient.cancelQueries({ queryKey: ["game-stats", slug] });

      const previousStats = queryClient.getQueryData(["game-stats", slug]);

      queryClient.setQueryData(["game-stats", slug], (old) => {
        if (!old) return old;


        return {
          ...old,
          likes:
            action === "like"
              ? (old.likes || 0) + 1
              : Math.max((old.likes || 0) - 1, 0),
        };
      });

      return { previousStats };
    },

    onSuccess: (response) => {
      queryClient.setQueryData(["game-stats", slug], (old) => {
        return {
          ...old,
          likes: response.data.likes, 
        };
      });
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
