const { ObjectId } = require("mongodb");
const { getBucket, getDB } = require("../../config/database");
const archiver = require('archiver');

async function handleDownload(batchId, res) {
  if(batchId.startsWith("batch-")) {
    // Handle batch download
    // let batchId = batchId.replace("batch-", "");
    await batchDownload(batchId, res);
  }
  else{
    // there is something wrong with the batchId
    res.status(400).json({ error: 'Invalid batch ID format' });
    return;
  }
}

async function batchDownload(batchId, res) {
  try {
    const db = getDB();
    const uploads_bucket = getBucket();
    
    // find entry in batches collection with given batchId
    const batch = await db.collection('batches').findOne({ batchId: batchId });
    
    if (!batch) {
      res.status(404).json({ error: 'Batch not found' });
      console.log(`Batch with ID ${batchId} not found`);
      return;
    }

    // get the files array from the entry
    const fileUris = batch.files;

    if (!fileUris || fileUris.length === 0) {
      res.status(404).json({ error: 'No files found in batch' });
      return;
    }

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    // Set response headers for ZIP download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="files-${batchId}.zip"`);

    // Pipe archive to response
    archive.pipe(res);

    // for each file in the files array containing the uri, get the file from uploads_bucket and start the download stream
    for (const uri of fileUris) {
      // find file metadata in uploads.files collection
      const fileDoc = await db.collection('uploads.files').findOne({ uri: uri });
      
      if (fileDoc) {
        // Get file stream from GridFS uploads bucket
        const downloadStream = uploads_bucket.openDownloadStream(new ObjectId(fileDoc.id));
        
        // Add file to archive
        archive.append(downloadStream, { name: fileDoc.filename });
      }
    }

    // Finalize the archive
    archive.finalize();
    
  } catch (error) {
    console.error('Batch download error:', error);
    res.status(500).json({ error: 'Batch download failed' });
  }
}

module.exports = { handleDownload };
