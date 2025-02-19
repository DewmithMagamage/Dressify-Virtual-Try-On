import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./upload.css";

const Upload = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");  
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    document.getElementById("fileInputPerson").click();
  };

  const handleNextStep = () => {
    if (!uploadedImage) {
      setErrorMessage("Please upload an image");
      return;
    }
    setStep(2);
    setErrorMessage("");
  };

  const handleTryOn = () => {
    navigate("/tryon"); 
  };

  return (
    <div className="frosted-container">
      <h2 className="upload-title">Upload Image</h2>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {step === 1 && (
        <div className="upload-section">
          <div className="upload-container">
            <div
              className={`upload-box ${uploadedImage ? "uploaded" : "large"}`}
              onClick={triggerFileInput}
            >
              {uploadedImage ? (
                <img src={uploadedImage} alt="Uploaded" />
              ) : (
                <span>Click to upload an image</span>
              )}
              <input
                id="fileInputPerson"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

          <div className="instructions-container">
            <h2>How It Works</h2>
            <p>Upload a clear picture of yourself</p>
            <button className="next-step-btn" onClick={handleNextStep}>
              Next Step
            </button>
          </div> 
        </div>
      )}

      {step === 2 && (
        <div className="upload-section">
          <div className="upload-container">
            <div className={`upload-box`}>
              {uploadedImage && (
                <img src={uploadedImage} alt="Uploaded Person" />
              )}
            </div>
          </div>

          <div className="instructions-container">
            <h2>Ready for the Try-On</h2>
            <button className="next-step-btn" onClick={handleTryOn}>
              Try-On
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
