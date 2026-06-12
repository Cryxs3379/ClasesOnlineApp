import { api } from './api';

export async function createClass(data) {
  const response = await api.post('/api/classes', data);
  return response.data;
}

export async function getMyClasses() {
  const response = await api.get('/api/classes/my-classes');
  return response.data.data.classes || [];
}

export async function getClassById(id) {
  const response = await api.get(`/api/classes/${id}`);
  return response.data.data.class;
}

export async function updateClassStatus(id, status) {
  const response = await api.patch(`/api/classes/${id}/status`, { status });
  return response.data;
}
