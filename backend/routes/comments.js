const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Slide = require('../models/Slide');
const auth = require('../middleware/auth');

// Create comment
router.post('/', auth, [
  body('slideId').notEmpty().withMessage('Slide ID is required'),
  body('documentId').notEmpty().withMessage('Document ID is required'),
  body('text').trim().notEmpty().withMessage('Comment text is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { slideId, documentId, text } = req.body;

    const slide = await Slide.findById(slideId);
    if (!slide) {
      return res.status(404).json({ message: 'Slide not found' });
    }

    const comment = new Comment({
      slideId,
      documentId,
      author: req.userId,
      text
    });

    await comment.save();
    await comment.populate('author', 'name email');

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get comments for a slide
router.get('/slide/:slideId', async (req, res) => {
  try {
    const comments = await Comment.find({ slideId: req.params.slideId })
      .populate('author', 'name email')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all comments for a document
router.get('/document/:documentId', async (req, res) => {
  try {
    const comments = await Comment.find({ documentId: req.params.documentId })
      .populate('author', 'name email')
      .populate('slideId', 'order')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get comments on user's documents (for profile page)
router.get('/my-documents', auth, async (req, res) => {
  try {
    const Document = require('../models/Document');
    
    // Find all documents created by the user
    const userDocuments = await Document.find({ author: req.userId });
    const documentIds = userDocuments.map(doc => doc._id);

    // Find all comments on those documents
    const comments = await Comment.find({ documentId: { $in: documentIds } })
      .populate('author', 'name email')
      .populate('slideId', 'order content')
      .populate('documentId', 'title')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update comment
router.put('/:id', auth, async (req, res) => {
  try {
    const { text } = req.body;

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.text = text || comment.text;
    await comment.save();
    await comment.populate('author', 'name email');

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;