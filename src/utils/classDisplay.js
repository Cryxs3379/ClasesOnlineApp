function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export const CLASS_FILTER_OPTIONS = [
  { id: 'all', label: 'Todas' },
  { id: 'upcoming', label: 'Próximas' },
  { id: 'today', label: 'Hoy' },
  { id: 'past', label: 'Pasadas' },
  { id: 'cancelled', label: 'Canceladas' },
];

export const CLASS_STATUS_CONFIG = {
  scheduled: { label: 'Programada', badge: 'badge-primary' },
  completed: { label: 'Finalizada', badge: 'badge-success' },
  cancelled: { label: 'Cancelada', badge: 'badge-danger' },
};

export function isClassPast(classItem) {
  if (!classItem?.start_time) return false;
  return new Date(classItem.start_time).getTime() < Date.now();
}

export function isClassToday(classItem) {
  if (!classItem?.start_time) return false;
  const date = new Date(classItem.start_time);
  return date.toDateString() === new Date().toDateString();
}

export function getClassStatusDisplay(classItem) {
  const status = classItem?.status || 'scheduled';
  const config = CLASS_STATUS_CONFIG[status] || {
    label: status,
    badge: 'badge-muted',
  };
  const isPast = isClassPast(classItem) && status === 'scheduled';

  return { ...config, isPast, status };
}

export function filterClasses(classes, filterId) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = new Date(todayStart);
  todayEnd.setHours(23, 59, 59, 999);

  switch (filterId) {
    case 'upcoming':
      return classes.filter(
        (item) =>
          item.status === 'scheduled' &&
          item.start_time &&
          new Date(item.start_time) >= now
      );
    case 'today':
      return classes.filter((item) => {
        if (!item.start_time) return false;
        const date = new Date(item.start_time);
        return date >= todayStart && date <= todayEnd;
      });
    case 'past':
      return classes.filter((item) => item.start_time && new Date(item.start_time) < now);
    case 'cancelled':
      return classes.filter((item) => item.status === 'cancelled');
    default:
      return classes;
  }
}

export function formatShortDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
