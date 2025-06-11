const { ObjectId } = require("mongodb");
const { getBucket, getDB } = require("../../config/database");

async function handleDownload(fileId, res) {
  if(fileId.startsWith("batch-")) {
    // Handle batch download
    let batchId = fileId.replace("batch-", "");
    await batchDownload(batchId, res);
  }
}

async function batchDownload(batchId, res) {
  try {
    const db = getDB();
    const batch_bucket = getBucket("batch");
    const files_bucket = getBucket("files");
    
    // find entry in batch_bucket with given batchId
    // get the files array from the entry
    // for each file in the files array containting the uri, get the file from files_bucket and start the download stream
    
  } catch (error) {
    console.error('Error getting database or bucket:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
}

module.exports = { handleDownload };
