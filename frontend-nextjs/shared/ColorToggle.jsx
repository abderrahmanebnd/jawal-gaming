// shared/ColorToggle.jsx
"use client";

import { useEffect, useState } from "react";

function ColorToggle({ theme, onThemeToggle }) {
  const [windowWidth, setWindowWidth] = useState(1024);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Track window width for responsive styling
    const updateWidth = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", updateWidth);
    updateWidth();

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    onThemeToggle(!theme);
  };

  const buttonStyle = {
    padding: "8px 16px",
    borderRadius: "6px",
    border: `1px solid ${theme ? "#555555" : "#dddddd"}`,
    backgroundColor: theme ? "#444444" : "#e7e8e6",
    color: theme ? "#e7e8e6" : "#333333",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    userSelect: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "80px",
    width: windowWidth <= 768 ? "100%" : "auto",
  };

  const hoverStyle = {
    backgroundColor: theme ? "#555555" : "#f5f5f5",
    borderColor: theme ? "#666666" : "#cccccc",
  };

  return (
    <button
      onClick={toggleTheme}
      style={buttonStyle}
      onMouseEnter={(e) => Object.assign(e.target.style, hoverStyle)}
      onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
      aria-label={`Switch to ${theme ? "light" : "dark"} mode`}
    >
      {theme ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}

export default ColorToggle;
