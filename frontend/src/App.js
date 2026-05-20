import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CoursePage from './pages/CoursePage';
import Dashboard from './pages/dashboard/Dashboard';
import CourseEditor from './pages/dashboard/CourseEditor';
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
            <Route path="/dashboard"            element={<Dashboard />} />
            <Route path="/dashboard/new"        element={<CourseEditor />} />
            <Route path="/dashboard/edit/:id"   element={<CourseEditor />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
