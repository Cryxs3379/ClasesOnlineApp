import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getToken } from '../storage/authStorage';
import {
  getConversations,
  getConversationMessages,
  sendMessageRest,
  markConversationAsRead,
} from '../services/conversationService';
import { getAuthErrorMessage } from '../services/authService';
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  joinConversation,
  leaveConversation,
  sendSocketMessage,
  markSocketConversationAsRead,
} from '../socket/socketClient';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';

const MAX_MESSAGE_LENGTH = 2000;

function formatMessageTime(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function getConversationId(conversation) {
  return conversation.conversation_id;
}

function getContactName(conversation, mode) {
  if (mode === 'teacher') {
    return conversation.student_name || conversation.studentName || 'Alumno';
  }
  return conversation.teacher_name || conversation.teacherName || 'Profesor';
}

function sortConversations(list) {
  return [...list].sort((a, b) => {
    const dateA = new Date(a.updated_at || a.last_message_at || 0).getTime();
    const dateB = new Date(b.updated_at || b.last_message_at || 0).getTime();
    return dateB - dateA;
  });
}

function upsertConversation(list, updated) {
  const id = getConversationId(updated);
  const exists = list.some((item) => getConversationId(item) === id);
  if (exists) {
    return sortConversations(
      list.map((item) => (getConversationId(item) === id ? { ...item, ...updated } : item))
    );
  }
  return sortConversations([updated, ...list]);
}

function appendMessage(list, message) {
  if (list.some((item) => item.id === message.id)) return list;
  return [...list, message];
}

export default function MessagesPanel({ mode }) {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const activeConversationIdRef = useRef(null);

  const activeConversation = conversations.find(
    (item) => getConversationId(item) === activeConversationId
  );

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleAuthError = useCallback(
    (err) => {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        disconnectSocket();
        logoutUser();
        navigate('/login');
        return true;
      }
      return false;
    },
    [logoutUser, navigate]
  );

  const markRead = useCallback(async (conversationId) => {
    try {
      await markConversationAsRead(conversationId);
      markSocketConversationAsRead(conversationId);
      setConversations((prev) =>
        prev.map((item) =>
          getConversationId(item) === conversationId
            ? { ...item, unread_count: 0 }
            : item
        )
      );
    } catch {
      markSocketConversationAsRead(conversationId);
    }
  }, []);

  const loadConversations = useCallback(async () => {
    const data = await getConversations();
    setConversations(sortConversations(data));
  }, []);

  useEffect(() => {
    async function init() {
      const token = getToken();
      if (!user || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        connectSocket(token);
        await loadConversations();
      } catch (err) {
        if (!handleAuthError(err)) {
          setError(getAuthErrorMessage(err));
        }
      } finally {
        setLoading(false);
      }
    }

    init();

    return () => {
      const currentId = activeConversationIdRef.current;
      if (currentId) {
        leaveConversation(currentId);
      }
      disconnectSocket();
    };
  }, [user, loadConversations, handleAuthError]);

  useEffect(() => {
    const token = getToken();
    if (!user || !token) return undefined;

    const socket = connectSocket(token);
    if (!socket) return undefined;

    function onMessageNew(message) {
      const conversationId = message.conversation_id;
      const isActive = activeConversationIdRef.current === conversationId;
      const isMine = message.sender_id === user?.id;

      setConversations((prev) => {
        const existing = prev.find((item) => getConversationId(item) === conversationId);
        const updated = {
          ...(existing || {}),
          conversation_id: conversationId,
          last_message: message.content,
          last_message_at: message.created_at,
          updated_at: message.created_at,
          unread_count:
            isActive || isMine
              ? isActive
                ? 0
                : existing?.unread_count || 0
              : (existing?.unread_count || 0) + 1,
        };
        return upsertConversation(prev, updated);
      });

      if (isActive) {
        setMessages((prev) => appendMessage(prev, message));
        markRead(conversationId);
        scrollToBottom();
      }
    }

    function onConversationUpdated(conversation) {
      setConversations((prev) => upsertConversation(prev, conversation));
    }

    function onMessageError(payload) {
      const message = payload?.message || 'No se pudo enviar el mensaje.';
      setError(message);
    }

    socket.on('message:new', onMessageNew);
    socket.on('conversation:updated', onConversationUpdated);
    socket.on('message:error', onMessageError);

    return () => {
      socket.off('message:new', onMessageNew);
      socket.off('conversation:updated', onConversationUpdated);
      socket.off('message:error', onMessageError);
    };
  }, [user, markRead, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function selectConversation(conversationId) {
    if (activeConversationId === conversationId) return;

    setError('');

    if (activeConversationId) {
      leaveConversation(activeConversationId);
    }

    setActiveConversationId(conversationId);
    setLoadingMessages(true);
    setMessages([]);

    try {
      joinConversation(conversationId);
      const data = await getConversationMessages(conversationId);
      setMessages(data);
      await markRead(conversationId);
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(getAuthErrorMessage(err));
      }
    } finally {
      setLoadingMessages(false);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    setError('');

    const content = messageInput.trim();
    if (!content) {
      setError('Escribe un mensaje antes de enviar.');
      return;
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      setError(`El mensaje no puede superar ${MAX_MESSAGE_LENGTH} caracteres.`);
      return;
    }

    if (!activeConversationId) {
      setError('Selecciona una conversación.');
      return;
    }

    setSending(true);
    try {
      const sentViaSocket = sendSocketMessage(activeConversationId, content);

      if (!sentViaSocket || !getSocket()?.connected) {
        const message = await sendMessageRest(activeConversationId, content);
        setMessages((prev) => appendMessage(prev, message));
        scrollToBottom();
      }

      setMessageInput('');
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(getAuthErrorMessage(err));
      }
    } finally {
      setSending(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="messages-shell">
      <div className="page-header">
        <div>
          <span className="eyebrow">Comunicación</span>
          <h1>Mensajes</h1>
          <p>
            {mode === 'teacher'
              ? 'Chatea en tiempo real con tus alumnos.'
              : 'Chatea en tiempo real con tu profesor.'}
          </p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {conversations.length === 0 ? (
        <EmptyState
          title="Sin conversaciones"
          message={
            mode === 'teacher'
              ? 'Cuando tengas alumnos activos, aparecerán aquí tus conversaciones.'
              : 'Tu profesor iniciará la conversación contigo.'
          }
        />
      ) : (
        <div className="messages-layout">
          <aside className="messages-sidebar card">
            <h2>Conversaciones</h2>
            <div className="messages-sidebar__list">
              {conversations.map((conversation) => {
                const conversationId = getConversationId(conversation);
                const isActive = activeConversationId === conversationId;
                const unread = Number(conversation.unread_count || 0);

                return (
                  <button
                    key={conversationId}
                    type="button"
                    className={`messages-conversation ${isActive ? 'active' : ''}`}
                    onClick={() => selectConversation(conversationId)}
                  >
                    <div className="messages-conversation__top">
                      <strong>{getContactName(conversation, mode)}</strong>
                      {unread > 0 && (
                        <span className="messages-unread-badge">{unread}</span>
                      )}
                    </div>
                    <p className="messages-conversation__preview">
                      {conversation.last_message || 'Sin mensajes todavía'}
                    </p>
                    <span className="messages-conversation__time">
                      {formatMessageTime(
                        conversation.last_message_at || conversation.updated_at
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="messages-chat card">
            {!activeConversation ? (
              <div className="messages-shell__empty">
                <p>Selecciona una conversación para ver los mensajes.</p>
              </div>
            ) : (
              <>
                <div className="messages-chat-header">
                  <h2>{getContactName(activeConversation, mode)}</h2>
                </div>

                {loadingMessages ? (
                  <Loading />
                ) : (
                  <div className="messages-list">
                    {messages.length === 0 ? (
                      <p className="muted">No hay mensajes en esta conversación.</p>
                    ) : (
                      messages.map((message) => {
                        const isMine = message.sender_id === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={`message-bubble ${isMine ? 'mine' : 'other'}`}
                          >
                            <p>{message.content}</p>
                            <span>{formatMessageTime(message.created_at)}</span>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="messages-form">
                  <input
                    type="text"
                    value={messageInput}
                    maxLength={MAX_MESSAGE_LENGTH}
                    placeholder="Escribe un mensaje..."
                    onChange={(e) => setMessageInput(e.target.value)}
                    disabled={sending || loadingMessages}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sending || loadingMessages}
                  >
                    {sending ? 'Enviando...' : 'Enviar'}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
