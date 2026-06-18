import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getClassById, updateClassStatus } from '../services/classService';
import { getAuthErrorMessage } from '../services/authService';
import { JITSI_URL } from '../constants/config';
import { useAuth } from '../auth/AuthContext';
import BridgeCallRoom from '../components/BridgeCallRoom';
import WhiteboardOverlayPlaceholder from '../components/WhiteboardOverlayPlaceholder';
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
  const [copied, setCopied] = useState('');
  const [finishing, setFinishing] = useState(false);

  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const classesPath = isTeacher ? '/teacher/classes' : '/student/classes';

  const roomUrl = classData?.jitsi_room_name
    ? `${JITSI_URL}/${classData.jitsi_room_name}`
    : '';

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

  const handleLeaveCall = useCallback(() => {
    navigate(classesPath);
  }, [navigate, classesPath]);

  async function handleCopyRoomUrl() {
    if (!roomUrl) return;
    await navigator.clipboard.writeText(roomUrl);
    setCopied('Enlace copiado');
    setTimeout(() => setCopied(''), 1800);
  }

  async function handleFinishClass() {
    setFinishing(true);
    setError('');
    try {
      await updateClassStatus(id, 'completed');
      navigate(classesPath);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setFinishing(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="classroom-pro">
      <Link to={classesPath} className="back-link">
        ← Volver a mis clases
      </Link>

      <ErrorMessage message={error} />

      {classData && (
        <>
          <div className="page-header">
            <div>
              <span className="eyebrow">BridgeCall</span>
              <h1>{classData.title || 'Sala de clase'}</h1>
              <p>
                {classData.teacher_name} · {classData.student_name}
              </p>
            </div>
            <span className={`status-badge status-badge--${classData.status}`}>
              {classData.status}
            </span>
          </div>

          <div className="card classroom__meta">
            <div className="classroom__row">
              <span className="class-card__label">Inicio</span>
              <span>{formatDateTime(classData.start_time)}</span>
            </div>
            <div className="classroom__row">
              <span className="class-card__label">Fin</span>
              <span>{formatDateTime(classData.end_time)}</span>
            </div>
            <div className="classroom__row">
              <span className="class-card__label">Sala online</span>
              <span>{classData.jitsi_room_name || 'Pendiente'}</span>
            </div>
            <div className="classroom__actions">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleCopyRoomUrl}
                disabled={!roomUrl}
              >
                {copied || 'Copiar enlace'}
              </button>
              {roomUrl && (
                <a
                  href={roomUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  Abrir en nueva pestaña
                </a>
              )}
              {isTeacher && classData.status === 'scheduled' && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleFinishClass}
                  disabled={finishing}
                >
                  {finishing ? 'Finalizando...' : 'Finalizar clase'}
                </button>
              )}
            </div>
          </div>

          <div className="classroom-stage">
            <div className="classroom-video-shell">
              {classData.jitsi_room_name ? (
                <BridgeCallRoom
                  roomName={classData.jitsi_room_name}
                  displayName={user?.name || 'Usuario'}
                  email={user?.email || ''}
                  onLeave={handleLeaveCall}
                />
              ) : (
                <div className="bridgecall-overlay">
                  Sala BridgeCall pendiente de asignar
                </div>
              )}
              <WhiteboardOverlayPlaceholder canDraw={isTeacher} />
            </div>

            <aside className="classroom-tools-panel">
              <article className="card">
                <h2>Documentos</h2>
                <p className="muted">Materiales de la clase próximamente.</p>
              </article>
              <article className="card">
                <h2>Notas</h2>
                <p className="muted">Panel de notas en preparación.</p>
              </article>
              <article className="card">
                <h2>Mensajes</h2>
                <p className="muted">Chat en tiempo real próximamente.</p>
              </article>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
