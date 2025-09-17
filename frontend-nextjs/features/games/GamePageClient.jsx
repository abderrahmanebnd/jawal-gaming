"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ThumbsUp, Eye, Heart } from "lucide-react";
// import dynamic from "next/dynamic";
import { useGameDetails, useGameStats } from "./useGame";
import { useFavorites } from "./useFavorites";
import { useLike } from "./useLike";
import { apiEndPoints } from "@/routes";

// Dynamic imports for performance
// const AdBanner = dynamic(() => import("@/common/AdBanner"), {
//   ssr: false,
// });
// const GamePlayer = dynamic(() => import("@/common/GamePlayer"), {
//   ssr: false,
// });
// const GameCard = dynamic(() => import("@/common/GameCard"),{
//   ssr:false
// });

import AdBanner from "@/common/AdBanner";
import GamePlayer from "@/common/GamePlayer";
import GameCard from "@/common/GameCard";

const GamePageClient = ({ gameDetails, initialGameStats, moreGames, slug }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [likedGames, setLikedGames] = useState([]);
  const [isLiking, setIsLiking] = useState(false);
const [shuffledGames, setShuffledGames] = useState([]);

  const router = useRouter();

  // Use static game details (cached forever on server)
  const { data: gameDetailsData } = useGameDetails(slug, { data: gameDetails });

  // Use dynamic game stats (always fresh)
  const { data: gameStatsData, isLoading: statsLoading } = useGameStats(slug);
  const { mutate: likeMutation } = useLike(slug);
  const { favorites, toggleFavorite } = useFavorites();
  const game = gameDetailsData?.data || gameDetails;
  const gameStats = gameStatsData || initialGameStats;

  // Load liked games from localStorage
  useEffect(() => {
    try {
      const savedLikedGames = JSON.parse(
        localStorage.getItem("likedGames") || "[]"
      );
      setLikedGames(Array.isArray(savedLikedGames) ? savedLikedGames : []);
    } catch (error) {
      console.error("Error loading liked games:", error);
      setLikedGames([]);
    }
  }, []);


  // Memoized more games with current game excluded
useEffect(() => {
  if (!moreGames) return;

  const filtered = moreGames
    .filter((g) => g.id !== game?.id)
    .slice()
    .sort(() => Math.random() - 0.5) // Only on client
    .slice(0, 18);

  setShuffledGames(filtered);
}, [moreGames, game?.id]);

// Use shuffledGames instead of displayedMoreGames in JSX
const displayedMoreGames = shuffledGames.length
  ? shuffledGames
  : moreGames?.filter((g) => g.id !== game?.id).slice(0, 18) || [];

  // Utility functions
  const formatNumber = (num) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num?.toString() || "0";
  };

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
  const closeGame = () => setIsFullscreen(false);

  const handleGameClick = useCallback(
    (gameToNavigate) => {
      if (!gameToNavigate) return;

      // Debounce rapid navigation
      if (
        handleGameClick._lastCall &&
        Date.now() - handleGameClick._lastCall < 500
      ) {
        return;
      }
      handleGameClick._lastCall = Date.now();

      const gameSlug =
        gameToNavigate.slug ||
        gameToNavigate.title.toLowerCase().replace(/\s+/g, "-");
      router.push(`/${gameSlug}`);
    },
    [router]
  );

  const handleLikeToggle = useCallback(
    async (gameToLike) => {
      console.log({gameToLike})
      if (!gameToLike || isLiking) return;


      const isCurrentlyLiked = likedGames.includes(gameToLike.id);
      const newIsLiked = !isCurrentlyLiked;

      setIsLiking(true);

      try {
        // Optimistic localStorage update
        const updatedLikedGames = newIsLiked
          ? [...likedGames, gameToLike.id]
          : likedGames.filter((id) => id !== gameToLike.id);

        setLikedGames(updatedLikedGames);
        localStorage.setItem("likedGames", JSON.stringify(updatedLikedGames));

        // API call with optimistic React Query update
        await likeMutation({
          gameId: gameToLike.id,
          action: newIsLiked ? "like" : "unlike",
        });
      } catch (error) {
        console.error("Error toggling like:", error);

        // Rollback localStorage on error
        const rollbackLikedGames = isCurrentlyLiked
          ? [...likedGames, gameToLike.id]
          : likedGames.filter((id) => id !== gameToLike.id);

        setLikedGames(rollbackLikedGames);
        localStorage.setItem("likedGames", JSON.stringify(rollbackLikedGames));
      } finally {
        setIsLiking(false);
      }
    },
    [likedGames, isLiking, likeMutation]
  );

  // Theme detection
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.body.getAttribute("data-theme") !== "light");
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const isCurrentFavorited = !!(game?.id && favorites.includes(game.id));
  const isCurrentlyLiked = likedGames.includes(game?.id);

  return (
    <div>
      {/* Header with back button */}
      <div className="container py-3">
        <button
          style={{ color: isDark ? "" : "#000000ff" }}
          className="btn btn-outline-light rounded-pill mb-3"
          onClick={() => router.back()}
        >
          <ChevronLeft size={20} className="me-2" />
          Back
        </button>
      </div>

      <div className="container">
        <AdBanner />

        {/* Game Info - Static Content (Cached) */}
        <div className="d-flex flex-column align-items-center mb-4 mt-4">
          <h1
            className="fw-bold mb-1"
            style={{
              fontSize: "2rem",
              color: isDark ? "#e7e8e6" : "#222",
              letterSpacing: "0.02em",
              lineHeight: 1.2,
              textAlign: "center",
              maxWidth: "90vw",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={game?.title}
          >
            {game?.title}
          </h1>
        </div>

        <div className="mb-5">
          <GamePlayer
            game={game}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            onClose={closeGame}
          />
        </div>

        {/* Game Stats - Dynamic Content (Fresh) */}
        <div className="mb-4">
          <div className="d-flex justify-content-center">
            <div className="d-flex gap-4 align-items-center">
              {/* Like Button with Optimistic Updates */}
              <button
                className="btn d-flex align-items-center gap-2 rounded-pill px-3 py-2"
                onClick={() => handleLikeToggle(game)}
                disabled={isLiking || statsLoading}
                style={{
                  background: isCurrentlyLiked
                    ? "linear-gradient(45deg, #fff033, #fff033)"
                    : isDark
                    ? "#495057"
                    : "#f8f9fa",
                  border: `1px solid ${
                    isCurrentlyLiked
                      ? "#e91e63"
                      : isDark
                      ? "#6c757d"
                      : "#dee2e6"
                  }`,
                  color: isCurrentlyLiked
                    ? "#000000ff"
                    : isDark
                    ? "#fff"
                    : "#2c3e50",
                  transition: "all 0.3s ease",
                  opacity: isLiking ? 0.7 : 1,
                }}
              >
                {isLiking ? (
                  <div
                    className="spinner-border spinner-border-sm"
                    role="status"
                  />
                ) : (
                  <ThumbsUp
                    size={16}
                    fill={isCurrentlyLiked ? "#fff" : "none"}
                  />
                )}
                <span className="fw-semibold">
                  {formatNumber(gameStats.likes)}
                </span>
              </button>

              {/* Views Count - Always Fresh */}
              <button
                className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                style={{
                  background: isDark ? "#495057" : "#f8f9fa",
                  border: `1px solid ${isDark ? "#6c757d" : "#dee2e6"}`,
                  color: isDark ? "#adb5bd" : "#6c757d",
                }}
              >
                <Eye size={16} />
                <span className="fw-semibold">
                  {statsLoading ? "..." : formatNumber(gameStats.views)}
                </span>
              </button>

              {/* Favorites - Local Storage */}
              <button
                className="d-flex align-items-center gap-2 px-2 py-2 justify-content-center rounded-pill"
                onClick={() => game?.id && toggleFavorite(game.id)}
                aria-pressed={isCurrentFavorited}
                title={
                  isCurrentFavorited
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
                style={{
                  background: isCurrentFavorited
                    ? "linear-gradient(45deg, #ff6b6b, #f06595)"
                    : isDark
                    ? "#495057"
                    : "#f8f9fa",
                  border: `1px solid ${
                    isCurrentFavorited
                      ? "#f06595"
                      : isDark
                      ? "#6c757d"
                      : "#dee2e6"
                  }`,
                  color: isCurrentFavorited
                    ? "#ffffff"
                    : isDark
                    ? "#adb5bd"
                    : "#6c757d",
                  transition: "all 0.25s ease",
                }}
              >
                <Heart
                  size={26}
                  color={
                    isCurrentFavorited
                      ? "#ffffff"
                      : isDark
                      ? "#adb5bd"
                      : "#6c757d"
                  }
                  fill={isCurrentFavorited ? "#ffffff33" : "none"}
                />
              </button>
            </div>
          </div>
        </div>

        <p
          className="px-2 mb-5"
          style={{
            fontSize: "1.1rem",
            color: isDark ? "#b4b8bc" : "#555",
            maxWidth: "100vw",
            textAlign: "center",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={game?.description}
        >
          {game?.description}
        </p>

        {/* More Games Section - Daily Cache */}
        <div className="mb-5">
          <h2
            className="mb-4 text-center"
            style={{ color: isDark ? "#e7e8e6" : "#000000ff" }}
          >
            More Games
          </h2>
          <div className="row m-auto">
            {displayedMoreGames.map((moreGame) => (
              <GameCard
                key={moreGame.id}
                game={moreGame}
                onGameClick={handleGameClick}
                onToggleFavorite={toggleFavorite}
                isFavorited={favorites.includes(moreGame.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePageClient;
