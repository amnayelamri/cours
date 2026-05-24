import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CoursePage from './pages/CoursePage';
import About from './pages/About';
import Contact from './pages/Contact';
import CollectionPage from './pages/CollectionPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticlePage from './pages/ArticlePage';
import Dashboard from './pages/dashboard/Dashboard';
import CourseEditor from './pages/dashboard/CourseEditor';
import ArticleEditor from './pages/dashboard/ArticleEditor';
import './App.css';

function App() {
  return (
    <HashRouter>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/"                     element={<Home />} />
            <Route path="/course/:id"           element={<CoursePage />} />
            <Route path="/about"                element={<About />} />
            <Route path="/contact"              element={<Contact />} />
            <Route path="/collection/:id"       element={<CollectionPage />} />
            <Route path="/articles"                       element={<ArticlesPage />} />
            <Route path="/articles/:id"                   element={<ArticlePage />} />
            <Route path="/dashboard"                      element={<Dashboard />} />
            <Route path="/dashboard/new"                  element={<CourseEditor />} />
            <Route path="/dashboard/edit/:id"             element={<CourseEditor />} />
            <Route path="/dashboard/articles/new"         element={<ArticleEditor />} />
            <Route path="/dashboard/articles/edit/:id"    element={<ArticleEditor />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
