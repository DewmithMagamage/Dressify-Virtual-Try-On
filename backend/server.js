const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const cors = require("cors");

const app = express();
const upload = multer({ dest: "uploads/" });

// Enable CORS
app.use(cors());

// Hugging Face IDM-VTON API details
const HF_API_URL = "https://api-inference.huggingface.co/models/yisol/IDM-VTON"; // Replace with the correct API URL
const HF_API_TOKEN = "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"; // Replace with your actual token

// Retry delay for Hugging Face API (in milliseconds)
const RETRY_DELAY = 5000; // 5 seconds

// Function to send request to Hugging Face API with retry logic
const sendRequestToHF = async (formData) => {
  try {
    const response = await axios.post(HF_API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${HF_API_TOKEN}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 503) {
      console.log("Model is loading. Retrying in 5 seconds...");
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return sendRequestToHF(formData); // Retry the request
    }
    throw error; // Re-throw other errors
  }
};

// API endpoint to handle image uploads
app.post("/api/upload", upload.fields([
  { name: "front", maxCount: 1 },
  { name: "right", maxCount: 1 },
  { name: "back", maxCount: 1 },
  { name: "left", maxCount: 1 },
]), async (req, res) => {
  try {
    console.log("Request files:", req.files); // Debugging: Log the files

    const { front, right, back, left } = req.files;

    // Check if all files are present
    if (!front || !right || !back || !left) {
      return res.status(400).json({ error: "Missing files. Please upload all four images." });
    }

    // Log file details
    console.log("Front file:", front[0]);
    console.log("Right file:", right[0]);
    console.log("Back file:", back[0]);
    console.log("Left file:", left[0]);

    // Create FormData to send to IDM-VTON API
    const formData = new FormData();
    formData.append("front", fs.createReadStream(front[0].path), { filename: "front.jpg" });
    formData.append("right", fs.createReadStream(right[0].path), { filename: "right.jpg" });
    formData.append("back", fs.createReadStream(back[0].path), { filename: "back.jpg" });
    formData.append("left", fs.createReadStream(left[0].path), { filename: "left.jpg" });

    // Send request to IDM-VTON API with retry logic
    const response = await sendRequestToHF(formData);

    // Clean up uploaded files
    [front, right, back, left].forEach((file) => {
      fs.unlinkSync(file[0].path);
    });

    // Send the result back to the client
    res.json(response);
  } catch (error) {
    console.error("Error processing images:", error);
    res.status(500).json({ error: "Failed to process images" });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Virtual Try-On Backend!");
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});