import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from 'axios';
import "./login.css";

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [language, setLanguage] = useState('en');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const togglePassword = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      if (response.data.success) {
        // Store the token in localStorage
        localStorage.setItem('authToken', response.data.token);

        // Redirect the user to the home page
        navigate("/home");
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Invalid credentials');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(formData.email, formData.password);
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <div className="container">
      <div className="login-box">
        <h2>Log In</h2>
        <div className="language-dropdown">
          <select value={language} onChange={handleLanguageChange}>
            <option value="en">English</option>
            <option value="si">Sinhala</option>
            <option value="ta">Tamil</option>
          </select>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="social-login">
            <button type="button" className="google-btn" onClick={handleGoogleLogin}>
              <img src="/IMAGES/google.png" alt="Google" className="social-icon" />Log in with Google
            </button>
          </div>
          <p className="or-divider">- OR -</p>

          <div className="input-field">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-field">
            <input
              type={passwordVisible ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span className="toggle-password" onClick={togglePassword}></span>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn">Log In</button>
        </form>
        <p className="link">
          Don’t have an account? <Link to="/">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;