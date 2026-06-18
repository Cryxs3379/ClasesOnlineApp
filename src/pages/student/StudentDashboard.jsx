import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyClasses } from '../../services/classService';
import { getAssignments } from '../../services/assignmentService';
import { getDocuments } from '../../services/documentService';
import { getUnreadNotificationsCount } from '../../services/notificationService';
import { getConversations } from '../../services/conversationService';
import { getAuthErrorMessage } from '../../services/authService';
import { useAuth } from '../../auth/AuthContext';
import { getAssignmentDisplayStatus, isAssignmentOverdue } from '../../utils/assignmentStatus';
import {
  DashboardSectionCard,
  InlineEmptyState,
  QuickActionButton,
  QuickActions,
  StatCard,
} from '../../utils/dashboardComponents';
import {
  extractFulfilled,
  formatDate,
  formatDateTime,
  getClassName,
  getConversationDate,
  getConversationPreview,
  getDocumentDate,
  getLatestItems,
  getRecentConversations,
  getRecentFeedback,
  getStudentImportantAssignments,
  getTeacherName,
  getUpcomingClasses,
  hasAuthError,
  safeArray,
} from '../../utils/dashboardUtils';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

function AssignmentStatusBadge({ assignment }) {
  const displayStatus = getAssignmentDisplayStatus(assignment);
  return (
    <span className={`assignment-status assignment-status--${displayStatus.key}`}>
      {displayStatus.label}
    </span>
  );
}

function truncateText(text, maxLength = 120) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

export default function StudentDashboard() {
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [partialWarning, setPartialWarning] = useState('');

  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');
        setPartialWarning('');

        const results = await Promise.allSettled([
          getMyClasses(),
          getAssignments(),
          getDocuments(),
          getUnreadNotificationsCount(),
          getConversations(),
        ]);

        if (hasAuthError(results)) {
          logoutUser();
          navigate('/login');
          return;
        }

        const [
          classesResult,
          assignmentsResult,
          documentsResult,
          unreadNotificationsResult,
          conversationsResult,
        ] = results;

        setClasses(safeArray(extractFulfilled(classesResult, [])));
        setAssignments(safeArray(extractFulfilled(assignmentsResult, [])));
        setDocuments(safeArray(extractFulfilled(documentsResult, [])));
        setUnreadNotifications(Number(extractFulfilled(unreadNotificationsResult, 0)) || 0);
        setConversations(safeArray(extractFulfilled(conversationsResult, [])));

        if (classesResult.status === 'rejected') {
          setError(getAuthErrorMessage(classesResult.reason));
        }

        const secondaryFailed = [
          assignmentsResult,
          documentsResult,
          unreadNotificationsResult,
          conversationsResult,
        ].some((result) => result.status === 'rejected');

        if (classesResult.status === 'fulfilled' && secondaryFailed) {
          setPartialWarning(
            'Algunos datos no se pudieron cargar, pero puedes seguir usando el panel.'
          );
        }
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

    loadDashboard();
  }, [logoutUser, navigate]);

  const upcomingClasses = useMemo(() => getUpcomingClasses(classes), [classes]);
  const nextClass = upcomingClasses[0];

  const pendingAssignments = useMemo(
    () => assignments.filter((item) => item.status === 'pending'),
    [assignments]
  );

  const overdueAssignments = useMemo(
    () => assignments.filter((item) => isAssignmentOverdue(item)),
    [assignments]
  );

  const reviewedAssignments = useMemo(
    () => assignments.filter((item) => item.status === 'reviewed'),
    [assignments]
  );

  const importantAssignments = useMemo(
    () => getStudentImportantAssignments(assignments),
    [assignments]
  );

  const recentDocuments = useMemo(
    () =>
      getLatestItems(
        documents.map((doc) => ({ ...doc, created_at: getDocumentDate(doc) })),
        'created_at',
        5
      ),
    [documents]
  );

  const recentFeedback = useMemo(() => getRecentFeedback(assignments, 3), [assignments]);

  const recentConversations = useMemo(
    () => getRecentConversations(conversations, 4),
    [conversations]
  );

  if (loading) return <Loading />;

  return (
    <div className="dashboard-page dashboard-page--student">
      <section className="dashboard-hero dashboard-hero--student card">
        <div className="dashboard-hero__content">
          <span className="eyebrow">Panel del alumno</span>
          <h1>Hola, {user?.name || 'Alumno'}</h1>
          <p>Consulta tus próximas clases, tareas pendientes y materiales.</p>
        </div>
        <div className="dashboard-hero__actions">
          <Link to="/student/calendar" className="btn btn-primary">
            Ver calendario
          </Link>
          <Link to="/student/assignments" className="btn btn-outline">
            Ver tareas
          </Link>
        </div>
      </section>

      <ErrorMessage message={error} />

      {partialWarning ? (
        <p className="dashboard-warning-inline" role="status">
          {partialWarning}
        </p>
      ) : null}

      <section className="student-next-class card" aria-label="Tu próxima clase">
        {nextClass ? (
          <>
            <span className="eyebrow">Tu próxima clase</span>
            <h2>{nextClass.title || '—'}</h2>
            <div className="student-next-class__meta">
              <span>Profesor: {getTeacherName(nextClass)}</span>
              <span>{formatDateTime(nextClass.start_time)}</span>
              {nextClass.end_time ? <span>Fin: {formatDateTime(nextClass.end_time)}</span> : null}
            </div>
            <span className="status-badge">{nextClass.status || 'scheduled'}</span>
            <div className="student-next-class__actions">
              {nextClass.id ? (
                <Link to={`/student/classroom/${nextClass.id}`} className="btn btn-primary">
                  Entrar a clase
                </Link>
              ) : null}
              <Link to="/student/classes" className="btn btn-outline">
                Ver mis clases
              </Link>
            </div>
          </>
        ) : (
          <InlineEmptyState
            title="No tienes clases próximas"
            message="Cuando tu profesor programe una clase, la verás aquí de inmediato."
            action={
              <Link to="/student/calendar" className="btn btn-outline btn-block">
                Ver calendario
              </Link>
            }
          />
        )}
      </section>

      <section className="dashboard-stats-grid" aria-label="Resumen">
        <StatCard icon="🎥" label="Próximas clases" value={upcomingClasses.length} />
        <StatCard
          icon="📝"
          label="Tareas pendientes"
          value={pendingAssignments.length}
          variant={pendingAssignments.length > 0 ? 'warning' : undefined}
        />
        <StatCard
          icon="✅"
          label="Tareas revisadas"
          value={reviewedAssignments.length}
          variant={reviewedAssignments.length > 0 ? 'success' : undefined}
        />
        <StatCard icon="📚" label="Materiales recientes" value={documents.length} />
        <StatCard
          icon="🔔"
          label="Notificaciones"
          value={unreadNotifications}
          hint={unreadNotifications > 0 ? 'Sin leer' : 'Al día'}
          variant={unreadNotifications > 0 ? 'info' : undefined}
        />
        {overdueAssignments.length > 0 ? (
          <StatCard
            icon="⚠️"
            label="Tareas atrasadas"
            value={overdueAssignments.length}
            hint="Requieren atención"
            variant="danger"
          />
        ) : null}
      </section>

      <div className="dashboard-main-grid">
        <div className="dashboard-column dashboard-column--primary">
          <DashboardSectionCard
            title="Tareas pendientes importantes"
            action={
              <Link to="/student/assignments" className="btn btn-sm btn-outline">
                Ver tareas
              </Link>
            }
          >
            {importantAssignments.length > 0 ? (
              <ul className="dashboard-list">
                {importantAssignments.map((assignment) => {
                  const overdue = isAssignmentOverdue(assignment);
                  const canSubmit = assignment.status === 'pending' || overdue;

                  return (
                    <li key={assignment.id} className="student-task-item">
                      <div className="student-task-item__main">
                        <p className="student-task-item__title">{assignment.title || '—'}</p>
                        <p className="student-task-item__meta">
                          Límite: {formatDate(assignment.due_date)}
                        </p>
                        <div className="student-task-item__badges">
                          <AssignmentStatusBadge assignment={assignment} />
                          {overdue ? <span className="badge badge-danger">Atrasada</span> : null}
                        </div>
                      </div>
                      <Link
                        to="/student/assignments"
                        className={`btn btn-sm ${canSubmit ? 'btn-primary' : 'btn-outline'}`}
                      >
                        {canSubmit ? 'Entregar' : 'Ver tarea'}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <InlineEmptyState message="No tienes tareas pendientes por ahora." />
            )}
          </DashboardSectionCard>

          <DashboardSectionCard
            title="Feedback reciente del profesor"
            action={
              <Link to="/student/assignments" className="btn btn-sm btn-outline">
                Ver tareas
              </Link>
            }
          >
            {recentFeedback.length > 0 ? (
              <ul className="dashboard-list dashboard-list--feedback">
                {recentFeedback.map((assignment) => (
                  <li key={assignment.id} className="dashboard-feedback-card">
                    <p className="dashboard-feedback-card__title">{assignment.title || '—'}</p>
                    <p className="dashboard-feedback-card__comment">
                      {truncateText(assignment.teacher_feedback)}
                    </p>
                    <span className="dashboard-feedback-card__date muted">
                      {formatDate(assignment.reviewed_at || assignment.updated_at)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <InlineEmptyState message="Cuando tu profesor revise tareas, verás aquí sus comentarios." />
            )}
          </DashboardSectionCard>
        </div>

        <div className="dashboard-column dashboard-column--secondary">
          <DashboardSectionCard
            title="Materiales recientes"
            action={
              <Link to="/student/documents" className="btn btn-sm btn-outline">
                Ver documentos
              </Link>
            }
          >
            {recentDocuments.length > 0 ? (
              <ul className="dashboard-list">
                {recentDocuments.map((doc) => (
                  <li key={doc.id} className="dashboard-list-item">
                    <div className="dashboard-list-item__main">
                      <p className="dashboard-list-item__title">{doc.title || '—'}</p>
                      <p className="dashboard-list-item__meta">
                        {getTeacherName(doc)} · {getClassName(doc)} ·{' '}
                        {formatDate(getDocumentDate(doc))}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <InlineEmptyState message="Todavía no tienes materiales compartidos." />
            )}
          </DashboardSectionCard>

          <DashboardSectionCard
            title="Últimos mensajes"
            action={
              unreadNotifications > 0 ? (
                <span className="badge badge-danger">{unreadNotifications}</span>
              ) : null
            }
          >
            {recentConversations.length > 0 ? (
              <ul className="dashboard-list">
                {recentConversations.map((conversation) => {
                  const unread = Number(conversation.unread_count || 0);
                  return (
                    <li key={conversation.conversation_id || conversation.id} className="dashboard-list-item">
                      <div className="dashboard-list-item__main">
                        <p className="dashboard-list-item__title">{getTeacherName(conversation)}</p>
                        <p className="dashboard-list-item__meta">
                          {getConversationPreview(conversation)}
                        </p>
                      </div>
                      {unread > 0 ? (
                        <span className="messages-unread-badge">{unread}</span>
                      ) : (
                        <span className="muted dashboard-list-item__time">
                          {formatDateTime(getConversationDate(conversation))}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : unreadNotifications > 0 ? (
              <div className="dashboard-notifications-summary">
                <p>
                  Tienes <strong>{unreadNotifications}</strong> notificación
                  {unreadNotifications === 1 ? '' : 'es'} sin leer.
                </p>
                <Link to="/student/messages" className="btn btn-sm btn-outline btn-block">
                  Ir a mensajes
                </Link>
              </div>
            ) : (
              <InlineEmptyState
                message="No hay mensajes recientes."
                action={
                  <Link to="/student/messages" className="btn btn-sm btn-outline">
                    Abrir mensajes
                  </Link>
                }
              />
            )}
          </DashboardSectionCard>

          <DashboardSectionCard title="Accesos rápidos">
            <QuickActions>
              <QuickActionButton to="/student/classes" label="Mis clases" icon="🎥" />
              <QuickActionButton to="/student/calendar" label="Calendario" icon="📅" />
              <QuickActionButton to="/student/assignments" label="Tareas" icon="📝" />
              <QuickActionButton to="/student/documents" label="Materiales" icon="📚" />
              <QuickActionButton to="/student/messages" label="Mensajes" icon="💬" />
            </QuickActions>
          </DashboardSectionCard>
        </div>
      </div>
    </div>
  );
}
