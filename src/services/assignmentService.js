import { api } from './api';

function downloadBlobFile(blob, filename, fallbackName) {
  const downloadName = filename || fallbackName;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = downloadName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildAssignmentFormData(data) {
  const formData = new FormData();
  formData.append('title', data.title);

  if (data.description) {
    formData.append('description', data.description);
  }

  if (data.student_id) {
    formData.append('student_id', data.student_id);
  }

  if (data.class_id) {
    formData.append('class_id', data.class_id);
  }

  if (data.due_date) {
    formData.append('due_date', data.due_date);
  }

  if (data.status) {
    formData.append('status', data.status);
  }

  if (data.teacher_feedback) {
    formData.append('teacher_feedback', data.teacher_feedback);
  }

  if (data.attachment) {
    formData.append('attachment', data.attachment);
  }

  return formData;
}

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
  if (data?.attachment) {
    const formData = buildAssignmentFormData(data);
    const response = await api.post('/assignments', formData);
    return response.data;
  }

  const payload = { ...data };
  delete payload.attachment;

  const response = await api.post('/assignments', payload);
  return response.data;
}

export async function updateAssignment(id, data) {
  if (!id) {
    throw new Error('Tarea no válida.');
  }

  if (data?.attachment) {
    const formData = buildAssignmentFormData(data);
    const response = await api.patch(`/assignments/${id}`, formData);
    return response.data;
  }

  const payload = { ...data };
  delete payload.attachment;

  const response = await api.patch(`/assignments/${id}`, payload);
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

  downloadBlobFile(response.data, filename, 'entrega');
}

export async function downloadAttachmentFile(id, filename) {
  if (!id) {
    throw new Error('Tarea no válida.');
  }

  const response = await api.get(`/assignments/${id}/attachment-file`, {
    responseType: 'blob',
  });

  downloadBlobFile(response.data, filename, 'material-tarea');
}
