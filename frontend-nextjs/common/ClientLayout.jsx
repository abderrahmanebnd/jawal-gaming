// components/ClientLayout.jsx
"use client";
import { useState, useEffect } from "react";
import { CONSTANTS } from "@/shared/constants";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import BackToTopButton from "./BackToTopButton";

export default function ClientLayout({ children, navLinks, footerLinks }) {
  const [theme, setTheme] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Theme detection
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme === "dark");
      document.body.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const handleThemeToggle = (newTheme) => {
    setTheme(newTheme);
    const themeValue = newTheme ? "dark" : "light";
    localStorage.setItem("theme", themeValue);
    document.body.setAttribute("data-theme", themeValue);
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{
        backgroundColor: theme
          ? CONSTANTS.COLORS.background
          : CONSTANTS.COLORS.lightBackground,
        color: theme ? CONSTANTS.COLORS.text : CONSTANTS.COLORS.darkText,
      }}
    >
      {/* Header with theme toggle */}
      <Header
        navLinks={navLinks}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        isMenuOpen={isMenuOpen}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />

      {/* Main Content */}
      <main className="flex-grow-1 main-container">{children}</main>

      {/* Footer */}
      <Footer footerLinks={footerLinks} />

      <ScrollToTop />
      <BackToTopButton />
    </div>
  );
}
