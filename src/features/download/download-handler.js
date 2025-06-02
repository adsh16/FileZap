const { ObjectId } = require('mongodb');
const { getBucket, getDB } = require('../../config/database');

async function handleDownload(fileId, res) {
    try {
        const bucket = getBucket();
        const db = getDB();
        
        const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));
        
        // Get file info
        const fileInfo = await db.collection('uploads.files').findOne({ _id: new ObjectId(fileId) });
        
        if (!fileInfo) {            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
            return;
        }

        res.writeHead(200, {
            'Content-Type': fileInfo.metadata?.mimetype || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${fileInfo.filename}"`,
            'Content-Length': fileInfo.length
        });

        downloadStream.pipe(res);
        
        downloadStream.on('error', () => {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
        });
    } catch (error) {
        console.error('Download error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Download failed');
    }
}

module.exports = { handleDownload };
