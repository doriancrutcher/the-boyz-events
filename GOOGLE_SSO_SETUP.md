# Google SSO Setup Instructions

## Enable Google Sign-In in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `thegayboyzevents-21aad`
3. Click "Build" → "Authentication"
4. Click "Sign-in method" tab
5. Click on "Google" provider
6. Enable it
7. Set the **Project support email** (use `thegayboyzevents@gmail.com` or your admin email)
8. Click "Save"

## Update Firestore Security Rules

Add support for the new `eventEdits` collection:

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
    
    // Event edits (NEW)
    match /eventEdits/{editId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                              request.auth.token.email == 'thegayboyzevents@gmail.com';
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
  }
}
```

## How It Works

### For Regular Users:
1. Login with Google or Email/Password
2. Click "Edit" button on any event in the list
3. Make changes to event details (chat URL, Instagram, owner, etc.)
4. Submit for admin approval
5. Wait for admin to approve/reject

### For Admin (`thegayboyzevents@gmail.com`):
1. Login with Google or Email/Password
2. Click "Edit" button on any event
3. Changes are applied **immediately** (no approval needed)
4. Can also review and approve/reject edit requests from users in Admin Dashboard

## Features

- ✅ Google SSO authentication
- ✅ Edit button on events (visible to logged-in users)
- ✅ Admin can edit directly
- ✅ Regular users submit edits for approval
- ✅ Admin dashboard shows pending edit requests
- ✅ Edit requests tracked in Firestore
