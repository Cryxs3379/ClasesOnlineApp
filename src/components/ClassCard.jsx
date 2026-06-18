import { Link } from 'react-router-dom';
import { formatDateTime, formatShortDate, getClassStatusDisplay } from '../utils/classDisplay';

export default function ClassCard({ classItem, role = 'student', onComplete, calendarPath }) {
  const display = getClassStatusDisplay(classItem);
  const classroomPath =
    role === 'teacher'
      ? `/teacher/classroom/${classItem.id}`
      : `/student/classroom/${classItem.id}`;
  const calendarLink = calendarPath || (role === 'teacher' ? '/teacher/calendar' : '/student/calendar');

  const cardClasses = [
    'class-card',
    `class-card--${display.status}`,
    display.isPast ? 'class-card--past' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={cardClasses}>
      <div className="class-card__header">
        <span className={`badge ${display.badge}`}>{display.label}</span>
        <span className="class-card__date">{formatShortDate(classItem.start_time)}</span>
      </div>

      <h3 className="class-card__title">{classItem.title || '—'}</h3>

      {classItem.description ? (
        <p className="class-card__desc">{classItem.description}</p>
      ) : null}

      <dl className="class-card__meta">
        {role === 'teacher' ? (
          <div className="class-card__meta-row">
            <dt>Alumno</dt>
            <dd>{classItem.student_name || '—'}</dd>
          </div>
        ) : (
          <div className="class-card__meta-row">
            <dt>Profesor</dt>
            <dd>{classItem.teacher_name || '—'}</dd>
          </div>
        )}
        <div className="class-card__meta-row">
          <dt>Inicio</dt>
          <dd>{formatDateTime(classItem.start_time)}</dd>
        </div>
        {classItem.end_time ? (
          <div className="class-card__meta-row">
            <dt>Fin</dt>
            <dd>{formatDateTime(classItem.end_time)}</dd>
          </div>
        ) : null}
      </dl>

      {display.isPast ? (
        <p className="class-card__past-note muted">Esta clase ya pasó.</p>
      ) : null}

      <div className="class-card__actions">
        <Link to={classroomPath} className="btn btn-primary btn-block">
          Entrar a clase
        </Link>
        <Link to={calendarLink} className="btn btn-outline btn-block">
          Ver calendario
        </Link>
        {role === 'teacher' && classItem.status === 'scheduled' && onComplete ? (
          <button type="button" className="btn btn-ghost btn-block" onClick={() => onComplete(classItem.id)}>
            Marcar completada
          </button>
        ) : null}
      </div>
    </article>
  );
}
