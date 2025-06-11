const express = require("express");
const path = require("path");
const cors = require("cors");
const { handleUpload } = require("./features/upload/upload-handler");
const { handleDownload } = require("./features/download/download-handler");
const { connectDB } = require("./config/database");

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize database connection
connectDB();

// Middleware
app.use(cors()); // Handle CORS properly
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes
// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Handle file uploads
app.post('/upload', async (req, res) => {
  try {
    await handleUpload(req, res);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Handle file downloads
app.get('/download/:ID', async (req, res) => {
  try {
    const ID = req.params.ID;
    await handleDownload(ID, res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Handle 404 for all other routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log("🚀 FileZap server running on http://localhost:" + PORT);
  console.log("📁 Ready to accept file uploads!");
});
