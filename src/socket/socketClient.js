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
    if (!socket.connected && !socket.active) {
      socket.connect();
    }
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
    autoConnect: true,
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

export function joinWhiteboard(classId) {
  if (!socket?.connected || !classId) return;
  socket.emit('whiteboard:join', { classId });
}

export function leaveWhiteboard(classId) {
  if (!socket?.connected || !classId) return;
  socket.emit('whiteboard:leave', { classId });
}

export function requestWhiteboardState(classId) {
  if (!socket?.connected || !classId) return;
  socket.emit('whiteboard:state:request', { classId });
}

export function sendWhiteboardDraw(payload) {
  if (!socket?.connected || !payload?.classId) return false;
  socket.emit('whiteboard:draw', payload);
  return true;
}

export function sendWhiteboardClear(classId) {
  if (!socket?.connected || !classId) return false;
  socket.emit('whiteboard:clear', { classId });
  return true;
}
