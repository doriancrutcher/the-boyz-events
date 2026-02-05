import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserNotifications, 
  getAdminNotifications,
  markNotificationAsRead,
  markAdminNotificationAsRead,
  getUnreadNotificationCount,
  getUnreadAdminNotificationCount
} from '../services/notificationService';
import { deleteEventRequest } from '../services/eventRequestService';
import './Notifications.css';

const Notifications = ({ onClose, onNavigateToRequest, onNavigateToEdit }) => {
  const { currentUser, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        const [adminNotifs, count] = await Promise.all([
          getAdminNotifications(),
          getUnreadAdminNotificationCount()
        ]);
        setNotifications(adminNotifs);
        setUnreadCount(count);
      } else {
        const [userNotifs, count] = await Promise.all([
          getUserNotifications(currentUser.uid),
          getUnreadNotificationCount(currentUser.uid)
        ]);
        setNotifications(userNotifs);
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      if (isAdmin) {
        await markAdminNotificationAsRead(notificationId);
      } else {
        await markNotificationAsRead(notificationId);
      }
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (isAdmin) {
      // Admin notifications
      if (notification.type === 'event_request' && notification.relatedId) {
        onClose();
        if (onNavigateToRequest) {
          onNavigateToRequest(notification.relatedId);
        }
      } else if (notification.type === 'event_edit' && notification.relatedId) {
        onClose();
        if (onNavigateToEdit) {
          onNavigateToEdit(notification.relatedId);
        }
      }
    } else {
      // User notifications - can navigate to their requests if needed
      // For now, just close and let them see it in notifications
      onClose();
    }
  };

  const handleDeleteEvent = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this approved event?')) {
      return;
    }

    try {
      await deleteEventRequest(requestId, currentUser.uid);
      alert('Event deleted successfully!');
      await loadNotifications();
    } catch (error) {
      alert(error.message || 'Failed to delete event');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'event_request':
        return '📅';
      case 'event_edit':
        return '✏️';
      case 'request_approved':
        return '✅';
      case 'request_rejected':
        return '❌';
      case 'edit_approved':
        return '✅';
      case 'edit_rejected':
        return '❌';
      case 'event_cancelled':
        return '🚫';
      default:
        return '🔔';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="notifications-modal" onClick={(e) => e.stopPropagation()}>
        <div className="notifications-header">
          <h2>Notifications {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        {loading ? (
          <div className="notifications-loading">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="no-notifications">No notifications</div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon">{getNotificationIcon(notification.type)}</div>
                <div className="notification-content">
                  <div className="notification-title">{notification.title || notification.message}</div>
                  <div className="notification-message">{notification.message || notification.title}</div>
                  <div className="notification-time">{formatDate(notification.createdAt)}</div>
                  {notification.type === 'request_approved' && notification.relatedId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(notification.relatedId);
                      }}
                      className="delete-event-btn"
                    >
                      Delete Event
                    </button>
                  )}
                </div>
                {!notification.read && <div className="unread-indicator"></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
