import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';

const EVENT_GOING_COLLECTION = 'eventGoing';

/**
 * Toggle user's "going" status for an event
 */
export const toggleGoingStatus = async (eventId, userId, userName) => {
  try {
    const goingRef = doc(db, EVENT_GOING_COLLECTION, `${eventId}_${userId}`);
    const goingDoc = await getDoc(goingRef);
    
    if (goingDoc.exists()) {
      // User is already going, remove them
      await deleteDoc(goingRef);
      return false; // Not going
    } else {
      // User wants to go, add them
      await setDoc(goingRef, {
        eventId,
        userId,
        userName,
        createdAt: new Date().toISOString()
      });
      return true; // Going
    }
  } catch (error) {
    console.error('Error toggling going status:', error);
    throw error;
  }
};

/**
 * Check if a user is going to an event
 */
export const isUserGoing = async (eventId, userId) => {
  try {
    const goingRef = doc(db, EVENT_GOING_COLLECTION, `${eventId}_${userId}`);
    const goingDoc = await getDoc(goingRef);
    return goingDoc.exists();
  } catch (error) {
    console.error('Error checking going status:', error);
    return false;
  }
};

/**
 * Get all users going to an event
 */
export const getUsersGoing = async (eventId) => {
  try {
    const q = query(
      collection(db, EVENT_GOING_COLLECTION),
      where('eventId', '==', eventId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching users going:', error);
    return [];
  }
};

/**
 * Get going status for multiple events
 */
export const getGoingStatusForEvents = async (eventIds, userId) => {
  try {
    if (!userId || eventIds.length === 0) return {};
    
    const goingStatus = {};
    const promises = eventIds.map(eventId => 
      isUserGoing(eventId, userId).then(isGoing => {
        goingStatus[eventId] = isGoing;
      })
    );
    await Promise.all(promises);
    return goingStatus;
  } catch (error) {
    console.error('Error fetching going status:', error);
    return {};
  }
};

/**
 * Get going counts for multiple events
 */
export const getGoingCountsForEvents = async (eventIds) => {
  try {
    if (eventIds.length === 0) return {};
    
    const counts = {};
    const promises = eventIds.map(eventId =>
      getUsersGoing(eventId).then(users => {
        counts[eventId] = users.length;
      })
    );
    await Promise.all(promises);
    return counts;
  } catch (error) {
    console.error('Error fetching going counts:', error);
    return {};
  }
};

/**
 * Notify all users going to an event that it was cancelled
 */
export const notifyEventCancelled = async (eventId, eventTitle) => {
  try {
    const usersGoing = await getUsersGoing(eventId);
    
    if (usersGoing.length === 0) {
      return 0; // No one to notify
    }

    const { createNotification } = await import('./notificationService');
    
    // Create notifications for all users who were going
    const notificationPromises = usersGoing.map(user =>
      createNotification(
        user.userId,
        'event_cancelled',
        'Event Cancelled',
        `The event "${eventTitle}" has been cancelled or removed.`,
        eventId
      )
    );

    await Promise.all(notificationPromises);
    
    // Delete all going statuses for this event
    const deletePromises = usersGoing.map(user =>
      deleteDoc(doc(db, EVENT_GOING_COLLECTION, `${eventId}_${user.userId}`))
    );
    
    await Promise.all(deletePromises);
    
    return usersGoing.length;
  } catch (error) {
    console.error('Error notifying users of event cancellation:', error);
    throw error;
  }
};
