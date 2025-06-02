const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const { handleUpload } = require('./features/upload/upload-handler');
const { handleDownload } = require('./features/download/download-handler');
const { connectDB } = require('./config/database');

// Initialize database connection
connectDB();

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Serve main page
    if (pathname === '/' && req.method === 'GET') {
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }
    // Handle file uploads
    else if (pathname === '/upload' && req.method === 'POST') {
        await handleUpload(req, res);
    }
    // Handle file downloads
    else if (pathname.startsWith('/download/') && req.method === 'GET') {
        const fileId = pathname.split('/download/')[1]; // unique identifier for the file
        await handleDownload(fileId, res);
    }
    // Serve static files
    else if (pathname.startsWith('/public/')) {
        const filePath = path.join(__dirname, pathname);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
                return;
            }
            
            // Set appropriate content type
            const ext = path.extname(filePath);
            let contentType = 'text/plain';
            if (ext === '.js') contentType = 'application/javascript';
            if (ext === '.css') contentType = 'text/css';
            if (ext === '.html') contentType = 'text/html';
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(8080, () => {
    console.log('🚀 FileZap server running on http://localhost:8080');
    console.log('📁 Ready to accept file uploads!');
});