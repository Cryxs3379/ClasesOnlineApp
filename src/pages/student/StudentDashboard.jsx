import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyClasses } from '../../services/classService';
import { getAuthErrorMessage } from '../../services/authService';
import { useAuth } from '../../auth/AuthContext';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

export default function StudentDashboard() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');
        const data = await getMyClasses();
        setClasses(data);
      } catch (err) {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          logoutUser();
          navigate('/login');
          return;
        }
        setError(getAuthErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [logoutUser, navigate]);

  const upcomingClass = useMemo(() => {
    const now = new Date();
    return classes
      .filter((item) => item.status === 'scheduled' && new Date(item.start_time) >= now)
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))[0];
  }, [classes]);

  if (loading) return <Loading />;

  return (
    <div className="dashboard-pro">
      <div className="page-header">
        <div>
          <span className="eyebrow">Panel de alumno</span>
          <h1>Hola, {user?.name}</h1>
          <p>Accede a tus clases, materiales y comunicación con tu profesor.</p>
        </div>
        <Link to="/student/classes" className="btn btn-primary">
          Ver mis clases
        </Link>
      </div>

      <ErrorMessage message={error} />

      <section className="stats-grid">
        <article className="stat-card">
          <span>Clases totales</span>
          <strong>{classes.length}</strong>
        </article>
        <article className="stat-card">
          <span>Programadas</span>
          <strong>{classes.filter((c) => c.status === 'scheduled').length}</strong>
        </article>
        <article className="stat-card">
          <span>Mensajes</span>
          <strong>0</strong>
        </article>
        <article className="stat-card">
          <span>Documentos</span>
          <strong>0</strong>
        </article>
      </section>

      <section className="dashboard-layout">
        <article className="card">
          <h2>Próxima clase</h2>
          {upcomingClass ? (
            <div className="next-class">
              <h3>{upcomingClass.title}</h3>
              <p>{upcomingClass.teacher_name}</p>
              <p>{new Date(upcomingClass.start_time).toLocaleString('es-ES')}</p>
              <Link to={`/student/classroom/${upcomingClass.id}`} className="btn btn-primary">
                Entrar a BridgeCall
              </Link>
            </div>
          ) : (
            <p className="muted">No tienes clases próximas.</p>
          )}
        </article>

        <article className="card">
          <h2>Accesos rápidos</h2>
          <div className="quick-actions">
            <Link to="/student/classes" className="quick-action">
              Mis clases
            </Link>
            <Link to="/student/calendar" className="quick-action">
              Calendario
            </Link>
            <Link to="/student/messages" className="quick-action">
              Mensajes
            </Link>
            <Link to="/student/documents" className="quick-action">
              Documentos
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
