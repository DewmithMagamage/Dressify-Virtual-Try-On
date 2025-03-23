import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { ThemeContext } from '../Components/ThemeContext';
import SettingsPopup from './settingsPopup';
import './profile.css';

// Simplified and improved base64 conversion function
const arrayBufferToBase64 = (buffer) => {
  // If null or undefined, return empty string
  if (!buffer) return '';
  
  // Handle string that's already base64
  if (typeof buffer === 'string') {
    return buffer;
  }
  
  try {
    // Handle Buffer object directly
    if (Buffer.isBuffer(buffer)) {
      return buffer.toString('base64');
    }
    
    // Handle ArrayBuffer
    const bytes = new Uint8Array(buffer instanceof ArrayBuffer ? buffer : buffer.buffer || buffer);
    let binary = '';
    const len = bytes.byteLength;
    
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return window.btoa(binary);
  } catch (error) {
    console.error('Error converting to base64:', error);
    return '';
  }
};

// Image Modal Component with improved base64 support
const ImageModal = ({ image, isOpen, onClose, onDelete }) => {
  if (!isOpen || !image) return null;
  
  // Create image source with simplified logic
  let imageSource = image.fileUrl;
  
  if (image.data) {
    // Simple conversion of data to image source
    imageSource = `data:image/jpeg;base64,${typeof image.data === 'string' ? image.data : arrayBufferToBase64(image.data)}`;
  }
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
        <img src={imageSource} alt="Enlarged view" className="modal-image" />
        <button className="delete-image-btn" onClick={() => onDelete(image._id)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [images, setImages] = useState({
    front: [],
    generated: [],
    garment: []
  });
  const [profile, setProfile] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // State for image modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // State for profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };
  
  // Handler for opening the image modal
  const handleImageClick = (image) => {
    setSelectedImage(image);
    setModalOpen(true);
  };
  
  // Handler for closing the image modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };
  
  // Handler for deleting an image
  const handleDeleteImage = async (imageId) => {
    if (!imageId) {
      console.error('No image ID provided for deletion');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }
    
    setDeleteLoading(true);
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.error('No token found');
      setDeleteLoading(false);
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/api/images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the images state by removing the deleted image
      setImages(prevImages => {
        return {
          front: prevImages.front.filter(img => img._id !== imageId),
          generated: prevImages.generated.filter(img => img._id !== imageId),
          garment: prevImages.garment.filter(img => img._id !== imageId)
        };
      });
      
      // Close the modal
      setModalOpen(false);
      setSelectedImage(null);
      setDeleteLoading(false);
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
      setDeleteLoading(false);
    }
  };

  // Handler for toggling edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      setEditFormData({
        fullName: profile?.fullName || '',
        email: profile?.email || ''
      });
      setIsEditing(true);
    }
    // Clear any previous errors
    setUpdateError(null);
  };

  // Handler for form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Handler for submitting profile updates
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      setUpdateError('Authentication token not found. Please log in again.');
      setUpdateLoading(false);
      return;
    }
    
    try {
      const response = await axios.put(
        'http://localhost:5000/api/profile/update', 
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the profile state with the new data
      setProfile(response.data);
      setIsEditing(false);
      setUpdateLoading(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateError(
        error.response?.data?.message || 
        'Failed to update profile. Please try again.'
      );
      setUpdateLoading(false);
    }
  };

  // Check connection to database
  const checkDatabaseConnection = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/db-status');
      console.log('Database connection status:', response.data);
      if (!response.data.connected) {
        setFetchError('Database connection issue. Please try again later.');
      }
    } catch (error) {
      console.error('Error checking database connection:', error);
    }
  };

  useEffect(() => {
    // Fetch images from the backend
    const fetchImages = async () => {
      setLoading(true);
      setFetchError(null);
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        setFetchError('Authentication error. Please login again.');
        return;
      }
  
      try {
        console.log('Fetching images...');
        
        // Request with binary data
        const response = await axios.get('http://localhost:5000/api/images?includeBinary=true', { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        
        console.log('Images response received, count:', response.data.images.length);
        
        // Check if we received binary data
        if (response.data.images.length > 0) {
          const firstImage = response.data.images[0];
          console.log('First image data type:', typeof firstImage.data);
          console.log('First image has data:', Boolean(firstImage.data));
        }
        
        // Organize images by type
        const imagesByType = {
          front: response.data.images.filter(img => img.type === 'front'),
          generated: response.data.images.filter(img => img.type === 'generated'),
          garment: response.data.images.filter(img => img.type === 'garment')
        };
        
        setImages(imagesByType);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching images:', error.response || error);
        setLoading(false);
        setFetchError('Failed to fetch images. Please check your connection and try again.');
        // Check if the database connection is the issue
        checkDatabaseConnection();
      }
    };

    // Fetch user profile from the backend
    const fetchProfile = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No token found');
        return;
      }
      
      try {
        const response = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (error) {
        console.error('There was an error fetching the profile:', error);
      }
    };

    fetchProfile();
    fetchImages();
  }, []);

  // Simplified function to get image source
  const getImageSource = (image) => {
    if (!image) return '';
    
    if (image.data) {
      // Handle string or buffer data consistently
      return `data:image/jpeg;base64,${typeof image.data === 'string' ? image.data : arrayBufferToBase64(image.data)}`;
    }
    
    return image.fileUrl;
  };

  return (
    <div className={`profile-container ${darkMode ? 'dark-mode' : ''}`}>
      <button className="back-button" onClick={() => navigate("/home")}>
        <svg className="back-arrow-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor">
            <path d="M100,15a85,85,0,1,0,85,85A84.93,84.93,0,0,0,100,15Zm0,150a65,65,0,1,1,65-65A64.87,64.87,0,0,1,100,165ZM116.5,57.5a9.67,9.67,0,0,0-14,0L74,86a19.92,19.92,0,0,0,0,28.5L102.5,143a9.9,9.9,0,0,0,14-14l-28-29L117,71.5C120.5,68,120.5,61.5,116.5,57.5Z"></path>
        </svg>
      </button> 
      
      <button className="settings-btn" onClick={handleSettingsClick}>
        <svg className="settings-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,8a4,4,0,1,0,4,4A4,4,0,0,0,12,8Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,12,14Zm8.99-5L19.415,9c-.008-.022-.036-.107-.046-.129l1.11-1.11a2.011,2.011,0,0,0,0-2.842l-1.4-1.4a2,2,0,0,0-1.421-.588h0a2,2,0,0,0-1.419.588L15.07,4.612,15,4.58V3.009A2.011,2.011,0,0,0,12.99,1H11.01A2.011,2.011,0,0,0,9,3.009L9,4.566l-.086.049-.043.016L7.765,3.522a2,2,0,0,0-1.42-.589h0a2,2,0,0,0-1.421.588l-1.4,1.4a2.011,2.011,0,0,0,0,2.842l1.1,1.143c-.013.029-.033.063-.043.093H3.01A2.011,2.011,0,0,0,1,11.009v1.982A2.011,2.011,0,0,0,3.01,15l1.575,0c.008.022.036.107.046.129l-1.11,1.11a2.011,2.011,0,0,0,0,2.842l1.4,1.4a2.059,2.059,0,0,0,2.842,0l1.115-1.115c.022.011.1.047.121.056v1.571A2.011,2.011,0,0,0,11.01,23h1.98A2.011,2.011,0,0,0,15,20.991l0-1.557.129-.065,1.109,1.109a2.058,2.058,0,0,0,2.843,0l1.4-1.4a2.011,2.011,0,0,0,0-2.842l-1.1-1.143c.013-.029.033-.063.043-.093H20.99A2.011,2.011,0,0,0,23,12.991V11.009A2.011,2.011,0,0,0,20.99,9Zm0,4H19.421a2.1,2.1,0,0,0-1.466,3.54l1.109,1.124-1.414,1.4-1.11-1.109A2.1,2.1,0,0,0,13,19.42L12.99,21,11,20.991V19.42a2.043,2.043,0,0,0-1.307-1.881,2.138,2.138,0,0,0-.816-.164,2,2,0,0,0-1.417.58L6.336,19.064l-1.4-1.414,1.108-1.108A2.1,2.1,0,0,0,4.579,13L3,12.991,3.01,11H4.579A2.1,2.1,0,0,0,6.045,7.46L4.936,6.336l1.414-1.4L7.46,6.045a2.04,2.04,0,0,0,2.227.419l.018-.007A2.04,2.04,0,0,0,11,4.58L11.01,3,13,3.009V4.58a2,2,0,0,0,1.227,1.845c.026.013.057.027.087.039a2.038,2.038,0,0,0,2.226-.419l1.124-1.109,1.4,1.414L17.956,7.458A2.1,2.1,0,0,0,19.421,11H20.99l.01.009Z"></path>
        </svg>
      </button>

      <h1>Profile</h1>
      <div className="profile-content">
        <div className={`user-details ${darkMode ? 'dark-mode' : ''}`}>
          <div className="user-details-header">
            <h2 className={darkMode ? 'dark-mode' : ''}>User Details</h2>
            <button 
              className={`edit-btn ${isEditing ? 'cancel-edit' : ''}`}
              onClick={toggleEditMode}
            >
              {isEditing ? 'X' : <img src="../IMAGES/edit.png" alt="Edit" />}
            </button>
          </div>
          
          {profile ? (
            isEditing ? (
              <form className="edit-profile-form" onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={editFormData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                {updateError && <p className="update-error">{updateError}</p>}

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="save-edits-btn"
                    disabled={updateLoading}
                  >
                    {updateLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p><strong>User Name:</strong> {profile.fullName}</p>
                <p><strong>Email:</strong> {profile.email}</p>
              </>
            )
          ) : (
            <p>Loading user details...</p>
          )}
        </div>

        {loading ? (
          <p>Loading your images...</p>
        ) : fetchError ? (
          <div className="error-message">
            <p>{fetchError}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : (
          <div className="images-history-container">
            <div className={`generated-images-section ${darkMode ? 'dark-mode' : ''}`}>
              <h2 className={darkMode ? 'dark-mode' : ''}>Generated Outfits</h2>
              <div className="images-scroll-container">
                {images.generated.length > 0 ? (
                  images.generated.map((img, index) => (
                    <div key={`gen-${img._id || index}`} className="image-card">
                      <img 
                        src={getImageSource(img)} 
                        alt={`Generated outfit ${index + 1}`} 
                        className="history-img" 
                        onClick={() => handleImageClick(img)}
                      />
                    </div>
                  ))
                ) : (
                  <p>No generated outfits yet.</p>
                )}
              </div>
            </div>
            
            <div className={`front-images-section ${darkMode ? 'dark-mode' : ''}`}>
              <h2 className={darkMode ? 'dark-mode' : ''}>Your Photos</h2>
              <div className="images-scroll-container">
                {images.front.length > 0 ? (
                  images.front.map((img, index) => (
                    <div key={`front-${img._id || index}`} className="image-card">
                      <img 
                        src={getImageSource(img)} 
                        alt={`User photo ${index + 1}`} 
                        className="history-img" 
                        onClick={() => handleImageClick(img)}
                      />
                    </div>
                  ))
                ) : (
                  <p>No photos uploaded yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <SettingsPopup
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
      />
      
      {/* Image Modal */}
      <ImageModal 
        image={selectedImage}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onDelete={handleDeleteImage}
      />
    </div>
  );
};

export default ProfilePage;