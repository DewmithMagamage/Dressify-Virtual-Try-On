import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './try-on.css';

const TryOn = () => {
  const location = useLocation();
  const { frontImage, garmentImage } = location.state || {};
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (frontImage && garmentImage) {
      handleTryOn();
    }
  }, [frontImage, garmentImage]);

  const handleTryOn = async () => {
    setLoading(true);
    setError('');
    setGeneratedImage(null);

    const formData = new FormData();
    formData.append('front', dataURLtoFile(frontImage, 'front.png'));
    formData.append('garment', dataURLtoFile(garmentImage, 'garment.png'));

    try {
      const response = await axios.post('http://localhost:5000/api/tryon', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        if (response.data.imageData) {
          // Check if imageData already includes the prefix
          const base64Image = response.data.imageData.startsWith('data:image/png;base64,')
            ? response.data.imageData // Use as-is
            : `data:image/png;base64,${response.data.imageData}`; // Add prefix
          setGeneratedImage(base64Image);
        } else if (response.data.imageUrl) {
          setGeneratedImage(response.data.imageUrl);
        } else {
          setError('No valid image data received from the server.');
        }
      } else {
        setError(response.data.error || 'Error processing image.');
      }
    } catch (err) {
      console.error("API error:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(`Server error: ${err.response.data.error}`);
      } else {
        setError('Failed to connect to the server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const dataURLtoFile = (dataUrl, filename) => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  return (
    <div className="frosted-container">
      <h2 className="upload-title">Virtual Try-On</h2>

      <div className="upload-section">
        {loading && (
          <div className="loading-indicator">
            <p>Processing your images, this may take up to 30 seconds...</p>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}

        {generatedImage && (
          <div className="result-container">
            <h3>Generated Try-On Result:</h3>
            <img
              src={generatedImage}
              alt="Generated Try-On"
              crossOrigin="anonymous"
              className="result-image"
              onLoad={() => console.log("Result image loaded successfully:", generatedImage)}
              onError={(e) => {
                console.error("Image failed to load:", e);
                setError("Failed to load the generated image. Please try again.");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TryOn;