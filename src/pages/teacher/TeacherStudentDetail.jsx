import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getStudentById, updateStudentStatus } from '../../services/studentService';
import { getAuthErrorMessage } from '../../services/authService';
import { useAuth } from '../../auth/AuthContext';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

export default function TeacherStudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadStudent() {
      try {
        setLoading(true);
        setError('');
        const data = await getStudentById(id);
        setStudent(data);
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
    loadStudent();
  }, [id, logoutUser, navigate]);

  async function handleToggleStatus() {
    if (!student) return;
    setUpdating(true);
    setError('');
    setSuccess('');
    try {
      const nextStatus = student.is_active === false;
      await updateStudentStatus(student.id, nextStatus);
      setStudent({ ...student, is_active: nextStatus });
      setSuccess(nextStatus ? 'Alumno activado correctamente.' : 'Alumno desactivado correctamente.');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="student-profile">
      <Link to="/teacher/students" className="back-link">
        ← Volver a alumnos
      </Link>

      <ErrorMessage message={error} />
      {success && <div className="alert alert-success">{success}</div>}

      {student && (
        <>
          <div className="page-header">
            <div>
              <span className="eyebrow">Ficha de alumno</span>
              <h1>{student.name}</h1>
              <p>{student.email}</p>
            </div>
            <span
              className={`status-badge status-badge--${student.is_active !== false ? 'scheduled' : 'cancelled'}`}
            >
              {student.is_active !== false ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          <div className="dashboard-layout">
            <article className="card">
              <h2>Información</h2>
              <div className="classroom__row">
                <span className="class-card__label">Nombre</span>
                <span>{student.name}</span>
              </div>
              <div className="classroom__row">
                <span className="class-card__label">Email</span>
                <span>{student.email}</span>
              </div>
              <div className="classroom__row">
                <span className="class-card__label">Estado</span>
                <span>{student.is_active !== false ? 'Activo' : 'Inactivo'}</span>
              </div>
            </article>

            <article className="card">
              <h2>Acciones</h2>
              <div className="quick-actions">
                <Link
                  to={`/teacher/classes/new?studentId=${student.id}`}
                  className="quick-action"
                >
                  Crear clase para este alumno
                </Link>
                <Link to="/teacher/documents" className="quick-action">
                  Ver documentos
                </Link>
                <Link to="/teacher/messages" className="quick-action">
                  Enviar mensaje
                </Link>
                <button
                  type="button"
                  className="quick-action"
                  onClick={handleToggleStatus}
                  disabled={updating}
                >
                  {student.is_active !== false ? 'Desactivar alumno' : 'Activar alumno'}
                </button>
              </div>
            </article>
          </div>
        </>
      )}
    </div>
  );
}
