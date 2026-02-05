# Firebase Setup Instructions

## 1. Install Firebase

```bash
npm install firebase
```

## 2. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Sign in with **any Google account** (doesn't need to be the calendar email)
3. Click "Add project" or select an existing project
4. Follow the setup wizard

## 3. Enable Firestore Database

1. In Firebase Console, go to "Build" > "Firestore Database"
2. Click "Create database"
3. Start in **test mode** (for development) or **production mode** (for production)
4. Choose a location for your database

## 4. Get Your Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (</>) to add a web app
4. Register your app and copy the configuration object

## 5. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Firebase credentials:
   ```
   REACT_APP_FIREBASE_API_KEY=your-actual-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

## 6. Set Up Firestore Security Rules (Important!)

Go to Firestore Database > Rules and set up appropriate rules. For development, you can use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId} {
      // Allow read access to everyone
      allow read: if true;
      // Allow write access to everyone (for development only!)
      // In production, you should add authentication
      allow write: if true;
    }
  }
}
```

**⚠️ Warning:** The above rules allow anyone to write. For production, implement proper authentication!

## Authentication (Optional)

**You don't need to sign in to use this app!** The current setup works without any user authentication:
- Google Calendar is accessed via public feed (no login needed)
- Firestore uses API keys (no user login needed)
- Anyone can read/write if security rules allow it

If you want to restrict who can edit events, you can add Firebase Authentication later, but it's not required for the app to work.

## 7. Restart Your Development Server

After setting up environment variables:
```bash
npm start
```

## How It Works

- Events are fetched from Google Calendar
- Firebase stores additional metadata (chat URL, Instagram handle) for each event
- The event ID from Google Calendar is used as the document ID in Firestore
- The EventAdmin component allows you to add/edit chat URLs and Instagram handles for events

## Using the Event Management

1. Click "Show Event Management" at the bottom of the page
2. Select an event from the dropdown
3. Enter the chat URL (e.g., Discord invite link)
4. Enter the Instagram handle (with or without @)
5. Click "Save Event Details"
6. The information will appear on the event card in the events list
