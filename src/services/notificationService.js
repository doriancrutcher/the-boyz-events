import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

const NOTIFICATIONS_COLLECTION = 'userNotifications';

/**
 * Create a notification for a user
 */
export const createNotification = async (userId, type, title, message, relatedId = null) => {
  try {
    const notificationRef = collection(db, NOTIFICATIONS_COLLECTION);
    await addDoc(notificationRef, {
      userId,
      type, // 'request_approved', 'request_rejected', 'edit_approved', 'edit_rejected'
      title,
      message,
      relatedId, // requestId or editId
      read: false,
      createdAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

/**
 * Create a notification for admin
 */
export const createAdminNotification = async (type, title, message, relatedId = null, userEmail = null) => {
  try {
    const notificationRef = collection(db, 'adminNotifications');
    await addDoc(notificationRef, {
      type, // 'event_request', 'event_edit'
      title,
      message,
      relatedId, // requestId or editId
      userEmail,
      read: false,
      createdAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error creating admin notification:', error);
  }
};

/**
 * Get notifications for a user
 */
export const getUserNotifications = async (userId) => {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

/**
 * Get admin notifications
 */
export const getAdminNotifications = async () => {
  try {
    const q = query(
      collection(db, 'adminNotifications'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return [];
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

/**
 * Mark admin notification as read
 */
export const markAdminNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'adminNotifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error marking admin notification as read:', error);
  }
};

/**
 * Get unread notification count for a user
 */
export const getUnreadNotificationCount = async (userId) => {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
};

/**
 * Get unread admin notification count
 */
export const getUnreadAdminNotificationCount = async () => {
  try {
    const q = query(
      collection(db, 'adminNotifications'),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error fetching unread admin count:', error);
    return 0;
  }
};
