import { api } from './api';

export async function createClass(data) {
  const response = await api.post('/classes', data);
  return response.data;
}

export async function getMyClasses() {
  const response = await api.get('/classes/my-classes');
  return response.data.data.classes || [];
}

export async function getClassById(id) {
  const response = await api.get(`/classes/${id}`);
  return response.data.data.class;
}

export async function updateClassStatus(id, status) {
  const response = await api.patch(`/classes/${id}/status`, { status });
  return response.data;
}
