import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ReuniaoMeioSemana from './pages/ReuniaoMeioSemana';
import ReuniaoFimSemana from './pages/ReuniaoFimSemana';
import Donativos from './pages/Donativos';
import GruposCampo from './pages/GruposCampo';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reuniao-meio-semana" element={<ReuniaoMeioSemana />} />
          <Route path="/reuniao-fim-semana" element={<ReuniaoFimSemana />} />
          <Route path="/donativos" element={<Donativos />} />
          <Route path="/grupos-de-campo" element={<GruposCampo />} />
          <Route path="/grupos-campo" element={<GruposCampo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;