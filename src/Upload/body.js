import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./body.css";

const TryOn = () => {
  const [uploadedImages, setUploadedImages] = useState([null]);
  const [errorMessage, setErrorMessage] = useState("");
  const [largeBoxIndex] = useState(0);
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
    if (uploadedImages[largeBoxIndex] !== null) {
        navigate("/clothes");
    } else {
        setErrorMessage("Please upload an image.");
    }    
  };

  return (
    <div className="frosted-container">
      <button className="back-button" onClick={() => navigate("/")}>
        <svg className="back-arrow-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor">
            <path d="M100,15a85,85,0,1,0,85,85A84.93,84.93,0,0,0,100,15Zm0,150a65,65,0,1,1,65-65A64.87,64.87,0,0,1,100,165ZM116.5,57.5a9.67,9.67,0,0,0-14,0L74,86a19.92,19.92,0,0,0,0,28.5L102.5,143a9.9,9.9,0,0,0,14-14l-28-29L117,71.5C120.5,68,120.5,61.5,116.5,57.5Z"></path>
        </svg>
      </button> 
      <h2 className="upload-title">Upload Images</h2>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      
      {/* Upload Section */}
      <div className="upload-section">
        <div className="upload-container">
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
                    <button className="delete-btn" onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(index);
                    }}>
                      <svg className="delete-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                        <path d="M8 26c0 1.656 1.343 3 3 3h10c1.656 0 3-1.344 3-3l2-16h-20l2 16zM19 13h2v13h-2v-13zM15 13h2v13h-2v-13zM11 13h2v13h-2v-13zM25.5 6h-6.5c0 0-0.448-2-1-2h-4c-0.553 0-1 2-1 2h-6.5c-0.829 0-1.5 0.671-1.5 1.5s0 1.5 0 1.5h22c0 0 0-0.671 0-1.5s-0.672-1.5-1.5-1.5z" />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <span>+ Click to upload or drag and drop an image</span>
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

        {/* Instructions Section */}
        <div className="instructions-container">
          <p>Upload a clear front-facing photo to start!</p>
          <div className="button-container">
            <button className="next-step-btn" onClick={handleNextStep}>Next</button>
          </div>
        </div>  
      </div>
  </div>  
  );
};

export default TryOn;