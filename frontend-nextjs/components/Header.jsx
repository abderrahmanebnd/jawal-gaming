import { Menu, X } from "lucide-react";
import { CONSTANTS } from "../shared/constants";
import logo from "/logo.png";
import lightModeLogo from "/Logo-LightMode.png";
import ColorToggle from "../shared/ColorToggle";
import menuIcon from "/light-mode-menu.png";
import { Link } from "react-router-dom";

const Header = ({ navLinks, onMenuToggle, isMenuOpen, setTheme }) => {
  // Determine current theme safely
  const isLightTheme =
    typeof window !== "undefined"
      ? document.body.getAttribute("data-theme") === "light"
      : true; // default to light during SSR

  const bgColor = isLightTheme ? "#e7e8e6" : "#333131";
  const borderColor = isLightTheme ? "#e7e8e6" : "#272727ff";
  const textColor = isLightTheme ? "#333131" : "#ffffffff";
  const hoverColor = isLightTheme ? "#f3f3f3ff" : "#333131";
  const currentLogo = isLightTheme ? lightModeLogo : logo;

  return (
    <header
      className="sticky-top header shadow-sm"
      style={{
        backgroundColor: bgColor,
        borderBottom: `2px solid ${borderColor}`,
      }}
    >
      <nav className="navbar p-0 py-1 navbar-expand-lg navbar-dark">
        <div className="container">
          <Link
            className="navbar-brand fw-bold fs-3"
            to="/"
            style={{ color: textColor }}
          >
            <img width={100} src={currentLogo} alt="Jawal Games" />
          </Link>

          <button
            className="navbar-toggler border-1 p-0"
            type="button"
            onClick={onMenuToggle}
            style={{ boxShadow: "none" }}
          >
            {isLightTheme ? (
              isMenuOpen ? (
                <X size={34} color="#b2de43" />
              ) : (
                <img src={menuIcon} width={34} height={34} alt="Menu" />
              )
            ) : isMenuOpen ? (
              <X size={34} color="#b2de43" />
            ) : (
              <Menu size={34} color="#b2de43" />
            )}
          </button>

          <div
            className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`}
          >
            <ul className="navbar-nav ms-auto">
              {navLinks.map((link) => (
                <li key={link.id} className="nav-item">
                  <Link
                    className="d-block navigation-link px-3 py-2 mx-1 rounded transition-all pt-md-3 text-decoration-none"
                    to={link.url}
                    style={{ color: textColor }}
                    onMouseEnter={(e) => {
                      if (typeof window !== "undefined")
                        e.target.style.backgroundColor = hoverColor;
                    }}
                    onMouseLeave={(e) => {
                      if (typeof window !== "undefined")
                        e.target.style.backgroundColor = "transparent";
                    }}
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
              <li className="nav-item">
                <div
                  className="nav-link px-3 py-2 mx-1"
                  style={{ cursor: "default" }}
                >
                  <ColorToggle setTheme={setTheme} />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
