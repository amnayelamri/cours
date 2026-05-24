import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArticle } from '../services/articleService';
import MarkdownViewer from '../components/viewers/MarkdownViewer';
import { FiArrowLeft, FiClock } from 'react-icons/fi';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

const ArticlePage = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArticle(id)
      .then(setArticle)
      .catch(() => navigate('/articles'))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line

  if (loading) return <div className="loading">Chargement...</div>;
  if (!article)  return null;

  return (
    <div className="article-read-page">
      <div className="article-read-nav">
        <button onClick={() => navigate('/articles')} className="back-btn">
          <FiArrowLeft size={15} /> Articles
        </button>
      </div>

      <article className="article-read-content">
        {/* Méta */}
        <div className="article-read-meta">
          <span className="journal-article-date">{formatDate(article.date)}</span>
          {article.readTime && (
            <span className="article-read-time">
              <FiClock size={12} /> {article.readTime} min de lecture
            </span>
          )}
          <div className="tags">
            {(article.tags || []).map(t => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        </div>

        {/* Titre */}
        <h1 className="article-read-title">{article.title}</h1>

        {/* Chapeau */}
        {article.excerpt && (
          <p className="article-read-excerpt">{article.excerpt}</p>
        )}

        <div className="article-read-divider" />

        {/* Corps */}
        <div className="article-read-body">
          <MarkdownViewer content={article.content || ''} />
        </div>

        {/* Pied */}
        <div className="article-read-footer">
          <span>— Prof. El Amri Amnay</span>
          <span>{formatDate(article.date)}</span>
        </div>
      </article>
    </div>
  );
};

export default ArticlePage;
