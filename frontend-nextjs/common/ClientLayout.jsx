// components/ClientLayout.jsx
"use client";

import { useState, useEffect } from "react";
import { CONSTANTS } from "@/shared/constants";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import BackToTopButton from "./BackToTopButton";
import { usePathname, useSearchParams } from "next/navigation";

export default function ClientLayout({ children, navLinks, footerLinks }) {
  const [theme, setTheme] = useState(true); // false = light, true = dark
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views on route changes
  useEffect(() => {
    if (typeof gtag !== "undefined") {
      const url =
        pathname +
        (searchParams.toString() ? "?" + searchParams.toString() : "");

      gtag("config", "G-HPVDD3B6EK", {
        page_path: url,
        page_location: window.location.href,
      });
    }
  }, [pathname, searchParams]);

  // Initialize theme from localStorage
  useEffect(() => {
    setMounted(true);

    try {
      const savedTheme = localStorage.getItem("theme");

      // Default to light theme if nothing saved
      const isDark = savedTheme === "dark";

      setTheme(isDark);
      document.body.setAttribute("data-theme", isDark ? "dark" : "light");
    } catch (error) {
      console.error("Error loading theme:", error);
      // Fallback to light theme
      setTheme(false);
      document.body.setAttribute("data-theme", "light");
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
        backgroundColor: mounted
          ? theme
            ? CONSTANTS.COLORS.background
            : CONSTANTS.COLORS.lightBackground
          : CONSTANTS.COLORS.background,
        color: mounted
          ? theme
            ? CONSTANTS.COLORS.text
            : CONSTANTS.COLORS.darkText
          : CONSTANTS.COLORS.text, // Default during SSR
        transition: "background-color 0.3s ease, color 0.3s ease", // Smooth theme transition
      }}
    >
      <Header
        navLinks={navLinks}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        isMenuOpen={isMenuOpen}
        theme={theme}
        onThemeToggle={handleThemeToggle} // ✅ Fix: Use handleThemeToggle instead of setTheme
        mounted={mounted} // ✅ Pass mounted state to Header
      />

      <main className="flex-grow-1 main-container">{children}</main>

      <Footer footerLinks={footerLinks} />

      <ScrollToTop />
      <BackToTopButton />
    </div>
  );
}
