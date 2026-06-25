import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import Session from './pages/Session.jsx';
import Results from './pages/Results.jsx';
import Flashcards from './pages/Flashcards.jsx';
import History from './pages/History.jsx';
import Dashboard from './pages/Dashboard.jsx';

function RequireAuth({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  return (
    <header>
      <div className="logo">GRE<span>Math</span></div>
      <div className="nav-tabs">
        <NavLink to="/" className={({ isActive }) => 'nav-tab' + (isActive ? ' active' : '')} end>Practice</NavLink>
        <NavLink to="/flashcards" className={({ isActive }) => 'nav-tab' + (isActive ? ' active' : '')}>Flashcards</NavLink>
        <NavLink to="/history" className={({ isActive }) => 'nav-tab' + (isActive ? ' active' : '')}>History</NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => 'nav-tab' + (isActive ? ' active' : '')}>Dashboard</NavLink>
      </div>
      <div className="user-pill">
        <span>{user.displayName}</span>
        <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }}>Log out</button>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/session" element={<RequireAuth><Session /></RequireAuth>} />
          <Route path="/results" element={<RequireAuth><Results /></RequireAuth>} />
          <Route path="/flashcards" element={<RequireAuth><Flashcards /></RequireAuth>} />
          <Route path="/history" element={<RequireAuth><History /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        </Routes>
      </div>
    </>
  );
}
