"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { Heart, Play, ThumbsUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import "@/styles/responsive.css";

// Memoized GameCard for performance
const GameCard = memo(
  ({
    game,
    isFavorited,
    onToggleFavorite,
    onGameClick,
    isLast,
    lastGameRef,
    inTopGames,
  }) => {
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Memoized image src with fallback
    const imageSrc = useMemo(() => {
      if (imageError) {
        return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiBmaWxsPSIjMzMzIiByeD0iMjQiLz4KPHA+CjxjaXJjbGUgY3g9IjEyOCIgY3k9IjEyOCIgcj0iNDAiIGZpbGw9IiM1NTUiLz4KPHA+Cjx0ZXh0IHg9IjEyOCIgeT0iMTM1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+R0FNRTU8L3RleHQ+Cjwvc3ZnPgo=";
      }
      return game?.thumbnail || game?.image || "/images/game-placeholder.jpg";
    }, [game?.thumbnail, game?.image, imageError]);

    // Memoized game slug for routing
    const gameSlug = useMemo(() => {
      if (!game?.title) return "";
      return game.slug || game.title.toLowerCase().replace(/\s+/g, "-");
    }, [game?.title, game?.slug]);

    // Handle image load error
    const handleImageError = useCallback(() => {
      setImageError(true);
    }, []);

    // Handle favorite toggle with event propagation stop
    const handleFavoriteClick = useCallback(
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onToggleFavorite && game?.id) {
          onToggleFavorite(game.id);
        }
      },
      [onToggleFavorite, game?.id]
    );

    // Handle card click
    const handleCardClick = useCallback(
      (e) => {
        e.preventDefault();
        if (onGameClick && game) {
          onGameClick(game);
        }
      },
      [onGameClick, game]
    );

    // Handle hover states
    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    // Memoized styles for performance
    const cardStyles = useMemo(
      () => ({
        transform: isHovered ? "scale(1.05)" : "scale(1)",
        transition: "transform 0.3s ease",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        borderRadius: "22px",
        aspectRatio: "1/1",
        backgroundColor: "#333",
      }),
      [isHovered]
    );

    // Early return for invalid game data
    if (!game?.id) {
      return null;
    }

    return (
      <div
        className="mb-3 pt-2 col-4 col-md-3 col-xl-2"
        ref={isLast ? lastGameRef : undefined}
      >
        {/* Next.js Link for proper navigation */}
        <Link
          href={`/${gameSlug}`}
          onClick={handleCardClick}
          className="text-decoration-none"
          prefetch={false} // Don't prefetch game pages (heavy content)
          aria-label={`Play ${game.title}`}
        >
          <article
            className="game-card mx-md-2 mx-1 position-relative overflow-hidden shadow-0"
            style={cardStyles}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardClick(e);
              }
            }}
          >
            {/* Optimized Next.js Image */}
            <div className="position-relative w-100 h-100">
              <Image
                src={imageSrc}
                alt={game.title || "Game thumbnail"}
                fill
                sizes="(max-width: 576px) 33vw, (max-width: 768px) 25vw, (max-width: 1200px) 16.6vw, 12.5vw"
                style={{
                  objectFit: "cover",
                  borderRadius: "22px",
                }}
                onError={handleImageError}
                priority={false} // Let Next.js handle loading priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Wuovt2lyyYzy0jjjlbJPhVUEb8+Hz8q/xzknI5v4="
              />
            </div>

            {/* Play Button Overlay */}
            <div
              className="position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: "rgba(0,0,0,0.8)",
                opacity: isHovered ? "1" : "0",
                transition: "opacity 0.3s ease",
                backdropFilter: "blur(10px)",
                pointerEvents: "none",
                zIndex: 5,
              }}
              aria-hidden="true"
            >
              <Play size={24} color="#fff" fill="#fff" />
            </div>

            {/* Top Games Like Badge */}
            {inTopGames && typeof game.liked === "number" && (
              <div
                className="rounded-pill likes-badge"
                title={`${game.liked} likes`}
                aria-label={`${game.liked} likes`}
              >
                <ThumbsUp className="thumbsIcon" fill="#fff" />
                <span>{game.liked || 0}</span>
              </div>
            )}

            {/* Favorite Button */}
            <button
              type="button"
              className="rounded-circle favorite-btn"
              // style={favoriteButtonStyles}
              style={{
                backgroundColor: isFavorited ? "#dc3545" : "rgba(0,0,0,0.6)",
                boxShadow: isFavorited
                  ? "0 4px 12px rgba(220, 53, 69, 0.4)"
                  : "0 2px 8px rgba(0,0,0,0.3)",
              }}
              onClick={handleFavoriteClick}
              title={isFavorited ? "Remove from favorites" : "Add to favorites"}
              aria-label={
                isFavorited ? "Remove from favorites" : "Add to favorites"
              }
              aria-pressed={isFavorited}
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
            >
              <Heart
                size={14}
                fill={isFavorited ? "#fff" : "none"}
                color="#fff"
                style={{
                  transition: "all 0.2s ease",
                  filter: isFavorited
                    ? "drop-shadow(0 1px 2px rgba(0,0,0,0.5))"
                    : "none",
                }}
                aria-hidden="true"
              />
            </button>

            {/* Hover Overlay */}
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                backgroundColor: "rgba(0,0,0,0.2)",
                opacity: isHovered ? "1" : "0",
                transition: "opacity 0.3s ease",
                borderRadius: "22px",
                pointerEvents: "none",
                zIndex: 1,
              }}
              aria-hidden="true"
            />

            {/* Gradient Overlay for Button Visibility */}
            <div
              className="position-absolute top-0 end-0"
              style={{
                width: "80px",
                height: "80px",
                background:
                  "radial-gradient(circle at top right, rgba(0,0,0,0.4) 0%, transparent 70%)",
                borderRadius: "0 22px 0 0",
                pointerEvents: "none",
                zIndex: 2,
              }}
              aria-hidden="true"
            />
          </article>
        </Link>
      </div>
    );
  }
);

// Set display name for debugging
GameCard.displayName = "GameCard";

export default GameCard;
