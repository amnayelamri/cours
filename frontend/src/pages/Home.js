import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import { getCourses } from '../services/courseService';
import { FiSearch, FiBook } from 'react-icons/fi';

const isLocal = window.location.hostname === 'localhost';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch(() => setError('Impossible de charger les cours.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="loading">Chargement des cours...</div>;

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Explorer les cours</h1>
        <div className="search-bar">
          <FiSearch size={16} />
          <input
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error">{error}</div>}

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
    </div>
  );
};

export default Home;
