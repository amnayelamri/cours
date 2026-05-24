import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArticle, createArticle, updateArticle } from '../../services/articleService';
import MarkdownViewer from '../../components/viewers/MarkdownViewer';
import { FiArrowLeft, FiSave, FiEye, FiEdit2 } from 'react-icons/fi';

const ArticleEditor = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const isNew     = !id;

  const [form, setForm] = useState({
    title:      '',
    excerpt:    '',
    content:    '',
    tags:       '',
    coverEmoji: '📝',
    readTime:   '',
  });
  const [preview, setPreview] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!isNew) {
      getArticle(id).then(a => setForm({
        ...a,
        tags:     (a.tags || []).join(', '),
        readTime: a.readTime ?? '',
      }));
    }
  }, [id]); // eslint-disable-line

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Le titre est requis.'); return; }
    setSaving(true); setError('');
    try {
      const article = {
        ...form,
        tags:     form.tags.split(',').map(t => t.trim()).filter(Boolean),
        readTime: form.readTime ? parseInt(form.readTime) : null,
      };
      if (isNew) {
        await createArticle(article);
      } else {
        await updateArticle(id, { ...article, id });
      }
      navigate('/dashboard');
    } catch (e) {
      setError('Erreur : ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="editor-page">
      <div className="editor-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          <FiArrowLeft size={15} /> Retour
        </button>
        <h1>{isNew ? 'Nouvel article' : "Modifier l'article"}</h1>
        <button className="btn-secondary" onClick={() => setPreview(p => !p)}>
          {preview ? <FiEdit2 size={15} /> : <FiEye size={15} />}
          {preview ? 'Éditer' : 'Aperçu'}
        </button>
        <button className="btn-primary save-btn" onClick={handleSave} disabled={saving || !form.title.trim()}>
          <FiSave size={15} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {preview ? (
        <div className="preview-box" style={{ maxWidth: 720 }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, marginBottom: 12 }}>
            {form.title || 'Sans titre'}
          </h1>
          {form.excerpt && (
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', fontStyle: 'italic',
              borderLeft: '3px solid var(--border-color)', paddingLeft: 14, marginBottom: 24 }}>
              {form.excerpt}
            </p>
          )}
          <MarkdownViewer content={form.content} />
        </div>
      ) : (
        <div className="meta-form">
          {/* Ligne emoji + titre + durée */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="form-group" style={{ flex: '0 0 70px' }}>
              <label>Emoji</label>
              <input
                value={form.coverEmoji}
                onChange={e => set('coverEmoji', e.target.value.slice(-2))}
                maxLength={2}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Titre *</label>
              <input
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="Titre de l'article"
                autoFocus
              />
            </div>
            <div className="form-group" style={{ flex: '0 0 100px' }}>
              <label>Lecture (min)</label>
              <input
                type="number"
                value={form.readTime}
                onChange={e => set('readTime', e.target.value)}
                placeholder="5"
                min={1}
              />
            </div>
          </div>

          {/* Chapeau */}
          <div className="form-group">
            <label>Chapeau</label>
            <textarea
              value={form.excerpt}
              onChange={e => set('excerpt', e.target.value)}
              rows={2}
              placeholder="Une phrase d'accroche qui résume l'article..."
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags (séparés par des virgules)</label>
            <input
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
              placeholder="Mathématiques, Philosophie, Éducation"
            />
          </div>

          {/* Contenu */}
          <div className="form-group">
            <label>Contenu (Markdown)</label>
            <textarea
              value={form.content}
              onChange={e => set('content', e.target.value)}
              rows={28}
              style={{ fontFamily: 'Courier New, monospace', fontSize: 13, lineHeight: 1.6 }}
              placeholder={"# Mon article\n\nÉcrivez votre contenu en Markdown..."}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleEditor;
