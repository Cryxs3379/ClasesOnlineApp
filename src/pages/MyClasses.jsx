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

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const classesPath = isTeacher ? '/teacher/classes' : '/student/classes';
  const classroomBase = isTeacher ? '/teacher/classroom' : '/student/classroom';

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
          {isTeacher
            ? 'Clases que tienes programadas con tus alumnos.'
            : 'Tus clases programadas con tu profesor.'}
        </p>
      </div>

      <ErrorMessage message={error} />

      {classes.length === 0 && !error ? (
        <EmptyState
          title="No tienes clases"
          message={
            isTeacher
              ? 'Programa una clase para uno de tus alumnos.'
              : 'Tu profesor programará clases para ti.'
          }
          action={
            isTeacher ? (
              <Link to="/teacher/classes/new" className="btn btn-primary">
                Crear clase
              </Link>
            ) : (
              <Link to="/student/classes" className="btn btn-primary">
                Ver mis clases
              </Link>
            )
          }
        />
      ) : (
        <div className="cards-grid">
          {classes.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              classroomPath={`${classroomBase}/${classItem.id}`}
            />
          ))}
        </div>
      )}

      <Link to={classesPath} className="back-link" style={{ marginTop: '1rem' }}>
        Ir a {isTeacher ? 'gestión de clases' : 'mis clases'}
      </Link>
    </div>
  );
}
