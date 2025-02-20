import { useState } from 'react';
import './login.css';
import Logo from '../assets/Logo.jpg'; // Import the background image properly
import Background from "../assets/Background.jpg"

const Login = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Form submitted:', formData);
  };

  const handleSocialLogin = (provider) => {
    // Handle social login logic here
    console.log(`Logging in with ${provider}`);
  };

  return (
    <div 
      className="login-container" 
      style={{ backgroundImage: `url(${Background})` }} // Apply background image dynamically
    >
      <img src={Logo} alt="Dressfy Logo" className="login-logo" />

      <select className="language-selector">
        <option value="en-US">English (US)</option>
        {/* Add more language options as needed */}
      </select>

      <div className="login-card">
        <div className="login-header">
          <h1>Log In</h1>
        </div>

        <div className="social-buttons">
          <button 
            className="social-button"
            onClick={() => handleSocialLogin('Google')}
          >
            <img src="/google-icon.png" alt="Google" />
            Log in with Google
          </button>
          <button 
            className="social-button"
            onClick={() => handleSocialLogin('Facebook')}
          >
            <img src="/facebook-icon.png" alt="Facebook" />
            Log in with Facebook
          </button>
        </div>

        <div className="divider">- OR -</div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              name="fullName"
              className="input-field"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              className="input-field"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="login-button">
            Log In
          </button>
        </form>

        <div className="signup-link">
          Don't have an account? <a href="/signup">Sign up</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
