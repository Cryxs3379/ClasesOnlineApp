import { api } from './api';

export async function getConversations() {
  const response = await api.get('/conversations');
  return response.data.data.conversations || [];
}

export async function getConversationMessages(conversationId) {
  const response = await api.get(`/conversations/${conversationId}/messages`);
  return response.data.data.messages || [];
}

export async function sendMessageRest(conversationId, content) {
  const response = await api.post(`/conversations/${conversationId}/messages`, { content });
  return response.data.data.message || response.data.data;
}

export async function markConversationAsRead(conversationId) {
  const response = await api.patch(`/conversations/${conversationId}/read`);
  return response.data;
}
