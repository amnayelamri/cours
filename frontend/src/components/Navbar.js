import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiUser, FiMail, FiSettings, FiFileText } from 'react-icons/fi';

const isLocal = window.location.hostname === 'localhost';

const Navbar = () => {
  const { pathname } = useLocation();
  const active = (path) => pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <img src={`${process.env.PUBLIC_URL}/tree.svg`} alt="arbre" className="brand-tree" />
          <span>Prof. El Amri Amnay</span>
        </Link>
        <div className="navbar-menu">
          <Link to="/" className={active('/')}>
            <FiHome size={18} />
            <span>Cours</span>
          </Link>
          <Link to="/about" className={active('/about')}>
            <FiUser size={18} />
            <span>À propos</span>
          </Link>
          <Link to="/articles" className={active('/articles')}>
            <FiFileText size={18} />
            <span>Articles</span>
          </Link>
          <Link to="/contact" className={active('/contact')}>
            <FiMail size={18} />
            <span>Contact</span>
          </Link>
          {isLocal && (
            <Link to="/dashboard" className={active('/dashboard')}>
              <FiSettings size={18} />
              <span>Dashboard</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
