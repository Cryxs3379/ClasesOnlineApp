import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyClasses } from '../services/classService';
import { getAuthErrorMessage } from '../services/authService';
import { useAuth } from '../auth/AuthContext';
import ClassCard from '../components/ClassCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export default function MyClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchClasses() {
      setLoading(true);
      setError('');
      try {
        const data = await getMyClasses();
        setClasses(Array.isArray(data) ? data : []);
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
    fetchClasses();
  }, [logoutUser, navigate]);

  if (loading) return <Loading />;

  return (
    <div className="my-classes">
      <div className="page-header">
        <h1>Mis clases</h1>
        <p>
          {user?.role === 'teacher'
            ? 'Clases que tienes programadas con tus alumnos.'
            : 'Tus clases reservadas con profesores.'}
        </p>
      </div>

      <ErrorMessage message={error} />

      {classes.length === 0 && !error ? (
        <EmptyState
          title="No tienes clases"
          message={
            user?.role === 'student'
              ? 'Reserva tu primera clase desde el perfil de un profesor.'
              : 'Cuando un alumno reserve contigo, aparecerá aquí.'
          }
          action={
            user?.role === 'student' ? (
              <Link to="/teachers" className="btn btn-primary">
                Ver profesores
              </Link>
            ) : null
          }
        />
      ) : (
        <div className="cards-grid">
          {classes.map((classItem) => (
            <ClassCard key={classItem.id} classItem={classItem} />
          ))}
        </div>
      )}
    </div>
  );
}
