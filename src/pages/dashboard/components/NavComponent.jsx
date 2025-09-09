import React, { useEffect, useState } from "react";
import { Edit3, Trash2, Save, Plus, Menu, AlertTriangle, X, ExternalLink, Navigation } from "lucide-react";
import { CONSTANTS } from "../../../shared/constants";
import useApi from "../../../hooks/useApi";
import { apiEndPoints } from "../../../api/api";

const NavComponent = () => {
  const [navLinks, setNvLinks] = useState([]);
  const [editingNavLink, setEditingNavLink] = useState(null);
  const [navForm, setNavForm] = useState({ title: "", url: "" });
  const [showNavModal, setShowNavModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [refresh, setRefresh] = useState(0);

  const {
    get: getNav,
    data: NavResponse,
    loading: NavLoading,
    error: NavError,
    source: NavSource,
  } = useApi();
  
  const {
    post: addNav,
    data: addNavResponse,
    loading: addNavLoading,
    error: addNavError,
    source: addNavSource,
  } = useApi();
  
  const {
    deleteApi: deleteNav,
    data: deleteNavResponse,
    loading: deleteNavLoading,
    error: deleteNavError,
    source: deleteNavSource,
  } = useApi();

  useEffect(() => {
    const url = apiEndPoints.viewNav;
    const param = {
      pageNo: 1,
      pageSize: 50,
    };
    const headers = { "Content-Type": "application/json" };
    getNav(url, param, headers, true);
  }, [refresh]);

  useEffect(() => {
    if (NavResponse?.status === 200) {
      setNvLinks(NavResponse.data.data);
    }
  }, [NavResponse]);

  useEffect(() => {
    return () => {
      if (NavSource) {
        NavSource.cancel("Component unmounted");
      }
    };
  }, [NavSource]);

  useEffect(() => {
    if (NavError) {
      console.error("Nav fetch error:", NavError);
    }
  }, [NavError]);

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!navForm.title.trim()) {
      errors.title = 'Navigation title is required';
    }
    
   if (!navForm.url.trim()) {
  errors.url = 'Navigation URL is required';
} else if (!/^https?:\/\/.+/.test(navForm.url) && !/^\/.+/.test(navForm.url)) {
  errors.url = 'Please enter a valid URL (starting with http://, https://, or /)';
}

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle nav link submission
  const handleNavSubmit = () => {
    if (!validateForm()) return;

    const url = apiEndPoints.addNav;
    const body = {
      title: navForm.title,
      url: navForm.url,
    };
    
    if (editingNavLink?.id) {
      body.id = editingNavLink.id;
    }

    const headers = { "Content-Type": "application/json" };
    addNav(url, body, headers, true);
  };

  useEffect(() => {
    if (addNavResponse?.status === 200) {
      setRefresh(refresh + 1);
      closeNavModal();
    }
  }, [addNavResponse]);

  useEffect(() => {
    return () => {
      if (addNavSource) {
        addNavSource.cancel("Component unmounted");
      }
    };
  }, [addNavSource]);

  useEffect(() => {
    if (addNavError) {
      console.error("Add nav error:", addNavError);
    }
  }, [addNavError]);

  // Delete nav link
  const handleDeleteConfirm = () => {
    if (linkToDelete) {
      const url = apiEndPoints.deleteNav;
      const queryParams = { id: linkToDelete.id };
      const headers = { "Content-Type": "application/json" };
      deleteNav(url, queryParams, headers, true);
    }
  };

  useEffect(() => {
    if (deleteNavResponse?.status === 200) {
      setRefresh(refresh + 1);
      closeDeleteModal();
    }
  }, [deleteNavResponse]);

  useEffect(() => {
    return () => {
      if (deleteNavSource) {
        deleteNavSource.cancel("Component unmounted");
      }
    };
  }, [deleteNavSource]);

  useEffect(() => {
    if (deleteNavError) {
      console.error("Delete nav error:", deleteNavError);
    }
  }, [deleteNavError]);

  // Modal handlers
  const openAddNavModal = () => {
    setEditingNavLink(null);
    resetForm();
    setShowNavModal(true);
  };

  const openEditNavModal = (link) => {
    setEditingNavLink(link);
    setNavForm({
      title: link.title,
      url: link.url,
    });
    setFormErrors({});
    setShowNavModal(true);
  };

  const closeNavModal = () => {
    setShowNavModal(false);
    setTimeout(() => {
      resetForm();
    }, 300);
  };

  const openDeleteModal = (link) => {
    setLinkToDelete(link);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setLinkToDelete(null);
  };

  const resetForm = () => {
    setEditingNavLink(null);
    setNavForm({ title: "", url: "" });
    setFormErrors({});
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center d-none d-md-block">
              <Navigation size={32} color={CONSTANTS.COLORS.primary} className="me-3" />
              <div>
                <h3 className="mb-0 fw-bold" style={{ color:document.body.getAttribute("data-theme") === "light" ? "#000000ff" : "#c6c4c6" }}>
                  Navigation Management
                </h3>
                <p className="mb-0" style={{ color:document.body.getAttribute("data-theme") === "light" ? "#000000ff" : "#c6c4c6" }}>Manage your website navigation menu</p>
              </div>
            </div>
            <button
              className="btn btn-primary rounded-3 px-4 py-2 fw-semibold"
              onClick={openAddNavModal}
              style={{
                background: 'linear-gradient(45deg, #007bff, #0056b3)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(0,123,255,0.3)'
              }}
            >
              <Plus size={18} className="me-2" />
              Add Navigation Link
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Links Grid */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="mt-4">
              <p className="mb-0 fw-bold" style={{ color:document.body.getAttribute("data-theme") === "light" ? "#000000ff" : "#c6c4c6" }}>
                Navigation Links ({navLinks.length})
              </p>
              <p className="mb-0 " style={{ color:document.body.getAttribute("data-theme") === "light" ? "#000000ff" : "#c6c4c6" }}>Configure your website main navigation</p>
            </div>
            {NavLoading && (
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            )}
          </div>

          {navLinks.length === 0 && !NavLoading ? (
            <div className="text-center py-5">
              <Menu size={64} color="#6c757d" className="mb-3" />
              <h5 className="text-muted">No navigation links yet</h5>
              <p className="text-muted">Add your first navigation link by clicking the button above</p>
              <button 
                className="btn btn-primary rounded-3 px-4 py-2 mt-3"
                onClick={openAddNavModal}
              >
                <Plus size={16} className="me-2" />
                Add First Link
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {navLinks?.map((link, index) => (
                <div key={link.id} className="col-xl-3 col-lg-4 col-md-6">
                  <div
                    className="card border-0 shadow-lg rounded-3 h-100"
                    style={{ 
                      backgroundColor: "#343a40",
                      transition: "all 0.3s ease",
                      overflow: "hidden"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
                    }}
                  >
                    <div className="card-body p-4 d-flex flex-column">
                      <div className="d-flex align-items-start mb-3">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0 position-relative"
                          style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: CONSTANTS.COLORS.primary,
                            color: '#fff'
                          }}
                        >
                          <Menu size={18} />
                          {/* Order indicator */}
                          <span 
                            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning"
                            style={{ fontSize: '0.6rem' }}
                          >
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-grow-1 min-width-0">
                          <h6
                            className="card-title fw-bold mb-2"
                            style={{ 
                              color: CONSTANTS.COLORS.text,
                              fontSize: "1rem",
                              lineHeight: "1.3",
                              wordBreak: "break-word"
                            }}
                            title={link.title}
                          >
                            {link.title}
                          </h6>
                        </div>
                      </div>
                      
                      <div className="mb-3 flex-grow-1">
                        <p
                          className="small mb-0"
                          style={{ 
                            color: "#adb5bd",
                            fontSize: "0.85rem",
                            lineHeight: "1.4",
                            wordBreak: "break-all",
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                          title={link.url}
                        >
                          {link.url}
                        </p>
                      </div>
                      
                      <div className="d-flex gap-2 mt-auto">
                        <button
                          className="btn btn-outline-primary btn-sm rounded-pill flex-fill"
                          onClick={() => window.open(link.url, '_blank')}
                          style={{ fontSize: "0.8rem" }}
                        >
                          <ExternalLink size={12} className="me-1" />
                          Visit
                        </button>
                        <button
                          className="btn btn-outline-warning btn-sm rounded-pill flex-fill"
                          onClick={() => openEditNavModal(link)}
                          style={{ fontSize: "0.8rem" }}
                        >
                          <Edit3 size={12} className="me-1" />
                          Edit
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm rounded-pill flex-fill"
                          onClick={() => openDeleteModal(link)}
                          style={{ fontSize: "0.8rem" }}
                        >
                          <Trash2 size={12} className="me-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Nav Modal */}
      {showNavModal && (
        <div 
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeNavModal();
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div 
              className="modal-content border-0 shadow-lg"
              style={{ backgroundColor: '#2c3e50' }}
            >
              <div 
                className="modal-header border-0 pb-2"
                style={{ borderBottom: '1px solid #495057' }}
              >
                <div className="d-flex align-items-center">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: editingNavLink ? '#ffc107' : CONSTANTS.COLORS.primary,
                      color: '#fff'
                    }}
                  >
                    {editingNavLink ? <Edit3 size={18} /> : <Plus size={18} />}
                  </div>
                  <div>
                    <h5 className="modal-title mb-0 fw-bold text-white">
                      {editingNavLink ? "Edit Navigation Link" : "Add Navigation Link"}
                    </h5>
                    <p className="mb-0 small text-muted">
                      {editingNavLink ? "Update navigation information" : "Add a new main navigation link"}
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={closeNavModal}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-4">
                  {/* Link Title */}
                  <div className="col-12">
                    <label className="form-label text-light fw-semibold">Navigation Title *</label>
                    <input
                      type="text"
                      className={`form-control rounded-3 px-4 py-3 ${formErrors.title ? 'is-invalid' : ''}`}
                      placeholder="e.g., Home, About, Services, Contact"
                      style={{
                        backgroundColor: "#495057",
                        border: formErrors.title ? "2px solid #dc3545" : "2px solid transparent",
                        color: "#fff",
                        fontSize: "0.95rem"
                      }}
                      value={navForm.title}
                      onChange={(e) => {
                        setNavForm({ ...navForm, title: e.target.value });
                        if (formErrors.title) {
                          setFormErrors(prev => ({ ...prev, title: null }));
                        }
                      }}
                    />
                    {formErrors.title && <div className="invalid-feedback d-block">{formErrors.title}</div>}
                  </div>

                  {/* Link URL */}
                  <div className="col-12">
                    <label className="form-label text-light fw-semibold">Navigation URL *</label>
                    <input
                      type="url"
                      className={`form-control rounded-3 px-4 py-3 ${formErrors.url ? 'is-invalid' : ''}`}
                      placeholder="https://example.com or /page-name"
                      style={{
                        backgroundColor: "#495057",
                        border: formErrors.url ? "2px solid #dc3545" : "2px solid transparent",
                        color: "#fff",
                        fontSize: "0.95rem"
                      }}
                      value={navForm.url}
                      onChange={(e) => {
                        setNavForm({ ...navForm, url: e.target.value });
                        if (formErrors.url) {
                          setFormErrors(prev => ({ ...prev, url: null }));
                        }
                      }}
                    />
                    {formErrors.url && <div className="invalid-feedback d-block">{formErrors.url}</div>}
                    <div className="form-text text-white small mt-2">
                      Enter full URL (https://example.com) for external links or relative path (/about) for internal pages
                    </div>
                  </div>

                  {/* Navigation Preview */}
                  {navForm.title && navForm.url && (
                    <div className="col-12">
                      <div 
                        className="alert alert-info border-0 py-3"
                        style={{ backgroundColor: 'rgba(13, 202, 240, 0.1)' }}
                      >
                        <div className="d-flex align-items-center">
                          <Menu size={16} className="me-2 text-info" />
                          <div>
                            <small className="text-info fw-semibold">Navigation Preview:</small>
                            <div className="small text-light mt-1">
                              <span className="nav-preview-item px-3 py-1 rounded bg-dark d-inline-block">
                                {navForm.title}
                              </span>
                              <span className="mx-2 text-muted">→</span>
                              <span className="text-info small">{navForm.url}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-outline-light rounded-3 px-4"
                  onClick={closeNavModal}
                  disabled={addNavLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-3 px-4 fw-semibold"
                  onClick={handleNavSubmit}
                  disabled={addNavLoading}
                  style={{
                    background: editingNavLink ? 
                      'linear-gradient(45deg, #ffc107, #ffdb4d)' : 
                      'linear-gradient(45deg, #007bff, #0056b3)',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(0,123,255,0.3)'
                  }}
                >
                  {addNavLoading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      {editingNavLink ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <Save size={16} className="me-2" />
                      {editingNavLink ? 'Update Link' : 'Add Link'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && linkToDelete && (
        <div 
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDeleteModal();
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div 
              className="modal-content border-0 shadow-lg"
              style={{ backgroundColor: '#2c3e50' }}
            >
              <div className="modal-header border-0 pb-2">
                <div className="d-flex align-items-center">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#dc3545',
                      color: '#fff'
                    }}
                  >
                    <AlertTriangle size={18} />
                  </div>
                  <h5 className="modal-title mb-0 fw-bold text-white">
                    Delete Navigation Link
                  </h5>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={closeDeleteModal}
                ></button>
              </div>

              <div className="modal-body px-4 py-3">
                <div className="text-center mb-3">
                  <div 
                    className="rounded-3 mx-auto mb-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: '80px',
                      height: '80px',
                      backgroundColor: '#495057',
                      border: '3px solid #6c757d'
                    }}
                  >
                    <Menu size={32} color="#adb5bd" />
                  </div>
                  <h6 className="text-white fw-bold mb-2">{linkToDelete.title}</h6>
                  <p className="text-muted mb-1 small" style={{ wordBreak: 'break-all' }}>
                    {linkToDelete.url}
                  </p>
                  <p className="text-white mb-3" style={{ fontSize: '0.9rem' }}>
                    Are you sure you want to delete this navigation link? This action cannot be undone.
                  </p>
                  <div 
                    className="alert alert-danger border-0 py-2"
                    style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)' }}
                  >
                    <small className="text-danger">
                      <AlertTriangle size={14} className="me-1" />
                      This will permanently remove the link from your main navigation menu.
                    </small>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-outline-light rounded-3 px-4"
                  onClick={closeDeleteModal}
                  disabled={deleteNavLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-3 px-4 fw-semibold"
                  onClick={handleDeleteConfirm}
                  disabled={deleteNavLoading}
                  style={{
                    background: 'linear-gradient(45deg, #dc3545, #c82333)',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)'
                  }}
                >
                  {deleteNavLoading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="me-2" />
                      Delete Link
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

export default NavComponent;