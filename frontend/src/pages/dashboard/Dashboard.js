import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getCourses, deleteCourse, createCourse } from '../../services/courseService';
import {
  getCollections, createCollection, updateCollection, deleteCollection
} from '../../services/collectionService';
import { getArticles, deleteArticle } from '../../services/articleService';
import {
  FiPlus, FiUpload, FiEdit2, FiTrash2, FiBook, FiEye,
  FiClipboard, FiX, FiCheck, FiFolder, FiFolderPlus, FiSave, FiFileText
} from 'react-icons/fi';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });

const JSON_SCHEMA = {
  id: "id-optionnel (auto-généré si absent)",
  title: "Titre du cours (requis)",
  description: "Description courte",
  tags: ["tag1", "tag2"],
  slides: [
    { id: "s1", title: "Titre slide", type: "markdown", content: "# Contenu Markdown" },
    { id: "s2", title: "Vidéo", type: "video", url: "https://youtube.com/watch?v=..." },
    { id: "s3", title: "QCM", type: "quiz",
      question: "Question ?",
      choices: [
        { id: "a", text: "Bonne réponse", correct: true },
        { id: "b", text: "Mauvaise réponse", correct: false }
      ],
      explanation: "Explication optionnelle"
    }
  ]
};

// ─── Composant modal création/édition de dossier ───────────────────────────
const CollectionModal = ({ collection, courses, onSave, onClose }) => {
  const isNew = !collection?.id;
  const [form, setForm] = useState({
    title:       collection?.title       || '',
    emoji:       collection?.emoji       || '',
    description: collection?.description || '',
    courseIds:   collection?.courseIds   || [],
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleCourse = (id) =>
    set('courseIds', form.courseIds.includes(id)
      ? form.courseIds.filter(c => c !== id)
      : [...form.courseIds, id]);

  const handleSave = async () => {
    if (!form.title.trim()) { setErr('Le titre est requis.'); return; }
    setSaving(true);
    setErr('');
    try {
      if (isNew) {
        await createCollection(form);
      } else {
        await updateCollection(collection.id, { ...collection, ...form });
      }
      onSave();
    } catch (e) {
      setErr('Erreur : ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="paste-modal-overlay" onClick={onClose}>
      <div className="paste-modal col-modal" onClick={e => e.stopPropagation()}>
        <div className="paste-modal-header">
          <h2>
            <FiFolder size={18} />
            {isNew ? 'Nouveau dossier' : 'Modifier le dossier'}
          </h2>
          <button onClick={onClose} className="close-btn"><FiX size={18} /></button>
        </div>

        <div className="col-form">
          {/* Emoji + Titre */}
          <div className="col-form-row">
            <div className="col-form-field" style={{ flex: '0 0 80px' }}>
              <label>Emoji</label>
              <input
                className="col-input"
                value={form.emoji}
                onChange={e => set('emoji', e.target.value.slice(-2))}
                placeholder="📁"
                maxLength={2}
              />
            </div>
            <div className="col-form-field" style={{ flex: 1 }}>
              <label>Titre <span className="required">*</span></label>
              <input
                className="col-input"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="Ex : Terminale Spé Maths"
                autoFocus
              />
            </div>
          </div>

          {/* Description */}
          <div className="col-form-field">
            <label>Description</label>
            <textarea
              className="col-input col-textarea"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Description courte du dossier..."
              rows={2}
            />
          </div>

          {/* Sélection des cours */}
          <div className="col-form-field">
            <label>
              Cours dans ce dossier
              <span className="col-count"> ({form.courseIds.length} sélectionné{form.courseIds.length !== 1 ? 's' : ''})</span>
            </label>
            <div className="col-course-list">
              {courses.length === 0 && (
                <p className="col-no-courses">Aucun cours disponible.</p>
              )}
              {courses.map(c => (
                <label key={c.id} className={`col-course-item${form.courseIds.includes(c.id) ? ' selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.courseIds.includes(c.id)}
                    onChange={() => toggleCourse(c.id)}
                  />
                  <span className="col-course-title">{c.title}</span>
                  {c.tags?.length > 0 && (
                    <span className="col-course-tag">{c.tags[0]}</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>

        {err && <div className="error-message">{err}</div>}

        <div className="paste-modal-footer">
          <button onClick={onClose} className="btn-secondary">Annuler</button>
          <button onClick={handleSave} className="btn-primary" disabled={saving || !form.title.trim()}>
            <FiSave size={15} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Dashboard principal ───────────────────────────────────────────────────
const Dashboard = () => {
  const [tab, setTab]               = useState('cours');
  const [courses, setCourses]       = useState([]);
  const [collections, setCollections] = useState([]);
  const [articles,    setArticles]    = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [pasteOpen, setPasteOpen]   = useState(false);
  const [pasteText, setPasteText]   = useState('');
  const [pasteError, setPasteError] = useState('');
  const [editingCol, setEditingCol] = useState(null); // null | false (new) | collection obj
  const textareaRef = useRef(null);

  const loadAll = () => {
    setLoading(true);
    Promise.all([getCourses(), getCollections(), getArticles()])
      .then(([c, col, art]) => { setCourses(c); setCollections(col); setArticles(art); })
      .catch(() => setError('Impossible de charger les données.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  // ── Cours ──
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Supprimer "${title}" ?`)) return;
    try { await deleteCourse(id); setCourses(p => p.filter(c => c.id !== id)); }
    catch { setError('Erreur lors de la suppression.'); }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.title) throw new Error('Le champ "title" est requis.');
        await createCourse(data);
        loadAll();
      } catch (err) { setError('JSON invalide : ' + err.message); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const openPaste = () => {
    setPasteText(''); setPasteError(''); setPasteOpen(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handlePasteImport = async () => {
    setPasteError('');
    try {
      const data = JSON.parse(pasteText);
      if (!data.title) throw new Error('Le champ "title" est requis.');
      await createCourse(data);
      setPasteOpen(false); setPasteText(''); loadAll();
    } catch (err) { setPasteError('JSON invalide : ' + err.message); }
  };

  // ── Collections ──
  const handleDeleteCol = async (col) => {
    if (!window.confirm(`Supprimer le dossier "${col.title}" ?`)) return;
    try { await deleteCollection(col.id); setCollections(p => p.filter(c => c.id !== col.id)); }
    catch { setError('Erreur lors de la suppression du dossier.'); }
  };

  const handleColSaved = () => { setEditingCol(null); loadAll(); };

  const handleDeleteArticle = async (art) => {
    if (!window.confirm(`Supprimer "${art.title}" ?`)) return;
    try { await deleteArticle(art.id); setArticles(p => p.filter(a => a.id !== art.id)); }
    catch { setError('Erreur lors de la suppression.'); }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="dashboard-page">
      {/* ── Tabs ── */}
      <div className="dash-tabs">
        <button
          className={`dash-tab${tab === 'cours' ? ' active' : ''}`}
          onClick={() => setTab('cours')}
        >
          <FiBook size={15} /> Cours ({courses.length})
        </button>
        <button
          className={`dash-tab${tab === 'dossiers' ? ' active' : ''}`}
          onClick={() => setTab('dossiers')}
        >
          <FiFolder size={15} /> Dossiers ({collections.length})
        </button>
        <button
          className={`dash-tab${tab === 'articles' ? ' active' : ''}`}
          onClick={() => setTab('articles')}
        >
          <FiFileText size={15} /> Articles ({articles.length})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* ══════════════ TAB COURS ══════════════ */}
      {tab === 'cours' && (
        <>
          <div className="dashboard-header">
            <h1>Mes cours</h1>
            <div className="dashboard-actions">
              <button className="btn-secondary import-btn" onClick={openPaste}>
                <FiClipboard size={15} /> Coller JSON
              </button>
              <label className="btn-secondary import-btn">
                <FiUpload size={15} /> Fichier JSON
                <input type="file" accept=".json" onChange={handleImport} hidden />
              </label>
              <Link to="/dashboard/new" className="btn-primary">
                <FiPlus size={15} /> Nouveau cours
              </Link>
            </div>
          </div>

          {pasteOpen && (
            <div className="paste-modal-overlay" onClick={() => setPasteOpen(false)}>
              <div className="paste-modal" onClick={e => e.stopPropagation()}>
                <div className="paste-modal-header">
                  <h2><FiClipboard size={18} /> Coller le JSON généré par l'IA</h2>
                  <button onClick={() => setPasteOpen(false)} className="close-btn"><FiX size={18} /></button>
                </div>
                <p className="paste-hint">Copie le JSON depuis l'IA et colle-le ici.</p>
                <textarea
                  ref={textareaRef}
                  className="paste-textarea"
                  value={pasteText}
                  onChange={e => { setPasteText(e.target.value); setPasteError(''); }}
                  placeholder={'{\n  "title": "Mon cours",\n  "slides": [...]\n}'}
                  rows={16}
                  spellCheck={false}
                />
                {pasteError && <div className="error-message">{pasteError}</div>}
                <div className="paste-modal-footer">
                  <button onClick={() => setPasteOpen(false)} className="btn-secondary">Annuler</button>
                  <button onClick={handlePasteImport} className="btn-primary" disabled={!pasteText.trim()}>
                    <FiCheck size={15} /> Importer le cours
                  </button>
                </div>
              </div>
            </div>
          )}

          {courses.length === 0 ? (
            <div className="empty-state">
              <FiBook size={56} />
              <p>Aucun cours. Créez-en un ou importez un fichier JSON.</p>
            </div>
          ) : (
            <div className="dashboard-courses">
              {courses.map(course => (
                <div key={course.id} className="dashboard-row">
                  <div className="course-info">
                    <h3>{course.title}</h3>
                    {course.description && <p>{course.description}</p>}
                    <div className="course-meta">
                      <span>{course.slideCount} slide{course.slideCount !== 1 ? 's' : ''}</span>
                      {(course.tags || []).map(t => <span key={t} className="tag">{t}</span>)}
                    </div>
                  </div>
                  <div className="row-actions">
                    <Link to={`/course/${course.id}`} className="btn-secondary icon-btn" title="Voir">
                      <FiEye size={15} />
                    </Link>
                    <Link to={`/dashboard/edit/${course.id}`} className="btn-secondary icon-btn" title="Modifier">
                      <FiEdit2 size={15} />
                    </Link>
                    <button
                      className="btn-danger icon-btn"
                      onClick={() => handleDelete(course.id, course.title)}
                      title="Supprimer"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="schema-box">
            <h3>Structure JSON pour générer un cours avec une IA</h3>
            <p className="schema-hint">Copiez ce schéma, donnez-le à une IA avec votre contenu, puis importez le JSON généré.</p>
            <pre>{JSON.stringify(JSON_SCHEMA, null, 2)}</pre>
          </div>
        </>
      )}

      {/* ══════════════ TAB DOSSIERS ══════════════ */}
      {tab === 'dossiers' && (
        <>
          <div className="dashboard-header">
            <h1>Mes dossiers</h1>
            <button className="btn-primary" onClick={() => setEditingCol({})}>
              <FiFolderPlus size={15} /> Nouveau dossier
            </button>
          </div>

          {collections.length === 0 ? (
            <div className="empty-state">
              <FiFolder size={56} />
              <p>Aucun dossier. Créez-en un pour regrouper vos cours.</p>
            </div>
          ) : (
            <div className="dashboard-courses">
              {collections.map(col => (
                <div key={col.id} className="dashboard-row">
                  <div className="course-info" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{col.emoji || '📁'}</span>
                    <div style={{ minWidth: 0 }}>
                      <h3>{col.title}</h3>
                      {col.description && <p>{col.description}</p>}
                      <div className="course-meta">
                        <span>{col.courseIds.length} cours</span>
                      </div>
                    </div>
                  </div>
                  <div className="row-actions">
                    <Link to={`/collection/${col.id}`} className="btn-secondary icon-btn" title="Voir">
                      <FiEye size={15} />
                    </Link>
                    <button
                      className="btn-secondary icon-btn"
                      onClick={() => setEditingCol(col)}
                      title="Modifier"
                    >
                      <FiEdit2 size={15} />
                    </button>
                    <button
                      className="btn-danger icon-btn"
                      onClick={() => handleDeleteCol(col)}
                      title="Supprimer"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ══════════════ TAB ARTICLES ══════════════ */}
      {tab === 'articles' && (
        <>
          <div className="dashboard-header">
            <h1>Mes articles</h1>
            <Link to="/dashboard/articles/new" className="btn-primary">
              <FiPlus size={15} /> Nouvel article
            </Link>
          </div>

          {articles.length === 0 ? (
            <div className="empty-state">
              <FiFileText size={56} />
              <p>Aucun article. Créez-en un depuis l'éditeur.</p>
            </div>
          ) : (
            <div className="dashboard-courses">
              {articles.map(art => (
                <div key={art.id} className="dashboard-row">
                  <div className="course-info">
                    <h3>{art.coverEmoji || '📝'} {art.title}</h3>
                    {art.excerpt && <p>{art.excerpt}</p>}
                    <div className="course-meta">
                      <span>{formatDate(art.date)}</span>
                      {art.readTime && <span>{art.readTime} min</span>}
                      {(art.tags || []).map(t => <span key={t} className="tag">{t}</span>)}
                    </div>
                  </div>
                  <div className="row-actions">
                    <Link to={`/articles/${art.id}`} className="btn-secondary icon-btn" title="Voir">
                      <FiEye size={15} />
                    </Link>
                    <Link to={`/dashboard/articles/edit/${art.id}`} className="btn-secondary icon-btn" title="Modifier">
                      <FiEdit2 size={15} />
                    </Link>
                    <button className="btn-danger icon-btn" onClick={() => handleDeleteArticle(art)} title="Supprimer">
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Modal dossier ── */}
      {editingCol !== null && (
        <CollectionModal
          collection={editingCol && editingCol.id ? editingCol : null}
          courses={courses}
          onSave={handleColSaved}
          onClose={() => setEditingCol(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
