export default function RoleBadge({ role }) {
  const label = role === 'teacher' ? 'Profesor' : 'Alumno';
  return <span className={`role-badge role-badge--${role}`}>{label}</span>;
}
