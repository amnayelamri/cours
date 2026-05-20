import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourse, createCourse, updateCourse, uploadAsset } from '../../services/courseService';
import MarkdownViewer from '../../components/viewers/MarkdownViewer';
import {
  FiPlus, FiTrash2, FiChevronUp, FiChevronDown,
  FiSave, FiEye, FiEyeOff, FiUpload, FiArrowLeft
} from 'react-icons/fi';

const TYPES = ['markdown', 'pdf', 'image', 'video', 'html'];

const newSlide = () => ({
  id: `slide-${Date.now()}`,
  title: '',
  type: 'markdown',
  content: '',
  file: '',
  url: '',
  caption: '',
});

const SlideEditor = ({ slide, index, total, courseId, onChange, onDelete, onMove }) => {
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!courseId) return alert('Sauvegardez le cours d\'abord pour pouvoir uploader des fichiers.');
    setUploading(true);
    try {
      const result = await uploadAsset(courseId, file);
      onChange({ ...slide, file: result.path });
    } catch {
      alert('Erreur lors de l\'upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="slide-card">
      <div className="slide-card-header">
        <span className="slide-num-badge">#{index + 1}</span>
        <select
          value={slide.type}
          onChange={e => onChange({ ...slide, type: e.target.value })}
        >
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input
          placeholder="Titre du slide (optionnel)"
          value={slide.title}
          onChange={e => onChange({ ...slide, title: e.target.value })}
          className="slide-title-input"
        />
        <div className="slide-actions">
          <button onClick={() => onMove(index, -1)} disabled={index === 0} title="Monter">
            <FiChevronUp />
          </button>
          <button onClick={() => onMove(index, 1)} disabled={index === total - 1} title="Descendre">
            <FiChevronDown />
          </button>
          {slide.type === 'markdown' && (
            <button onClick={() => setPreview(v => !v)} title="Aperçu">
              {preview ? <FiEyeOff /> : <FiEye />}
            </button>
          )}
          <button onClick={onDelete} className="danger-icon" title="Supprimer">
            <FiTrash2 />
          </button>
        </div>
      </div>

      <div className="slide-card-body">
        {(slide.type === 'markdown' || slide.type === 'html') && (
          preview && slide.type === 'markdown' ? (
            <div className="preview-box">
              <MarkdownViewer content={slide.content} />
            </div>
          ) : (
            <textarea
              value={slide.content}
              onChange={e => onChange({ ...slide, content: e.target.value })}
              placeholder={
                slide.type === 'markdown'
                  ? '# Titre\n\nÉcrivez votre contenu en Markdown...\n\n- Bullet\n- Points\n\n**Gras**, *italique*, `code`'
                  : '<h1>Contenu HTML</h1>'
              }
              rows={10}
            />
          )
        )}

        {(slide.type === 'pdf' || slide.type === 'image') && (
          <div className="upload-area">
            <label className="btn-secondary upload-label">
              <FiUpload size={14} /> {uploading ? 'Upload...' : `Uploader ${slide.type === 'pdf' ? 'PDF' : 'image'}`}
              <input
                type="file"
                accept={slide.type === 'pdf' ? '.pdf' : 'image/*'}
                onChange={handleUpload}
                disabled={uploading}
                hidden
              />
            </label>
            {!courseId && <span className="hint">Sauvegardez d'abord le cours</span>}
            {slide.file && <span className="file-badge">{slide.file}</span>}
            {slide.type === 'image' && (
              <input
                placeholder="Légende (optionnelle)"
                value={slide.caption}
                onChange={e => onChange({ ...slide, caption: e.target.value })}
              />
            )}
          </div>
        )}

        {slide.type === 'video' && (
          <div className="upload-area">
            <input
              placeholder="URL YouTube, Vimeo, ou vidéo directe (mp4...)"
              value={slide.url}
              onChange={e => onChange({ ...slide, url: e.target.value })}
            />
            <input
              placeholder="Légende (optionnelle)"
              value={slide.caption}
              onChange={e => onChange({ ...slide, caption: e.target.value })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const CourseEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [course, setCourse] = useState({ title: '', description: '', tags: '', slides: [] });
  const [savedId, setSavedId] = useState(id || null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!isNew) {
      getCourse(id)
        .then(data => {
          setCourse({ ...data, tags: (data.tags || []).join(', ') });
          setSavedId(data.id);
        })
        .catch(() => setMsg({ type: 'error', text: 'Impossible de charger le cours.' }));
    }
  }, [id, isNew]);

  const save = async () => {
    if (!course.title.trim()) return setMsg({ type: 'error', text: 'Le titre est requis.' });
    setSaving(true);
    setMsg({});
    try {
      const payload = {
        ...course,
        tags: course.tags ? course.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      const saved = isNew
        ? await createCourse(payload)
        : await updateCourse(savedId, payload);
      setSavedId(saved.id);
      setMsg({ type: 'success', text: 'Sauvegardé !' });
      setTimeout(() => setMsg({}), 2500);
      if (isNew) navigate(`/dashboard/edit/${saved.id}`, { replace: true });
    } catch (err) {
      setMsg({ type: 'error', text: 'Erreur : ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const updateSlide = (i, s) => {
    const slides = [...course.slides];
    slides[i] = s;
    setCourse({ ...course, slides });
  };

  const addSlide = () => setCourse({ ...course, slides: [...course.slides, newSlide()] });

  const deleteSlide = (i) =>
    setCourse({ ...course, slides: course.slides.filter((_, idx) => idx !== i) });

  const moveSlide = (i, dir) => {
    const slides = [...course.slides];
    const t = i + dir;
    if (t < 0 || t >= slides.length) return;
    [slides[i], slides[t]] = [slides[t], slides[i]];
    setCourse({ ...course, slides });
  };

  return (
    <div className="editor-page">
      <div className="editor-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          <FiArrowLeft size={16} /> Dashboard
        </button>
        <h1>{isNew ? 'Nouveau cours' : 'Modifier le cours'}</h1>
        <button onClick={save} disabled={saving} className="btn-primary save-btn">
          <FiSave size={15} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      {msg.text && <div className={msg.type === 'error' ? 'error-message' : 'success-message'}>{msg.text}</div>}

      <div className="meta-form">
        <div className="form-group">
          <label>Titre *</label>
          <input
            value={course.title}
            onChange={e => setCourse({ ...course, title: e.target.value })}
            placeholder="Titre du cours"
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={course.description}
            onChange={e => setCourse({ ...course, description: e.target.value })}
            rows={2}
            placeholder="Description courte"
          />
        </div>
        <div className="form-group">
          <label>Tags (séparés par des virgules)</label>
          <input
            value={course.tags}
            onChange={e => setCourse({ ...course, tags: e.target.value })}
            placeholder="react, javascript, débutant"
          />
        </div>
      </div>

      <div className="slides-section">
        <h2>Slides ({course.slides.length})</h2>
        {course.slides.map((slide, i) => (
          <SlideEditor
            key={slide.id || i}
            slide={slide}
            index={i}
            total={course.slides.length}
            courseId={savedId}
            onChange={s => updateSlide(i, s)}
            onDelete={() => deleteSlide(i)}
            onMove={(idx, dir) => moveSlide(idx, dir)}
          />
        ))}
        <button onClick={addSlide} className="add-slide-btn">
          <FiPlus size={16} /> Ajouter un slide
        </button>
      </div>
    </div>
  );
};

export default CourseEditor;
