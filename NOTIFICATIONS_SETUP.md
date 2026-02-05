# Notifications System Setup

## Overview

The notifications system allows:
- **Admin**: Gets notified of all event requests and edit requests
- **Users**: Get notified when their requests are approved/rejected
- **Users**: Can delete their own approved events

## Firestore Security Rules Update

Add these rules to your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ... existing rules ...
    
    // User notifications
    match /userNotifications/{notificationId} {
      allow read: if request.auth != null && 
                    request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      allow delete: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
    }
    
    // Admin notifications (existing, but ensure it's there)
    match /adminNotifications/{notificationId} {
      allow read: if request.auth != null && 
                    request.auth.token.email == 'thegayboyzevents@gmail.com';
      allow write: if request.auth != null;
    }
    
    // Event requests - allow users to delete their own approved requests
    match /eventRequests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                              (request.auth.token.email == 'thegayboyzevents@gmail.com' ||
                               (resource.data.userId == request.auth.uid && 
                                resource.data.status == 'approved'));
    }
  }
}
```

## Features

### For Admin:
1. **Notification Button**: Click "🔔 Notifications" in header
2. **View All Notifications**: See all event requests and edit requests
3. **Approve/Reject Requests**: 
   - Click "Review" on any request
   - Add rejection message (required for rejections)
   - Click "Approve" or "Reject"

### For Users:
1. **Notification Button**: Click "🔔 Notifications" in header
2. **View Your Notifications**: See approvals/rejections of your requests
3. **Delete Approved Events**: Click "Delete Event" on approved request notifications

## Notification Types

- `event_request` - New event request (admin only)
- `event_edit` - New edit request (admin only)
- `request_approved` - Your event request was approved (user)
- `request_rejected` - Your event request was rejected (user)
- `edit_approved` - Your edit request was approved (user)
- `edit_rejected` - Your edit request was rejected (user)

## How It Works

1. **User submits request** → Admin gets notification
2. **Admin approves/rejects** → User gets notification
3. **User can delete approved event** → Removes from their approved events list
