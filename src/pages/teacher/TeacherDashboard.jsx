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

function isToday(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !Number.isNaN(date.getTime()) && date.toDateString() === new Date().toDateString();
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

        setStudents(safeArray(extractFulfilled(studentsResult, [])));
        setClasses(safeArray(extractFulfilled(classesResult, [])));
        setAssignments(safeArray(extractFulfilled(assignmentsResult, [])));
        setDocuments(safeArray(extractFulfilled(documentsResult, [])));
        setUnreadNotifications(Number(extractFulfilled(unreadNotificationsResult, 0)) || 0);
        setConversations(safeArray(extractFulfilled(conversationsResult, [])));

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

  const recentConversations = useMemo(
    () => getRecentConversations(conversations, 4),
    [conversations]
  );

  const todaySummary = useMemo(() => {
    const classesToday = classes.filter(
      (item) => isToday(item.start_time) && item.status === 'scheduled'
    );
    const dueToday = assignments.filter((item) => isToday(item.due_date));
    const unreadMessages = conversations.reduce(
      (sum, item) => sum + Number(item.unread_count || 0),
      0
    );

    return { classesToday, dueToday, unreadMessages };
  }, [classes, assignments, conversations]);

  if (loading) return <Loading />;

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero dashboard-hero--teacher card">
        <div className="dashboard-hero__content">
          <span className="eyebrow">Panel del profesor</span>
          <h1>Hola, {user?.name || 'Profesor'}</h1>
          <p>
            Organiza tus clases, alumnos, tareas y materiales desde un único lugar.
          </p>
        </div>
        <div className="dashboard-hero__actions">
          <Link to="/teacher/classes/new" className="btn btn-primary">
            Crear clase
          </Link>
          <Link to="/teacher/assignments" className="btn btn-outline">
            Crear tarea
          </Link>
          <Link to="/teacher/students/new" className="btn btn-ghost">
            Nuevo alumno
          </Link>
        </div>
      </section>

      <ErrorMessage message={error} />

      {partialWarning ? (
        <p className="dashboard-warning-inline" role="status">
          {partialWarning}
        </p>
      ) : null}

      <section className="dashboard-stats-grid" aria-label="Resumen">
        <StatCard
          icon="👥"
          label="Alumnos activos"
          value={activeStudents}
          hint={`de ${students.length} alumnos`}
        />
        <StatCard icon="🎥" label="Próximas clases" value={upcomingClasses.length} hint="Programadas" />
        <StatCard
          icon="📅"
          label="Clases esta semana"
          value={classesThisWeek.length}
          hint="Próximos 7 días"
        />
        <StatCard
          icon="📝"
          label="Tareas por revisar"
          value={submittedAssignments.length}
          hint="Entregas pendientes"
          variant={submittedAssignments.length > 0 ? 'warning' : undefined}
        />
        <StatCard
          icon="⚠️"
          label="Tareas atrasadas"
          value={overdueAssignments.length}
          hint="Requieren seguimiento"
          variant={overdueAssignments.length > 0 ? 'danger' : undefined}
        />
        <StatCard
          icon="🔔"
          label="Notificaciones"
          value={unreadNotifications}
          hint={unreadNotifications > 0 ? 'Sin leer' : 'Al día'}
          variant={unreadNotifications > 0 ? 'info' : undefined}
        />
      </section>

      <div className="dashboard-main-grid">
        <div className="dashboard-column dashboard-column--primary">
          <DashboardSectionCard title="Próxima clase">
            {nextClass ? (
              <article className="next-class-card">
                <div className="next-class-card__main">
                  <h3>{nextClass.title || '—'}</h3>
                  <p className="next-class-card__meta">
                    <span>Alumno: {getStudentName(nextClass)}</span>
                    <span>Inicio: {formatDateTime(nextClass.start_time)}</span>
                    {nextClass.end_time ? (
                      <span>Fin: {formatDateTime(nextClass.end_time)}</span>
                    ) : null}
                  </p>
                  <span className="status-badge">{nextClass.status || 'scheduled'}</span>
                </div>
                <div className="next-class-card__actions">
                  {nextClass.id ? (
                    <Link
                      to={`/teacher/classroom/${nextClass.id}`}
                      className="btn btn-primary"
                    >
                      Entrar a BridgeCall
                    </Link>
                  ) : null}
                  <Link to="/teacher/calendar" className="btn btn-outline">
                    Ver calendario
                  </Link>
                </div>
              </article>
            ) : (
              <InlineEmptyState
                title="Sin clases próximas"
                message="Cuando programes una clase aparecerá aquí."
                action={
                  <Link to="/teacher/classes/new" className="btn btn-primary btn-block">
                    Crear clase
                  </Link>
                }
              />
            )}
          </DashboardSectionCard>

          <DashboardSectionCard
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
                  const submissionText =
                    assignment.submission_text || assignment.submissionText;

                  return (
                    <li key={assignment.id} className="assignment-attention-item">
                      <div className="assignment-attention-item__main">
                        <p className="assignment-attention-item__title">{assignment.title || '—'}</p>
                        <p className="assignment-attention-item__meta">
                          {getStudentName(assignment)} · Límite: {formatDate(assignment.due_date)}
                        </p>
                        <div className="assignment-attention-item__tags">
                          <AssignmentStatusBadge assignment={assignment} />
                          {submissionFile ? (
                            <span className="badge badge-muted">Archivo entregado</span>
                          ) : null}
                          {submissionText ? (
                            <span className="badge badge-muted">Texto entregado</span>
                          ) : null}
                        </div>
                      </div>
                      <Link
                        to="/teacher/assignments"
                        className="btn btn-sm btn-primary assignment-attention-item__action"
                      >
                        Revisar
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <InlineEmptyState
                title="Todo al día"
                message="No tienes tareas pendientes de revisar."
              />
            )}
          </DashboardSectionCard>
        </div>

        <div className="dashboard-column dashboard-column--secondary">
          <DashboardSectionCard title="Acciones rápidas">
            <QuickActions>
              <QuickActionButton to="/teacher/students/new" label="Crear alumno" icon="👥" />
              <QuickActionButton to="/teacher/classes/new" label="Crear clase" icon="🎥" />
              <QuickActionButton to="/teacher/assignments" label="Crear tarea" icon="📝" />
              <QuickActionButton to="/teacher/documents" label="Subir material" icon="📚" />
              <QuickActionButton to="/teacher/messages" label="Ver mensajes" icon="💬" />
            </QuickActions>
          </DashboardSectionCard>

          <DashboardSectionCard
            title="Últimas notificaciones"
            action={
              unreadNotifications > 0 ? (
                <span className="badge badge-danger">{unreadNotifications} sin leer</span>
              ) : null
            }
          >
            {unreadNotifications > 0 ? (
              <div className="dashboard-notifications-summary">
                <p>
                  Tienes <strong>{unreadNotifications}</strong> notificación
                  {unreadNotifications === 1 ? '' : 'es'} sin leer.
                </p>
                <p className="muted">Consulta la campana del menú superior para ver el detalle.</p>
              </div>
            ) : (
              <InlineEmptyState message="No tienes notificaciones pendientes." />
            )}
          </DashboardSectionCard>

          <DashboardSectionCard title="Resumen de hoy">
            <ul className="dashboard-today-list">
              <li>
                <span className="dashboard-today-list__label">Clases hoy</span>
                <strong>{todaySummary.classesToday.length}</strong>
              </li>
              <li>
                <span className="dashboard-today-list__label">Tareas con límite hoy</span>
                <strong>{todaySummary.dueToday.length}</strong>
              </li>
              <li>
                <span className="dashboard-today-list__label">Entregas por revisar</span>
                <strong>{submittedAssignments.length}</strong>
              </li>
              <li>
                <span className="dashboard-today-list__label">Mensajes sin leer</span>
                <strong>{todaySummary.unreadMessages}</strong>
              </li>
            </ul>
          </DashboardSectionCard>

          {recentConversations.length > 0 ? (
            <DashboardSectionCard
              title="Mensajes recientes"
              action={
                <Link to="/teacher/messages" className="btn btn-sm btn-outline">
                  Ver todos
                </Link>
              }
            >
              <ul className="dashboard-list">
                {recentConversations.map((conversation) => {
                  const unread = Number(conversation.unread_count || 0);
                  return (
                    <li key={conversation.conversation_id || conversation.id} className="dashboard-list-item">
                      <div className="dashboard-list-item__main">
                        <p className="dashboard-list-item__title">{getStudentName(conversation)}</p>
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
            </DashboardSectionCard>
          ) : null}
        </div>
      </div>
    </div>
  );
}
