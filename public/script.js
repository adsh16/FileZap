document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("fileInput");
  const fileList = document.getElementById("fileList");
  const GenerateLink = document.getElementById("GenerateLink");
  const status = document.getElementById("status");
  let selectedFiles = [];

  fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    selectedFiles = files;
    displayFileList();
    GenerateLink.style.display = selectedFiles.length > 0 ? "block" : "none";
    status.innerHTML = "";
  });

  function displayFileList() {
    fileList.innerHTML = "";
    selectedFiles.forEach((file) => {
      const fileItem = document.createElement("div");
      fileItem.className = "file-item";
      fileItem.innerHTML = `<span>${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)</span>`;
      fileList.appendChild(fileItem);
    });
  }

  GenerateLink.addEventListener("click", async () => {
    if (selectedFiles.length === 0) {
      showStatus("Please select files to upload.", "error");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    showStatus(`Uploading ${selectedFiles.length} file(s)...`);
    GenerateLink.disabled = true;

    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const downloadLink = `${window.location.origin}/download/${result.batchId}`;
        
        const successMessage = `
          <h3>Upload Successful!</h3>
          <p>Download Link: <a href="${downloadLink}" target="_blank">${downloadLink}</a></p>
          <p>Batch ID: ${result.batchId}</p>
        `;
        showStatus(successMessage, "success");

        // Reset form
        selectedFiles = [];
        displayFileList();
        GenerateLink.style.display = "none";
        fileInput.value = "";
      } else {
        showStatus(`Upload failed: ${result.error}`, "error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showStatus("Upload error occurred. Please try again.", "error");
    } finally {
      GenerateLink.disabled = false;
    }
  });

  function showStatus(message, type = "") {
    status.innerHTML = `<div class="${type}">${message}</div>`;
  }
});
