import React, { useState } from "react";
import "./login.css";

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePassword = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic
    console.log("Form submitted");
  };

  return (
    <div className="container">
      <div className="login-box">
        <h2>Log In</h2>
        <div className="social-login">
          <button className="google-btn">Log in with Google</button>
          <button className="facebook-btn">Log in with Facebook</button>
        </div>
        <p className="or-divider">- OR -</p>
        <form onSubmit={handleSubmit}>
          <div className="input-field">
            <input type="text" placeholder="Full Name" required />
          </div>
          <div className="input-field password-field">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Password"
              required
            />
            <span className="toggle-password" onClick={togglePassword}>
              👁️
            </span>
          </div>
          <button type="submit" className="login-btn">
            Log In
          </button>
        </form>
        <p className="signup-link">
          Don’t have an account? <a href="#">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
