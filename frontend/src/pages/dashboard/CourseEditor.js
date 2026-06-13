import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourse, createCourse, updateCourse, uploadAsset } from '../../services/courseService';
import MarkdownViewer from '../../components/viewers/MarkdownViewer';
import {
  FiPlus, FiTrash2, FiChevronUp, FiChevronDown,
  FiSave, FiEye, FiEyeOff, FiUpload, FiArrowLeft
} from 'react-icons/fi';

const TYPES = [
  { value: 'markdown',  label: 'Texte Markdown' },
  { value: 'quiz',      label: 'QCM' },
  { value: 'flashcard', label: '🃏 Flashcard' },
  { value: 'number',    label: '✍️ Réponse numérique' },
  { value: 'steps',     label: '👣 Pas à pas' },
  { value: 'truefalse', label: '⚖️ Vrai / Faux' },
  { value: 'matching',  label: '🔗 Association' },
  { value: 'reveal',    label: '👁️ Réponses masquées' },
  { value: 'video',     label: 'Vidéo' },
  { value: 'pdf',       label: 'PDF' },
  { value: 'image',     label: 'Image' },
  { value: 'html',      label: 'HTML' },
];

const newSlide = () => ({
  id: `slide-${Date.now()}`,
  title: '',
  type: 'markdown',
  // markdown / html
  content: '',
  // pdf / image
  file: '', url: '', caption: '',
  // quiz / flashcard / number / truefalse
  question: '', answer: '', hint: '', explanation: '', tolerance: 0,
  choices: [
    { id: 'a', text: '', correct: true },
    { id: 'b', text: '', correct: false },
  ],
  // truefalse
  statement: '',
  // steps
  stepsTitle: '', intro: '',
  steps: [{ label: 'Étape 1', content: '' }],
  // matching
  instruction: '',
  pairs: [
    { left: '', right: '' },
    { left: '', right: '' },
  ],
  // reveal
  items: [
    { question: '', answer: '' },
  ],
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
          {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
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

        {slide.type === 'flashcard' && (
          <div className="quiz-editor">
            <textarea rows={3} placeholder="Question (recto de la carte)…" value={slide.question || ''}
              onChange={e => onChange({ ...slide, question: e.target.value })} />
            <textarea rows={3} placeholder="Réponse (verso de la carte)…" value={slide.answer || ''}
              onChange={e => onChange({ ...slide, answer: e.target.value })} />
            <input placeholder="Indice optionnel (ex: pensez au théorème…)" value={slide.hint || ''}
              onChange={e => onChange({ ...slide, hint: e.target.value })} />
          </div>
        )}

        {slide.type === 'number' && (
          <div className="quiz-editor">
            <textarea rows={3} placeholder="Question en Markdown (ex: Calculez $\pgcd(48, 18)$ =)" value={slide.question || ''}
              onChange={e => onChange({ ...slide, question: e.target.value })} />
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" placeholder="Réponse correcte (nombre)" style={{ flex: 1 }} value={slide.answer ?? ''}
                onChange={e => onChange({ ...slide, answer: parseFloat(e.target.value) || 0 })} />
              <input type="number" placeholder="Tolérance (0 = exact)" style={{ flex: '0 0 160px' }} value={slide.tolerance ?? 0}
                onChange={e => onChange({ ...slide, tolerance: parseFloat(e.target.value) || 0 })} />
            </div>
            <input placeholder="Indice optionnel" value={slide.hint || ''}
              onChange={e => onChange({ ...slide, hint: e.target.value })} />
            <textarea rows={3} placeholder="Explication affichée après bonne réponse (Markdown)" value={slide.explanation || ''}
              onChange={e => onChange({ ...slide, explanation: e.target.value })} />
          </div>
        )}

        {slide.type === 'steps' && (
          <div className="quiz-editor">
            <input placeholder="Titre (optionnel)" value={slide.stepsTitle || ''}
              onChange={e => onChange({ ...slide, stepsTitle: e.target.value })} />
            <textarea rows={2} placeholder="Introduction / énoncé (Markdown, optionnel)" value={slide.intro || ''}
              onChange={e => onChange({ ...slide, intro: e.target.value })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(slide.steps || []).map((step, si) => (
                <div key={si} style={{ background: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: 4, padding: 10 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '6px 0' }}>#{si + 1}</span>
                    <input placeholder={`Label (ex: Étape ${si+1})`} value={step.label || ''}
                      style={{ flex: 1 }}
                      onChange={e => { const s=[...slide.steps]; s[si]={...s[si],label:e.target.value}; onChange({...slide,steps:s}); }} />
                    {slide.steps.length > 1 && (
                      <button style={{ background:'none',border:'1px solid var(--border-color)',borderRadius:2,padding:'4px 8px',color:'var(--error-color)',cursor:'pointer' }}
                        onClick={() => onChange({...slide, steps: slide.steps.filter((_,idx)=>idx!==si)})}>✕</button>
                    )}
                  </div>
                  <textarea rows={2} placeholder="Contenu de l'étape (Markdown)" value={step.content || ''}
                    style={{ width:'100%', fontFamily:'monospace', fontSize:12 }}
                    onChange={e => { const s=[...slide.steps]; s[si]={...s[si],content:e.target.value}; onChange({...slide,steps:s}); }} />
                </div>
              ))}
              <button className="add-choice-btn"
                onClick={() => onChange({...slide, steps:[...(slide.steps||[]), {label:`Étape ${(slide.steps||[]).length+1}`,content:''}]})}>
                + Ajouter une étape
              </button>
            </div>
          </div>
        )}

        {slide.type === 'truefalse' && (
          <div className="quiz-editor">
            <textarea rows={3} placeholder="Affirmation à évaluer (Markdown)" value={slide.statement || ''}
              onChange={e => onChange({ ...slide, statement: e.target.value })} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className={`correct-toggle${slide.answer === true ? ' is-correct' : ''}`}
                onClick={() => onChange({ ...slide, answer: true })} type="button">
                ✓ VRAI
              </button>
              <button
                className={`correct-toggle${slide.answer === false ? ' is-correct' : ''}`}
                onClick={() => onChange({ ...slide, answer: false })} type="button">
                ✗ FAUX
              </button>
            </div>
            <textarea rows={3} placeholder="Explication (Markdown, optionnelle)" value={slide.explanation || ''}
              onChange={e => onChange({ ...slide, explanation: e.target.value })} />
          </div>
        )}

        {slide.type === 'matching' && (
          <div className="quiz-editor">
            <input placeholder="Consigne (optionnelle, ex: Associez chaque théorème à son énoncé)" value={slide.instruction || ''}
              onChange={e => onChange({ ...slide, instruction: e.target.value })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(slide.pairs || []).map((pair, pi) => (
                <div key={pi} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', minWidth: 16 }}>{pi+1}</span>
                  <input placeholder="Gauche" value={pair.left || ''} style={{ flex: 1 }}
                    onChange={e => { const p=[...slide.pairs]; p[pi]={...p[pi],left:e.target.value}; onChange({...slide,pairs:p}); }} />
                  <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>↔</span>
                  <input placeholder="Droite" value={pair.right || ''} style={{ flex: 1 }}
                    onChange={e => { const p=[...slide.pairs]; p[pi]={...p[pi],right:e.target.value}; onChange({...slide,pairs:p}); }} />
                  {slide.pairs.length > 2 && (
                    <button style={{ background:'none',border:'1px solid var(--border-color)',borderRadius:2,padding:'4px 8px',color:'var(--error-color)',cursor:'pointer' }}
                      onClick={() => onChange({...slide,pairs:slide.pairs.filter((_,idx)=>idx!==pi)})}>✕</button>
                  )}
                </div>
              ))}
              <button className="add-choice-btn"
                onClick={() => onChange({...slide,pairs:[...(slide.pairs||[]),{left:'',right:''}]})}>
                + Ajouter une paire
              </button>
            </div>
          </div>
        )}

        {slide.type === 'reveal' && (
          <div className="quiz-editor">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(slide.items || []).map((item, ri) => (
                <div key={ri} style={{ background: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: 6, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Question {ri + 1}
                    </span>
                    {slide.items.length > 1 && (
                      <button
                        style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 2, padding: '3px 8px', color: 'var(--error-color)', cursor: 'pointer', fontSize: 12 }}
                        onClick={() => onChange({ ...slide, items: slide.items.filter((_, idx) => idx !== ri) })}>
                        ✕
                      </button>
                    )}
                  </div>
                  <textarea rows={2} placeholder="Question (Markdown + LaTeX supportés)" value={item.question || ''}
                    style={{ width: '100%', fontFamily: 'monospace', fontSize: 13, marginBottom: 8 }}
                    onChange={e => { const it = [...slide.items]; it[ri] = { ...it[ri], question: e.target.value }; onChange({ ...slide, items: it }); }} />
                  <textarea rows={2} placeholder="Réponse masquée (Markdown + LaTeX supportés)" value={item.answer || ''}
                    style={{ width: '100%', fontFamily: 'monospace', fontSize: 13 }}
                    onChange={e => { const it = [...slide.items]; it[ri] = { ...it[ri], answer: e.target.value }; onChange({ ...slide, items: it }); }} />
                </div>
              ))}
              <button className="add-choice-btn"
                onClick={() => onChange({ ...slide, items: [...(slide.items || []), { question: '', answer: '' }] })}>
                + Ajouter une question
              </button>
            </div>
          </div>
        )}

        {slide.type === 'quiz' && (
          <div className="quiz-editor">
            <input
              className="quiz-question-input"
              placeholder="Question..."
              value={slide.question || ''}
              onChange={e => onChange({ ...slide, question: e.target.value })}
            />
            <div className="quiz-choices-editor">
              {(slide.choices || []).map((choice, ci) => (
                <div key={choice.id} className="choice-row">
                  <span className="choice-id-badge">{choice.id.toUpperCase()}</span>
                  <input
                    placeholder={`Réponse ${choice.id.toUpperCase()}`}
                    value={choice.text}
                    onChange={e => {
                      const choices = slide.choices.map((c, idx) =>
                        idx === ci ? { ...c, text: e.target.value } : c
                      );
                      onChange({ ...slide, choices });
                    }}
                  />
                  <button
                    className={`correct-toggle ${choice.correct ? 'is-correct' : ''}`}
                    onClick={() => {
                      const choices = slide.choices.map((c, idx) =>
                        ({ ...c, correct: idx === ci })
                      );
                      onChange({ ...slide, choices });
                    }}
                    title="Marquer comme bonne réponse"
                    type="button"
                  >
                    {choice.correct ? '✓ Correct' : 'Incorrect'}
                  </button>
                  {slide.choices.length > 2 && (
                    <button
                      className="remove-choice"
                      onClick={() => onChange({ ...slide, choices: slide.choices.filter((_, idx) => idx !== ci) })}
                      type="button"
                      title="Supprimer"
                    >✕</button>
                  )}
                </div>
              ))}
              {(slide.choices || []).length < 6 && (
                <button
                  className="add-choice-btn"
                  type="button"
                  onClick={() => {
                    const ids = ['a','b','c','d','e','f'];
                    const next = ids[slide.choices.length] || `opt${slide.choices.length}`;
                    onChange({ ...slide, choices: [...slide.choices, { id: next, text: '', correct: false }] });
                  }}
                >
                  + Ajouter un choix
                </button>
              )}
            </div>
            <input
              placeholder="Explication après réponse (optionnelle)"
              value={slide.explanation || ''}
              onChange={e => onChange({ ...slide, explanation: e.target.value })}
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

  const insertSlide = (atIndex) => {
    const slides = [...course.slides];
    slides.splice(atIndex, 0, newSlide());
    setCourse({ ...course, slides });
  };

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
          <React.Fragment key={slide.id || i}>
            {i === 0 && (
              <div className="insert-row">
                <button className="insert-slide-btn" onClick={() => insertSlide(0)} title="Insérer avant la première slide">
                  <FiPlus size={11} /> insérer ici
                </button>
              </div>
            )}
            <SlideEditor
              slide={slide}
              index={i}
              total={course.slides.length}
              courseId={savedId}
              onChange={s => updateSlide(i, s)}
              onDelete={() => deleteSlide(i)}
              onMove={(idx, dir) => moveSlide(idx, dir)}
            />
            <div className="insert-row">
              <button className="insert-slide-btn" onClick={() => insertSlide(i + 1)} title="Insérer un slide ici">
                <FiPlus size={11} /> insérer ici
              </button>
            </div>
          </React.Fragment>
        ))}
        {course.slides.length === 0 && (
          <button onClick={addSlide} className="add-slide-btn">
            <FiPlus size={16} /> Ajouter un slide
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseEditor;
