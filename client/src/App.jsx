import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Timeline from './pages/Timeline.jsx';
import PromiseTracker from './pages/PromiseTracker.jsx';
import EventDetail from './pages/EventDetail.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  return (
    <div className="grid-bg" style={{ position: 'relative', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<Timeline />} />
          <Route path="/promises" element={<PromiseTracker />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </div>
  );
}
