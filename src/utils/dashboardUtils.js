import { Link } from 'react-router-dom';
import { isAssignmentOverdue } from './assignmentStatus';

export function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function getDateValue(dateString) {
  if (!dateString) return 0;
  const value = new Date(dateString).getTime();
  return Number.isNaN(value) ? 0 : value;
}

export function isFutureClass(classItem) {
  if (!classItem?.start_time) return false;
  return classItem.status === 'scheduled' && new Date(classItem.start_time) >= new Date();
}

export function isClassThisWeek(classItem) {
  if (!classItem?.start_time) return false;
  const now = new Date();
  const end = new Date(now);
  end.setDate(now.getDate() + 7);
  const startTime = new Date(classItem.start_time);
  return startTime >= now && startTime <= end && classItem.status === 'scheduled';
}

export function sortClassesByStartAsc(list) {
  return [...list].sort((a, b) => getDateValue(a.start_time) - getDateValue(b.start_time));
}

export function sortAssignmentsByDueDateAsc(list) {
  return [...list].sort((a, b) => getDateValue(a.due_date) - getDateValue(b.due_date));
}

export function sortByCreatedDesc(list) {
  return [...list].sort((a, b) => getDateValue(b.created_at) - getDateValue(a.created_at));
}

export function getLatestItems(list, field = 'created_at', limit = 5) {
  return [...list]
    .sort((a, b) => getDateValue(b[field]) - getDateValue(a[field]))
    .slice(0, limit);
}

export function formatDateTime(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('es-ES', {
    dateStyle: 'medium',
  });
}

export function hasAuthError(results) {
  return results.some((result) => {
    if (result.status !== 'rejected') return false;
    const status = result.reason?.response?.status;
    return status === 401 || status === 403;
  });
}

export function extractFulfilled(result, fallback) {
  return result.status === 'fulfilled' ? result.value : fallback;
}

export function getStudentName(item) {
  return item?.student_name || item?.studentName || '—';
}

export function getTeacherName(item) {
  return item?.teacher_name || item?.teacherName || '—';
}

export function getClassName(item) {
  return item?.class_title || item?.class_name || item?.classTitle || '—';
}

export function getDocumentDate(doc) {
  return doc?.created_at || doc?.createdAt || null;
}

export function getConversationDate(conversation) {
  return conversation?.last_message_at || conversation?.lastMessageAt || conversation?.updated_at || conversation?.updatedAt || null;
}

export function getConversationPreview(conversation) {
  return conversation?.last_message || conversation?.lastMessage || 'Sin mensajes todavía';
}

export function getUpcomingClasses(classes) {
  return sortClassesByStartAsc(classes.filter(isFutureClass));
}

export function getTeacherAttentionAssignments(assignments) {
  return [...assignments]
    .filter(
      (assignment) =>
        assignment.status === 'submitted' ||
        isAssignmentOverdue(assignment) ||
        assignment.status === 'pending'
    )
    .sort((a, b) => {
      const priority = (item) => {
        if (item.status === 'submitted') return 0;
        if (isAssignmentOverdue(item)) return 1;
        if (item.status === 'pending') return 2;
        return 9;
      };

      const priorityDiff = priority(a) - priority(b);
      if (priorityDiff !== 0) return priorityDiff;

      return getDateValue(a.due_date) - getDateValue(b.due_date);
    })
    .slice(0, 5);
}

export function getStudentImportantAssignments(assignments) {
  return [...assignments]
    .filter(
      (assignment) =>
        assignment.status === 'pending' ||
        assignment.status === 'submitted' ||
        assignment.status === 'reviewed'
    )
    .sort((a, b) => {
      const priority = (item) => {
        if (isAssignmentOverdue(item)) return 0;
        if (item.status === 'pending') return 1;
        if (item.status === 'submitted') return 2;
        if (item.status === 'reviewed') return 3;
        return 9;
      };

      const priorityDiff = priority(a) - priority(b);
      if (priorityDiff !== 0) return priorityDiff;

      return getDateValue(a.due_date) - getDateValue(b.due_date);
    })
    .slice(0, 5);
}

export function getRecentConversations(conversations, limit = 5) {
  return [...conversations]
    .sort((a, b) => getDateValue(getConversationDate(b)) - getDateValue(getConversationDate(a)))
    .slice(0, limit);
}

export function getRecentFeedback(assignments, limit = 3) {
  return [...assignments]
    .filter((assignment) => assignment.status === 'reviewed' && assignment.teacher_feedback)
    .sort(
      (a, b) =>
        getDateValue(b.reviewed_at || b.updated_at) -
        getDateValue(a.reviewed_at || a.updated_at)
    )
    .slice(0, limit);
}

export function DashboardStatCard({ label, value, hint, variant }) {
  const variantClass = variant ? `dashboard-stat-card--${variant}` : '';
  return (
    <article className={`dashboard-stat-card ${variantClass}`.trim()}>
      <span className="dashboard-stat-card__label">{label}</span>
      <strong className="dashboard-stat-card__value">{value}</strong>
      {hint && <span className="dashboard-stat-card__hint">{hint}</span>}
    </article>
  );
}

export function DashboardSection({ title, action, children }) {
  return (
    <section className="dashboard-section card">
      <div className="dashboard-section__header">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function DashboardListItem({ title, meta, badge, action }) {
  return (
    <li className="dashboard-list-item">
      <div className="dashboard-list-item__main">
        <p className="dashboard-list-item__title">{title}</p>
        {meta && <p className="dashboard-list-item__meta">{meta}</p>}
      </div>
      {badge && <span className="dashboard-list-item__badge">{badge}</span>}
      {action && <div className="dashboard-list-item__actions">{action}</div>}
    </li>
  );
}

export function InlineEmptyState({ message, action }) {
  return (
    <div className="dashboard-empty-inline">
      <p>{message}</p>
      {action}
    </div>
  );
}

export function DashboardQuickLink({ to, label }) {
  return (
    <Link to={to} className="dashboard-quick-card">
      {label}
    </Link>
  );
}
