import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentAPI, slideAPI, uploadAPI } from '../services/api';
import { FiPlus, FiTrash2, FiUpload, FiImage, FiFile, FiVideo, FiMusic, FiType } from 'react-icons/fi';
import './CreateDocument.css';

const CreateDocument = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slides, setSlides] = useState([
    { contentBlocks: [{ type: 'text', content: '', order: 0 }], order: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({});
  const [error, setError] = useState('');

  const handleAddSlide = () => {
    setSlides([
      ...slides, 
      { contentBlocks: [{ type: 'text', content: '', order: 0 }], order: slides.length }
    ]);
  };

  const handleRemoveSlide = (index) => {
    const newSlides = slides.filter((_, i) => i !== index);
    const reorderedSlides = newSlides.map((slide, i) => ({ ...slide, order: i }));
    setSlides(reorderedSlides);
  };

  const handleAddContentBlock = (slideIndex) => {
    const newSlides = [...slides];
    const currentBlocks = newSlides[slideIndex].contentBlocks;
    newSlides[slideIndex].contentBlocks = [
      ...currentBlocks,
      { type: 'text', content: '', order: currentBlocks.length }
    ];
    setSlides(newSlides);
  };

  const handleRemoveContentBlock = (slideIndex, blockIndex) => {
    const newSlides = [...slides];
    newSlides[slideIndex].contentBlocks = newSlides[slideIndex].contentBlocks
      .filter((_, i) => i !== blockIndex)
      .map((block, i) => ({ ...block, order: i }));
    setSlides(newSlides);
  };

  const handleContentBlockChange = (slideIndex, blockIndex, field, value) => {
    const newSlides = [...slides];
    newSlides[slideIndex].contentBlocks[blockIndex][field] = value;
    
    // Reset content when changing type
    if (field === 'type') {
      newSlides[slideIndex].contentBlocks[blockIndex].content = '';
    }
    
    setSlides(newSlides);
  };

  const handleFileUpload = async (slideIndex, blockIndex, file) => {
    if (!file) return;

    const uploadKey = `${slideIndex}-${blockIndex}`;
    setUploading({ ...uploading, [uploadKey]: true });
    setError('');

    try {
      const response = await uploadAPI.uploadFile(file);
      const newSlides = [...slides];
      
      // For markdown files, the content is in the response
      if (response.data.isMarkdown) {
        newSlides[slideIndex].contentBlocks[blockIndex].content = response.data.url;
        newSlides[slideIndex].contentBlocks[blockIndex].type = 'markdown';
      } else {
        newSlides[slideIndex].contentBlocks[blockIndex].content = response.data.url;
        newSlides[slideIndex].contentBlocks[blockIndex].type = response.data.contentType;
      }
      
      setSlides(newSlides);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading({ ...uploading, [uploadKey]: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    // Validate slides
    const validSlides = slides.filter(slide => 
      slide.contentBlocks.some(block => block.content.trim())
    );

    if (validSlides.length === 0) {
      setError('At least one slide with content is required');
      return;
    }

    setLoading(true);

    try {
      // Create document
      const docResponse = await documentAPI.create({ title, description });
      const documentId = docResponse.data._id;

      // Create slides with content blocks
      const slidePromises = validSlides.map((slide) => {
        const validBlocks = slide.contentBlocks.filter(block => block.content.trim());
        return slideAPI.create({
          documentId,
          contentBlocks: validBlocks,
          order: slide.order
        });
      });

      await Promise.all(slidePromises);
      navigate(`/document/${documentId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create document');
    } finally {
      setLoading(false);
    }
  };

  const getContentIcon = (type) => {
    switch(type) {
      case 'image': return <FiImage />;
      case 'pdf': return <FiFile />;
      case 'video': return <FiVideo />;
      case 'audio': return <FiMusic />;
      case 'youtube': return <FiVideo />;
      case 'markdown': return <FiFile />;
      default: return <FiType />;
    }
  };

  return (
    <div className="create-document-container">
      <div className="create-header">
        <h1>Create New Document</h1>
        <p>Share your knowledge with the community</p>
      </div>

      <form onSubmit={handleSubmit} className="create-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">Document Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the document"
            rows="3"
          />
        </div>

        <div className="slides-section">
          <div className="slides-header">
            <h3>Slides</h3>
          </div>

          {slides.map((slide, slideIndex) => (
            <div key={slideIndex} className="slide-editor">
              <div className="slide-editor-header">
                <span className="slide-number">Slide {slideIndex + 1}</span>
                <div className="slide-controls">
                  {slides.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSlide(slideIndex)}
                      className="btn-remove-slide"
                      title="Remove slide"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Content Blocks */}
              {slide.contentBlocks.map((block, blockIndex) => (
                <div key={blockIndex} className="content-block-editor">
                  <div className="content-block-header">
                    <select
                      value={block.type}
                      onChange={(e) => handleContentBlockChange(slideIndex, blockIndex, 'type', e.target.value)}
                      className="block-type-select"
                    >
                      <option value="text">Text</option>
                      <option value="image">Image</option>
                      <option value="pdf">PDF Document</option>
                      <option value="video">Video File</option>
                      <option value="audio">Audio File</option>
                      <option value="youtube">YouTube Link</option>
                      <option value="markdown">Markdown File</option>
                    </select>
                    {slide.contentBlocks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveContentBlock(slideIndex, blockIndex)}
                        className="btn-remove-block"
                        title="Remove content block"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>

                  {block.type === 'text' && (
                    <textarea
                      value={block.content}
                      onChange={(e) => handleContentBlockChange(slideIndex, blockIndex, 'content', e.target.value)}
                      placeholder="Enter text content... (Supports Markdown and KaTeX math: $E=mc^2$ or $$...$$)"
                      rows="4"
                      className="content-textarea"
                    />
                  )}

                  {(block.type === 'image' || block.type === 'pdf' || block.type === 'video' || block.type === 'audio' || block.type === 'markdown') && (
                    <div className="file-upload-area">
                      <input
                        type="file"
                        id={`file-${slideIndex}-${blockIndex}`}
                        accept={
                          block.type === 'image' ? 'image/*' :
                          block.type === 'pdf' ? 'application/pdf' :
                          block.type === 'video' ? 'video/*' :
                          block.type === 'audio' ? 'audio/*' :
                          block.type === 'markdown' ? '.md' : ''
                        }
                        onChange={(e) => handleFileUpload(slideIndex, blockIndex, e.target.files[0])}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor={`file-${slideIndex}-${blockIndex}`} className="file-upload-label">
                        {uploading[`${slideIndex}-${blockIndex}`] ? (
                          <span>Uploading...</span>
                        ) : block.content ? (
                          <div className="file-preview">
                            {getContentIcon(block.type)}
                            <span>File uploaded ✓</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleContentBlockChange(slideIndex, blockIndex, 'content', '');
                              }}
                              className="btn-change-file"
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <>
                            <FiUpload size={24} />
                            <span>Click to upload {block.type}</span>
                          </>
                        )}
                      </label>
                    </div>
                  )}

                  {block.type === 'youtube' && (
                    <input
                      type="url"
                      value={block.content}
                      onChange={(e) => handleContentBlockChange(slideIndex, blockIndex, 'content', e.target.value)}
                      placeholder="Enter YouTube video URL (e.g., https://www.youtube.com/watch?v=...)"
                      className="youtube-input"
                    />
                  )}
                </div>
              ))}

              {/* Add Content Block Button */}
              <button
                type="button"
                onClick={() => handleAddContentBlock(slideIndex)}
                className="btn-add-content-block"
              >
                <FiPlus size={16} />
                Add Content Block
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddSlide}
            className="btn-add-slide"
          >
            <FiPlus size={20} />
            Add Slide
          </button>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Document'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateDocument;