import React, { useState, useEffect } from 'react';
import { getProjects } from '../services/projectService';
import { FiExternalLink, FiCode } from 'react-icons/fi';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="projects-page">

      {/* ── En-tête ── */}
      <div className="projects-header">
        <div className="journal-rule" />
        <h1 className="journal-title">Projets</h1>
        <div className="journal-rule" />
        <p className="journal-subtitle">Sites et applications développés par Prof. El Amri Amnay</p>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <FiCode size={48} />
          <p>Aucun projet pour le moment.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-card-emoji">{project.emoji || '🌐'}</div>
              <div className="project-card-body">
                <h2 className="project-card-title">{project.title}</h2>
                {project.description && (
                  <p className="project-card-desc">{project.description}</p>
                )}
                {(project.tags || []).length > 0 && (
                  <div className="tags">
                    {project.tags.map(t => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="project-card-link"
              >
                Voir le projet <FiExternalLink size={14} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
