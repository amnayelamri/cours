import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiSettings } from 'react-icons/fi';

const isLocal = window.location.hostname === 'localhost';

const Navbar = () => {
  const { pathname } = useLocation();
  const active = (path) => pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <img src={`${process.env.PUBLIC_URL}/tree.svg`} alt="arbre" className="brand-tree" />
          <span>Site du Professeur El Amri Amnay</span>
        </Link>
        <div className="navbar-menu">
          <Link to="/" className={active('/')}>
            <FiHome size={18} />
            <span>Explorer</span>
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
