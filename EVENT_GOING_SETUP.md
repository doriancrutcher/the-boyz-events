# Event "Going" Feature Setup

## Overview

Users can now mark events they're going to, and see a count of members going to each event.

## Firestore Security Rules

**IMPORTANT**: You need to add the `eventGoing` collection rules to your existing Firestore security rules.

Go to Firebase Console → Firestore Database → Rules and add this section:

```javascript
// Event going status
match /eventGoing/{goingId} {
  allow read: if true; // Anyone can see who's going
  allow create: if request.auth != null;
  allow delete: if request.auth != null && 
                  (request.auth.uid == resource.data.userId ||
                   request.auth.token.email == 'thegayboyzevents@gmail.com');
  allow update: if false; // No updates, only create/delete
}
```

**Complete updated rules** (see `FIX_FIRESTORE_PERMISSIONS.md` for the full rules including this):

## Features

1. **User Name Display**: Shows the user's Google name (or email) in the header when logged in
2. **Going Button**: Each event has a "+ Going" button for logged-in users
3. **Going Status**: Button changes to "✓ Going" when user is marked as going
4. **Member Count**: Shows "X members going" below event details
5. **Toggle Functionality**: Click to add/remove yourself from going list

## How It Works

- **Collection**: `eventGoing` in Firestore
- **Document ID**: `{eventId}_{userId}` (unique per user per event)
- **Data Stored**: eventId, userId, userName, createdAt
- **Real-time Updates**: Count updates immediately when users toggle going status
