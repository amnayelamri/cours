import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getCourses, deleteCourse, createCourse } from '../../services/courseService';
import { FiPlus, FiUpload, FiEdit2, FiTrash2, FiBook, FiEye, FiClipboard, FiX, FiCheck } from 'react-icons/fi';

const JSON_SCHEMA = {
  id: "id-optionnel (auto-généré si absent)",
  title: "Titre du cours (requis)",
  description: "Description courte",
  tags: ["tag1", "tag2"],
  slides: [
    {
      id: "s1", title: "Titre slide (optionnel)",
      type: "markdown", content: "# Contenu Markdown\n\nTexte, **gras**, *italique*, `code`, listes..."
    },
    {
      id: "s2", title: "Vidéo",
      type: "video", url: "https://youtube.com/watch?v=...", caption: "Légende optionnelle"
    },
    {
      id: "s3", title: "Image",
      type: "image", file: "assets/image.png", caption: "Légende optionnelle"
    },
    {
      id: "s4", title: "PDF",
      type: "pdf", file: "assets/document.pdf"
    },
    {
      id: "s5", title: "HTML brut",
      type: "html", content: "<h1>Contenu HTML</h1>"
    },
    {
      id: "s6", title: "Question QCM",
      type: "quiz",
      question: "Texte de la question ?",
      choices: [
        { id: "a", text: "Bonne réponse", correct: true },
        { id: "b", text: "Mauvaise réponse", correct: false },
        { id: "c", text: "Mauvaise réponse", correct: false },
        { id: "d", text: "Mauvaise réponse", correct: false }
      ],
      explanation: "Explication affichée après réponse (optionnelle)"
    }
  ]
};

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteError, setPasteError] = useState('');
  const textareaRef = useRef(null);

  const load = () => {
    setLoading(true);
    getCourses()
      .then(setCourses)
      .catch(() => setError('Impossible de charger les cours.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Supprimer "${title}" ?`)) return;
    try {
      await deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch {
      setError('Erreur lors de la suppression.');
    }
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
        load();
      } catch (err) {
        setError('JSON invalide : ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const openPaste = () => {
    setPasteText('');
    setPasteError('');
    setPasteOpen(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handlePasteImport = async () => {
    setPasteError('');
    try {
      const data = JSON.parse(pasteText);
      if (!data.title) throw new Error('Le champ "title" est requis.');
      await createCourse(data);
      setPasteOpen(false);
      setPasteText('');
      load();
    } catch (err) {
      setPasteError('JSON invalide : ' + err.message);
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="dashboard-page">
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

      {error && <div className="error-message">{error}</div>}

      {pasteOpen && (
        <div className="paste-modal-overlay" onClick={() => setPasteOpen(false)}>
          <div className="paste-modal" onClick={e => e.stopPropagation()}>
            <div className="paste-modal-header">
              <h2><FiClipboard size={18} /> Coller le JSON généré par l'IA</h2>
              <button onClick={() => setPasteOpen(false)} className="close-btn"><FiX size={18} /></button>
            </div>
            <p className="paste-hint">
              Copie le JSON depuis l'IA et colle-le ici directement.
            </p>
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
    </div>
  );
};

export default Dashboard;
