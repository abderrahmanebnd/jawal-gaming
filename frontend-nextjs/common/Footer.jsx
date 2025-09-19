// components/Footer.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { CONSTANTS } from "@/shared/constants";

const Footer = ({ footerLinks }) => {
  const [isLightTheme, setIsLightTheme] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Handle theme detection safely
  useEffect(() => {
    setMounted(true);

    const detectTheme = () => {
      setIsLightTheme(document.body.getAttribute("data-theme") === "light");
    };

    detectTheme();

    // Listen for theme changes
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <footer
        className="mt-auto footers py-4"
        style={{ backgroundColor: "#e7e8e6" }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="d-flex gap-3 justify-content-center justify-content-md-start">
                <div
                  style={{
                    height: "40px",
                    width: "120px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "4px",
                  }}
                />
                <div
                  style={{
                    height: "40px",
                    width: "120px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "4px",
                  }}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="text-center">
                <small style={{ color: "#999" }}>
                  © 2025 Jawal Games. All rights reserved.
                </small>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  const bgColor = isLightTheme ? "#e7e8e6" : "#333131";
  const borderColor = isLightTheme ? "#d4d3d3ff" : "#202020ff";
  const linkColor = isLightTheme ? "#333131" : "#e7e8e6";

  return (
    <footer
      className="mt-auto footers py-4"
      style={{
        backgroundColor: bgColor,
        borderTop: `2px solid ${borderColor}`,
      }}
    >
      <div className="container">
        <div className="row align-items-center items-center">
          {/* App Store Links */}
          <div className="col-md-6 mb-3 mb-md-0">
            <div className="d-flex gap-3 justify-content-center justify-content-md-start">
              <a
                href="https://apps.apple.com/app/%D8%A3%D9%84%D8%B9%D8%A7%D8%A8-%D8%AC%D9%88%D8%A7%D9%84/id6450989064"
                className="text-decoration-none"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download from App Store"
              >
                <Image
                  src="/web-icons/app_store.png"
                  alt="Download on App Store"
                  height={40}
                  width={120}
                  style={{ height: "40px", width: "auto" }}
                  priority={false}
                />
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.jawalgames.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none"
                aria-label="Download from Google Play"
              >
                <Image
                  src="/web-icons/google_play.png"
                  alt="Get it on Google Play"
                  height={40}
                  width={120}
                  style={{ height: "40px", width: "auto" }}
                  priority={false}
                />
              </a>
            </div>
          </div>

          {/* Desktop Footer Links */}
          <div className="col-md-6 d-flex justify-content-end">
            <nav className="gap-4 justify-content-end d-none d-md-block">
              {footerLinks?.map((link) => (
                <Link
                  key={link.id}
                  href={link.url}
                  className="text-decoration-none mx-2 footer-link"
                  style={{ color: linkColor }}
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="row mt-1">
          {/* Mobile Footer Links */}
          <nav className="d-flex gap-4 justify-content-center d-md-none d-block mb-1">
            {footerLinks?.map((link) => (
              <Link
                key={link.id}
                href={link.url}
                className="text-decoration-none footer-link"
                style={{ color: linkColor }}
              >
                {link.title}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <div className="col-12 text-center">
            <small style={{ color: "#999" }}>
              © 2025 Jawal Games. All rights reserved.
            </small>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
