import React from 'react';

const PDFViewer = ({ url }) => (
  <div className="pdf-viewer">
    <object data={url} type="application/pdf" width="100%" height="700px">
      <div className="pdf-fallback">
        <p>Votre navigateur ne peut pas afficher ce PDF.</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary">
          Télécharger le PDF
        </a>
      </div>
    </object>
  </div>
);

export default PDFViewer;
