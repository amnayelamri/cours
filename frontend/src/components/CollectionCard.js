import React from 'react';
import { Link } from 'react-router-dom';
import { FiFolder } from 'react-icons/fi';

const CollectionCard = ({ collection }) => (
  <Link to={`/collection/${collection.id}`} className="course-card">
    <div className="course-card-header">
      {collection.emoji
        ? <span style={{ fontSize: 42, lineHeight: 1 }}>{collection.emoji}</span>
        : <img src={`${process.env.PUBLIC_URL}/tree.svg`} alt="" className="card-tree" />}
    </div>
    <div className="course-card-body">
      <h3>{collection.title}</h3>
      {collection.description && <p>{collection.description}</p>}
    </div>
    <div className="course-card-footer">
      <span className="slide-count">
        <FiFolder size={13} /> {collection.courseIds.length} cours
      </span>
    </div>
  </Link>
);

export default CollectionCard;
