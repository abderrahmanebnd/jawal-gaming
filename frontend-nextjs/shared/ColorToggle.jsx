import { useEffect, useState } from "react";

function ColorToggle({ setTheme }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1024); // default for SSR

  const isBrowser = typeof window !== "undefined";

  useEffect(() => {
    if (!isBrowser) return;

    setIsClient(true);

    // Get stored theme from localStorage
    let storedTheme = localStorage.getItem("theme");

    // Default to dark theme if nothing stored
    if (storedTheme === null) {
      localStorage.setItem("theme", "true");
      storedTheme = "true";
    }

    const isDark = storedTheme === "true";
    setIsDarkMode(isDark);
    setTheme(isDark);
    document.body.setAttribute("data-theme", isDark ? "dark" : "light");

    // Track window width for responsive styling
    const updateWidth = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", updateWidth);
    updateWidth();

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, [isBrowser, setTheme]);

  const toggleTheme = () => {
    if (!isBrowser) return;

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
    backgroundColor: isDarkMode ? "#444444" : "#e7e8e6",
    color: isDarkMode ? "#e7e8e6" : "#333333",
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
    backgroundColor: isDarkMode ? "#555555" : "#f5f5f5",
    borderColor: isDarkMode ? "#666666" : "#cccccc",
  };

  return (
    <button
      onClick={toggleTheme}
      style={buttonStyle}
      onMouseEnter={(e) => Object.assign(e.target.style, hoverStyle)}
      onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
    >
      {isDarkMode ? "Light" : "Dark"}
    </button>
  );
}

export default ColorToggle;
