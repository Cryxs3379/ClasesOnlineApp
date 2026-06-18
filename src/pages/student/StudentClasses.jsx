import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyClasses } from '../../services/classService';
import { getAuthErrorMessage } from '../../services/authService';
import { useAuth } from '../../auth/AuthContext';
import { CLASS_FILTER_OPTIONS, filterClasses } from '../../utils/classDisplay';
import ClassCard from '../../components/ClassCard';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

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

  const filteredClasses = useMemo(
    () => filterClasses(classes, statusFilter),
    [classes, statusFilter]
  );

  if (loading) return <Loading />;

  return (
    <div className="workspace-page classes-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Mis sesiones</span>
          <h1>Mis clases</h1>
          <p>Consulta tus clases programadas con tu profesor.</p>
        </div>
        <Link to="/student/calendar" className="btn btn-outline">
          Ver calendario
        </Link>
      </div>

      <ErrorMessage message={error} />

      <section className="workspace-toolbar">
        <div className="filter-pills" role="tablist" aria-label="Filtrar clases">
          {CLASS_FILTER_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={statusFilter === option.id}
              className={`filter-pill${statusFilter === option.id ? ' active' : ''}`}
              onClick={() => setStatusFilter(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {filteredClasses.length === 0 && !error ? (
        <EmptyState
          icon="🎥"
          title="No tienes clases"
          message="Tu profesor programará clases para ti."
          action={
            <Link to="/student/calendar" className="btn btn-outline btn-block">
              Ver calendario
            </Link>
          }
        />
      ) : (
        <section className="class-card-grid">
          {filteredClasses.map((classItem) => (
            <ClassCard key={classItem.id} classItem={classItem} role="student" />
          ))}
        </section>
      )}
    </div>
  );
}
