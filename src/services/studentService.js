import { api } from './api';

export async function createStudent(data) {
  const response = await api.post('/students', data);
  return response.data;
}

export async function getStudents() {
  const response = await api.get('/students');
  return response.data.data.students || [];
}

export async function getStudentById(id) {
  const response = await api.get(`/students/${id}`);
  return response.data.data.student;
}

export async function updateStudentStatus(id, isActive) {
  const response = await api.patch(`/students/${id}/status`, {
    is_active: isActive,
  });
  return response.data;
}
