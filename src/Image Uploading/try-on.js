import { useState } from "react";
import "./try-on.css";

const TryOn = () => {
  const [uploadedImages, setUploadedImages] = useState([null, null, null, null]);
  const [errorMessage, setErrorMessage] = useState("");
  const [largeBoxIndex, setLargeBoxIndex] = useState(0);
  const [isAvatarGenerated, setIsAvatarGenerated] = useState(false);

  const handleFileChanges = (event, index) => {
    const file = event.target.files[0];
    setErrorMessage(""); 

    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select a valid image file."); // Fixed state name here
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const newUploadedImages = [...uploadedImages];
        newUploadedImages[index] = e.target.result;
        setUploadedImages(newUploadedImages);
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const handleNextStep = () => {
    if (uploadedImages[largeBoxIndex] === null) {
      setErrorMessage("Please upload an image"); // Show error inside the big box
      return;
    }
    setErrorMessage(""); // Clear error
    setLargeBoxIndex((prevIndex) => (prevIndex + 1) % 4); // Move to the next box
  };

  const handlePreviousStep = () => {
    setLargeBoxIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  };

  const handleGenerateAvatar = () => {
    setIsAvatarGenerated(true);
    alert("Avatar generated successfully!");
  };

  return (
    <div className="frosted-container">
      <h2 className="upload-title">Upload Images</h2>
    
      {/* Upload Section */}
      <div class="upload-section">
        <div className="upload-container">
          {uploadedImages.map((image, index) => (
            <div
            key={index}
            className={`upload-box ${largeBoxIndex === index ? "large" : ""}`}
            onClick={() => largeBoxIndex === index && document.getElementById(`fileInput${index}`).click()} 
            >
              {image ? (
                <img src={image} alt="Uploaded" />
            ) : (
              <span>{largeBoxIndex === index ? (errorMessage && uploadedImages[index] === null ? "Please upload an image" : "Click to upload") : ""}</span> // Only show error in the large box
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

          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>

        {/* Instructions Section */}
        <div className="instructions-container"> 
          <h2>How It Works</h2>
          <p>Upload an image to try on clothing virtually.</p>
          <button className="next-step-btn" 
            onClick={uploadedImages.filter(img => img !== null).length === 4 ? handleGenerateAvatar : handleNextStep}
            style={{ marginLeft: "20px", marginTop: "20px" }}
          >  
            {isAvatarGenerated ? "Avatar Generated!" : "Next Step"}
          </button>
        </div>
      </div>  
    </div>
  );
};

export default TryOn;
