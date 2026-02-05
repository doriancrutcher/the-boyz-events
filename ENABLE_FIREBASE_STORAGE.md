# Enable Firebase Storage

Firebase Storage is available on the **free Spark plan**, but it needs to be enabled first.

## Steps to Enable Firebase Storage

1. **Go to Firebase Console**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `thegayboyzevents-21aad`

2. **Navigate to Storage**
   - Click **"Storage"** in the left sidebar
   - If you see "To use Storage, upgrade your project's pricing plan", this is likely because Storage hasn't been initialized yet

3. **Initialize Storage**
   - Click the **"Get started"** button (if you see it)
   - Or click **"Create bucket"** or **"Start"**
   - You'll be asked to set up Storage rules

4. **Set Storage Rules**
   - Choose **"Start in test mode"** for now (you can update rules later)
   - Or use these rules for your use case:
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

5. **Choose Location**
   - Select a location for your Storage bucket (choose one close to your users)
   - Click **"Done"**

## Important Notes

- ✅ **Storage is FREE** on the Spark plan (with generous free quota)
- ✅ **No upgrade required** - Storage works on the free tier
- ⚠️ The "upgrade" message might appear if Storage isn't initialized yet
- 💰 Free tier includes: 5 GB storage, 1 GB/day downloads, 20,000 uploads/day

## After Enabling Storage

Once Storage is enabled:
1. You can upload event flyer images
2. Configure CORS (if needed) using the instructions in `FIREBASE_STORAGE_CORS_SETUP.md`
3. Your app should work without CORS errors

## If You Still See Upgrade Messages

If you still see upgrade prompts after enabling Storage:
- Make sure you're on the Storage page (not a different service)
- Try refreshing the page
- Storage should work on the free tier - the upgrade message might be a UI quirk
