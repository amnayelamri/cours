import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import { getCourses } from '../services/courseService';
import { getCollections } from '../services/collectionService';
import { FiArrowLeft, FiFolder } from 'react-icons/fi';

const CollectionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getCollections(), getCourses()])
      .then(([collections, allCourses]) => {
        const col = collections.find(c => c.id === id);
        if (!col) { setError('Dossier introuvable.'); return; }
        setCollection(col);
        // Respecter l'ordre défini dans courseIds
        const ordered = col.courseIds
          .map(cid => allCourses.find(c => c.id === cid))
          .filter(Boolean);
        setCourses(ordered);
      })
      .catch(() => setError('Impossible de charger ce dossier.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Chargement du dossier...</div>;
  if (error)   return <div className="error">{error}</div>;

  return (
    <div className="collection-page">
      {/* Breadcrumb */}
      <div className="collection-breadcrumb">
        <button className="back-btn" onClick={() => navigate('/')}>
          <FiArrowLeft size={16} /> Retour
        </button>
      </div>

      {/* Header */}
      <div className="collection-header">
        <div className="collection-header-icon">
          {collection.emoji
            ? <span>{collection.emoji}</span>
            : <FiFolder size={32} />}
        </div>
        <div>
          <h1>{collection.title}</h1>
          {collection.description && <p>{collection.description}</p>}
          <span className="collection-header-count">
            {courses.length} cours dans ce dossier
          </span>
        </div>
      </div>

      {/* Grid de cours */}
      {courses.length === 0 ? (
        <div className="empty-state">
          <FiFolder size={48} />
          <p>Ce dossier est vide.</p>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map(c => <CourseCard key={c.id} course={c} />)}
        </div>
      )}
    </div>
  );
};

export default CollectionPage;
