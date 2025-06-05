import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import MaterialListPage from './pages/MaterialListPage';
import MaterialDetailPage from './pages/MaterialDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';


const App: React.FC = () => {
  return (
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/materials" replace />} />
          <Route path="/materials" element={<MaterialListPage />} />
          <Route path="/materials/:materialId" element={<MaterialDetailPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
  );
};

export default App;