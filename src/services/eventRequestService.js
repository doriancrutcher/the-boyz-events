import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  getDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { createNotification, createAdminNotification } from './notificationService';
import { sendEventRequestEmail } from './emailService';

const EVENT_REQUESTS_COLLECTION = 'eventRequests';
const MAX_REQUESTS_PER_DAY = 3;

/**
 * Check if user has exceeded daily request limit
 */
export const checkDailyLimit = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = Timestamp.fromDate(today);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStart = Timestamp.fromDate(tomorrow);

  const q = query(
    collection(db, EVENT_REQUESTS_COLLECTION),
    where('userId', '==', userId),
    where('createdAt', '>=', todayStart),
    where('createdAt', '<', tomorrowStart)
  );

  const snapshot = await getDocs(q);
  return snapshot.size >= MAX_REQUESTS_PER_DAY;
};

/**
 * Upload flyer image to Firebase Storage
 */
export const uploadFlyerImage = async (file, userId) => {
  const storageRef = ref(storage, `event-flyers/${userId}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

/**
 * Submit an event request
 */
export const submitEventRequest = async (requestData, userId, userEmail) => {
  try {
    // Check daily limit
    const exceededLimit = await checkDailyLimit(userId);
    if (exceededLimit) {
      throw new Error(`You've reached the daily limit of ${MAX_REQUESTS_PER_DAY} event requests. Please try again tomorrow.`);
    }

    // Upload flyer if provided
    let flyerUrl = null;
    if (requestData.flyerImage) {
      flyerUrl = await uploadFlyerImage(requestData.flyerImage, userId);
    }

    // Create request document
    const requestDoc = {
      userId,
      userEmail,
      title: requestData.title,
      description: requestData.description || '',
      eventDate: Timestamp.fromDate(new Date(requestData.eventDate)),
      eventTime: requestData.eventTime || '',
      location: requestData.location || '',
      flyerUrl,
      status: 'pending', // pending, approved, rejected
      createdAt: Timestamp.now(),
      adminNotes: ''
    };

    const docRef = await addDoc(collection(db, EVENT_REQUESTS_COLLECTION), requestDoc);
    
    // Create notification for admin
    await createAdminNotification(
      'event_request',
      'New Event Request',
      `${userEmail} submitted a new event request: "${requestData.title}"`,
      docRef.id,
      userEmail
    );
    
    // Send email notification to admin
    await sendEventRequestEmail({
      ...requestDoc,
      requestId: docRef.id
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error submitting event request:', error);
    throw error;
  }
};

/**
 * Get all pending event requests (admin only)
 */
export const getPendingRequests = async () => {
  const q = query(
    collection(db, EVENT_REQUESTS_COLLECTION),
    where('status', '==', 'pending')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Get all event requests for a user
 */
export const getUserRequests = async (userId) => {
  const q = query(
    collection(db, EVENT_REQUESTS_COLLECTION),
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Approve or reject an event request (admin only)
 */
export const updateRequestStatus = async (requestId, status, adminNotes = '') => {
  const requestRef = doc(db, EVENT_REQUESTS_COLLECTION, requestId);
  const requestDoc = await getDoc(requestRef);
  const requestData = requestDoc.data();
  
  await updateDoc(requestRef, {
    status,
    adminNotes,
    reviewedAt: Timestamp.now()
  });

  // Create notification for the user
  if (status === 'approved') {
    await createNotification(
      requestData.userId,
      'request_approved',
      'Event Request Approved',
      `Your event request "${requestData.title}" has been approved!`,
      requestId
    );
  } else if (status === 'rejected') {
    await createNotification(
      requestData.userId,
      'request_rejected',
      'Event Request Rejected',
      `Your event request "${requestData.title}" was rejected. ${adminNotes ? `Reason: ${adminNotes}` : ''}`,
      requestId
    );
  }
};

/**
 * Delete an approved event request (user can delete their own)
 */
export const deleteEventRequest = async (requestId, userId) => {
  const requestRef = doc(db, EVENT_REQUESTS_COLLECTION, requestId);
  const requestDoc = await getDoc(requestRef);
  
  if (!requestDoc.exists()) {
    throw new Error('Request not found');
  }
  
  const requestData = requestDoc.data();
  
  // Only allow users to delete their own approved requests
  if (requestData.userId !== userId) {
    throw new Error('You can only delete your own requests');
  }
  
  if (requestData.status !== 'approved') {
    throw new Error('You can only delete approved requests');
  }
  
  // Delete the request document
  await deleteDoc(requestRef);
};
