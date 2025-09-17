// shared/ColorToggle.jsx
"use client";

import { useState, useEffect } from "react";

function ColorToggle({ theme, onThemeToggle }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="btn btn-outline-secondary btn-sm"
        disabled
        style={{
          minWidth: "80px",
          padding: "0.25rem 0.5rem",
          fontSize: "0.875rem",
        }}
      >
        Theme
      </button>
    );
  }

  const toggleTheme = () => {
    onThemeToggle(!theme);
  };

  const isLightTheme = !theme;
  const bgColor = isLightTheme ? "#e7e8e6" : "#333131";
  const textColor = isLightTheme ? "#333131" : "#ffffff";
  const borderColor = isLightTheme ? "#cccccc" : "#555555";

  return (
    <button
      onClick={toggleTheme}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        borderRadius: "6px",
        padding: "0.5rem 1rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
        fontSize: "0.9rem",
        fontWeight: "500",
        minWidth: "100px",
      }}
      onMouseEnter={(e) => {
        e.target.style.opacity = "0.8";
      }}
      onMouseLeave={(e) => {
        e.target.style.opacity = "1";
      }}
      aria-label={`Switch to ${theme ? "light" : "dark"} mode`}
    >
      {theme ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}

export default ColorToggle;
