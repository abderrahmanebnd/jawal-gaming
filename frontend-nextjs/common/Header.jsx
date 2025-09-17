// components/Header.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CONSTANTS } from "@/shared/constants";
import ColorToggle from "@/shared/ColorToggle";

const Header = ({
  navLinks,
  onMenuToggle,
  isMenuOpen,
  theme,
  onThemeToggle,
}) => {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu when clicking outside
  const handleOutsideClick = useCallback(
    (e) => {
      if (isMenuOpen && !e.target.closest(".navbar")) {
        onMenuToggle();
      }
    },
    [isMenuOpen, onMenuToggle]
  );

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener("click", handleOutsideClick);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, handleOutsideClick]);

  // Auto-close menu on route change
  useEffect(() => {
    if (isMenuOpen) {
      onMenuToggle();
    }
  }, [pathname]);

  if (!mounted) {
    return <HeaderSkeleton />;
  }

  // Use theme prop directly instead of detecting from DOM
  const isLightTheme = !theme; // theme is boolean: false=light, true=dark

  const bgColor = isLightTheme ? "#e7e8e6" : "#333131";
  const borderColor = isLightTheme ? "#e7e8e6" : "#272727ff";
  const textColor = isLightTheme ? "#333131" : "#ffffffff";
  const hoverColor = isLightTheme ? "#f3f3f3ff" : "#333131";

  return (
    <>
      <header
        className="sticky-top header shadow-sm"
        style={{
          backgroundColor: bgColor,
          borderBottom: `2px solid ${borderColor}`,
          zIndex: 1030,
        }}
      >
        <nav className="navbar p-0 py-1 navbar-expand-lg">
          <div className="container">
            <Link href="/" className="navbar-brand fw-bold fs-3">
              <Image
                src={
                  isLightTheme ? "/Logo-LightMode.png" : "/web-icons/logo.png"
                }
                alt="Jawal Games"
                width={100}
                height={40}
                priority={true}
              />
            </Link>

            <button
              className="navbar-toggler border-0 p-1"
              type="button"
              onClick={onMenuToggle}
              aria-label="Toggle navigation"
              aria-expanded={isMenuOpen}
              style={{ boxShadow: "none" }}
            >
              {isMenuOpen ? (
                <X size={30} color="#b2de43" />
              ) : isLightTheme ? (
                <Image
                  src="/light-mode-menu.png"
                  width={30}
                  height={30}
                  alt="Menu"
                />
              ) : (
                <Menu size={30} color="#b2de43" />
              )}
            </button>

            <div
              className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`}
            >
              <ul className="navbar-nav ms-auto">
                {navLinks?.map((link) => (
                  <li key={link.id} className="nav-item">
                    <Link
                      href={link.url}
                      className={`nav-link px-3 py-2 mx-1 rounded transition-all ${
                        pathname === link.url ? "active" : ""
                      }`}
                      style={{
                        color: textColor,
                        backgroundColor:
                          pathname === link.url ? hoverColor : "transparent",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = hoverColor)
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor =
                          pathname === link.url ? hoverColor : "transparent")
                      }
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
                <li className="nav-item">
                  <div className="nav-link px-3 py-2 mx-1">
                    <ColorToggle theme={theme} onThemeToggle={onThemeToggle} />
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="position-fixed w-100 h-100 d-lg-none"
          style={{
            top: 0,
            left: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1025,
          }}
          onClick={onMenuToggle}
        />
      )}
    </>
  );
};

const HeaderSkeleton = () => (
  <header
    className="sticky-top header shadow-sm"
    style={{ backgroundColor: "#e7e8e6" }}
  >
    <nav className="navbar p-0 py-1">
      <div className="container">
        <div
          className="placeholder"
          style={{ width: "100px", height: "40px" }}
        />
        <div
          className="placeholder"
          style={{ width: "34px", height: "34px" }}
        />
      </div>
    </nav>
  </header>
);

export default Header;
