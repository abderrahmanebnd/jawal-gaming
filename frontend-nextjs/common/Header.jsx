"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ColorToggle from "@/shared/ColorToggle";
import Image from "next/image";

const Header = ({ navLinks, theme, onThemeToggle }) => {
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isLightTheme = !theme;
  const bgColor = isLightTheme ? "#e7e8e6" : "#333131";
  const textColor = isLightTheme ? "#333131" : "#fff";
  const hoverColor = isLightTheme ? "#f3f3f3" : "#444";

  return (
    <header
      className="sticky-top shadow-sm"
      style={{
        backgroundColor: bgColor,
        borderBottom: `2px solid ${isLightTheme ? "#e7e8e6" : "#272727"}`,
        zIndex: 1000,
      }}
    >
      <nav className="navbar p-0 py-1">
        <div className="container d-flex align-items-center justify-content-between flex-nowrap">
          {/* Logo */}
          <Link href="/" className="navbar-brand fw-bold fs-3">
            <Image
              src={isLightTheme ? "/Logo-LightMode.png" : "/logo.png"}
              alt="Jawal Games"
              width={100}
              height={50}
              className="max-w-screen"
            />
          </Link>

          {/* Desktop Nav */}
          <ul className="d-none d-lg-flex mb-0 ms-auto align-items-center flex-1 justify-center">
            {navLinks?.map((link) => (
              <li key={link.id} className="list-unstyled mr-auto">
                <Link
                  className="d-block navigation-link px-3 py-2 mx-1 rounded transition-all pt-md-3 text-decoration-none"
                  href={link.url}
                  style={{ color: textColor }}
                 
                >
                  {link.title}
                </Link>
              </li>
            ))}
            <li className="list-unstyled px-2 w-fit">
              <div className="ml-auto w-fit">
          
              <ColorToggle theme={theme} onThemeToggle={onThemeToggle} />
              </div>
            </li>
          </ul>

          {/* Mobile Button */}
          <button
            className="d-lg-none btn p-1"
            style={{ boxShadow: "none" }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X size={30} color="#b2de43" />
            ) : (
              <Menu size={30} color="#b2de43" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className="d-lg-none flex justify-center"
          style={{
            minHeight: "100vh",
            overflowY: "auto",
            backgroundColor: bgColor,
            borderTop: `1px solid ${isLightTheme ? "#e7e8e6" : "#272727"}`,
          }}
        >
          <ul className="list-unstyled m-0 p-3 d-flex flex-column gap-2 container ">
            {navLinks?.map((link) => (
              <li key={link.id}>
                <Link
                  className="d-block navigation-link px-3 py-2 mx-1 rounded transition-all pt-md-3 text-decoration-none"
                  href={link.url}
                  style={{ color: textColor }}
                
                >
                  {link.title}
                </Link>
              </li>
            ))}

            <li className="mt-2 pt-2 ml-4">
              <ColorToggle theme={theme} onThemeToggle={onThemeToggle} />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
