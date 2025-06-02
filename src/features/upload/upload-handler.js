const formidable = require('formidable');
const fs = require('fs');
const { getBucket } = require('../../config/database');

async function handleUpload(req, res) {
    const form = new formidable.IncomingForm();
    
    form.parse(req, async (err, fields, files) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Error parsing form' }));
            return;
        }

        try {
            const bucket = getBucket();
            const fileArray = Array.isArray(files.files) ? files.files : [files.files];
            const uploadPromises = fileArray.map(file => uploadFileToMongoDB(file, bucket));
            const uploadedFiles = await Promise.all(uploadPromises);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                files: uploadedFiles 
            }));
        } catch (error) {
            console.error('Upload error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Upload failed' }));
        }
    });
}

async function uploadFileToMongoDB(file, bucket) {
    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(file.originalFilename, {
            metadata: {
                originalName: file.originalFilename,
                uploadDate: new Date(),
                size: file.size,
                mimetype: file.mimetype
            }
        });

        const readStream = fs.createReadStream(file.filepath);
        
        uploadStream.on('error', reject);
        uploadStream.on('finish', () => {
            fs.unlink(file.filepath, () => {}); // Clean up temp file
            resolve({
                id: uploadStream.id.toString(),
                filename: file.originalFilename,
                size: file.size
            });
        });

        readStream.pipe(uploadStream);
    });
}

module.exports = { handleUpload };
