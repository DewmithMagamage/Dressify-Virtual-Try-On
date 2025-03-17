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
  const [model3D, setModel3D] = useState(null);
  const [video3D, setVideo3D] = useState(null);
  const [generating3D, setGenerating3D] = useState(false);

  useEffect(() => {
    if (frontImage && garmentImage) {
      handleTryOn();
    }
  }, [frontImage, garmentImage]);

  const handleTryOn = async () => {
    setLoading(true);
    setError('');
    setGeneratedImage(null);
    setModel3D(null);
    setVideo3D(null);

    const formData = new FormData();
    formData.append('front', dataURLtoFile(frontImage, 'front.png'));
    formData.append('garment', dataURLtoFile(garmentImage, 'garment.png'));

    try {
      // Get the authentication token from localStorage
      const authToken = localStorage.getItem('authToken'); // or however you store it
      
      if (!authToken) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      // Include the token in the request headers
      const response = await axios.post('http://localhost:5000/api/tryon', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${authToken}` // Add the token with Bearer prefix
        },
      });

      if (response.data.success) {
        if (response.data.imageData) {
          const base64Image = response.data.imageData.startsWith('data:image/png;base64,')
            ? response.data.imageData
            : `data:image/png;base64,${response.data.imageData}`;
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
      } else if (err.response && err.response.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to connect to the server.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Similarly, update the handleGenerate3D function
  const handleGenerate3D = async () => {
    if (!generatedImage) {
      setError('No image available to generate 3D model from.');
      return;
    }

    setGenerating3D(true);
    setError('');
    setModel3D(null);
    setVideo3D(null);

    try {
      // Get the authentication token
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        setError('Authentication token not found. Please log in again.');
        setGenerating3D(false);
        return;
      }

      // Send the image URL or data with authentication token
      const imageUrlToSend = generatedImage.startsWith('data:image') 
        ? generatedImage  // If it's already base64, send it as is
        : generatedImage; // If it's a URL, send the URL
        
      const response = await axios.post('http://localhost:5000/api/generate3d', {
        imageUrl: imageUrlToSend
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.success && response.data.modelData) {
        // Handle the model and video URLs
        if (response.data.modelData.model) {
          setModel3D(response.data.modelData.model);
          console.log("Received model URL:", response.data.modelData.model);
        }
        
        if (response.data.modelData.video) {
          setVideo3D(response.data.modelData.video);
          console.log("Received video URL:", response.data.modelData.video);
        }
      } else {
        setError('Failed to generate 3D model: ' + (response.data.error || 'No error message provided'));
      }
    } catch (err) {
      console.error("3D generation error:", err);
      
      if (err.response && err.response.data && err.response.data.error) {
        setError(`Server error: ${err.response.data.error}`);
      } else if (err.response && err.response.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to connect to the server for 3D generation.');
      }
    } finally {
      setGenerating3D(false);
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
      <div className="upload-section">
        {loading && (
          <div className="loading-indicator">
            <p>Processing your images, this may take up to 1 minute...</p>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}

        {generatedImage && (
          <div className="result-container">
            <h2 className="checkout-text">Checkout the fit </h2>
            <div className="result-box">
              <img
                src={generatedImage}
                alt="Try-On Result"
                crossOrigin="anonymous"
                className="result-image"
                onLoad={() => console.log("Result image loaded successfully:", generatedImage)}
                onError={(e) => {
                  console.error("Image failed to load:", e);
                  setError("Failed to load the generated image. Please try again.");
                }}
              />
            </div>  
            
            <button className="next-step-btn" onClick={handleGenerate3D} disabled={generating3D}>
              {generating3D ? 'Generating...' : 'View in 3D'}
            </button>
          </div>
        )}

        {model3D && (
          <div className="model-container">
            <h2 className="checkout-text">3D Model View</h2>
            <div className="model-display">
              {video3D && (
                <div className="video-container">
                  <h3 className="model-subtitle">3D Preview</h3>
                  <video
                    controls
                    autoPlay
                    loop
                    muted
                    className="model-video"
                    src={video3D}
                    crossOrigin="anonymous"
                  />
                </div>
              )}
               <div className="model-viewer-container">
                <h3 className="model-subtitle">3D Model</h3>
                <model-viewer
                  src={model3D}
                  auto-rotate
                  camera-controls
                  shadow-intensity="1"
                  style={{ width: '100%', height: '400px' }}
                  crossOrigin="anonymous"
                  onError={(event) => console.error("Model viewer error:", event.detail)}
                  alt="3D model of clothing"
              ></model-viewer>
              </div>
            </div>
            <button 
              className="back-btn" onClick={() => {
                setModel3D(null);
                setVideo3D(null);
              }}
            >
              Back to 2D View
            </button>
          </div>
        )}  
      </div>
    </div>
  );
};

export default TryOn;