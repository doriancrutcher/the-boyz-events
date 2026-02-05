# Fix Firebase "Missing or insufficient permissions" Error

## Quick Fix

You need to update your Firestore security rules to allow read/write access.

## Steps:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `thegayboyzevents-21aad`

2. **Navigate to Firestore Rules**
   - Click "Build" in the left menu
   - Click "Firestore Database"
   - Click the "Rules" tab at the top

3. **Replace the rules with this:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Events metadata
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     (request.auth.token.email == 'thegayboyzevents@gmail.com' || 
                      resource == null);
    }
    
    // Event requests
    match /eventRequests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                              request.auth.token.email == 'thegayboyzevents@gmail.com';
    }
    
    // Event edits (NEW - for edit requests)
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

4. **Click "Publish"** (button at the top)

5. **Wait a few seconds** for the rules to update

6. **Refresh your website** - the error should be gone!

## What This Does

- Allows anyone to **read** events from Firestore
- Allows anyone to **write** (create/update) events in Firestore
- This is fine for development, but for production you should add authentication

## If You Still Get Errors

1. Make sure you clicked "Publish" after updating the rules
2. Wait 10-30 seconds for the rules to propagate
3. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
4. Check the browser console for any other errors
