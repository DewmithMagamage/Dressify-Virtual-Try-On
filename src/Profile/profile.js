import React from 'react';
import { useNavigate } from "react-router-dom";
import './profile.css';

const ProfilePage = () => {
  const navigate = useNavigate();

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      alert("Account deleted successfully.");
    }
  };

  const handleNotifications = () => {
    alert("No new notifications.");
  };

  return (
    <div className="profile-container">
      <button className="back-button" onClick={() => navigate("/home")}>
        <svg className="back-arrow-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor">
            <path d="M100,15a85,85,0,1,0,85,85A84.93,84.93,0,0,0,100,15Zm0,150a65,65,0,1,1,65-65A64.87,64.87,0,0,1,100,165ZM116.5,57.5a9.67,9.67,0,0,0-14,0L74,86a19.92,19.92,0,0,0,0,28.5L102.5,143a9.9,9.9,0,0,0,14-14l-28-29L117,71.5C120.5,68,120.5,61.5,116.5,57.5Z"></path>
        </svg>
      </button> 
      <h1>Profile</h1>
      <button className="notifications-btn" onClick={handleNotifications}>
        <svg className="notifications-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.0001 5.5C14.7615 5.5 17.0001 7.73858 17.0001 10.5V12.7396C17.0001 13.2294 17.1798 13.7022 17.5052 14.0683L18.7809 15.5035C19.6408 16.4708 18.9541 18 17.6598 18H6.34031C5.04604 18 4.35933 16.4708 5.2192 15.5035L6.49486 14.0683C6.82028 13.7022 7.00004 13.2294 7.00004 12.7396L7.00006 10.5C7.00006 7.73858 9.23864 5.5 12.0001 5.5ZM12.0001 5.5V3M3 11.0001C3 7.87966 4.58803 5.13015 7 3.51562M21 11.0001C21 7.87966 19.412 5.13015 17 3.51562M11 21H13"></path>
        </svg>
      </button>
      <div className="profile-content">
        <div className="user-details">
          <h2>User Details</h2>
           <p><strong>User Name:</strong> Elena Grace</p>
           <p><strong>Age:</strong> 24</p>
           <p><strong>Phone Number:</strong> +9877 527 7829</p>
        </div>
        <div className="user-history-outfit-history">
          <div className="user-history">
            <h2>User History</h2>
            <p>Saved user Images</p>
          </div>
          <div className="outfit-history">
            <h2>Outfit History</h2>
            <p>Saved clothing images</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

/*const [measurements, setMeasurements] = useState({
  waist: "",
  torso: "",
  bust: "",
  shoulder: "",
  arm: "",
  leg: "",
  hip: "",
  height: ""
});

const handleMeasurementChange = (e) => {
    const { name, value } = e.target;
    setMeasurements({ ...measurements, [name]: value });
  };
  
  <div className="measurements-container">
          <h3>2. Enter your measurements</h3>
          <div className="column">
            <input
              type="text"
              name="waist"
              placeholder="Waist Size in cm"
              value={measurements.waist}
              onChange={handleMeasurementChange}
            />
            <input
              type="text"
              name="torso"
              placeholder="Torso Length in cm"
              value={measurements.torso}
              onChange={handleMeasurementChange}
            />
            <input
              type="text"
              name="bust"
              placeholder="Bust size in cm"
              value={measurements.bust}
              onChange={handleMeasurementChange}
            />
            <input
              type="text"
              name="shoulder"
              placeholder="Shoulder Width in cm"
              value={measurements.shoulder}
              onChange={handleMeasurementChange}
            />
          </div>
          <div className="column">
            <input
              type="text"
              name="arm"
              placeholder="Arm Length in cm"
              value={measurements.arm}
              onChange={handleMeasurementChange}
            />
            <input
              type="text"
              name="leg"
              placeholder="Leg Length in cm"
              value={measurements.leg}
              onChange={handleMeasurementChange}
            />
            <input
              type="text"
              name="hip"
              placeholder="Hip Size in cm"
              value={measurements.hip}
              onChange={handleMeasurementChange}
            />
            <input
              type="text"
              name="height"
              placeholder="Height in cm"
              value={measurements.height}
              onChange={handleMeasurementChange}
            />
          </div>
        </div>*/