import { api } from './api';

export async function getTeachers() {
  const response = await api.get('/teachers');
  return response.data.data.teachers || [];
}

export async function getTeacherById(id) {
  const response = await api.get(`/teachers/${id}`);
  return response.data.data.teacher;
}

export async function saveTeacherProfile(data) {
  const response = await api.post('/teachers/profile', data);
  return response.data;
}
