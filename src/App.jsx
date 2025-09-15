import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/home/HomePage";
import GamePage from "./pages/game/GamePage";
import AdminLogin from "./pages/login/AdminLogin";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import { CONSTANTS } from "./shared/constants";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { RoutePaths } from "./routes";
import "./App.css";
import PrivateRoutes from "./auth/PrivateRoutes";
import { apiEndPoints } from "./api/api";
import useApi from "./hooks/useApi";
import ScrollToTop from "./components/ScrollToTop";
// import ColorToggle from "./shared/ColorToggle";
import BackToTopButton from "./components/BackToTopButton";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ProtectedRoute from "./auth/ProtectedRoute";
import VerifyOtp from "./pages/login/VerifyOtp";
import GuestRoute from "./auth/GuestRoute";

const App = () => {
  const [currentPage, setCurrentPage] = useState("/");
  const [selectedGame, setSelectedGame] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { get: getNav, data: NavResponse } = useApi();
  const { get: getFooter, data: FooterResponse } = useApi();
  const [navLinks, setNavLinks] = useState([]);
  const [footerLinks, setFooterLinks] = useState([]);
  const [theme, setTheme] = useState(false);

  useEffect(() => {
    const url = apiEndPoints.viewFooter;
    const navUrl = apiEndPoints.viewNav;

    const param = {
      pageNo: 1,
      pageSize: 50,
    };
    const headers = { "Content-Type": "application/json" };
    getNav(navUrl, param, headers, true);
    getFooter(url, param, headers, true);
  }, [apiEndPoints]);

  useEffect(() => {
    if (
      FooterResponse?.status === 200 &&
      Array.isArray(FooterResponse.data.data)
    ) {
      setFooterLinks(FooterResponse.data.data);
    }
  }, [FooterResponse]);

  useEffect(() => {
    if (NavResponse?.status === 200 && Array.isArray(NavResponse.data.data)) {
      setNavLinks(NavResponse.data.data);
    }
  }, [NavResponse]);

  useEffect(() => {
    setCurrentPage(location.pathname);
  }, [location]);

  // Event handlers
  const handleGameClick = (game) => {
    setSelectedGame(game);
    navigate(RoutePaths.game);
  };

  const handleToggleFavorite = (gameId) => {
    setFavorites((prev) =>
      prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleBackToHome = () => {
    navigate(-1);
    setSelectedGame(null);
  };

  // SEO Meta tags (would be handled by React Helmet in production)
  // useEffect(() => {
  //   document.title = selectedGame
  //     ? `${selectedGame.title} - Jawal Games`
  //     : "Jawal Games - Play Now!";
  // }, [selectedGame]);

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
      {/* Header */}
      <Header
        navLinks={navLinks}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        isMenuOpen={isMenuOpen}
        setTheme={setTheme}
      />

      {/* Main Content */}
      <main className="flex-grow-1 main-container">
        <Routes location={location} key={location.pathname}>
          <Route
            path={RoutePaths.base}
            element={
              <HomePage
                onToggleFavorite={handleToggleFavorite}
                onGameClick={handleGameClick}
              />
            }
          />
          <Route path={RoutePaths.privacyPolicy} element={<PrivacyPolicy />} />

          <Route
            path={RoutePaths.game}
            element={
              <GamePage
                onToggleFavorite={handleToggleFavorite}
                onGameClick={handleGameClick}
                onBack={handleBackToHome}
              />
            }
          />

          <Route element={<GuestRoute />}>
            <Route path={RoutePaths.login} element={<AdminLogin />} />
            <Route path={RoutePaths.verifyOtp} element={<VerifyOtp />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route
              path={RoutePaths.adminDashboard}
              element={<AdminDashboard />}
            />
          </Route>
        </Routes>
      </main>

      {/* Footer */}
      <Footer footerLinks={footerLinks} />

      {/* Bootstrap CSS CDN */}
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css"
        rel="stylesheet"
      />

      <ScrollToTop />
      <BackToTopButton />
    </div>
  );
};

export default App;
