import { useState } from "react";
import "./upload.css";  // Assuming you'll create a CSS file for styling.

const TryOn = () => {
  const [garmentImage, setGarmentImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please upload an image.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setGarmentImage(e.target.result);
        setErrorMessage("");  // Reset error message on valid file
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    document.getElementById("fileInputGarment").click();
  };

  const handleTryOn = () => {
    if (!garmentImage) {
      setErrorMessage("Please upload an image.");
      return;
    }
    setIsGeneratingAvatar(true);
    setTimeout(() => {
      setIsGeneratingAvatar(false);
      setUploadedImage(garmentImage); // For demonstration, upload garment as the image to try on
    }, 3000); // Wait 3 seconds
  };

  return (
    <div className="frosted-container">
      <h2>Upload Garment Image</h2>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div className="upload-section">
        {/* Left Side - Garment Upload Box */}
        <div className="left-container">
          <div className="upload-box large" onClick={triggerFileInput}>
            {garmentImage ? (
              <img src={garmentImage} alt="Garment Uploaded" />
            ) : (
              <span>Click to upload a garment image</span>
            )}
            <input
              id="fileInputGarment"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {/* Right Side - Try-On Button & Uploaded Person Image */}
        <div className="right-container">
          <button className="try-on-btn" onClick={handleTryOn}>
            {isGeneratingAvatar ? "Processing..." : "Try On"}
          </button>

          {uploadedImage && !isGeneratingAvatar && (
            <div className="uploaded-image-box">
              <img src={uploadedImage} alt="Uploaded Garment" />
            </div>
          )}
        </div>
      </div>

      {isGeneratingAvatar && (
        <div className="loading-overlay">
          <div className="loading-message">
            <p>Please wait while the try-on is being processed...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TryOn;
