"use client";

import { useCallback, useEffect, useState, useRef } from "react";

//TODO:remove the placeholder when no ads
const AdBanner = () => {
  const [showFallback, setShowFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adInitialized, setAdInitialized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const adRef = useRef(null);
  const timeoutRef = useRef(null);

  // SSR safety - this is the main Next.js requirement
  useEffect(() => {
    setMounted(true);
  }, []);

  // Exponential backoff retry function
  const retryWithBackoff = useCallback(() => {
    if (retryCount >= 3) return; // Retry limit: max 3 attempts

    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    // Exponential backoff: 2s, 4s, 8s
    const delay = Math.pow(2, retryCount + 1) * 1000;

    setTimeout(() => {
      setShowFallback(false);
      setIsLoading(true);
      setAdInitialized(false);
      setIsRetrying(false);
    }, delay);
  }, [retryCount]);

  useEffect(() => {
    const loadAd = async () => {
      try {
        // Prevent multiple initializations
        if (adInitialized) {
          setIsLoading(false);
          return;
        }

        // Set timeout for fallback
        timeoutRef.current = setTimeout(() => {
          setShowFallback(true);
          setIsLoading(false);
        }, 3000);

        // Wait for AdSense script to load
        const checkAdSense = () => {
          if (
            typeof window !== "undefined" &&
            window.adsbygoogle &&
            adRef.current
          ) {
            // Check if this ad element already has ads
            const existingAd = adRef.current.getAttribute(
              "data-adsbygoogle-status"
            );

            if (existingAd && existingAd !== "error") {
              // Ad already initialized
              setAdInitialized(true);
              setIsLoading(false);
              setShowFallback(false);
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              return;
            }

            try {
              // Initialize the ad
              (window.adsbygoogle = window.adsbygoogle || []).push({});
              setAdInitialized(true);

              // Check if ad rendered successfully
              setTimeout(() => {
                if (adRef.current) {
                  const adHeight = adRef.current.offsetHeight;
                  const adWidth = adRef.current.offsetWidth;
                  const adStatus = adRef.current.getAttribute(
                    "data-adsbygoogle-status"
                  );

                  if (adHeight <= 10 || adWidth <= 10 || adStatus === "error") {
                    setShowFallback(true);
                  } else {
                    setShowFallback(false);
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                  }
                }
                setIsLoading(false);
              }, 1000);
            } catch (error) {
              console.error("AdSense push error:", error);
              setShowFallback(true);
              setIsLoading(false);
            }
          } else {
            // Script not ready, check again
            setTimeout(checkAdSense, 100);
          }
        };

        checkAdSense();
      } catch (error) {
        console.error("AdSense error:", error);
        setShowFallback(true);
        setIsLoading(false);
      }
    };

    // Only load if component is mounted and not currently retrying
    if (mounted && !isRetrying) {
      loadAd();
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [mounted, adInitialized, isRetrying]);

  // Handle keyboard navigation for retry button
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        retryWithBackoff();
      }
    },
    [retryWithBackoff]
  );

  // Don't render anything on server-side (prevents hydration issues)
  if (!mounted) {
    return (
      <div
        className="mb-4 mt"
        role="complementary"
        aria-label="Advertisement loading"
      >
        <div
          className="text-center p-4 rounded-3"
          style={{ backgroundColor: "#444", border: "2px solid #555" }}
        >
          <div className="d-flex align-items-center justify-content-center">
            <div
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-label="Loading advertisement"
              style={{ color: "#999" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mb-0" style={{ color: "#999" }}>
              Loading advertisement...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state (with accessibility)
  if (isLoading) {
    return (
      <div
        className="mb-4 mt"
        role="complementary"
        aria-label="Advertisement loading"
      >
        <div
          className="text-center p-4 rounded-3"
          style={{ backgroundColor: "#444", border: "2px solid #555" }}
        >
          <div className="d-flex align-items-center justify-content-center">
            <div
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-label={
                isRetrying
                  ? "Retrying advertisement load"
                  : "Loading advertisement"
              }
              style={{ color: "#999" }}
            >
              <span className="visually-hidden">
                {isRetrying ? "Retrying..." : "Loading..."}
              </span>
            </div>
            <p className="mb-0" style={{ color: "#999" }}>
              {isRetrying
                ? `Retrying advertisement... (${retryCount}/3)`
                : "Loading advertisement..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show fallback if ads failed to load (enhanced with retry limits & accessibility)
  if (showFallback) {
    return (
      <div
        className="mb-4"
        role="complementary"
        aria-label="Advertisement placeholder"
      >
        <div
          className="text-center p-4 rounded-3 position-relative overflow-hidden"
          style={{ backgroundColor: "#444", border: "2px dashed #666" }}
        >
          {/* Background Pattern */}
          <div
            className="position-absolute top-0 start-0 w-100 h-100 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23999' fill-opacity='0.1'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
            }}
            aria-hidden="true"
          ></div>

          {/* Content */}
          <div className="position-relative">
            <div className="mb-2" aria-hidden="true">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                style={{ color: "#666" }}
                aria-hidden="true"
                focusable="false"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <path
                  d="M8 12h8M12 8v8"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <p
              className="mb-1 fw-semibold"
              style={{ color: "#999" }}
              role="img"
              aria-label="Advertisement placeholder area"
            >
              Advertisement Space
            </p>

            <small style={{ color: "#666" }}>
              728x90 or responsive ad unit
            </small>

            {/* Enhanced retry button with limits and accessibility */}
            <div className="mt-3">
              {retryCount < 3 ? (
                <button
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                  onClick={retryWithBackoff}
                  onKeyDown={handleKeyDown}
                  disabled={isRetrying}
                  aria-label={`Retry loading advertisement. Attempt ${
                    retryCount + 1
                  } of 3. ${isRetrying ? "Currently retrying..." : ""}`}
                  style={{
                    borderColor: "#666",
                    color: "#999",
                    fontSize: "0.75rem",
                    opacity: isRetrying ? 0.6 : 1,
                    cursor: isRetrying ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!isRetrying) {
                      e.target.style.borderColor = "#999";
                      e.target.style.color = "#ccc";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isRetrying) {
                      e.target.style.borderColor = "#666";
                      e.target.style.color = "#999";
                    }
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="me-1"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z" />
                  </svg>
                  {isRetrying ? "Retrying..." : `Retry (${retryCount}/3)`}
                </button>
              ) : (
                <p
                  className="mb-0 text-muted"
                  style={{ fontSize: "0.75rem", color: "#666" }}
                  role="status"
                  aria-live="polite"
                >
                  Maximum retry attempts reached. Please refresh the page to try
                  again.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4" role="complementary" aria-label="Advertisement">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-6178922300827357"
        data-ad-slot="3734571071"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;
