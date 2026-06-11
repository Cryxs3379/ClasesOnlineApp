import { api } from './api';

export async function getTeachers() {
  const response = await api.get('/api/teachers');
  return response.data.data;
}

export async function getTeacherById(id) {
  const response = await api.get(`/api/teachers/${id}`);
  return response.data.data;
}

export async function saveTeacherProfile(data) {
  const response = await api.post('/api/teachers/profile', data);
  return response.data;
}
