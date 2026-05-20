const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Document = require('../models/Document');
const Slide = require('../models/Slide');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// Create new document
router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Title is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description } = req.body;

    const document = new Document({
      title,
      description: description || '',
      author: req.userId,
      likes: []
    });

    await document.save();
    await document.populate('author', 'name email');

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all documents (with search)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const documents = await Document.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single document with slides
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('author', 'name email');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const slides = await Slide.find({ documentId: req.params.id }).sort({ order: 1 });

    res.json({ document, slides });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update document
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    document.title = title || document.title;
    document.description = description !== undefined ? description : document.description;
    document.updatedAt = Date.now();

    await document.save();
    await document.populate('author', 'name email');

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete document
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Slide.deleteMany({ documentId: req.params.id });
    await Comment.deleteMany({ documentId: req.params.id });
    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get documents by user
router.get('/user/:userId', async (req, res) => {
  try {
    const documents = await Document.find({ author: req.params.userId })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like a document
router.post('/:id/like', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if already liked
    const likeIndex = document.likes.indexOf(req.userId);
    
    if (likeIndex > -1) {
      // Already liked, so unlike
      document.likes.splice(likeIndex, 1);
    } else {
      // Not liked, so add like
      document.likes.push(req.userId);
    }

    await document.save();
    await document.populate('author', 'name email');

    res.json({ 
      document, 
      likesCount: document.likes.length,
      isLiked: document.likes.includes(req.userId)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;