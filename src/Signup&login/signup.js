import React, { useState } from "react";
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

  const togglePassword = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPassword = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>Create Account</h2>
        <div className="social-login">
          <button className="social-btn google">
            <img src="/IMAGES/google.png" alt="Google" /> Sign up with Google
          </button>
          <button className="social-btn facebook">
            <img src="/IMAGES/facebook.png" alt="Facebook" /> Sign up with Facebook
          </button>
        </div>
        <div className="divider">- OR -</div>
        <form onSubmit={handleSubmit}>
          <div className="input-field">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
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
          <div className="input-field password-field">
            <input
              type={passwordVisible ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span className="toggle-password" onClick={togglePassword}>
              👁️
            </span>
          </div>
          <div className="input-field password-field">
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <span className="toggle-password" onClick={toggleConfirmPassword}>
              👁️
            </span>
          </div>
          <button type="submit" className="submit-btn">Create Account</button>
        </form>
        <p className="login-link">Already have an account? <a href="#">Log in</a></p>
      </div>
    </div>
  );
};

export default Signup;
