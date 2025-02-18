import React from "react";
import "./profile.css";

const Profile = () => {
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      alert("Account deleted successfully.");
    }
  };

  return (
    <div className="profile-container">
      <header className="header">
        <div className="icons">
          <img src="/IMAGES/bell-icon.png" alt="Notifications" className="icon" />
        </div>
      </header>

      <div className="profile-card">
        <div className="profile-header">
          <img src="/IMAGES/person.png" alt="User Avatar" className="avatar" />
          <h2>ELENA</h2>
        </div>

        <div className="profile-info">
          <h3>Personal Information</h3>
          <div className="info-section">
            <div className="info-left">
              <p><strong>User Name:</strong> Elena Grace</p>
              <p><strong>Address:</strong> No. 23, St. Peter's Street, Australia</p>
              <p><strong>Email Address:</strong> elenagrace@gmail.com</p>
            </div>
            <div className="info-right">
              <p><strong>Age:</strong> 24</p>
              <p><strong>Phone Number:</strong> +9877 527 7829</p>
            </div>
          </div>
        </div>

        <div className="measurement-details">
          <h3>Measurement Details</h3>
          <p><strong>Height:</strong> 155 cm</p>
          <p><strong>Waist:</strong> 64-66 cm</p>
          <p><strong>Hips:</strong> 89-91 cm</p>
          <p><strong>Chest:</strong> 82-84 cm</p>
        </div>

        <div className="user-images">
          <h3>User Images</h3>
          <div className="image-gallery">
            <img src="/IMAGES/front-side.jpeg" alt="User Image" />
            <img src="/IMAGES/left-side.jpeg" alt="User Image" />
            <img src="/IMAGES/right-side.jpg" alt="User Image" />
            <img src="/IMAGES/back-side.jpeg" alt="User Image" />
          </div>
        </div>

        <div className="action-buttons">
          <button className="edit-btn">Edit Profile</button>
          <button className="delete-btn" onClick={handleDelete}>Delete Account</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
