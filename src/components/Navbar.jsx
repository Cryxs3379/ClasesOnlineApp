import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logoutUser();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo">
          Clases Online
        </Link>

        <nav className="navbar__links">
          <Link to="/">Home</Link>
          <Link to="/teachers">Profesores</Link>

          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/my-classes">Mis clases</Link>
              <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Registro
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
