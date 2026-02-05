# Firebase Storage Security Rules

Your Storage rules need to allow authenticated users to upload event flyer images.

## Current Issue

You're getting: `User does not have permission to access 'event-flyers/...'`

This means your Storage rules are blocking the upload.

## Fix: Update Storage Rules

1. **Go to Firebase Console**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `thegayboyzevents-21aad`

2. **Navigate to Storage Rules**
   - Click **"Storage"** in the left sidebar
   - Click the **"Rules"** tab

3. **Update the Rules**
   - Replace the existing rules with these:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Event flyers - users can upload to their own folder
    match /event-flyers/{userId}/{allPaths=**} {
      // Anyone can read (view) the images
      allow read: if true;
      // Only authenticated users can write, and only to their own folder
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default: deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

4. **Click "Publish"** to save the rules

## Rule Explanation

- `event-flyers/{userId}/{allPaths=**}` - Matches files in the event-flyers folder, organized by user ID
- `allow read: if true` - Anyone can view/download the images
- `allow write: if request.auth != null && request.auth.uid == userId` - Only logged-in users can upload, and only to their own folder (prevents users from uploading to other users' folders)

## After Updating Rules

1. The rules take effect immediately (no redeploy needed)
2. Try uploading an event flyer again
3. It should work now!

## Troubleshooting

### Still getting permission errors?
- Make sure the user is logged in (`request.auth != null`)
- Verify the `userId` in the path matches `request.auth.uid`
- Check that you clicked "Publish" after updating rules

### Want to allow admins to upload anywhere?
If you want admins to be able to upload to any folder, you can add:
```javascript
allow write: if request.auth != null && (
  request.auth.uid == userId || 
  request.auth.token.email == 'thegayboyzevents@gmail.com'
);
```
