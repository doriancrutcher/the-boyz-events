import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

const EVENTS_METADATA_COLLECTION = 'events';

/**
 * Get metadata for a specific event by its Google Calendar UID
 */
export const getEventMetadata = async (eventId) => {
  try {
    const eventRef = doc(db, EVENTS_METADATA_COLLECTION, eventId);
    const eventSnap = await getDoc(eventRef);
    
    if (eventSnap.exists()) {
      return eventSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching event metadata:', error);
    return null;
  }
};

/**
 * Get all event metadata
 */
export const getAllEventMetadata = async () => {
  try {
    const metadataRef = collection(db, EVENTS_METADATA_COLLECTION);
    const snapshot = await getDocs(metadataRef);
    
    const metadata = {};
    snapshot.forEach((doc) => {
      metadata[doc.id] = doc.data();
    });
    
    return metadata;
  } catch (error) {
    console.error('Error fetching all event metadata:', error);
    return {};
  }
};

/**
 * Set or update metadata for an event
 */
export const setEventMetadata = async (eventId, metadata) => {
  try {
    const eventRef = doc(db, EVENTS_METADATA_COLLECTION, eventId);
    await setDoc(eventRef, {
      ...metadata,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error setting event metadata:', error);
    return false;
  }
};

/**
 * Update chat URL for an event
 */
export const updateEventChatUrl = async (eventId, chatUrl) => {
  return setEventMetadata(eventId, { chatUrl });
};

/**
 * Update Instagram handle for an event owner
 */
export const updateEventOwner = async (eventId, instagramHandle, eventOwner) => {
  // Remove @ if present
  const cleanHandle = instagramHandle.replace('@', '');
  return setEventMetadata(eventId, { 
    instaHandle: cleanHandle,
    eventOwner: eventOwner || cleanHandle,
    ownerInstagram: `https://instagram.com/${cleanHandle}`
  });
};

/**
 * Merge Google Calendar events with Firebase metadata
 */
export const enrichEventsWithMetadata = async (events) => {
  try {
    const metadata = await getAllEventMetadata();
    
    return events.map(event => {
      const eventMetadata = metadata[event.id] || {};
      return {
        ...event,
        chatUrl: eventMetadata.chatUrl || null,
        partifulLink: eventMetadata.partifulLink || null,
        instagramHandle: eventMetadata.instaHandle || null, // Support both field names
        instaHandle: eventMetadata.instaHandle || null,
        eventOwner: eventMetadata.eventOwner || null,
        ownerInstagram: eventMetadata.ownerInstagram || `https://instagram.com/${eventMetadata.instaHandle || eventMetadata.instagramHandle || ''}`,
        flyerUrl: eventMetadata.flyerUrl || null,
        cancelled: eventMetadata.cancelled || false,
      };
    });
  } catch (error) {
    console.error('Error enriching events with metadata:', error);
    return events;
  }
};
