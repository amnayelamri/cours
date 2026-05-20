const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  slideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slide',
    required: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

commentSchema.index({ slideId: 1, createdAt: -1 });
commentSchema.index({ documentId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);