import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createStudent } from '../../services/studentService';
import { getAuthErrorMessage } from '../../services/authService';
import ErrorMessage from '../../components/ErrorMessage';

export default function TeacherCreateStudent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      await createStudent({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      navigate('/teacher/students');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-form">
      <Link to="/teacher/students" className="back-link">
        ← Volver a alumnos
      </Link>

      <div className="page-header">
        <div>
          <span className="eyebrow">Nuevo alumno</span>
          <h1>Crear alumno</h1>
          <p>El alumno recibirá unas credenciales para acceder a sus clases.</p>
        </div>
      </div>

      <div className="form-card card">
        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="name">Nombre del alumno</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alumno Demo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email del alumno</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alumno@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña temporal</label>
            <input
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="123456"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creando...' : 'Crear alumno'}
          </button>
        </form>
      </div>
    </div>
  );
}
