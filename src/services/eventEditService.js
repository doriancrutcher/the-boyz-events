import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { createNotification, createAdminNotification } from './notificationService';
import { sendEditRequestEmail } from './emailService';

const EVENT_EDITS_COLLECTION = 'eventEdits';

/**
 * Submit an event edit request
 */
export const submitEventEdit = async (eventId, editData, userId, userEmail) => {
  try {
    const editDoc = {
      eventId,
      userId,
      userEmail,
      originalEvent: editData.originalEvent,
      proposedChanges: {
        title: editData.title,
        description: editData.description || '',
        location: editData.location || '',
        chatUrl: editData.chatUrl || '',
        partifulLink: editData.partifulLink || '',
        instaHandle: editData.instaHandle || '',
        eventOwner: editData.eventOwner || '',
      },
      status: 'pending', // pending, approved, rejected
      createdAt: Timestamp.now(),
      adminNotes: ''
    };

    const docRef = await addDoc(collection(db, EVENT_EDITS_COLLECTION), editDoc);
    
    // Create notification for admin
    await createAdminNotification(
      'event_edit',
      'New Edit Request',
      `${userEmail} requested to edit an event`,
      docRef.id,
      userEmail
    );
    
    // Send email notification to admin
    await sendEditRequestEmail({
      userEmail,
      eventTitle: editData.originalEvent?.title || 'Unknown Event',
      editId: docRef.id
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error submitting event edit:', error);
    throw error;
  }
};

/**
 * Apply edit directly (admin only)
 */
export const applyEditDirectly = async (eventId, editData) => {
  try {
    // Update event metadata directly
    const eventRef = doc(db, 'events', eventId);
    const metadata = {};
    
    if (editData.chatUrl !== undefined) metadata.chatUrl = editData.chatUrl || null;
    if (editData.partifulLink !== undefined) metadata.partifulLink = editData.partifulLink || null;
    if (editData.instaHandle !== undefined) {
      const cleanHandle = (editData.instaHandle || '').replace('@', '');
      metadata.instaHandle = cleanHandle || null;
      metadata.eventOwner = editData.eventOwner || cleanHandle || null;
      metadata.ownerInstagram = cleanHandle ? `https://instagram.com/${cleanHandle}` : null;
    }
    
    await updateDoc(eventRef, {
      ...metadata,
      updatedAt: Timestamp.now()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error applying edit directly:', error);
    throw error;
  }
};

/**
 * Get all pending edit requests (admin only)
 */
export const getPendingEdits = async () => {
  const q = query(
    collection(db, EVENT_EDITS_COLLECTION),
    where('status', '==', 'pending')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Get edit requests for a user
 */
export const getUserEdits = async (userId) => {
  const q = query(
    collection(db, EVENT_EDITS_COLLECTION),
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Approve or reject an edit request (admin only)
 */
export const updateEditStatus = async (editId, status, adminNotes = '') => {
  const editRef = doc(db, EVENT_EDITS_COLLECTION, editId);
  const editDoc = await getDoc(editRef);
  
  if (!editDoc.exists()) {
    throw new Error('Edit request not found');
  }

  const editData = editDoc.data();
  
  if (status === 'approved') {
    // Apply the changes to the event metadata
    const eventRef = doc(db, 'events', editData.eventId);
    const metadata = {};
    
    if (editData.proposedChanges.chatUrl !== undefined) {
      metadata.chatUrl = editData.proposedChanges.chatUrl || null;
    }
    if (editData.proposedChanges.partifulLink !== undefined) {
      metadata.partifulLink = editData.proposedChanges.partifulLink || null;
    }
    if (editData.proposedChanges.instaHandle !== undefined) {
      const cleanHandle = (editData.proposedChanges.instaHandle || '').replace('@', '');
      metadata.instaHandle = cleanHandle || null;
      metadata.eventOwner = editData.proposedChanges.eventOwner || cleanHandle || null;
      metadata.ownerInstagram = cleanHandle ? `https://instagram.com/${cleanHandle}` : null;
    }
    
    await updateDoc(eventRef, {
      ...metadata,
      updatedAt: Timestamp.now()
    }, { merge: true });
  }
  
  // Update edit request status
  await updateDoc(editRef, {
    status,
    adminNotes,
    reviewedAt: Timestamp.now()
  });

  // Create notification for the user
  if (status === 'approved') {
    await createNotification(
      editData.userId,
      'edit_approved',
      'Edit Request Approved',
      `Your edit request has been approved and applied!`,
      editId
    );
  } else if (status === 'rejected') {
    await createNotification(
      editData.userId,
      'edit_rejected',
      'Edit Request Rejected',
      `Your edit request was rejected. ${adminNotes ? `Reason: ${adminNotes}` : ''}`,
      editId
    );
  }
};

