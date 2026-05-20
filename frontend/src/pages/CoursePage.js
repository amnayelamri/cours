import React, { useState, useEffect, useCallback } from 'react';
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

  useEffect(() => {
    getCourse(id)
      .then(setCourse)
      .catch(() => setError('Cours introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  const total = course?.slides?.length || 0;
  const prev = useCallback(() => setCurrent(s => Math.max(0, s - 1)), []);
  const next = useCallback(() => setCurrent(s => Math.min(total - 1, s + 1)), [total]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next]);

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

      <div className="course-layout">
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
    </div>
  );
};

export default CoursePage;
