import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { documentAPI, slideAPI, uploadAPI } from '../services/api';
import { FiPlus, FiTrash2, FiUpload, FiImage, FiFile, FiVideo, FiMusic, FiType } from 'react-icons/fi';
import './EditDocument.css';

const EditDocument = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const response = await documentAPI.getById(id);
      setTitle(response.data.document.title);
      setDescription(response.data.document.description || '');
      
      // Convert slides to editable format
      const formattedSlides = response.data.slides.map(slide => {
        // Support both new multi-content and old single content format
        if (slide.contentBlocks && slide.contentBlocks.length > 0) {
          return {
            _id: slide._id,
            contentBlocks: slide.contentBlocks,
            order: slide.order
          };
        } else {
          // Convert old format to new format
          return {
            _id: slide._id,
            contentBlocks: [{
              type: slide.contentType || 'text',
              content: slide.content || '',
              order: 0
            }],
            order: slide.order
          };
        }
      });
      
      setSlides(formattedSlides);
    } catch (error) {
      console.error('Error fetching document:', error);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlide = () => {
    setSlides([
      ...slides,
      { contentBlocks: [{ type: 'text', content: '', order: 0 }], order: slides.length }
    ]);
  };

  const handleRemoveSlide = async (index) => {
    const slide = slides[index];
    
    // If slide has an ID, delete it from the database
    if (slide._id) {
      try {
        await slideAPI.delete(slide._id);
      } catch (error) {
        console.error('Error deleting slide:', error);
      }
    }
    
    const newSlides = slides.filter((_, i) => i !== index);
    const reorderedSlides = newSlides.map((s, i) => ({ ...s, order: i }));
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

    const validSlides = slides.filter(slide =>
      slide.contentBlocks.some(block => block.content.trim())
    );

    if (validSlides.length === 0) {
      setError('At least one slide with content is required');
      return;
    }

    setSaving(true);

    try {
      // Update document metadata
      await documentAPI.update(id, { title, description });

      // Update/create slides
      for (const slide of validSlides) {
        const validBlocks = slide.contentBlocks.filter(block => block.content.trim());
        
        if (slide._id) {
          // Update existing slide
          await slideAPI.update(slide._id, {
            contentBlocks: validBlocks,
            order: slide.order
          });
        } else {
          // Create new slide
          await slideAPI.create({
            documentId: id,
            contentBlocks: validBlocks,
            order: slide.order
          });
        }
      }

      navigate(`/document/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update document');
    } finally {
      setSaving(false);
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

  if (loading) return <div className="loading">Loading document...</div>;

  return (
    <div className="edit-document-container">
      <div className="edit-header">
        <h1>Edit Document</h1>
        <p>Update your educational content</p>
      </div>

      <form onSubmit={handleSubmit} className="edit-form">
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
                                document.getElementById(`file-${slideIndex}-${blockIndex}`).click();
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
            onClick={() => navigate(`/document/${id}`)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDocument;