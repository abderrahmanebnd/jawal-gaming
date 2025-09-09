import { Menu, X } from "lucide-react";
import { CONSTANTS } from "../shared/constants";
import logo from "/logo.png";
import lightModeLogo from "/Logo-LightMode.png";
import ColorToggle from "../shared/ColorToggle";
import menuIcon from "/light-mode-menu.png";

const Header = ({ navLinks, onMenuToggle, isMenuOpen, setTheme }) => (
  <header
    className="sticky-top header shadow-sm"
    style={{
      backgroundColor:
        document.body.getAttribute("data-theme") === "light"
          ? "#e7e8e6"
          : "#333131",
      borderBottom: `2px solid ${
        document.body.getAttribute("data-theme") === "light"
          ? " #e7e8e6"
          : "#272727ff"
      }`,
    }}
  >
    <nav className="navbar  p-0 py-1 navbar-expand-lg navbar-dark">
      <div className="container">
        <a
          className="navbar-brand fw-bold fs-3"
          href="/"
          style={{
            color:
              document.body.getAttribute("data-theme") === "light"
                ? " #333131"
                : "#e7e8e6",
          }}
        >
          <img width={100} src={logo} />
        </a>

        <button
          className="navbar-toggler border-1 p-0 "
          type="button"
          onClick={onMenuToggle}
          style={{ boxShadow: "none" }}
        >
          {isMenuOpen ? (
            <X
              size={34}
              color={
                document.body.getAttribute("data-theme") === "light"
                  ? " #b2de43"
                  : "#b2de43"
              }
            />
          ) : (
            <Menu
              size={34}
              color={
                document.body.getAttribute("data-theme") === "light"
                  ? " #b2de43"
                  : "#b2de43"
              }
            />
          )}
        </button>

        <div className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`}>
          <ul className="navbar-nav ms-auto">
            {navLinks.map((link) => (
              <li key={link.id} className="nav-item">
                <a
                  className="d-block navigation-link px-3 py-2 mx-1 rounded transition-all pt-md-3 text-decoration-none"
                  href={link.url}
                  style={{
                    color:
                      document.body.getAttribute("data-theme") === "light"
                        ? " #333131"
                        : "#e7e8e6",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor =
                      document.body.getAttribute("data-theme") === "light"
                        ? " #e7e8e690"
                        : "#333131")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  }
                >
                  {link.title}
                </a>
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

export default Header;
