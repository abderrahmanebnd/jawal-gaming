import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ThumbsUp, Eye, Heart } from "lucide-react";
import AdBanner from "../../components/AdBanner";
import GamePlayer from "../../components/GamePlayer";
import GameCard from "../../components/GameCard";
import useApi from "../../hooks/useApi";
import { apiEndPoints } from "../../api/api";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { StorageManager } from "../../shared/storage";

const GamePage = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [likedGames, setLikedGames] = useState([]);
  const [game, setGame] = useState(null);
  const [moreGames, setMoreGames] = useState(null);
  const [gameStats, setGameStats] = useState({
    views: 0,
    likes: 0,
    isLiked: false,
  });
  const [isLiking, setIsLiking] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  // API hooks
  const {
    get: getGames,
    data: gameResponse,
    source: gameSource,
    error: gamesError,
    loading,
  } = useApi();

  const {
    get: getGameById,
    data: GameByIdResponse,
    error: GameByIdError,
    source: GameByIdSource,
  } = useApi();

  const { get: getGameUpdate, data: GameUpdatedResponse } = useApi();
  const { post: updateViews, data: viewsResponse } = useApi();
  const { post: toggleLike, data: likeResponse } = useApi();

  // Initialize localStorage data
  useEffect(() => {
    try {
      const savedFavorites = StorageManager.getFavorites();

      const savedLikedGames = JSON.parse(
        localStorage.getItem("likedGames") || "[]"
      );
      setFavorites(Array.isArray(savedFavorites) ? savedFavorites : []);
      setLikedGames(savedLikedGames);
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      setFavorites([]);
      setLikedGames([]);
    }
  }, []);

  // Fetch game by ID
  useEffect(() => {
    if (id && apiEndPoints.byIdGame) {
      const url = apiEndPoints.byIdGame;
      const param = { id };
      const headers = { "Content-Type": "application/json" };
      getGameById(url, param, headers, true);
    }
  }, [id, getGameById]); // Fixed dependencies

  // Handle game data response
  useEffect(() => {
    if (GameByIdResponse?.status === 200 && GameByIdResponse.data?.data) {
      const gameData = GameByIdResponse.data.data;
      setGame(gameData);

      setGameStats({
        views: gameData.viewed || 0,
        likes: gameData.liked || 0,
        isLiked: likedGames.includes(gameData.id), // Set based on localStorage
      });
    }
  }, [GameByIdResponse, likedGames]);

  // Update views when game loads
  useEffect(() => {
    if (game?.id && apiEndPoints.updateViews) {
      const url = apiEndPoints.updateViews;
      const body = { gameId: game.id };
      const headers = { "Content-Type": "application/json" };
      updateViews(url, body, headers, true);
    }
  }, [game?.id, updateViews]); // Fixed dependencies

  // Fetch more games
  useEffect(() => {
    if (apiEndPoints.viewGame) {
      const url = apiEndPoints.viewGame;
      const param = {
        pageNo: 1,
        pageSize: 40,
      };
      const headers = { "Content-Type": "application/json" };
      getGames(url, param, headers, true);
    }
  }, [getGames]); // Fixed dependencies

  // Handle more games response
  useEffect(() => {
    if (gameResponse?.status === 200 && gameResponse.data?.data) {
      setMoreGames(gameResponse.data.data);
    }
  }, [gameResponse]);

  // Refresh game data after like/view updates
  useEffect(() => {
    if (
      (likeResponse?.status === 200 || viewsResponse?.status === 200) &&
      id &&
      apiEndPoints.byIdGame
    ) {
      const url = apiEndPoints.byIdGame;
      const param = { id };
      const headers = { "Content-Type": "application/json" };
      getGameUpdate(url, param, headers, true);
    }
  }, [likeResponse, viewsResponse, id, getGameUpdate]);

  // Update game stats from refreshed data
  useEffect(() => {
    if (GameUpdatedResponse?.status === 200 && GameUpdatedResponse.data?.data) {
      const updatedData = GameUpdatedResponse.data.data;
      setGameStats((prev) => ({
        ...prev,
        views: updatedData.viewed || 0,
        likes: updatedData.liked || 0,
      }));
    }
  }, [GameUpdatedResponse]);

  // Cleanup function for API sources
  useEffect(() => {
    return () => {
      if (GameByIdSource) {
        GameByIdSource.cancel("Component unmounted");
      }
      if (gameSource) {
        gameSource.cancel("Component unmounted");
      }
    };
  }, [GameByIdSource, gameSource]);

  // Utility functions
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const closeGame = () => {
    setIsFullscreen(false);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num?.toString() || "0";
  };

  // Handle favorite toggle with proper localStorage sync
  const handleToggleFavorite = useCallback((gameId) => {
    if (!gameId) return;
    setFavorites((prev) => {
      const isFav = prev.includes(gameId);
      const updated = isFav
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId];
      // persist
      StorageManager.setFavorites(updated);
      return updated;
    });
  }, []);

  // derived flag for current game
  const isCurrentFavorited = !!(game?.id && favorites.includes(game.id));

  const handleGameClick = useCallback(
    (gameToNavigate) => {
      if (!gameToNavigate) return;
      const slug = gameToNavigate.title.toLowerCase().replace(/\s+/g, "-");
      navigate(`/${slug}`); // Fixed: use navigate instead of window.location.href
    },
    [navigate]
  );

  const handleLikeToggle = async (gameToLike) => {
    if (!gameToLike || isLiking) return;

    const isCurrentlyLiked = likedGames.includes(gameToLike.id);
    const newIsLiked = !isCurrentlyLiked;

    setIsLiking(true);

    try {
      const url = apiEndPoints.toggleLike;
      const headers = { "Content-Type": "application/json" };
      const body = {
        gameId: gameToLike.id,
        action: newIsLiked ? "like" : "unlike",
      };

      await toggleLike(url, body, headers, true);

      // Update local state and localStorage on success
      const updatedLikedGames = newIsLiked
        ? [...likedGames, gameToLike.id]
        : likedGames.filter((id) => id !== gameToLike.id);

      setLikedGames(updatedLikedGames);
      setGameStats((prev) => ({
        ...prev,
        isLiked: newIsLiked,
      }));

      try {
        localStorage.setItem("likedGames", JSON.stringify(updatedLikedGames));
      } catch (error) {
        console.error("Error saving liked games to localStorage:", error);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const isDark = document.body.getAttribute("data-theme") !== "light";

  return (
    <div>
      {game && (
        <Helmet>
          <title>{`${game.title} - Jawal Games`}</title>
          <meta name="description" content={game.description} />
          <link rel="canonical" href={window.location.href} />

          {/* Open Graph (OG) meta tags for social media previews */}
          <meta property="og:title" content={`${game.title} - Jawal Games`} />
          <meta property="og:description" content={game.description} />
          <meta property="og:image" content={game.thumbnail} />
          <meta property="og:url" content={window.location.href} />
          <meta property="og:type" content="game" />

          {/* Twitter Card meta tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${game.title} - Jawal Games`} />
          <meta name="twitter:description" content={game.description} />
          <meta name="twitter:image" content={game.thumbnail} />
        </Helmet>
      )}

      {/* Header with back button */}
      <div className="container py-3">
        <button
          style={{
            color: isDark ? "" : "#000000ff",
          }}
          className="btn btn-outline-light rounded-pill mb-3"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={20} className="me-2" />
          Back
        </button>
      </div>

      <div className="container">
        {/* AdSense Banner */}
        <AdBanner />

        {/* Game Info - Compact Design */}
        <div className="d-flex flex-column align-items-center mb-4 mt-4">
          <h2
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
          </h2>
          <p
            className="mb-0 text-secondary"
            style={{
              fontSize: "1rem",
              color: isDark ? "#adb5bd" : "#555",
              maxWidth: "80vw",
              textAlign: "center",
              overflow: "hidden",
              textOverflow: "ellipsis",
              // whiteSpace: "nowrap",
            }}
            title={game?.description}
          >
            {game?.description}
          </p>
        </div>
        <div className="mb-5">
          <GamePlayer
            game={game}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            onClose={closeGame}
          />
        </div>

        {/* Game Stats - Compact Version */}
        <div className="mb-5">
          <div className="d-flex justify-content-center">
            <div className="d-flex gap-4 align-items-center">
              {/* Like Button and Count */}
              <button
                className="btn d-flex align-items-center gap-2 rounded-pill px-3 py-2"
                onClick={() => handleLikeToggle(game)}
                disabled={isLiking}
                style={{
                  background: gameStats.isLiked
                    ? "linear-gradient(45deg, #fff033, #fff033)"
                    : isDark
                    ? "#495057"
                    : "#f8f9fa",
                  border: `1px solid ${
                    gameStats.isLiked
                      ? "#e91e63"
                      : isDark
                      ? "#6c757d"
                      : "#dee2e6"
                  }`,
                  color: gameStats.isLiked
                    ? "#000000ff"
                    : isDark
                    ? "#fff"
                    : "#2c3e50",
                  transition: "all 0.3s ease",
                  opacity: isLiking ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!gameStats.isLiked && !isLiking) {
                    e.currentTarget.style.background = "rgba(233, 30, 99, 0.1)";
                    e.currentTarget.style.borderColor = "#fff033";
                    e.currentTarget.style.color = "#030303ff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!gameStats.isLiked && !isLiking) {
                    e.currentTarget.style.background = isDark
                      ? "#495057"
                      : "#f8f9fa";
                    e.currentTarget.style.borderColor = isDark
                      ? "#6c757d"
                      : "#dee2e6";
                    e.currentTarget.style.color = isDark ? "#fff" : "#2c3e50";
                  }
                }}
              >
                {isLiking ? (
                  <div
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-label="Loading"
                  ></div>
                ) : (
                  <ThumbsUp
                    size={16}
                    fill={gameStats.isLiked ? "#fff" : "none"}
                  />
                )}
                <span className="fw-semibold">
                  {formatNumber(gameStats.likes)}
                </span>
              </button>

              {/* Views Count */}
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
                  {formatNumber(gameStats.views)}
                </span>
              </button>

              {/* add to favorites */}
              <button
                className="d-flex align-items-center gap-2 px-2 py-2 justify-content-center rounded-pill"
                onClick={() => game?.id && handleToggleFavorite(game.id)}
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

        {/* More Games Section */}
        <div className="mb-5 ">
          <h3
            className="mb-4 text-center"
            style={{
              color: isDark ? "#e7e8e6" : "#000000ff",

            }}
          >
            More Games
          </h3>
          <div className="row m-auto">
            {moreGames
              ?.slice()
              .sort(() => Math.random() - 0.5)
              .slice(0, 12)
              .map((moreGame) => (
                <GameCard
                  key={moreGame.id}
                  game={moreGame}
                  onGameClick={handleGameClick}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorited={favorites.includes(moreGame.id)}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
