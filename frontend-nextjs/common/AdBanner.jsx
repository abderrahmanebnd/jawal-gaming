"use client";

import { useCallback, useEffect, useState, useRef } from "react";

const AdBanner = () => {
  const [adState, setAdState] = useState("loading"); // loading, success, failed, blocked
  const [adInitialized, setAdInitialized] = useState(false);
  const [mounted, setMounted] = useState(false);

  const adRef = useRef(null);
  const timeoutRef = useRef(null);

  // SSR safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for ad blockers
  const checkAdBlocker = useCallback(() => {
    try {
      const testAd = document.createElement("div");
      testAd.innerHTML = "&nbsp;";
      testAd.className = "adsbox adsbygoogle";
      testAd.style.position = "absolute";
      testAd.style.left = "-10000px";
      testAd.style.top = "-10000px";

      document.body.appendChild(testAd);

      const isBlocked =
        testAd.offsetHeight === 0 ||
        window.getComputedStyle(testAd).display === "none";

      document.body.removeChild(testAd);
      return isBlocked;
    } catch (error) {
      console.error("Ad blocker check failed:", error);
      return false;
    }
  }, []);

  // Load ad with proper detection
  useEffect(() => {
    const loadAd = async () => {
      if (!mounted || adInitialized) return;

      try {
        // Check for ad blocker first
        if (checkAdBlocker()) {
          setAdState("blocked");
          return;
        }

        // Set timeout for ad loading
        timeoutRef.current = setTimeout(() => {
          if (adState === "loading") {
            setAdState("failed");
          }
        }, 5000); // 5 second timeout

        // Wait for AdSense script
        const waitForAdSense = () => {
          if (
            typeof window !== "undefined" &&
            window.adsbygoogle &&
            adRef.current
          ) {
            try {
              // Push the ad
              (window.adsbygoogle = window.adsbygoogle || []).push({});
              setAdInitialized(true);

              // Check if ad actually loaded
              setTimeout(() => {
                if (adRef.current) {
                  const adStatus = adRef.current.getAttribute(
                    "data-adsbygoogle-status"
                  );
                  const adHeight = adRef.current.offsetHeight;
                  const adWidth = adRef.current.offsetWidth;

                  // Successful ad load conditions
                  if (adStatus === "done" && adHeight > 10 && adWidth > 10) {
                    setAdState("success");
                    if (timeoutRef.current) {
                      clearTimeout(timeoutRef.current);
                    }
                  } else if (
                    adStatus === "error" ||
                    adHeight <= 10 ||
                    adWidth <= 10
                  ) {
                    setAdState("failed");
                  }
                  // If status is still undefined, wait a bit more
                }
              }, 2000);
            } catch (error) {
              console.error("AdSense error:", error);
              setAdState("failed");
            }
          } else {
            // AdSense not ready, try again
            setTimeout(waitForAdSense, 100);
          }
        };

        waitForAdSense();
      } catch (error) {
        console.error("Ad loading error:", error);
        setAdState("failed");
      }
    };

    loadAd();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [mounted, adInitialized, checkAdBlocker, adState]);

  // Don't render anything during SSR
  if (!mounted) {
    return null;
  }

  // Don't render anything if ad failed, blocked, or loading
  if (adState === "failed" || adState === "blocked" || adState === "loading") {
    return null;
  }

  // Only render if ad successfully loaded
  if (adState === "success") {
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
  }

  // Fallback
  return null;
};

export default AdBanner;
