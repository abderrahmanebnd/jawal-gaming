import { useEffect, useState } from "react";

function ColorToggle({ setTheme }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    let storedTheme = localStorage.getItem("theme");
    
    // If no theme is stored, set dark theme as default in localStorage
    if (storedTheme === null) {
      localStorage.setItem("theme", "true");
      storedTheme = "true";
    }
    
    const isDark = storedTheme === "true";

    setIsDarkMode(isDark);
    setTheme(isDark);
    document.body.setAttribute("data-theme", isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    const newTheme = newDarkMode ? "dark" : "light";
    
    setIsDarkMode(newDarkMode);
    setTheme(newDarkMode);
    localStorage.setItem("theme", newDarkMode.toString());
    document.body.setAttribute("data-theme", newTheme);
  };

  if (!isClient) return null;

  const buttonStyle = {
    padding: "8px 16px",
    borderRadius: "6px",
    border: `1px solid ${isDarkMode ? "#555555" : "#dddddd"}`,
    backgroundColor: isDarkMode ? "#444444" : "#c6c4c6",
    color: isDarkMode ? "#c6c4c6" : "#333333",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    userSelect: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "80px",
    width: window.innerWidth <= 768 ? "100%" : "auto"
  };

  const hoverStyle = {
    backgroundColor: isDarkMode ? "#555555" : "#f5f5f5",
    borderColor: isDarkMode ? "#666666" : "#cccccc"
  };

  return (
    <button
      onClick={toggleTheme}
      style={buttonStyle}
      onMouseEnter={(e) => {
        Object.assign(e.target.style, hoverStyle);
      }}
      onMouseLeave={(e) => {
        Object.assign(e.target.style, buttonStyle);
      }}
    >
      {isDarkMode ? "Light" : "Dark"}
    </button>
  );
}

export default ColorToggle;