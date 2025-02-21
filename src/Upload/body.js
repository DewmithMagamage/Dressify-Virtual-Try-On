import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./body.css";

const TryOn = () => {
  const [uploadedImages, setUploadedImages] = useState([null]);
  const [errorMessage, setErrorMessage] = useState("");
  const [largeBoxIndex] = useState(0);
  const [savedImages, setSavedImages] = useState([]);
  const [measurements, setMeasurements] = useState({
    waist: "",
    torso: "",
    bust: "",
    shoulder: "",
    arm: "",
    leg: "",
    hip: "",
    height: ""
  });
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [showSavedNamesPopup, setShowSavedNamesPopup] = useState(false);
  const [showSaveIcon, setShowSaveIcon] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [savedNames, setSavedNames] = useState([]); 
  const navigate = useNavigate();

  const handleFileChanges = (event, index) => {
    const file = event.target.files[0];
    setErrorMessage("");

    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select a valid image file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const newUploadedImages = [...uploadedImages];
        newUploadedImages[index] = e.target.result;
        setUploadedImages(newUploadedImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = (index) => {
    document.getElementById(`fileInput${index}`).click();
  };

  const handleDelete = (index) => {
    const newUploadedImages = [...uploadedImages];
    newUploadedImages[index] = null;
    setUploadedImages(newUploadedImages);
  };

  const handleNextStep = () => {
    if (uploadedImages[largeBoxIndex] && setMeasurements) {
        navigate("/clothes");
    } else {
        setErrorMessage("Please enter the details.");
    }    
  };

  const handleSave = () => {
    if (uploadedImages[largeBoxIndex] && setMeasurements) {
        setShowSavePopup(true);
    } else {
        setErrorMessage("Please enter the details.");
    }
  };

  const handleSaveConfirm = () => {
    if (saveName.trim() !== "") {
      setSavedImages([...savedImages, { image: uploadedImages[largeBoxIndex], name: saveName }]);
      setSavedNames([...savedNames, saveName]); 
      setShowSaveIcon(true);
      setShowSavePopup(false);
    }
  };

  const handleMeasurementChange = (e) => {
    const { name, value } = e.target;
    setMeasurements({ ...measurements, [name]: value });
  };

  const handleIconClick = () => {
    setShowSavedNamesPopup(true);
  };

  const handleCloseSavedNamesPopup = () => {
    setShowSavedNamesPopup(false);
  };

  return (
    <div className="frosted-container">
      <h2 className="upload-title">Upload Images</h2>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div className="upload-section">
        <div className="upload-container">
          <h3>1. Please upload a clear picture</h3>
          {uploadedImages.map((image, index) => (
            <div
              key={index}
              className={`upload-box ${largeBoxIndex === index ? "large" : ""}`}
              onClick={() => triggerFileInput(index)}
            >
              {image ? (
                <>
                  <img src={image} alt="Uploaded" />
                  <div className="hover-overlay">
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(index);
                      }}
                    >
                      <img src="/IMAGES/delete.svg" alt="Delete" className="delete-icon" />
                    </button>
                  </div>
                </>
              ) : (
                <span>+ Click to upload an image</span>
              )}
              <input
                id={`fileInput${index}`}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChanges(e, index)}
                style={{ display: "none" }}
              />
            </div>
          ))}
        </div>

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
        </div>
      </div>

      <div className="button-container">
        <button className="next-step-btn" onClick={handleNextStep}>Next</button>
        <button className="save-btn" onClick={handleSave}>Save</button>
      </div>

      {/* Save Name Popup */}
      {showSavePopup && (
        <div className="save-popup">
          <div className="save-popup-content">
            <h3>Save Your Measurements</h3>
            <input
              type="text"
              placeholder="Enter a name"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
            />
            <button className="save-confirm-btn" onClick={handleSaveConfirm}>Save</button>
            <button className="save-cancel-btn" onClick={() => setShowSavePopup(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Save Icon in Top Right */}
      {showSaveIcon && (
        <button className="saved-details-btn" onClick={handleIconClick}>
            <svg className="saved-details-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.1716 1C18.702 1 19.2107 1.21071 19.5858 1.58579L22.4142 4.41421C22.7893 4.78929 23 5.29799 23 5.82843V20C23 21.6569 21.6569 23 20 23H4C2.34315 23 1 21.6569 1 20V4C1 2.34315 2.34315 1 4 1H18.1716ZM4 3C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21L5 21L5 15C5 13.3431 6.34315 12 8 12L16 12C17.6569 12 19 13.3431 19 15V21H20C20.5523 21 21 20.5523 21 20V6.82843C21 6.29799 20.7893 5.78929 20.4142 5.41421L18.5858 3.58579C18.2107 3.21071 17.702 3 17.1716 3H17V5C17 6.65685 15.6569 8 14 8H10C8.34315 8 7 6.65685 7 5V3H4ZM17 21V15C17 14.4477 16.5523 14 16 14L8 14C7.44772 14 7 14.4477 7 15L7 21L17 21ZM9 3H15V5C15 5.55228 14.5523 6 14 6H10C9.44772 6 9 5.55228 9 5V3Z"></path>
            </svg>
        </button>
      )}

      {/* Saved Names Popup */}
      {showSavedNamesPopup && (
        <div className="saved-names-popup">
          <div className="saved-names-content">
            <h3>Saved Measurements</h3>
            <ul>
              {savedNames.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
            <button className="close-popup-btn" onClick={handleCloseSavedNamesPopup}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TryOn;