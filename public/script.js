document.addEventListener('DOMContentLoaded', function() {
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const uploadBtn = document.getElementById('uploadBtn');
    const status = document.getElementById('status');
    let selectedFiles = [];

    // Drag and drop functionality
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('dragover');
    });

    dropArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropArea.classList.remove('dragover');
    });

    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    });

    function handleFiles(files) {
        selectedFiles = [...selectedFiles, ...files];
        displayFileList();
        uploadBtn.style.display = selectedFiles.length > 0 ? 'block' : 'none';
        status.innerHTML = '';
    }

    function displayFileList() {
        fileList.innerHTML = '';
        selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
                <button class="remove-btn" onclick="removeFile(${index})">Remove</button>
            `;
            fileList.appendChild(fileItem);
        });
    }

    window.removeFile = function(index) {
        selectedFiles.splice(index, 1);
        displayFileList();
        uploadBtn.style.display = selectedFiles.length > 0 ? 'block' : 'none';
        if (selectedFiles.length === 0) {
            status.innerHTML = '';
        }
    };

    uploadBtn.addEventListener('click', async () => {
        if (selectedFiles.length === 0) {
            showStatus('Please select files to upload.', 'error');
            return;
        }

        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });

        showStatus(`
            <div class="uploading">
                <span class="spinner"></span>
                Uploading ${selectedFiles.length} file(s)...
            </div>
        `);
        
        uploadBtn.disabled = true;

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                const successMessage = `
                    <h3>✅ Upload Successful!</h3>
                    <p>Successfully uploaded ${result.files.length} file(s)</p>
                    <div style="margin-top: 15px;">
                        ${result.files.map(file => `
                            <div class="file-item">
                                <div class="file-info">
                                    <div class="file-name">${file.filename}</div>
                                    <small>File ID: ${file.id}</small>
                                </div>
                                <a href="/download/${file.id}" class="download-link" target="_blank">Download</a>
                            </div>
                        `).join('')}
                    </div>
                `;
                showStatus(successMessage, 'success');
                
                // Reset form
                selectedFiles = [];
                displayFileList();
                uploadBtn.style.display = 'none';
                fileInput.value = '';
            } else {
                showStatus(`❌ Upload failed: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showStatus('❌ Upload error occurred. Please try again.', 'error');
        } finally {
            uploadBtn.disabled = false;
        }
    });

    function showStatus(message, type = '') {
        status.innerHTML = `<div class="${type}">${message}</div>`;
    }
});
