import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentAPI, commentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiChevronLeft, FiChevronRight, FiMessageSquare, FiHeart, FiEdit2, FiTrash2 } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './DocumentViewer.css';

const DocumentViewer = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const BASE_URL = API_URL.replace('/api', '');

  useEffect(() => {
    fetchDocument();
  }, [id]);

  useEffect(() => {
    if (slides.length > 0) {
      fetchComments(slides[currentSlide]._id);
    }
  }, [currentSlide, slides]);

  const fetchDocument = async () => {
    try {
      const response = await documentAPI.getById(id);
      setDocument(response.data.document);
      setSlides(response.data.slides);
    } catch (error) {
      console.error('Error fetching document:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (slideId) => {
    try {
      const response = await commentAPI.getBySlide(slideId);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await commentAPI.create({
        slideId: slides[currentSlide]._id,
        documentId: id,
        text: newComment
      });
      setNewComment('');
      fetchComments(slides[currentSlide]._id);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await documentAPI.like(id);
      setDocument(response.data.document);
    } catch (error) {
      console.error('Error liking document:', error);
    }
  };

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await documentAPI.delete(id);
      navigate('/profile');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    
    let videoId = '';
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  const renderContentBlock = (block, index) => {
    switch(block.type) {
      case 'text':
        return (
          <div key={index} className="content-block text-block">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {block.content}
            </ReactMarkdown>
          </div>
        );
      
      case 'image':
        return (
          <div key={index} className="content-block image-block">
            <img 
              src={`${BASE_URL}${block.content}`}
              alt={`Content ${index + 1}`}
              className="slide-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" text-anchor="middle" fill="gray">Image not found</text></svg>';
              }}
            />
          </div>
        );
      
      case 'pdf':
        return (
          <div key={index} className="content-block pdf-block">
            <iframe
              src={`${BASE_URL}${block.content}`}
              title={`PDF ${index + 1}`}
              className="pdf-viewer"
            />
            <a 
              href={`${BASE_URL}${block.content}`}
              target="_blank"
              rel="noopener noreferrer"
              className="pdf-download-link"
            >
              Open PDF in new tab
            </a>
          </div>
        );
      
      case 'video':
        return (
          <div key={index} className="content-block video-block">
            <video 
              controls 
              className="slide-video"
              src={`${BASE_URL}${block.content}`}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      
      case 'audio':
        return (
          <div key={index} className="content-block audio-block">
            <audio 
              controls 
              className="slide-audio"
              src={`${BASE_URL}${block.content}`}
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      
      case 'youtube':
        const embedUrl = getYouTubeEmbedUrl(block.content);
        return embedUrl ? (
          <div key={index} className="content-block youtube-block">
            <iframe
              src={embedUrl}
              title={`YouTube Video ${index + 1}`}
              className="slide-youtube"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div key={index} className="content-block error-block">
            Invalid YouTube URL
          </div>
        );
      
      case 'markdown':
        return (
          <div key={index} className="content-block markdown-block">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {block.content}
            </ReactMarkdown>
          </div>
        );
      
      default:
        return (
          <div key={index} className="content-block text-block">
            {block.content}
          </div>
        );
    }
  };

  const renderSlideContent = (slide) => {
    // Support both new multi-content format and old single content format
    if (slide.contentBlocks && slide.contentBlocks.length > 0) {
      return (
        <div className="multi-content-container">
          {slide.contentBlocks
            .sort((a, b) => a.order - b.order)
            .map((block, index) => renderContentBlock(block, index))}
        </div>
      );
    } else {
      // Fallback to old single content format
      const block = {
        type: slide.contentType || 'text',
        content: slide.content || '',
        order: 0
      };
      return renderContentBlock(block, 0);
    }
  };

  const isLikedByUser = () => {
    if (!user || !document || !document.likes) return false;
    return document.likes.includes(user.id);
  };

  const isOwner = () => {
    return user && document && document.author._id === user.id;
  };

  if (loading) return <div className="loading">Loading document...</div>;
  if (!document) return <div className="error">Document not found</div>;

  return (
    <div className="viewer-container">
      <div className="viewer-header">
        <div className="header-left">
          <h1>{document.title}</h1>
          <p className="author">by {document.author?.name}</p>
        </div>
        <div className="header-actions">
          <button
            className={`like-button-large ${isLikedByUser() ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <FiHeart size={20} />
            <span>{document.likes?.length || 0} likes</span>
          </button>
          {isOwner() && (
            <>
              <button className="btn-edit" onClick={handleEdit}>
                <FiEdit2 size={18} />
                <span>Edit</span>
              </button>
              <button className="btn-delete" onClick={() => setShowDeleteModal(true)}>
                <FiTrash2 size={18} />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="viewer-main">
        <div className="slide-section">
          <div className="slide-container">
            {slides.length > 0 && (
              <div className="slide-content">
                {renderSlideContent(slides[currentSlide])}
              </div>
            )}
          </div>

          <div className="slide-navigation">
            <button
              onClick={handlePrevSlide}
              disabled={currentSlide === 0}
              className="nav-button"
            >
              <FiChevronLeft size={24} />
            </button>
            <span className="slide-counter">
              {currentSlide + 1} / {slides.length}
            </span>
            <button
              onClick={handleNextSlide}
              disabled={currentSlide === slides.length - 1}
              className="nav-button"
            >
              <FiChevronRight size={24} />
            </button>
          </div>
        </div>

        <div className="comments-section">
          <div className="comments-header">
            <FiMessageSquare size={20} />
            <h3>Comments</h3>
          </div>

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet. Be the first!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="comment">
                  <div className="comment-header">
                    <span className="comment-author">{comment.author?.name}</span>
                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              ))
            )}
          </div>

          {user && (
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ask a question or leave a comment..."
                rows="3"
              />
              <button type="submit" className="btn-primary">
                Post Comment
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Document</h2>
            <p>Are you sure you want to delete "{document.title}"? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="btn-danger" 
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;