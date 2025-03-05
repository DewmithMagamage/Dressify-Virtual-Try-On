import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./login.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [language, setLanguage] = useState('en');
  const navigate = useNavigate();

  const togglePassword = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPassword = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <div className="container">
      <div className="login-box">
        <h2>Create Account</h2>
        <div className="language-dropdown">
          <select value={language} onChange={handleLanguageChange}>
            <option value="en">English</option>
            <option value="si">Sinhala</option>
            <option value="ta">Tamil</option>
          </select>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="social-login">
          <button className="google-btn">
            <img src="/IMAGES/google.png" alt="Google" className="social-icon" />Log in with Google
          </button>
          </div>
          <p className="or-divider">- OR -</p>

          <div className="input-field">
            <input type="text" placeholder="Full Name" required />
          </div>
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
              placeholder="Password"
              required
            />
            <span className="toggle-password" onClick={togglePassword}></span>
          </div>
          <div className="input-field">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Confirm Password"
              required
            />
            <span className="toggle-password" onClick={togglePassword}></span>
          </div>
            
          <button type="submit" className="login-btn">Create Account</button>
        </form>
        <p className="link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;