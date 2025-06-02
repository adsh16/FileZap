const form = document.getElementById('file_upload');
form.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const fileInput = document.getElementById('file_input');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file to upload.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        alert('File uploaded successfully: ' + data);
    })
    .catch(error => {
        console.error('Error uploading file:', error);
        alert('Error uploading file.');
    });
});


