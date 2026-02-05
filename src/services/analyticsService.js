import { logEvent, setUserProperties, setUserId } from 'firebase/analytics';
import { analytics } from '../config/firebase';

/**
 * Track a custom event
 */
export const trackEvent = (eventName, eventParams = {}) => {
  if (!analytics) {
    console.warn('Analytics not initialized');
    return;
  }
  
  try {
    logEvent(analytics, eventName, eventParams);
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

/**
 * Track page view
 */
export const trackPageView = (pageName, pageParams = {}) => {
  trackEvent('page_view', {
    page_name: pageName,
    ...pageParams
  });
};

/**
 * Track user login
 */
export const trackLogin = (method) => {
  trackEvent('login', {
    method: method // 'email' or 'google'
  });
};

/**
 * Track user logout
 */
export const trackLogout = () => {
  trackEvent('logout');
};

/**
 * Set user ID for analytics
 */
export const setAnalyticsUserId = (userId) => {
  if (!analytics) return;
  
  try {
    setUserId(analytics, userId);
  } catch (error) {
    console.error('Error setting user ID:', error);
  }
};

/**
 * Set user properties
 */
export const setAnalyticsUserProperties = (properties) => {
  if (!analytics) return;
  
  try {
    setUserProperties(analytics, properties);
  } catch (error) {
    console.error('Error setting user properties:', error);
  }
};

/**
 * Track event interactions
 */
export const trackEventView = (eventId, eventTitle) => {
  trackEvent('view_event', {
    event_id: eventId,
    event_title: eventTitle
  });
};

export const trackEventGoing = (eventId, eventTitle, isGoing) => {
  trackEvent('event_going', {
    event_id: eventId,
    event_title: eventTitle,
    action: isGoing ? 'marked_going' : 'unmarked_going'
  });
};

export const trackEventEdit = (eventId, eventTitle, isAdmin) => {
  trackEvent('event_edit', {
    event_id: eventId,
    event_title: eventTitle,
    user_type: isAdmin ? 'admin' : 'user'
  });
};

/**
 * Track event requests
 */
export const trackEventRequest = (hasImage) => {
  trackEvent('event_request', {
    has_image: hasImage
  });
};

export const trackEventRequestApproval = (requestId, approved) => {
  trackEvent('event_request_decision', {
    request_id: requestId,
    approved: approved
  });
};

/**
 * Track edit requests
 */
export const trackEditRequest = (eventId) => {
  trackEvent('edit_request', {
    event_id: eventId
  });
};

export const trackEditRequestDecision = (editId, approved) => {
  trackEvent('edit_request_decision', {
    edit_id: editId,
    approved: approved
  });
};

/**
 * Track admin actions
 */
export const trackAdminAction = (action, details = {}) => {
  trackEvent('admin_action', {
    action: action,
    ...details
  });
};

/**
 * Track notification interactions
 */
export const trackNotificationView = (notificationId, notificationType) => {
  trackEvent('notification_view', {
    notification_id: notificationId,
    notification_type: notificationType
  });
};

/**
 * Track calendar interactions
 */
export const trackCalendarAdd = () => {
  trackEvent('calendar_add');
};

export const trackCalendarRefresh = () => {
  trackEvent('calendar_refresh');
};

/**
 * Track event cancellation
 */
export const trackEventCancellation = (eventId, eventTitle) => {
  trackEvent('event_cancelled', {
    event_id: eventId,
    event_title: eventTitle
  });
};
