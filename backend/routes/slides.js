const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Slide = require('../models/Slide');
const Document = require('../models/Document');
const auth = require('../middleware/auth');

// Create new slide (supports both old single content and new multiple content blocks)
router.post('/', auth, [
  body('documentId').notEmpty().withMessage('Document ID is required'),
  body('order').isNumeric().withMessage('Order must be a number')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { documentId, content, contentType, contentBlocks, order } = req.body;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const slide = new Slide({
      documentId,
      order
    });

    // Support both old (single content) and new (multiple content blocks) format
    if (contentBlocks && contentBlocks.length > 0) {
      slide.contentBlocks = contentBlocks;
    } else if (content) {
      // Legacy support: convert single content to contentBlocks format
      slide.contentBlocks = [{
        type: contentType || 'text',
        content: content,
        order: 0
      }];
      // Also keep old format for backward compatibility
      slide.content = content;
      slide.contentType = contentType || 'text';
    }

    await slide.save();
    res.status(201).json(slide);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get slides for a document
router.get('/document/:documentId', async (req, res) => {
  try {
    const slides = await Slide.find({ documentId: req.params.documentId })
      .sort({ order: 1 });

    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update slide
router.put('/:id', auth, async (req, res) => {
  try {
    const { content, contentType, contentBlocks, order } = req.body;

    const slide = await Slide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ message: 'Slide not found' });
    }

    const document = await Document.findById(slide.documentId);
    if (document.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update contentBlocks if provided
    if (contentBlocks !== undefined) {
      slide.contentBlocks = contentBlocks;
    }
    
    // Update legacy fields if provided
    if (content !== undefined) {
      slide.content = content;
    }
    if (contentType !== undefined) {
      slide.contentType = contentType;
    }
    if (order !== undefined) {
      slide.order = order;
    }

    await slide.save();
    res.json(slide);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete slide
router.delete('/:id', auth, async (req, res) => {
  try {
    const slide = await Slide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ message: 'Slide not found' });
    }

    const document = await Document.findById(slide.documentId);
    if (document.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Slide.findByIdAndDelete(req.params.id);
    res.json({ message: 'Slide deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Insert slide between existing slides
router.post('/insert', auth, [
  body('documentId').notEmpty().withMessage('Document ID is required'),
  body('afterOrder').isNumeric().withMessage('afterOrder must be a number')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { documentId, content, contentType, contentBlocks, afterOrder } = req.body;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Increment order of all slides after the insertion point
    await Slide.updateMany(
      { documentId, order: { $gt: afterOrder } },
      { $inc: { order: 1 } }
    );

    const slide = new Slide({
      documentId,
      order: afterOrder + 1
    });

    if (contentBlocks && contentBlocks.length > 0) {
      slide.contentBlocks = contentBlocks;
    } else if (content) {
      slide.contentBlocks = [{
        type: contentType || 'text',
        content: content,
        order: 0
      }];
      slide.content = content;
      slide.contentType = contentType || 'text';
    }

    await slide.save();
    res.status(201).json(slide);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reorder slides
router.put('/reorder/:documentId', auth, async (req, res) => {
  try {
    const { slides } = req.body; // Array of {slideId, newOrder}

    const document = await Document.findById(req.params.documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatePromises = slides.map(({ slideId, newOrder }) =>
      Slide.findByIdAndUpdate(slideId, { order: newOrder })
    );

    await Promise.all(updatePromises);
    res.json({ message: 'Slides reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;