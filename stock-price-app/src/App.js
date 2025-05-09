import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import StockPage from './pages/StockPage';
import HeatmapPage from './pages/HeatmapPage';

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <nav className="nav-bar">
          <ul className="menu">
            <li><Link to="/">Stock Chart</Link></li>
            <li><Link to="/heatmap">Correlation Heatmap</Link></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<StockPage />} />
          <Route path="/heatmap" element={<HeatmapPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;