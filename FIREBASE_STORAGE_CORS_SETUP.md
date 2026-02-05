# Firebase Storage CORS Configuration

Your Netlify domain needs to be allowed to access Firebase Storage. This requires configuring CORS rules.

## Option 1: Using gcloud CLI (Recommended)

1. **Install Google Cloud SDK** (if not already installed):
   ```bash
   # macOS
   brew install google-cloud-sdk
   
   # Or download from: https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticate with Google Cloud**:
   ```bash
   gcloud auth login
   ```

3. **Set your project**:
   ```bash
   gcloud config set project thegayboyzevents-21aad
   ```

4. **Create a CORS configuration file**:
   Create a file named `cors.json` with this content:
   ```json
   [
     {
       "origin": ["https://thegayboyzevents.netlify.app", "http://localhost:3000"],
       "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type", "Authorization"]
     }
   ]
   ```

5. **Apply the CORS configuration**:
   ```bash
   gsutil cors set cors.json gs://thegayboyzevents-21aad.firebasestorage.app
   ```

## Option 2: Using Firebase Console (Easier, but may require Storage rules)

1. **Go to Firebase Console**:
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `thegayboyzevents-21aad`

2. **Navigate to Storage**:
   - Click "Storage" in the left sidebar
   - Click the "Rules" tab

3. **Update Storage Rules** (if needed):
   Make sure your rules allow uploads. They should look something like:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

## Option 3: Quick Fix - Update Storage Rules

The CORS issue might be resolved by ensuring your Storage rules are correct:

1. **Go to Firebase Console** → **Storage** → **Rules**
2. **Update rules** to allow authenticated uploads:
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

## Verify CORS Configuration

After applying CORS, test by:
1. Trying to upload an event flyer image
2. Checking the browser console for CORS errors
3. The upload should work without CORS errors

## Troubleshooting

### Still getting CORS errors?
- Make sure you've added `thegayboyzevents.netlify.app` to Firebase Storage CORS
- Check that your Storage rules allow the operation
- Try clearing browser cache
- Verify the domain matches exactly (no typos)

### Don't have gcloud CLI?
- Use Option 2 or 3 above
- Or install gcloud CLI for the most reliable solution
