import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { documentAPI, commentAPI } from '../services/api';
import { FiBook, FiMessageSquare, FiUser, FiEdit2, FiTrash2 } from 'react-icons/fi';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myDocuments, setMyDocuments] = useState([]);
  const [commentsOnMyDocs, setCommentsOnMyDocs] = useState([]);
  const [activeTab, setActiveTab] = useState('documents');
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ show: false, docId: null, docTitle: '' });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const [docsResponse, commentsResponse] = await Promise.all([
        documentAPI.getByUser(user.id),
        commentAPI.getMyDocumentsComments()
      ]);
      setMyDocuments(docsResponse.data);
      setCommentsOnMyDocs(commentsResponse.data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (e, docId) => {
    e.stopPropagation();
    navigate(`/edit/${docId}`);
  };

  const handleDeleteClick = (e, docId, docTitle) => {
    e.stopPropagation();
    setDeleteModal({ show: true, docId, docTitle });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await documentAPI.delete(deleteModal.docId);
      setMyDocuments(myDocuments.filter(doc => doc._id !== deleteModal.docId));
      setDeleteModal({ show: false, docId: null, docTitle: '' });
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <FiUser size={48} />
        </div>
        <div className="profile-info">
          <h1>{user?.name}</h1>
          <p>{user?.email}</p>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <FiBook size={20} />
          My Documents ({myDocuments.length})
        </button>
        <button
          className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          <FiMessageSquare size={20} />
          Comments on My Docs ({commentsOnMyDocs.length})
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'documents' && (
          <div className="documents-list">
            {myDocuments.length === 0 ? (
              <div className="empty-state">
                <FiBook size={48} />
                <p>You haven't created any documents yet</p>
              </div>
            ) : (
              myDocuments.map((doc) => (
                <div
                  key={doc._id}
                  className="document-item"
                  onClick={() => navigate(`/document/${doc._id}`)}
                >
                  <div className="document-icon">
                    <FiBook size={24} />
                  </div>
                  <div className="document-details">
                    <h3>{doc.title}</h3>
                    {doc.description && <p>{doc.description}</p>}
                    <span className="document-date">{formatDate(doc.createdAt)}</span>
                  </div>
                  <div className="document-actions">
                    <button
                      className="btn-edit-small"
                      onClick={(e) => handleEdit(e, doc._id)}
                      title="Edit document"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      className="btn-delete-small"
                      onClick={(e) => handleDeleteClick(e, doc._id, doc.title)}
                      title="Delete document"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="comments-list">
            {commentsOnMyDocs.length === 0 ? (
              <div className="empty-state">
                <FiMessageSquare size={48} />
                <p>No comments on your documents yet</p>
              </div>
            ) : (
              commentsOnMyDocs.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">
                      <FiUser size={16} />
                      {comment.author?.name}
                    </span>
                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                  <div className="comment-meta">
                    <span>On document: <strong>{comment.documentId?.title}</strong></span>
                    <span>Slide {comment.slideId?.order + 1}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ show: false, docId: null, docTitle: '' })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Document</h2>
            <p>Are you sure you want to delete "{deleteModal.docTitle}"? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setDeleteModal({ show: false, docId: null, docTitle: '' })}
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

export default Profile;