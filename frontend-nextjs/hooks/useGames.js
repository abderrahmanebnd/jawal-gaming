"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { apiEndPoints } from "@/routes";

const DEFAULT_PAGE_SIZE = 20;

export default function useGames(pageNumber, pageSize = DEFAULT_PAGE_SIZE) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["games", "all", pageSize],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(
        `${apiEndPoints.viewGame}?pageNo=${pageParam}&pageSize=${pageSize}`,
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch games");
      }

      return response.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      const payload = lastPage?.data ?? {};
      const pag = payload?.pagination ?? {};
      const currentPage = Number(pag?.currentPage ?? allPages.length);
      const totalPages = Number(pag?.totalPages ?? 1);

      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });

  // Transform data to match your original hook's format
  const transformedData = {
    games:
      data?.pages?.flatMap((page) => {
        const payload = page?.data ?? {};
        return payload?.data ?? [];
      }) || [],

    hasMore: hasNextPage || false,
    loading: isLoading || isFetchingNextPage,
    error: !!error,

    total: data?.pages?.[0]?.data?.total ?? 0,

    pageInfo: {
      currentPage: pageNumber,
      pageSize,
      totalPages: Math.ceil((data?.pages?.[0]?.data?.total ?? 0) / pageSize),
    },
  };

  // Manual trigger for next page (maintains your pageNumber pattern)
  const triggerNextPage = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return {
    ...transformedData,
    triggerNextPage,
    refetch,
  };
}
