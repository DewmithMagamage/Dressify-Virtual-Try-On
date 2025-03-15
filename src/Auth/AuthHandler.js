import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse token from URL query params after Google OAuth redirect
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      // Store token in localStorage
      localStorage.setItem('authToken', token);
      console.log('Token stored from redirect:', token);
      
      // Navigate to home (without query params)
      navigate('/home', { replace: true });
    } else {
      // No token found, redirect to login
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="auth-loading">
      <p>Processing authentication...</p>
    </div>
  );
};

export default AuthHandler;