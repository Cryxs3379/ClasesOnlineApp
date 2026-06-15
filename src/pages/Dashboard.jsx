import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import RoleBadge from '../components/RoleBadge';

export default function Dashboard() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

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
        {isTeacher && (
          <>
            <Link to="/teacher/students" className="card dashboard-card">
              <h3>Gestionar alumnos</h3>
              <p>Crea y administra las cuentas de tus alumnos.</p>
            </Link>
            <Link to="/teacher/classes" className="card dashboard-card">
              <h3>Mis clases</h3>
              <p>Consulta y programa clases con BridgeCall.</p>
            </Link>
          </>
        )}

        {user.role === 'student' && (
          <>
            <Link to="/student/classes" className="card dashboard-card">
              <h3>Mis clases</h3>
              <p>Consulta tus clases y entra en BridgeCall.</p>
            </Link>
            <Link to="/student/calendar" className="card dashboard-card">
              <h3>Calendario</h3>
              <p>Visualiza tu agenda de clases.</p>
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
