import { useEffect, useState } from 'react';
import { CONSTANTS } from '../../shared/constants';
import useApi from '../../hooks/useApi';
import { apiEndPoints } from '../../api/api';
import { useDispatch } from "react-redux";
import { login } from '../../store/features/authSlice';
import useAuthRedirect from '../../hooks/useAuthRedirect';
import { Shield, User, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const AdminLogin = () => {
  useAuthRedirect();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isFormTouched, setIsFormTouched] = useState({ email: false, password: false });
  const { post: signInPost, data: signInResponse, loading: signInLoading, error: signInError, source: signInSource } = useApi();
  const dispatch = useDispatch();

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!credentials.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email) && credentials.email !== 'admin') {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!credentials.password.trim()) {
      errors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    setIsFormTouched({ email: true, password: true });
    
    if (!validateForm()) return;

    const url = apiEndPoints.signIn;
    const headers = { "Content-Type": "application/json" };
    const request = {
      email: credentials.email,
      password: credentials.password
    };
    signInPost(url, request, headers, true);
  };

  const handleInputChange = (field, value) => {
    setCredentials({ ...credentials, [field]: value });
    
    // Clear errors when user starts typing
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: '' });
    }
  };

  const handleInputBlur = (field) => {
    setIsFormTouched({ ...isFormTouched, [field]: true });
    validateForm();
  };

  useEffect(() => {
    if (signInResponse?.status === 200) {
      dispatch(login(signInResponse?.data));
    }
  }, [signInResponse]);

  useEffect(() => {
    return () => {
      if (signInSource) {
        signInSource.cancel("Component unmounted");
      }
    };
  }, [signInSource]);

  useEffect(() => {
    if (signInError) {
      // toast.error(signInError);
    }
  }, [signInError]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const isDark = document.body.getAttribute("data-theme") !== "light";

  return (
    <div className=" d-flex align-items-center justify-content-center py-5" 
         style={{

           position: 'relative',
           overflow: 'hidden'
         }}>
      
      {/* Background Elements */}
      <div className="position-absolute top-0 start-0 w-100 h-100">
        <div 
          className="position-absolute"
          style={{
            top: '10%',
            left: '10%',
            width: '300px',
            height: '300px',
            background: isDark 
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }}
        />
        <div 
          className="position-absolute"
          style={{
            bottom: '10%',
            right: '10%',
            width: '400px',
            height: '400px',
            background: isDark 
              ? 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)'
          }}
        />
      </div>

      <div className="container position-relative">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5 col-xl-4">
            <div 
              className="card border-0 shadow-lg rounded-4 overflow-hidden"
              style={{ 
                backgroundColor: isDark ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'}`,
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)'
              }}
            >
              {/* Header Section */}
              <div className="card-header border-0 text-center p-4" 
                   style={{ 
                     background: isDark 
                       ? 'linear-gradient(135deg, #3182ce, #2b6cb0)' 
                       : 'linear-gradient(135deg, #667eea, #764ba2)',
                     color: '#fff'
                   }}>
                <div 
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Shield size={40} />
                </div>
                <h2 className="mb-1 fw-bold">Admin Portal</h2>
                <p className="mb-0 opacity-90">Secure access to dashboard</p>
              </div>

              <div className="card-body p-5">
                {/* Error Alert */}
                {signInError && (
                  <div className="alert alert-danger border-0 rounded-3 mb-4" 
                       style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#dc3545' }}>
                    <div className="d-flex align-items-center">
                      <AlertCircle size={18} className="me-2" />
                      <span>Invalid credentials. Please try again.</span>
                    </div>
                  </div>
                )}

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                  {/* Email Field */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold mb-2" 
                           style={{ color: isDark ? '#e2e8f0' : '#2d3748' }}>
                      Email Address
                    </label>
                    <div className="position-relative">
                      <div className="position-absolute top-50 translate-middle-y ms-3" 
                           style={{ zIndex: 5 }}>
                        <User size={18} color="#6b7280" />
                      </div>
                      <input 
                        type="text"
                        className={`form-control rounded-3 ps-5 py-3 ${
                          isFormTouched.email && formErrors.email ? 'is-invalid' : 
                          isFormTouched.email && !formErrors.email && credentials.email ? 'is-valid' : ''
                        }`}
                        placeholder="Enter your email"
                        style={{ 
                          backgroundColor: isDark ? '#4a5568' : '#f7fafc', 
                          border: `2px solid ${
                            isFormTouched.email && formErrors.email ? '#dc3545' :
                            isFormTouched.email && !formErrors.email && credentials.email ? '#28a745' :
                            isDark ? '#2d3748' : '#e2e8f0'
                          }`,
                          color: isDark ? '#fff' : '#2d3748',
                          fontSize: '0.95rem'
                        }}
                        value={credentials.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        onBlur={() => handleInputBlur('email')}
                        onKeyPress={handleKeyPress}
                        disabled={signInLoading}
                      />
                      {isFormTouched.email && !formErrors.email && credentials.email && (
                        <div className="position-absolute top-50 translate-middle-y me-3 end-0">
                          <CheckCircle size={18} color="#28a745" />
                        </div>
                      )}
                    </div>
                    {isFormTouched.email && formErrors.email && (
                      <div className="invalid-feedback d-block mt-1">
                        {formErrors.email}
                      </div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold mb-2" 
                           style={{ color: isDark ? '#e2e8f0' : '#2d3748' }}>
                      Password
                    </label>
                    <div className="position-relative">
                      <div className="position-absolute top-50 translate-middle-y ms-3" 
                           style={{ zIndex: 5 }}>
                        <Lock size={18} color="#6b7280" />
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"}
                        className={`form-control rounded-3 ps-5 pe-5 py-3 ${
                          isFormTouched.password && formErrors.password ? 'is-invalid' : 
                          isFormTouched.password && !formErrors.password && credentials.password ? 'is-valid' : ''
                        }`}
                        placeholder="Enter your password"
                        style={{ 
                          backgroundColor: isDark ? '#4a5568' : '#f7fafc', 
                          border: `2px solid ${
                            isFormTouched.password && formErrors.password ? '#dc3545' :
                            isFormTouched.password && !formErrors.password && credentials.password ? '#28a745' :
                            isDark ? '#2d3748' : '#e2e8f0'
                          }`,
                          color: isDark ? '#fff' : '#2d3748',
                          fontSize: '0.95rem'
                        }}
                        value={credentials.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        onBlur={() => handleInputBlur('password')}
                        onKeyPress={handleKeyPress}
                        disabled={signInLoading}
                      />
                      <button
                        type="button"
                        className="btn position-absolute top-50 translate-middle-y me-3 end-0 p-0 border-0 bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ zIndex: 5 }}
                        disabled={signInLoading}
                      >
                        {showPassword ? 
                          <EyeOff size={18} color="#6b7280" /> : 
                          <Eye size={18} color="#6b7280" />
                        }
                      </button>
                    </div>
                    {isFormTouched.password && formErrors.password && (
                      <div className="invalid-feedback d-block mt-1">
                        {formErrors.password}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    className="btn w-100 rounded-3 py-3 fw-bold text-white"
                    disabled={signInLoading}
                    style={{
                      background: 'linear-gradient(45deg, #3182ce, #2b6cb0)',
                      border: 'none',
                      boxShadow: '0 4px 15px rgba(49, 130, 206, 0.4)',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!signInLoading) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(49, 130, 206, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(49, 130, 206, 0.4)';
                    }}
                  >
                    {signInLoading ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Signing In...
                      </div>
                    ) : (
                      'Sign In to Dashboard'
                    )}
                  </button>
                </form>

         
              </div>

              {/* Footer */}
              <div className="card-footer border-0 text-center py-3" 
                   style={{ 
                     backgroundColor: isDark ? 'rgba(26, 32, 44, 0.5)' : 'rgba(247, 250, 252, 0.8)',
                     color: isDark ? '#a0aec0' : '#718096'
                   }}>
                <small>Secure admin access • Protected by enterprise security</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;