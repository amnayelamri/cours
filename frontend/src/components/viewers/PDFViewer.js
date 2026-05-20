import React, { useState, useEffect } from 'react';
import { FiDownload, FiAlertCircle } from 'react-icons/fi';

const PDFViewer = ({ url }) => {
  const [status, setStatus] = useState('loading'); // loading | ok | error

  useEffect(() => {
    setStatus('loading');
    // On vérifie que l'URL pointe bien vers un PDF (et pas vers index.html)
    fetch(url, { method: 'HEAD' })
      .then(res => {
        const type = res.headers.get('content-type') || '';
        if (type.includes('pdf')) {
          setStatus('ok');
        } else {
          // Le serveur a renvoyé autre chose (ex: index.html) → fichier introuvable
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [url]);

  if (status === 'loading') return <div className="loading">Chargement du PDF...</div>;

  if (status === 'error') return (
    <div className="pdf-fallback">
      <FiAlertCircle size={40} />
      <p>PDF non trouvé ou pas encore uploadé.</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
        <FiDownload size={14} /> Essayer d'ouvrir quand même
      </a>
    </div>
  );

  return (
    <div className="pdf-viewer">
      <iframe
        src={url}
        title="PDF"
        width="100%"
        height="700px"
        style={{ border: 'none', borderRadius: '2px' }}
      />
    </div>
  );
};

export default PDFViewer;
