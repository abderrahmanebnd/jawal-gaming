import { useEffect, useState } from "react";
import { CONSTANTS } from "../../shared/constants";
import useApi from "../../hooks/useApi";
import { apiEndPoints } from "../../api/api";
import GameComponent from "./components/GameComponent";
import NavComponent from "./components/NavComponent";
import FooterComponent from "./components/FooterComponent";
import { logout } from "../../store/features/authSlice";
import { RoutePaths } from "../../routes";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Gamepad2, ClipboardList, Link, LogOut, User, Shield, AlertTriangle, X } from "lucide-react";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("games");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    get: getSignout,
    data: singOutResponse,
    error: singOutError,
  } = useApi();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    const url = apiEndPoints.signOut;
    const headers = { "Content-Type": "application/json" };
    getSignout(url, "", headers, true);
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
    setIsLoggingOut(false);
  };

  useEffect(() => {
    if (singOutResponse?.status === 200) {
      dispatch(logout());
      navigate(RoutePaths.home);
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  }, [singOutResponse, dispatch, navigate]);

  useEffect(() => {
    if (singOutError) {
      setIsLoggingOut(false);
      // toast.error(singOutError);
    }
  }, [singOutError]);

  const isDark = document.body.getAttribute("data-theme") !== "light";

  return (
    <div className="container py-4">
      {/* Enhanced Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 p-4 rounded-4 shadow-sm" 
           style={{ 
             background: isDark 
               ? 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)' 
               : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
             border: `1px solid ${isDark ? '#495057' : '#dee2e6'}`
           }}>
        
        {/* Left Side - Dashboard Title */}
        <div className="d-flex align-items-center">
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center me-3"
            style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(45deg, #007bff, #0056b3)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
            }}
          >
            <Shield size={24} />
          </div>
          <div>
            <h3 className="mb-0 fw-bold" 
                style={{ color: isDark ? "#ffffff" : "#000000" }}>
              Admin Dashboard
            </h3>
            <p className="mb-0 small" 
               style={{ color: isDark ? "#adb5bd" : "#6c757d" }}>
              Manage your application content
            </p>
          </div>
        </div>

        {/* Right Side - User Profile & Logout */}
        <div className="d-flex align-items-center gap-3">
          {/* User Profile Section */}
          <div className="d-flex align-items-center me-2 d-none d-md-flex">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center me-2"
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: isDark ? '#495057' : '#e9ecef',
                color: isDark ? '#adb5bd' : '#6c757d'
              }}
            >
              <User size={18} />
            </div>
            <div>
              <small className="fw-semibold d-block" 
                     style={{ color: isDark ? "#ffffff" : "#000000" }}>
                Administrator
              </small>
              <small style={{ color: isDark ? "#adb5bd" : "#6c757d" }}>
                System Admin
              </small>
            </div>
          </div>

          {/* Modern Logout Button */}
          <button
            className="btn rounded-3 px-4 py-2 fw-semibold d-flex align-items-center gap-2 position-relative"
            onClick={handleLogoutClick}
            style={{
              background: 'linear-gradient(45deg, #dc3545, #c82333)',
              border: 'none',
              color: '#fff',
              boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)',
              transition: 'all 0.3s ease',
              minWidth: '120px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.4)';
              e.currentTarget.style.background = 'linear-gradient(45deg, #e74c3c, #dc3545)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.3)';
              e.currentTarget.style.background = 'linear-gradient(45deg, #dc3545, #c82333)';
            }}
          >
            <LogOut size={16} />
            <span className="d-none d-sm-inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-4 mt-md-5 mt-3">
        <ul className="nav nav-pills">
          {[
            { key: "games", label: "Games", icon: <Gamepad2 width={20} /> },
            {
              key: "nav",
              label: "Navigation",
              icon: <ClipboardList width={20} />,
            },
            { key: "footer", label: "Footer", icon: <Link width={20} /> },
          ].map((section) => (
            <li key={section.key} className="nav-item me-2">
              <button
                className={`nav-link rounded-pill px-4 mt-3 mt-md-0 d-flex align-items-center gap-2 fw-semibold ${
                  activeSection === section.key ? "active" : ""
                }`}
                style={{
                  backgroundColor:
                    activeSection === section.key
                      ? CONSTANTS.COLORS.primary
                      : "transparent",
                  color:
                    activeSection === section.key
                      ? "#fff"
                      : isDark ? "#ffffff" : "#000000",
                  border: `2px solid ${
                    activeSection === section.key
                      ? CONSTANTS.COLORS.primary
                      : "#555"
                  }`,
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setActiveSection(section.key)}
                onMouseEnter={(e) => {
                  if (activeSection !== section.key) {
                    e.currentTarget.style.borderColor = CONSTANTS.COLORS.primary;
                    e.currentTarget.style.color = CONSTANTS.COLORS.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== section.key) {
                    e.currentTarget.style.borderColor = "#555";
                    e.currentTarget.style.color = isDark ? "#ffffff" : "#000000";
                  }
                }}
              >
                {section.icon} <span>{section.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Content Sections */}
      {activeSection === "games" && <GameComponent />}
      {activeSection === "nav" && <NavComponent />}
      {activeSection === "footer" && <FooterComponent />}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div 
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLogoutModal();
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div 
              className="modal-content border-0 shadow-lg"
              style={{ backgroundColor: isDark ? '#2c3e50' : '#ffffff' }}
            >
              <div className="modal-header border-0 pb-2">
                <div className="d-flex align-items-center w-100">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: '35px',
                      height: '35px',
                      backgroundColor: '#dc3545',
                      color: '#fff'
                    }}
                  >
                    <AlertTriangle size={18} />
                  </div>
                  <h5 className="modal-title mb-0 fw-bold" 
                      style={{ color: isDark ? '#ffffff' : '#000000' }}>
                    Sign Out Confirmation
                  </h5>
                </div>
                <button 
                  type="button" 
                  className={`btn-close me-2 ${isDark ? 'btn-close-white' : ''}`}
                  onClick={closeLogoutModal}
                  disabled={isLoggingOut}
                ></button>
              </div>

              <div className="modal-body px-4 py-3">
                <div className="text-center">
                  <p className="mb-3" 
                     style={{ color: isDark ? '#adb5bd' : '#6c757d' }}>
                    Are you sure you want to sign out of your admin session?
                  </p>
                  
                  {isLoggingOut && (
                    <div className="mb-3">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                      <small style={{ color: isDark ? '#adb5bd' : '#6c757d' }}>
                        Signing you out securely...
                      </small>
                    </div>
                  )}

                  <div 
                    className="alert border-0 py-2"
                    style={{ 
                      backgroundColor: isDark 
                        ? 'rgba(220, 53, 69, 0.1)' 
                        : 'rgba(220, 53, 69, 0.1)' 
                    }}
                  >
                    <small style={{ color: '#dc3545' }}>
                      <AlertTriangle size={14} className="me-1" />
                      You will need to log in again to access the admin dashboard.
                    </small>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0 justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-3 px-4"
                  onClick={closeLogoutModal}
                  disabled={isLoggingOut}
                  style={{
                    color: isDark ? '#adb5bd' : '#6c757d',
                    borderColor: isDark ? '#6c757d' : '#adb5bd'
                  }}
                >
                  <X size={16} className="me-1" />
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-3 px-4 fw-semibold"
                  onClick={handleLogoutConfirm}
                  disabled={isLoggingOut}
                  style={{
                    background: 'linear-gradient(45deg, #dc3545, #c82333)',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)',
                    minWidth: '120px'
                  }}
                >
                  {isLoggingOut ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Signing Out...
                    </>
                  ) : (
                    <>
                      <LogOut size={16} className="me-2" />
                      Sign Out
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard