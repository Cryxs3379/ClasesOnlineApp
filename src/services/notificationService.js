import { api } from './api';

export async function getNotifications() {
  const response = await api.get('/notifications');
  return response.data.data.notifications || [];
}

export async function getUnreadNotificationsCount() {
  const response = await api.get('/notifications/unread-count');
  const data = response.data.data;
  return Number(data?.unread_count ?? data?.count ?? 0);
}

export async function markNotificationAsRead(notificationId) {
  if (!notificationId) return null;

  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data.data.notification || response.data.data;
}

export async function markAllNotificationsAsRead() {
  const response = await api.patch('/notifications/read-all');
  return response.data;
}

export async function deleteNotification(notificationId) {
  if (!notificationId) return null;

  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data;
}
