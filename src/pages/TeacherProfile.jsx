import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { saveTeacherProfile } from '../services/teacherService';
import { getAuthErrorMessage } from '../services/authService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function TeacherProfile() {
  const [bio, setBio] = useState('');
  const [hourlyPrice, setHourlyPrice] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setSuccess('');
  }, [bio, hourlyPrice, subject]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!bio.trim() || !subject.trim() || !hourlyPrice) {
      setError('Completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const response = await saveTeacherProfile({
        bio: bio.trim(),
        hourly_price: Number(hourlyPrice),
        subject: subject.trim(),
      });
      setSuccess(response.message || 'Perfil guardado correctamente.');
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

  return (
    <div className="page-form">
      <div className="page-header">
        <h1>Mi perfil de profesor</h1>
        <p>Completa tu perfil para que los alumnos puedan encontrarte.</p>
      </div>

      <div className="form-card card">
        <ErrorMessage message={error} />
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="subject">Materia</label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ej: Programación"
            />
          </div>

          <div className="form-group">
            <label htmlFor="hourly_price">Precio por hora (€)</label>
            <input
              id="hourly_price"
              type="number"
              min="0"
              step="0.01"
              value={hourlyPrice}
              onChange={(e) => setHourlyPrice(e.target.value)}
              placeholder="20"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Biografía</label>
            <textarea
              id="bio"
              rows="5"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Cuéntanos tu experiencia y metodología..."
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar perfil'}
          </button>
        </form>
      </div>
    </div>
  );
}
