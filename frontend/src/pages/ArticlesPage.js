import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getArticles } from '../services/articleService';
import { FiFileText } from 'react-icons/fi';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

const todayFull = () =>
  new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getArticles()
      .then(setArticles)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Chargement...</div>;

  const [featured, ...rest] = articles;

  return (
    <div className="articles-page">

      {/* ── Masthead ── */}
      <div className="journal-masthead">
        <div className="journal-rule" />
        <h1 className="journal-title">Articles</h1>
        <div className="journal-rule" />
        <p className="journal-subtitle">Réflexions &amp; analyses — Prof. El Amri Amnay</p>
        <p className="journal-today">{todayFull()}</p>
      </div>

      {articles.length === 0 ? (
        <div className="empty-state">
          <FiFileText size={48} />
          <p>Aucun article pour le moment.</p>
        </div>
      ) : (
        <>
          {/* ── Article à la une ── */}
          {featured && (
            <Link to={`/articles/${featured.id}`} className="journal-featured">
              <div className="journal-featured-cover">{featured.coverEmoji || '📝'}</div>
              <div className="journal-featured-body">
                <div className="journal-article-meta">
                  <span className="journal-article-date">{formatDate(featured.date)}</span>
                  {(featured.tags || []).map(t => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
                <h2 className="journal-featured-title">{featured.title}</h2>
                {featured.excerpt && (
                  <p className="journal-featured-excerpt">{featured.excerpt}</p>
                )}
                <span className="journal-read-more">Lire l'article →</span>
              </div>
            </Link>
          )}

          {/* ── Grille des autres articles ── */}
          {rest.length > 0 && (
            <>
              <div className="journal-divider" />
              <div className="journal-grid">
                {rest.map(article => (
                  <Link key={article.id} to={`/articles/${article.id}`} className="journal-card">
                    <div className="journal-card-cover">{article.coverEmoji || '📝'}</div>
                    <div className="journal-card-meta">
                      <span>{formatDate(article.date)}</span>
                      {article.readTime && <span>{article.readTime} min</span>}
                    </div>
                    <h3>{article.title}</h3>
                    {article.excerpt && <p>{article.excerpt}</p>}
                    <div className="tags">
                      {(article.tags || []).map(t => (
                        <span key={t} className="tag">{t}</span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ArticlesPage;
