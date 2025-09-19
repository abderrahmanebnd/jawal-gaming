"use client";

import { useEffect, useCallback } from "react";
import { X, Maximize2, Minimize2 } from "lucide-react";

const GamePlayer = ({ game, isFullscreen, onToggleFullscreen, onClose }) => {


  // Memoized keyboard handler for better performance
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (isFullscreen) {
          onToggleFullscreen();
        } else {
          onClose();
        }
      }
    },
    [isFullscreen, onToggleFullscreen, onClose]
  );

  // Keyboard event listener with proper cleanup
  useEffect(() => {

    document.addEventListener("keydown", handleKeyDown);

    // Prevent body scroll when fullscreen
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = ""; // Always cleanup on unmount
    };
  }, [handleKeyDown, isFullscreen]);
  
  // Early return if no game data
  if (!game?.url) {
    return (
      <div
        className="position-relative d-flex align-items-center justify-content-center"
        style={{
          backgroundColor: "#222",
          borderRadius: "12px",
          minHeight: "600px",
          border: "2px dashed #666",
        }}
      >
        <div className="text-center">
          <div className="mb-3">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: "#666" }}
            >
              <rect
                x="2"
                y="3"
                width="20"
                height="14"
                rx="2"
                ry="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="8"
                y1="21"
                x2="16"
                y2="21"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="12"
                y1="17"
                x2="12"
                y2="21"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <p className="text-muted mb-0">No game available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`game-player ${
        isFullscreen
          ? "position-fixed top-0 start-0 w-100 h-100"
          : "position-relative"
      }`}
      style={{
        backgroundColor: "#000",
        zIndex: isFullscreen ? 9999 : "auto",
        borderRadius: isFullscreen ? "0" : "12px",
      }}
      role="application"
      aria-label={`Game player: ${game?.title || "Game"}`}
    >
      {/* Control buttons */}
      <div className="position-absolute top-0 end-0 m-3" style={{ zIndex: 10 }}>
        <div className="d-flex gap-2">
          <button
            className="btn btn-dark btn-sm rounded-circle p-2"
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen (ESC)" : "Enter Fullscreen"}
            aria-label={
              isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"
            }
            type="button"
          >
            {isFullscreen ? (
              <Minimize2 size={16} aria-hidden="true" />
            ) : (
              <Maximize2 size={16} aria-hidden="true" />
            )}
          </button>

          {isFullscreen && (
            <button
              className="btn btn-danger btn-sm rounded-circle p-2"
              onClick={onClose}
              title="Close Game (ESC)"
              aria-label="Close game and exit fullscreen"
              type="button"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Game iframe */}
      <iframe
        src={game.url}
        className="w-100 h-100 border-0"
        style={{
          minHeight: isFullscreen ? "100vh" : "400px",
          borderRadius: isFullscreen ? "0" : "12px",
        }}
        title={`Play ${game.title}`}
        allow="fullscreen; autoplay; encrypted-media; gyroscope; accelerometer"
        loading="lazy"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
    </div>
  );
};

export default GamePlayer;
