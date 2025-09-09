// components/BackToTopButton.jsx
import { useEffect, useState } from "react";

const BackToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
      className="btn rounded-circle shadow"
      style={{
        position: "fixed",
        right: "20px",
        bottom: "20px",
        width: "48px",
        height: "48px",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#e2f3e7",
        border: "none",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        transition: "all 0.3s ease", // Smooth hover effect
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#b6e642";
        e.currentTarget.style.transform = "scale(1.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#f8f9fa";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <img src="/ScrollUp-icon.png" alt="Up" style={{ width: "48px", height: "auto",border:"1px solid #5350506e",borderRadius:"100%" }} />
    </button>
  );
};

export default BackToTopButton;
