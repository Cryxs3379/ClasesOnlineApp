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
          BridgeClass
        </Link>

        <nav className="navbar__links">
          {!user && (
            <>
              <Link to="/">Inicio</Link>
              <Link to="/login">Iniciar sesión</Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Crear cuenta profesor
              </Link>
            </>
          )}

          {user?.role === 'teacher' || user?.role === 'admin' ? (
            <>
              <Link to="/teacher/dashboard">Dashboard</Link>
              <Link to="/teacher/students">Alumnos</Link>
              <Link to="/teacher/classes">Clases</Link>
              <Link to="/teacher/calendar">Calendario</Link>
              <Link to="/teacher/messages">Mensajes</Link>
              <Link to="/teacher/documents">Documentos</Link>
              <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          ) : null}

          {user?.role === 'student' ? (
            <>
              <Link to="/student/dashboard">Dashboard</Link>
              <Link to="/student/classes">Mis clases</Link>
              <Link to="/student/calendar">Calendario</Link>
              <Link to="/student/messages">Mensajes</Link>
              <Link to="/student/documents">Documentos</Link>
              <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
