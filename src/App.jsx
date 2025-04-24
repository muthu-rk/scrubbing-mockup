import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Profile from './pages/Profile';
import Annotation from './pages/Annotation';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/history" element={<History />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/annotation/:id" element={<Annotation />} />
      <Route path="*" element={<p className="p-6">Page not found. <a href="/">Go Home</a></p>} />
    </Routes>
  );
}
