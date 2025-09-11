import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { CONSTANTS } from "../../shared/constants";
import GameCard from "../../components/GameCard";
import useApi from "../../hooks/useApi";
import { apiEndPoints } from "../../api/api";
import { StorageManager } from "../../shared/storage";
import useGames from "../../hooks/useGames";

const TOP_GAMES_NUMBER = 24;
const PAGE_SIZE = 20;

const HomePage = () => {
  const navigate = useNavigate();

  // tabs + favorites
  const [activeTab, setActiveTab] = useState("all");
  const [favoriteIds, setFavoriteIds] = useState(
    StorageManager.getFavorites() || []
  );
  const [favoriteList, setFavoriteList] = useState([]);
  const [favMutating, setFavMutating] = useState(false);

  // “All” tab paging state (tutorial style)
  const [pageNumber, setPageNumber] = useState(1);

  // Hook for “All” games with infinite scroll
  const {
    games: allGames,
    hasMore,
    loading,
    error,
  } = useGames(pageNumber, PAGE_SIZE);

  // Top games
  const [topGames, setTopGames] = useState([]);
  const [topLoaded, setTopLoaded] = useState(false);
  const {
    get: getTopGames,
    data: topGamesResponse,
    source: topGamesSource,
    loading: loadingTopGames,
  } = useApi();

  // Favorites batch API
  const {
    get: getFavoritesBatch,
    data: favoritesResponse,
    source: favoritesSource,
    loading: loadingFavorites,
  } = useApi();

  // Observe the last card like in the tutorial
  const observer = useRef(null);
  const lastGameRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && activeTab === "all") {
          setPageNumber((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, activeTab]
  );

  // Top games: fetch once when tab is opened
  useEffect(() => {
    if (activeTab !== "top-games" || topLoaded) return;
    const url = apiEndPoints.topGames;
    const params = { n: TOP_GAMES_NUMBER };
    const headers = { "Content-Type": "application/json" };
    getTopGames(url, params, headers, true);
  }, [activeTab, topLoaded, getTopGames]);

  useEffect(() => {
    if (topGamesResponse?.status === 200) {
      setTopGames(topGamesResponse?.data?.data || []);
      setTopLoaded(true);
    }
  }, [topGamesResponse]);

  useEffect(() => {
    return () => topGamesSource?.cancel?.("unmount top-games");
  }, [topGamesSource]);

  // Favorites: fetch list when opening the tab
  useEffect(() => {
    if (activeTab !== "favorites") return;
    const ids = StorageManager.getFavorites() || [];
    if (!ids.length) {
      setFavoriteList([]);
      return;
    }
    const url = apiEndPoints.getGamesByIds;
    const params = { ids: ids.join(",") };
    const headers = { "Content-Type": "application/json" };
    getFavoritesBatch(url, params, headers, true);
  }, [activeTab, getFavoritesBatch]);

  useEffect(() => {
    if (favoritesResponse?.status === 200) {
      const rows = favoritesResponse?.data?.data || [];
      const ids = StorageManager.getFavorites() || [];
      // keep original order
      const byId = new Map(rows.map((g) => [g.id, g]));
      setFavoriteList(ids.map((id) => byId.get(id)).filter(Boolean));
    }
  }, [favoritesResponse]);

  useEffect(() => {
    return () => favoritesSource?.cancel?.("unmount favorites");
  }, [favoritesSource]);

  const handleToggleFavorite = useCallback(
    async (gameId) => {
      if (!gameId) return;
      if (activeTab === "favorites" && favMutating) return;

      let updatedIds = [];
      setFavoriteIds((prev) => {
        const exists = prev.includes(gameId);
        const next = exists
          ? prev.filter((id) => id !== gameId)
          : [...prev, gameId];
        try {
          StorageManager.setFavorites(next);
        } catch {}
        updatedIds = next;
        return next;
      });

      if (activeTab === "favorites") {
        try {
          setFavMutating(true);
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

  const handleGameClick = useCallback(
    (game) => {
      if (!game) return;
      const slug = String(game?.title || "")
        .toLowerCase()
        .replace(/\s+/g, "-");
      navigate(`/${slug}`);
    },
    [navigate]
  );

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    if (tab === "all") {
      // reset paging like the tutorial resets pageNumber
      setPageNumber(1);
      // also disconnect observer so we don’t accidentally trigger loads mid-transition
      if (observer.current) observer.current.disconnect();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const displayedGames =
    activeTab === "favorites"
      ? favoriteList
      : activeTab === "top-games"
      ? topGames
      : allGames;

  // Initial UX (optional): show a spinner if “all” is empty and loading
  const loadingAll = activeTab === "all" && loading && pageNumber === 1;
  const loadingTop = activeTab === "top-games" && loadingTopGames && !topLoaded;
  const loadingFavoritesGames = activeTab === "favorites" && loadingFavorites;

  const initialLoading = loadingAll || loadingTop || loadingFavoritesGames;

  if (initialLoading) {
    return (
      <div className="container" style={{ overflowY: "auto" }}>
        <Tabs
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          favoriteIds={favoriteIds}
        />
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ color: "#ccc" }}>
            Loading {loadingAll ? "amazing" : loadingTop ? "top" : "favorite"}{" "}
            games...
          </p>
        </div>
      </div>
    );
  }

  if (error && activeTab === "all" && displayedGames.length === 0) {
    return (
      <div className="container py-4 text-center" style={{ minHeight: "50vh" }}>
        <div className="d-flex flex-column justify-content-center align-items-center h-100">
          <h3 style={{ color: "#999" }}>Oops! Something went wrong</h3>
          <p style={{ color: "#666" }}>
            Unable to load games. Please try again later.
          </p>
          <button
            className="btn btn-primary rounded-pill px-4 mt-3"
            onClick={() => setPageNumber(1)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ overflowY: "auto" }}>
      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        favoriteIds={favoriteIds}
      />

      {/* Grid */}
      <div className="row mt-md-4 m-auto" style={{ overflowX: "hidden" }}>
        {displayedGames.map((game, idx) => {
          console.log("Rendering game:", game);
          const isLast =
            idx === displayedGames.length - 1 && activeTab === "all";
          return (
            <GameCard
              key={game.id}
              game={game}
              onGameClick={handleGameClick}
              onToggleFavorite={handleToggleFavorite}
              isFavorited={favoriteIds.includes(game.id)}
              isLast={isLast}
              lastGameRef={lastGameRef}
            />
          );
        })}
      </div>

      {/* Loading / status */}
      {loading && activeTab === "all" && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading more games...</span>
          </div>
          <p className="mt-2" style={{ color: "#999" }}>
            Loading more games...
          </p>
        </div>
      )}

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

      {activeTab === "all" && displayedGames.length === 0 && !loading && (
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

function Tabs ({ activeTab, handleTabChange, favoriteIds }) {
  const isLightTheme =
    typeof window !== "undefined"
      ? document.body.getAttribute("data-theme") === "light"
      : true; // default to light theme on SSR

  return (
    <div className="mb-4 mt-2">
      <ul className="nav nav-pills justify-content-center">
        <li className="nav-item me-2">
          <button
            className={`nav-link px-4 py-2 mt-2 mt-md-0 rounded-pill fw-semibold ${
              activeTab === "all" ? "active" : ""
            }`}
            style={{
              backgroundColor: "transparent",
              color:
                activeTab === "all"
                  ? "#e7e8e6"
                  : isLightTheme
                  ? "#000000ff"
                  : "#e7e8e6",
              border: `2px solid ${
                activeTab === "all"
                  ? CONSTANTS.COLORS.greenMainColor
                  : CONSTANTS.COLORS.yellowMainColor
              }`,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onClick={() => handleTabChange("all")}
          >
            <span
              style={{
                color:
                  activeTab === "all"
                    ? CONSTANTS.COLORS.greenMainColor
                    : isLightTheme
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
            className={`nav-link px-4 py-2 rounded-pill mt-2 mt-md-0 fw-semibold ${
              activeTab === "favorites" ? "active" : ""
            }`}
            style={{
              backgroundColor: "transparent",
              color:
                activeTab === "favorites"
                  ? "#e7e8e6"
                  : isLightTheme
                  ? "#000000ff"
                  : "#e7e8e6",
              border: `2px solid ${
                activeTab === "favorites"
                  ? CONSTANTS.COLORS.greenMainColor
                  : CONSTANTS.COLORS.yellowMainColor
              }`,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onClick={() => handleTabChange("favorites")}
          >
            <Heart
              size={16}
              className="me-2"
              fill={
                activeTab === "favorites"
                  ? CONSTANTS.COLORS.greenMainColor
                  : "none"
              }
              color={
                activeTab === "favorites"
                  ? CONSTANTS.COLORS.greenMainColor
                  : isLightTheme
                  ? "#000000ff"
                  : "#f4f3f3ff"
              }
            />
            <span
              style={{
                color:
                  activeTab === "favorites"
                    ? CONSTANTS.COLORS.greenMainColor
                    : isLightTheme
                    ? "#000000ff"
                    : "#e7e8e6",
              }}
            >
              Favorites ({favoriteIds.length})
            </span>
          </button>
        </li>

        <li className="nav-item">
          <button
            className={`nav-link px-4 py-2 rounded-pill mt-2 mt-md-0 fw-semibold ${
              activeTab === "top-games" ? "active" : ""
            }`}
            style={{
              backgroundColor: "transparent",
              color:
                activeTab === "top-games"
                  ? "#e7e8e6"
                  : isLightTheme
                  ? "#000000ff"
                  : "#e7e8e6",
              border: `2px solid ${
                activeTab === "top-games"
                  ? CONSTANTS.COLORS.greenMainColor
                  : CONSTANTS.COLORS.yellowMainColor
              }`,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onClick={() => handleTabChange("top-games")}
          >
            <span
              style={{
                color:
                  activeTab === "top-games"
                    ? CONSTANTS.COLORS.greenMainColor
                    : isLightTheme
                    ? "#000000ff"
                    : "#e7e8e6",
              }}
            >
              Top Games
            </span>
          </button>
        </li>
      </ul>
    </div>
  );
}