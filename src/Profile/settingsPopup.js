import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../Components/ThemeContext'; 
import './settingsPopup.css';

const SettingsPopup = ({ isOpen, onClose }) => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  // Toggle dark mode and save preference in localStorage
  const handleDarkModeToggle = () => {
    toggleDarkMode(); // Toggle the dark mode state
    localStorage.setItem('darkMode', !darkMode); // Save the new dark mode state in localStorage
    document.body.classList.toggle('dark-mode', !darkMode);
  };

  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Store token from Google OAuth login if it's in the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('authToken', token);
      // Remove token from URL to keep it clean
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleDeleteAccountClick = () => {
    setShowDeleteConfirm(true); 
  };

  const handleConfirmDeleteAccount = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      await axios.delete('http://localhost:5000/api/delete-account', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Account deleted successfully.");
      localStorage.removeItem('authToken');
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage("Error deleting account. Please try again.");
    } finally {
      setShowDeleteConfirm(false); 
    }
  };

  const handleCancelDeleteAccount = () => {
    setShowDeleteConfirm(false); 
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout');
      localStorage.removeItem('authToken');
      setMessage("Logged out successfully.");
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      setMessage("Error logging out. Please try again.");
    } finally {
      setShowLogoutConfirm(false); 
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className={`settings-popup ${isOpen ? 'open' : ''} ${darkMode ? 'dark-mode' : ''}`}>
      <div className="settings-popup-content">
        <button className={`close-btn ${isOpen ? 'open' : ''} ${darkMode ? 'dark-mode' : ''}`} onClick={onClose}>X</button>
        <h2 className={darkMode ? 'dark-mode' : ''}>Settings</h2>

        <div className="settings-section">
          <div className="header">
            <img src="../IMAGES/preference.png" alt="Preferences" className="icon"/>
            <h3 className={darkMode ? 'dark-mode' : ''}>Preferences</h3>
            <img src="../IMAGES/preference-w.png" alt="Preferences" className="icon"/>
          </div>    
          <button className={`function-btn ${isOpen ? 'open' : ''} ${darkMode ? 'dark-mode' : ''}`} onClick={handleDarkModeToggle}>Dark Mode</button>
          <button className={`function-btn ${isOpen ? 'open' : ''} ${darkMode ? 'dark-mode' : ''}`}>Language</button>
        </div>

        <div className="settings-section">
          <div className="header">
            <img src="../IMAGES/notifications.png" alt="Notifications" className="icon"/>    
            <h3 className={darkMode ? 'dark-mode' : ''}>Notifications</h3>
            <img src="../IMAGES/notifications-w.png" alt="Notifications" className="icon"/>    
          </div>    
          <button className={`function-btn ${isOpen ? 'open' : ''} ${darkMode ? 'dark-mode' : ''}`}>Updates</button>
        </div>

        <div className="settings-section">
          <div className="header">
            <img src="../IMAGES/privacy.png" alt="Privacy and Security" className="icon"/>
            <h3 className={darkMode ? 'dark-mode' : ''}>Privacy and Security</h3>
            <img src="../IMAGES/privacy-w.png" alt="Privacy and Security" className="icon"/>
          </div>    
          <button className={`function-btn ${isOpen ? 'open' : ''} ${darkMode ? 'dark-mode' : ''}`}>Manage Security</button>
        </div>

        <div className="settings-section">
          <div className="header">
            <img src="../IMAGES/help.png" alt="Help" className="icon"/>
            <h3 className={darkMode ? 'dark-mode' : ''}>Help</h3>
            <img src="../IMAGES/help-w.png" alt="Help" className="icon"/>
          </div>    
          <button className={`function-btn ${isOpen ? 'open' : ''} ${darkMode ? 'dark-mode' : ''}`}>Contact support</button>
        </div>

        <div className="settings-section">
          <div className="header">
            <img src="../IMAGES/account.png" alt="Account" className="icon"/>
            <h3 className={darkMode ? 'dark-mode' : ''}>Account</h3>
            <img src="../IMAGES/account-w.png" alt="Account" className="icon"/>
          </div>    
          <button className={`function-btn ${isOpen ? 'open' : ''} ${darkMode ? 'dark-mode' : ''}`} onClick={handleDeleteAccountClick}>Delete Account</button>
          <button className={`function-btn ${isOpen ? 'open' : ''} ${darkMode ? 'dark-mode' : ''}`} onClick={handleLogoutClick}>Log Out</button>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="confirmation-popup">
          <p>Are you sure you want to log out?</p>
          <button onClick={handleConfirmLogout}>Yes</button>
          <button onClick={handleCancelLogout}>Cancel</button>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="confirmation-popup">
          <p>Are you sure you want to delete your account?</p>
          <button onClick={handleConfirmDeleteAccount}>Yes</button>
          <button onClick={handleCancelDeleteAccount}>Cancel</button>
        </div>
      )}

      {message && <div className="message-popup">{message}</div>}
    </div>
  );
};

export default SettingsPopup;