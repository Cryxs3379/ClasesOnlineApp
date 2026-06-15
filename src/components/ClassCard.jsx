import { Link } from 'react-router-dom';

function formatDateTime(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function ClassCard({ classItem, classroomPath }) {
  const classroomUrl =
    classroomPath || `/student/classroom/${classItem.id}`;

  return (
    <article className="card class-card">
      {classItem.title && <h3>{classItem.title}</h3>}
      <div className="class-card__row">
        <span className="class-card__label">Profesor</span>
        <span>{classItem.teacher_name}</span>
      </div>
      <div className="class-card__row">
        <span className="class-card__label">Alumno</span>
        <span>{classItem.student_name}</span>
      </div>
      <div className="class-card__row">
        <span className="class-card__label">Inicio</span>
        <span>{formatDateTime(classItem.start_time)}</span>
      </div>
      <div className="class-card__row">
        <span className="class-card__label">Fin</span>
        <span>{formatDateTime(classItem.end_time)}</span>
      </div>
      <div className="class-card__row">
        <span className="class-card__label">Estado</span>
        <span className={`status-badge status-badge--${classItem.status}`}>
          {classItem.status}
        </span>
      </div>
      <Link to={classroomUrl} className="btn btn-primary btn-block">
        Entrar a BridgeCall
      </Link>
    </article>
  );
}
