import React, { useState } from 'react';
import { FiMail, FiMessageCircle, FiCopy, FiCheck } from 'react-icons/fi';
import './Contact.css';

const WHATSAPP_NUMBER = '212659258168';
const EMAIL = 'amnayelamri95@gmail.com';

const Contact = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const copy = (text, setter) => {
    navigator.clipboard.writeText(text).then(() => {
      setter(true);
      setTimeout(() => setter(false), 2000);
    });
  };

  return (
    <div className="contact-page">
      <div className="contact-inner">

        {/* Header */}
        <div className="contact-header">
          <h1>Contact</h1>
          <p>
            Une question sur un cours, un projet de soutien scolaire ou une
            simple curiosité mathématique ? N'hésitez pas à me contacter.
          </p>
        </div>

        {/* Cards */}
        <div className="contact-cards">

          {/* Email */}
          <div className="contact-card">
            <div className="contact-card-icon contact-icon-email">
              <FiMail size={28} />
            </div>
            <h2>Email</h2>
            <p className="contact-card-desc">
              Pour toute demande de cours, collaboration ou question pédagogique.
            </p>
            <div className="contact-value">
              <span>{EMAIL}</span>
              <button
                className="copy-btn"
                onClick={() => copy(EMAIL, setCopiedEmail)}
                title="Copier"
              >
                {copiedEmail ? <FiCheck size={15} /> : <FiCopy size={15} />}
              </button>
            </div>
            <a
              href={`mailto:${EMAIL}`}
              className="contact-action-btn contact-action-email"
            >
              <FiMail size={16} /> Envoyer un e-mail
            </a>
          </div>

          {/* WhatsApp */}
          <div className="contact-card">
            <div className="contact-card-icon contact-icon-whatsapp">
              <FiMessageCircle size={28} />
            </div>
            <h2>WhatsApp</h2>
            <p className="contact-card-desc">
              Pour une réponse rapide ou pour fixer un rendez-vous de cours.
            </p>
            <div className="contact-value">
              <span>+212 659 258 168</span>
              <button
                className="copy-btn"
                onClick={() => copy('+212659258168', setCopiedPhone)}
                title="Copier"
              >
                {copiedPhone ? <FiCheck size={15} /> : <FiCopy size={15} />}
              </button>
            </div>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-action-btn contact-action-whatsapp"
            >
              <FiMessageCircle size={16} /> Ouvrir WhatsApp
            </a>
          </div>

        </div>

        {/* Info bas de page */}
        <div className="contact-footer-note">
          <p>📍 Casablanca, Maroc · Cours en présentiel et en ligne</p>
          <p>Niveaux : Collège · Lycée · CPGE · Université</p>
        </div>

      </div>
    </div>
  );
};

export default Contact;
