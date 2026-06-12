import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStudents } from '../../services/studentService';
import { getAuthErrorMessage } from '../../services/authService';
import { useAuth } from '../../auth/AuthContext';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadStudents() {
      try {
        setLoading(true);
        setError('');
        const data = await getStudents();
        setStudents(data);
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
    loadStudents();
  }, [logoutUser, navigate]);

  if (loading) return <Loading />;

  return (
    <div className="teacher-students">
      <div className="page-header">
        <div>
          <span className="eyebrow">Gestión de alumnos</span>
          <h1>Mis alumnos</h1>
          <p>Crea y administra las cuentas de tus alumnos.</p>
        </div>
        <Link to="/teacher/students/new" className="btn btn-primary">
          Crear alumno
        </Link>
      </div>

      <ErrorMessage message={error} />

      {students.length === 0 && !error ? (
        <EmptyState
          title="Aún no tienes alumnos"
          message="Crea tu primer alumno para empezar a programar clases."
          action={
            <Link to="/teacher/students/new" className="btn btn-primary">
              Crear alumno
            </Link>
          }
        />
      ) : (
        <div className="table-card card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>
                    <span
                      className={`status-badge status-badge--${student.is_active !== false ? 'scheduled' : 'cancelled'}`}
                    >
                      {student.is_active !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <Link to={`/teacher/students/${student.id}`} className="btn btn-outline btn-sm">
                      Ver ficha
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
