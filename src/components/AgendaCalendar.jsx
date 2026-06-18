import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyClasses } from '../services/classService';
import { getAssignments } from '../services/assignmentService';
import { getAuthErrorMessage } from '../services/authService';
import { useAuth } from '../auth/AuthContext';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'class', label: 'Clases' },
  { id: 'assignment', label: 'Tareas' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'submitted', label: 'Entregadas' },
  { id: 'reviewed', label: 'Revisadas' },
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Esta semana' },
];

const ASSIGNMENT_STATUS_LABELS = {
  pending: 'Pendiente',
  submitted: 'Entregada',
  reviewed: 'Revisada',
  cancelled: 'Cancelada',
};

const CLASS_STATUS_LABELS = {
  scheduled: 'Programada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function isToday(date) {
  if (!date) return false;
  return startOfDay(date).getTime() === startOfDay(new Date()).getTime();
}

function isTomorrow(date) {
  if (!date) return false;
  const tomorrow = startOfDay(new Date());
  tomorrow.setDate(tomorrow.getDate() + 1);
  return startOfDay(date).getTime() === tomorrow.getTime();
}

function isThisWeek(date) {
  if (!date) return false;
  const value = new Date(date);
  const now = startOfDay(new Date());
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return value >= now && value < weekEnd;
}

function formatDayLabel(date) {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
  });
}

function formatDayHeading(date) {
  if (isToday(date)) return `Hoy, ${formatDayLabel(date)}`;
  if (isTomorrow(date)) return `Mañana, ${formatDayLabel(date)}`;
  return formatDayLabel(date);
}

function formatTime(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateTime(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getAssignmentStatusLabel(status) {
  return ASSIGNMENT_STATUS_LABELS[status] || status || '—';
}

function getClassStatusLabel(status) {
  return CLASS_STATUS_LABELS[status] || status || '—';
}

function toClassEvent(classItem) {
  return {
    id: classItem.id,
    type: 'class',
    title: classItem.title || 'Clase',
    description: classItem.description,
    start: classItem.start_time,
    end: classItem.end_time,
    status: classItem.status,
    student_name: classItem.student_name,
    teacher_name: classItem.teacher_name,
    raw: classItem,
  };
}

function toAssignmentEvent(assignment) {
  return {
    id: assignment.id,
    type: 'assignment',
    title: assignment.title,
    description: assignment.description,
    start: assignment.due_date,
    end: null,
    status: assignment.status,
    student_name: assignment.student_name,
    teacher_name: assignment.teacher_name,
    raw: assignment,
  };
}

function sortEventsByDate(events) {
  return [...events].sort(
    (a, b) => new Date(a.start || 0).getTime() - new Date(b.start || 0).getTime()
  );
}

function groupEventsByDay(events) {
  const groups = new Map();

  events.forEach((event) => {
    if (!event.start) return;
    const key = startOfDay(event.start).toISOString();
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(event);
  });

  return Array.from(groups.entries())
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([key, dayEvents]) => ({
      date: new Date(key),
      events: sortEventsByDate(dayEvents),
    }));
}

function matchesFilter(event, filter) {
  switch (filter) {
    case 'all':
      return true;
    case 'class':
      return event.type === 'class';
    case 'assignment':
      return event.type === 'assignment';
    case 'pending':
      return event.type === 'assignment' && event.status === 'pending';
    case 'submitted':
      return event.type === 'assignment' && event.status === 'submitted';
    case 'reviewed':
      return event.type === 'assignment' && event.status === 'reviewed';
    case 'today':
      return event.start && isToday(event.start);
    case 'week':
      return event.start && isThisWeek(event.start);
    default:
      return true;
  }
}

function matchesUndatedFilter(filter) {
  return ['all', 'assignment', 'pending', 'submitted', 'reviewed'].includes(filter);
}

function hasAttachment(assignment) {
  return !!(
    assignment?.attachment_original_filename || assignment?.attachmentOriginalFilename
  );
}

function hasSubmission(assignment) {
  return !!(
    assignment?.submission_text ||
    assignment?.submission_original_filename ||
    assignment?.submissionOriginalFilename
  );
}

function getEventTimeLabel(event) {
  if (event.type === 'class') {
    if (event.start && event.end) {
      return `${formatTime(event.start)} - ${formatTime(event.end)}`;
    }
    return formatTime(event.start);
  }

  if (event.start) {
    return `Entrega: ${formatTime(event.start)}`;
  }

  return 'Sin hora';
}

function getContactLabel(event, mode) {
  if (mode === 'teacher') {
    return event.student_name || '—';
  }
  return event.teacher_name || '—';
}

function getContactPrefix(mode) {
  return mode === 'teacher' ? 'Alumno' : 'Profesor';
}

function getClassesRoute(mode) {
  return mode === 'teacher' ? '/teacher/classes' : '/student/classes';
}

function getAssignmentsRoute(mode) {
  return mode === 'teacher' ? '/teacher/assignments' : '/student/assignments';
}

function getClassroomRoute(mode, classId) {
  if (!classId) return null;
  return mode === 'teacher' ? `/teacher/classroom/${classId}` : `/student/classroom/${classId}`;
}

function AgendaEventCard({ event, mode }) {
  const navigate = useNavigate();
  const contactLabel = getContactLabel(event, mode);
  const contactPrefix = getContactPrefix(mode);

  if (event.type === 'class') {
    const classroomRoute = getClassroomRoute(mode, event.id);
    const isCancelled = event.status === 'cancelled';

    return (
      <article className="agenda-event-card agenda-event-card--class">
        <div className="agenda-event-main">
          <div className="agenda-event-meta">
            <span className="agenda-event-badge agenda-event-badge--class">Clase</span>
            <span className="agenda-event-time">{getEventTimeLabel(event)}</span>
          </div>
          <h3>{event.title}</h3>
          <p className="agenda-event-meta">
            {contactPrefix}: {contactLabel}
          </p>
          <p className="agenda-event-meta">
            Estado:{' '}
            <span className={`agenda-status agenda-status--${event.status || 'scheduled'}`}>
              {getClassStatusLabel(event.status)}
            </span>
          </p>
          {event.description && <p className="agenda-event-desc">{event.description}</p>}
        </div>
        <div className="agenda-event-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => navigate(getClassesRoute(mode))}
          >
            Ver clase
          </button>
          {classroomRoute && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={isCancelled}
              onClick={() => !isCancelled && navigate(classroomRoute)}
            >
              Entrar a BridgeCall
            </button>
          )}
        </div>
      </article>
    );
  }

  const assignment = event.raw;

  return (
    <article className="agenda-event-card agenda-event-card--assignment">
      <div className="agenda-event-main">
        <div className="agenda-event-meta">
          <span className="agenda-event-badge agenda-event-badge--assignment">Tarea</span>
          <span className="agenda-event-time">{getEventTimeLabel(event)}</span>
        </div>
        <h3>{event.title}</h3>
        <p className="agenda-event-meta">
          {contactPrefix}: {contactLabel}
        </p>
        <p className="agenda-event-meta">
          Fecha límite: {event.start ? formatDateTime(event.start) : 'Sin fecha límite'}
        </p>
        <p className="agenda-event-meta">
          Estado:{' '}
          <span className={`agenda-status agenda-status--${event.status || 'pending'}`}>
            {getAssignmentStatusLabel(event.status)}
          </span>
        </p>
        {event.description && <p className="agenda-event-desc">{event.description}</p>}
        {hasAttachment(assignment) && (
          <p className="agenda-event-meta">Tiene material adjunto</p>
        )}
        {hasSubmission(assignment) && (
          <p className="agenda-event-meta">Entregada con archivo/texto</p>
        )}
      </div>
      <div className="agenda-event-actions">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => navigate(getAssignmentsRoute(mode))}
        >
          Ver tarea
        </button>
      </div>
    </article>
  );
}

export default function AgendaCalendar({ mode = 'teacher' }) {
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadAgenda() {
      try {
        setLoading(true);
        setError('');
        const [classesData, assignmentsData] = await Promise.all([
          getMyClasses(),
          getAssignments(),
        ]);
        setClasses(Array.isArray(classesData) ? classesData : []);
        setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
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

    loadAgenda();
  }, [logoutUser, navigate]);

  const summary = useMemo(() => {
    const now = new Date();
    return {
      upcomingClasses: classes.filter(
        (item) =>
          item.start_time &&
          new Date(item.start_time) >= now &&
          item.status === 'scheduled'
      ).length,
      pendingAssignments: assignments.filter((item) => item.status === 'pending').length,
      submittedAssignments: assignments.filter((item) => item.status === 'submitted').length,
      reviewedAssignments: assignments.filter((item) => item.status === 'reviewed').length,
    };
  }, [classes, assignments]);

  const datedEvents = useMemo(() => {
    const classEvents = classes.map(toClassEvent).filter((event) => event.start);
    const assignmentEvents = assignments
      .filter((item) => item.due_date)
      .map(toAssignmentEvent);
    return sortEventsByDate([...classEvents, ...assignmentEvents]);
  }, [classes, assignments]);

  const undatedAssignments = useMemo(
    () =>
      assignments
        .filter((item) => !item.due_date)
        .map(toAssignmentEvent)
        .filter((event) => matchesFilter(event, activeFilter)),
    [assignments, activeFilter]
  );

  const filteredEvents = useMemo(
    () => datedEvents.filter((event) => matchesFilter(event, activeFilter)),
    [datedEvents, activeFilter]
  );

  const groupedDays = useMemo(
    () => groupEventsByDay(filteredEvents),
    [filteredEvents]
  );

  const hasVisibleEvents = groupedDays.length > 0 || undatedAssignments.length > 0;

  if (loading) return <Loading />;

  return (
    <div className="agenda-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Agenda</span>
          <h1>Calendario</h1>
          <p>
            {mode === 'teacher'
              ? 'Gestiona tus clases y tareas desde una vista unificada.'
              : 'Tu agenda de clases y tareas pendientes.'}
          </p>
        </div>
        {mode === 'teacher' && (
          <Link to="/teacher/classes/new" className="btn btn-primary">
            Crear clase
          </Link>
        )}
      </div>

      <ErrorMessage message={error} />

      <section className="agenda-summary-grid">
        <article className="agenda-summary-card card">
          <span>Próximas clases</span>
          <strong>{summary.upcomingClasses}</strong>
        </article>
        <article className="agenda-summary-card card">
          <span>Tareas pendientes</span>
          <strong>{summary.pendingAssignments}</strong>
        </article>
        <article className="agenda-summary-card card">
          <span>Tareas entregadas</span>
          <strong>{summary.submittedAssignments}</strong>
        </article>
        <article className="agenda-summary-card card">
          <span>Tareas revisadas</span>
          <strong>{summary.reviewedAssignments}</strong>
        </article>
      </section>

      <div className="agenda-filters">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`agenda-filter-button ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {!hasVisibleEvents ? (
        <EmptyState
          title="Sin eventos"
          message="No hay clases o tareas que coincidan con el filtro seleccionado."
        />
      ) : (
        <div className="agenda-timeline">
          {groupedDays.map((group) => (
            <section key={group.date.toISOString()} className="agenda-day-group">
              <h2 className="agenda-day-heading">{formatDayHeading(group.date)}</h2>
              <div className="agenda-day-events">
                {group.events.map((event) => (
                  <AgendaEventCard
                    key={`${event.type}-${event.id}`}
                    event={event}
                    mode={mode}
                  />
                ))}
              </div>
            </section>
          ))}

          {matchesUndatedFilter(activeFilter) && undatedAssignments.length > 0 && (
            <section className="agenda-day-group">
              <h2 className="agenda-day-heading">Sin fecha límite</h2>
              <div className="agenda-day-events">
                {undatedAssignments.map((event) => (
                  <AgendaEventCard
                    key={`${event.type}-${event.id}`}
                    event={event}
                    mode={mode}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
