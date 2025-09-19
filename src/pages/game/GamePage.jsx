import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, ThumbsUp, Eye, Heart } from "lucide-react";
import AdBanner from "../../components/AdBanner";
import GamePlayer from "../../components/GamePlayer";
import GameCard from "../../components/GameCard";
import useApi from "../../hooks/useApi";
import { apiEndPoints } from "../../api/api";
import { StorageManager } from "../../shared/storage";

const isBrowser = typeof window !== "undefined";

const GamePage = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [likedGames, setLikedGames] = useState([]);
  const [game, setGame] = useState(null);
  const [moreGames, setMoreGames] = useState([]);
  const [gameStats, setGameStats] = useState({
    views: 0,
    likes: 0,
    isLiked: false,
  });
  const [isLiking, setIsLiking] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  // API hooks
  const { get: getGames, data: gameResponse, source: gameSource } = useApi();
  const {
    get: getGameById,
    data: GameByIdResponse,
    source: GameByIdSource,
  } = useApi();
  const { get: getGameUpdate, data: GameUpdatedResponse } = useApi();
  const { post: updateViews, data: viewsResponse } = useApi();
  const { post: toggleLike, data: likeResponse } = useApi();

  // Only access localStorage on the client
  useEffect(() => {
    if (!isBrowser) return;

    try {
      const savedFavorites = StorageManager.getFavorites() || [];
      const savedLikedGames = JSON.parse(
        localStorage.getItem("likedGames") || "[]"
      );

      setFavorites(Array.isArray(savedFavorites) ? savedFavorites : []);
      setLikedGames(Array.isArray(savedLikedGames) ? savedLikedGames : []);
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
  }, [id, getGameById]);

  // Handle game data response
  useEffect(() => {
    if (GameByIdResponse?.status === 200 && GameByIdResponse.data?.data) {
      const gameData = GameByIdResponse.data.data;
      setGame(gameData);

      setGameStats({
        views: gameData.viewed || 0,
        likes: gameData.liked || 0,
        isLiked: isBrowser ? likedGames.includes(gameData.id) : false,
      });
    }
  }, [GameByIdResponse, likedGames]);

  // Update views when game loads
  useEffect(() => {
    if (!isBrowser) return;
    if (game?.id && apiEndPoints.updateViews) {
      const url = apiEndPoints.updateViews;
      const body = { gameId: game.id };
      const headers = { "Content-Type": "application/json" };
      updateViews(url, body, headers, true);
    }
  }, [game?.id, updateViews]);

  // Fetch more games
  useEffect(() => {
    if (!isBrowser) return;
    if (apiEndPoints.viewGame) {
      const url = apiEndPoints.viewGame;
      const param = { pageNo: 1, pageSize: 19 };
      const headers = { "Content-Type": "application/json" };
      getGames(url, param, headers, true);
    }
  }, [getGames]);

  // Handle more games response
  useEffect(() => {
    if (gameResponse?.status === 200 && gameResponse.data?.data) {
      setMoreGames(gameResponse.data.data);
    }
  }, [gameResponse]);

  // Refresh game data after like/view updates
  useEffect(() => {
    if (!isBrowser) return;
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
      GameByIdSource?.cancel("Component unmounted");
      gameSource?.cancel("Component unmounted");
    };
  }, [GameByIdSource, gameSource]);

  // Utility functions
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
  const closeGame = () => setIsFullscreen(false);

  const formatNumber = (num) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num?.toString() || "0";
  };

  const handleToggleFavorite = useCallback((gameId) => {
    if (!gameId || !isBrowser) return;
    setFavorites((prev) => {
      const isFav = prev.includes(gameId);
      const updated = isFav
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId];
      StorageManager.setFavorites(updated);
      return updated;
    });
  }, []);

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

     const slug = gameToNavigate.title.toLowerCase().replace(/\s+/g, "-");
     navigate(`/${slug}`);
   },
   [navigate]
 );


  
const displayedMoreGames = useMemo(() => {
  if (!moreGames) return [];
  return moreGames
    .filter((g) => g.id !== game?.id)
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, 18);
}, [moreGames, game?.id]);

  const handleLikeToggle = async (gameToLike) => {
    if (!gameToLike || !isBrowser || isLiking) return;

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

      const updatedLikedGames = newIsLiked
        ? [...likedGames, gameToLike.id]
        : likedGames.filter((id) => id !== gameToLike.id);

      setLikedGames(updatedLikedGames);
      setGameStats((prev) => ({ ...prev, isLiked: newIsLiked }));

      localStorage.setItem("likedGames", JSON.stringify(updatedLikedGames));
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const isLightTheme =
    typeof window !== "undefined"
      ? document.body.getAttribute("data-theme") === "light"
      : true; // default to light theme on SSR

  const isDark = isBrowser ? !isLightTheme : false;
  const isCurrentFavorited = !!(game?.id && favorites.includes(game.id));

  return (
    <div>
      {game && (
        <Helmet>
          <title>{`${game.title} - Jawal Games`}</title>
          <meta name="description" content={game.description} />
          <link rel="canonical" href={window.location.href} />

          <meta property="og:title" content={`${game.title} - Jawal Games`} />
          <meta property="og:description" content={game.description} />
          <meta property="og:image" content={game.thumbnail} />
          <meta property="og:url" content={window.location.href} />
          <meta property="og:type" content="game" />

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
          className="flex rounded-pill mb-3 bg-red-200"
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
        <div className="mb-4">
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

        <p
          className="mb-0 px-2 mb-5"
          style={{
            fontSize: "1.1rem",
            color: isDark ? "#b4b8bc" : "#555",
            maxWidth: "100vw",
            textAlign: "center",
            overflow: "hidden",
            textOverflow: "ellipsis",
            // whiteSpace: "nowrap",
          }}
          title={game?.description}
        >
          {game?.description}
        </p>
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
            {displayedMoreGames
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
