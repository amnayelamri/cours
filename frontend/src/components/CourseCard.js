import React from 'react';
import { Link } from 'react-router-dom';
import { FiLayers, FiTag } from 'react-icons/fi';

const CourseCard = ({ course }) => (
  <Link to={`/course/${course.id}`} className="course-card">
    <div className="course-card-header">
      <span className="card-clover">🍀</span>
    </div>
    <div className="course-card-body">
      <h3>{course.title}</h3>
      {course.description && <p>{course.description}</p>}
    </div>
    <div className="course-card-footer">
      <span className="slide-count">
        <FiLayers size={13} /> {course.slideCount} slide{course.slideCount !== 1 ? 's' : ''}
      </span>
      <div className="tags">
        {(course.tags || []).slice(0, 3).map(tag => (
          <span key={tag} className="tag">
            <FiTag size={10} /> {tag}
          </span>
        ))}
      </div>
    </div>
  </Link>
);

export default CourseCard;
