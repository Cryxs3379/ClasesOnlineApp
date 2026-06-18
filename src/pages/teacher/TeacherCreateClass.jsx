import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getStudents } from '../../services/studentService';
import { createClass } from '../../services/classService';
import { getAuthErrorMessage } from '../../services/authService';
import { localDateTimeToUtcIso } from '../../utils/dateTimeUtils';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';

export default function TeacherCreateClass() {
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState(searchParams.get('studentId') || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await getStudents();
        setStudents(data.filter((s) => s.is_active !== false));
      } catch (err) {
        setError(getAuthErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!studentId || !title.trim() || !startTime || !endTime) {
      setError('Completa alumno, título y fechas.');
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
      await createClass({
        student_id: studentId,
        title: title.trim(),
        description: description.trim(),
        start_time: startTimeIso,
        end_time: endTimeIso,
      });
      navigate('/teacher/classes');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="workspace-page page-form">
      <Link to="/teacher/classes" className="back-link">
        ← Volver a clases
      </Link>

      <div className="page-header">
        <div>
          <span className="eyebrow">Nueva clase</span>
          <h1>Programar clase</h1>
          <p>Crea una clase para uno de tus alumnos.</p>
        </div>
      </div>

      <div className="form-card card upload-card">
        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} className="form">
          <fieldset className="form-section">
            <legend className="form-section__title">1. Datos de la clase</legend>
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Título
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Clase de repaso"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Descripción
              </label>
              <textarea
                id="description"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Objetivos de la sesión..."
              />
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend className="form-section__title">2. Alumno</legend>
            <div className="form-group">
              <label htmlFor="student_id" className="form-label">
                Selecciona alumno
              </label>
              <select
                id="student_id"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              >
                <option value="">Selecciona un alumno</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend className="form-section__title">3. Fecha y hora</legend>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="start_time" className="form-label">
                  Inicio
                </label>
                <input
                  id="start_time"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="end_time" className="form-label">
                  Fin
                </label>
                <input
                  id="end_time"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </fieldset>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Creando...' : 'Crear clase'}
            </button>
            <Link to="/teacher/classes" className="btn btn-outline btn-block">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
