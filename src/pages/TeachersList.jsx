import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeachers } from '../services/teacherService';
import { getAuthErrorMessage } from '../services/authService';
import { useAuth } from '../auth/AuthContext';
import TeacherCard from '../components/TeacherCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export default function TeachersList() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTeachers() {
      setLoading(true);
      setError('');
      try {
        const data = await getTeachers();
        console.log('TEACHERS RESPONSE:', data);
        setTeachers(Array.isArray(data) ? data : []);
      } catch (err) {
        const status = err.response?.status;
        if (user && (status === 401 || status === 403)) {
          logoutUser();
          navigate('/login');
          return;
        }
        setError(getAuthErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    fetchTeachers();
  }, [user, logoutUser, navigate]);

  if (loading) return <Loading />;

  return (
    <div className="teachers-list">
      <div className="page-header">
        <h1>Profesores</h1>
        <p>Encuentra al profesor perfecto para tu próxima clase.</p>
      </div>

      <ErrorMessage message={error} />

      {teachers.length === 0 && !error ? (
        <EmptyState
          title="No hay profesores disponibles"
          message="Vuelve más tarde o regístrate como profesor."
        />
      ) : (
        <div className="cards-grid">
          {teachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      )}
    </div>
  );
}
