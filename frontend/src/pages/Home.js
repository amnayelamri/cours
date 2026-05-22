import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import CollectionCard from '../components/CollectionCard';
import { getCourses } from '../services/courseService';
import { getCollections } from '../services/collectionService';
import { FiSearch, FiBook, FiFolder } from 'react-icons/fi';

const isLocal = window.location.hostname === 'localhost';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getCourses(), getCollections()])
      .then(([c, col]) => { setCourses(c); setCollections(col); })
      .catch(() => setError('Impossible de charger les cours.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const isSearching = search.trim().length > 0;

  if (loading) return <div className="loading">Chargement des cours...</div>;

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Explorer les cours</h1>
        <div className="search-bar">
          <FiSearch size={16} />
          <input
            placeholder="Rechercher un cours..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {/* ── Dossiers (cachés pendant la recherche) ── */}
      {!isSearching && collections.length > 0 && (
        <section className="home-section">
          <h2 className="home-section-title">
            <FiFolder size={18} /> Dossiers
          </h2>
          <div className="collections-list">
            {collections.map(col => (
              <CollectionCard key={col.id} collection={col} />
            ))}
          </div>
        </section>
      )}

      {/* ── Tous les cours ── */}
      <section className="home-section">
        <h2 className="home-section-title">
          <FiBook size={18} />
          {isSearching
            ? `Résultats (${filtered.length})`
            : 'Tous les cours'}
        </h2>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <FiBook size={56} />
            <p>Aucun cours trouvé.</p>
            {isLocal && (
              <Link to="/dashboard" className="btn-primary">
                Créer le premier cours
              </Link>
            )}
          </div>
        ) : (
          <div className="courses-grid">
            {filtered.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
