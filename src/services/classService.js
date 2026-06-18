import { api } from './api';

// Las fechas deben enviarse en ISO 8601 UTC (p. ej. 2026-06-20T17:30:00.000Z).
// No enviar strings de datetime-local sin zona (p. ej. 2026-06-20T19:30).
function assertUtcIsoDateTime(value, fieldName) {
  if (!value) return;

  const hasTimezone = value.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(value);
  const looksNaiveLocal = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value);

  if (looksNaiveLocal && !hasTimezone) {
    throw new Error(
      `${fieldName} debe enviarse en ISO UTC con zona horaria (Z), no como datetime-local sin zona.`
    );
  }
}

function validateClassDates(data) {
  assertUtcIsoDateTime(data?.start_time, 'start_time');
  assertUtcIsoDateTime(data?.end_time, 'end_time');
}

export async function createClass(data) {
  validateClassDates(data);
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
