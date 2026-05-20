import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourse, getAssetUrl } from '../services/courseService';
import MarkdownViewer from '../components/viewers/MarkdownViewer';
import PDFViewer from '../components/viewers/PDFViewer';
import ImageViewer from '../components/viewers/ImageViewer';
import VideoViewer from '../components/viewers/VideoViewer';
import QuizViewer from '../components/viewers/QuizViewer';
import { FiChevronLeft, FiChevronRight, FiList, FiArrowLeft } from 'react-icons/fi';

const SlideContent = ({ slide, courseId }) => {
  switch (slide.type) {
    case 'markdown': return <MarkdownViewer content={slide.content} />;
    case 'pdf':      return <PDFViewer url={getAssetUrl(courseId, slide.file)} />;
    case 'image':    return <ImageViewer url={getAssetUrl(courseId, slide.file)} caption={slide.caption} />;
    case 'video':    return <VideoViewer url={slide.url} caption={slide.caption} />;
    case 'html':     return <div className="html-viewer" dangerouslySetInnerHTML={{ __html: slide.content }} />;
    case 'quiz':     return <QuizViewer question={slide.question} choices={slide.choices} explanation={slide.explanation} />;
    default:         return <div className="error">Type inconnu : {slide.type}</div>;
  }
};

const CoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [current, setCurrent] = useState(0);
  const [showList, setShowList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Touch state pour le swipe mobile
  const touchStart = useRef({ x: 0, y: 0 });
  const touchLocked = useRef(null); // 'h' = horizontal, 'v' = vertical, null = indéfini

  useEffect(() => {
    getCourse(id)
      .then(setCourse)
      .catch(() => setError('Cours introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  const total = course?.slides?.length || 0;
  const prev = useCallback(() => setCurrent(s => Math.max(0, s - 1)), []);
  const next = useCallback(() => setCurrent(s => Math.min(total - 1, s + 1)), [total]);

  // Clavier pour desktop
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft')  prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next]);

  // ── Swipe mobile ──────────────────────────────────────────────
  const handleTouchStart = useCallback((e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    touchLocked.current = null; // réinitialise la direction à chaque toucher
  }, []);

  const handleTouchMove = useCallback((e) => {
    const dx = Math.abs(e.touches[0].clientX - touchStart.current.x);
    const dy = Math.abs(e.touches[0].clientY - touchStart.current.y);

    // On verrouille la direction dès qu'on dépasse 8 px
    if (touchLocked.current === null && (dx > 8 || dy > 8)) {
      touchLocked.current = dx > dy ? 'h' : 'v';
    }

    // Si la direction est horizontale, on bloque le scroll natif
    if (touchLocked.current === 'h') {
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchLocked.current !== 'h') return; // c'était un scroll vertical, on ne fait rien
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    if (dx < -40) next();       // swipe vers la gauche  → slide suivante
    else if (dx > 40) prev();   // swipe vers la droite → slide précédente
  }, [next, prev]);
  // ─────────────────────────────────────────────────────────────

  if (loading) return <div className="loading">Chargement du cours...</div>;
  if (error)   return <div className="error">{error}</div>;
  if (!total)  return <div className="error">Ce cours n'a pas encore de slides.</div>;

  const slide = course.slides[current];

  return (
    <div className="course-page">
      <div className="course-header">
        <button onClick={() => navigate('/')} className="back-btn">
          <FiArrowLeft size={16} /> Retour
        </button>
        <div className="course-title">
          <h2>{course.title}</h2>
          <span>{current + 1} / {total}</span>
        </div>
        <button onClick={() => setShowList(v => !v)} className="list-btn" title="Liste des slides">
          <FiList size={20} />
        </button>
      </div>

      {/* ── DESKTOP : un slide à la fois ── */}
      <div className="course-layout desktop-only">
        <div className="slide-area">
          {slide.title && <div className="slide-title">{slide.title}</div>}
          <div className="slide-content">
            <SlideContent slide={slide} courseId={id} />
          </div>
          <div className="slide-nav">
            <button onClick={prev} disabled={current === 0} className="nav-btn">
              <FiChevronLeft size={20} /> Préc.
            </button>
            <div className="progress-bar">
              <div style={{ width: `${((current + 1) / total) * 100}%` }} />
            </div>
            <button onClick={next} disabled={current === total - 1} className="nav-btn">
              Suiv. <FiChevronRight size={20} />
            </button>
          </div>
        </div>

        {showList && (
          <div className="slide-list">
            <div className="slide-list-header">Slides</div>
            {course.slides.map((s, i) => (
              <button
                key={s.id || i}
                className={`slide-list-item ${i === current ? 'active' : ''}`}
                onClick={() => setCurrent(i)}
              >
                <span className="slide-num">{i + 1}</span>
                <span className="slide-name">{s.title || `Slide ${i + 1}`}</span>
                <span className="slide-type-badge">{s.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── MOBILE : slide unique, swipe horizontal, scroll vertical ── */}
      <div
        className="mobile-slides"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="mobile-slide-header">
          {slide.title && <span className="mobile-slide-title">{slide.title}</span>}
          <span className="mobile-slide-counter">{current + 1} / {total}</span>
        </div>

        {/* key={current} force un re-mount → déclenche l'animation de transition */}
        <div key={current} className="mobile-slide-content">
          <SlideContent slide={slide} courseId={id} />
        </div>

        <div className="mobile-progress">
          {course.slides.map((_, pi) => (
            <div key={pi} className={`mobile-dot ${pi === current ? 'active' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
