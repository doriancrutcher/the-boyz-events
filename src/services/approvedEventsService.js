import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const APPROVED_EVENTS_COLLECTION = 'approvedEvents';

/**
 * Save an approved event request to the approved events collection
 */
export const saveApprovedEvent = async (requestData) => {
  try {
    const approvedEventDoc = {
      requestId: requestData.id,
      title: requestData.title,
      description: requestData.description || '',
      eventDate: requestData.eventDate,
      eventTime: requestData.eventTime || '',
      location: requestData.location || '',
      flyerUrl: requestData.flyerUrl || null,
      userId: requestData.userId,
      userEmail: requestData.userEmail,
      addedToCalendar: false,
      createdAt: Timestamp.now(),
      approvedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, APPROVED_EVENTS_COLLECTION), approvedEventDoc);
    return docRef.id;
  } catch (error) {
    console.error('Error saving approved event:', error);
    throw error;
  }
};

/**
 * Get all approved events that haven't been added to calendar
 */
export const getPendingApprovedEvents = async () => {
  try {
    const q = query(
      collection(db, APPROVED_EVENTS_COLLECTION),
      where('addedToCalendar', '==', false)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching pending approved events:', error);
    return [];
  }
};

/**
 * Mark an approved event as added to calendar
 */
export const markAsAddedToCalendar = async (approvedEventId) => {
  try {
    const eventRef = doc(db, APPROVED_EVENTS_COLLECTION, approvedEventId);
    await updateDoc(eventRef, {
      addedToCalendar: true,
      addedToCalendarAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error marking event as added to calendar:', error);
    throw error;
  }
};

/**
 * Delete an approved event (after it's been added to calendar)
 */
export const deleteApprovedEvent = async (approvedEventId) => {
  try {
    const eventRef = doc(db, APPROVED_EVENTS_COLLECTION, approvedEventId);
    await deleteDoc(eventRef);
    return true;
  } catch (error) {
    console.error('Error deleting approved event:', error);
    throw error;
  }
};
