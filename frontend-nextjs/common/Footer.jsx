import { CONSTANTS } from "../shared/constants";
import appStore from "../assets/app_store.png";
import googlePlay from "../assets/google_play.png";
import { Link } from "react-router-dom";

// /components/Footer.jsx
const Footer = ({ footerLinks }) => {
  const isLightTheme =
    typeof window !== "undefined"
      ? document.body.getAttribute("data-theme") === "light"
      : true; // default to light theme on SSR

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
        <div className="row align-items-center">
          <div className="col-md-6 mb-3 mb-md-0">
            <div className="d-flex gap-3 justify-content-center justify-content-md-start">
              <a
                href="https://apps.apple.com/app/%D8%A3%D9%84%D8%B9%D8%A7%D8%A8-%D8%AC%D9%88%D8%A7%D9%84/id6450989064"
                className="text-decoration-none"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={appStore}
                  alt="App Store"
                  style={{ height: "40px" }}
                />
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.jawalgames.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none"
              >
                <img
                  src={googlePlay}
                  alt="Google Play"
                  style={{ height: "40px" }}
                />
              </a>
            </div>
          </div>

          {/* links */}
          <div className="col-md-6 d-flex justify-content-end">
            <div className="gap-4 justify-content-end d-none d-md-block p-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.id}
                  to={link.url}
                  className="text-decoration-none mx-2 footer-link"
                  style={{ color: linkColor }}
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="row mt-1">
          <div className="d-flex gap-4 justify-content-center d-md-none d-block mb-1">
            {footerLinks.map((link) => (
              <Link
                key={link.id}
                to={link.url}
                className="text-decoration-none footer-link"
                style={{ color: linkColor }}
              >
                {link.title}
              </Link>
            ))}
          </div>
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
