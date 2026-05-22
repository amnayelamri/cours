import React from 'react';
import { Link } from 'react-router-dom';
import { FiFolder, FiChevronRight } from 'react-icons/fi';

const CollectionCard = ({ collection }) => (
  <Link to={`/collection/${collection.id}`} className="collection-card">
    <div className="collection-card-icon">
      {collection.emoji
        ? <span className="collection-emoji">{collection.emoji}</span>
        : <FiFolder size={28} />}
    </div>
    <div className="collection-card-body">
      <h3>{collection.title}</h3>
      {collection.description && <p>{collection.description}</p>}
      <span className="collection-count">
        {collection.courseIds.length} cours
      </span>
    </div>
    <FiChevronRight size={18} className="collection-arrow" />
  </Link>
);

export default CollectionCard;
