// components/BackToTopButton.jsx
"use client"
import Image from "next/image";
import { useEffect, useState } from "react";

const BackToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onScroll = () => {
      setVisible(window.scrollY > 100);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
      className="rounded-circle shadow btn-to-top"
    
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#b6e642";
        e.currentTarget.style.transform = "scale(1.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#e2f3e7";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <Image
        src="/ScrollUp-icon.png"
        alt="Up"
        className="img-to-top"
        height={40}
        width={40}
      />
    </button>
  );
};

export default BackToTopButton;
