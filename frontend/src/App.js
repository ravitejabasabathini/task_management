import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const allowedUnauthenticated = ['/login', '/signup'];
    if (!user && !allowedUnauthenticated.includes(location.pathname)) {
      navigate('/login');
    }
  }, [user, navigate, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-logo">TM</div>
          <div>
            <h1 className="brand-title">Task Manager</h1>
            <p className="brand-subtitle">Organize projects, assign tasks, track progress.</p>
          </div>
        </div>

        {user && (
          <div className="user-pill">
            <span>{user.name} ({user.role})</span>
            <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </header>

      <Routes>
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/signup" element={<Signup onSignup={setUser} />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="/*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      </Routes>
    </div>
  );
}

export default App;
