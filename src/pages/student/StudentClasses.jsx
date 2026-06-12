import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyClasses } from '../../services/classService';
import { getAuthErrorMessage } from '../../services/authService';
import { useAuth } from '../../auth/AuthContext';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

function formatDateTime(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function StudentClasses() {
  const [classes, setClasses] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
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

  const filteredClasses = useMemo(() => {
    if (statusFilter === 'all') return classes;
    return classes.filter((item) => item.status === statusFilter);
  }, [classes, statusFilter]);

  if (loading) return <Loading />;

  return (
    <div className="dashboard-pro">
      <div className="page-header">
        <div>
          <span className="eyebrow">Mis sesiones</span>
          <h1>Mis clases</h1>
          <p>Consulta tus clases programadas con tu profesor.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      <div className="form-group" style={{ maxWidth: '240px', marginBottom: '1rem' }}>
        <label htmlFor="statusFilter">Filtrar por estado</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Todas</option>
          <option value="scheduled">Programadas</option>
          <option value="completed">Completadas</option>
          <option value="cancelled">Canceladas</option>
        </select>
      </div>

      {filteredClasses.length === 0 && !error ? (
        <EmptyState
          title="No tienes clases"
          message="Tu profesor programará clases para ti."
        />
      ) : (
        <div className="cards-grid">
          {filteredClasses.map((classItem) => (
            <article key={classItem.id} className="card class-card">
              <h3>{classItem.title}</h3>
              <div className="class-card__row">
                <span className="class-card__label">Profesor</span>
                <span>{classItem.teacher_name}</span>
              </div>
              <div className="class-card__row">
                <span className="class-card__label">Inicio</span>
                <span>{formatDateTime(classItem.start_time)}</span>
              </div>
              <div className="class-card__row">
                <span className="class-card__label">Estado</span>
                <span className={`status-badge status-badge--${classItem.status}`}>
                  {classItem.status}
                </span>
              </div>
              <Link
                to={`/student/classroom/${classItem.id}`}
                className="btn btn-primary btn-block"
              >
                Entrar a BridgeCall
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
