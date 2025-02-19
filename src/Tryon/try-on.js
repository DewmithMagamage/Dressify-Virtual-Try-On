import { useState } from "react";
import "./try-on.css";

const TryOn = () => {
  const [uploadedImages, setUploadedImages] = useState([null, null, null, null]);
  const [errorMessage, setErrorMessage] = useState("");
  const [largeBoxIndex, setLargeBoxIndex] = useState(0);
  const [isAvatarGenerated, setIsAvatarGenerated] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

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

        if (index < 3) {
          setLargeBoxIndex(index + 1);
        }
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const triggerFileInput = (index) => {
    document.getElementById(`fileInput${index}`).click();
  }

  const handleNextStep = () => {
    if (uploadedImages[largeBoxIndex] === null) {
      setErrorMessage("Please upload an image"); 
      return;
    }
    setErrorMessage(""); 
    setLargeBoxIndex((prevIndex) => (prevIndex < 3 ? prevIndex + 1 : prevIndex)); 
  };

  const handleGenerateAvatar = () => {
    setIsGeneratingAvatar(true);
    setIsAvatarGenerated(true);
    setTimeout(() => {
      setIsGeneratingAvatar(false);
      setLargeBoxIndex(0);
    }, 3000);
  };

  const getInstructionsText = (index) => {
    switch (index) {
      case 0:
        return "Upload a clear picture facing the front";
      case 1:
        return "Upload a clear picture facing the right-side";  
      case 2:
        return "Upload a clear picture facing the left-side";  
      case 3:
        return "Upload a clear picture facing the back";  
      default:
        return "";  
    }
  }

  return (
    <div className="frosted-container">
      <h2 className="upload-title">Upload Images</h2>
    
      {/* Upload Section */}
      <div class="upload-section">
        <div className="upload-container">
          {uploadedImages.map((image, index) => (
            <div
              key={index}
              className={`upload-box ${largeBoxIndex === index ? "large" : "small"}`}
              onClick={() => {
                if (largeBoxIndex == index){
                  triggerFileInput(index);
                } else {
                  setLargeBoxIndex(index);
                }
              }}
            >
              {image ? (
                <img src={image} alt="Uploaded" />
            ) : (
              <>
                 {largeBoxIndex === index && !image && (
                  <span className="error-message" style={{ color: errorMessage && errorMessage === "Please upload an image" ? 'red' : 'black' }}>
                    {errorMessage && errorMessage === "Please upload an image" ? errorMessage : "Click to upload an image"}
                  </span>
                )}
              </>
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
          <p>{getInstructionsText(largeBoxIndex)}</p>
          <button className="next-step-btn" 
            onClick={uploadedImages.every((img) => img !== null) ? handleGenerateAvatar : handleNextStep}>  
            {isAvatarGenerated ? "Avatar Generated!" : "Next Step"}
          </button>
        </div>

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

export default TryOn;