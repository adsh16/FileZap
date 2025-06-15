const {formidable} = require('formidable');
const fs = require('fs');
const { nanoid } = require('nanoid');
const { getBucket, getDB } = require('../../config/database');

function generateUniqueUri(prefix) {
    return `${prefix}-${nanoid(10)}`;
}

// Separate function for creating batch entry
async function createBatchEntry(file_uri_list) {
    const db = getDB();
    const batchId = generateUniqueUri('batch');
    
    await db.collection('batches').insertOne({
        batchId: batchId,
        files: file_uri_list,
        createdAt: new Date(),
        updatedAt: new Date(),
        downloadCount: 0
    });
    
    return batchId;
}

async function handleUpload(req, res) {
    try {
        // Create form with options
        const form = formidable({
            multiples: true,
            maxFileSize: 10 * 1024 * 1024, // 10MB per file
            maxFiles: 10 // Max 10 files
        });

        // Use modern Promise-based API
        const [fields, files] = await form.parse(req);
        
        let file_uri_list = [];
          // go over each file in files
        // generate a unique URI for each file
        // add the uri to file_uri_list
        // upload the file to MongoDB bucket uploads
        const db = getDB();
        const bucket = getBucket();
        
        for (const file of Object.values(files)) {
            // if else needed because formidable can return a single file (as an object) or an array of files (as an array of objects)
            if (Array.isArray(file)) {
                for (const f of file) {
                    const uri = generateUniqueUri('file');
                    file_uri_list.push(uri);
                    const uploadResult = await uploadFile(f, uri, bucket);
                    await db.collection('uploads.files').insertOne({
                        ...uploadResult,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
            } else {
                const uri = generateUniqueUri('file');
                file_uri_list.push(uri);
                const uploadResult = await uploadFile(file, uri, bucket);
                await db.collection('uploads.files').insertOne({
                    ...uploadResult,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }

        // create an entry in the batches collection, with the file_uri_list as an attribute
        const batchId = await createBatchEntry(file_uri_list);

        res.status(200).json({
            success: true,
            message: 'Files uploaded successfully',
            batchId: batchId,
        });

    } catch (error) {
        console.error('Upload processing error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Upload processing failed' 
        });
    }
}

async function uploadFile(file, uri, bucket) {
    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(file.originalFilename, {
            metadata: {
                originalName: file.originalFilename,
                uri: uri,
                uploadDate: new Date(),
                size: file.size,
                mimetype: file.mimetype
            }
        });

        fs.createReadStream(file.filepath)
            .pipe(uploadStream)
            .on('error', reject)
            .on('finish', () => {
                fs.unlink(file.filepath, () => {}); // Clean up temp file
                resolve({
                    id: uploadStream.id.toString(),
                    filename: file.originalFilename,
                    size: file.size,
                    uri: uri
                });
            });
    });
}

module.exports = { handleUpload };