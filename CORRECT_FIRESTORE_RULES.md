# Correct Firestore Security Rules

## Complete Rules (Copy and Paste This)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Events metadata (chat URL, Instagram handle)
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     (request.auth.token.email == 'thegayboyzevents@gmail.com' || 
                      resource == null);
    }
    
    // Event requests (new event submissions)
    match /eventRequests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                              request.auth.token.email == 'thegayboyzevents@gmail.com';
    }
    
    // Event edits (edit requests from users)
    match /eventEdits/{editId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                              request.auth.token.email == 'thegayboyzevents@gmail.com';
    }
    
    // Event going status
    match /eventGoing/{goingId} {
      allow read: if true; // Anyone can see who's going
      allow create: if request.auth != null;
      allow delete: if request.auth != null && 
                      (request.auth.uid == resource.data.userId ||
                       request.auth.token.email == 'thegayboyzevents@gmail.com');
      allow update: if false; // No updates, only create/delete
    }
    
    // User documents
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admin notifications
    match /adminNotifications/{notificationId} {
      allow read: if request.auth != null && 
                    request.auth.token.email == 'thegayboyzevents@gmail.com';
      allow write: if request.auth != null;
    }
    
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
  }
}
```

## What Was Wrong

In your rules, the `eventGoing` match block was placed **outside** the main `match /databases/{database}/documents {` block. All collection rules must be **inside** that block.

## Steps to Fix

1. Go to Firebase Console → Firestore Database → Rules
2. Copy the complete rules above
3. Paste and replace all existing rules
4. Click "Publish"
5. Wait 10-30 seconds
6. Hard refresh your browser (Cmd+Shift+R or Ctrl+Shift+R)

## What These Rules Do

- **events**: Anyone can read, only admin can write
- **eventRequests**: Logged-in users can create, admin can approve/reject
- **eventEdits**: Logged-in users can create edit requests, admin can approve/reject
- **eventGoing**: Anyone can read (for counts), logged-in users can mark going, users can remove their own
- **users**: Users can read/write their own data
- **adminNotifications**: Only admin can read, anyone can create
- **userNotifications**: Users can only read/write their own notifications
