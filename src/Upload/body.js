import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./body.css";

const TryOn = () => {
  const [uploadedImages, setUploadedImages] = useState([null]);
  const [errorMessage, setErrorMessage] = useState("");
  const [largeBoxIndex, setLargeBoxIndex] = useState(0);
  const [savedImages, setSavedImages] = useState([]);
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
    if (uploadedImages[largeBoxIndex] === null) {
      setErrorMessage("Please upload an image.");
      return;
    }
    navigate("/clothes");
  };

  const handleSave = () => {
    if (uploadedImages[largeBoxIndex]) {
      setSavedImages([...savedImages, uploadedImages[largeBoxIndex]]);
    }
  };

  const handleSavedImageClick = (index) => {
    const selectedSavedImage = savedImages[index];
    const updatedImages = [...uploadedImages];
    updatedImages[0] = selectedSavedImage;
    setUploadedImages(updatedImages);
    setLargeBoxIndex(0);
  };

  return (
    <div className="frosted-container">
      <h2 className="upload-title">Upload Images</h2>

      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

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
                <span> + Click to upload an image</span>
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
        <h2>How It Works</h2>
        <p>Please upload a clear image to continue.</p>
        <div className="button-container">
            <button className="next-step-btn" onClick={handleNextStep}>Next</button>
            {uploadedImages[largeBoxIndex] && (
            <button className="save-btn" onClick={handleSave}>Save</button>    
            )}
        </div>  
        </div>

        {/* Saved Image Section */}
        {savedImages.length > 0 &&  (
          <div className="saved-image-container">
            {savedImages.map((image, index) => (
                <div key={index} className="saved-image" onClick={() => handleSavedImageClick(index)}>
                    <img src={image} alt={`Saved ${index}`} />
                </div>
            ))}  
          </div>
        )},
      </div>
    </div>
  );
};

export default TryOn;