"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { CONSTANTS } from "@/shared/constants";
import { StorageManager } from "@/shared/storage";
import { apiEndPoints } from "@/routes";
import useGames from "@/hooks/useGames";

const GameCard = dynamic(() => import("@/features/games/GameCard"), {
  loading: () => <GameCardSkeleton />,
});

const TOP_GAMES_NUMBER = 24;
const PAGE_SIZE = 24;

const ClientHomePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // State management
  const [activeTab, setActiveTab] = useState("all");
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoriteList, setFavoriteList] = useState([]);
  const [favMutating, setFavMutating] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Refs
  const observer = useRef(null);

  // SSR safety and initialization
  useEffect(() => {
    setMounted(true);

    // Load favorites from localStorage
    const savedFavorites = StorageManager.getFavorites() || [];
    setFavoriteIds(savedFavorites);

    // Theme detection
    const checkTheme = () => {
      setIsDark(document.body.getAttribute("data-theme") !== "light");
    };
    checkTheme();

    const themeObserver = new MutationObserver(checkTheme);
    themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // Initialize tab from URL
    const tabParam = searchParams.get("tab");
    if (tabParam && ["all", "favorites", "top-games"].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    return () => themeObserver.disconnect();
  }, [searchParams]);

  // Hook for "All" games with infinite scroll
  const {
    games: allGames,
    hasMore,
    loading,
    error,
    triggerNextPage,
  } = useGames(pageNumber, PAGE_SIZE);

  // Top games query
  const { data: topGamesResponse, isLoading: loadingTopGames } = useQuery({
    queryKey: ["games", "top"],
    queryFn: async () => {
      const response = await fetch(
        `${apiEndPoints.topGames}?n=${TOP_GAMES_NUMBER}`,
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch top games");
      return response.json();
    },
    enabled: mounted && activeTab === "top-games",
    staleTime: 5 * 60 * 1000, // 5 minutes for top games
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });

  // Favorites query
  const { data: favoritesResponse, isLoading: loadingFavorites } = useQuery({
    queryKey: ["games", "favorites", favoriteIds],
    queryFn: async () => {
      if (!favoriteIds.length) return { data: { data: [] } };

      const response = await fetch(
        `${apiEndPoints.getGamesByIds}?ids=${favoriteIds.join(",")}`,
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch favorite games");
      return response.json();
    },
    enabled: mounted && activeTab === "favorites" && favoriteIds.length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Memoized game lists
  const topGames = useMemo(() => {
    return topGamesResponse?.data?.data || [];
  }, [topGamesResponse]);

  useEffect(() => {
    if (favoritesResponse?.status === 200) {
      const rows = favoritesResponse?.data?.data || [];
      const ids = StorageManager.getFavorites() || [];
      // Maintain original order
      const byId = new Map(rows.map((g) => [g.id, g]));
      setFavoriteList(ids.map((id) => byId.get(id)).filter(Boolean));
    }
  }, [favoritesResponse]);

  // Intersection Observer for infinite scroll
  const lastGameRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && activeTab === "all") {
            setPageNumber((prev) => prev + 1);
            triggerNextPage();
          }
        },
        {
          rootMargin: "100px",
        }
      );

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, activeTab, triggerNextPage]
  );

  // Event handlers
const handleToggleFavorite = useCallback(
  async (gameId) => {
    if (!gameId) return;
    if (activeTab === "favorites" && favMutating) return;

    setFavMutating(true);

    try {
      // Calculate new IDs synchronously
      const currentIds = StorageManager.getFavorites() || [];
      const exists = currentIds.includes(gameId);
      const updatedIds = exists
        ? currentIds.filter((id) => id !== gameId)
        : [...currentIds, gameId];

      // Update localStorage immediately
      StorageManager.setFavorites(updatedIds);

      // Update local state
      setFavoriteIds(updatedIds);

      if (activeTab === "favorites") {
        if (exists) {
          // Immediately remove from favoriteList for instant UI feedback
          setFavoriteList((prev) => prev.filter((game) => game.id !== gameId));
        }

        // Invalidate ALL favorites queries (not just current one)
        await queryClient.invalidateQueries({
          queryKey: ["games", "favorites"],
          exact: false, // This invalidates all variations
        });

        // Force refetch with new IDs if there are still favorites
        if (updatedIds.length > 0) {
          await queryClient.refetchQueries({
            queryKey: ["games", "favorites", updatedIds],
            exact: true,
          });
        } else {
          // No favorites left, clear the list
          setFavoriteList([]);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert on error
      const revertIds = StorageManager.getFavorites() || [];
      setFavoriteIds(revertIds);
    } finally {
      setFavMutating(false);
    }
  },
  [activeTab, favMutating, queryClient]
);

  const handleGameClick = useCallback(
    (game) => {
      if (!game) return;
      const slug =
        game.slug ||
        String(game?.title || "")
          .toLowerCase()
          .replace(/\s+/g, "-");
      router.push(`/${slug}`);
    },
    [router]
  );

  const handleTabChange = useCallback(
    (tab) => {
      setActiveTab(tab);

      // Update URL
      const params = new URLSearchParams(searchParams);
      params.set("tab", tab);
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params}`
      );

      if (tab === "all") {
        setPageNumber(1);
        if (observer.current) observer.current.disconnect();
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [searchParams]
  );

  // Displayed games logic
  const displayedGames = useMemo(() => {
    switch (activeTab) {
      case "favorites":
        return favoriteList;
      case "top-games":
        return topGames;
      default:
        return allGames;
    }
  }, [activeTab, favoriteList, topGames, allGames]);

  // Loading states
  const loadingAll = activeTab === "all" && loading && pageNumber === 1;
  const loadingTop = activeTab === "top-games" && loadingTopGames;
  const loadingFavoritesGames = activeTab === "favorites" && loadingFavorites;
  const initialLoading = loadingAll || loadingTop || loadingFavoritesGames;

  // Don't render until mounted
  if (!mounted) {
    return <HomePageSkeleton />;
  }

  if (initialLoading) {
    return (
      <div className="container" style={{ overflowY: "auto" }}>
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          favoriteCount={favoriteIds.length}
          isDark={isDark}
        />
        <LoadingState activeTab={activeTab} />
      </div>
    );
  }

  if (error && activeTab === "all" && displayedGames.length === 0) {
    return (
      <ErrorState
        onRetry={() => {
          setPageNumber(1);
          queryClient.invalidateQueries({ queryKey: ["games", "all"] });
        }}
      />
    );
  }

  return (
   

      <div className="container" style={{ overflowY: "auto" }}>
        {/* Navigation Tabs */}
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          favoriteCount={favoriteIds.length}
          isDark={isDark}
        />

        {/* Games Grid */}
        <main className="row mt-md-4 m-auto" style={{ overflowX: "hidden" }}>
          {displayedGames.map((game, idx) => {
            const isLast =
              idx === displayedGames.length - 1 && activeTab === "all";
            return (
              <GameCard
                key={`${game.id}-${activeTab}`}
                game={game}
                onGameClick={handleGameClick}
                onToggleFavorite={handleToggleFavorite}
                isFavorited={favoriteIds.includes(game.id)}
                isLast={isLast}
                lastGameRef={lastGameRef}
                inTopGames={activeTab === "top-games"}
              />
            );
          })}
        </main>

        {/* Status Messages */}
        <StatusMessages
          activeTab={activeTab}
          displayedGames={displayedGames}
          favoriteIds={favoriteIds}
          loading={loading}
          hasMore={hasMore}
          onTabChange={handleTabChange}
        />
      </div>
  );
};

// Components (same as your original design)
const NavigationTabs = ({ activeTab, onTabChange, favoriteCount, isDark }) => {
  const tabs = [
    { id: "all", label: "All Games", icon: null },
    {
      id: "favorites",
      label: `Favorites (${favoriteCount})`,
      icon: (
        <Heart
          size={16}
          className="me-1"
          fill={
            activeTab === "favorites" ? CONSTANTS.COLORS.greenMainColor : "none"
          }
        />
      ),
    },
    { id: "top-games", label: "Top Games", icon: null },
  ];

  return (
    <nav className="mb-4 mt-2">
      <ul className="nav nav-pills justify-content-sm-center flex-nowrap">
        {tabs.map((tab) => (
          <li
            key={tab.id}
            className="nav-item me-1 me-sm-2 flex-fill flex-sm-grow-0"
          >
            <button
              className={`nav-link px-2 px-sm-4 py-1 py-sm-2 mt-2 w-100 mt-sm-0 rounded-pill fw-semibold ${
                activeTab === tab.id ? "active" : ""
              }`}
              style={{
                backgroundColor: "transparent",
                color:
                  activeTab === tab.id
                    ? "#e7e8e6"
                    : isDark
                    ? "#e7e8e6"
                    : "#000000ff",
                border: `2px solid ${
                  activeTab === tab.id
                    ? CONSTANTS.COLORS.greenMainColor
                    : CONSTANTS.COLORS.yellowMainColor
                }`,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
              onClick={() => onTabChange(tab.id)}
            >
              <div
                className="fs-sm-5 tab-text flex items-center justify-center"
                style={{
                  color:
                    activeTab === tab.id
                      ? CONSTANTS.COLORS.greenMainColor
                      : isDark
                      ? "#e7e8e6"
                      : "#000000ff",
                }}
              >
                {tab.icon}
                {tab.label}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const LoadingState = ({ activeTab }) => (
  <div className="text-center py-5">
    <div
      className="spinner-border text-primary mb-3"
      role="status"
      style={{ width: "3rem", height: "3rem" }}
    >
      <span className="visually-hidden">Loading...</span>
    </div>
    <p style={{ color: "#ccc" }}>
      Loading{" "}
      {activeTab === "all"
        ? "amazing"
        : activeTab === "top-games"
        ? "top"
        : "favorite"}{" "}
      games...
    </p>
  </div>
);

const StatusMessages = ({
  activeTab,
  displayedGames,
  favoriteIds,
  loading,
  hasMore,
  onTabChange,
}) => {
  if (loading && activeTab === "all") {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading more games...</span>
        </div>
        <p className="mt-2" style={{ color: "#999" }}>
          Loading more games...
        </p>
      </div>
    );
  }

  if (
    !hasMore &&
    !loading &&
    activeTab === "all" &&
    displayedGames.length > 0
  ) {
    return (
      <div className="text-center py-4">
        <div className="text-muted">
          <p style={{ color: "#999" }}>
            🎮 You've explored all available games!
          </p>
          <small style={{ color: "#666" }}>
            Check back later for new additions
          </small>
        </div>
      </div>
    );
  }

  if (activeTab === "all" && displayedGames.length === 0 && !loading) {
    return (
      <div className="text-center py-5">
        <div className="mb-4">
          <div className="display-1">🎮</div>
        </div>
        <h5 style={{ color: "#999" }}>No games available</h5>
        <p style={{ color: "#666" }}>
          No games found. Please check back later.
        </p>
      </div>
    );
  }

  if (activeTab === "favorites" && favoriteIds.length === 0) {
    return (
      <div className="text-center py-5">
        <Heart size={64} color="#666" className="mb-3 mx-auto" />
        <h5 style={{ color: "#999" }}>No favorites yet</h5>
        <p style={{ color: "#666" }}>
          Start exploring games and add some to your favorites by clicking the
          heart icon!
        </p>
        <button
          className="btn btn-primary rounded-pill px-4 mt-3"
          onClick={() => onTabChange("all")}
        >
          Browse All Games
        </button>
      </div>
    );
  }

  return null;
};

const ErrorState = ({ onRetry }) => (
  <div className="container py-4 text-center" style={{ minHeight: "50vh" }}>
    <div className="d-flex flex-column justify-content-center align-items-center h-100">
      <h3 style={{ color: "#999" }}>Oops! Something went wrong</h3>
      <p style={{ color: "#666" }}>
        Unable to load games. Please try again later.
      </p>
      <button
        className="btn btn-primary rounded-pill px-4 mt-3"
        onClick={onRetry}
      >
        Retry
      </button>
    </div>
  </div>
);

const HomePageSkeleton = () => (
  <div className="container">
    <div className="placeholder-glow mb-4 mt-2">
      <div className="d-flex gap-2 justify-content-center">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className="placeholder rounded-pill"
            style={{ width: "120px", height: "44px" }}
          />
        ))}
      </div>
    </div>
    <div className="row mt-4">
      {[...Array(12)].map((_, i) => (
        <GameCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

const GameCardSkeleton = () => (
  <div className="col-4 col-md-3 col-xl-2 mb-3 pt-2">
    <div className="placeholder-glow">
      <span
        className="placeholder col-12"
        style={{ height: "120px", borderRadius: "22px", aspectRatio: "1/1" }}
      />
    </div>
  </div>
);

export default ClientHomePage;
