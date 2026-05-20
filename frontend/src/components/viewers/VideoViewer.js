import React from 'react';

const getYouTubeId = (url) => {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? m[1] : null;
};

const getVimeoId = (url) => {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
};

const VideoViewer = ({ url, caption }) => {
  if (!url) return null;
  const ytId = getYouTubeId(url);
  const vimeoId = getVimeoId(url);

  return (
    <div className="video-viewer">
      <div className="video-wrapper">
        {ytId ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            title={caption || 'Video'}
            allowFullScreen
          />
        ) : vimeoId ? (
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}`}
            title={caption || 'Video'}
            allowFullScreen
          />
        ) : (
          <video controls src={url}>
            Votre navigateur ne supporte pas la vidéo.
          </video>
        )}
      </div>
      {caption && <p className="media-caption">{caption}</p>}
    </div>
  );
};

export default VideoViewer;
