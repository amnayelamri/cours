import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourse, getAssetUrl } from '../services/courseService';
import MarkdownViewer from '../components/viewers/MarkdownViewer';
import PDFViewer from '../components/viewers/PDFViewer';
import ImageViewer from '../components/viewers/ImageViewer';
import VideoViewer from '../components/viewers/VideoViewer';
import QuizViewer        from '../components/viewers/QuizViewer';
import FlashcardViewer   from '../components/viewers/FlashcardViewer';
import NumberViewer      from '../components/viewers/NumberViewer';
import StepsViewer       from '../components/viewers/StepsViewer';
import TrueFalseViewer   from '../components/viewers/TrueFalseViewer';
import MatchingViewer    from '../components/viewers/MatchingViewer';
import { FiChevronLeft, FiChevronRight, FiList, FiArrowLeft } from 'react-icons/fi';

const SlideContent = ({ slide, courseId, lang }) => {
  const isRtl = lang === 'ar';
  let content;
  switch (slide.type) {
    case 'content':
    case 'markdown': content = <MarkdownViewer content={slide.content} />; break;
    case 'pdf':      content = <PDFViewer url={getAssetUrl(courseId, slide.file)} />; break;
    case 'image':    content = <ImageViewer url={getAssetUrl(courseId, slide.file)} caption={slide.caption} />; break;
    case 'video':    content = <VideoViewer url={slide.url} caption={slide.caption} />; break;
    case 'html':     content = <div className="html-viewer" dangerouslySetInnerHTML={{ __html: slide.content }} />; break;
    case 'quiz':      content = <QuizViewer question={slide.question} choices={slide.choices} explanation={slide.explanation} />; break;
    case 'flashcard': content = <FlashcardViewer question={slide.question} answer={slide.answer} hint={slide.hint} />; break;
    case 'number':    content = <NumberViewer question={slide.question} answer={slide.answer} hint={slide.hint} explanation={slide.explanation} tolerance={slide.tolerance || 0} />; break;
    case 'steps':     content = <StepsViewer title={slide.stepsTitle} intro={slide.intro} steps={slide.steps || []} />; break;
    case 'truefalse': content = <TrueFalseViewer statement={slide.statement} answer={slide.answer} explanation={slide.explanation} />; break;
    case 'matching':  content = <MatchingViewer instruction={slide.instruction} pairs={slide.pairs || []} />; break;
    default:          content = <div className="error">Type inconnu : {slide.type}</div>; break;
  }
  if (isRtl) return <div dir="rtl" className="lang-ar">{content}</div>;
  return content;
};

const CoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse]     = useState(null);
  const [current, setCurrent]   = useState(0);
  const [showList, setShowList] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // ── Carousel mobile ────────────────────────────────────────────
  const [dragOffset, setDragOffset]   = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchRef      = useRef({ x: 0, y: 0, dir: null });
  const animatingRef  = useRef(false); // ref pour les callbacks (évite les closures périmées)
  const containerRef  = useRef(null);
  const centerPanelRef = useRef(null);
  // ──────────────────────────────────────────────────────────────

  useEffect(() => {
    getCourse(id)
      .then(setCourse)
      .catch(() => setError('Cours introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  const total = course?.slides?.length || 0;
  const prev  = useCallback(() => setCurrent(s => Math.max(0, s - 1)), []);
  const next  = useCallback(() => setCurrent(s => Math.min(total - 1, s + 1)), [total]);

  // Remet le scroll en haut à chaque changement de slide
  useEffect(() => {
    if (centerPanelRef.current) centerPanelRef.current.scrollTop = 0;
  }, [current]);

  // Clavier (desktop)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft')  prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next]);

  // ── Touch start ────────────────────────────────────────────────
  const handleTouchStart = useCallback((e) => {
    if (animatingRef.current) return;
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, dir: null };
  }, []);

  // ── Touch move (non-passive, pour pouvoir appeler preventDefault) ──
  const handleTouchMove = useCallback((e) => {
    if (animatingRef.current) return;
    const dx = e.touches[0].clientX - touchRef.current.x;
    const dy = e.touches[0].clientY - touchRef.current.y;

    // Verrouille la direction dès 8 px de mouvement
    if (touchRef.current.dir === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      touchRef.current.dir = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
    }

    if (touchRef.current.dir === 'h') {
      e.preventDefault(); // empêche le scroll natif sur l'axe horizontal
      // Résistance en bout de course (1ère / dernière slide)
      let offset = dx;
      if ((dx > 0 && current === 0) || (dx < 0 && current === total - 1)) {
        offset = dx * 0.2;
      }
      setDragOffset(offset);
    }
  }, [current, total]);

  // ── Touch end ──────────────────────────────────────────────────
  const handleTouchEnd = useCallback((e) => {
    if (touchRef.current.dir !== 'h') return;

    const dx        = e.changedTouches[0].clientX - touchRef.current.x;
    const W         = window.innerWidth;
    const threshold = W * 0.28; // 28 % de la largeur écran suffit

    animatingRef.current = true;
    setIsAnimating(true);

    if (dx < -threshold && current < total - 1) {
      // ── Glisse vers la gauche → slide suivante
      setDragOffset(-W);
      setTimeout(() => {
        animatingRef.current = false;
        setIsAnimating(false);
        setCurrent(s => s + 1);
        setDragOffset(0);
      }, 300);
    } else if (dx > threshold && current > 0) {
      // ── Glisse vers la droite → slide précédente
      setDragOffset(W);
      setTimeout(() => {
        animatingRef.current = false;
        setIsAnimating(false);
        setCurrent(s => s - 1);
        setDragOffset(0);
      }, 300);
    } else {
      // ── Pas assez → revient en place
      setDragOffset(0);
      setTimeout(() => {
        animatingRef.current = false;
        setIsAnimating(false);
      }, 300);
    }
  }, [current, total]);

  // Attache le listener touchmove en { passive: false } pour pouvoir preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', handleTouchMove);
  }, [handleTouchMove]);
  // ──────────────────────────────────────────────────────────────

  if (loading) return <div className="loading">Chargement du cours...</div>;
  if (error)   return <div className="error">{error}</div>;
  if (!total)  return <div className="error">Ce cours n'a pas encore de slides.</div>;

  const slide     = course.slides[current];
  const prevSlide = current > 0         ? course.slides[current - 1] : null;
  const nextSlide = current < total - 1 ? course.slides[current + 1] : null;
  const lang      = course.lang;
  const isRtl     = lang === 'ar';

  return (
    <div className="course-page">
      <div className="course-header">
        <button onClick={() => navigate('/')} className="back-btn">
          <FiArrowLeft size={16} /> Retour
        </button>
        <div className="course-title" dir={isRtl ? 'rtl' : undefined}>
          <h2>{course.title}</h2>
          <span>{current + 1} / {total}</span>
        </div>
        <button onClick={() => setShowList(v => !v)} className="list-btn" title="Liste des slides">
          <FiList size={20} />
        </button>
      </div>

      {/* ── DESKTOP ── */}
      <div className="course-layout desktop-only">
        <div className="slide-area">
          {slide.title && <div className="slide-title" dir={isRtl ? 'rtl' : undefined}>{slide.title}</div>}
          <div className="slide-content">
            <SlideContent key={current} slide={slide} courseId={id} lang={lang} />
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

      {/* ── MOBILE : carrousel 3 panneaux ── */}
      <div
        className="mobile-slides"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Bande intérieure qui se déplace */}
        <div
          className="mobile-slides-inner"
          style={{
            transform: `translateX(calc(-100vw + ${dragOffset}px))`,
            transition: isAnimating
              ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              : 'none',
          }}
        >
          {/* Panneau GAUCHE — slide précédente */}
          <div className="mobile-slide-panel">
            {prevSlide && (
              <>
                <div className="mobile-slide-header" dir={isRtl ? 'rtl' : undefined}>
                  {prevSlide.title && <span className="mobile-slide-title">{prevSlide.title}</span>}
                  <span className="mobile-slide-counter">{current} / {total}</span>
                </div>
                <div className="mobile-slide-content">
                  <SlideContent key={`prev-${current}`} slide={prevSlide} courseId={id} lang={lang} />
                </div>
              </>
            )}
          </div>

          {/* Panneau CENTRE — slide actuelle */}
          <div className="mobile-slide-panel" ref={centerPanelRef}>
            <div className="mobile-slide-header" dir={isRtl ? 'rtl' : undefined}>
              {slide.title && <span className="mobile-slide-title">{slide.title}</span>}
              <span className="mobile-slide-counter">{current + 1} / {total}</span>
            </div>
            <div className="mobile-slide-content">
              <SlideContent key={`curr-${current}`} slide={slide} courseId={id} lang={lang} />
            </div>
            <div className="mobile-progress">
              {course.slides.map((_, pi) => (
                <div key={pi} className={`mobile-dot ${pi === current ? 'active' : ''}`} />
              ))}
            </div>
          </div>

          {/* Panneau DROIT — slide suivante */}
          <div className="mobile-slide-panel">
            {nextSlide && (
              <>
                <div className="mobile-slide-header" dir={isRtl ? 'rtl' : undefined}>
                  {nextSlide.title && <span className="mobile-slide-title">{nextSlide.title}</span>}
                  <span className="mobile-slide-counter">{current + 2} / {total}</span>
                </div>
                <div className="mobile-slide-content">
                  <SlideContent key={`next-${current}`} slide={nextSlide} courseId={id} lang={lang} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
