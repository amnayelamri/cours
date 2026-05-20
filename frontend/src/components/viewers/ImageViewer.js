import React from 'react';

const ImageViewer = ({ url, caption }) => (
  <div className="image-viewer">
    <img src={url} alt={caption || 'Slide'} />
    {caption && <p className="media-caption">{caption}</p>}
  </div>
);

export default ImageViewer;
