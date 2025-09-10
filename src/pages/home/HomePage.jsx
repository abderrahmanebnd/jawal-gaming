import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { CONSTANTS } from "../../shared/constants";
import GameCard from "../../components/GameCard";
import useApi from "../../hooks/useApi";
import { apiEndPoints } from "../../api/api";
import { StorageManager } from "../../shared/storage";

const TOP_GAMES_NUMBER = 24; // Fixed number of top games to fetch
const HomePage = () => {
  const navigate = useNavigate();

  // State management
  const [activeTab, setActiveTab] = useState("all");
  const [allGames, setAllGames] = useState([]);
  const [favorites, setFavorites] = useState(
    StorageManager.getFavorites() || []
  );
  const [pageSize, setPageSize] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [topGames, setTopGames] = useState([]);
  const [topLoaded, setTopLoaded] = useState(false);
  const pageSizeIncrement = 20;

  const [favMutating, setFavMutating] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(StorageManager.getFavorites());
  const [favoriteList, setFavoriteList] = useState([]);

  // API hook
  const {
    get: getGames,
    data: gameResponse,
    source: gameSource,
    error,
  } = useApi();

  // A second API instance so we don’t overwrite data/loading from the “all” list
  const {
    get: getTopGames,
    data: topGamesResponse,
    source: topGamesSource,
    error: topError,
    loading: topLoading,
  } = useApi();

  const {
    get: getFavoritesBatch,
    data: favoritesResponse,
    source: favoritesSource,
  } = useApi();

  // Refs for infinite scroll optimization
  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);
  const scrollTimeoutRef = useRef(null);
  const lastPageSizeRef = useRef(5);

  useEffect(() => {
    if (activeTab !== "favorites") return;
    const ids = StorageManager.getFavorites() || [];
    if (!ids.length) {
      setFavoriteList([]);
      return;
    }
    const url = apiEndPoints.getGamesByIds; // e.g., "/api/games/by-ids"
    const params = { ids: ids.join(",") }; // no offset/limit => fetch all
    const headers = { "Content-Type": "application/json" };
    getFavoritesBatch(url, params, headers, true);
  }, [activeTab, getFavoritesBatch]);

  useEffect(() => {
    if (activeTab === "top-games" && !topLoaded) {
      const url = apiEndPoints.topGames;
      const params = { n: TOP_GAMES_NUMBER }; // fixed to 24
      const headers = { "Content-Type": "application/json" };
      getTopGames(url, params, headers, true);
    }
  }, [activeTab, topLoaded, getTopGames]);

  useEffect(() => {
    if (favoritesResponse?.status === 200) {
      const rows = favoritesResponse?.data?.data || [];
      // De-dup and sort to match favorites ID order
      const ids = StorageManager.getFavorites() || [];
      const byId = new Map();
      for (const g of rows)
        if (g && g.id != null && !byId.has(g.id)) byId.set(g.id, g);
      const ordered = ids.map((id) => byId.get(id)).filter(Boolean);
      setFavoriteList(ordered);
    }
  }, [favoritesResponse]);
  useEffect(() => {
    return () => {
      favoritesSource?.cancel?.("Component unmounted (favorites)");
    };
  }, [favoritesSource]);

  // Handle top games response
  useEffect(() => {
    if (topGamesResponse?.status === 200) {
      const rows = topGamesResponse?.data?.data || [];
      setTopGames(rows);
      setTopLoaded(true);
    }
  }, [topGamesResponse]);

  // Cleanup cancel token for top-games request
  useEffect(() => {
    return () => {
      if (topGamesSource) {
        topGamesSource.cancel("Component unmounted (top games)");
      }
    };
  }, [topGamesSource]);

  // Sync refs with state
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  // Fetch games function with increased page size
  const fetchGames = useCallback(
    async (newPageSize = 20, isInitial = false) => {
      if (loading && !isInitial) return;

      setLoading(true);
      if (isInitial) setInitialLoading(true);

      try {
        const url = apiEndPoints.viewGame;
        const params = { pageNo: 1, pageSize: newPageSize };
        const headers = { "Content-Type": "application/json" };
        await getGames(url, params, headers, true);
        lastPageSizeRef.current = newPageSize;
      } catch (err) {
        console.error("Error fetching games:", err);
      } finally {
        setLoading(false);
        if (isInitial) setInitialLoading(false);
      }
    },
    [getGames, loading]
  );

  // Initial load
  useEffect(() => {
    fetchGames(5, true);
  }, []);

  // Handle page size change for infinite scroll
  useEffect(() => {
    if (pageSize > 5) {
      const data = fetchGames(pageSize);
    }
  }, [pageSize]);

  // Update allGames when new data arrives
  useEffect(() => {
    if (gameResponse?.status === 200) {
      const newGames = gameResponse?.data?.data || [];

      // Replace all games with new data (since we're increasing page size, not page number)
      setAllGames(newGames);

      // Check if there are more games to load
      if (newGames.length < pageSize) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    }
  }, [gameResponse, pageSize]);

  // Cancel API request on unmount
  useEffect(() => {
    return () => {
      if (gameSource) {
        gameSource.cancel("Component unmounted");
      }
    };
  }, [gameSource]);

  // Enhanced infinite scroll with proper debouncing
  useEffect(() => {
    const handleScroll = () => {
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set a new timeout to debounce scroll events
      scrollTimeoutRef.current = setTimeout(() => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const documentHeight = document.documentElement.scrollHeight;
        const threshold = 200;

        if (
          scrollPosition >= documentHeight - threshold &&
          !loadingRef.current &&
          hasMoreRef.current &&
          activeTab === "all"
        ) {
          setPageSize((prev) => prev + pageSizeIncrement);
        }
      }, 250); // Increased debounce time to prevent excessive requests
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [activeTab]);

const handleToggleFavorite = useCallback(
  async (gameId) => {
    if (!gameId) return;

    // Prevent stacking re-requests on the Favorites tab
    if (activeTab === "favorites" && favMutating) return;

    // Update state + storage in one place
    let updatedIds= [];
    setFavorites((prev) => {
      const exists = prev.includes(gameId);
      const next = exists
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId];
      try {
        StorageManager.setFavorites(next);
      } catch {}
      updatedIds = next;
      // keep the mirror list in sync for UI (badge + includes checks)
      setFavoriteIds(next);
      return next;
    });

    // If on Favorites tab, re-fetch the entire list so the grid reflects changes
    if (activeTab === "favorites") {
      try {
        setFavMutating(true);
        // read after write, ensuring the persisted value is used
        const ids = StorageManager.getFavorites() || updatedIds || [];
        if (!ids.length) {
          setFavoriteList([]);
          return;
        }
        const url = apiEndPoints.getGamesByIds;
        const params = { ids: ids.join(",") };
        const headers = { "Content-Type": "application/json" };
        await getFavoritesBatch(url, params, headers, true);
      } finally {
        setFavMutating(false);
      }
    }
  },
  [activeTab, favMutating, getFavoritesBatch]
);


  // Handle game click - navigate to game page
  const handleGameClick = useCallback(
    (game) => {
      if (!game) return;
      const slug = game?.title.toLowerCase().replace(/\s+/g, "-");
      navigate(`/${slug}`);
    },
    [navigate]
  );

  // Handle tab change with reset for infinite scroll
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);

    // Reset scroll position when switching tabs
    if (tab === "favorites") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // Sync favorites with localStorage on mount
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "favorites") {
        const newFavorites = JSON.parse(e.newValue || "[]");
        setFavorites(newFavorites);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const displayedGames =
    activeTab === "favorites"
      ? favoriteList
      : activeTab === "top-games"
      ? topGames
      : allGames;
  // Loading state for initial load
  if (initialLoading) {
    return (
      <div
        className="container py-4 d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ color: "#ccc" }}>Loading amazing games...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && allGames.length === 0) {
    return (
      <div className="container py-4 text-center" style={{ minHeight: "50vh" }}>
        <div className="d-flex flex-column justify-content-center align-items-center h-100">
          <h3 style={{ color: "#999" }}>Oops! Something went wrong</h3>
          <p style={{ color: "#666" }}>
            Unable to load games. Please try again later.
          </p>
          <button
            className="btn btn-primary rounded-pill px-4 mt-3"
            onClick={() => {
              setPageSize(5);
              setHasMore(true);
              fetchGames(5, true);
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // TODO:we can use framer-motion to animate the cards on hover and on load
  return (
    <div className="container" style={{ overflowY: "auto" }}>
      {/* Navigation Tabs */}
      <div className="mb-4 mt-2">
        <ul className="nav nav-pills justify-content-center">
          <li className="nav-item me-2">
            <button
              className={`nav-link px-4 py-2 mt-2 mt-md-0 rounded-pill fw-semibold transition-all ${
                activeTab === "all" ? "active" : ""
              }`}
              style={{
                backgroundColor: "transparent",
                color:
                  activeTab === "all"
                    ? "#e7e8e6"
                    : document.body.getAttribute("data-theme") === "light"
                    ? "#000000ff"
                    : "#e7e8e6",
                border: `2px solid ${
                  activeTab === "all"
                    ? CONSTANTS.COLORS.greenMainColor
                    : CONSTANTS.COLORS.yellowMainColor
                }`,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              onClick={() => handleTabChange("all")}
            >
              <span
                style={{
                  color:
                    activeTab === "all"
                      ? CONSTANTS.COLORS.greenMainColor
                      : document.body.getAttribute("data-theme") === "light"
                      ? "#000000ff"
                      : "#e7e8e6",
                }}
              >
                All Games
              </span>
            </button>
          </li>
          <li className="nav-item me-2">
            <button
              className={`nav-link px-4 py-2 rounded-pill mt-2 mt-md-0 fw-semibold transition-all ${
                activeTab === "favorites" ? "active" : ""
              }`}
              style={{
                backgroundColor: "transparent",
                color:
                  activeTab === "favorites"
                    ? "#e7e8e6"
                    : document.body.getAttribute("data-theme") === "light"
                    ? "#000000ff"
                    : "#e7e8e6",
                border: `2px solid ${
                  activeTab === "favorites"
                    ? CONSTANTS.COLORS.greenMainColor
                    : CONSTANTS.COLORS.yellowMainColor
                }`,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              onClick={() => handleTabChange("favorites")}
            >
              <Heart
                size={16}
                className="me-2"
                fill={
                  activeTab === "favorites"
                    ? document.body.getAttribute("data-theme") === "light"
                      ? CONSTANTS.COLORS.greenMainColor
                      : CONSTANTS.COLORS.greenMainColor
                    : "none"
                }
                color={
                  activeTab === "favorites"
                    ? document.body.getAttribute("data-theme") === "light"
                      ? CONSTANTS.COLORS.greenMainColor
                      : CONSTANTS.COLORS.greenMainColor
                    : document.body.getAttribute("data-theme") === "light"
                    ? "#000000ff"
                    : "#f4f3f3ff"
                }
              />
              <span
                style={{
                  color:
                    activeTab === "favorites"
                      ? CONSTANTS.COLORS.greenMainColor
                      : document.body.getAttribute("data-theme") === "light"
                      ? "#000000ff"
                      : "#e7e8e6",
                }}
              >
                Favorites ({favoriteIds.length}){" "}
              </span>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link px-4 py-2 rounded-pill mt-2 mt-md-0 fw-semibold transition-all ${
                activeTab === "top-games" ? "active" : ""
              }`}
              style={{
                backgroundColor: "transparent",
                color:
                  activeTab === "top-games"
                    ? "#e7e8e6"
                    : document.body.getAttribute("data-theme") === "light"
                    ? "#000000ff"
                    : "#e7e8e6",
                border: `2px solid ${
                  activeTab === "top-games"
                    ? CONSTANTS.COLORS.greenMainColor
                    : CONSTANTS.COLORS.yellowMainColor
                }`,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              onClick={() => handleTabChange("top-games")}
            >
              <span
                style={{
                  color:
                    activeTab === "top-games"
                      ? CONSTANTS.COLORS.greenMainColor
                      : document.body.getAttribute("data-theme") === "light"
                      ? "#000000ff"
                      : "#e7e8e6",
                }}
              >
                Top Games
              </span>
              {/* TODO make sure to modify this to take the length of the top games */}
            </button>
          </li>
        </ul>
      </div>

      {/* Games Grid */}
      <div
        className="row mt-md-4 m-auto"
        style={{
          overflowX: "hidden",
        }}
      >
        {displayedGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onGameClick={handleGameClick}
            onToggleFavorite={handleToggleFavorite}
            isFavorited={favoriteIds.includes(game.id)}
          />
        ))}
      </div>

      {/* Loading Indicator */}
      {loading && !initialLoading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading more games...</span>
          </div>
          <p className="mt-2" style={{ color: "#999" }}>
            Loading more games...
          </p>
        </div>
      )}

      {/* No More Games */}
      {!hasMore && !loading && activeTab === "all" && allGames.length > 0 && (
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
      )}

      {/* Empty All Games State */}
      {activeTab === "all" &&
        allGames.length === 0 &&
        !loading &&
        !initialLoading && (
          <div className="text-center py-5">
            <div className="mb-4">
              <div className="display-1">🎮</div>
            </div>
            <h5 style={{ color: "#999" }}>No games available</h5>
            <p style={{ color: "#666" }}>
              No games found. Please check back later.
            </p>
          </div>
        )}

      {/* Empty Favorites State */}
      {activeTab === "favorites" && favoriteIds.length === 0 && (
        <div className="text-center py-5">
          <Heart size={64} color="#666" className="mb-3" />
          <h5 style={{ color: "#999" }}>No favorites yet</h5>
          <p style={{ color: "#666" }}>
            Start exploring games and add some to your favorites by clicking the
            heart icon!
          </p>
          <button
            className="btn btn-primary rounded-pill px-4 mt-3"
            onClick={() => handleTabChange("all")}
          >
            Browse All Games
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
