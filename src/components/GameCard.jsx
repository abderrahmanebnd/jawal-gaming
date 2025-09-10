import { Heart, Play } from 'lucide-react';
import "../styles/responsive.css";
import { CONSTANTS } from '../shared/constants';
import { Link } from 'react-router-dom';
const GameCard = ({ game, isFavorited, onToggleFavorite, onGameClick,isLast,lastGameRef }) => {
  // Handle image loading error
  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiBmaWxsPSIjMzMzIiByeD0iMjQiLz4KPHA+CjxjaXJjbGUgY3g9IjEyOCIgY3k9IjEyOCIgcj0iNDAiIGZpbGw9IiM1NTUiLz4KPHA+Cjx0ZXh0IHg9IjEyOCIgeT0iMTM1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+R0FNRTU8L3RleHQ+Cjwvc3ZnPgo=';
  };

  return (
    <div
      className="mb-3 pt-2 col-4 col-md-3 col-xl-2"
      ref={isLast ? lastGameRef : undefined}
      title={game.title || "Click to play"}
    >
      <Link
        to={String(game?.title || "")
          .toLowerCase()
          .replace(/\s+/g, "-")}
      >
        <div
          className="game-card  mx-md-2 mx-1 position-relative overflow-hidden shadow-0"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            // e.currentTarget.style.borderColor = CONSTANTS.COLORS.greenMainColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            // e.currentTarget.style.borderColor = '#444';
          }}
        >
          {/* Game Image - Full Container */}
          <img
            src={game.thumbnail || game.image}
            alt={game.title || "Game thumbnail"}
            className="w-100 h-100"
            style={{
              objectFit: "cover",
              borderRadius: "22px",
              transition: "transform 0.3s ease",
            }}
            onError={handleImageError}
            loading="lazy"
          />

          {/* Play Button Overlay - Shows on Hover */}
          <div
            className="position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "rgba(0,0,0,0.8)",
              opacity: "0",
              transition: "opacity 0.3s ease",
              backdropFilter: "blur(10px)",
              pointerEvents: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            <Play size={24} color="#fff" fill="#fff" />
          </div>

          {/* Favorite Button */}
          <button
            className="btn position-absolute rounded-circle"
            style={{
              top: "20px",
              right: "20px",
              width: "36px",
              height: "36px",
              backgroundColor: isFavorited ? "#dc3545" : "rgba(0,0,0,0.6)",
              border: "none",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isFavorited
                ? "0 4px 12px rgba(220, 53, 69, 0.4)"
                : "0 2px 8px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(game.id);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              if (!isFavorited) {
                e.currentTarget.style.backgroundColor =
                  "rgba(220, 53, 69, 0.8)";
              } else {
                e.currentTarget.style.backgroundColor = "#c82333";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              if (!isFavorited) {
                e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.6)";
              } else {
                e.currentTarget.style.backgroundColor = "#dc3545";
              }
            }}
            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              size={16}
              fill={isFavorited ? "#fff" : "none"}
              color="#fff"
              style={{
                transition: "all 0.2s ease",
                filter: isFavorited
                  ? "drop-shadow(0 1px 2px rgba(0,0,0,0.5))"
                  : "none",
              }}
            />
          </button>

          {/* Gradient Overlay for Better Button Visibility */}
          <div
            className="position-absolute top-0 end-0"
            style={{
              width: "80px",
              height: "80px",
              background:
                "radial-gradient(circle at top right, rgba(0,0,0,0.4) 0%, transparent 70%)",
              borderRadius: "0 22px 0 0",
              pointerEvents: "none",
            }}
          />

          {/* Hover Overlay for Play Button */}
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{
              backgroundColor: "rgba(0,0,0,0.2)",
              opacity: "0",
              transition: "opacity 0.3s ease",
              borderRadius: "22px",
              pointerEvents: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
              // Show play button
              const playButton =
                e.currentTarget.parentElement.querySelector(
                  ".translate-middle"
                );
              if (playButton) {
                playButton.style.opacity = "1";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0";
              // Hide play button
              const playButton =
                e.currentTarget.parentElement.querySelector(
                  ".translate-middle"
                );
              if (playButton) {
                playButton.style.opacity = "0";
              }
            }}
          />
        </div>
      </Link>
    </div>
  );
};

export default GameCard;
