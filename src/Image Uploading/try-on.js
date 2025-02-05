import { useState } from "react";
import "./try-on.css";

const TryOn = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(null);
    setErrorMessage(""); // Fix to match the state name

    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select a valid image file."); // Fixed state name here
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedFile(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setErrorMessage("Please select a file to upload");
      return;
    }

    setTimeout(() => {
      alert("File uploaded successfully!");
    }, 1000);
  };

  return (
    <div className="frosted-container">
      {/* Upload Section */}
      <div className="upload-container">
        <h2>Upload Your Image</h2>
        <div className="upload-box" onClick={() => document.getElementById("fileInput").click()}>
          {selectedFile ? (
            <img src={selectedFile} alt="Uploaded" style={{ width: "200px", height: "200px", objectFit: "cover", borderRadius: "10px" }} />
          ) : (
            <span>Click to Upload</span>
          )}
          <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>

      {/* Instructions Section */}
      <div className="instructions-container"> {/* Fixed typo: 'instructions-conatiner' */}
        <h2>How It Works</h2>
        <p>Upload an image to try on clothing virtually.</p>
        <div className="thumbnail-container">
          <div className="thumbnail"><img src="/IMAGES/sample1.png" alt="Sample 1" /></div>
          <div className="thumbnail"><img src="/IMAGES/sample2.png" alt="Sample 2" /></div>
          <div className="thumbnail"><img src="/IMAGES/sample3.png" alt="Sample 3" /></div>
        </div>
        <button className="next-step-btn" onClick={handleUpload}>Next Step</button>
      </div>
    </div>
  );
};

export default TryOn;
