import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getToken } from '../storage/authStorage';
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../services/notificationService';
import { getAuthErrorMessage } from '../services/authService';
import { connectSocket } from '../socket/socketClient';

function formatNotificationDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function isUnread(notification) {
  return notification.is_read === false || notification.is_read === 0;
}

function getNotificationRoute(notification, user) {
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const entityType = notification.related_entity_type;

  if (entityType === 'conversation') {
    return isTeacher ? '/teacher/messages' : '/student/messages';
  }

  if (entityType === 'document') {
    return isTeacher ? '/teacher/documents' : '/student/documents';
  }

  if (entityType === 'class') {
    return isTeacher ? '/teacher/classes' : '/student/classes';
  }

  return null;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState('');
  const [pulse, setPulse] = useState(false);

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadNotificationsCount();
      setUnreadCount(count);
    } catch {
      // No bloquear la navbar si falla el contador
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setLoadingList(true);
    setError('');
    try {
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return undefined;

    const token = getToken();
    if (!token) return undefined;

    const socket = connectSocket(token);
    if (!socket) return undefined;

    loadUnreadCount();

    function onNotificationNew(payload) {
      const notification = payload?.notification;
      if (!notification?.id) return;

      let shouldIncrement = false;

      setNotifications((prev) => {
        if (prev.some((item) => item.id === notification.id)) {
          return prev.map((item) =>
            item.id === notification.id ? { ...item, ...notification } : item
          );
        }

        if (isUnread(notification)) {
          shouldIncrement = true;
        }

        return [notification, ...prev];
      });

      if (shouldIncrement) {
        setUnreadCount((prev) => prev + 1);
      }

      setPulse(true);
      setTimeout(() => setPulse(false), 1500);
    }

    function onNotificationsUpdated(payload) {
      if (typeof payload?.unread_count === 'number') {
        setUnreadCount(payload.unread_count);
      }
    }

    socket.on('notification:new', onNotificationNew);
    socket.on('notifications:updated', onNotificationsUpdated);

    return () => {
      socket.off('notification:new', onNotificationNew);
      socket.off('notifications:updated', onNotificationsUpdated);
    };
  }, [user?.id, loadUnreadCount]);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open, loadNotifications]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  async function handleMarkAsRead(notification, event) {
    event?.stopPropagation();

    if (!notification?.id || !isUnread(notification)) return;

    try {
      const updated = await markNotificationAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? { ...item, ...(updated || {}), is_read: true }
            : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }

  async function handleDelete(notificationId, event) {
    event?.stopPropagation();
    if (!notificationId) return;

    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => {
        const target = prev.find((item) => item.id === notificationId);
        const next = prev.filter((item) => item.id !== notificationId);
        if (target && isUnread(target)) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return next;
      });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }

  async function handleNotificationClick(notification) {
    if (isUnread(notification)) {
      await handleMarkAsRead(notification);
    }

    const route = getNotificationRoute(notification, user);
    if (route) {
      setOpen(false);
      navigate(route);
    }
  }

  if (!user) return null;

  const badgeLabel = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <div
      className={`notification-bell ${pulse ? 'notification-bell--pulse' : ''}`}
      ref={containerRef}
    >
      <button
        type="button"
        className="notification-bell__button"
        aria-label="Notificaciones"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-bell__badge">{badgeLabel}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown__header">
            <h3>Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleMarkAllAsRead}
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {error && <p className="notification-dropdown__error">{error}</p>}

          {loadingList ? (
            <p className="notification-dropdown__empty">Cargando...</p>
          ) : notifications.length === 0 ? (
            <p className="notification-dropdown__empty">No tienes notificaciones.</p>
          ) : (
            <ul className="notification-dropdown__list">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`notification-item ${isUnread(notification) ? 'unread' : ''}`}
                >
                  <button
                    type="button"
                    className="notification-item__content"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <span className="notification-item__title">{notification.title}</span>
                    <span className="notification-item__message">{notification.message}</span>
                    <span className="notification-item__date">
                      {formatNotificationDate(notification.created_at)}
                    </span>
                  </button>

                  <div className="notification-item__actions">
                    {isUnread(notification) && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={(event) => handleMarkAsRead(notification, event)}
                      >
                        Leída
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={(event) => handleDelete(notification.id, event)}
                    >
                      Borrar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
