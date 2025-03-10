import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './settingsPopup.css';

const SettingsPopup = ({ isOpen, onClose }) => {
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
    <div className={`settings-popup ${isOpen ? 'open' : ''}`}>
      <div className="settings-popup-content">
        <button className="close-btn" onClick={onClose}>X</button>
        <h2>Settings</h2>

        <div className="settings-section">
          <div className="header">
            <img src="../IMAGES/preferance.png" alt="Preferences" className="icon"/>
            <h3>Preferences</h3>
          </div>    
          <button className="function-btn">Dark Mode</button>
          <button className="function-btn">Language</button>
        </div>

        <div className="settings-section">
          <div className="header">
            <img src="../IMAGES/notifications.png" alt="Notifications" className="icon"/>    
            <h3>Notifications</h3>
          </div>    
          <button className="function-btn">Updates</button>
        </div>

        <div className="settings-section">
          <div className="header">
            <img src="../IMAGES/privacy.png" alt="Privacy and Security" className="icon"/>
            <h3>Privacy and Security</h3>
          </div>    
          <button className="function-btn">Manage Security</button>
        </div>

        <div className="settings-section">
          <div className="header">
            <img src="../IMAGES/help.png" alt="Help" className="icon"/>
            <h3>Help</h3>
          </div>    
          <button className="function-btn">Contact support</button>
        </div>

        <div className="settings-section">
          <div className="header">
            <img src="../IMAGES/account.png" alt="Account" className="icon"/>
            <h3>Account</h3>
          </div>    
          <button className="function-btn" onClick={handleDeleteAccountClick}>Delete Account</button>
          <button className="function-btn" onClick={handleLogoutClick}>Log Out</button>
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