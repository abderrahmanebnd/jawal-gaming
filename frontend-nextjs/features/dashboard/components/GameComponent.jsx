"use client"
import { useEffect, useState, useRef } from "react";
import { Edit3, Trash2, Save, Upload, X, Image as ImageIcon, Plus, GamepadIcon, AlertTriangle } from "lucide-react";
import { CONSTANTS } from "@/shared/constants";
import useApi from "@/hooks/useApi";
import { apiEndPoints } from "@/routes";
import Image from "next/image";

const GameComponent = () => {
  const [editingGame, setEditingGame] = useState(null);
  const [games, setGame] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);
  const fileInputRef = useRef(null);

  const {
    get: getGames,
    data: gameResponse,
    loading: gameLoading,
    error: gameError,
    source: gameSource,
  } = useApi();
  
  const {
    post: addGames,
    data: addGameResponse,
    loading: addGameLoading,
    error: addGameError,
    source: addGameSource,
  } = useApi();
  
  const {
    deleteApi: deleteGames,
    data: deleteGameResponse,
    loading: deleteGameLoading,
    error: deleteGameError,
    source: deleteGameSource,
  } = useApi();

  const [gameForm, setGameForm] = useState({
    title: "",
    description: "",
    url: "",
    thumbnail: null,
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const url = apiEndPoints.viewGame;
    const param = {
      pageNo: 1,
      pageSize: 150,
    };
    const headers = { "Content-Type": "application/json" };
    getGames(url, param, headers, true);
  }, [refresh]);

  useEffect(() => {
    if (gameResponse?.status === 200) {
      setGame(gameResponse.data.data);
    }
  }, [gameResponse]);

  useEffect(() => {
    return () => {
      if (gameSource) {
        gameSource.cancel("Component unmounted");
      }
    };
  }, [gameSource]);

  useEffect(() => {
    if (gameError) {
      console.error("Game fetch error:", gameError);
    }
  }, [gameError]);

  // Handle image file selection
  const handleImageChange = (file) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormErrors(prev => ({ ...prev, thumbnail: 'Please select a valid image file' }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, thumbnail: 'Image size should be less than 5MB' }));
        return;
      }

      setFormErrors(prev => ({ ...prev, thumbnail: null }));
      setGameForm(prev => ({ ...prev, thumbnail: file }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageChange(files[0]);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!gameForm.title.trim()) {
      errors.title = 'Game title is required';
    }
    
    if (!gameForm.url.trim()) {
      errors.url = 'Game URL is required';
    } else if (!/^https?:\/\/.+/.test(gameForm.url)) {
      errors.url = 'Please enter a valid URL';
    }
    
    if (!gameForm.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!editingGame && !gameForm.thumbnail) {
      errors.thumbnail = 'Game thumbnail is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

// Helper: Convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Handle game submission
const handleGameSubmit = async () => {
  if (!validateForm()) return;

  const url = apiEndPoints.addGame;
  let base64Thumbnail = "";
  if (gameForm.thumbnail instanceof File) {
    base64Thumbnail = await fileToBase64(gameForm.thumbnail);
  } else {
    base64Thumbnail = gameForm.thumbnail; 
  }

  const payload = {
    title: gameForm.title,
    description: gameForm.description,
    url: gameForm.url,
    thumbnail: base64Thumbnail,
    ...(editingGame?.id && { id: editingGame.id }),
  };

  const headers = { "Content-Type": "application/json" };
  addGames(url, JSON.stringify(payload), headers, true);
};


  useEffect(() => {
    if (addGameResponse?.status === 200) {
      setRefresh(refresh + 1);
      closeGameModal();
    }
  }, [addGameResponse]);

  useEffect(() => {
    return () => {
      if (addGameSource) {
        addGameSource.cancel("Component unmounted");
      }
    };
  }, [addGameSource]);

  useEffect(() => {
    if (addGameError) {
      console.error("Add game error:", addGameError);
    }
  }, [addGameError]);

  // Delete game
  const handleDeleteConfirm = () => {
    if (gameToDelete) {
      const url = apiEndPoints.deleteGame;
      const queryParams = { id: gameToDelete.id || gameToDelete._id };
      const headers = { "Content-Type": "application/json" };
      deleteGames(url, queryParams, headers, true);
    }
  };

  useEffect(() => {
    if (deleteGameResponse?.status === 200) {
      setRefresh(refresh + 1);
      closeDeleteModal();
    }
  }, [deleteGameResponse]);

  useEffect(() => {
    return () => {
      if (deleteGameSource) {
        deleteGameSource.cancel("Component unmounted");
      }
    };
  }, [deleteGameSource]);

  useEffect(() => {
    if (deleteGameError) {
      console.error("Delete game error:", deleteGameError);
    }
  }, [deleteGameError]);

  // Modal handlers
  const openAddGameModal = () => {
    setEditingGame(null);
    resetForm();
    setShowGameModal(true);
  };

  const openEditGameModal = (game) => {
    setEditingGame(game);
    setGameForm({
      title: game.title,
      description: game.description,
      url: game.url,
      thumbnail: null,
    });
    setImagePreview(game.thumbnail);
    setFormErrors({});
    setShowGameModal(true);
  };

  const closeGameModal = () => {
    setShowGameModal(false);
    setTimeout(() => {
      resetForm();
    }, 300);
  };

  const openDeleteModal = (game) => {
    setGameToDelete(game);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setGameToDelete(null);
  };

  const resetForm = () => {
    setEditingGame(null);
    setGameForm({
      title: "",
      description: "",
      url: "",
      thumbnail: null,
    });
    setImagePreview(null);
    setFormErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    setGameForm(prev => ({ ...prev, thumbnail: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between ">

            <div className="d-flex align-items-center d-none d-md-block">
              <GamepadIcon size={32} color={CONSTANTS.COLORS.primary} className="me-3" />
              <div>
                <h3 className="mb-0 fw-bold" style={{ color: document.body.getAttribute("data-theme") === "light" ? "#000000ff" : "#e7e8e6"  }}>
                  Game Management
                </h3>
                <p className="mb-0 " style={{ color: document.body.getAttribute("data-theme") === "light" ? "#000000ff" : "#e7e8e6"  }}>Add and manage your game collection</p>
              </div>
            </div>
        
            <button
              className="btn btn-primary rounded-3 px-4 py-2 fw-semibold "
              onClick={openAddGameModal}
              style={{
                background: 'linear-gradient(45deg, #007bff, #0056b3)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(0,123,255,0.3)'
              }}
            >
              <Plus size={18} className="me-2" />
              Add New Game
            </button>


          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="mb-0 mt-md-4">
              <p className="mb-0 fw-bold" style={{ color:document.body.getAttribute("data-theme") === "light" ? "#000000ff" : "#e7e8e6" }}>
                Your Games ({games.length})
              </p>
              <p className="mb-0" style={{ color:document.body.getAttribute("data-theme") === "light" ? "#000000ff" : "#e7e8e6" }}>Manage your game collection</p>
            </div>
            {gameLoading && (
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            )}
          </div>

          {games.length === 0 && !gameLoading ? (
            <div className="text-center py-5">
              <GamepadIcon size={64} color="#6c757d" className="mb-3" />
              <h5 className="text-muted">No games yet</h5>
              <p className="text-muted">Add your first game by clicking the button above</p>
              <button 
                className="btn btn-primary rounded-3 px-4 py-2 mt-3"
                onClick={openAddGameModal}
              >
                <Plus size={16} className="me-2" />
                Add First Game
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {games?.map((game) => (
                <div key={game.id || game._id} className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
                  <div
                    className="card border-0 shadow-lg rounded-3 h-100 game-card-admin"
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
                    <div className="position-relative">
                      <Image
                        src={game.thumbnail || '/placeholder-game.jpg'}
                        alt={game.title}
                        className="card-img-top rounded-0 pt-1"
                        style={{ 
                      
                          transition: "transform 0.3s ease"
                        }}
                        height="180px"
                        objectFit="cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDIwMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTgwIiBmaWxsPSIjNDk1MDU3Ii8+CjxwYXRoIGQ9Ik04MCA3MEgxMjBWMTEwSDgwVjcwWiIgZmlsbD0iIzZjNzU3ZCIvPgo8L3N2Zz4K';
                        }}
                      />
                      <div 
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center opacity-0"
                        style={{
                          background: 'rgba(0,0,0,0.7)',
                          transition: 'opacity 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                      >
                        <ImageIcon size={32} color="#fff" />
                      </div>
                    </div>
                    
                    <div className="card-body p-3 d-flex flex-column">
                      <h6
                        className="card-title fw-bold mb-2"
                        style={{ 
                          color: CONSTANTS.COLORS.text,
                          fontSize: "0.95rem",
                          lineHeight: "1.3",
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                        title={game.title}
                      >
                        {game.title}
                      </h6>
                      
                      <p
                        className="card-text small mb-3 flex-grow-1"
                        style={{ 
                          color: "#adb5bd",
                          fontSize: "0.8rem",
                          lineHeight: "1.4",
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                        title={game.description}
                      >
                        {game.description}
                      </p>
                      
                      <div className="d-flex gap-2 mt-auto">
                        <button
                          className="btn btn-outline-warning btn-sm rounded-pill flex-fill"
                          onClick={() => openEditGameModal(game)}
                          style={{ fontSize: "0.75rem" }}
                        >
                          <Edit3 size={12} className="me-1" />
                          Edit
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm rounded-pill flex-fill"
                          onClick={() => openDeleteModal(game)}
                          style={{ fontSize: "0.75rem" }}
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

      {/* Add/Edit Game Modal */}
      {showGameModal && (
        <div 
          className="modal fade show d-block"
          style={{ backgroundColor:  'rgba(127, 124, 124, 0.77)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeGameModal();
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div 
              className="modal-content border-0 shadow-lg"
              style={{ backgroundColor: '#2c3e50' }}
            >
              <div 
                className="modal-header border-0 pb-0"
                style={{ borderBottom: '1px solid #495057' }}
              >
                <div className="d-flex align-items-center">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: editingGame ? '#ffc107' : CONSTANTS.COLORS.primary,
                      color: '#fff'
                    }}
                  >
                    {editingGame ? <Edit3 size={18} /> : <Plus size={18} />}
                  </div>
                  <div>
                    <h5 className="modal-title mb-0 fw-bold text-white">
                      {editingGame ? "Edit Game" : "Add New Game"}
                    </h5>
                    <p className="mb-0 small text-white">
                      {editingGame ? "Update game information" : "Fill in the details to add a new game"}
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={closeGameModal}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-4">
                  {/* Game Title */}
                  <div className="col-md-6">
                    <label className="form-label text-light fw-semibold">Game Title *</label>
                    <input
                      type="text"
                      className={`form-control rounded-3 px-4 py-3 ${formErrors.title ? 'is-invalid' : ''}`}
                      placeholder="Enter game title"
                      style={{
                        backgroundColor: "#495057",
                        border: formErrors.title ? "2px solid #dc3545" : "2px solid transparent",
                        color: "#fff",
                        fontSize: "0.95rem"
                      }}
                      value={gameForm.title}
                      onChange={(e) => {
                        setGameForm({ ...gameForm, title: e.target.value });
                        if (formErrors.title) {
                          setFormErrors(prev => ({ ...prev, title: null }));
                        }
                      }}
                    />
                    {formErrors.title && <div className="invalid-feedback d-block">{formErrors.title}</div>}
                  </div>

                  {/* Game URL */}
                  <div className="col-md-6">
                    <label className="form-label text-light fw-semibold">Game URL *</label>
                    <input
                      type="url"
                      className={`form-control rounded-3 px-4 py-3 ${formErrors.url ? 'is-invalid' : ''}`}
                      placeholder="https://example.com/game"
                      style={{
                        backgroundColor: "#495057",
                        border: formErrors.url ? "2px solid #dc3545" : "2px solid transparent",
                        color: "#fff",
                        fontSize: "0.95rem"
                      }}
                      value={gameForm.url}
                      onChange={(e) => {
                        setGameForm({ ...gameForm, url: e.target.value });
                        if (formErrors.url) {
                          setFormErrors(prev => ({ ...prev, url: null }));
                        }
                      }}
                    />
                    {formErrors.url && <div className="invalid-feedback d-block">{formErrors.url}</div>}
                  </div>

                  {/* Game Description */}
                  <div className="col-12">
                    <label className="form-label text-light fw-semibold">Description *</label>
                    <textarea
                      className={`form-control rounded-3 px-4 py-3 ${formErrors.description ? 'is-invalid' : ''}`}
                      placeholder="Enter game description"
                      rows="3"
                      style={{
                        backgroundColor: "#495057",
                        border: formErrors.description ? "2px solid #dc3545" : "2px solid transparent",
                        color: "#fff",
                        fontSize: "0.95rem",
                        resize: "vertical"
                      }}
                      value={gameForm.description}
                      onChange={(e) => {
                        setGameForm({ ...gameForm, description: e.target.value });
                        if (formErrors.description) {
                          setFormErrors(prev => ({ ...prev, description: null }));
                        }
                      }}
                    />
                    {formErrors.description && <div className="invalid-feedback d-block">{formErrors.description}</div>}
                  </div>

                  {/* Image Upload */}
                  <div className="col-12">
                    <label className="form-label text-light fw-semibold">
                      Game Thumbnail {!editingGame && '*'}
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-3 p-4 text-center position-relative ${
                        isDragOver ? 'border-primary bg-primary bg-opacity-10' : 
                        formErrors.thumbnail ? 'border-danger' : 'border-secondary'
                      }`}
                      style={{
                        backgroundColor: isDragOver ? 'rgba(13, 110, 253, 0.1)' : '#495057',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={(e) => handleImageChange(e.target.files[0])}
                      />
                      
                      {!imagePreview ? (
                        <div>
                          <Upload size={40} color="#6c757d" className="mb-3" />
                          <p className="mb-2 text-light">
                            <strong>Click to upload</strong> or drag and drop
                          </p>
                          <p className="mb-0 text-white small">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      ) : (
                        <div className="position-relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="img-fluid rounded-2"
                            style={{ maxHeight: '200px', objectFit: 'contain' }}
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-sm rounded-circle position-absolute top-0 end-0 mt-2 me-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage();
                            }}
                            style={{ transform: 'translate(50%, -50%)' }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    {formErrors.thumbnail && <div className="text-danger small mt-2">{formErrors.thumbnail}</div>}
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-outline-light rounded-3 px-4"
                  onClick={closeGameModal}
                  disabled={addGameLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary rounded-3 px-4 fw-semibold"
                  onClick={handleGameSubmit}
                  disabled={addGameLoading}
                  style={{
                    background: editingGame ? 
                      'linear-gradient(45deg, #ffc107, #ffdb4d)' : 
                      'linear-gradient(45deg, #007bff, #0056b3)',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(0,123,255,0.3)'
                  }}
                >
                  {addGameLoading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      {editingGame ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <Save size={16} className="me-2" />
                      {editingGame ? 'Update Game' : 'Add Game'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && gameToDelete && (
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
                    Delete Game
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
                  {gameToDelete.thumbnail && (
                    <img
                      src={gameToDelete.thumbnail}
                      alt={gameToDelete.title}
                      className="rounded-3 mb-3"
                      style={{ 
                        width: '120px', 
                        height: '120px', 
                        objectFit: 'cover',
                        border: '3px solid #495057'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <h6 className="text-white fw-bold mb-2">{gameToDelete.title}</h6>
                  <p className="text-white mb-3" style={{ fontSize: '0.9rem' }}>
                    Are you sure you want to delete this game? This action cannot be undone.
                  </p>
                  <div 
                    className="alert alert-danger border-0 py-2"
                    style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)' }}
                  >
                    <small className="text-danger">
                      <AlertTriangle size={14} className="me-1 mb-1 me-3" />
                      This will permanently remove the game from your collection.
                    </small>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-outline-light rounded-3 px-4"
                  onClick={closeDeleteModal}
                  disabled={deleteGameLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-3 px-4 fw-semibold"
                  onClick={handleDeleteConfirm}
                  disabled={deleteGameLoading}
                  style={{
                    background: 'linear-gradient(45deg, #dc3545, #c82333)',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)'
                  }}
                >
                  {deleteGameLoading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="me-2" />
                      Delete Game
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

export default GameComponent;