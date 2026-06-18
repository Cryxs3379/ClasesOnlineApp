import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyClasses, updateClassStatus } from '../../services/classService';
import { getAuthErrorMessage } from '../../services/authService';
import { useAuth } from '../../auth/AuthContext';
import { CLASS_FILTER_OPTIONS, filterClasses } from '../../utils/classDisplay';
import ClassCard from '../../components/ClassCard';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

export default function TeacherClasses() {
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

  async function handleComplete(classId) {
    try {
      await updateClassStatus(classId, 'completed');
      setClasses((prev) =>
        prev.map((item) => (item.id === classId ? { ...item, status: 'completed' } : item))
      );
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="workspace-page classes-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Programación</span>
          <h1>Mis clases</h1>
          <p>Gestiona tus clases programadas y accede a BridgeCall.</p>
        </div>
        <Link to="/teacher/classes/new" className="btn btn-primary">
          Crear clase
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
        <Link to="/teacher/classes/new" className="btn btn-outline workspace-toolbar__action">
          + Nueva clase
        </Link>
      </section>

      {filteredClasses.length === 0 && !error ? (
        <EmptyState
          icon="🎥"
          title="No hay clases"
          message="Programa una clase para uno de tus alumnos."
          action={
            <Link to="/teacher/classes/new" className="btn btn-primary btn-block">
              Crear clase
            </Link>
          }
        />
      ) : (
        <section className="class-card-grid">
          {filteredClasses.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              role="teacher"
              onComplete={handleComplete}
            />
          ))}
        </section>
      )}
    </div>
  );
}
