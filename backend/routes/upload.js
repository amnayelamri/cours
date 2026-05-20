const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file types - now includes audio and markdown
  const allowedTypes = /jpeg|jpg|png|gif|pdf|mp4|webm|ogg|mp3|wav|m4a|aac|md/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.includes('image') || 
                   file.mimetype.includes('pdf') || 
                   file.mimetype.includes('video') || 
                   file.mimetype.includes('audio') ||
                   file.mimetype.includes('text') ||
                   file.originalname.endsWith('.md');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, videos, audio files, and markdown files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  },
  fileFilter: fileFilter
});

// Upload single file
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    // Determine content type based on mimetype
    let contentType = 'image';
    if (req.file.mimetype.includes('pdf')) {
      contentType = 'pdf';
    } else if (req.file.mimetype.includes('video')) {
      contentType = 'video';
    } else if (req.file.mimetype.includes('audio')) {
      contentType = 'audio';
    } else if (req.file.originalname.endsWith('.md') || req.file.mimetype.includes('text')) {
      contentType = 'markdown';
      
      // For markdown files, read the content and return it
      const filePath = path.join(uploadsDir, req.file.filename);
      const markdownContent = fs.readFileSync(filePath, 'utf8');
      
      // Delete the file after reading (we store content in DB, not the file)
      fs.unlinkSync(filePath);
      
      return res.json({
        url: markdownContent, // Return the content itself, not a URL
        contentType: contentType,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        isMarkdown: true
      });
    }

    res.json({
      url: fileUrl,
      contentType: contentType,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Delete file
router.delete('/:filename', auth, (req, res) => {
  try {
    const filePath = path.join(uploadsDir, req.params.filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
});

module.exports = router;