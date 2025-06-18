import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email, address, role }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store authentication data in localStorage
        localStorage.setItem('token', data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        localStorage.setItem('user', JSON.stringify({
          username: data.username,
          role: data.role,
          isAuthenticated: true
        }));
        
        setIsSuccess(true);
        
        // Show success animation before redirect
        setTimeout(() => {
          if (data.role === 'Admin') {
            localStorage.setItem("role", "admin");
            navigate('/admin/dashboard');
            
          } else if (data.role === 'Fleet Manager') {
            localStorage.setItem("role", "fleet");
            navigate('/fleet/dashboard');
            
          }
        }, 1800);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Unable to connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Input focus animation handler
  const handleFocus = (e) => {
    e.target.style.boxShadow = '0 0 0 2px rgba(212, 175, 55, 0.5)';
    e.target.style.borderColor = '#D4AF37';
  };

  const handleBlur = (e) => {
    e.target.style.boxShadow = 'none';
    e.target.style.borderColor = '#333';
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.authContainer}>
        <div style={styles.logo}>LUXE<span style={{color: '#D4AF37'}}>DRIVE</span></div>
        
        <form onSubmit={handleSubmit} style={styles.formCard}>
          <h2 style={styles.heading}>JOIN THE FLEET</h2>
          
          {error && <div style={styles.error}>{error}</div>}
          
          {isSuccess ? (
            <div style={styles.successContainer}>
              <div style={styles.checkmark}>✓</div>
              <p style={styles.successText}>ACCESS GRANTED</p>
            </div>
          ) : (
            <>
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={styles.input}
                  placeholder="Username"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div style={styles.inputGroup}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={styles.input}
                  placeholder="Password"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div style={styles.inputGroup}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={styles.input}
                  placeholder="Email Address"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div style={styles.inputGroup}>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={styles.textarea}
                  placeholder="Full Address"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div style={styles.selectContainer}>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={styles.select}
                  required
                  disabled={isLoading}
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="Fleet Manager">Fleet Manager</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                style={isLoading ? {...styles.signupButton, ...styles.loadingButton} : styles.signupButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span style={styles.loadingAnimation}>
                    <span style={styles.loadingDot}>.</span>
                    <span style={{...styles.loadingDot, animationDelay: '0.2s'}}>.</span>
                    <span style={{...styles.loadingDot, animationDelay: '0.4s'}}>.</span>
                  </span>
                ) : (
                  'REQUEST ACCESS'
                )}
              </button>
            </>
          )}
          
          {!isSuccess && (
            <div style={styles.footer}>
              <span style={styles.footerText}>Already have access?</span>
              <button 
                style={styles.loginLink}
                onClick={() => navigate('/')}
                disabled={isLoading}
              >
                ENTER GARAGE
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url("https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    fontFamily: '"Barlow", sans-serif',
    color: '#fff',
    animation: 'fadeIn 0.6s ease-out',
  },
  authContainer: {
    width: '100%',
    maxWidth: '420px',
    textAlign: 'center',
  },
  logo: {
    fontSize: '28px',
    fontWeight: '700',
    letterSpacing: '2px',
    marginBottom: '40px',
    color: '#fff',
    animation: 'slideDown 0.5s ease-out',
  },
  formCard: {
    background: 'rgba(20, 20, 20, 0.9)',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(212, 175, 55, 0.1)',
    animation: 'fadeInUp 0.6s ease-out',
  },
  heading: {
    fontSize: '18px',
    fontWeight: '500',
    marginBottom: '25px',
    letterSpacing: '1px',
    color: '#D4AF37',
  },
  inputGroup: {
    marginBottom: '20px',
    animation: 'fadeIn 0.5s ease-out',
  },
  input: {
    width: '100%',
    padding: '14px',
    background: 'rgba(30, 30, 30, 0.8)',
    border: '1px solid #333',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  textarea: {
    width: '100%',
    padding: '14px',
    background: 'rgba(30, 30, 30, 0.8)',
    border: '1px solid #333',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    minHeight: '80px',
    resize: 'vertical',
    transition: 'all 0.3s ease',
  },
  selectContainer: {
    marginBottom: '25px',
  },
  select: {
    width: '100%',
    padding: '14px',
    background: 'rgba(30, 30, 30, 0.8)',
    border: '1px solid #333',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  signupButton: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
    border: 'none',
    borderRadius: '6px',
    color: '#111',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginBottom: '20px',
    letterSpacing: '1px',
    position: 'relative',
    overflow: 'hidden',
    ':hover': {
      boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)',
      transform: 'translateY(-1px)',
    },
    ':active': {
      transform: 'translateY(1px)',
    },
  },
  loadingButton: {
    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.8), rgba(184, 134, 11, 0.8))',
  },
  loadingAnimation: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  loadingDot: {
    fontSize: '24px',
    animation: 'bounce 1s infinite ease-in-out',
    opacity: 0.6,
  },
  error: {
    color: '#ff6b6b',
    fontSize: '13px',
    marginBottom: '15px',
    textAlign: 'center',
    animation: 'shake 0.5s ease-in-out',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
  },
  footerText: {
    color: '#777',
  },
  loginLink: {
    background: 'none',
    border: 'none',
    color: '#D4AF37',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'underline',
    letterSpacing: '0.5px',
    transition: 'all 0.2s',
    ':hover': {
      color: '#B8860B',
    },
  },
  successContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    animation: 'zoomIn 0.5s ease-out',
  },
  checkmark: {
    fontSize: '60px',
    color: '#D4AF37',
    fontWeight: 'bold',
    marginBottom: '20px',
    animation: 'checkmarkScale 0.5s ease-out',
  },
  successText: {
    color: '#D4AF37',
    fontSize: '18px',
    letterSpacing: '1px',
  },
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  '@keyframes fadeInUp': {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  '@keyframes slideDown': {
    from: { opacity: 0, transform: 'translateY(-30px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  '@keyframes bounce': {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-5px)' },
  },
  '@keyframes shake': {
    '0%, 100%': { transform: 'translateX(0)' },
    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
    '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
  },
  '@keyframes zoomIn': {
    from: { transform: 'scale(0.8)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
  '@keyframes checkmarkScale': {
    '0%': { transform: 'scale(0)' },
    '50%': { transform: 'scale(1.2)' },
    '100%': { transform: 'scale(1)' },
  },
};

export default SignupPage;