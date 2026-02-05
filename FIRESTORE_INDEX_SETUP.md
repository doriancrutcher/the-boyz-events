# Firestore Index Setup

## Error: "The query requires an index"

When you click "Request Event", Firebase needs a composite index to check if you've exceeded the daily request limit.

## Quick Fix

**Option 1: Click the link in the error message**
- The error message in your browser console contains a direct link to create the index
- Click that link and it will automatically create the required index in Firebase Console

**Option 2: Create the index manually**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `thegayboyzevents-21aad`
3. Click "Build" → "Firestore Database"
4. Click the "Indexes" tab
5. Click "Create Index"
6. Configure the index:
   - **Collection ID**: `eventRequests`
   - **Fields to index**:
     - Field: `userId`, Order: Ascending
     - Field: `createdAt`, Order: Ascending
   - **Query scope**: Collection
7. Click "Create"

## Required Indexes

The following composite indexes are needed:

### 1. eventRequests - Daily Limit Check
- **Collection**: `eventRequests`
- **Fields**:
  - `userId` (Ascending)
  - `createdAt` (Ascending)

### 2. eventEdits - Edit Requests (if you get similar errors)
- **Collection**: `eventEdits`
- **Fields**:
  - `userId` (Ascending)
  - `createdAt` (Ascending)

## After Creating the Index

1. Wait 1-2 minutes for the index to build
2. Refresh your browser
3. Try clicking "Request Event" again

The index creation usually takes less than a minute. You'll see a status indicator in the Firebase Console showing when it's ready.
