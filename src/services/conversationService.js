import { api } from './api';

export async function getConversations() {
  const response = await api.get('/conversations');
  return response.data.data.conversations || [];
}

export async function getConversationMessages(conversationId) {
  if (!conversationId) return [];

  const response = await api.get(`/conversations/${conversationId}/messages`);
  return response.data.data.messages || [];
}

export async function sendMessageRest(conversationId, content) {
  if (!conversationId) {
    throw new Error('Conversación no válida.');
  }

  const response = await api.post(`/conversations/${conversationId}/messages`, { content });
  return response.data.data.message || response.data.data;
}

export async function markConversationAsRead(conversationId) {
  if (!conversationId) return null;

  const response = await api.patch(`/conversations/${conversationId}/read`);
  return response.data;
}
