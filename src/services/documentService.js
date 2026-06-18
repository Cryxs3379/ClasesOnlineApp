import { api } from './api';

export async function getDocuments() {
  const response = await api.get('/documents');
  return response.data.data.documents || [];
}

export async function getClassDocuments(classId) {
  const response = await api.get(`/documents/class/${classId}`);
  return response.data.data.documents || [];
}

export async function uploadDocument({ title, description, student_id, class_id, file }) {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description || '');
  if (student_id) formData.append('student_id', student_id);
  if (class_id) formData.append('class_id', class_id);
  formData.append('file', file);

  const response = await api.post('/documents', formData);
  return response.data;
}

export async function downloadDocument(documentId, originalFilename) {
  const response = await api.get(`/documents/${documentId}/download`, {
    responseType: 'blob',
  });

  const filename = originalFilename || 'documento';
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function deleteDocument(documentId) {
  const response = await api.delete(`/documents/${documentId}`);
  return response.data;
}
