export const TEACHER_NAV = [
  { to: '/teacher/dashboard', label: 'Inicio', icon: '🏠', end: true },
  { to: '/teacher/students', label: 'Alumnos', icon: '👥' },
  { to: '/teacher/classes', label: 'Clases', icon: '🎥' },
  { to: '/teacher/calendar', label: 'Calendario', icon: '📅' },
  { to: '/teacher/assignments', label: 'Tareas', icon: '📝' },
  { to: '/teacher/documents', label: 'Materiales', icon: '📚' },
  { to: '/teacher/messages', label: 'Mensajes', icon: '💬' },
];

export const STUDENT_NAV = [
  { to: '/student/dashboard', label: 'Inicio', icon: '🏠', end: true },
  { to: '/student/classes', label: 'Mis clases', icon: '🎥' },
  { to: '/student/calendar', label: 'Calendario', icon: '📅' },
  { to: '/student/assignments', label: 'Tareas', icon: '📝' },
  { to: '/student/documents', label: 'Materiales', icon: '📚' },
  { to: '/student/messages', label: 'Mensajes', icon: '💬' },
];

const TITLE_RULES = [
  { test: /\/classroom\//, title: 'Aula online' },
  { test: /\/students\/new/, title: 'Nuevo alumno' },
  { test: /\/students\/[^/]+$/, title: 'Alumno' },
  { test: /\/classes\/new/, title: 'Nueva clase' },
  { test: /\/dashboard/, title: 'Dashboard' },
  { test: /\/students/, title: 'Alumnos' },
  { test: /\/classes/, title: 'Clases' },
  { test: /\/calendar/, title: 'Calendario' },
  { test: /\/assignments/, title: 'Tareas' },
  { test: /\/documents/, title: 'Materiales' },
  { test: /\/messages/, title: 'Mensajes' },
];

export function getNavItems(role) {
  if (role === 'teacher' || role === 'admin') return TEACHER_NAV;
  if (role === 'student') return STUDENT_NAV;
  return [];
}

export function getRoleLabel(role) {
  if (role === 'teacher') return 'Profesor';
  if (role === 'admin') return 'Admin';
  if (role === 'student') return 'Alumno';
  return role || '';
}

export function getPageTitle(pathname) {
  const rule = TITLE_RULES.find(({ test }) => test.test(pathname));
  return rule?.title ?? 'Ambilengua';
}

export function getUserInitial(user) {
  const source = user?.name?.trim() || user?.email?.trim() || '?';
  return source.charAt(0).toUpperCase();
}
