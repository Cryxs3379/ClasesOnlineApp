import { Link } from 'react-router-dom';

export default function TeacherCard({ teacher }) {
  return (
    <article className="card teacher-card">
      <div className="teacher-card__header">
        <h3>{teacher.name}</h3>
        <span className="teacher-card__subject">{teacher.subject}</span>
      </div>
      <p className="teacher-card__price">{teacher.hourly_price} €/hora</p>
      <p className="teacher-card__bio">{teacher.bio}</p>
      <Link to={`/teachers/${teacher.id}`} className="btn btn-primary btn-block">
        Ver perfil
      </Link>
    </article>
  );
}
