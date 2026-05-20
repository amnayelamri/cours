const mongoose = require('mongoose');

// Content block schema for multiple content items per slide
const contentBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'image', 'pdf', 'video', 'youtube', 'audio', 'markdown'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  }
}, { _id: true });

const slideSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  contentBlocks: {
    type: [contentBlockSchema],
    default: []
  },
  // Keep old fields for backward compatibility during migration
  content: {
    type: String
  },
  contentType: {
    type: String,
    enum: ['text', 'image', 'pdf', 'video', 'youtube', 'audio', 'markdown']
  },
  order: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

slideSchema.index({ documentId: 1, order: 1 });

module.exports = mongoose.model('Slide', slideSchema);