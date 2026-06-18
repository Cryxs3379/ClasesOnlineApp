export function isAssignmentOverdue(assignment) {
  if (!assignment?.due_date) return false;
  if (assignment.status !== 'pending') return false;
  return new Date(assignment.due_date).getTime() < Date.now();
}

export function isAssignmentSubmittedLate(assignment) {
  if (!assignment?.due_date || !assignment?.submitted_at) return false;
  return new Date(assignment.submitted_at).getTime() > new Date(assignment.due_date).getTime();
}

export function getAssignmentDisplayStatus(assignment) {
  if (!assignment) return { label: '—', key: 'unknown', warning: '' };

  if (assignment.status === 'cancelled') {
    return { label: 'Cancelada', key: 'cancelled', warning: '' };
  }

  if (isAssignmentOverdue(assignment)) {
    return { label: 'Atrasada', key: 'overdue', warning: 'Esta tarea está fuera de plazo.' };
  }

  if (assignment.status === 'submitted') {
    if (isAssignmentSubmittedLate(assignment)) {
      return { label: 'Entregada tarde', key: 'submitted-late', warning: 'Entregada fuera de plazo.' };
    }
    return { label: 'Entregada', key: 'submitted', warning: '' };
  }

  if (assignment.status === 'reviewed') {
    return {
      label: 'Revisada',
      key: 'reviewed',
      warning: isAssignmentSubmittedLate(assignment) ? 'Entregada fuera de plazo.' : '',
    };
  }

  return { label: 'Pendiente', key: 'pending', warning: '' };
}
