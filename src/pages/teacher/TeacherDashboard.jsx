import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStudents } from '../../services/studentService';
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
  getConversationDate,
  getConversationPreview,
  getDocumentDate,
  getLatestItems,
  getRecentConversations,
  getStudentName,
  getTeacherAttentionAssignments,
  getUpcomingClasses,
  hasAuthError,
  isClassThisWeek,
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

export default function TeacherDashboard() {
  const [students, setStudents] = useState([]);
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
          getStudents(),
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
          studentsResult,
          classesResult,
          assignmentsResult,
          documentsResult,
          unreadNotificationsResult,
          conversationsResult,
        ] = results;

        const studentsData = safeArray(extractFulfilled(studentsResult, []));
        const classesData = safeArray(extractFulfilled(classesResult, []));
        const assignmentsData = safeArray(extractFulfilled(assignmentsResult, []));
        const documentsData = safeArray(extractFulfilled(documentsResult, []));
        const unreadCount = extractFulfilled(unreadNotificationsResult, 0);
        const conversationsData = safeArray(extractFulfilled(conversationsResult, []));

        setStudents(studentsData);
        setClasses(classesData);
        setAssignments(assignmentsData);
        setDocuments(documentsData);
        setUnreadNotifications(Number(unreadCount) || 0);
        setConversations(conversationsData);

        const criticalFailed =
          studentsResult.status === 'rejected' || classesResult.status === 'rejected';

        if (criticalFailed) {
          const failedResult =
            studentsResult.status === 'rejected' ? studentsResult : classesResult;
          setError(getAuthErrorMessage(failedResult.reason));
        }

        const secondaryFailed = [
          assignmentsResult,
          documentsResult,
          unreadNotificationsResult,
          conversationsResult,
        ].some((result) => result.status === 'rejected');

        if (!criticalFailed && secondaryFailed) {
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

  const activeStudents = useMemo(
    () => students.filter((student) => student.is_active !== false).length,
    [students]
  );

  const upcomingClasses = useMemo(() => getUpcomingClasses(classes), [classes]);
  const nextClass = upcomingClasses[0];
  const classesThisWeek = useMemo(() => classes.filter(isClassThisWeek), [classes]);

  const submittedAssignments = useMemo(
    () => assignments.filter((item) => item.status === 'submitted'),
    [assignments]
  );

  const overdueAssignments = useMemo(
    () => assignments.filter((item) => isAssignmentOverdue(item)),
    [assignments]
  );

  const attentionAssignments = useMemo(
    () => getTeacherAttentionAssignments(assignments),
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

  const recentConversations = useMemo(
    () => getRecentConversations(conversations, 5),
    [conversations]
  );

  const hasRecentActivity =
    recentDocuments.length > 0 || recentConversations.length > 0;

  if (loading) return <Loading />;

  return (
    <div className="dashboard-pro">
      <div className="dashboard-hero card">
        <div className="dashboard-hero__content">
          <span className="eyebrow">Panel de profesor</span>
          <h1>Hola, {user?.name}</h1>
          <p>
            Gestiona tus alumnos, clases, tareas y comunicación desde un único lugar.
          </p>
        </div>
        <div className="dashboard-hero__actions">
          <Link to="/teacher/classes/new" className="btn btn-primary">
            Crear clase
          </Link>
          <Link to="/teacher/assignments" className="btn btn-outline">
            Crear tarea
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
        <DashboardStatCard
          label="Alumnos activos"
          value={activeStudents}
          hint={`de ${students.length} alumnos`}
        />
        <DashboardStatCard
          label="Próximas clases"
          value={upcomingClasses.length}
        />
        <DashboardStatCard
          label="Clases esta semana"
          value={classesThisWeek.length}
        />
        <DashboardStatCard
          label="Tareas por revisar"
          value={submittedAssignments.length}
          hint="Entregas pendientes"
          variant={submittedAssignments.length > 0 ? 'warning' : undefined}
        />
        <DashboardStatCard
          label="Tareas atrasadas"
          value={overdueAssignments.length}
          hint="Requieren seguimiento"
          variant={overdueAssignments.length > 0 ? 'danger' : undefined}
        />
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
                <p>{getStudentName(nextClass)}</p>
                <p>Inicio: {formatDateTime(nextClass.start_time)}</p>
                {nextClass.end_time && <p>Fin: {formatDateTime(nextClass.end_time)}</p>}
                <p>
                  Estado:{' '}
                  <span className="status-badge">{nextClass.status || 'scheduled'}</span>
                </p>
                <div className="next-class__actions">
                  {nextClass.id && (
                    <Link
                      to={`/teacher/classroom/${nextClass.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Entrar a BridgeCall
                    </Link>
                  )}
                  <Link to="/teacher/calendar" className="btn btn-outline btn-sm">
                    Ver calendario
                  </Link>
                </div>
              </div>
            ) : (
              <InlineEmptyState
                message="No tienes clases próximas."
                action={
                  <Link to="/teacher/classes/new" className="btn btn-primary btn-sm">
                    Crear clase
                  </Link>
                }
              />
            )}
          </DashboardSection>

          <DashboardSection
            title="Tareas que requieren atención"
            action={
              <Link to="/teacher/assignments" className="btn btn-sm btn-outline">
                Ver tareas
              </Link>
            }
          >
            {attentionAssignments.length > 0 ? (
              <ul className="dashboard-list">
                {attentionAssignments.map((assignment) => {
                  const submissionFile =
                    assignment.submission_original_filename ||
                    assignment.submissionOriginalFilename;
                  const submissionText = assignment.submission_text || assignment.submissionText;

                  return (
                    <DashboardListItem
                      key={assignment.id}
                      title={assignment.title}
                      meta={`${getStudentName(assignment)} · Límite: ${formatDate(assignment.due_date)}`}
                      badge={<AssignmentStatusBadge assignment={assignment} />}
                      action={
                        <div className="dashboard-list-item__tags">
                          {submissionFile && <span className="muted">Archivo entregado</span>}
                          {submissionText && <span className="muted">Texto entregado</span>}
                        </div>
                      }
                    />
                  );
                })}
              </ul>
            ) : (
              <InlineEmptyState message="No hay tareas pendientes de atención." />
            )}
          </DashboardSection>
        </div>

        <div className="dashboard-column">
          <DashboardSection title="Accesos rápidos">
            <div className="dashboard-quick-grid">
              <DashboardQuickLink to="/teacher/students/new" label="Crear alumno" />
              <DashboardQuickLink to="/teacher/classes/new" label="Crear clase" />
              <DashboardQuickLink to="/teacher/assignments" label="Crear tarea" />
              <DashboardQuickLink to="/teacher/documents" label="Subir documento" />
              <DashboardQuickLink to="/teacher/calendar" label="Abrir calendario" />
              <DashboardQuickLink to="/teacher/messages" label="Mensajes" />
            </div>
          </DashboardSection>

          <DashboardSection title="Actividad reciente">
            {hasRecentActivity ? (
              <>
                {recentDocuments.length > 0 && (
                  <div className="dashboard-activity-block">
                    <div className="dashboard-activity-block__header">
                      <h3>Documentos recientes</h3>
                      <Link to="/teacher/documents" className="btn btn-sm btn-outline">
                        Documentos
                      </Link>
                    </div>
                    <ul className="dashboard-list">
                      {recentDocuments.map((doc) => (
                        <DashboardListItem
                          key={doc.id}
                          title={doc.title}
                          meta={`${getStudentName(doc)} · ${getClassName(doc)} · ${formatDate(getDocumentDate(doc))}`}
                        />
                      ))}
                    </ul>
                  </div>
                )}

                {recentConversations.length > 0 && (
                  <div className="dashboard-activity-block">
                    <div className="dashboard-activity-block__header">
                      <h3>Conversaciones recientes</h3>
                      <Link to="/teacher/messages" className="btn btn-sm btn-outline">
                        Mensajes
                      </Link>
                    </div>
                    <ul className="dashboard-list">
                      {recentConversations.map((conversation) => {
                        const unread = Number(conversation.unread_count || 0);
                        return (
                          <DashboardListItem
                            key={conversation.conversation_id || conversation.id}
                            title={getStudentName(conversation)}
                            meta={getConversationPreview(conversation)}
                            badge={
                              unread > 0 ? (
                                <span className="messages-unread-badge">{unread}</span>
                              ) : null
                            }
                            action={
                              <span className="muted">
                                {formatDateTime(getConversationDate(conversation))}
                              </span>
                            }
                          />
                        );
                      })}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <InlineEmptyState message="Todavía no hay actividad reciente para mostrar." />
            )}
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}
