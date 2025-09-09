import { useEffect, useState } from "react";
import { Edit3, Trash2, Save, Plus, Link as LinkIcon, AlertTriangle, X, ExternalLink } from "lucide-react";
import { CONSTANTS } from "../../../shared/constants";
import useApi from "../../../hooks/useApi";
import { apiEndPoints } from "../../../api/api";

const FooterComponent = () => {
  const [editingFooterLink, setEditingFooterLink] = useState(null);
  const [footerLinks, setFooterLinks] = useState([]);
  const [footerForm, setFooterForm] = useState({ title: "", url: "" });
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [refresh, setRefresh] = useState(0);

  const {
    get: getFooter,
    data: FooterResponse,
    loading: FooterLoading,
    error: NavError,
    source: NavSource,
  } = useApi();
  
  const {
    post: addNav,
    data: addFooterResponse,
    loading: addFooterLoading,
    error: addNavError,
    source: addNavSource,
  } = useApi();
  
  const {
    deleteApi: deleteNav,
    data: deleteFooterResponse,
    loading: deleteFooterLoading,
    error: deleteNavError,
    source: deleteNavSource,
  } = useApi();

  useEffect(() => {
    const url = apiEndPoints.viewFooter;
    const param = {
      pageNo: 1,
      pageSize: 50,
    };
    const headers = { "Content-Type": "application/json" };
    getFooter(url, param, headers, true);
  }, [refresh]);

  useEffect(() => {
    if (FooterResponse?.status === 200) {
      setFooterLinks(FooterResponse.data.data);
    }
  }, [FooterResponse]);

  useEffect(() => {
    return () => {
      if (NavSource) {
        NavSource.cancel("Component unmounted");
      }
    };
  }, [NavSource]);

  useEffect(() => {
    if (NavError) {
      console.error("Footer fetch error:", NavError);
    }
  }, [NavError]);

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!footerForm.title.trim()) {
      errors.title = 'Link title is required';
    }
    
  if (!footerForm.url.trim()) {
      errors.url = 'Footer URL is required';
    } else if (!/^https?:\/\/.+/.test(footerForm.url) && !/^\/.+/.test(footerForm.url)) {
      errors.url = 'Please enter a valid URL (starting with http://, https://, or /)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle footer link submission
  const handleFooterSubmit = () => {
    if (!validateForm()) return;

    const url = apiEndPoints.addFooter;
    const body = {
      title: footerForm.title,
      url: footerForm.url,
    };

    if (editingFooterLink?.id) {
      body.id = editingFooterLink.id;
    }

    const headers = { "Content-Type": "application/json" };
    addNav(url, body, headers, true);
  };

  useEffect(() => {
    if (addFooterResponse?.status === 200) {
      setRefresh(refresh + 1);
      closeLinkModal();
    }
  }, [addFooterResponse]);

  useEffect(() => {
    return () => {
      if (addNavSource) {
        addNavSource.cancel("Component unmounted");
      }
    };
  }, [addNavSource]);

  useEffect(() => {
    if (addNavError) {
      console.error("Add footer error:", addNavError);
    }
  }, [addNavError]);

  // Delete footer link
  const handleDeleteConfirm = () => {
    if (linkToDelete) {
      const url = apiEndPoints.deleteFooter;
      const queryParams = { id: linkToDelete.id };
      const headers = { "Content-Type": "application/json" };
      deleteNav(url, queryParams, headers, true);
    }
  };

  useEffect(() => {
    if (deleteFooterResponse?.status === 200) {
      setRefresh(refresh + 1);
      closeDeleteModal();
    }
  }, [deleteFooterResponse]);

  useEffect(() => {
    return () => {
      if (deleteNavSource) {
        deleteNavSource.cancel("Component unmounted");
      }
    };
  }, [deleteNavSource]);

  useEffect(() => {
    if (deleteNavError) {
      console.error("Delete footer error:", deleteNavError);
    }
  }, [deleteNavError]);

  // Modal handlers
  const openAddLinkModal = () => {
    setEditingFooterLink(null);
    resetForm();
    setShowLinkModal(true);
  };

  const openEditLinkModal = (link) => {
    setEditingFooterLink(link);
    setFooterForm({
      title: link.title,
      url: link.url,
    });
    setFormErrors({});
    setShowLinkModal(true);
  };

  const closeLinkModal = () => {
    setShowLinkModal(false);
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
    setEditingFooterLink(null);
    setFooterForm({ title: "", url: "" });
    setFormErrors({});
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center d-none d-md-block">
              <LinkIcon size={28} color={CONSTANTS.COLORS.primary} className="me-3" />
              <div>
                <h3 className="mb-0 fw-bold" style={{ color:document.body.getAttribute("data-theme") === "light" ? "#000000ff" : "#e7e8e6" }}>
                  Footer Links Management
                </h3>
                <p className="mb-0" style={{ color:document.body.getAttribute("data-theme") === "light" ? "#000000ff" : "#e7e8e6" }}>Manage footer navigation links</p>
              </div>
            </div>
            <button
              className="btn btn-primary rounded-3 px-4 py-2 fw-semibold"
              onClick={openAddLinkModal}
              style={{
                background: 'linear-gradient(45deg, #007bff, #0056b3)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(0,123,255,0.3)'
              }}
            >
              <Plus size={18} className="me-2" />
              Add Footer Link
            </button>
          </div>
        </div>
      </div>

      {/* Footer Links Grid */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="mt-4">
              <p className="mb-0 fw-bold" style={{ color:document.body.getAttribute("data-theme") === "light" ? "#000000ff" : "#e7e8e6" }}>
                Footer Links ({footerLinks.length})
              </p>
              <p className="mb-0" style={{ color:document.body.getAttribute("data-theme") === "light" ? "#000000ff" : "#e7e8e6" }}>Configure your website footer navigation</p>
            </div>
            {FooterLoading && (
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            )}
          </div>

          {footerLinks.length === 0 && !FooterLoading ? (
            <div className="text-center py-5">
              <LinkIcon size={64} color="#6c757d" className="mb-3" />
              <h5 className="text-muted">No footer links yet</h5>
              <p className="text-muted">Add your first footer link by clicking the button above</p>
              <button 
                className="btn btn-primary rounded-3 px-4 py-2 mt-3"
                onClick={openAddLinkModal}
              >
                <Plus size={16} className="me-2" />
                Add First Link
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {footerLinks?.map((link) => (
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
                          className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                          style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: CONSTANTS.COLORS.primary,
                            color: '#fff'
                          }}
                        >
                          <ExternalLink size={18} />
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
                          onClick={() => openEditLinkModal(link)}
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

      {/* Add/Edit Link Modal */}
      {showLinkModal && (
        <div 
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLinkModal();
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
                      backgroundColor: editingFooterLink ? '#ffc107' : CONSTANTS.COLORS.primary,
                      color: '#fff'
                    }}
                  >
                    {editingFooterLink ? <Edit3 size={18} /> : <Plus size={18} />}
                  </div>
                  <div>
                    <h5 className="modal-title mb-0 fw-bold text-white">
                      {editingFooterLink ? "Edit Footer Link" : "Add Footer Link"}
                    </h5>
                    <p className="mb-0 small text-white">
                      {editingFooterLink ? "Update link information" : "Add a new footer navigation link"}
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={closeLinkModal}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-4">
                  {/* Link Title */}
                  <div className="col-12">
                    <label className="form-label text-light fw-semibold">Link Title *</label>
                    <input
                      type="text"
                      className={`form-control rounded-3 px-4 py-3 ${formErrors.title ? 'is-invalid' : ''}`}
                      placeholder="e.g., About Us, Contact, Privacy Policy"
                      style={{
                        backgroundColor: "#495057",
                        border: formErrors.title ? "2px solid #dc3545" : "2px solid transparent",
                        color: "#fff",
                        fontSize: "0.95rem"
                      }}
                      value={footerForm.title}
                      onChange={(e) => {
                        setFooterForm({ ...footerForm, title: e.target.value });
                        if (formErrors.title) {
                          setFormErrors(prev => ({ ...prev, title: null }));
                        }
                      }}
                    />
                    {formErrors.title && <div className="invalid-feedback d-block">{formErrors.title}</div>}
                  </div>

                  {/* Link URL */}
                  <div className="col-12">
                    <label className="form-label text-light fw-semibold">Link URL *</label>
                    <input
                      type="url"
                      className={`form-control rounded-3 px-4 py-3 ${formErrors.url ? 'is-invalid' : ''}`}
                      placeholder="https://example.com/page"
                      style={{
                        backgroundColor: "#495057",
                        border: formErrors.url ? "2px solid #dc3545" : "2px solid transparent",
                        color: "#fff",
                        fontSize: "0.95rem"
                      }}
                      value={footerForm.url}
                      onChange={(e) => {
                        setFooterForm({ ...footerForm, url: e.target.value });
                        if (formErrors.url) {
                          setFormErrors(prev => ({ ...prev, url: null }));
                        }
                      }}
                    />
                    {formErrors.url && <div className="invalid-feedback d-block">{formErrors.url}</div>}
                    <div className="form-text text-white small mt-2">
                      Make sure to include http:// or https:// in your URL
                    </div>
                  </div>

                  {/* URL Preview */}
                  {footerForm.url && /^https?:\/\/.+/.test(footerForm.url) && (
                    <div className="col-12">
                      <div 
                        className="alert alert-info border-0 py-3"
                        style={{ backgroundColor: 'rgba(13, 202, 240, 0.1)' }}
                      >
                        <div className="d-flex align-items-center">
                          <ExternalLink size={16} className="me-2 text-info" />
                          <div>
                            <small className="text-info fw-semibold">Link Preview:</small>
                            <div className="small text-light mt-1">
                              {footerForm.title || 'Link Title'} → {footerForm.url}
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
                  onClick={closeLinkModal}
                  disabled={addFooterLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-3 px-4 fw-semibold"
                  onClick={handleFooterSubmit}
                  disabled={addFooterLoading}
                  style={{
                    background: editingFooterLink ? 
                      'linear-gradient(45deg, #ffc107, #ffdb4d)' : 
                      'linear-gradient(45deg, #007bff, #0056b3)',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(0,123,255,0.3)'
                  }}
                >
                  {addFooterLoading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      {editingFooterLink ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <Save size={16} className="me-2" />
                      {editingFooterLink ? 'Update Link' : 'Add Link'}
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
                    Delete Footer Link
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
                    <ExternalLink size={32} color="#adb5bd" />
                  </div>
                  <h6 className="text-white fw-bold mb-2">{linkToDelete.title}</h6>
                  <p className="text-white mb-1 small" style={{ wordBreak: 'break-all' }}>
                    {linkToDelete.url}
                  </p>
                  <p className="text-white mb-3" style={{ fontSize: '0.9rem' }}>
                    Are you sure you want to delete this footer link? This action cannot be undone.
                  </p>
                  <div 
                    className="alert alert-danger border-0 py-2"
                    style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)' }}
                  >
                    <small className="text-danger">
                      <AlertTriangle size={14} className="me-1" />
                      This will permanently remove the link from your footer navigation.
                    </small>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-outline-light rounded-3 px-4"
                  onClick={closeDeleteModal}
                  disabled={deleteFooterLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-3 px-4 fw-semibold"
                  onClick={handleDeleteConfirm}
                  disabled={deleteFooterLoading}
                  style={{
                    background: 'linear-gradient(45deg, #dc3545, #c82333)',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)'
                  }}
                >
                  {deleteFooterLoading ? (
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

export default FooterComponent;