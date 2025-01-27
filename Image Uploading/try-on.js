// Select necessary DOM elements
const fileInput = document.querySelector("#fileInput");
const uploadButton = document.querySelector("#uploadButton");
const previewContainer = document.querySelector("#previewContainer");
const errorMessage = document.querySelector("#errorMessage");

// Event listener for the file input
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0]; // Get the selected file
  previewContainer.innerHTML = ""; // Clear any previous preview
  errorMessage.textContent = ""; // Clear any error message

  if (file) {
    // Validate file type (allowing only image files)
    if (!file.type.startsWith("image/")) {
      errorMessage.textContent = "Please select a valid image file.";
      return;
    }

    // Create a FileReader to read the image
    const reader = new FileReader();
    reader.onload = function (e) {
      // Create an image element and set the source to the uploaded file
      const img = document.createElement("img");
      img.src = e.target.result;
      img.alt = "Uploaded Image";
      img.style.width = "200px"; // Set image dimensions
      img.style.height = "200px";
      img.style.objectFit = "cover";
      img.style.border = "2px solid #ddd";
      img.style.borderRadius = "10px";
      previewContainer.appendChild(img); // Append the image to the preview container
    };

    reader.readAsDataURL(file); // Read the file as a data URL
  }
});

// Event listener for the upload button
uploadButton.addEventListener("click", () => {
  if (!fileInput.files[0]) {
    errorMessage.textContent = "Please select a file to upload.";
    return;
  }

  // Simulate file upload process (can be replaced with actual backend logic)
  setTimeout(() => {
    alert("File uploaded successfully!");
    fileInput.value = ""; // Reset the file input
    previewContainer.innerHTML = ""; // Clear the preview container
  }, 1000);
});
