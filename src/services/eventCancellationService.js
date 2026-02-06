import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { notifyEventCancelled } from './eventGoingService';

const EVENTS_METADATA_COLLECTION = 'events';

/**
 * Mark an event as cancelled and notify users who were going
 */
export const cancelEvent = async (eventId, eventTitle) => {
  try {
    // Mark event as cancelled in metadata
    // Use setDoc with merge to create document if it doesn't exist
    const eventRef = doc(db, EVENTS_METADATA_COLLECTION, eventId);
    await setDoc(eventRef, {
      cancelled: true,
      cancelledAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }, { merge: true });

    // Notify all users who were going
    const notifiedCount = await notifyEventCancelled(eventId, eventTitle);
    
    return {
      success: true,
      notifiedCount
    };
  } catch (error) {
    console.error('Error cancelling event:', error);
    throw error;
  }
};

/**
 * Check if an event is cancelled
 */
export const isEventCancelled = async (eventId) => {
  try {
    const eventRef = doc(db, EVENTS_METADATA_COLLECTION, eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (eventDoc.exists()) {
      const data = eventDoc.data();
      return data.cancelled === true;
    }
    return false;
  } catch (error) {
    console.error('Error checking if event is cancelled:', error);
    return false;
  }
};
