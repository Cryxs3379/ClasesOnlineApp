import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyClasses } from '../../services/classService';
import { getAuthErrorMessage } from '../../services/authService';
import { useAuth } from '../../auth/AuthContext';
import MiniCalendar from '../../components/MiniCalendar';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

export default function StudentCalendar() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadClasses() {
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
    loadClasses();
  }, [logoutUser, navigate]);

  const upcomingClasses = useMemo(() => {
    const now = new Date();
    return classes
      .filter((item) => new Date(item.start_time) >= now)
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      .slice(0, 8);
  }, [classes]);

  if (loading) return <Loading />;

  return (
    <div className="dashboard-pro">
      <div className="page-header">
        <div>
          <span className="eyebrow">Agenda</span>
          <h1>Calendario</h1>
          <p>Consulta tus clases programadas.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      <section className="dashboard-layout">
        <MiniCalendar classes={classes} />

        <article className="card">
          <h2>Próximas clases</h2>
          {upcomingClasses.length === 0 ? (
            <p className="muted">No tienes clases próximas.</p>
          ) : (
            <div className="quick-actions">
              {upcomingClasses.map((item) => (
                <Link
                  key={item.id}
                  to={`/student/classroom/${item.id}`}
                  className="quick-action"
                >
                  <span>
                    {item.title} · {item.teacher_name}
                  </span>
                  <span>{new Date(item.start_time).toLocaleDateString('es-ES')}</span>
                </Link>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
