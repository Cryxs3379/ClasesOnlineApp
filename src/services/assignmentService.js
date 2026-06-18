import { api } from './api';

export async function getAssignments() {
  const response = await api.get('/assignments');
  return response.data.data.assignments || [];
}

export async function getAssignmentById(id) {
  if (!id) return null;

  const response = await api.get(`/assignments/${id}`);
  return response.data.data.assignment || response.data.data;
}

export async function createAssignment(data) {
  const response = await api.post('/assignments', data);
  return response.data;
}

export async function updateAssignment(id, data) {
  if (!id) {
    throw new Error('Tarea no válida.');
  }

  const response = await api.patch(`/assignments/${id}`, data);
  return response.data;
}

export async function submitAssignment(id, { submission_text, file }) {
  if (!id) {
    throw new Error('Tarea no válida.');
  }

  if (file) {
    const formData = new FormData();
    if (submission_text) {
      formData.append('submission_text', submission_text);
    }
    formData.append('file', file);

    const response = await api.post(`/assignments/${id}/submit`, formData);
    return response.data.data.assignment || response.data.data;
  }

  const response = await api.post(`/assignments/${id}/submit`, {
    submission_text: submission_text || '',
  });
  return response.data.data.assignment || response.data.data;
}

export async function reviewAssignment(id, { teacher_feedback }) {
  if (!id) {
    throw new Error('Tarea no válida.');
  }

  const response = await api.patch(`/assignments/${id}/review`, {
    teacher_feedback,
  });
  return response.data.data.assignment || response.data.data;
}

export async function deleteAssignment(id) {
  if (!id) {
    throw new Error('Tarea no válida.');
  }

  const response = await api.delete(`/assignments/${id}`);
  return response.data;
}

export async function downloadSubmissionFile(id, filename) {
  if (!id) {
    throw new Error('Tarea no válida.');
  }

  const response = await api.get(`/assignments/${id}/submission-file`, {
    responseType: 'blob',
  });

  const downloadName = filename || 'entrega';
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = downloadName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
