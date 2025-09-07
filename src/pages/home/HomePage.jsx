import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { CONSTANTS } from "../../shared/constants";
import GameCard from "../../components/GameCard";
import useApi from "../../hooks/useApi";
import { apiEndPoints } from "../../api/api";

const HomePage = () => {
  const navigate = useNavigate();

  // State management
  const [activeTab, setActiveTab] = useState("all");
  const [allGames, setAllGames] = useState([]);
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites") || "[]")
  );
  const [pageSize, setPageSize] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const pageSizeIncrement = 20;

  // API hook
  const {
    get: getGames,
    data: gameResponse,
    source: gameSource,
    error,
  } = useApi();

  // Refs for infinite scroll optimization
  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);
  const scrollTimeoutRef = useRef(null);
  const lastPageSizeRef = useRef(5);

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

  // Handle favorite toggle with proper localStorage sync
  const handleToggleFavorite = useCallback((gameId) => {
    if (!gameId) return;

    setFavorites((prevFavorites) => {
      const updatedFavorites = prevFavorites.includes(gameId)
        ? prevFavorites.filter((id) => id !== gameId)
        : [...prevFavorites, gameId];

      // Update localStorage immediately
      try {
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      } catch (error) {
        console.error("Error saving favorites to localStorage:", error);
      }

      return updatedFavorites;
    });
  }, []);

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

  // Get favorite games with proper filtering
  const favoriteGames = allGames.filter(
    (game) => game && game.id && favorites.includes(game.id)
  );

  // Get displayed games based on active tab
  const displayedGames = activeTab === "favorites" ? favoriteGames : allGames;

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

  return (
    <div className="container" style={{ overflowY: "auto" }}>
      {/* Navigation Tabs */}
      <div className="mb-4 mt-5">
        <ul className="nav nav-pills justify-content-center">
          <li className="nav-item me-2">
            <button
              className={`nav-link px-4 py-2 mt-2 mt-md-0 rounded-pill fw-semibold transition-all ${
                activeTab === "all" ? "active" : ""
              }`}
              style={{
                backgroundColor:
                  activeTab === "all"
                    ? CONSTANTS.COLORS.primary
                    : "transparent",
                color:
                  activeTab === "all"
                    ? "#ffffffff"
                    : document.body.getAttribute("data-theme") === "light"
                    ? "#000000ff"
                    : "#ffffffff",
                border: `2px solid ${
                  activeTab === "all" ? CONSTANTS.COLORS.primary : "#555"
                }`,
                transition: "all 0.3s ease",
              }}
              onClick={() => handleTabChange("all")}
            >
              Games ({allGames.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link px-4 py-2 rounded-pill mt-2 mt-md-0 fw-semibold transition-all ${
                activeTab === "favorites" ? "active" : ""
              }`}
              style={{
                backgroundColor:
                  activeTab === "favorites"
                    ? CONSTANTS.COLORS.danger
                    : "transparent",
                color:
                  activeTab === "favorites"
                    ? "#ffffffff"
                    : document.body.getAttribute("data-theme") === "light"
                    ? "#000000ff"
                    : "#ffffffff",
                border: `2px solid ${
                  activeTab === "favorites" ? CONSTANTS.COLORS.danger : "#555"
                }`,
                transition: "all 0.3s ease",
              }}
              onClick={() => handleTabChange("favorites")}
            >
              <Heart
                size={16}
                className="me-2"
                fill={
                  activeTab === "favorites"
                    ? document.body.getAttribute("data-theme") === "light"
                      ? "#ffffffff"
                      : "#f3f3f3ff"
                    : "none"
                }
                color={
                  activeTab === "favorites"
                    ? document.body.getAttribute("data-theme") === "light"
                      ? "#fffdfdff"
                      : "#fffefeff"
                    : document.body.getAttribute("data-theme") === "light"
                    ? "#000000ff"
                    : "#f4f3f3ff"
                }
              />
              Favorites ({favoriteGames.length})
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
            isFavorited={favorites.includes(game.id)}
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
      {activeTab === "favorites" && favoriteGames.length === 0 && (
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
