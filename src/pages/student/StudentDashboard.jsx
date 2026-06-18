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
  DashboardQuickLink,
  DashboardSection,
  DashboardStatCard,
  DashboardListItem,
  InlineEmptyState,
} from '../../utils/dashboardComponents';
import {
  extractFulfilled,
  formatDate,
  formatDateTime,
  getClassName,
  getDocumentDate,
  getLatestItems,
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

        const classesData = safeArray(extractFulfilled(classesResult, []));
        const assignmentsData = safeArray(extractFulfilled(assignmentsResult, []));
        const documentsData = safeArray(extractFulfilled(documentsResult, []));
        const unreadCount = extractFulfilled(unreadNotificationsResult, 0);

        setClasses(classesData);
        setAssignments(assignmentsData);
        setDocuments(documentsData);
        setUnreadNotifications(Number(unreadCount) || 0);

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

  if (loading) return <Loading />;

  return (
    <div className="dashboard-pro">
      <div className="dashboard-hero card">
        <div className="dashboard-hero__content">
          <span className="eyebrow">Panel de alumno</span>
          <h1>Hola, {user?.name}</h1>
          <p>
            Consulta tus clases, tareas, materiales y mensajes desde un único lugar.
          </p>
        </div>
        <div className="dashboard-hero__actions">
          <Link to="/student/calendar" className="btn btn-primary">
            Ver calendario
          </Link>
          <Link to="/student/assignments" className="btn btn-outline">
            Ver tareas
          </Link>
        </div>
      </div>

      <ErrorMessage message={error} />

      {partialWarning && (
        <p className="dashboard-warning-inline" role="status">
          {partialWarning}
        </p>
      )}

      <section className="dashboard-stats-grid">
        <DashboardStatCard label="Próximas clases" value={upcomingClasses.length} />
        <DashboardStatCard label="Tareas pendientes" value={pendingAssignments.length} />
        <DashboardStatCard
          label="Tareas atrasadas"
          value={overdueAssignments.length}
          hint="Requieren atención"
          variant={overdueAssignments.length > 0 ? 'danger' : undefined}
        />
        <DashboardStatCard
          label="Tareas revisadas"
          value={reviewedAssignments.length}
          variant={reviewedAssignments.length > 0 ? 'success' : undefined}
        />
        <DashboardStatCard label="Materiales" value={documents.length} />
        <DashboardStatCard
          label="Notificaciones"
          value={unreadNotifications}
          hint={unreadNotifications > 0 ? 'Sin leer' : 'Al día'}
        />
      </section>

      <div className="dashboard-main-grid">
        <div className="dashboard-column">
          <DashboardSection title="Próxima clase">
            {nextClass ? (
              <div className="next-class">
                <h3>{nextClass.title}</h3>
                <p>{getTeacherName(nextClass)}</p>
                <p>{formatDateTime(nextClass.start_time)}</p>
                <p>
                  Estado:{' '}
                  <span className="status-badge">{nextClass.status || 'scheduled'}</span>
                </p>
                <div className="next-class__actions">
                  {nextClass.id && (
                    <Link
                      to={`/student/classroom/${nextClass.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Entrar a BridgeCall
                    </Link>
                  )}
                  <Link to="/student/calendar" className="btn btn-outline btn-sm">
                    Ver calendario
                  </Link>
                </div>
              </div>
            ) : (
              <InlineEmptyState
                message="No tienes clases próximas."
                action={
                  <Link to="/student/calendar" className="btn btn-outline btn-sm">
                    Ver calendario
                  </Link>
                }
              />
            )}
          </DashboardSection>

          <DashboardSection
            title="Tus próximas tareas"
            action={
              <Link to="/student/assignments" className="btn btn-sm btn-outline">
                Ver tareas
              </Link>
            }
          >
            {importantAssignments.length > 0 ? (
              <ul className="dashboard-list">
                {importantAssignments.map((assignment) => {
                  const hasMaterial =
                    assignment.attachment_original_filename ||
                    assignment.attachmentOriginalFilename;
                  const hasFeedback = Boolean(assignment.teacher_feedback);

                  return (
                    <DashboardListItem
                      key={assignment.id}
                      title={assignment.title}
                      meta={`Límite: ${formatDate(assignment.due_date)}`}
                      badge={<AssignmentStatusBadge assignment={assignment} />}
                      action={
                        <div className="dashboard-list-item__tags">
                          {hasMaterial && <span className="muted">Tiene material</span>}
                          {hasFeedback && <span className="muted">Feedback disponible</span>}
                        </div>
                      }
                    />
                  );
                })}
              </ul>
            ) : (
              <InlineEmptyState message="No tienes tareas pendientes por ahora." />
            )}
          </DashboardSection>
        </div>

        <div className="dashboard-column">
          <DashboardSection
            title="Últimos materiales"
            action={
              <Link to="/student/documents" className="btn btn-sm btn-outline">
                Ver documentos
              </Link>
            }
          >
            {recentDocuments.length > 0 ? (
              <ul className="dashboard-list">
                {recentDocuments.map((doc) => (
                  <DashboardListItem
                    key={doc.id}
                    title={doc.title}
                    meta={`${getTeacherName(doc)} · ${getClassName(doc)} · ${formatDate(getDocumentDate(doc))}`}
                  />
                ))}
              </ul>
            ) : (
              <InlineEmptyState message="Todavía no tienes materiales compartidos." />
            )}
          </DashboardSection>

          <DashboardSection
            title="Feedback reciente"
            action={
              <Link to="/student/assignments" className="btn btn-sm btn-outline">
                Ver tareas
              </Link>
            }
          >
            {recentFeedback.length > 0 ? (
              <ul className="dashboard-list">
                {recentFeedback.map((assignment) => (
                  <DashboardListItem
                    key={assignment.id}
                    title={assignment.title}
                    meta={truncateText(assignment.teacher_feedback)}
                    action={
                      <span className="muted">
                        {formatDate(assignment.reviewed_at || assignment.updated_at)}
                      </span>
                    }
                  />
                ))}
              </ul>
            ) : (
              <InlineEmptyState message="Cuando tu profesor revise tareas, verás aquí sus comentarios." />
            )}
          </DashboardSection>

          <DashboardSection title="Accesos rápidos">
            <div className="dashboard-quick-grid">
              <DashboardQuickLink to="/student/classes" label="Mis clases" />
              <DashboardQuickLink to="/student/calendar" label="Calendario" />
              <DashboardQuickLink to="/student/assignments" label="Tareas" />
              <DashboardQuickLink to="/student/documents" label="Documentos" />
              <DashboardQuickLink to="/student/messages" label="Mensajes" />
            </div>
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}
