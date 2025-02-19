import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./body.css";

const Clothes = () => {
  const [uploadedImages, setUploadedImages] = useState([null]);
  const [errorMessage, setErrorMessage] = useState("");
  const [largeBoxIndex, setLargeBoxIndex] = useState(0);
  const [savedImages, setSavedImages] = useState([]);
  const [isAvatarGenerated, setIsAvatarGenerated] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

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

  const handleSave = () => {
    if (uploadedImages[largeBoxIndex]) {
      setSavedImages([...savedImages, uploadedImages[largeBoxIndex]]);
    }
  };

  const handleSavedImageClick = (index) => {
    setLargeBoxIndex(index);
  };

  const handleGenerateAvatar = () => {
    setIsGeneratingAvatar(true);
    setIsAvatarGenerated(true);
    setTimeout(() => {
      setIsGeneratingAvatar(false);
      setLargeBoxIndex(0);
    }, 3000);
  };

  return (
    <div className="frosted-container">
      <h2 className="upload-title">Upload Clothing item</h2>

      {errorMessage && (
        <div className="error-message" style={{ color: "red" }}>
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
                      🗑️ 
                    </button>
                  </div>
                </>
              ) : (
                <span>Click to upload an image</span>
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
          <p>Please upload an image of a clothing item to try on.</p>
          <div className="button-container">
            <button className="next-step-btn" onClick={handleGenerateAvatar}>Try On</button>
            {uploadedImages[largeBoxIndex] && (
              <button className="save-btn" onClick={handleSave}>Save</button>
            )}
          </div>  
        </div>

        {/* Saved Image Section - Vertically Displayed */}
        {savedImages.length > 0 && (
          <div className="saved-image-container">
            {savedImages.map((image, index) => (
              <div key={index} className="saved-image" onClick={() => handleSavedImageClick(index)}>
                <img src={image} alt={`Saved ${index}`} />
              </div>
            ))}
          </div>
        )}

        {isGeneratingAvatar && (
          <div className="avatar-overlay">
            <div className="avatar-message">
              <p>Please wait a few moments to generate an avatar!</p>
            </div>  
          </div>  
        )}
      </div>
    </div>
  );
};

export default Clothes;
