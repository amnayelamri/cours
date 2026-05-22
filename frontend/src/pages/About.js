import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiMail, FiMessageCircle, FiBookOpen, FiAward,
  FiUsers, FiFileText, FiChevronRight
} from 'react-icons/fi';
import './About.css';

const About = () => {
  return (
    <div className="about-page">

      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <div className="about-avatar">
            <img src={`${process.env.PUBLIC_URL}/tree.svg`} alt="logo" />
          </div>
          <div className="about-hero-text">
            <h1>El Amri Amnay</h1>
            <p className="about-subtitle">
              Professeur de Mathématiques · Docteur · Agrégé
            </p>
            <p className="about-location">📍 Casablanca, Maroc</p>
            <div className="about-hero-actions">
              <Link to="/contact" className="btn-primary-about">
                <FiMail size={16} /> Me contacter
              </Link>
              <a
                href="https://wa.me/212659258168"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-about"
              >
                <FiMessageCircle size={16} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="about-body">

        {/* ── Profil ── */}
        <section className="about-section">
          <h2 className="about-section-title">
            <FiUsers size={20} /> Profil
          </h2>
          <div className="about-card about-profile-text">
            <p>
              Professeur de mathématiques passionné par la transmission du savoir,
              titulaire de l'<strong>Agrégation externe de Mathématiques</strong> et
              d'un <strong>Doctorat en Mathématiques</strong> (Université Hassan II,
              Casablanca). Expérience dans l'enseignement au lycée, au collège, en
              classes préparatoires et en soutien scolaire pour différents niveaux.
            </p>
            <p>
              Pédagogue, patient et rigoureux, avec une forte capacité à adapter les
              explications aux besoins des élèves afin de développer leur autonomie,
              leur confiance et leur goût pour les mathématiques.
            </p>
          </div>
        </section>

        {/* ── Niveaux enseignés ── */}
        <section className="about-section">
          <h2 className="about-section-title">
            <FiBookOpen size={20} /> Niveaux enseignés
          </h2>
          <div className="about-levels-grid">
            {[
              { level: 'Collège', detail: 'Tous niveaux' },
              { level: 'Lycée', detail: '1BAC · 2BAC · SM · PC · SVT' },
              { level: 'CPGE', detail: 'Maths Sup · Maths Spé' },
              { level: 'Université', detail: 'Licence · Master' },
            ].map(({ level, detail }) => (
              <div key={level} className="level-card">
                <span className="level-name">{level}</span>
                <span className="level-detail">{detail}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Expérience ── */}
        <section className="about-section">
          <h2 className="about-section-title">
            <FiUsers size={20} /> Expérience Professionnelle
          </h2>
          <div className="about-timeline">
            {[
              {
                title: 'Professeur de Mathématiques',
                place: 'Lycée Charles Péguy — Casablanca',
                detail: 'Classe de Sciences Mathématiques',
                items: [
                  'Enseignement en filière Sciences Mathématiques',
                  'Accompagnement vers un raisonnement rigoureux et structuré',
                  'Suivi pédagogique individualisé',
                ],
              },
              {
                title: 'Professeur de Mathématiques',
                place: 'Collège Léon l\'Africain — Casablanca',
                detail: '',
                items: [
                  'Enseignement des mathématiques au collège',
                  'Activités pédagogiques adaptées aux différents profils',
                  'Soutien dans les difficultés d\'apprentissage',
                ],
              },
              {
                title: 'Vacataire en Mathématiques',
                place: 'ENS Casablanca',
                detail: 'Licence Biologie',
                items: [
                  'Enseignement des mathématiques appliquées',
                  'Adaptation à un public scientifique pluridisciplinaire',
                ],
              },
              {
                title: 'Vacataire en Mathématiques',
                place: 'Faculté des Sciences Aïn Chock — Casablanca',
                detail: 'Licence Physique',
                items: [
                  'Travaux dirigés en mathématiques pour licence physique',
                  'Transmission des outils mathématiques pour la modélisation',
                ],
              },
              {
                title: 'Cours de soutien',
                place: 'Collège · Lycée · CPGE · Licence',
                detail: '',
                items: [
                  'Encadrement individuel et en groupe',
                  'Préparation aux examens et concours',
                  'Explication progressive des notions fondamentales et approfondies',
                ],
              },
            ].map((exp, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <h3>{exp.title}</h3>
                  <p className="timeline-place">{exp.place}</p>
                  {exp.detail && <p className="timeline-detail">{exp.detail}</p>}
                  <ul>
                    {exp.items.map((it, j) => (
                      <li key={j}><FiChevronRight size={13} />{it}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Formation ── */}
        <section className="about-section">
          <h2 className="about-section-title">
            <FiAward size={20} /> Formation
          </h2>
          <div className="about-education">
            {[
              { year: '2022', label: 'Agrégation externe de Mathématiques', highlight: true },
              { year: '2018 – 2022', label: 'Doctorat en Mathématiques', sub: 'FS Ben Msik, Université Hassan II, Casablanca', highlight: true },
              { year: '2019 – 2020', label: 'Master 2 Analyse Fonctionnelle', sub: 'Université Franche-Comté, Besançon' },
              { year: '2017 – 2018', label: 'Master 2 Topologie Algébrique', sub: 'FS Ain Chok, Université Hassan II' },
              { year: '2016 – 2017', label: 'Master 1 Topologie Algébrique', sub: 'FS Ain Chok, Université Hassan II' },
              { year: '2015 – 2016', label: 'Licence SMA', sub: 'FS Ben Msik, Université Hassan II' },
              { year: '2023', label: 'Data Science Bootcamp', sub: 'GoMyCode' },
            ].map((edu, i) => (
              <div key={i} className={`edu-item${edu.highlight ? ' edu-highlight' : ''}`}>
                <span className="edu-year">{edu.year}</span>
                <div className="edu-text">
                  <strong>{edu.label}</strong>
                  {edu.sub && <span>{edu.sub}</span>}
                </div>
              </div>
            ))}
            <div className="edu-scores">
              <div className="score-badge">TOEFL iBT <strong>98</strong></div>
              <div className="score-badge">GRE Math <strong>690</strong></div>
            </div>
          </div>
        </section>

        {/* ── Publications ── */}
        <section className="about-section">
          <h2 className="about-section-title">
            <FiFileText size={20} /> Publications Scientifiques
          </h2>
          <div className="about-publications">
            {[
              {
                title: 'On some results on interpolative Kannan-type and CRR-type contractions',
                journal: 'Moroccan Journal of Pure and Applied Analysis, 2022',
              },
              {
                title: 'New Modular Fixed-Point Theorem in the Variable Exponent Spaces',
                journal: 'Mathematics, 2022',
              },
              {
                title: 'A fixed point theorem in the Lebesgue spaces of variable integrability Lp(·)',
                journal: 'Mathematics, 2022',
              },
            ].map((pub, i) => (
              <div key={i} className="pub-item">
                <span className="pub-title">{pub.title}</span>
                <span className="pub-journal">{pub.journal}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Contact ── */}
        <section className="about-cta">
          <p>Une question ? Un cours ? Contactez-moi directement.</p>
          <Link to="/contact" className="btn-primary-about">
            <FiMail size={16} /> Aller à la page Contact
          </Link>
        </section>

      </div>
    </div>
  );
};

export default About;
