# Authentication & Event Request System Setup

## Features Added

1. **User Authentication** - Login/Signup with Firebase Auth
2. **Admin Role** - `thegayboyzevents@gmail.com` gets admin privileges
3. **Event Request System** - Users can submit event requests
4. **Admin Dashboard** - Approve/reject event requests
5. **Rate Limiting** - 3 requests per day per user
6. **Image Upload** - Users can upload event flyers

## Setup Steps

### 1. Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `thegayboyzevents-21aad`
3. Click "Build" → "Authentication"
4. Click "Get started"
5. Click "Sign-in method" tab
6. Enable "Email/Password" provider
7. Click "Email/Password" → Enable it → Save

### 2. Enable Firebase Storage

1. In Firebase Console, go to "Build" → "Storage"
2. Click "Get started"
3. Start in **test mode** (for development)
4. Choose a location (same as Firestore)
5. Click "Done"

### 3. Update Firestore Security Rules

Go to Firestore Database → Rules and update to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Events metadata (existing)
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

### 4. Update Storage Security Rules

Go to Storage → Rules and update to:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /event-flyers/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Create Admin Account

1. Go to your website
2. Click "Login"
3. Click "Sign Up"
4. Use email: `thegayboyzevents@gmail.com`
5. Create a password
6. This account will automatically get admin privileges

### 6. Email Notifications (Optional)

Currently, notifications are stored in Firestore. To send actual emails:

**Option A: EmailJS (Simple)**
1. Sign up at [EmailJS](https://www.emailjs.com/)
2. Create an email service
3. Add your EmailJS credentials to `.env`
4. Update `eventRequestService.js` to use EmailJS

**Option B: Firebase Cloud Functions (Advanced)**
1. Set up Firebase Cloud Functions
2. Create a function that sends emails via SendGrid/Mailgun
3. Trigger on new event requests

## How It Works

### For Regular Users:
1. Sign up/Login
2. Click "Request Event"
3. Fill out event details or upload flyer
4. Submit (max 3 per day)
5. Wait for admin approval

### For Admin (`thegayboyzevents@gmail.com`):
1. Login with admin email
2. Click "Admin" in header
3. See all pending event requests
4. Review requests (see flyer if uploaded)
5. Approve or Reject with notes
6. Can also manage event metadata (chat URLs, Instagram handles)

## Collections Created

- `events` - Event metadata (chat URL, Instagram handle)
- `eventRequests` - User-submitted event requests
- `users` - User profiles and roles
- `adminNotifications` - Notifications for admin

## Security Notes

- Admin email is hardcoded: `thegayboyzevents@gmail.com`
- Regular users can only create requests, not approve them
- Rate limiting: 3 requests per day per user
- Images are stored in Firebase Storage
