import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants/config';

let socket = null;
let currentToken = null;

export function connectSocket(token) {
  if (!token) {
    disconnectSocket();
    return null;
  }

  if (socket && currentToken === token) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  currentToken = token;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connect_error:', error.message);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentToken = null;
}

export function getSocket() {
  return socket;
}

export function joinConversation(conversationId) {
  if (!socket?.connected || !conversationId) return;
  socket.emit('conversation:join', { conversationId });
}

export function leaveConversation(conversationId) {
  if (!socket?.connected || !conversationId) return;
  socket.emit('conversation:leave', { conversationId });
}

export function sendSocketMessage(conversationId, content) {
  if (!socket || !socket.connected || !conversationId) return false;

  socket.emit('message:send', {
    conversationId,
    content,
  });

  return true;
}

export function markSocketConversationAsRead(conversationId) {
  if (!socket?.connected || !conversationId) return;
  socket.emit('conversation:read', { conversationId });
}
