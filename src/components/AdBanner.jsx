import { useEffect, useState, useRef } from "react";

const AdBanner = () => {
  const [showFallback, setShowFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const adRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const loadAd = async () => {
      try {
        // Set a timeout to show fallback if ad doesn't load within 3 seconds
        timeoutRef.current = setTimeout(() => {
          setShowFallback(true);
          setIsLoading(false);
        }, 3000);

        // Check if AdSense script is loaded
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          // Push the ad
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          
          // Check if ad actually rendered after a short delay
          setTimeout(() => {
            if (adRef.current) {
              const adHeight = adRef.current.offsetHeight;
              const adWidth = adRef.current.offsetWidth;
              
              // If ad has no dimensions or very small dimensions, show fallback
              if (adHeight <= 10 || adWidth <= 10) {
                setShowFallback(true);
              } else {
                // Ad loaded successfully
                setShowFallback(false);
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                }
              }
            }
            setIsLoading(false);
          }, 1000);
        } else {
          // AdSense script not loaded
          setShowFallback(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("AdSense error:", error);
        setShowFallback(true);
        setIsLoading(false);
      }
    };

    loadAd();

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="mb-4 mt">
        <div className="text-center p-4 rounded-3" 
             style={{ backgroundColor: '#444', border: '2px solid #555' }}>
          <div className="d-flex align-items-center justify-content-center">
            <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: '#999' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mb-0" style={{ color: '#999' }}>Loading advertisement...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show fallback if ads failed to load
  if (showFallback) {
    return (
      <div className="mb-4">
        <div className="text-center p-4 rounded-3 position-relative overflow-hidden" 
             style={{ backgroundColor: '#444', border: '2px dashed #666' }}>
          
          {/* Background Pattern */}
          <div 
            className="position-absolute top-0 start-0 w-100 h-100 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23999' fill-opacity='0.1'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}
          ></div>

          {/* Content */}
          <div className="position-relative">
            <div className="mb-2">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ color: '#666' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5"/>
                <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <p className="mb-1 fw-semibold" style={{ color: '#999' }}>Advertisement Space</p>
            <small style={{ color: '#666' }}>728x90 or responsive ad unit</small>
            
            {/* Optional retry button */}
            <div className="mt-3">
              <button 
                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                onClick={() => window.location.reload()}
                style={{
                  borderColor: '#666',
                  color: '#999',
                  fontSize: '0.75rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#999';
                  e.target.style.color = '#ccc';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#666';
                  e.target.style.color = '#999';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="me-1">
                  <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show actual AdSense ad
  return (
    <div className="mb-4">
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