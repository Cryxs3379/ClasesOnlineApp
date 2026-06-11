import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import RoleBadge from '../components/RoleBadge';

export default function Dashboard() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logoutUser();
    navigate('/login');
  }

  if (!user) return null;

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Hola, {user.name}</h1>
          <p className="page-header__meta">{user.email}</p>
        </div>
        <RoleBadge role={user.role} />
      </div>

      <div className="dashboard__grid">
        {user.role === 'student' && (
          <>
            <Link to="/teachers" className="card dashboard-card">
              <h3>Buscar profesores</h3>
              <p>Encuentra el profesor ideal para tu próxima clase.</p>
            </Link>
            <Link to="/my-classes" className="card dashboard-card">
              <h3>Mis clases</h3>
              <p>Consulta tus clases reservadas y entra en la sala.</p>
            </Link>
          </>
        )}

        {user.role === 'teacher' && (
          <>
            <Link to="/teacher-profile" className="card dashboard-card">
              <h3>Mi perfil de profesor</h3>
              <p>Actualiza tu bio, materia y precio por hora.</p>
            </Link>
            <Link to="/my-classes" className="card dashboard-card">
              <h3>Mis clases</h3>
              <p>Revisa las clases que tienes programadas.</p>
            </Link>
          </>
        )}
      </div>

      <button type="button" className="btn btn-outline" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
}
