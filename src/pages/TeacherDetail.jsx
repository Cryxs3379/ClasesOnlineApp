import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getTeacherById } from '../services/teacherService';
import { createClass } from '../services/classService';
import { getAuthErrorMessage } from '../services/authService';
import { localDateTimeToUtcIso } from '../utils/dateTimeUtils';
import { useAuth } from '../auth/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function TeacherDetail() {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTeacher() {
      setLoading(true);
      setError('');
      try {
        const data = await getTeacherById(id);
        setTeacher(data);
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
    fetchTeacher();
  }, [id, user, logoutUser, navigate]);

  async function handleBook(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!startTime || !endTime) {
      setError('Selecciona fecha y hora de inicio y fin.');
      return;
    }

    const startTimeIso = localDateTimeToUtcIso(startTime);
    const endTimeIso = localDateTimeToUtcIso(endTime);

    if (!startTimeIso || !endTimeIso) {
      setError('Las fechas no son válidas.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await createClass({
        teacher_id: teacher.user_id,
        start_time: startTimeIso,
        end_time: endTimeIso,
      });
      setSuccess(response.message || 'Clase reservada correctamente.');
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        logoutUser();
        navigate('/login');
        return;
      }
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loading />;
  if (!teacher && !error) return null;

  return (
    <div className="teacher-detail">
      <Link to="/" className="back-link">
        ← Volver al inicio
      </Link>

      <ErrorMessage message={error} />

      {teacher && (
        <div className="teacher-detail__content card">
          <h1>{teacher.name}</h1>
          <p className="teacher-detail__email">{teacher.email}</p>
          <div className="teacher-detail__meta">
            <span className="teacher-card__subject">{teacher.subject}</span>
            <span className="teacher-card__price">{teacher.hourly_rate ?? teacher.hourly_price} €/hora</span>
          </div>
          <p className="teacher-detail__bio">{teacher.bio}</p>

          {!user && (
            <div className="booking-section">
              <p>Para reservar una clase necesitas iniciar sesión.</p>
              <Link to="/login" className="btn btn-primary">
                Inicia sesión para reservar
              </Link>
            </div>
          )}

          {user?.role === 'student' && (
            <div className="booking-section">
              <h2>Reservar clase</h2>

              {success ? (
                <div className="booking-success">
                  <div className="alert alert-success">{success}</div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate('/student/classes')}
                  >
                    Ver mis clases
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBook} className="form">
                  <div className="form-group">
                    <label htmlFor="start_time">Inicio</label>
                    <input
                      id="start_time"
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="end_time">Fin</label>
                    <input
                      id="end_time"
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Reservando...' : 'Reservar clase'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
