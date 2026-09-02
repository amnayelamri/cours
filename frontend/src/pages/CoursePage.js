import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourse, getAssetUrl } from '../services/courseService';
import MarkdownViewer  from '../components/viewers/MarkdownViewer';
import PDFViewer       from '../components/viewers/PDFViewer';
import ImageViewer     from '../components/viewers/ImageViewer';
import VideoViewer     from '../components/viewers/VideoViewer';
import QuizViewer      from '../components/viewers/QuizViewer';
import FlashcardViewer from '../components/viewers/FlashcardViewer';
import NumberViewer    from '../components/viewers/NumberViewer';
import StepsViewer     from '../components/viewers/StepsViewer';
import TrueFalseViewer from '../components/viewers/TrueFalseViewer';
import MatchingViewer  from '../components/viewers/MatchingViewer';
import RevealViewer    from '../components/viewers/RevealViewer';
import OrderingViewer  from '../components/viewers/OrderingViewer';
import { FiChevronLeft, FiChevronRight, FiList, FiArrowLeft } from 'react-icons/fi';

/* ── Contenu d'une slide ─────────────────────────────────────── */
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
    case 'reveal':    content = <RevealViewer items={slide.items || []} />; break;
    case 'ordering':  content = <OrderingViewer instruction={slide.instruction} orderItems={slide.orderItems || []} />; break;
    default:          content = <div className="error">Type inconnu : {slide.type}</div>; break;
  }
  if (isRtl) return <div dir="rtl" className="lang-ar">{content}</div>;
  return content;
};

/* ── Page principale ─────────────────────────────────────────── */
const CoursePage = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [course, setCourse]     = useState(null);
  const [current, setCurrent]   = useState(0);
  const [showList, setShowList] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const slideRefs = useRef([]);

  useEffect(() => {
    getCourse(id)
      .then(setCourse)
      .catch(() => setError('Cours introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  const total = course?.slides?.length || 0;

  /* Mise à jour du compteur courant au fil du scroll */
  const updateCurrent = useCallback(() => {
    const HEADER_H = 110; // hauteur approximative header + marge
    let activeIdx = 0;
    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      if (top <= HEADER_H + 40) activeIdx = i;
    });
    setCurrent(activeIdx);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', updateCurrent, { passive: true });
    return () => window.removeEventListener('scroll', updateCurrent);
  }, [updateCurrent]);

  /* Scroll vers une slide précise */
  const scrollToSlide = useCallback((idx) => {
    const el = slideRefs.current[idx];
    if (!el) return;
    const HEADER_H = 64;
    const y = el.getBoundingClientRect().top + window.scrollY - HEADER_H - 16;
    window.scrollTo({ top: y, behavior: 'smooth' });
    setCurrent(idx);
  }, []);

  const prev = useCallback(() => scrollToSlide(Math.max(0, current - 1)),         [current, scrollToSlide]);
  const next = useCallback(() => scrollToSlide(Math.min(total - 1, current + 1)), [current, total, scrollToSlide]);

  /* Navigation clavier */
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prev();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [prev, next]);

  if (loading) return <div className="loading">Chargement du cours...</div>;
  if (error)   return <div className="error">{error}</div>;
  if (!total)  return <div className="error">Ce cours n'a pas encore de slides.</div>;

  const lang  = course.lang;
  const isRtl = lang === 'ar';

  return (
    <div className="course-page">

      {/* ── En-tête fixe ── */}
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

      {/* ── Corps ── */}
      <div className="course-layout">

        {/* Zone de scroll principal */}
        <div className="slides-scroll">
          {course.slides.map((slide, i) => (
            <section
              key={slide.id || i}
              className={`slide-section${i === current ? ' slide-section--active' : ''}`}
              ref={el => { slideRefs.current[i] = el; }}
              data-idx={String(i)}
            >
              {slide.title && (
                <div className="slide-section-title" dir={isRtl ? 'rtl' : undefined}>
                  <span className="slide-section-num">{i + 1}</span>
                  {slide.title}
                </div>
              )}
              <div className="slide-section-content">
                <SlideContent slide={slide} courseId={id} lang={lang} />
              </div>
            </section>
          ))}
        </div>

        {/* Liste latérale */}
        {showList && (
          <div className="slide-list">
            <div className="slide-list-header">Slides</div>
            {course.slides.map((s, i) => (
              <button
                key={s.id || i}
                className={`slide-list-item${i === current ? ' active' : ''}`}
                onClick={() => { scrollToSlide(i); setShowList(false); }}
              >
                <span className="slide-num">{i + 1}</span>
                <span className="slide-name">{s.title || `Slide ${i + 1}`}</span>
                <span className="slide-type-badge">{s.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Barre de navigation fixe en bas ── */}
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
  );
};

export default CoursePage;
