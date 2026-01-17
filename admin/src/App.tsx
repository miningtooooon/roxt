import React from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Shell from './pages/Shell';

function isAuthed() {
  return !!localStorage.getItem('admin_token');
}

export default function App() {
  const nav = useNavigate();

  return (
    <Routes>
      <Route path="/login" element={<Login onAuthed={() => nav('/')} />} />
      <Route
        path="/*"
        element={isAuthed() ? <Shell /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}
