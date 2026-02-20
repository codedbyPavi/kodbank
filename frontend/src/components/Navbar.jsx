import { useNavigate, useLocation } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { api } from '../api/axios';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleLogout = async () => {
    try {
      await api.post('/api/logout');
    } catch (_) {}
    navigate('/login');
  };

  if (isAuthPage) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => navigate('/dashboard')}>
          <span className="logo-icon">K</span>
          <span className="logo-text">Kodbank</span>
        </div>
        <button className="navbar-logout" onClick={handleLogout}>
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
