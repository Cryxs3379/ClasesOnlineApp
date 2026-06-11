import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getClassById } from '../services/classService';
import { getAuthErrorMessage } from '../services/authService';
import { useAuth } from '../auth/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

function formatDateTime(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('es-ES', {
    dateStyle: 'full',
    timeStyle: 'short',
  });
}

export default function Classroom() {
  const { id } = useParams();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchClass() {
      setLoading(true);
      setError('');
      try {
        const data = await getClassById(id);
        setClassData(data);
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
    fetchClass();
  }, [id, logoutUser, navigate]);

  if (loading) return <Loading />;

  return (
    <div className="classroom">
      <Link to="/my-classes" className="back-link">
        ← Volver a mis clases
      </Link>

      <ErrorMessage message={error} />

      {classData && (
        <>
          <div className="page-header">
            <h1>Sala de clase</h1>
            <span className={`status-badge status-badge--${classData.status}`}>
              {classData.status}
            </span>
          </div>

          <div className="classroom__info card">
            <div className="classroom__row">
              <span className="class-card__label">Profesor</span>
              <span>{classData.teacher_name}</span>
            </div>
            <div className="classroom__row">
              <span className="class-card__label">Alumno</span>
              <span>{classData.student_name}</span>
            </div>
            <div className="classroom__row">
              <span className="class-card__label">Inicio</span>
              <span>{formatDateTime(classData.start_time)}</span>
            </div>
            <div className="classroom__row">
              <span className="class-card__label">Fin</span>
              <span>{formatDateTime(classData.end_time)}</span>
            </div>
          </div>

          <div className="classroom__video card">
            <div className="classroom__room-name">
              Sala online: {classData.jitsi_room_name || 'pendiente de asignar'}
            </div>
            <p className="classroom__placeholder">
              Más adelante aquí se integrará la videollamada con Jitsi.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
